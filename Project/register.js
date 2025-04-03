window.addEventListener("DOMContentLoaded", () => {
    // Adds a class to the body for styling
    document.body.classList.add("auth-page");

    // Creating the main container & the header
    const container = document.createElement("div");
    container.className = "container";

    const heading = document.createElement("h2");
    heading.textContent = "Car Park Registration";

    // Creating the register form 
    const form = document.createElement("form");
    
    // Creating input fieldss
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Full Name";
    nameInput.required = true;
  
    const regInput = document.createElement("input");
    regInput.type = "text";
    regInput.placeholder = "Car Registration Number";
    regInput.required = true;
  
    const contactInput = document.createElement("input");
    contactInput.type = "text";
    contactInput.placeholder = "Contact Number";
    contactInput.required = true;
  
    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.placeholder = "Email Address";
    emailInput.required = true;
  
    const passInput = document.createElement("input");
    passInput.type = "password";
    passInput.placeholder = "Password";
    passInput.required = true;
  
    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.textContent = "Register";
  
    // Append inputs to the form
    form.append(nameInput, regInput, contactInput, emailInput, passInput, submitBtn);
    container.append(heading, form);
    document.body.appendChild(container);
  
    // Handles form submit logic
    form.onsubmit = (e) => {
      e.preventDefault();
  
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const email = emailInput.value.trim().toLowerCase();
  
      const exists = users.find(user => user.email === email);
      if (exists) {
        alert("An account with this email already exists.");
        return;
      }
  
      const newUser = {
        name: nameInput.value.trim(),
        registration_number: regInput.value.trim(),
        contact_number: contactInput.value.trim(),
        email,
        password: passInput.value
      };
  
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
  
      alert("Registration successful. You can now log in.");
      location.href = "login.html";
    };
  });