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
// Layout: Blank Container
var comp_2 = document.createElement('div');
comp_2.className = 'display-grid gridTemplateColumns-1fr_1fr_1fr tablet:gridTemplateColumns-1fr_1fr mobile:gridTemplateColumns-1fr gap-16px width-100% boxSizing-border-box';
document.getElementById("project-list").appendChild(comp_2);
var comp_2_col_1 = document.createElement('div');
comp_2_col_1.className = 'flex-1 display-flex flexDirection-column gap-12px boxSizing-border-box minWidth-200px';
comp_2.appendChild(comp_2_col_1);
// ECMediaCard
var comp_3 = new ECMediaCard({
    "author": "ECDemo",
    "noAvatar": "true",
    "imageSrc": "https://i.ibb.co/pj0JnJJw/Screenshot-2026-04-16-201447.png",
    "imageAlt": "ECDemo image",
    "imageHeight": "200px",
    "content": "This page demonstrates how to use ECStyleSheet and ECElements to create beautiful web interfaces.",
    "onClick": () => {
        window.open("ecdemo/", "_blank");
    },
});
if(comp_3 && comp_3.setTheme) comp_3.setTheme(window.ECTheme['Blue']);
comp_2_col_1.appendChild(comp_3.element || comp_3);
var comp_2_col_2 = document.createElement('div');
comp_2_col_2.className = 'flex-1 display-flex flexDirection-column gap-12px boxSizing-border-box minWidth-200px';
comp_2.appendChild(comp_2_col_2);
// ECMediaCard
var comp_4 = new ECMediaCard({
    "author": "ECWebsiteBuilder",
    "noAvatar": "true",
    "imageSrc": "https://i.ibb.co/Fk6YKJ5f/Screenshot-2026-04-16-202219.png",
    "imageAlt": "ECWebsiteBuilder image",
    "imageHeight": "200px",
    "content": "ECWebsiteBuilder is a powerful tool that allows you to create stunning websites with ease using ECStyleSheet and ECElements.",
    "onClick": () => {
        window.open("ecwebsitebuilder/", "_blank");
    },
});
if(comp_4 && comp_4.setTheme) comp_4.setTheme(window.ECTheme['Blue']);
comp_2_col_2.appendChild(comp_4.element || comp_4);
var comp_2_col_3 = document.createElement('div');
comp_2_col_3.className = 'flex-1 display-flex flexDirection-column gap-12px boxSizing-border-box minWidth-200px';
comp_2.appendChild(comp_2_col_3);
// ECMediaCard
var comp_5 = new ECMediaCard({
    "author": "Sudoku",
    "noAvatar": "true",
    "imageSrc": "https://i.ibb.co/NdrbmZGN/Screenshot-2026-04-18-155715.png",
    "imageAlt": "Sudoku image",
    "imageHeight": "200px",
    "content": "A sudoku game.",
    "onClick": () => {
        window.open("sudoku/", "_blank");
    },
});
if(comp_5 && comp_5.setTheme) comp_5.setTheme(window.ECTheme['Blue']);
comp_2_col_3.appendChild(comp_5.element || comp_5);
var comp_2_col_4 = document.createElement('div');
comp_2_col_4.className = 'flex-1 display-flex flexDirection-column gap-12px boxSizing-border-box minWidth-200px';
comp_2.appendChild(comp_2_col_4);
// ECMediaCard
var comp_6 = new ECMediaCard({
    "author": "Calm",
    "noAvatar": "true",
    "imageSrc": "https://i.ibb.co/vCbxmj3Y/Screenshot-2026-04-18-160155.png",
    "imageAlt": "Calm image",
    "imageHeight": "200px",
    "content": "A standby screen with a calming background.",
    "onClick": () => {
        window.open("calm/", "_blank");
    },
});
if(comp_6 && comp_6.setTheme) comp_6.setTheme(window.ECTheme['Blue']);
comp_2_col_4.appendChild(comp_6.element || comp_6);