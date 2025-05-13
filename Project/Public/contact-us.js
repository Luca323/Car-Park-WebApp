window.addEventListener("DOMContentLoaded", () => {
    // Creating and appending the header and nav bar
    const header = document.createElement("header");
    
    const logo = document.createElement("img");
    logo.src = "logo.png";
    logo.className = "logo";
  
    const title = document.createElement("h1");
    title.textContent = "ParkEase";
  
    header.append(logo, title);
    document.body.appendChild(header);
  
    const nav = document.createElement("nav");
    nav.innerHTML = `
      <a href="/driverdashboard">Dashboard</a>
      <a href="/bookparking">Book Parking</a>
      <a href="/contactus">Contact Us</a>
      <a href="#" id="logout-link">Logout</a>
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

    //Logout logic
    const logoutLink = document.getElementById("logout-link");
    logoutLink.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        const res = await fetch("/logout", {
          method: "POST",
          credentials: "include"
        });
        if (res.ok) {
          location.href = "/";
        } else {
          alert("Failed to log out.");
        }
      } catch (err) {
        console.error("Logout error:", err);
        alert("Error during logout.");
      }
    });
  
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
    form.addEventListener("submit", async (e) => {
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
  
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: message.name,
            email: message.email,
            message: message.content
          })
        });
  
        const data = await res.json();
  
        if (!res.ok) {
          throw new Error(data.error || "Failed to send message");
        }
  
        confirmation.innerHTML = `<p>Message sent! We'll get back to you soon.</p>`;
        form.reset();
  
      } catch (err) {
        console.error(err);
        confirmation.innerHTML = `<p style="color:red;">Failed to send message. Please try again later.</p>`;
      }
    });
  });
  