window.addEventListener("DOMContentLoaded", () => {
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
  
    const container = document.createElement("div");
    container.className = "dashboard";
  
    const section = document.createElement("div");
    section.className = "section";
  
    const heading = document.createElement("h2");
    heading.textContent = "Notify Users";
  
    const textarea = document.createElement("textarea");
    textarea.placeholder = "Enter notification message...";
  
    const button = document.createElement("button");
    button.className = "btn";
    button.textContent = "Send Notification";
    button.onclick = () => {
      alert("Notification sent: " + textarea.value);
      textarea.value = "";
    };
  
    section.append(heading, textarea, button);
    container.appendChild(section);
    document.body.appendChild(container);
  });
  
  