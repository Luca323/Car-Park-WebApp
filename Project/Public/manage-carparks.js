window.addEventListener("DOMContentLoaded", () => {
    // Creating and appending the header and nav bar
    const header = document.createElement("header");
    header.innerHTML = `<h1>Manage Car Parks</h1>`;
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
  
    // Creating the main container & form section
    const container = document.createElement("div");
    container.className = "dashboard";
  
    const section = document.createElement("div");
    section.className = "section";
    section.innerHTML = `<h2>Add or Edit Car Parks</h2>`;
  
    // Creating the input fields for form
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Car Park Name";
  
    const spaceInput = document.createElement("input");
    spaceInput.type = "number";
    spaceInput.placeholder = "Number of Spaces";
  
    // Creating the action buttons
    const addBtn = document.createElement("button");
    addBtn.className = "btn";
    addBtn.textContent = "Add Car Park";
  
    const carParkSelect = document.createElement("select");
    carParkSelect.className = "dropdown";
  
    const editBtn = document.createElement("button");
    editBtn.className = "btn";
    editBtn.textContent = "Edit Selected";
  
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn";
    deleteBtn.textContent = "Delete Selected";
  
    // Assembling & Appending section
    section.appendChild(nameInput);
    section.appendChild(spaceInput);
    section.appendChild(addBtn);
    section.appendChild(document.createElement("br"));
    section.appendChild(carParkSelect);
    section.appendChild(editBtn);
    section.appendChild(deleteBtn);
  
    container.appendChild(section);
    document.body.appendChild(container);
  
    // Loads car parks from local storage (needs to be DB)
    let carParks = JSON.parse(localStorage.getItem("carParks")) || [];
    let editingIndex = null;
  
    // Function to save updated car parks to local storage (needs to be db)
    function saveCarParks() {
      localStorage.setItem("carParks", JSON.stringify(carParks));
    }
  
    // Function ot save updates spaces to local storage (needs to be db)
    function saveSpaces(spaces) {
      localStorage.setItem("spaces", JSON.stringify(spaces));
    }

    // Function to validate & return a usable array of parking spaces
    function getValidSpacesArray() {
      try {
        const stored = JSON.parse(localStorage.getItem("spaces"));
        if (Array.isArray(stored)) return stored;
      } catch (e) {
        console.warn("Invalid 'spaces' data in localStorage. Resetting.");
      }
      return [];
    }
  
    // Dropdown of car parks
    function updateDropdown() {
      carParkSelect.innerHTML = "";
      const placeholder = document.createElement("option");
      placeholder.textContent = "Select a car park";
      placeholder.disabled = true;
      placeholder.selected = true;
      placeholder.value = "";
      carParkSelect.appendChild(placeholder);
  
      carParks.forEach((park, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `${park.name} (${park.spaces} spaces)`;
        carParkSelect.appendChild(option);
      });
    }
  
    // Add or update car park
    addBtn.onclick = () => {
      console.log("Add clicked");
  
      const name = nameInput.value.trim();
      const spaces = parseInt(spaceInput.value.trim(), 10);
  
      if (!name || isNaN(spaces) || spaces <= 0) {
        alert("Please enter a valid name and number of spaces.");
        return;
      }
  
      let allSpaces = getValidSpacesArray();
  
      if (editingIndex !== null) {
        const oldName = carParks[editingIndex].name;
  
        // Remove old spaces for car park being edited
        allSpaces = allSpaces.filter(space => space.carPark !== oldName);
  
        // Update the car park
        carParks[editingIndex] = { name, spaces };
        editingIndex = null;
      } else { // Add new car park
        carParks.push({ name, spaces });
      }
  
      // Add new spaces
      for (let i = 1; i <= spaces; i++) {
        allSpaces.push({
          id: `${name}-A${i}`,
          status: "available",
          carPark: name,
        });
      }
  
      saveCarParks();
      saveSpaces(allSpaces);
      updateDropdown();
  
      nameInput.value = "";
      spaceInput.value = "";
    };
  
    // Loads selected car park values into form inputs for editing
    editBtn.onclick = () => {
      const selectedIndex = carParkSelect.value;
      if (selectedIndex === "") return;
  
      const selected = carParks[selectedIndex];
      nameInput.value = selected.name;
      spaceInput.value = selected.spaces;
      editingIndex = selectedIndex;
    };
  
    // Deletes selected car park & removes associated spaces
    deleteBtn.onclick = () => {
      const selectedIndex = carParkSelect.value;
      if (selectedIndex === "") return;
  
      if (!confirm("Are you sure you want to delete this car park?")) return;
  
      const removed = carParks.splice(selectedIndex, 1)[0];
      editingIndex = null;
      saveCarParks();
      updateDropdown();
  
      // Remove all associated spaces
      const allSpaces = getValidSpacesArray();
      const filteredSpaces = allSpaces.filter(space => space.carPark !== removed.name);
      saveSpaces(filteredSpaces);
  
      nameInput.value = "";
      spaceInput.value = "";
    };
  
    // Initialises dropdown with existing car parks
    updateDropdown();
  });