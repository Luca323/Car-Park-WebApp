window.addEventListener("DOMContentLoaded", () => {
  // Creating and appending the header and nav bar
  const header = document.createElement("header");
  header.innerHTML = `<h1>Admin Dashboard</h1>`;
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

  // Creating the main dashboard container
  const container = document.createElement("div");
  container.className = "dashboard";
  document.body.appendChild(container);

// Creating the sections for dashboard info
  const summarySection = document.createElement("div");
  summarySection.className = "section";
  container.appendChild(summarySection);

  const breakdownSection = document.createElement("div");
  breakdownSection.className = "section";
  container.appendChild(breakdownSection);

  const requestsSection = document.createElement("div");
  requestsSection.className = "section";
  container.appendChild(requestsSection);

  const spaceListSection = document.createElement("div");
  spaceListSection.className = "section";
  container.appendChild(spaceListSection);

  // Function that gets the current parking space stats (from localstorage - will be DB tho)
  async function getStats() {
    try {
      const res = await fetch('http://localhost:8080/api/spaces');
  
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
  
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
  
      const spaces = await res.json();
      console.log("Fetched spaces:", spaces);
  
      const total = spaces.length;
      const available = spaces.filter(s => !s.Occupied && s.UserID === null).length;
      const occupied = spaces.filter(s => s.Occupied && s.UserID !== null).length;
  
      //Temporary placeholder
      const reserved = 0;
      const blocked = 0;
  
      return { total, available, blocked, reserved, occupied, spaces };
    } catch (err) {
      console.error("getStats() error:", err);
      return { total: 0, available: 0, blocked: 0, reserved: 0, occupied: 0, spaces: [] };
    }
  }

  //Function to update the dashboard summary & breakdown info
  async function updateDashboard() {
    const { total, available, blocked, reserved, occupied, spaces } = await getStats();
  
    summarySection.innerHTML = `
      <h2>Space Summary</h2>
      <ul>
        <li><strong>Total:</strong> ${total}</li>
        <li><strong>Available:</strong> ${available}</li>
        <li><strong>Blocked:</strong> ${blocked}</li>
        <li><strong>Reserved:</strong> ${reserved}</li>
        <li><strong>Occupied:</strong> ${occupied}</li>
      </ul>
    `;
  
    //Group spaces by Carpark
    const byCarPark = {};
  
    spaces.forEach(space => {
      const carparkId = space.CarparkID;
  
      if (!byCarPark[carparkId]) {
        byCarPark[carparkId] = { available: 0, blocked: 0, reserved: 0, occupied: 0 };
      }
  
      // Determine status
      let status = "available";
      if (space.Occupied && space.UserID !== null) {
        status = "occupied";
      }
  
      // Add to breakdown
      byCarPark[carparkId][status]++;
    });
  
    // Display breakdown
    breakdownSection.innerHTML = `<h2>Car Park Breakdown</h2>`;
    const ul = document.createElement("ul");
  
    for (const [id, stats] of Object.entries(byCarPark)) {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>Carpark ID ${id}</strong> —
        ${stats.available} available,
        ${stats.blocked} blocked,
        ${stats.reserved} reserved,
        ${stats.occupied} occupied
      `;
      ul.appendChild(li);
    }
  
    breakdownSection.appendChild(ul);
  }


  // Function to display pending parking requests & allow the admin to accept/reject them
  function updateRequests() {
    const requests = JSON.parse(localStorage.getItem("parkingRequests")) || [];
    const spaces = JSON.parse(localStorage.getItem("spaces")) || [];
  
    const pendingRequests = requests.filter(req => req.status === "pending");
  
    requestsSection.innerHTML = `<h2>Parking Requests</h2>`;
  
    if (pendingRequests.length === 0) {
      requestsSection.innerHTML += `<p>No pending parking requests.</p>`;
      return;
    }
  
    const list = document.createElement("ul");
  
    pendingRequests.forEach((req, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>Request ID:</strong> ${req.id}<br>
        <strong>Car Park:</strong> ${req.carPark}<br>
        <strong>Date:</strong> ${new Date(req.startDate).toLocaleString()} → ${new Date(req.endDate).toLocaleString()}<br>
        <strong>Cost:</strong> £${req.cost}<br>
        <strong>Status:</strong> ${req.status.toUpperCase()}<br>
      `;
  
      // Logic for the accept button
      const acceptBtn = document.createElement("button");
      acceptBtn.textContent = "Accept";
      acceptBtn.onclick = () => {
        const availableSpaces = spaces.filter(s => s.carPark === req.carPark && s.status === "available");
  
        if (availableSpaces.length === 0) {
          alert(`No available spaces in ${req.carPark} to assign.`);
          return;
        }
  
        // Assigns the driver the first available space
        const assignedSpace = availableSpaces[0];
        assignedSpace.status = "reserved";
  
        req.status = "accepted";
        req.spaceId = assignedSpace.id;
  
        // Updates the space &request in local storage (needs to be updated to DB)
        spaces.forEach((s, index) => {
          if (s.id === assignedSpace.id) {
            spaces[index] = assignedSpace;
          }
        });
  
        const allRequests = JSON.parse(localStorage.getItem("parkingRequests")) || [];
        const indexInStorage = allRequests.findIndex(r => r.id === req.id);
        if (indexInStorage !== -1) {
          allRequests[indexInStorage] = req;
          localStorage.setItem("parkingRequests", JSON.stringify(allRequests));
        }
  
        localStorage.setItem("spaces", JSON.stringify(spaces));
        updateDashboard();
        updateRequests();
      };
  
      // Logic for the reject button
      const rejectBtn = document.createElement("button");
      rejectBtn.textContent = "Reject";
      rejectBtn.onclick = () => {
        req.status = "rejected";
  
        const allRequests = JSON.parse(localStorage.getItem("parkingRequests")) || [];
        const indexInStorage = allRequests.findIndex(r => r.id === req.id);
        if (indexInStorage !== -1) {
          allRequests[indexInStorage] = req;
          localStorage.setItem("parkingRequests", JSON.stringify(allRequests));
        }
  
        updateRequests();
      };
  
      li.appendChild(acceptBtn);
      li.appendChild(rejectBtn);
  
      list.appendChild(li);
    });
  
    requestsSection.appendChild(list);
  }

  // Function to display the full list of spaces with their status
  function updateSpaceList() {
    const { spaces } = getStats();
    spaceListSection.innerHTML = "<h2>Space List</h2>";
    const list = document.createElement("ul");

    spaces.forEach(space => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${space.id}</strong> — ${space.carPark} — ${space.status.toUpperCase()}
        ${space.reason ? `(Reason: ${space.reason})` : ""}
      `;
      list.appendChild(li);
    });

    spaceListSection.appendChild(list);
  }

  // Initial load of dashboard, requests, and the space list
  updateDashboard();
  updateRequests();
  updateSpaceList();
});