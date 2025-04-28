window.addEventListener("DOMContentLoaded", () => {
    // Adds a class to the body for styling
    document.body.classList.add("auth-page");

    // Creating main container & header
    const container = document.createElement("div");
    container.className = "container";

    const heading = document.createElement("h2");
    heading.textContent = "Car Park Login";

    // Creating the login form
    const form = document.createElement("form");

    // Handles form submission (needs to be updated to direct to different dashboards depending on admin/driver)
    form.onsubmit = (e) => {
        e.preventDefault();
        location.href = "dashboard.html";
    };

    // Creating input fields for form
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

    const registerBtn = document.createElement("a");
    registerBtn.href = "register.html";
    registerBtn.textContent = "Click here to register for an account!";

    
    // Appending
    form.append(usernameInput, passwordInput, submitBtn, registerBtn);
    container.append(heading, form);
    document.body.appendChild(container);

});


