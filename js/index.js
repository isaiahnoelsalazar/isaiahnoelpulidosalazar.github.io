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