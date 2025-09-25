let jobs = [];
let users = [];
let currentUser = null;

// Registration
function toggleApplicantFields(){
  const role=document.getElementById('register-role').value;
  document.getElementById('applicant-fields').style.display=role==='applicant'?'block':'none';
}

document.getElementById('register-form')?.addEventListener('submit',function(e){
  e.preventDefault();
  const user={
    name: document.getElementById('register-name').value,
    email: document.getElementById('register-email').value,
    password: document.getElementById('register-password').value,
    role: document.getElementById('register-role').value,
    resume: document.getElementById('register-resume')?.files[0],
    experience: document.getElementById('register-experience')?.value,
    skills: document.getElementById('register-skills')?.value,
    education: document.getElementById('register-education')?.value
  };
  users.push(user);
  alert('Registered successfully!');
  window.location.href='login.html';
});

// Login
document.getElementById('login-form')?.addEventListener('submit',function(e){
  e.preventDefault();
  const email=document.getElementById('login-email').value;
  const password=document.getElementById('login-password').value;
  const role=document.getElementById('login-role').value;
  const user=users.find(u=>u.email===email&&u.password===password&&u.role===role);
  if(user){currentUser=user; alert('Login successful'); window.location.href='dashboard.html';}
  else alert('Invalid credentials');
});

// Post Job
document.getElementById('post-job-form')?.addEventListener('submit',function(e){
  e.preventDefault();
  const job={
    id:Date.now().toString(),
    title: document.getElementById('post-job-title').value,
    company: document.getElementById('post-company-name').value,
    location: document.getElementById('post-job-location').value,
    experience: document.getElementById('post-job-experience').value,
    type: document.getElementById('post-job-type').value,
    salary: document.getElementById('post-job-salary').value,
    description: document.getElementById('post-job-description').value,
    applied:[]
  };
  jobs.push(job);
  alert('Job posted!');
  this.reset();
});

// Search & Filters
function searchJobs(){
  const title=document.getElementById('job-title')?.value.toLowerCase()||'';
  const location=document.getElementById('job-location')?.value.toLowerCase()||'';
  displayJobs(jobs.filter(j=>j.title.toLowerCase().includes(title)&&j.location.toLowerCase().includes(location)));
}

function applyFilters(){
  const experience=document.getElementById('filter-experience')?.value;
  const type=document.getElementById('filter-type')?.value;
  const company=document.getElementById('filter-company')?.value.toLowerCase();
  displayJobs(jobs.filter(j=>(!experience||j.experience===experience)&&(!type||j.type===type)&&(!company||j.company.toLowerCase().includes(company))));
}

function displayJobs(list){
  const jobList=document.getElementById('job-list');
  if(!jobList)return;
  jobList.innerHTML='';
  if(list.length===0){jobList.innerHTML='<p>No jobs found</p>';return;}
  list.forEach(job=>{
    const card=document.createElement('div');
    card.className='job-card';
    card.innerHTML=`<h5>${job.title}</h5><p>${job.company} | ${job.location}</p><p>Experience: ${job.experience} yrs | Type: ${job.type}</p><p>${job.description}</p><button class="btn btn-success me-2" onclick="applyJob('${job.id}')">Apply</button><a href="job-detail.html?jobId=${job.id}" class="btn btn-primary">View</a>`;
    jobList.appendChild(card);
  });
}

// Apply Job
function applyJob(id){
  if(!currentUser || currentUser.role!=='applicant'){alert('Login as applicant to apply'); return;}
  const job=jobs.find(j=>j.id===id);
  if(!job.applied.includes(currentUser.email))job.applied.push(currentUser.email);
  alert('Applied successfully');
}

// Dashboard & Job Detail
function showDashboard(){
  if(!currentUser)return;
  const dash=document.getElementById('dashboard-content');
  if(!dash)return;
  dash.innerHTML='';
  if(currentUser.role==='applicant'){
    const appliedJobs=jobs.filter(j=>j.applied.includes(currentUser.email));
    dash.innerHTML=`<h4>Welcome ${currentUser.name} (Applicant)</h4><h5>Applied Jobs:</h5>`;
    if(appliedJobs.length===0) dash.innerHTML+='<p>No jobs applied yet</p>';
    appliedJobs.forEach(j=>dash.innerHTML+=`<div class="job-card"><h5>${j.title}</h5><p>${j.company} | ${j.location}</p></div>`);
  } else if(currentUser.role==='employer'){
    const myJobs=jobs.filter(j=>j.company===currentUser.name);
    dash.innerHTML=`<h4>Welcome ${currentUser.name} (Employer)</h4><h5>Posted Jobs:</h5>`;
    if(myJobs.length===0) dash.innerHTML+='<p>No jobs posted yet</p>';
    myJobs.forEach(j=>dash.innerHTML+=`<div class="job-card"><h5>${j.title}</h5><p>${j.location} | ${j.type}</p><p>Applied: ${j.applied.length}</p></div>`);
  }
}
showDashboard();

// Job Detail
const jobDetailDiv=document.getElementById('job-detail');
if(jobDetailDiv){
  const params=new URLSearchParams(window.location.search);
  const jobId=params.get('jobId');
  const job=jobs.find(j=>j.id===jobId);
  if(job){
    jobDetailDiv.innerHTML=`<h3>${job.title}</h3><p><strong>Company:</strong> ${job.company}</p><p><strong>Location:</strong> ${job.location}</p><p><strong>Experience:</strong> ${job.experience} yrs | <strong>Type:</strong> ${job.type}</p><p>${job.description}</p><button class="btn btn-success" onclick="applyJob('${job.id}')">Apply</button>`;
  } else jobDetailDiv.innerHTML='<p>Job not found</p>';
}
