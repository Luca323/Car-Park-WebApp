window.addEventListener("DOMContentLoaded", () => {
    // Creating and appending the header and nav bar
    const header = document.createElement("header");
    header.innerHTML = `<h1>Contact Us</h1>`;
    document.body.appendChild(header);
  
    const nav = document.createElement("nav");
    nav.innerHTML = `
      <a href="driver-dashboard.html">Dashboard</a>
      <a href="book-parking.html">Book Parking</a>
      <a href="contact-us.html">Contact Us</a>
    `;
    document.body.appendChild(nav);
  
    // Creating the main page container
    const container = document.createElement("div");
    container.className = "dashboard";
    document.body.appendChild(container);
  
    // Creating the section for the form
    const section = document.createElement("div");
    section.className = "section";
    section.innerHTML = "<h2>Get in Touch</h2>";
  
    // Creating the contact form 
    const form = document.createElement("form");
    form.className = "event-form";
  
    // Creating the input fields for form
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Your Name";
    nameInput.required = true;
    nameInput.className = "event-input";
  
    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.placeholder = "Your Email";
    emailInput.required = true;
    emailInput.className = "event-input";
  
    const messageInput = document.createElement("textarea");
    messageInput.placeholder = "Your Message";
    messageInput.required = true;
    messageInput.className = "event-input";
  
    // Submit button
    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.textContent = "Send Message";
  
    const confirmation = document.createElement("div");
    confirmation.className = "confirmation";
  
    // Appends input fields to the form, the form to the section, & section to the container
    form.append(nameInput, emailInput, messageInput, submitBtn);
    section.append(form, confirmation);
    container.appendChild(section);
  
    // Handles form submission
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const message = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        content: messageInput.value.trim(),
        time: new Date().toISOString()
      };
  
      // Validation checks
      if (!message.name || !message.email || !message.content) {
        alert("Please fill in all fields.");
        return;
      }
  
      // stores message in local storage (needs to go to DB & emailed to admin)
      const storedMessages = JSON.parse(localStorage.getItem("contactMessages")) || [];
      storedMessages.push(message);
      localStorage.setItem("contactMessages", JSON.stringify(storedMessages));
  
      // Displays confirmation & resets form values
      confirmation.innerHTML = `<p>✅ Message sent! We'll get back to you soon.</p>`;
      form.reset();
    });
  });