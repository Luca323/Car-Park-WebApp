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
    <a href="/admindashboard">Dashboard</a>
    <a href="/managecarparks">Manage Car Parks</a>
    <a href="/managespaces" class="active">Manage Spaces</a>    
    <a href="/manageevents">Manage Events</a>
    <a href="/manageusers">Manage Users</a>
    <a href="/sendnotif">Send Notifications</a>
    <a href="#" id="logout-link">Logout</a>
  `;
  document.body.appendChild(nav);

  //Creating main container & section
  const container = document.createElement("div");
  container.className = "dashboard";

  const section = document.createElement("div");
  section.className = "section";
  section.innerHTML = `<h2>Block or Unblock Spaces</h2>`;

  //Logout
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

  //Dropdown for selecting car park
  const carParkSelect = document.createElement("select");
  carParkSelect.className = "dropdown";
  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Select a Car Park";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  defaultOption.value = "";
  carParkSelect.appendChild(defaultOption);
  section.appendChild(carParkSelect);
  
  //Dropdown to filter by space status
  const filterSelect = document.createElement("select");
  filterSelect.className = "dropdown";
  ["All", "Available", "Blocked", "Reserved"].forEach(status => {
    const opt = document.createElement("option");
    opt.value = status.toLowerCase();
    opt.textContent = status;
    filterSelect.appendChild(opt);
  });
  section.appendChild(document.createTextNode(" Filter by status: "));
  section.appendChild(filterSelect);

  //Input field to search by Space ID
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search by Space ID";
  section.appendChild(searchInput);

  //List element to show filtered spaces
  const spaceList = document.createElement("ul");
  spaceList.className = "space-list";
  section.appendChild(spaceList);

  //Appends section & container to body
  container.appendChild(section);
  document.body.appendChild(container);

  //Loads car parks from DB
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

  async function fetchSpaces(carparkId) { //Retrieves spaces by carpark ID
    const res = await fetch(`/api/spaces1?carparkId=${carparkId}`);
    return await res.json();
  };

  //Function to render space list based on selected car park & filters
  async function renderSpaces(carParkId, filterStatus = "all") {
    spaceList.innerHTML = "";
  
    let spaces = await fetchSpaces(carParkId);
  
    
    //Filter by status
    if (filterStatus !== "all") {
      spaces = spaces.filter(s => s.Status.toLowerCase() === filterStatus);
    }
  
    //Search logic
    const searchText = searchInput.value.trim().toLowerCase();
    if (searchText !== "") {
      spaces = spaces.filter(s => s.SpaceID.toString().toLowerCase().includes(searchText));
    }
  
    if (spaces.length === 0) {
      spaceList.innerHTML = `<li>No spaces match these filters.</li>`;
      return;
    }
  
    //Render spaces for UI
    spaces.forEach(space => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${space.SpaceID}</strong> — ${space.Status}
        <br/>
      `;
    
      const blockBtn = document.createElement("button");
      blockBtn.textContent = "Block";
      blockBtn.onclick = () => updateSpaceStatus(space.SpaceID, "Blocked"); // Capitalized to match ENUM
    
      const unblockBtn = document.createElement("button");
      unblockBtn.textContent = "Unblock";
      unblockBtn.onclick = () => updateSpaceStatus(space.SpaceID, "Available");
    
      li.appendChild(blockBtn);
      li.appendChild(unblockBtn);
      spaceList.appendChild(li);
    });
  }

  async function updateSpaceStatus(spaceId, status) { //Change status of a space
    const res = await fetch(`/api/spaces/${spaceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, userId: null })
    });
  
    if (res.ok) {
      renderSpaces(carParkSelect.value, filterSelect.value);
    } else {
      const data = await res.json();
      alert("Failed to update space: " + (data.error || "Unknown error"));
    }
  }

  //Saves updates spaces to local storage and refreshes space list (needs to be db)
  async function updateAndRerender(spaceId, newStatus) {
    try {
      const res = await fetch(`/api/spaces/${spaceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, userId: null })
      });
  
      if (!res.ok) {
        const data = await res.json();
        alert("Failed to update space: " + (data.error || "Unknown error"));
      }
  
      await renderSpaces(carParkSelect.value, filterSelect.value);
    } catch (err) {
      console.error("Update failed:", err);
    }
  }

  //Event listeners for dropdowns & search input
  carParkSelect.onchange = () => {
    renderSpaces(carParkSelect.value, filterSelect.value);
  };

  filterSelect.onchange = () => {
    if (carParkSelect.value) {
      renderSpaces(carParkSelect.value, filterSelect.value);
    }
  };

  searchInput.oninput = () => {
    if (carParkSelect.value) {
      renderSpaces(carParkSelect.value, filterSelect.value);
    }
  };
});