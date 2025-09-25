// ========================
//  Helper: Backend URL
// ========================
const BASE_URL = 'https://backend-ats-z0tb.onrender.com';

// ========================
//  CURRENT USER
// ========================
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// ========================
//  REGISTER
// ========================
document.getElementById('register-form')?.addEventListener('submit', async function(e){
    e.preventDefault();
    const role = document.getElementById('register-role').value;
    const data = {
        name: document.getElementById('register-name').value,
        email: document.getElementById('register-email').value,
        password: document.getElementById('register-password').value,
        role: role,
        resume: document.getElementById('register-resume')?.files[0]?.name || "",
        experience: document.getElementById('register-experience')?.value,
        skills: document.getElementById('register-skills')?.value,
        education: document.getElementById('register-education')?.value
    };

    try {
        const res = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if(res.ok){
            alert('Registered successfully!');
            window.location.href='login.html';
        } else {
            alert(result.error);
        }
    } catch(err){ alert('Error connecting to backend'); }
});

// ========================
//  LOGIN
// ========================
document.getElementById('login-form')?.addEventListener('submit', async function(e){
    e.preventDefault();
    const data = {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value,
        role: document.getElementById('login-role').value
    };

    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if(res.ok){
            alert('Login successful!');
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            window.location.href='dashboard.html';
        } else {
            alert(result.error);
        }
    } catch(err){ alert('Error connecting to backend'); }
});

// ========================
//  POST JOB
// ========================
document.getElementById('post-job-form')?.addEventListener('submit', async function(e){
    e.preventDefault();
    if(!currentUser || currentUser.role!=='employer'){
        alert('Login as employer to post job');
        return;
    }
    const data = {
        title: document.getElementById('post-job-title').value,
        company: document.getElementById('post-company-name').value,
        location: document.getElementById('post-job-location').value,
        experience: document.getElementById('post-job-experience').value,
        type: document.getElementById('post-job-type').value,
        salary: document.getElementById('post-job-salary').value,
        description: document.getElementById('post-job-description').value
    };

    try {
        const res = await fetch(`${BASE_URL}/jobs`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if(res.ok){
            alert('Job posted successfully!');
            this.reset();
        } else {
            alert(result.error);
        }
    } catch(err){ alert('Error posting job'); }
});

// ========================
//  APPLY JOB
// ========================
async function applyJob(jobId){
    if(!currentUser || currentUser.role!=='applicant'){
        alert('Login as applicant to apply');
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/jobs/${jobId}/apply`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({email: currentUser.email})
        });
        const result = await res.json();
        if(res.ok || result.message==='Already applied'){
            alert(result.message);
        } else {
            alert(result.error);
        }
    } catch(err){ alert('Error applying to job'); }
}

// ========================
//  FETCH JOBS
// ========================
async function fetchJobs(){
    try {
        const res = await fetch(`${BASE_URL}/jobs`);
        const jobs = await res.json();
        displayDashboard(jobs);
        displayJobList(jobs);
    } catch(err){
        console.error(err);
        const dash = document.getElementById('dashboard-content');
        if(dash) dash.innerHTML='<p>Error loading jobs.</p>';
    }
}

// ========================
//  DISPLAY DASHBOARD
// ========================
function displayDashboard(jobs){
    const dash = document.getElementById('dashboard-content');
    if(!dash || !currentUser) return;

    dash.innerHTML = `<h4>Welcome ${currentUser.name} (${currentUser.role})</h4>`;

    if(currentUser.role==='applicant'){
        const appliedJobs = jobs.filter(j=>j.applied.includes(currentUser.email));
        dash.innerHTML += `<h5 class="mt-4">Applied Jobs:</h5>`;
        if(appliedJobs.length===0) dash.innerHTML += '<p>No jobs applied yet</p>';
        appliedJobs.forEach(j=>{
            dash.innerHTML += `<div class="job-card"><h5>${j.title}</h5><p>${j.company} | ${j.location}</p></div>`;
        });
    } else if(currentUser.role==='employer'){
        const myJobs = jobs.filter(j=>j.company===currentUser.name);
        dash.innerHTML += `<h5 class="mt-4">Posted Jobs:</h5>`;
        if(myJobs.length===0) dash.innerHTML += '<p>No jobs posted yet</p>';
        myJobs.forEach(j=>{
            dash.innerHTML += `<div class="job-card"><h5>${j.title}</h5><p>${j.location} | ${j.type}</p><p>Applied: ${j.applied.length}</p></div>`;
        });
    }
}

// ========================
//  DISPLAY JOB LIST PAGE
// ========================
function displayJobList(jobs){
    const jobList = document.getElementById('job-list');
    if(!jobList) return;

    jobList.innerHTML='';
    if(jobs.length===0){ jobList.innerHTML='<p>No jobs found</p>'; return; }

    jobs.forEach(job=>{
        const card = document.createElement('div');
        card.className='job-card';
        card.innerHTML=`
            <h5>${job.title}</h5>
            <p>${job.company} | ${job.location}</p>
            <p>Experience: ${job.experience} yrs | Type: ${job.type}</p>
            <p>${job.description}</p>
            <button class="btn btn-success me-2" onclick="applyJob('${job.id}')">Apply</button>
        `;
        jobList.appendChild(card);
    });
}

// ========================
//  SEARCH/FILTER (optional)
// ========================
async function searchJobs(){
    const title=document.getElementById('job-title')?.value.toLowerCase()||'';
    const location=document.getElementById('job-location')?.value.toLowerCase()||'';
    try {
        const res = await fetch(`${BASE_URL}/jobs`);
        let jobs = await res.json();
        jobs = jobs.filter(j=>j.title.toLowerCase().includes(title) && j.location.toLowerCase().includes(location));
        displayJobList(jobs);
    } catch(err){ console.error(err); }
}

// Call fetchJobs on dashboard or job list pages
if(document.getElementById('dashboard-content') || document.getElementById('job-list')){
    fetchJobs();
}
