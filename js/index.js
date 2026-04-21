document.addEventListener("DOMContentLoaded", () => {
    const itemsPerPage = 6; 
    
    const projectList = document.getElementById("project-list");
    const paginationContainer = document.getElementById("pagination-tabs");
    const projects = Array.from(projectList.children);
    
    const totalPages = Math.ceil(projects.length / itemsPerPage);
    const baseTabClasses = "cursor-pointer width-48px height-48px ecbounce-2 border-1px_solid_var(--ec-border,_#dee2e6) borderRadius-6px fontSize-14px fontWeight-600".split(" ");
    const activeClasses = ["background-var(--ec-text,_#212529)", "color-var(--ec-bg,_#fff)"];
    const inactiveClasses = ["background-var(--ec-bg,_#fff)", "color-var(--ec-text,_#212529)"];
    function renderTabs() {
        paginationContainer.innerHTML = "";
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement("button");
            btn.innerText = i;
            btn.classList.add(...baseTabClasses);
            if (i === 1) {
                btn.classList.add(...activeClasses);
            } else {
                btn.classList.add(...inactiveClasses);
            }
            btn.addEventListener("click", () => {
                showPage(i);
                updateTabStyles(i);
            });
            paginationContainer.appendChild(btn);
        }
    }
    function updateTabStyles(activePage) {
        const buttons = paginationContainer.querySelectorAll("button");
        buttons.forEach((btn, index) => {
            if (index + 1 === activePage) {
                btn.classList.remove(...inactiveClasses);
                btn.classList.add(...activeClasses);
            } else {
                btn.classList.remove(...activeClasses);
                btn.classList.add(...inactiveClasses);
            }
        });
    }
    function showPage(page) {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        projects.forEach((project, index) => {
            if (index >= start && index < end) {
                project.style.display = "";
            } else {
                project.style.display = "none";
            }
        });
    }
    if(totalPages > 1) {
        renderTabs();
        showPage(1);
    }
});
let hero = new ECHero({
    eyebrow: "Hi! My name is",
    title: "Isaiah Noel P. Salazar",
    subtitle: "Welcome to my website!",
    background: "linear-gradient(135deg, #ffffff 0%, #BFBFFF 60%, #4949FF 100%)",
    actions: [
        {
            label:"Explore",
            onClick: () => {
                document.getElementById("projects").scrollIntoView({ behavior: "smooth" });
            }
        },
        {
            label:"Contact",
            variant:"white",
            onClick: () => {
                document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
            }
        },
    ],
});
document.getElementById("hero").appendChild(hero.element);
document.querySelectorAll(".separator").forEach(separator => {
    let divider = new ECDivider();
    separator.appendChild(divider.element);
});