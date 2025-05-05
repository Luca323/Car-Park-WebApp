window.addEventListener("DOMContentLoaded", () => {
    // Adds a class to the body for styling
    document.body.classList.add("dashboard-style");

    // Creating the main page container & header
    const container = document.createElement("div");
    container.className = "container";

    const heading = document.createElement("h2");
    heading.textContent = "Welcome to ParkEase";

    // Creating the login & register buttons 
    const loginBtn = document.createElement("button");
    loginBtn.textContent = "Login";
    loginBtn.onclick = () => location.href = "/login";

    const registerBtn = document.createElement("button");
    registerBtn.textContent = "Register";
    registerBtn.onclick = () => location.href = "/register";

    // Appending
    container.append(heading, loginBtn, registerBtn);
    document.body.appendChild(container);
});
