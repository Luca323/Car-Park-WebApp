window.addEventListener("DOMContentLoaded", () => {
  // Creating and appending the header and nav bar
  const header = document.createElement("header");
  header.innerHTML = `<h1>Admin Dashboard</h1>`;
  document.body.appendChild(header);

  const nav = document.createElement("nav");
  nav.innerHTML = `
    <a href="/admindashboard">Dashboard</a>
    <a href="/managecarparks">Manage Car Parks</a>
    <a href="/managespaces">Manage Spaces</a>
    <a href="/manageevents">Manage Events</a>
    <a href="/sendnotif">Send Notifications</a>
    <a href="#" id="logout-link">Logout</a>
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

  // Function that gets the current parking space stats 
  async function getStats() {
    try {
      const res = await fetch(`http://localhost:8080/api/spaces`);
  
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
  
      const available = spaces.filter(s =>
        (s.Status === 'Available') && s.UserID === null
      ).length;
  
      const occupied = spaces.filter(s =>
        s.Status === 'Occupied' && s.UserID !== null
      ).length;
  
      const reserved = spaces.filter(s =>
        s.Status === 'Reserved'
      ).length;
  
      const blocked = spaces.filter(s =>
        s.Status === 'Blocked'
      ).length;
  
      return { total, available, blocked, reserved, occupied, spaces };
    } catch (err) {
      console.error("getStats() error:", err);
      return { total: 0, available: 0, blocked: 0, reserved: 0, occupied: 0, spaces: [] };
    }
  }

  //Function to update the dashboard summary & breakdown info
  async function updateDashboard() {
    await fetch("/api/cleanup-expired", { method: "POST" });
    const [spacesRes, requestsRes] = await Promise.all([
      fetch("/api/spaces"),
      fetch("/api/requests")
    ]);
  
    const spaces = await spacesRes.json();
    const requests = await requestsRes.json();
    const now = new Date();
  
    let available = 0, blocked = 0, reserved = 0, occupied = 0;
    const total = spaces.length;
    const byCarPark = {};

    for (const space of spaces) {
      const name = `${space.CarparkName} (ID: ${space.CarparkID})`;
    
      if (!byCarPark[name]) {
        byCarPark[name] = { available: 0, blocked: 0, reserved: 0, occupied: 0 };
      }
    
      let status = space.Status;
    
      // Check if the space has an accepted, now-active session
      const activeRequest = requests.find(r =>
        r.spaceId === space.SpaceID &&
        r.status === "accepted" &&
        new Date(r.startDate) <= now &&
        new Date(r.endDate) > now
      );
    
      if (status === "Reserved" && activeRequest) {
        status = "Occupied";
    
        await fetch(`/api/spaces/${space.SpaceID}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Occupied", userId: activeRequest.UserID })
        });
      }
    
      switch (status) {
        case "Available": available++; byCarPark[name].available++; break;
        case "Blocked": blocked++; byCarPark[name].blocked++; break;
        case "Reserved": reserved++; byCarPark[name].reserved++; break;
        case "Occupied": occupied++; byCarPark[name].occupied++; break;
      }
    }

  
    breakdownSection.innerHTML = `<h2>Car Park Breakdown</h2>`;
    const ul = document.createElement("ul");
  
    for (const [name, stats] of Object.entries(byCarPark)) {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${name}</strong> —
        ${stats.available} available,
        ${stats.blocked} blocked,
        ${stats.reserved} reserved,
        ${stats.occupied} occupied
      `;
      ul.appendChild(li);
    }
  
    breakdownSection.appendChild(ul);
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
  }


  // Function to display pending parking requests & allow the admin to accept/reject them
  async function updateRequests() {
    requestsSection.innerHTML = `<h2>Parking Requests</h2>`;
    try {
      const[requestsRes, spacesRes] = await Promise.all([
        fetch(`http://localhost:8080/api/requests`),
        fetch(`http://localhost:8080/api/spaces`)
      ]);
      
      const requests = await requestsRes.json();
      const spaces = await spacesRes.json();
      const pending = requests.filter(r => r.status === "pending");

      if (pending.length === 0) {
        requestsSection.innerHTML += `<p>No pending parking requests.</p>`;
        return;
      }

      const list = document.createElement("ul");
  
      pending.forEach(req => {
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
        acceptBtn.onclick = async () => {
          const available = spaces.filter(s => s.CarparkName === req.carPark && 
            s.Status === "Available" &&
            s.UserID === null);
    
          if (available.length === 0) {
            alert(`No available spaces in ${req.carPark} to assign.`);
            return;
          }
        
          // Assigns the driver the first available space
          const assigned = available[0];

          await fetch(`http://localhost:8080/api/requests/${req.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ status: "accepted", spaceId: assigned.SpaceID})
          });

          await fetch(`http://localhost:8080/api/spaces/${assigned.SpaceID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Reserved" })
          });

          alert("Request accepted and space reserved");
          await updateDashboard();
          await updateRequests();
        };
  
  
      // Logic for the reject button
      const rejectBtn = document.createElement("button");
      rejectBtn.textContent = "Reject";
      rejectBtn.onclick = async () => {
        await fetch(`http://localhost:8080/api/requests/${req.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json"},
          body: JSON.stringify({ status: "rejected"})
        });
        alert("Request rejected");
        await updateRequests();
        await updateDashboard();
      };

      li.appendChild(acceptBtn);
      li.appendChild(rejectBtn);
      list.appendChild(li);
    });
  
    requestsSection.appendChild(list);
  } catch (err) {
    console.error("Error updating requests:", err);
  }
}

  // Function to display the full list of spaces with their status
  async function updateSpaceList() {
    const { spaces } = await getStats();
    spaceListSection.innerHTML = "<h2>Space List</h2>";
    const list = document.createElement("ul");
  
    spaces.forEach(space => {
      const status = space.Status ? space.Status.toUpperCase() : (space.Occupied ? 'OCCUPIED' : 'AVAILABLE');
      
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>Space ${space.SpaceID}</strong> — ${space.CarparkName} — <em>${status}</em>
      `;
      list.appendChild(li);
    });
  
    spaceListSection.appendChild(list);
  }

  // Initial load of dashboard, requests, and the space list
  (async () => {
    updateDashboard();
    updateRequests();
    updateSpaceList();
  })();
});