window.addEventListener("DOMContentLoaded", () => {
    // Creating and appending the header and nav bar
    const header = document.createElement("header");
    header.innerHTML = `<h1>Book Parking</h1>`;
    document.body.appendChild(header);
  
    const nav = document.createElement("nav");
    nav.innerHTML = `
      <a href="driver-dashboard.html">Dashboard</a>
      <a href="book-parking.html">Book Parking</a>
      <a href="contact-us.html">Contact Us</a>
    `;
    document.body.appendChild(nav);
  
    // Creating the main dashboard container
    const container = document.createElement("div");
    container.className = "dashboard";
    document.body.appendChild(container);
  
    // Creating section for booking form
    const section = document.createElement("div");
    section.className = "section";
    section.innerHTML = "<h2>Parking Booking</h2>";

    async function getUserID() { //Retrieves logged in user id for future use
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        const data = await res.json();
    
        if (data.userID) {
          console.log(`Logged in as ${data.userID}`)
          return data.userID;
          // Call functions that depend on userID here
        } else {
          window.location.href = '/login.html';
        }
      } catch (err) {
        console.error("Error fetching user ID:", err);
      }
    }

    let carParks = [];

    fetch('./api/carparks') //Retrieved from DB
      .then(res => res.json())
      .then(data => {
        carParks = data;
        updateDropdown();
      })
      .catch(err => console.error('Error loading car parks:', err));

    // Dropdown to select car park 
    const carParkSelect = document.createElement("select");
    carParkSelect.className = "event-input";
    //const carParks = JSON.parse(localStorage.getItem("carParks")) || [];
    const defaultOption = document.createElement("option");
    defaultOption.textContent = "Select a Car Park";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.value = "";
    carParkSelect.appendChild(defaultOption);
    carParks.forEach(park => {
      const opt = document.createElement("option");
      opt.value = park.name;
      opt.textContent = park.name; 
      carParkSelect.appendChild(opt);
    });

    function updateDropdown() { //Copied from manage-carpark.js
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
        option.textContent = `${park.Name} (${park.Size} spaces)`;
        carParkSelect.appendChild(option);
      });
    }

  
    // Inputs for start & end date/times 
    const startDateInput = document.createElement("input");
    startDateInput.type = "datetime-local";
    startDateInput.className = "event-input";
  
    const endDateInput = document.createElement("input");
    endDateInput.type = "datetime-local";
    endDateInput.className = "event-input";
  
    const paymentInfo = document.createElement("div");
    paymentInfo.id = "paymentInfo";
  
    // Button to submit booking request
    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit Parking Request";
  
    // Adds all elements to the section
    section.append(
      carParkSelect,
      startDateInput,
      endDateInput,
      paymentInfo,
      submitBtn
    );
  
    container.appendChild(section);
  
    // Calculations for cost based on time of stay
    function calculateCost(startDate, endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
  
      if (end <= start) {
        return 0;
      }
  
      const durationInHours = (end - start) / (1000 * 60 * 60); // milliseconds to hours
      const cost = durationInHours * 2; // £2/hour
      return cost.toFixed(2);
    }
  
    // Logic for handling the submission of the parking request
    submitBtn.onclick = async () => {
      const selectedIndex = carParkSelect.value;
      const startDate = startDateInput.value;
      const endDate = endDateInput.value;
    
      if (!selectedIndex || !startDate || !endDate) {
        alert("Please fill in all fields.");
        return;
      }
    
      const cost = calculateCost(startDate, endDate);
      if (cost <= 0) {
        alert("Invalid time range.");
        return;
      }
    
      const confirmPayment = confirm(`Simulated Payment: £${cost}\n\nClick OK to confirm payment.`);
      if (!confirmPayment) {
        alert("Payment cancelled. Request not submitted.");
        return;
      }
    
      const userID = await getUserID(); // ✅ get logged in user
      const carPark = carParks[selectedIndex]; // ✅ get selected car park object
    
      const newRequest = {
        carParkID: carPark.CarparkID,
        userID: userID,
        startDate: startDate,
        endDate: endDate,
        cost: parseFloat(cost),
        status: "pending"
      };
    
      try {
        const res = await fetch('./api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(newRequest)
        });
    
        const data = await res.json();
    
        if (res.ok) {
          alert("✅ Payment successful! Your parking request has been submitted.");
          startDateInput.value = "";
          endDateInput.value = "";
          carParkSelect.value = "";
          paymentInfo.innerHTML = "";
        } else {
          alert(data.error || "Failed to submit request.");
        }
      } catch (err) {
        console.error('Request error:', err);
        alert("Error submitting request.");
      }
    };
  
    // Displays cost
    function displayCost() {
      const start = startDateInput.value;
      const end = endDateInput.value;
      if (start && end) {
        const cost = calculateCost(start, end);
        if (cost > 0) {
          paymentInfo.innerHTML = `Cost: £${cost}`;
        } else {
          paymentInfo.innerHTML = "";
        }
      }
    }
  
    startDateInput.addEventListener("change", displayCost);
    endDateInput.addEventListener("change", displayCost);

    updateDropdown();
  });