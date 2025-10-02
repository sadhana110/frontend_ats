const BASE_URL = "https://backend-ats-z0tb.onrender.com";

// -------------------- USER --------------------
async function registerUser() {
    const user = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value
    };
    try {
        const res = await fetch(`${BASE_URL}/register`,{
            method:"POST",
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(user)
        });
        const data = await res.json();
        if(data.status==='success'){
            alert("Registered successfully!");
            window.location='login.html';
        } else alert(data.message);
    } catch(e){
        alert("Error connecting to backend");
    }
}

async function loginUser() {
    const user = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value
    };
    try {
        const res = await fetch(`${BASE_URL}/login`,{
            method:"POST",
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(user)
        });
        const data = await res.json();
        if(data.status==='success'){
            localStorage.setItem('user', JSON.stringify(data.user));
            if(user.role==='candidate') window.location='candidate_dashboard.html';
            else if(user.role==='recruiter') window.location='recruiter_dashboard.html';
            else window.location='admin_dashboard.html';
        } else alert(data.message);
    } catch(e){
        alert("Error connecting to backend");
    }
}

// -------------------- JOB --------------------
async function fetchJobs() {
    try {
        const res = await fetch(`${BASE_URL}/jobs`);
        const data = await res.json();
        return data.jobs || [];
    } catch(e){return [];}
}

async function postJob(job){
    try {
        const res = await fetch(`${BASE_URL}/jobs`,{
            method:"POST",
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(job)
        });
        return await res.json();
    } catch(e){ return {status:'error', message:'Backend error'}; }
}

// -------------------- APPLICATION --------------------
async function applyJob(jobId){
    const user = JSON.parse(localStorage.getItem('user'));
    try {
        const res = await fetch(`${BASE_URL}/apply`,{
            method:"POST",
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({jobId, candidateId:user.id})
        });
        return await res.json();
    } catch(e){ return {status:'error', message:'Backend error'}; }
}

// -------------------- MESSAGES --------------------
async function sendMessage(toUserId, message){
    const fromUser = JSON.parse(localStorage.getItem('user'));
    try {
        const res = await fetch(`${BASE_URL}/message`,{
            method:"POST",
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({from:fromUser.id, to:toUserId, message})
        });
        return await res.json();
    } catch(e){ return {status:'error', message:'Backend error'}; }
}

// -------------------- DASHBOARD --------------------
async function getDashboardData(){
    const user = JSON.parse(localStorage.getItem('user'));
    try {
        const res = await fetch(`${BASE_URL}/dashboard?userId=${user.id}&role=${user.role}`);
        return await res.json();
    } catch(e){ return {};}
}
