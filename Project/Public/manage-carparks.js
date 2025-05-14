window.addEventListener("DOMContentLoaded", () => {
    //Creating and appending the header and nav bar
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
      <a href="/managecarparks" class="active">Manage Car Parks</a>
      <a href="/managespaces">Manage Spaces</a>
      <a href="/manageevents">Manage Events</a>
      <a href="/manageusers">Manage Users</a>
      <a href="/sendnotif">Send Notifications</a>
      <a href="#" id="logout-link">Logout</a>
    `;
    document.body.appendChild(nav);
  
    //Creating the main container & form section
    const container = document.createElement("div");
    container.className = "dashboard";
  
    const section = document.createElement("div");
    section.className = "section";
    section.innerHTML = `<h2>Add or Edit Car Parks</h2>`;

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
  
    //Creating the input fields for form
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Car Park Name";
  
    const spaceInput = document.createElement("input");
    spaceInput.type = "number";
    spaceInput.placeholder = "Number of Spaces";
  
    //Creating the action buttons
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
  
    //Assembling & Appending section
    section.appendChild(nameInput);
    section.appendChild(spaceInput);
    section.appendChild(addBtn);
    section.appendChild(document.createElement("br"));
    section.appendChild(carParkSelect);
    section.appendChild(editBtn);
    section.appendChild(deleteBtn);
  
    container.appendChild(section);
    document.body.appendChild(container);
  
    //Loads car parks from DB
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
  
    addBtn.onclick = async () => { //Button to create new carpark
      const name = nameInput.value.trim();
      const size = parseInt(spaceInput.value.trim(), 10);
    
      if (!name || isNaN(size) || size <= 0) {
        alert("Invalid input");
        return;
      }
    
      if (editingIndex !== null) { //Checks if were adding a new carpark or updating an existing one

        const selected = carParks[editingIndex]; //selects carpark to be edited
    
        try {
          const res = await fetch(`./api/carparks/${selected.CarparkID}`, { //backend handler
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
        //Adding a new car park
        try {
          const res = await fetch('./api/carparks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, size })
          });
    
          const data = await res.json();
    
          if (res.ok) {
            carParks.push({ CarparkID: data.CarparkID, Name: name, Size: size });
            alert("Car park added");
            location.reload();
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
      nameInput.value = selected.Name; //case-sensitive: match DB column
      spaceInput.value = selected.Size;
      editingIndex = selectedIndex;
    };
  
    //Deletes selected car park & removes associated spaces
    deleteBtn.onclick = async () => {
      const selectedIndex = carParkSelect.value;
      if (selectedIndex === "") return;
    
      if (!confirm("Are you sure?")) return;
    
      const park = carParks[selectedIndex];
    
      try {
        const res = await fetch(`./api/carparks/${park.CarparkID}`, {
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
  
    //Initialises dropdown with existing car parks
    updateDropdown();
  });