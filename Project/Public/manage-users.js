window.addEventListener("DOMContentLoaded", () => {
  //Header & nav bar
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
    <a href="/manageevents">Manage Events</a>
    <a href="/manageusers" class="active">Manage Users</a>
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


  //Logout logic 
  document.getElementById("logout-link").addEventListener("click", async (e) => {
    e.preventDefault();
    await fetch("/logout", { method: "POST", credentials: "include" });
    location.href = "/";
  });

  //Main container
  const container = document.createElement("div"); container.className = "dashboard";
  document.body.appendChild(container);

  const section = document.createElement("div"); section.className = "section";  
  section.innerHTML = `
  <h2>Manage Users</h2>
  <input type="text" 
  id="user-search" 
  placeholder="Search by username or email..." 
  class="text-input">
  `;
  container.appendChild(section);

  //Build table for users
  const table = document.createElement("table");
  table.className = "user-table";
  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th>User ID</th>
      <th>Username</th>
      <th>Email</th>
      <th>Type</th>
      <th>Phone</th>
      <th>Car Reg</th>
      <th>Verified</th>
      <th>Actions</th>
    </tr>
  `;
  table.appendChild(thead);
  const tbody = document.createElement("tbody");
  section.appendChild(table);
  table.appendChild(tbody);
  //Fetch & render users into table
  async function loadUsers() {
    try {
      const res = await fetch("/api/users", { credentials: "include" });
      if (!res.ok) {
        console.error("Failed to load users:", res.status);
        section.innerHTML += `<p class="error">Error loading users: ${res.status}</p>`;
        return;
      }
      const users = await res.json();

      // search table
      const searchInput = document.getElementById("user-search");

      function renderFilteredUsers(filter = "") {
        const lower = filter.toLowerCase();
        const filtered = users.filter(u =>
          u.Username.toLowerCase().includes(lower) ||
          u.Email.toLowerCase().includes(lower)
        );

        tbody.innerHTML = filtered.length
          ? filtered.map(u => `
              <tr>
                <td data-label="User ID">${u.UserID}</td>
                <td data-label="Username">${u.Username}</td>
                <td data-label="Email">${u.Email}</td>
                <td data-label="Type">${u.Type}</td>
                <td data-label="Phone">${u.PhoneNum || ''}</td>
                <td data-label="Car Reg">${u.CarNum || ''}</td>
                <td data-label="Verified">${u.Verified ? 'Yes' : 'No'}</td>
                <td data-label="Actions"><button data-id="${u.UserID}">Remove</button></td>
              </tr>
            `).join('')
          : '<tr><td colspan="8">No users match your search.</td></tr>';
        
        // Rebind delete buttons
        tbody.querySelectorAll('button').forEach(btn => {
          btn.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to remove this user?')) return;
            const id = btn.dataset.id;
            try {
              const del = await fetch(`/api/users/${id}`, { method: 'DELETE' });
              if (del.ok) loadUsers();
              else {
                const error = await del.json();
                alert("Failed to remove user: " + (error.error || "Unknown error"));
              }
            } catch (err) {
              alert("Failed to remove user. See console for details.");
            }
          });
        });
      }

      renderFilteredUsers(); // Initial full list

      // Attach live filter
      searchInput.addEventListener("input", e => {
        renderFilteredUsers(e.target.value);
      });

  } catch (err) {
    console.error("Error loading users:", err);
    section.innerHTML += `<p class="error">Error: ${err.message}</p>`;
  }
}

  loadUsers();
});
