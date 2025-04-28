window.addEventListener("DOMContentLoaded", () => {
  // Creating and appending the header and nav bar
    const header = document.createElement("header");
    header.innerHTML = `<h1>Send Notifications</h1>`;
    document.body.appendChild(header);
    
    const nav = document.createElement("nav");
    nav.innerHTML = `
      <a href="admin-dashboard.html">Dashboard</a>
      <a href="manage-carparks.html">Manage Car Parks</a>
      <a href="manage-spaces.html">Manage Spaces</a>
      <a href="manage-events.html">Manage Events</a>
      <a href="send-notif.html">Send Notifications</a>
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
  
    // Button to send notif & submit logic (simulation atm - needs to go to driver email)
    const button = document.createElement("button");
    button.className = "btn";
    button.textContent = "Send Notification";
    button.onclick = () => {
      alert("Notification sent: " + textarea.value);
      textarea.value = "";
    };
  
    // Appends all elements
    section.append(heading, textarea, button);
    container.appendChild(section);
    document.body.appendChild(container);
  });
  
  