const API_BASE = 'http://localhost:3001/api';

async function apiCall(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('erp_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);
    
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    return await res.json();
}

function setView(html) {
    document.getElementById('content-container').innerHTML = html;
    if (window.ECStyleSheet) window.ECStyleSheet.scan();
    
    const token = localStorage.getItem('erp_token');
    const navUser = document.getElementById('nav-user');
    if (token) {
        navUser.classList.remove('display-none');
        navUser.classList.add('display-flex');
        document.getElementById('nav-username').textContent = `${localStorage.getItem('erp_username')} (${localStorage.getItem('erp_role')})`;
    } else {
        navUser.classList.add('display-none');
        navUser.classList.remove('display-flex');
    }
}

function logout() {
    localStorage.clear();
    initApp();
}

async function initApp() {
    const setupRes = await apiCall('/check-setup');
    if (!setupRes.isSetup) return setView(renderSetup());
    
    if (localStorage.getItem('erp_token')) {
        loadDashboard();
    } else {
        setView(renderLogin());
    }
}

async function loadDashboard() {
    const res = await apiCall('/dashboard');
    if (!res.success) return logout();

    const role = localStorage.getItem('erp_role');
    let viewHtml = '';
    
    if (res.company) {
        viewHtml += `
        <div class="marginBottom-24px display-flex alignItems-center gap-16px">
            <div class="background-#e2e8f0 padding-16px borderRadius-12px fontSize-24px">🏢</div>
            <div>
                <h2 class="margin-0 fontSize-24px color-#0f172a">${res.company.Name} Workspace</h2>
                <span class="fontSize-14px color-#64748b">${res.company.Type} Industry</span>
            </div>
        </div>`;
    } else if (role === 'SuperAdmin') {
        viewHtml += `<h2 class="marginBottom-24px fontSize-28px color-#0f172a">Line ERP Global Administrator</h2>`;
    }

    if (role === 'SuperAdmin') viewHtml += renderSuperAdmin(res);
    else if (role === 'CompanyAdmin') viewHtml += renderCompanyAdmin(res);
    else viewHtml += renderEmployee();

    setView(viewHtml);
}

function renderSetup() {
    return `
    <div class="display-flex justifyContent-center">
        <div class="eccard padding-32px width-100% maxWidth-400px display-flex flexDirection-column gap-16px">
            <h2 class="margin-0 fontSize-24px">Welcome to Line ERP</h2>
            <p class="margin-0 color-#64748b fontSize-14px">Set up your global master administrator account.</p>
            <input id="setup-user" placeholder="SuperAdmin Username" class="padding-12px border-1px_solid_#cbd5e1 borderRadius-6px fontSize-16px outline-none" />
            <input id="setup-pass" type="password" placeholder="Password" class="padding-12px border-1px_solid_#cbd5e1 borderRadius-6px fontSize-16px outline-none" />
            <button onclick="handleSetup()" class="background-#10b981 color-#ffffff border-none padding-12px borderRadius-6px cursor-pointer hover:background-#059669 transition-0.2s fontWeight-bold fontSize-16px">Initialize ERP</button>
        </div>
    </div>`;
}

function renderLogin() {
    return `
    <div class="display-flex justifyContent-center">
        <div class="eccard padding-32px width-100% maxWidth-400px display-flex flexDirection-column gap-16px">
            <h2 class="margin-0 fontSize-24px textAlignCenter">Account Login</h2>
            <input id="login-user" placeholder="Username" class="padding-12px border-1px_solid_#cbd5e1 borderRadius-6px fontSize-16px outline-none" />
            <input id="login-pass" type="password" placeholder="Password" class="padding-12px border-1px_solid_#cbd5e1 borderRadius-6px fontSize-16px outline-none" />
            <button onclick="handleLogin()" class="background-#3b82f6 color-#ffffff border-none padding-12px borderRadius-6px cursor-pointer hover:background-#2563eb transition-0.2s fontWeight-bold fontSize-16px">Secure Login</button>
        </div>
    </div>`;
}

function renderSuperAdmin(data) {
    return `
    <div class="ecgrid-2x2 gap-24px">
        <div class="eccard padding-24px display-flex flexDirection-column gap-16px">
            <h2 class="margin-0 fontSize-18px borderBottom-1px_solid_#e2e8f0 paddingBottom-12px">Register New Company & Admin</h2>
            <input id="c-name" placeholder="Tenant Company Name" class="padding-10px border-1px_solid_#cbd5e1 borderRadius-6px fontSize-14px" />
            <select id="c-type" class="padding-10px border-1px_solid_#cbd5e1 borderRadius-6px fontSize-14px">
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Services">Services</option>
                <option value="Tech">Tech / Software</option>
            </select>
            <input id="c-admin" placeholder="Company Admin Username" class="padding-10px border-1px_solid_#cbd5e1 borderRadius-6px fontSize-14px" />
            <input id="c-pass" type="password" placeholder="Admin Temporary Password" class="padding-10px border-1px_solid_#cbd5e1 borderRadius-6px fontSize-14px" />
            <button onclick="createCompany()" class="background-#10b981 color-#ffffff border-none padding-12px borderRadius-6px cursor-pointer hover:background-#059669 transition-0.2s fontWeight-bold">Register Tenant</button>
        </div>
        <div class="eccard padding-24px display-flex flexDirection-column gap-16px">
            <h2 class="margin-0 fontSize-18px borderBottom-1px_solid_#e2e8f0 paddingBottom-12px">Active ERP Tenants</h2>
            <div class="display-flex flexDirection-column gap-12px overflowY-auto maxHeight-400px">
                ${data.companies.map(c => `
                    <div class="padding-16px border-1px_solid_#e2e8f0 borderRadius-8px background-#f8fafc display-flex justifyContent-space-between alignItems-center">
                        <div>
                            <div class="fontWeight-bold color-#1e293b">${c.Name}</div>
                            <div class="fontSize-12px color-#64748b marginTop-4px">${c.Type}</div>
                        </div>
                        <div class="background-#dbeafe color-#1e40af padding-4px_8px borderRadius-4px fontSize-12px fontWeight-bold">Active</div>
                    </div>
                `).join('')}
                ${data.companies.length === 0 ? `<span class="color-#94a3b8">No tenants established.</span>` : ''}
            </div>
        </div>
    </div>`;
}

function renderCompanyAdmin(data) {
    return `
    <div class="ecgrid-2x2 gap-24px">
        <div class="eccard padding-24px display-flex flexDirection-column gap-16px">
            <h2 class="margin-0 fontSize-18px borderBottom-1px_solid_#e2e8f0 paddingBottom-12px">Onboard Employee</h2>
            <input id="e-user" placeholder="Employee Username" class="padding-10px border-1px_solid_#cbd5e1 borderRadius-6px fontSize-14px" />
            <input id="e-pass" type="password" placeholder="Temporary Password" class="padding-10px border-1px_solid_#cbd5e1 borderRadius-6px fontSize-14px" />
            <select id="e-role" class="padding-10px border-1px_solid_#cbd5e1 borderRadius-6px fontSize-14px">
                <option value="Employee">Standard Employee</option>
                <option value="Manager">Department Manager</option>
            </select>
            <button onclick="createEmployee()" class="background-#3b82f6 color-#ffffff border-none padding-12px borderRadius-6px cursor-pointer hover:background-#2563eb transition-0.2s fontWeight-bold">Add Staff</button>
        </div>
        <div class="eccard padding-24px display-flex flexDirection-column gap-16px">
            <h2 class="margin-0 fontSize-18px borderBottom-1px_solid_#e2e8f0 paddingBottom-12px">Corporate Roster</h2>
            <div class="display-flex flexDirection-column gap-12px">
                ${data.users.map(u => `
                    <div class="padding-12px border-1px_solid_#e2e8f0 borderRadius-8px display-flex justifyContent-space-between alignItems-center">
                        <span class="fontWeight-500">${u.Username}</span>
                        <span class="fontSize-12px background-#f1f5f9 color-#475569 padding-4px_8px borderRadius-4px">${u.Role}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>`;
}

function renderEmployee() {
    return `
    <div class="eccard padding-48px display-flex flexDirection-column alignItems-center justifyContent-center textAlignCenter">
        <h2 class="fontSize-28px color-#1e293b margin-0">Your Work Portal is Ready</h2>
        <p class="color-#64748b marginTop-16px maxWidth-600px lineHeight-1.6">Welcome to your assigned workspace. Module deployments configured for your industry (Payroll, Tasks, Logistics) will surface here shortly.</p>
        <div class="marginTop-32px display-flex gap-16px">
            <div class="padding-24px background-#f8fafc border-1px_solid_#e2e8f0 borderRadius-8px cursor-pointer hover:borderColor-#3b82f6 transition-0.2s">
                <div class="fontSize-24px marginBottom-8px">📅</div>
                <div class="fontWeight-500 color-#334155">Shifts</div>
            </div>
            <div class="padding-24px background-#f8fafc border-1px_solid_#e2e8f0 borderRadius-8px cursor-pointer hover:borderColor-#3b82f6 transition-0.2s">
                <div class="fontSize-24px marginBottom-8px">📝</div>
                <div class="fontWeight-500 color-#334155">Tasks</div>
            </div>
        </div>
    </div>`;
}

async function handleSetup() {
    const user = document.getElementById('setup-user').value;
    const pass = document.getElementById('setup-pass').value;
    if (!user || !pass) return alert("Fill all fields");
    const res = await apiCall('/setup', 'POST', { username: user, password: pass });
    if (res.success) { alert("Initialization complete. Please login."); initApp(); }
    else alert("Error: " + res.error);
}

async function handleLogin() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const res = await apiCall('/login', 'POST', { username: user, password: pass });
    if (res.success) {
        localStorage.setItem('erp_token', res.token);
        localStorage.setItem('erp_username', res.username);
        localStorage.setItem('erp_role', res.role);
        initApp();
    } else alert(res.error);
}

async function createCompany() {
    const payload = {
        name: document.getElementById('c-name').value,
        type: document.getElementById('c-type').value,
        adminUsername: document.getElementById('c-admin').value,
        adminPassword: document.getElementById('c-pass').value
    };
    if (Object.values(payload).some(x => !x)) return alert("Fill all fields");
    
    const res = await apiCall('/companies', 'POST', payload);
    if (res.success) { alert("Tenant created."); loadDashboard(); }
    else alert(res.error);
}

async function createEmployee() {
    const payload = {
        username: document.getElementById('e-user').value,
        password: document.getElementById('e-pass').value,
        role: document.getElementById('e-role').value
    };
    if (!payload.username || !payload.password) return alert("Fill all fields");

    const res = await apiCall('/users', 'POST', payload);
    if (res.success) { alert("Employee added."); loadDashboard(); }
    else alert(res.error);
}

initApp();