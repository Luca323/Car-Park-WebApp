window.addEventListener("DOMContentLoaded", () => {
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
    <a href="/driverdashboard">Dashboard</a>
    <a href="/bookparking">Book Parking</a>
    <a href="/contactus">Contact Us</a>
    <a href="/account" class="active">My Account</a>
    <a href="#" id="logout-link">Logout</a>
  `;
  document.body.appendChild(nav);

  // Logout logic
  const logoutLink = document.getElementById("logout-link");
  logoutLink.addEventListener("click", async (e) => {
    e.preventDefault();
    const res = await fetch("/logout", { method: "POST", credentials: "include" });
    if (res.ok) location.href = "/";
    else alert("Failed to log out.");
  });

  // Main container
  const container = document.createElement("div");
  container.className = "dashboard";
  document.body.appendChild(container);

  const section = document.createElement("div");
  section.className = "section";
  section.innerHTML = `<h2>My Account</h2>`;
  container.appendChild(section);

  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.placeholder = "Enter your password to continue";

  const unlockBtn = document.createElement("button");
  unlockBtn.textContent = "Unlock Account";

  const form = document.createElement("form");
  form.style.display = "none";

  const emailLabel = document.createElement("label");
  emailLabel.textContent = "Email:";
  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.placeholder = "Email";

  const phoneLabel = document.createElement("label");
  phoneLabel.textContent = "Phone Number:";
  const phoneInput = document.createElement("input");
  phoneInput.type = "text";
  phoneInput.placeholder = "Phone Number";

  const regLabel = document.createElement("label");
  regLabel.textContent = "Car Registration Number:";
  const regInput = document.createElement("input");
  regInput.type = "text";
  regInput.placeholder = "Car Registration Number";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save Changes";
  saveBtn.type = "submit";

  form.append(
    emailLabel,emailInput, 
    phoneLabel, phoneInput, 
    regLabel, regInput, 
    saveBtn
);

  section.append(passwordInput, unlockBtn, form);

  // Unlock logic
  unlockBtn.onclick = async () => {
    const password = passwordInput.value.trim();
    if (!password) return alert("Please enter your password");

    try {
      const res = await fetch("/api/me", { credentials: "include" });
      const me = await res.json();
      if (!me.userID) return location.href = "/login";

      const verifyRes = await fetch("/api/account/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password })
      });

      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        return alert(data.error || "Password verification failed");
      }

      // Load user data
      const infoRes = await fetch("/api/account", { credentials: "include" });
      const user = await infoRes.json();

      emailInput.value = user.Email || "";
      phoneInput.value = user.phone || "";
      regInput.value = user.regNum || "";

      passwordInput.style.display = "none";
      unlockBtn.style.display = "none";
      form.style.display = "block";

    } catch (err) {
      console.error("Error unlocking account:", err);
      alert("An error occurred.");
    }
  };

  // Save changes
  form.onsubmit = async (e) => {
    e.preventDefault();

    const updated = {
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      regNum: regInput.value.trim()
    };

    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updated)
      });

      const data = await res.json();
      if (res.ok) {
        alert("Details updated successfully");
      } else {
        alert(data.error || "Failed to update");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Something went wrong");
    }
  };
});
