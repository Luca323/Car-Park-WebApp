window.addEventListener("DOMContentLoaded", () => {
  // Creating and appending the header and nav bar
  const header = document.createElement("header");

  const logo = document.createElement("img");
  logo.src = "logo.png";
  logo.className = "logo";

  const title = document.createElement("h1");
  title.textContent = "ParkEase";

  header.append(logo, title);
  document.body.appendChild(header);

  const nav = document.createElement("nav");
  nav.innerHTML = `
    <a href="/admindashboard" class="active">Dashboard</a>
    <a href="/managecarparks">Manage Car Parks</a>
    <a href="/managespaces">Manage Spaces</a>
    <a href="/manageevents">Manage Events</a>
    <a href="/manageusers">Manage Users</a>
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

      const activeRequest = requests.find(r => {
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
      
        return (
          r.SpaceID === space.SpaceID &&
          r.status === "accepted" &&
          start <= now &&
          now < end
        );
      });

      if (space.Status === "Reserved" && activeRequest) {
        await fetch(`/api/spaces/${space.SpaceID}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Occupied", userId: Number(activeRequest.userID) })
        });
        space.Status = "Occupied";
      }

      if (space.Status === "Occupied") {
        const expiredRequest = requests.find(r =>
          r.SpaceID === space.SpaceID &&
          r.status === "accepted" &&
          new Date(r.endDate) <= now
        );

        if (expiredRequest) {
          await fetch(`/api/spaces/${space.SpaceID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Available", userId: null })
          });
      
          await fetch(`/api/requests/${expiredRequest.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "completed", endDate: expiredRequest.endDate })
          });
      
          space.Status = "Available";
        }
      }

      switch (space.Status) {
        case "Available": available++; byCarPark[name].available++; break;
        case "Blocked": blocked++; byCarPark[name].blocked++; break;
        case "Reserved": reserved++; byCarPark[name].reserved++; break;
        case "Occupied": occupied++; byCarPark[name].occupied++; break;
      }
    }

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
  }

  async function updateRequests() {
    requestsSection.innerHTML = `<h2>Parking Requests</h2>`;
    try {
      const [requestsRes, spacesRes] = await Promise.all([
        fetch("/api/requests"),
        fetch("/api/spaces")
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

          const assigned = available[0];

          await fetch(`/api/requests/${req.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "accepted", spaceId: assigned.SpaceID })
          });

          await fetch(`/api/spaces/${assigned.SpaceID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Reserved", userId: null })
          });

          alert("Request accepted and space reserved");
          await updateDashboard();
          await updateRequests();
        };

        const rejectBtn = document.createElement("button");
        rejectBtn.textContent = "Reject";
        rejectBtn.onclick = async () => {
          await fetch(`/api/requests/${req.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "rejected" })
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

  async function updateSpaceList() {
    const spacesRes = await fetch("/api/spaces");
    const spaces = await spacesRes.json();
  
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
  (async () => {
    await updateDashboard();
    await updateRequests();
    await updateSpaceList();

    setInterval(() => {
      updateDashboard();
      updateSpaceList();
    }, 15* 1000);
  })();
});