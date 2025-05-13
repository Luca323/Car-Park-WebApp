window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("home-page");
    const header = document.createElement("header");
    const title = document.createElement("h1");
    title.textContent = "ParkEase";

    const logo = document.createElement("img");
    logo.src = "logo.png"; 
    logo.alt = "ParkEase Logo";
    logo.className = "logo";

    const nav = document.createElement("nav");
    nav.innerHTML = `
        <a href="/">Home</a>
        <a href="/login">Login</a>
        `;
    
    header.append(logo,title, nav);
    document.body.appendChild(header);

    // Creating main container
    const container = document.createElement("div");
    container.className = "container";


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

    container.append(intro, listFeatures);
    document.body.appendChild(container);
})