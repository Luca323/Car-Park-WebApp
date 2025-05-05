window.addEventListener("DOMContentLoaded", () => {
    // Creating and appending the header and nav bar
    const header = document.createElement("header");
    header.innerHTML = `<h1>ParkEase Dashboard</h1>`;
    document.body.appendChild(header);
  
    const nav = document.createElement("nav");
    nav.innerHTML = `
      <a href="/driverdashboard">Dashboard</a>
      <a href="/bookparking">Book Parking</a>
      <a href="/contactus">Contact Us</a>
    `;
    document.body.appendChild(nav);
  
    // Creating & Appending the main container for the dashboard
    const container = document.createElement("div");
    container.className = "dashboard";
    document.body.appendChild(container);
  
    // Creating & Appending Sections
    const currentSection = document.createElement("div");
    currentSection.className = "section";
    currentSection.innerHTML = "<h2>Current Parking Sessions</h2>";
    const currentList = document.createElement("ul");
    currentSection.appendChild(currentList);
    container.appendChild(currentSection);
  
    const upcomingSection = document.createElement("div");
    upcomingSection.className = "section";
    upcomingSection.innerHTML = "<h2>Upcoming Parking Sessions</h2>";
    const upcomingList = document.createElement("ul");
    upcomingSection.appendChild(upcomingList);
    container.appendChild(upcomingSection);
  
    const pendingSection = document.createElement("div");
    pendingSection.className = "section";
    pendingSection.innerHTML = "<h2>Pending Parking Requests</h2>";
    const pendingList = document.createElement("ul");
    pendingSection.appendChild(pendingList);
    container.appendChild(pendingSection);
  
    const pastSection = document.createElement("div");
    pastSection.className = "section";
    pastSection.innerHTML = "<h2>Recent Past Sessions</h2>";
    const pastList = document.createElement("ul");
    pastSection.appendChild(pastList);
    container.appendChild(pastSection);
  
    // Loads all requests from DB
    async function loadRequests() {
      const meRes = await fetch("/api/me");
      const { userID } = await meRes.json();

      const res = await fetch("/api/requests");
      const allRequests = await res.json();

      return allRequests.filter(r => r.UserID === userID);
    }
  
    // Building the UI element for each parking session
    function createSessionItem(request, showNotifyBtn = false) {
        const li = document.createElement("li");
        const now = new Date();
        const start = new Date(request.startDate);
        const end = new Date(request.endDate);
      
        li.innerHTML = `
          <strong>${request.carPark}</strong><br>
          ${start.toLocaleString()} - ${end.toLocaleString()}<br>
          <strong>Status:</strong> ${request.status}<br>
          ${request.spaceId ? `<strong>Space:</strong> ${request.spaceId}<br>` : ""}
          <strong>Cost:</strong> £${request.cost}<br>
        `;
      
        // Add Notify Departure button - only for current accepted sessions
        if (showNotifyBtn && request.status === "accepted") {
          const notifyBtn = document.createElement("button");
          notifyBtn.textContent = "Notify Departure";
      
          notifyBtn.onclick = async () => {
            const now = new Date().toISOString();
            await fetch('api/requests/${request.id}', {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "completed", endDate: now }) 
            });
            
            alert("Departure Recorded");
            location.reload();
          };
          
          li.appendChild(notifyBtn);
        }
      
        // Add Locate Parking Space button - only for upcoming sessions
        const isUpcoming =
          request.status === "accepted" &&
          new Date(r.startDate) > now;
      
        if (!showNotifyBtn && isUpcoming) {
          const locateBtn = document.createElement("button");
          locateBtn.textContent = "Locate Parking Spot";
          locateBtn.onclick = () => {
            const query = encodeURIComponent(request.carPark + " parking");
            const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
            window.open(url, "_blank");
          };
          li.appendChild(locateBtn);
        }
      
        return li;
      }
      
  
    // Function to render each section of the dashboard
    async function renderSessions() {
        const now = new Date();
        const allRequests = await loadRequests();
      
        // Filters current sessions
        const current = allRequests.filter(r =>
          r.status === "accepted" &&
          new Date(r.startDate) <= now &&
          new Date(r.endDate) > now
        );
      
        // Filters upcoming accepted sessions
        const upcoming = allRequests.filter(r =>
          r.status === "accepted" &&
          new Date(r.startDate) > now
        );
      
        // Filters pending sessions
        const pending = allRequests.filter(r => r.status === "pending");
      
        // Filters past sessions 
        const past = allRequests.filter(r =>
          r.status === "completed" ||
          (r.status === "accepted" && new Date(r.endDate) <= now)
        );
      
        past.sort((a, b) => {
          const dateA = new Date(a.endDate || a.startDate);
          const dateB = new Date(b.endDate || b.startDate);
          return dateB - dateA;
        });

        // Takes the 3 most recent past sessions
        const recentPast = past.slice(0, 3);
      
        // Clears & Updates each section
        currentList.innerHTML = "";
        upcomingList.innerHTML = "";
        pendingList.innerHTML = "";
        pastList.innerHTML = "";
      
        if (current.length === 0) {
          currentList.innerHTML = "<li>No active sessions.</li>";
        } else {
          current.forEach(r => currentList.appendChild(createSessionItem(r, true)));
        }
      
        if (upcoming.length === 0) {
          upcomingList.innerHTML = "<li>No upcoming sessions.</li>";
        } else {
          upcoming.forEach(r => upcomingList.appendChild(createSessionItem(r)));
        }
      
        if (pending.length === 0) {
          pendingList.innerHTML = "<li>No pending requests.</li>";
        } else {
          pending.forEach(r => pendingList.appendChild(createSessionItem(r)));
        }
      
        if (recentPast.length === 0) {
          pastList.innerHTML = "<li>No past sessions.</li>";
        } else {
            recentPast.forEach(r => pastList.appendChild(createSessionItem(r, false)));
        }
      }
  
    // Initial rendering
    renderSessions();
  });