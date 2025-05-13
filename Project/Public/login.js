window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("login-reg-page");
    const header = document.createElement("header");

    const logo = document.createElement("img");
    logo.src = "logo.png";
    logo.alt = "ParkEase Logo";
    logo.className = "logo";

    const title = document.createElement("h1");
    title.textContent = "ParkEase";

    const nav = document.createElement("nav");
    nav.innerHTML = `
        <a href="/">Home</a>
        <a href="/login">Login</a>
        `;

    header.append(logo, title, nav);
    document.body.appendChild(header);

    // Creating main container & header
    const container = document.createElement("div");
    container.className = "container";

    const heading = document.createElement("h2");
    heading.textContent = "Login";

    // Creating the login form
    const form = document.createElement("form");

    // Creating input fields for form
    const usernameInput = document.createElement("input");
    usernameInput.type = "text";
    usernameInput.name = "username";
    usernameInput.placeholder = "Username";
    usernameInput.required = true;

    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.name = "password";
    passwordInput.placeholder = "Password";
    passwordInput.required = true;

    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.textContent = "Login";

    const registerBtn = document.createElement("a");
    registerBtn.href = "/register";
    registerBtn.textContent = "Click here to register for an account!";
    registerBtn.className = "register-link"; 

    
    // Appending
    form.append(usernameInput, passwordInput, submitBtn, registerBtn);
    container.append(heading, form);
    
    const main = document.createElement("main");
    main.appendChild(container);
    document.body.appendChild(main);

    // Handles form submission 
    form.onsubmit = async (e) => {
        e.preventDefault();
    
        const chkUser = {
            username: usernameInput.value.trim(),
            passkey: passwordInput.value.trim() // Must match "passkey" expected by backend
        };
    
        try {
            const response = await fetch('http://localhost:8080/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(chkUser)
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert('Logged in successfully!');

                if(data.Type == 'driver'){
                    location.href = "/driverdashboard";
                }
                else if(data.Type == 'admin'){
                    location.href = "/admindashboard";
                }
            } else {
                console.log(data.error)
                alert(data.error || "Incorrect Login Details!");
            }
        } catch (err) {
            console.error('Error:', err);
            alert("Login Error!");
        }
    };

});

