window.addEventListener("DOMContentLoaded", () => {
    const header = document.createElement("header");
    header.innerHTML = `<h1>Manage Events</h1>`;
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
    section.innerHTML = `<h2>Reserve Spaces for Special Events</h2>`;
  
    const eventName = document.createElement("input");
    eventName.placeholder = "Event Name";
    eventName.type = "text";
  
    const dateInput = document.createElement("input");
    dateInput.type = "date";
  
    const timeInput = document.createElement("input");
    timeInput.type = "time";
  
    const duration = document.createElement("input");
    duration.placeholder = "Duration (hours)";
    duration.type = "number";
  
    const spaces = document.createElement("input");
    spaces.placeholder = "Spaces Needed";
    spaces.type = "number";
  
    const reserveBtn = document.createElement("button");
    reserveBtn.className = "btn";
    reserveBtn.textContent = "Reserve";
  
    section.append(eventName, dateInput, timeInput, duration, spaces, reserveBtn);
    container.appendChild(section);
    document.body.appendChild(container);
  });
  
  