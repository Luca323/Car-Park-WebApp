window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("auth-page");

    const container = document.createElement("div");
    container.className = "container";

    const heading = document.createElement("h2");
    heading.textContent = "Car Park Login";

    const form = document.createElement("form");
    form.onsubmit = (e) => {
        e.preventDefault();
        location.href = "dashboard.html";
    };

    const usernameInput = document.createElement("input");
    usernameInput.type = "text";
    usernameInput.name = "username";
    usernameInput.placeholder = "Username";
    usernameInput.required = true;

    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.name = "password";
    passwordInput.placeholder = "Password";
    passwordInput.required = true;

    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.textContent = "Login";

    form.append(usernameInput, passwordInput, submitBtn);
    container.append(heading, form);
    document.body.appendChild(container);
});
