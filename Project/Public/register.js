window.addEventListener("DOMContentLoaded", () => {
  //Adds a class to the body for styling
  document.body.classList.add("login-reg-page");

  const header = document.createElement("header");

  const logo = document.createElement("img");
  logo.src = "logo.png";
  logo.alt = "ParkEase Logo";
  logo.className = "logo";

  const title = document.createElement("h1");
  title.textContent = "ParkEase";

  const hamburger = document.createElement("i");
  hamburger.className = "fa-solid fa-bars nav-toggle";
  hamburger.id = "hamburger";

  const nav = document.createElement("nav"); //Registration/login page uses a different, simpler nav bar
  nav.id = "nav-links";
  nav.innerHTML = `
      <a href="/">Home</a>
      <a href="/login">Login</a>
  `;

  header.append(logo, title, nav, hamburger);
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

  //Creating the main container & the header 
  const container = document.createElement("div");
  container.className = "container";

  const heading = document.createElement("h2");
  heading.textContent = "Registration";

  //Creating the register form 
  const form = document.createElement("form");
  
  //Creating input fieldss
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

  //Append inputs to the form
  form.append(nameInput, regInput, contactInput, emailInput, passInput, submitBtn);
  container.append(heading, form);//
  
  const main = document.createElement("main");
  main.appendChild(container);
  document.body.appendChild(main);

  //Handles form submit logic
  form.onsubmit = async (e) => {
    e.preventDefault();

    const newUser = {
      username: nameInput.value.trim(), 
      passkey: passInput.value.trim(),
      phone: contactInput.value.trim(),
      email: emailInput.value.trim().toLowerCase(),
      regNum: regInput.value.trim()

    };

    try {
      const response = await fetch('http://localhost:8080/register', { //Attempts to create account
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message); //asks users to verify their accounts
        location.href = '/login'; //Sends user to login page on success
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while trying to register.');
    }
  };
});
