const BASE_URL = "https://backend-ats-z0tb.onrender.com";

// Login
document.getElementById('loginForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({email,password,role})
    });
    const data = await res.json();
    if(data.status === 'success') {
        localStorage.setItem('user', JSON.stringify(data.user));
        if(role==='candidate') window.location='candidate_dashboard.html';
        if(role==='recruiter') window.location='recruiter_dashboard.html';
        if(role==='admin') window.location='admin_dashboard.html';
    } else { alert(data.message); }
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click',()=>{
    localStorage.removeItem('user');
    window.location='index.html';
});

// Load Jobs
async function loadJobs(role){
    const res = await fetch(`${BASE_URL}/jobs`);
    const data = await res.json();
    const container = document.getElementById('jobsContainer');
    if(!container) return;
    container.innerHTML = '';
    data.jobs.forEach(job => {
        const div = document.createElement('div');
        div.className = 'col-md-4 mb-3';
        div.innerHTML = `<div class="card p-3">
            <h5>${job.title}</h5>
            <p>${job.description}</p>
            <p><strong>Skills:</strong> ${job.skills}</p>
            <p><strong>Location:</strong> ${job.location}</p>
            <p><strong>End Date:</strong> ${new Date(job.end_date).toLocaleDateString()}</p>
            ${role==='candidate'?'<button class="btn btn-primary" onclick="applyJob('+job.id+')">Apply</button>':''}
        </div>`;
        container.appendChild(div);
    });
}

// Apply Job
async function applyJob(job_id){
    const user = JSON.parse(localStorage.getItem('user'));
    const res = await fetch(`${BASE_URL}/apply`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({job_id,candidate_email:user.email})
    });
    const data = await res.json();
    alert(data.status==='success'?'Applied successfully':'Error');
}

// Post Job (Recruiter)
document.getElementById('postJobForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    const job = {
        recruiter_email: user.email,
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        skills: document.getElementById('skills').value,
        location: document.getElementById('location').value,
        end_date: document.getElementById('end_date').value
    };
    const res = await fetch(`${BASE_URL}/post_job`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(job)
    });
    const data = await res.json();
    if(data.status==='success'){ alert('Job Posted'); loadJobs('recruiter'); }
});

// Load Users (Admin)
async function loadUsers(role){
    const res = await fetch(`${BASE_URL}/jobs`); // For example, show jobs and user info
    const data = await res.json();
    const container = document.getElementById('usersContainer');
    if(!container) return;
    container.innerHTML='';
    data.jobs.forEach(user=>{
        const div=document.createElement('div');
        div.className='col-md-4 mb-3';
        div.innerHTML=`<div class="card p-3">
            <h5>${user.title}</h5>
            <p>${user.description}</p>
        </div>`;
        container.appendChild(div);
    });
}
