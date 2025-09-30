const API = "https://backend-ats-z0tb.onrender.com";

// ========== LOGIN ==========
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };
  const role = document.getElementById("role").value;
  let url = role === "candidate" ? "/login_candidate" :
            role === "recruiter" ? "/login_recruiter" : "/login_admin";

  let res = await fetch(API + url, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload)
  });

  let data = await res.json();
  if(res.ok){
    localStorage.setItem("user", JSON.stringify({id:data.id, role:role}));
    window.location.href = role === "candidate" ? "dashboard_candidate.html" :
                           role === "recruiter" ? "dashboard_recruiter.html" : "dashboard_admin.html";
  } else {
    alert(data.message);
  }
});

// ========== CANDIDATE REGISTER ==========
document.getElementById("candidateRegisterForm")?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  let payload = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    phone: document.getElementById("phone").value,
    dob: document.getElementById("dob").value,
    address: document.getElementById("address").value,
    education: document.getElementById("education").value,
    skills: document.getElementById("skills").value,
    experience: document.getElementById("experience").value
  };
  let res = await fetch(API+"/register_candidate", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
  });
  let data = await res.json();
  alert(data.message);
  window.location.href="login.html";
});

// ========== RECRUITER REGISTER ==========
document.getElementById("recruiterRegisterForm")?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  let payload = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    phone: document.getElementById("phone").value,
    designation: document.getElementById("designation").value,
    company_name: document.getElementById("company_name").value,
    company_website: document.getElementById("company_website").value,
    company_address: document.getElementById("company_address").value,
    industry: document.getElementById("industry").value,
    experience: document.getElementById("experience").value
  };
  let res = await fetch(API+"/register_recruiter", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
  });
  let data = await res.json();
  alert(data.message);
  window.location.href="login.html";
});

// ========== JOB SEARCH (Candidate) ==========
async function loadJobs(){
  let res = await fetch(API+"/jobs");
  let jobs = await res.json();
  const list = document.getElementById("jobList");
  list.innerHTML = jobs.map(j=> `
    <div class="job-card">
      <h4>${j.title}</h4>
      <p>${j.description}</p>
      <button onclick="applyJob('${j.id}')">Apply</button>
    </div>
  `).join("");
}

async function applyJob(jobId){
  let user = JSON.parse(localStorage.getItem("user"));
  let res = await fetch(API+"/apply_job", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({candidate_id:user.id, job_id:jobId})
  });
  let data = await res.json();
  alert(data.message);
}

// ========== POST JOB (Recruiter) ==========
document.getElementById("postJob")?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  let user = JSON.parse(localStorage.getItem("user"));
  let payload = {
    recruiter_id: user.id,
    title: document.getElementById("jobTitle").value,
    description: document.getElementById("jobDesc").value,
    skills_required: document.getElementById("skillsRequired").value,
    vacancy: document.getElementById("vacancy").value,
    start_date: document.getElementById("startDate").value,
    end_date: document.getElementById("endDate").value
  };
  let res = await fetch(API+"/post_job", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
  });
  let data = await res.json();
  alert(data.message);
});

// ========== ADMIN ==========
async function loadStats(){
  let res = await fetch(API+"/admin_stats");
  let stats = await res.json();
  document.getElementById("adminStats").innerHTML = `
    <p>Total Candidates: ${stats.total_candidates}</p>
    <p>Total Recruiters: ${stats.total_recruiters}</p>
    <p>Total Reports: ${stats.total_reports}</p>
  `;
}

async function loadReports(){
  let res = await fetch(API+"/admin_reports");
  let reports = await res.json();
  document.getElementById("reports").innerHTML = reports.map(r=>`
    <div>
      <p>${r.issue}</p>
      <button onclick="banRecruiter('${r.recruiter_id}')">Ban Recruiter</button>
    </div>
  `).join("");
}

async function banRecruiter(rid){
  let res = await fetch(API+"/admin_ban/"+rid,{method:"POST"});
  let data = await res.json();
  alert(data.message);
}
