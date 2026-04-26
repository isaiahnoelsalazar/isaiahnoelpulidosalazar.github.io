document.addEventListener('DOMContentLoaded', () => {
    if(localStorage.getItem('admin_token')) {
        window.location.href = '../newpost/';
        return;
    }
    let isLoginMode = true;
    const API_URL = 'https://isaiahnoelpulidosalazar-github-io.onrender.com/api'; 
    const card = document.createElement('div');
    card.className = "background-var(--ec-bg,_#fff) padding-32px borderRadius-12px boxShadow-0_8px_24px_rgba(0,0,0,0.08) border-1px_solid_var(--ec-border,_#dee2e6)";
    
    const title = document.createElement('h1');
    title.className = "marginTop-0 marginBottom-24px color-var(--ec-text,_#212529) textAlign-center fontSize-24px";
    title.textContent = "Log In";
    card.appendChild(title);
    const usernameInput = new ECTextbox({ label: "Username", placeholder: "Enter username" });
    card.appendChild(usernameInput.element);
    
    const spacer1 = document.createElement('div');
    spacer1.className = "height-16px";
    card.appendChild(spacer1);
    const passwordInput = new ECTextbox({ label: "Password", placeholder: "Enter password" });
    passwordInput._input.type = "password"; 
    card.appendChild(passwordInput.element);
    const spacer2 = document.createElement('div');
    spacer2.className = "height-24px";
    card.appendChild(spacer2);
    const actionBtn = new ECButton("Log In").onClick(async () => {
        const username = usernameInput.getValue();
        const password = passwordInput.getValue();
        if (!username || !password) {
            new ECToast("Please fill in both fields", { type: "warning" }).show();
            return;
        }
        
        actionBtn.disable().setLabel("Please wait...");
        const endpoint = isLoginMode ? '/login' : '/register';
        try {
            const res = await fetch(API_URL + endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await res.json();
            if (result.success) {
                if (isLoginMode) {
                    new ECToast("Success! Logging in...", { type: "success" }).show();
                    localStorage.setItem('admin_token', result.token);
                    localStorage.setItem('is_admin', result.isAdmin);
                    localStorage.setItem('can_post', result.canPost);
                    setTimeout(() => window.location.href = '../newpost/', 1000);
                } else {
                    new ECToast("Registration successful! You can now log in.", { type: "success" }).show();
                    toggleMode();
                    actionBtn.enable().setLabel("Log In");
                    passwordInput.setValue('');
                }
            } else {
                new ECToast(result.error || "An error occurred.", { type: "error" }).show();
                actionBtn.enable().setLabel(isLoginMode ? "Log In" : "Register");
            }
        } catch (err) {
            new ECToast("Network error. Is the server running?", { type: "error" }).show();
            actionBtn.enable().setLabel(isLoginMode ? "Log In" : "Register");
        }
    });
    actionBtn.element.classList.add("width-100%");
    card.appendChild(actionBtn.element);
    const toggleWrap = document.createElement('div');
    toggleWrap.className = "marginTop-16px textAlign-center fontSize-14px color-var(--ec-text-muted,_#6c757d)";
    
    const toggleText = document.createElement('span');
    toggleText.textContent = "Don't have an account? ";
    toggleWrap.appendChild(toggleText);
    
    const toggleLink = document.createElement('a');
    toggleLink.className = "color-var(--ec-accent,_#1a73e8) cursor-pointer textDecoration-underline hover:opacity-0.8";
    toggleLink.textContent = "Register";
    
    function toggleMode() {
        isLoginMode = !isLoginMode;
        title.textContent = isLoginMode ? "Log In" : "Create Account";
        actionBtn.setLabel(isLoginMode ? "Log In" : "Register");
        toggleText.textContent = isLoginMode ? "Don't have an account? " : "Already have an account? ";
        toggleLink.textContent = isLoginMode ? "Register" : "Log In";
    }
    
    toggleLink.addEventListener('click', toggleMode);
    toggleWrap.appendChild(toggleLink);
    card.appendChild(toggleWrap);
    document.getElementById('login-container').appendChild(card);
});