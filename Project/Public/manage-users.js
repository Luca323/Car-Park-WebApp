window.addEventListener("DOMContentLoaded", () => {
  // Header & nav bar
  const header = document.createElement("header");
  const logo = document.createElement("img"); logo.src = "logo.png"; logo.className = "logo";
  const title = document.createElement("h1"); title.textContent = "ParkEase";
  header.append(logo, title); document.body.appendChild(header);

  const nav = document.createElement("nav");
  nav.innerHTML = `
    <a href="/admindashboard">Dashboard</a>
    <a href="/managecarparks">Manage Car Parks</a>
    <a href="/managespaces">Manage Spaces</a>
    <a href="/manageevents">Manage Events</a>
    <a href="/sendnotif">Send Notifications</a>
    <a href="/manageusers">Admin Manage Users</a>
    <a href="#" id="logout-link">Logout</a>
  `;
  document.body.appendChild(nav);

  // Logout logic
  document.getElementById("logout-link").addEventListener("click", async (e) => {
    e.preventDefault();
    await fetch("/logout", { method: "POST", credentials: "include" });
    location.href = "/";
  });

  // Main container
  const container = document.createElement("div"); container.className = "dashboard";
  document.body.appendChild(container);

  const section = document.createElement("div"); section.className = "section";  section.innerHTML = '<h2>Admin Manage Users</h2>';
  container.appendChild(section);

  // Build table for users
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
      <th>Car Number</th>
      <th>Verified</th>
      <th>Actions</th>
    </tr>
  `;
  table.appendChild(thead);
  const tbody = document.createElement("tbody");
  section.appendChild(table);
  table.appendChild(tbody);
  // Fetch & render users into table
  async function loadUsers() {
    try {
      const res = await fetch("/api/users", { credentials: "include" });
      if (!res.ok) {
        console.error("Failed to load users:", res.status);
        section.innerHTML += `<p class="error">Error loading users: ${res.status}</p>`;
        return;
      }
      const users = await res.json();
    // Populate rows
    tbody.innerHTML = users.length
      ? users.map(u => `
          <tr>
            <td>${u.UserID}</td>
            <td>${u.Username}</td>
            <td>${u.Email}</td>
            <td>${u.Type}</td>
            <td>${u.PhoneNum || ''}</td>
            <td>${u.CarNum || ''}</td>
            <td>${u.Verified ? 'Yes' : 'No'}</td>
            <td><button data-id="${u.UserID}">Remove</button></td>
          </tr>
        `).join('')
      : '<tr><td colspan="7">No users found.</td></tr>';    // Attach remove handlers
    tbody.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to remove this user?')) return;
        const id = btn.dataset.id;
        try {
          const del = await fetch(`/api/users/${id}`, { method: 'DELETE' });
          if (del.ok) loadUsers();
          else {
            const error = await del.json();
            console.error("Delete error:", error);
            alert("Failed to remove user: " + (error.error || "Unknown error"));
          }
        } catch (err) {
          console.error("Delete error:", err);
          alert("Failed to remove user. See console for details.");
        }
      });
    });
  } catch (err) {
    console.error("Error loading users:", err);
    section.innerHTML += `<p class="error">Error: ${err.message}</p>`;
  }
}

  loadUsers();
});
