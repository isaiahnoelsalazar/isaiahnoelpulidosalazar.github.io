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

async function getLatestPosts() {
    const res = await fetch("/posts/index.html");
    const html = await res.text();

    const doc = new DOMParser().parseFromString(html, "text/html");
    const posts = [...doc.querySelectorAll(".post-link")];

    function extractDate(text) {
        const match = text.match(/Published on (.+?) by/);
        if (!match) return null;

        const cleaned = match[1].replace(" at ", " ");
        return new Date(cleaned);
    }

    function extractAuthor(text) {
        const match = text.match(/by (.+)$/);
        return match ? match[1] : "unknown";
    }

    const parsed = posts.map(post => {
        const link = post.querySelector("a");
        const title = link?.textContent.trim();
        const href = link?.getAttribute("href");

        const p = post.querySelector("p");
        const text = p?.textContent || "";

        const date = extractDate(text);
        const author = extractAuthor(text);

        if (!date || !href || !title) return null;

        return {
        title,
        href,
        date,
        author,
        rawDate: text.match(/Published on (.+?) by/)?.[1] || ""
        };
    }).filter(x => x);

    parsed.sort((a, b) => b.date - a.date);

    return parsed.slice(0, 3);
}

function createCard(post) {
    return `
<div class="flex-1 display-flex flexDirection-column gap-12px boxSizing-border-box minWidth-200px">
<a href="${post.href}" class="ecbounce-2 cursor-pointer textDecoration-none color-inherit boxSizing-border-box fontFamily--apple-system,_BlinkMacSystemFont,_'Segoe_UI',_Roboto,_sans-serif background-var(--ec-bg,_#fff) border-1px_solid_var(--ec-border,_#dee2e6) borderRadius-12px overflow-hidden display-flex flexDirection-column">

  <div class="display-flex alignItems-center gap-10px padding-14px_16px_0">
    <div class="display-flex flexDirection-column gap-1px">
      <p class="fontSize-14px fontWeight-600 margin-0">${post.author}</p>
    </div>
  </div>

  <div class="padding-12px_16px fontSize-14px lineHeight-1.6 flex-1">
    <p class="margin-0">${post.title}</p>
  </div>

  <div class="padding-12px_16px fontSize-12px color-gray">
    Published on ${post.rawDate}
  </div>

</a>
</div>
`;
}

getLatestPosts().then(posts => {
    const container = document.getElementById("post-list");

    posts.forEach(post => {
        container.insertAdjacentHTML("beforeend", createCard(post));
    });
});