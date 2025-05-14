window.addEventListener("DOMContentLoaded", () => {
  // Creating and appending the header and nav bar
  //save
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
    <a href="/admindashboard">Dashboard</a>
    <a href="/managecarparks">Manage Car Parks</a>
    <a href="/managespaces">Manage Spaces</a>    
    <a href="/manageevents" class="active">Manage Events</a>
    <a href="/manageusers">Manage Users</a>
    <a href="/sendnotif">Send Notifications</a>
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

  // Creating main container & event section
  const container = document.createElement("div");
  container.className = "dashboard";
  document.body.appendChild(container);

  const section = document.createElement("div");
  section.className = "section";
  section.innerHTML = `<h2>Schedule New Event</h2>`;

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

  // Car park selection dropdown
  const carParkSelect = document.createElement("select");
  carParkSelect.className = "event-input";

  // Loads car parks from local storage (needs to be DB)
  let carParks = [];

  fetch('/api/carparks')
    .then(res => res.json())
    .then(data => {
      carParks = data;
      data.forEach(park => {
        const option = document.createElement("option");
        option.value = park.CarparkID;
        option.textContent = park.Name;
        carParkSelect.appendChild(option);
      });
    })
    .catch(err => console.error("Failed to load car parks:", err));
  
  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Select a Car Park";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  defaultOption.value = "";
  carParkSelect.appendChild(defaultOption);


  // Creating input fields for the event data
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.placeholder = "Event Title";
  titleInput.className = "text-input";

  const startDateInput = document.createElement("input");
  startDateInput.type = "datetime-local";

  const endDateInput = document.createElement("input");
  endDateInput.type = "datetime-local";

  // Button to submit event
  const addBtn = document.createElement("button");
  addBtn.textContent = "Create Event";

  // List for existing events
  const eventList = document.createElement("ul");

  // Appends all inputs & button to event section
  section.append(
    carParkSelect,
    titleInput, startDateInput, endDateInput,
    addBtn,
    document.createElement("hr"),
    eventList
  );

  container.appendChild(section);

  async function loadEvents() {
    const res = await fetch('/api/events');
    return await res.json();
  }
  
  async function saveEvent({ title, startDate, endDate, carParkId }) {
    const event = {
      EventID: `event-${Date.now()}`,
      Title: title,
      Start: startDate,
      End: endDate,
      CarparkID: carParkId,
      // reservedSpaces: reservedSpaces
    };
  
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
  
    return await res.json();
  }

  // Function to render a list of scheduled events
  async function renderEvents() {
    const events = await loadEvents();
    eventList.innerHTML = "";
  
    if (events.length === 0) {
      eventList.innerHTML = "<li>No events scheduled.</li>";
      return;
    }
  
    events.forEach(ev => {
      const li = document.createElement("li");
      li.innerHTML = `
      <strong>${ev.Title}</strong><br>
      <em>${ev.CarparkName}</em><br>
      ${new Date(ev.Start).toLocaleString()} → ${new Date(ev.End).toLocaleString()}
    `;
  
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.onclick = async () => {
        if (!confirm("Delete this event and release its spaces?")) return;
        await fetch(`/api/events/${ev.EventID}/release`, { method: "POST" });
        await fetch(`/api/events/${ev.EventID}`, { method: "DELETE" });
        renderEvents();
      };

      const blockBtn = document.createElement("button");
      blockBtn.textContent = "Block Spaces";
      blockBtn.onclick = async () => {
        const count = parseInt(prompt("How many spaces to block?"), 10);
        if (!count || count < 1) return alert("Invalid number.");
        const res = await fetch(`/api/events/${ev.EventID}/block`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ count })
        });

        const data = await res.json();
        if (res.ok) {
          alert(data.message);
        } else {
          alert(data.error);
        }
        
      };

      const releaseBtn = document.createElement("button");
      releaseBtn.textContent = "Release Spaces";
      releaseBtn.onclick = async () => {
        const res = await fetch(`/api/events/${ev.EventID}/release`, {
          method: "POST"
        });
        const data = await res.json();
        alert(data.message);
      };

      li.appendChild(blockBtn);
      li.appendChild(releaseBtn);
      li.appendChild(delBtn);
      eventList.appendChild(li);
    });
  }

  // Handles form submission 
  addBtn.onclick = async () => {
    const title = titleInput.value.trim();
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const carParkId = carParkSelect.value;
    
  
    if (!title || !startDate || !endDate || !carParkId) {
      alert("Please fill in all required fields.");
      return;
    }
  
    const result = await saveEvent({
      title,
      startDate,
      endDate,
      carParkId,
    });
  
    if (result.message) {
      alert(result.message);
      renderEvents(); // refresh the list
    } else {
      alert("Failed to create event.");
      console.error(result);
    }
  
    // Reset form fields
    titleInput.value = "";
    startDateInput.value = "";
    endDateInput.value = "";
    carParkSelect.value = "";
  };

  // Initial render of any existing events
  renderEvents();
  
});