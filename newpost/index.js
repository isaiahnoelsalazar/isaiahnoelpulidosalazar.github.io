document.querySelectorAll(".separator").forEach(separator => {
    let divider = new ECDivider();
    separator.appendChild(divider.element);
});

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
        window.location.href = '../login/';
        return;
    }
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    const canPost = localStorage.getItem('can_post') === 'true';
    const topbar = document.getElementById('topbar');
    
    if (isAdmin) {
        const adminBtn = document.createElement('a');
        adminBtn.href = '../admin/';
        adminBtn.className = "backgroundColor-var(--ec-bg,_#eee) margin-8px_8px_0_0 padding-4px_16px cursor-pointer textDecoration-none color-inherit display-flex ecbounce-2 alignItems-center borderRadius-8px fontSize-16px fontWeight-500";
        adminBtn.innerHTML = `<p class="margin-0 padding-4px_0">Admin Panel</p>`;
        topbar.appendChild(adminBtn);
    }
    const postsBtn = document.createElement('a');
    postsBtn.href = '../posts/';
    postsBtn.className = "backgroundColor-var(--ec-bg,_#eee) margin-8px_8px_0_0 padding-4px_16px cursor-pointer textDecoration-none color-inherit display-flex ecbounce-2 alignItems-center borderRadius-8px fontSize-16px fontWeight-500";
    postsBtn.innerHTML = `<p class="margin-0 padding-4px_0">View Posts</p>`;
    const logoutBtn = document.createElement('a');
    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
    });
    logoutBtn.href = '../login/';
    logoutBtn.className = "backgroundColor-var(--ec-bg,_#eee) margin-8px_16px_0_0 padding-4px_16px cursor-pointer textDecoration-none color-inherit display-flex ecbounce-2 alignItems-center borderRadius-8px fontSize-16px fontWeight-500";
    logoutBtn.innerHTML = `<p class="margin-0 padding-4px_0">Logout</p>`;
    
    topbar.appendChild(postsBtn);
    topbar.appendChild(logoutBtn);

    const card = document.createElement('div');
    card.className = "background-var(--ec-bg,_#fff) margin-0_16px padding-32px borderRadius-12px boxShadow-0_4px_16px_rgba(0,0,0,0.05) border-1px_solid_var(--ec-border,_#dee2e6)";
    if (!canPost && !isAdmin) {
        card.innerHTML = `
            <h2 class="marginTop-0 color-var(--ec-text,_#212529)">Access Restricted</h2>
            <p class="color-var(--ec-text-muted,_#6c757d) fontSize-15px">Your account has been created, but you do not have permission to publish posts yet. Please contact an administrator to approve your account.</p>
        `;
        document.getElementById('app-container').appendChild(card);
        return;
    }
    const titleInput = new ECTextbox({ label: "Post Title", placeholder: "E.g., My Awesome Update" });
    card.appendChild(titleInput.element);
    const contentLabel = document.createElement('label');
    contentLabel.className = "fontSize-13px fontWeight-500 color-var(--ec-text-muted,_#6c757d) marginTop-16px marginBottom-4px display-block";
    contentLabel.textContent = "Post Content (HTML allowed)";
    card.appendChild(contentLabel);
    const contentArea = document.createElement('textarea');
    contentArea.className = "width-100% padding-12px border-1px_solid_var(--ec-border,_#dee2e6) borderRadius-8px fontSize-14px color-var(--ec-text,_#212529) boxSizing-border-box outline-none focus:borderColor-var(--ec-accent,_#1a73e8) minHeight-200px";
    contentArea.placeholder = "Write your content here...";
    card.appendChild(contentArea);
    const btnContainer = document.createElement('div');
    btnContainer.className = "marginTop-24px display-flex justifyContent-flex-end gap-12px";
    
    const publishBtn = new ECButton("Publish Post").onClick(async () => {
        const title = titleInput.getValue();
        const content = contentArea.value;
        if (!title || !content) return new ECToast("Please fill in both fields.", { type: "warning" }).show();
        publishBtn.disable().setLabel("Publishing...");
        try {
            const response = await fetch('https://isaiahnoelpulidosalazar-github-io.onrender.com/api/create-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ title, content })
            });
            const result = await response.json();
            if (result.success) {
                new ECToast("Success! Post published.", { type: "success" }).show();
                titleInput.setValue(''); contentArea.value = '';
                publishBtn.enable().setLabel("Publish Post");
            } else {
                if (response.status === 401 || response.status === 403) {
                    new ECToast(result.error || "Session expired.", { type: "error" }).show();
                    if (response.status === 401) setTimeout(() => window.location.href = '../login/', 1500);
                } else {
                    new ECToast("Error: " + result.error, { type: "error" }).show();
                }
                publishBtn.enable().setLabel("Publish Post");
            }
        } catch (err) {
            new ECToast("Connection failed.", { type: "error" }).show();
            publishBtn.enable().setLabel("Publish Post");
        }
    });
    btnContainer.appendChild(publishBtn.element);
    card.appendChild(btnContainer);
    document.getElementById('app-container').appendChild(card);
});