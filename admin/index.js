document.querySelectorAll(".separator").forEach(separator => {
    let divider = new ECDivider();
    separator.appendChild(divider.element);
});

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('admin_token');
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    if (!token || !isAdmin) {
        window.location.href = '../newpost/';
        return;
    }
    const API_URL = 'https://isaiahnoelpulidosalazar-github-io.onrender.com/api';
    const card = document.createElement('div');
    card.className = "background-var(--ec-bg,_#fff) margin-0_16px padding-32px borderRadius-12px boxShadow-0_4px_16px_rgba(0,0,0,0.05) border-1px_solid_var(--ec-border,_#dee2e6)";
    
    const title = document.createElement('h2');
    title.className = "marginTop-0 color-var(--ec-text,_#212529)";
    title.textContent = "Manage User Permissions";
    card.appendChild(title);
    const table = new ECDataTable({
        columns:[
            { key: "Id", label: "ID" },
            { key: "Username", label: "Username" },
            { 
                key: "CanPost", 
                label: "Can Publish Posts",
                render: (val, row) => {
                    const toggle = new ECToggle("", val).onChange(async (newVal) => {
                        row.CanPost = newVal;
                        await updatePermissions(row.Id, row.CanPost, row.IsAdmin);
                    });
                    return toggle.element;
                }
            },
            { 
                key: "IsAdmin", 
                label: "Is Administrator",
                render: (val, row) => {
                    const toggle = new ECToggle("", val).onChange(async (newVal) => {
                        row.IsAdmin = newVal;
                        await updatePermissions(row.Id, row.CanPost, row.IsAdmin);
                    });
                    return toggle.element;
                }
            }
        ],
        pageSize: 10
    });
    card.appendChild(table.element);
    document.getElementById('app-container').appendChild(card);
    async function updatePermissions(userId, canPost, isAdminFlag) {
        try {
            const res = await fetch(`${API_URL}/users/${userId}/permissions`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ canPost, isAdmin: isAdminFlag })
            });
            const result = await res.json();
            if(result.success) new ECToast("Permissions updated.", { type: "success" }).show();
            else new ECToast(result.error, { type: "error" }).show();
        } catch(e) {
            new ECToast("Failed to update.", { type: "error" }).show();
        }
    }
    try {
        const res = await fetch(`${API_URL}/users`, { headers: { 'Authorization': `Bearer ${token}` } });
        const result = await res.json();
        if (result.success) {
            table.setData(result.users);
        } else {
            new ECToast("Failed to load users: " + result.error, { type: "error" }).show();
        }
    } catch (err) {
        new ECToast("Network error.", { type: "error" }).show();
    }
});