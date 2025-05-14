window.addEventListener("DOMContentLoaded", () => {
  // Creating and appending the header and nav bar
  const header = document.createElement("header");
  
  const logo = document.createElement("img");
  logo.src = "logo.png";
  logo.className = "logo";

  const title = document.createElement("h1");
  title.textContent = "ParkEase";

  const hamburger = document.createElement("i");
  hamburger.className = "fa-solid fa-bars nav-toggle";
  hamburger.id = "hamburger";

  header.append(logo, title,hamburger);
  document.body.appendChild(header);
  
  const nav = document.createElement("nav");
  nav.id = "nav-links";
  nav.innerHTML = `
    <a href="/admindashboard">Dashboard</a>
    <a href="/managecarparks">Manage Car Parks</a>
    <a href="/managespaces">Manage Spaces</a>    
    <a href="/manageevents">Manage Events</a>
    <a href="/manageusers">Manage Users</a>
    <a href="/sendnotif" class="active">Send Notifications</a>
    <a href="#" id="logout-link">Logout</a>
  `;
  document.body.appendChild(nav);

  const navToggle = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("show");

      navToggle.classList.toggle("fa-bars");
      navToggle.classList.toggle("fa-xmark");
    });
  }

  // Creating the main container & section
  const container = document.createElement("div");
  container.className = "dashboard";

  const section = document.createElement("div");
  section.className = "section";

  const heading = document.createElement("h2");
  heading.textContent = "Notify Users";

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

  // Creating the input text area 
  const textarea = document.createElement("textarea");
  textarea.placeholder = "Enter notification message...";
  textarea.className = "text-input";

  // Status message element
  const statusMessage = document.createElement("p");
  statusMessage.className = "status-message";
  
  // Button to send notification
  const button = document.createElement("button");
  button.className = "btn";
  button.textContent = "Send Notification";
  button.onclick = async () => {
    const message = textarea.value.trim();
    if (!message) {
      statusMessage.textContent = "Please enter a message";
      statusMessage.style.color = "red";
      return;
    }

    button.disabled = true;
    button.textContent = "Sending...";
    statusMessage.textContent = "Sending notifications...";
    statusMessage.style.color = "black";

    try {
      button.disabled = true;
      button.textContent = "Sending...";
    
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // include session if needed
        body: JSON.stringify({ message })
      });
    
      const data = await response.json();
    
      if (response.ok && data.success) {
        statusMessage.textContent = `Notification sent successfully to ${data.count} users!`;
        statusMessage.style.color = "green";
        textarea.value = "";
      } else {
        statusMessage.textContent = data.error || "Failed to send some notifications";
        statusMessage.style.color = "orange";
      }
    } catch (error) {
      statusMessage.textContent = "Error sending notifications: " + error.message;
      statusMessage.style.color = "red";
    } finally {
      button.disabled = false;
      button.textContent = "Send Notification";
    }
  };

  // Appends all elements
  section.append(heading, textarea, button, statusMessage);
  container.appendChild(section);
  document.body.appendChild(container);

  //DO WE NEED THIS? ITS NEVER CALLED??
  async function sendEmailNotification(message) {
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_AUTH_TOKEN' // if needed
        },
        body: JSON.stringify({ message })
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }
});
  
  