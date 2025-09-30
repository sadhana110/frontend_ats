const API = "https://backend-ats-z0tb.onrender.com";

// ---------------- Register ----------------
if(document.getElementById("registerForm")){
  document.getElementById("registerForm").addEventListener("submit", async e=>{
    e.preventDefault();
    const role = document.getElementById("role").value;
    let payload = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      phone: document.getElementById("phone").value,
      role: role
    };

    if(role==="candidate"){
      payload.skills = document.getElementById("skills").value;
      payload.resume = document.getElementById("resume").value;
      payload.education = document.getElementById("education").value;
      payload.certifications = document.getElementById("certifications").value;
    } else {
      payload.company = document.getElementById("company").value;
      payload.designation = document.getElementById("designation").value;
      payload.experience = document.getElementById("experience").value;
    }

    let res = await fetch(API+"/register", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
    });
    let data = await res.json();
    alert(data.message || data.error);
  });
}

// ---------------- Login ----------------
if(document.getElementById("loginForm")){
  document.getElementById("loginForm").addEventListener("submit", async e=>{
    e.preventDefault();
    let res = await fetch(API+"/login", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
      })
    });
    let data = await res.json();
    if(data.error){ alert(data.error); return; }
    localStorage.setItem("user", JSON.stringify(data.user));
    if(data.role==="candidate") window.location="candidate_dashboard.html";
    else if(data.role==="recruiter") window.location="recruiter_dashboard.html";
    else if(data.role==="admin") window.location="admin_dashboard.html";
  });
}

// ---------------- Logout ----------------
function logout(){
  localStorage.clear();
  window.location="index.html";
}

// ---------------- Candidate: Load Jobs ----------------
async function loadJobs(){
  const search = document.getElementById("jobSearch")?.value || "";
  let res = await fetch(API+"/jobs");
  let jobs = await res.json();
  const jobList = document.getElementById("jobList");
  jobList.innerHTML = jobs
    .filter(j=> j.title.toLowerCase().includes(search.toLowerCase()))
    .map(j=> `<div>
        <b>${j.title}</b> - Skills: ${j.skills_required}<br>
        <button onclick="applyJob('${j.id}')">Apply</button>
    </div>`).join("");
}

// ---------------- Candidate: Apply Job ----------------
async function applyJob(jobId){
  const user = JSON.parse(localStorage.getItem("user"));
  if(!user){ alert("Please login"); return; }
  let res = await fetch(API+"/apply_job", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({candidate:user.email, jobId})
  });
  let data = await res.json();
  alert(data.message || data.error);
  loadJobs();
}

// ---------------- Candidate & Recruiter: Load Applications ----------------
async function loadApplications(){
  const user = JSON.parse(localStorage.getItem("user"));
  if(!user) return;
  let res = await fetch(`${API}/applications/${user.email}`);
  let apps = await res.json();
  const container = document.getElementById("applicationsList") || document.getElementById("jobList") || document.getElementById("postedJobs");
  if(!container) return;
  container.innerHTML = apps.map(a=>{
    return `<div>
      Job ID: ${a.jobId}<br>
      Candidate: ${a.candidate || "-"}<br>
      Status: ${a.status}<br>
      ${user.role==="recruiter"? `<button onclick="updateStatus('${a.jobId}','${a.candidate}','Shortlisted')">Shortlist</button>
      <button onclick="updateStatus('${a.jobId}','${a.candidate}','Rejected')">Reject</button>` : ""}
    </div>`;
  }).join("");
}

// ---------------- Recruiter: Update Application Status ----------------
async function updateStatus(jobId, candidate, status){
  let res = await fetch(API+"/application_status", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({jobId, candidate, status})
  });
  let data = await res.json();
  alert(data.message || data.error);
  loadApplications();
}

// ---------------- Recruiter: Post Job ----------------
if(document.getElementById("postJobForm")){
  document.getElementById("postJobForm").addEventListener("submit", async e=>{
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    let payload = {
      title: document.getElementById("title").value,
      skills_required: document.getElementById("skills").value,
      vacancies: document.getElementById("vacancies").value,
      start_date: document.getElementById("startDate").value,
      end_date: document.getElementById("endDate").value,
      recruiter_email: user.email
    };
    let res = await fetch(API+"/post_job", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
    });
    let data = await res.json();
    alert(data.message || data.error);
    loadPostedJobs();
  });
}

// ---------------- Recruiter: Load Posted Jobs ----------------
async function loadPostedJobs(){
  const user = JSON.parse(localStorage.getItem("user"));
  let res = await fetch(`${API}/applications/${user.email}`);
  let jobs = await res.json();
  const container = document.getElementById("postedJobs");
  container.innerHTML = jobs.map(j=> `<div>${j.jobId} - Status: ${j.status}</div>`).join("");
}

// ---------------- Messaging ----------------
async function sendMessage(to, message){
  const user = JSON.parse(localStorage.getItem("user"));
  let res = await fetch(API+"/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({from:user.email, to, message})
  });
  let data = await res.json();
  alert(data.message);
  loadMessages();
}

async function loadMessages(){
  const user = JSON.parse(localStorage.getItem("user"));
  if(!user) return;
  let res = await fetch(`${API}/messages/${user.email}`);
  let msgs = await res.json();
  const container = document.getElementById("messagesList");
  if(!container) return;
  container.innerHTML = msgs.map(m=>`<div>From: ${m.from} To: ${m.to} <br> ${m.message}</div>`).join("");
}

// ---------------- Update Profile ----------------
async function updateProfile(){
  const user = JSON.parse(localStorage.getItem("user"));
  const payload = {email:user.email};
  document.querySelectorAll("#profileForm input").forEach(inp=>{payload[inp.name]=inp.value;});
  let res = await fetch(API+"/update_profile", {
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
  });
  let data = await res.json();
  alert(data.message);
}

// ---------------- Reports (Candidate) ----------------
async function reportIssue(jobId, recruiterEmail, issue){
  const user = JSON.parse(localStorage.getItem("user"));
  let res = await fetch(API+"/report", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({candidate:user.email, recruiter:recruiterEmail, job:jobId, issue})
  });
  let data = await res.json();
  alert(data.message);
}

// ---------------- Admin: Ban ----------------
async function banUser(email){
  let res = await fetch(API+"/ban_user", {
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email})
  });
  let data = await res.json();
  alert(data.message);
}

// ---------------- Admin: Investigate ----------------
async function investigateJob(jobId){
  let res = await fetch(API+"/investigate_job", {
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({jobId})
  });
  let data = await res.json();
  alert(data.message);
}

// ---------------- Load Admin Reports ----------------
async function loadAdminReports(){
  let res = await fetch(API+"/reports");
  let data = await res.json();
  const container = document.getElementById("adminReports");
  if(!container) return;
  container.innerHTML = data.map(r=>`<div>Candidate: ${r.candidate}, Recruiter: ${r.recruiter}, Job: ${r.job}, Issue: ${r.issue}
  <button onclick="investigateJob('${r.job}')">Investigate</button>
  <button onclick="banUser('${r.recruiter}')">Ban Recruiter</button></div>`).join("");
}
