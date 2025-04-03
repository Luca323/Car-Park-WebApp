window.addEventListener("DOMContentLoaded", () => {
  // Creating and appending the header and nav bar
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

  // Creating main container & event section
  const container = document.createElement("div");
  container.className = "dashboard";
  document.body.appendChild(container);

  const section = document.createElement("div");
  section.className = "section";
  section.innerHTML = `<h2>📅 Schedule New Event</h2>`;

  // Car park selection dropdown
  const carParkSelect = document.createElement("select");
  carParkSelect.className = "event-input";

  // Loads car parks from local storage (needs to be DB)
  const carParks = JSON.parse(localStorage.getItem("carParks")) || [];
  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Select a Car Park";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  defaultOption.value = "";
  carParkSelect.appendChild(defaultOption);

  // Appends existing car parks to the dropdown
  carParks.forEach(park => {
    const opt = document.createElement("option");
    opt.value = park.name;
    opt.textContent = park.name;
    carParkSelect.appendChild(opt);
  });

  // Creating input fields for the event data
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.placeholder = "Event Title";
  titleInput.className = "text-input";

  const startDateInput = document.createElement("input");
  startDateInput.type = "datetime-local";

  const endDateInput = document.createElement("input");
  endDateInput.type = "datetime-local";

  const noteInput = document.createElement("textarea");
  noteInput.placeholder = "Event Description";
  noteInput.className = "text-input";

  const reserveInput = document.createElement("input");
  reserveInput.type = "number";
  reserveInput.placeholder = "Spaces to reserve (optional)";
  reserveInput.className = "text-input";

  // Button to submit event
  const addBtn = document.createElement("button");
  addBtn.textContent = "Create Event";

  // List for existing events
  const eventList = document.createElement("ul");

  // Appends all inputs & button to event section
  section.append(
    carParkSelect,
    titleInput, startDateInput, endDateInput,
    noteInput, reserveInput, addBtn,
    document.createElement("hr"),
    eventList
  );

  container.appendChild(section);

  // Functions to load & save events to local storage (needs to be DB)
  function loadEvents() {
    return JSON.parse(localStorage.getItem("events")) || [];
  }

  function saveEvents(events) {
    localStorage.setItem("events", JSON.stringify(events));
  }

  // Function to render a list of scheduled events
  function renderEvents() {
    const events = loadEvents();
    eventList.innerHTML = "";

    if (events.length === 0) {
      eventList.innerHTML = "<li>No events scheduled.</li>";
      return;
    }

    events.forEach((ev, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${ev.title}</strong><br>
        <em>${ev.carPark}</em><br>
        ${new Date(ev.date).toLocaleString()} → ${new Date(ev.endDate).toLocaleString()}<br>
        ${ev.note}<br>
        ${ev.reservedSpaces ? `🔒 ${ev.reservedSpaces} spaces reserved` : ""}
        <br>
      `;

      // Button to delete an event
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.onclick = () => {
        const updated = loadEvents();
        updated.splice(index, 1);
        saveEvents(updated);
        renderEvents();
      };

      li.appendChild(delBtn);
      eventList.appendChild(li);
    });
  }

  // Handles form submission 
  addBtn.onclick = () => {
    const title = titleInput.value.trim();
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const note = noteInput.value.trim();
    const carPark = carParkSelect.value;
    const reservedSpaces = parseInt(reserveInput.value, 10);

    if (!title || !startDate || !endDate || !carPark) {
      alert("Please fill in all required fields including start and end date/time.");
      return;
    }

    // Creates the event object
    const newEvent = {
      id: `event-${Date.now()}`,
      title,
      date: startDate,
      endDate,
      carPark,
      note,
      reservedSpaces: isNaN(reservedSpaces) ? 0 : reservedSpaces
    };

    // Saves the event
    const events = loadEvents();
    events.push(newEvent);
    saveEvents(events);
    renderEvents();

    // Resets form fields
    titleInput.value = "";
    startDateInput.value = "";
    endDateInput.value = "";
    noteInput.value = "";
    carParkSelect.value = "";
    reserveInput.value = "";
  };

  // Initial render of any existing events
  renderEvents();
});