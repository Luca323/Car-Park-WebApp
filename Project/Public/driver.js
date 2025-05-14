window.addEventListener("DOMContentLoaded", () => {
    // Creating and appending the header and nav bar
    const header = document.createElement("header");
    
    const logo = document.createElement("img");
    logo.src = "logo.png";
    logo.className = "logo";
  
    const title = document.createElement("h1");
    title.textContent = "ParkEase";

    const hamburger = document.createElement("i");
    hamburger.className = "fa-solid fa-bars nav-toggle";
    hamburger.id = "hamburger";
  
    header.append(logo, title, hamburger);
    document.body.appendChild(header);
  
    const nav = document.createElement("nav");
    nav.id = "nav-links";
    nav.innerHTML = `
      <a href="/driverdashboard" class="active">Dashboard</a>
      <a href="/bookparking">Book Parking</a>
      <a href="/contactus">Contact Us</a>
      <a href="/account">Account</a>
      <a href="#" id="logout-link">Logout</a>
    `;
    document.body.appendChild(nav);

    const navToggle = document.getElementById("hamburger");
    const navLinks = document.getElementById("nav-links");

    if (navToggle && navLinks) {
      navToggle.addEventListener("click", () => {
        navLinks.classList.toggle("show");

        navToggle.classList.toggle("fa-bars");
        navToggle.classList.toggle("fa-xmark");
      });
    }
  
    //Creating & Appending the main container for the dashboard
    const container = document.createElement("div");
    container.className = "dashboard";
    document.body.appendChild(container);

    const grid = document.createElement("div");
    grid.className = "dashboard-grid";
      
    //Creating & Appending Sections
    const currentSection = document.createElement("div");
    currentSection.className = "section";
    currentSection.innerHTML = "<h2>Current Sessions</h2>";
    const currentList = document.createElement("ul");
    currentSection.appendChild(currentList);
  
    const upcomingSection = document.createElement("div");
    upcomingSection.className = "section";
    upcomingSection.innerHTML = "<h2>Upcoming Sessions</h2>";
    const upcomingList = document.createElement("ul");
    upcomingSection.appendChild(upcomingList);
    
    const pendingSection = document.createElement("div");
    pendingSection.className = "section";
    pendingSection.innerHTML = "<h2>Pending Parking Requests</h2>";
    const pendingList = document.createElement("ul");
    pendingSection.appendChild(pendingList);
    
    const pastSection = document.createElement("div");
    pastSection.className = "section";
    pastSection.innerHTML = "<h2>Recent Past Sessions</h2>";
    const pastList = document.createElement("ul");
    pastSection.appendChild(pastList);
  
    grid.append(currentSection, upcomingSection, pendingSection, pastSection);
    container.appendChild(grid);

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

    //Loads all requests from DB
    async function loadRequests() {
      const meRes = await fetch("/api/me");
      const { userID } = await meRes.json();
      console.log("Logged-in user ID:", userID);

      const res = await fetch("/api/requests");
      const allRequests = await res.json();

      return allRequests.filter(r => r.userID === userID);
    }
  
    //Building the UI element for each parking session
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
      
        //Add Notify Departure button - only for current accepted sessions
        if (showNotifyBtn && request.status === "accepted") {
          const notifyBtn = document.createElement("button");
          notifyBtn.textContent = "Notify Departure";
      
          notifyBtn.onclick = async () => {
            const confirmed = confirm("Are you sure you want to free this space now?");
            if (!confirmed) return;
          
            try {
              const res = await fetch(`/api/requests/${request.id}/departure`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
              });
          
              const data = await res.json();
          
              if (res.ok) {
                alert(data.message || "Departure successfully notified.");
                await renderSessions(); //re-render dashboard instead of reloading
              } else {
                alert("Failed to notify departure: " + (data.error || "Unknown error"));
              }
            } catch (err) {
              console.error("Departure error:", err);
              alert("Network error notifying departure.");
            }
          };
          
          li.appendChild(notifyBtn);
        }
      
        //Add Locate Parking Space button - only for upcoming accepted sessions
        const isUpcoming =
          request.status === "accepted" &&
          new Date(request.startDate) > now;
      
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
      
  
    //Function to render the GUI of each section of the dashboard
    async function renderSessions() {
        const now = new Date();
        const allRequests = await loadRequests();
        window.allRequests = allRequests;
        console.log("ALL REQUESTS", allRequests);
      
        //Filters current sessions
        const current = allRequests.filter(r =>
          r.status?.toLowerCase() === "accepted" &&
          new Date(r.startDate) <= now &&
          new Date(r.endDate) > now
        );
      
        //Filters upcoming accepted sessions
        const upcoming = allRequests.filter(r =>
          r.status?.toLowerCase() === "accepted" &&
          new Date(r.startDate) > now
        );
        console.log("Upcoming sessions:", upcoming);
      
        //Filters pending sessions
        const pending = allRequests.filter(r => r.status === "pending");
      
        //Filters past sessions 
        const past = allRequests.filter(r =>
          r.status?.toLowerCase() === "completed" ||
          (r.status?.toLowerCase() === "accepted" && new Date(r.endDate) <= now)
        );
      
        past.sort((a, b) => {
          const dateA = new Date(a.endDate || a.startDate);
          const dateB = new Date(b.endDate || b.startDate);
          return dateB - dateA;
        });

        //Takes the 3 most recent past sessions
        const recentPast = past.slice(0, 3);
      
        //Clears & Updates each section
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
  
    //Initial render
    renderSessions();
  });