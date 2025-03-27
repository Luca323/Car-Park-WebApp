window.addEventListener("DOMContentLoaded", () => {
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
  
    const container = document.createElement("div");
    container.className = "dashboard";
  
    const section = document.createElement("div");
    section.className = "section";
    section.innerHTML = `<h2>Add or Edit Car Parks</h2>`;

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Car Park Name";
    
    const spaceInput = document.createElement("input");
    spaceInput.type = "number";
    spaceInput.placeholder = "Number of Spaces";

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

    const carParks = []; // in-memory list of car parks

    function updateDropdown() {
        carParkSelect.innerHTML = "";
        const defaultOption = document.createElement("option");
        defaultOption.textContent = "-- Select a Car Park --";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.value = "";
        carParkSelect.appendChild(defaultOption);

        carParks.forEach((park, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `${park.name} (${park.spaces} spaces)`;
        carParkSelect.appendChild(option);
        });
    }
    updateDropdown();

    addBtn.onclick = () => {
        const name = nameInput.value.trim();
        const spaces = parseInt(spaceInput.value.trim(), 10);

        if (!name || isNaN(spaces) || spaces <= 0) {
        alert("Please enter a valid name and number of spaces.");
        return;
        }

        carParks.push({ name, spaces });
        updateDropdown();
        nameInput.value = "";
        spaceInput.value = "";
    };

    editBtn.onclick = () => {
        const selectedIndex = carParkSelect.value;
        if (!selectedIndex) return;

        const selected = carParks[selectedIndex];
        nameInput.value = selected.name;
        spaceInput.value = selected.spaces;

        // temp remove to allow update on re-add
        carParks.splice(selectedIndex, 1);
        updateDropdown();
    };

    deleteBtn.onclick = () => {
        const selectedIndex = carParkSelect.value;
        if (!selectedIndex) return;

        carParks.splice(selectedIndex, 1);
        updateDropdown();
    };

    section.append(nameInput, spaceInput, addBtn);
    section.append(document.createElement("hr"));
    section.append(carParkSelect, editBtn, deleteBtn);
    container.appendChild(section);
    document.body.appendChild(container);
    });


    