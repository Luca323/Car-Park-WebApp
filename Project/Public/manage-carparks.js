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
  
    // Loads car parks from DB
    let carParks = [];

    fetch('http://localhost:8080/api/carparks')
      .then(res => res.json())
      .then(data => {
        carParks = data;
        updateDropdown();
      })
      .catch(err => console.error('Error loading car parks:', err));
      
    let editingIndex = null;
  
  
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
        option.textContent = `${park.Name}`;
        carParkSelect.appendChild(option);
      });
    }
  
    addBtn.onclick = async () => {
      const name = nameInput.value.trim();
      const size = parseInt(spaceInput.value.trim(), 10);
    
      if (!name || isNaN(size) || size <= 0) {
        alert("Invalid input");
        return;
      }
    
      if (editingIndex !== null) {
        // We're updating an existing car park
        const selected = carParks[editingIndex];
    
        try {
          const res = await fetch(`http://localhost:8080/api/carparks/${selected.CarparkID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, size })
          });
    
          if (res.ok) {
            carParks[editingIndex].Name = name;
            carParks[editingIndex].Size = size;
            alert("Car park updated");
          } else {
            const data = await res.json();
            alert(data.error || "Update failed");
          }
        } catch (err) {
          console.error("Update error:", err);
        }
    
        editingIndex = null;
      } else {
        // We're adding a new car park
        try {
          const res = await fetch('http://localhost:8080/api/carparks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, size })
          });
    
          const data = await res.json();
    
          if (res.ok) {
            carParks.push({ CarparkID: data.CarparkID, Name: name, Size: size });
            alert("Car park added");
          } else {
            alert(data.error || "Add failed");
          }
        } catch (err) {
          console.error("Add error:", err);
        }
      }
    
      nameInput.value = '';
      spaceInput.value = '';
      updateDropdown();
    };
  
    //Edit button frontend functionality
    editBtn.onclick = () => {
      const selectedIndex = carParkSelect.value;
      if (selectedIndex === "") return;
    
      const selected = carParks[selectedIndex];
      nameInput.value = selected.Name; // case-sensitive: match DB column
      spaceInput.value = selected.Size;
      editingIndex = selectedIndex;
    };
  
    // Deletes selected car park & removes associated spaces
    deleteBtn.onclick = async () => {
      const selectedIndex = carParkSelect.value;
      if (selectedIndex === "") return;
    
      if (!confirm("Are you sure?")) return;
    
      const park = carParks[selectedIndex];
    
      try {
        const res = await fetch(`http://localhost:8080/api/carparks/${park.CarparkID}`, {
          method: 'DELETE'
        });
    
        if (res.ok) {
          carParks.splice(selectedIndex, 1);
          updateDropdown();
          alert("Car park and spaces deleted");
        } else {
          const data = await res.json();
          alert(data.error || "Delete failed");
        }
      } catch (err) {
        console.error('Delete error:', err);
      }
    };
  
    // Initialises dropdown with existing car parks
    updateDropdown();
  });