window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("home-page");
    const header = document.createElement("header");

    const title = document.createElement("h1");
    title.textContent = "ParkEase";

    const logo = document.createElement("img");
    logo.src = "logo.png";
    logo.className = "logo";

    const hamburger = document.createElement("i");
    hamburger.className = "fa-solid fa-bars nav-toggle";
    hamburger.id = "hamburger";

    const nav = document.createElement("nav");
    nav.id = "nav-links";
    nav.innerHTML = `
        <a href="/">Home</a>
        <a href="/login">Login</a>
        `;
    
    header.append(logo,title, nav, hamburger);
    document.body.appendChild(header);

    const navToggle = document.getElementById("hamburger");
    const navLinks = document.getElementById("nav-links");

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", () => {
        navLinks.classList.toggle("show");

        navToggle.classList.toggle("fa-bars");
        navToggle.classList.toggle("fa-xmark");
        });
    }

    const navToggle = document.getElementById("hamburger");
    const navLinks = document.getElementById("nav-links");

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", () => {
        navLinks.classList.toggle("show");

        navToggle.classList.toggle("fa-bars");
        navToggle.classList.toggle("fa-xmark");
        });
    }

    //Creating main container
    const container = document.createElement("div");
    container.className = "home-container";

    const leftCol = document.createElement("div");
    leftCol.className = "home-left";

    const bigLogo = document.createElement("img");
    bigLogo.src = "biglogo.png"; 
    bigLogo.className = "biglogo";
    leftCol.appendChild(bigLogo);

    const rightCol = document.createElement("div");
    rightCol.className = "home-right";

    const intro = document.createElement("P");
    intro.textContent =
    "ParkEase is a smart parking system that will help you to reserve spaces easily";

    const listFeatures = document.createElement("ul");
    listFeatures.className = "features";
    listFeatures.innerHTML = `
    <li> Book parking in advance</li>
    <li> Secure your space with reservations</li>
    <li> Get notifications and updates about upcoming events</li>
    `;

    rightCol.append(intro, listFeatures);

    container.append(leftCol, rightCol);
    document.body.appendChild(container);
})