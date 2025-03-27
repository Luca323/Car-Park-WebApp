window.addEventListener("DOMContentLoaded", () => {
    const header = document.createElement("header");
    header.innerHTML = `<h1>Manage Car Parks</h1>`;
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
    section.innerHTML = `<h2>Add or Remove Car Parks</h2>`;
  
    const addBtn = document.createElement("button");
    addBtn.className = "btn";
    addBtn.textContent = "Add Car Park";
  
    const removeBtn = document.createElement("button");
    removeBtn.className = "btn";
    removeBtn.textContent = "Remove Car Park";
  
    section.append(addBtn, removeBtn);
    container.appendChild(section);
    document.body.appendChild(container);
  });
  
  
  