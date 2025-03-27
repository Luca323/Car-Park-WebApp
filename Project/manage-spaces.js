window.addEventListener("DOMContentLoaded", () => {
    const header = document.createElement("header");
    header.innerHTML = `<h1>Manage Spaces</h1>`;
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
    section.innerHTML = `<h2>Block or Unblock Spaces</h2>`;
  
    const blockBtn = document.createElement("button");
    blockBtn.className = "btn";
    blockBtn.textContent = "Block Space";
  
    const unblockBtn = document.createElement("button");
    unblockBtn.className = "btn";
    unblockBtn.textContent = "Unblock Space";
  
    section.append(blockBtn, unblockBtn);
    container.appendChild(section);
    document.body.appendChild(container);
  });
  