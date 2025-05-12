window.addEventListener("DOMContentLoaded", () => {
    // Adds a class to the body for styling
    document.body.classList.add("auth-page");

    // Creating the main container & the header
    const container = document.createElement("div");
    container.className = "container";

    const heading = document.createElement("h2");
    heading.textContent = "Registration";

    // Creating the register form 
    const form = document.createElement("form");
    
    // Creating input fieldss
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Create Username";
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
    container.append(heading, form);//
    document.body.appendChild(container);
  
    // Handles form submit logic
    form.onsubmit = async (e) => {
      e.preventDefault();

      const newUser = {
        username: nameInput.value.trim(), // mapping nameInput to username
        passkey: passInput.value.trim(),
        phone: contactInput.value.trim(),
        email: emailInput.value.trim().toLowerCase(),
        regNum: regInput.value.trim()

      };

      try {
        const response = await fetch('http://localhost:8080/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newUser)
        });

        const data = await response.json();

        if (response.ok) {
          alert(data.message);
          location.href = '/login';
        } else {
          alert(data.error || 'Registration failed');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while trying to register.');
      }
    };
  });
