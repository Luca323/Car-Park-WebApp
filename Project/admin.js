// admin.js
window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.remove("dashboard-style");
  
    // Heading
    const title = document.createElement("header");
    title.innerHTML = `<h1>Admin Dashboard - ParkEase</h1>`;
    document.body.append(title);


    // Nav Bar
    const navbar = document.createElement("nav");
    navbar.innerHTML = `
      <a href="admin-dashboard.html">Dashboard</a>
      <a href="manage-carparks.html">Manage Car Parks</a>
      <a href="manage-spaces.html">Manage Spaces</a>
      <a href="manage-events.html">Manage Events</a>
      <a href="send-notif.html">Send Notifications</a>
    `;
    document.body.append(navbar);

  
    // Main Dashboard Container 
    const container = document.createElement("div");
    container.className = "dashboard";
  
    // Parking Overview 
    const stats = document.createElement("div");
    stats.className = "section";
    stats.innerHTML = `
      <h2>Parking Overview</h2>
      <p>Total Spaces: <span id="total">50</span></p>
      <p>Occupied: <span id="occupied">20</span></p>
      <p>Available: <span id="available">25</span></p>
      <p>Reserved: <span id="reserved">5</span></p>
      <p>Blocked: <span id="blocked">0</span></p>
    `;
  
    //  Parking Requests 
    const requests = document.createElement("div");
    requests.className = "section";
    requests.innerHTML = `
      <h2>Pending Parking Requests</h2>
      <ul id="requestList">
        <li>Driver A – Requesting 09:00 to 12:00</li>
        <li>Driver B – Requesting 13:00 to 15:00</li>
      </ul>
    `;
  
    container.append(stats, requests);
    document.body.appendChild(container);
  });
  
