window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("dashboard-style");

    const container = document.createElement("div");
    container.className = "container";

    const heading = document.createElement("h2");
    heading.textContent = "Welcome to ParkEase";

    const loginBtn = document.createElement("button");
    loginBtn.textContent = "Login";
    loginBtn.onclick = () => location.href = "login.html";

    const registerBtn = document.createElement("button");
    registerBtn.textContent = "Register";
    registerBtn.onclick = () => location.href = "register.html";

    container.append(heading, loginBtn, registerBtn);
    document.body.appendChild(container);
});
