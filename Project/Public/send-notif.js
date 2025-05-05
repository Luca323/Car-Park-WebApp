window.addEventListener("DOMContentLoaded", () => {
  // Creating and appending the header and nav bar
  const header = document.createElement("header");
  header.innerHTML = `<h1>Send Notifications</h1>`;
  document.body.appendChild(header);
  
  const nav = document.createElement("nav");
  nav.innerHTML = `
    <a href="/admindashboard">Dashboard</a>
    <a href="/managecarparks">Manage Car Parks</a>
    <a href="/managespaces">Manage Spaces</a>
    <a href="/manageevents">Manage Events</a>
    <a href="/sendnotif">Send Notifications</a>
  `;
  document.body.appendChild(nav);

  // Creating the main container & section
  const container = document.createElement("div");
  container.className = "dashboard";

  const section = document.createElement("div");
  section.className = "section";

  const heading = document.createElement("h2");
  heading.textContent = "Notify Users";

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
  
  