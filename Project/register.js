window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("auth-page");

    const container = document.createElement("div");
    container.className = "container";

    const heading = document.createElement("h2");
    heading.textContent = "Car Park Registration";

    const form = document.createElement("form");
    form.onsubmit = (e) => {
        e.preventDefault();
        location.href = "dashboard.html";
    };

    const fields = [
        { name: "name", placeholder: "Full Name", type: "text" },
        { name: "registration_number", placeholder: "Car Registration Number", type: "text" },
        { name: "contact_number", placeholder: "Contact Number", type: "text" },
        { name: "email", placeholder: "Email Address", type: "email" },
        { name: "password", placeholder: "Password", type: "password" }
    ];

    fields.forEach(({ name, placeholder, type }) => {
        const input = document.createElement("input");
        input.type = type;
        input.name = name;
        input.placeholder = placeholder;
        input.required = true;
        form.appendChild(input);
    });

    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.textContent = "Register";

    form.appendChild(submitBtn);
    container.append(heading, form);
    document.body.appendChild(container);
});
