const express = require('express');
const connection = require('./db');
const path = require('path');
const app = express();
const nodemailer = require('nodemailer');
const session = require('express-session');
app.use(express.static(path.join(__dirname, 'Public')));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'chopseven@gmail.com', //Using my personal email right now
    pass: 'bxqf vaim aucu qgyr' 
  }
});

const { v4: uuidv4 } = require('uuid'); //Tracks user IP
let pendingVerifications = {};


app.use(session({
  secret: process.env.SESSION_SECRET || 'strong-fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(express.json());

function getRandomInt(max) { 
    return Math.floor(Math.random() * max);
  }

const port = 8080; //Hosted on port 8080

//====================== Function to check if user logged in ================================

function requireLogin(req, res, next) { //Prevents users accessing pages via URL without login
  if (req.session.UserID) {
    return next();
  }
  res.status(401).sendFile(path.join(__dirname, 'Public', 'login.html'));
}

function requireAdmin(req, res, next) { //Prevents users accessing admin pages
  if (req.session.UserID && req.session.Type === 'admin') {
    return next();
  }
  res.status(403).send("Access denied. Admins only.");
}

app.get('/api/me', (req, res) => { //Retrieves session userID
  if (req.session && req.session.UserID) {
    res.json({ userID: req.session.UserID });
  } else {
    res.json({ userID: null });
  }
});


//================================== URLs ====================================================

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'login.html'));
});

app.get('/bookparking', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'book-parking.html'));
});

app.get('/driverdashboard', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'driver-dashboard.html'));
});

app.get('/contactus', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'contact-us.html'));
});

app.get('/admindashboard', requireLogin, requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'admin-dashboard.html'));
});

app.get('/managecarparks', requireLogin, requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'manage-carparks.html'));
});

app.get('/managespaces', requireLogin, requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'manage-spaces.html'));
});

app.get('/manageevents', requireLogin, requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'manage-events.html'));
});

app.get('/sendnotif', requireLogin, requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'send-notif.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'register.html'));
});

app.get('/account', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'account.html'));
});

app.get('/account', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'account.html'));
});

app.get('/manageusers', requireLogin, requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'manage-users.html'));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});


//============================ Brute force prevention for login ==============================
const rateLimit = require('express-rate-limit');

// Create a limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 1000, 
  max: 5, 
  message: {
    error: 'Too many login attempts. Please try again after 15 seconds.'
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

//============================ Login/Register/Logout ================================================
const bcrypt = require('bcrypt');

//Login endpoint
app.post('/login', loginLimiter, (req, res) => {
  const { username, passkey } = req.body;
  if (!username || !passkey) {
    return res.status(400).json({ error: 'Username and password required' });  
  }
  

  const query = 'SELECT UserID, Passkey, Type, Verified FROM logininfo WHERE Username = ?';
  connection.query(query, [username], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length !== 1) return res.status(401).json({ error: 'Invalid login' });
    if (Number(results[0].Verified) !== 1) { //Checks users are verified
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }
    

    const storedHash = results[0].Passkey;
    const match = await bcrypt.compare(passkey, storedHash); //Compares password to hashed value in sql

    if (match) {
      req.session.UserID = results[0].UserID; //Checks ID is also equal
      req.session.Type = results[0].Type; 
      return res.status(200).json({ message: 'Login successful', Type: results[0].Type });
    } else {
      return res.status(401).json({ error: 'Invalid login' });
    }
  });
});

const saltRounds = 10; //For strong hashing

//Registration endpoint
app.post('/register', (req, res) => {
    const { username, passkey, phone, email, regNum } = req.body;

    if (!username || !passkey) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const checkQuery = 'SELECT * FROM logininfo WHERE Username = ? OR Email = ?';
    connection.query(checkQuery, [username,email], (err, results) => {
        if (err) {
            console.error('Check user error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }

        //Hash the password before storing
        bcrypt.hash(passkey, saltRounds, (err, hashedPassword) => {
            if (err) {
                console.error('Password hashing error:', err);
                return res.status(500).json({ error: 'Failed to process password' });
            }

            const genID = getRandomInt(9999); //Random user ID - simple solution
            const insertQuery = 'INSERT INTO logininfo (UserID, Username, Passkey, PhoneNum, Email, CarNum) VALUES (?, ?, ?, ?, ?, ?)';
            
            connection.query(insertQuery, [genID, username, hashedPassword, phone, email, regNum], (err, result) => {
                if (err) {
                    console.error('Insert user error:', err);
                    return res.status(500).json({ error: 'Database insert failed' });
                }

                const token = uuidv4();
                pendingVerifications[token] = username;

                const verificationLink = `http://localhost:${port}/verify-email?token=${token}`;

                const mailOptions = {
                  from: '"ParkEase" <chopseven@gmail.com>', //Using my personal Email
                  to: email,
                  subject: 'Verify Your Email',
                    html: `<p>Click <a href="${verificationLink}">here</a> to verify your email address.</p>`
                };

                transporter.sendMail(mailOptions, (err, info) => {
                  if (err) {
                  console.error('Error sending verification email:', err);
                  return res.status(500).json({ error: 'Failed to send verification email' });
                 }

                res.status(201).json({
                message: 'User registered. Please verify your email before logging in.'
              });
            });

            });
        });
    });
});

//Logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid'); // default session cookie name
    res.status(200).json({ message: 'Logged out' });
  });
});

//=========================== Verify Emails ==========================================
app.get('/verify-email', (req, res) => {
  const { token } = req.query;
  const username = pendingVerifications[token];

  if (!username) {
    return res.status(400).send('Invalid or expired verification link');
  }

  const updateQuery = 'UPDATE logininfo SET Verified = TRUE WHERE Username = ?'; //Sets verified to 1 in table
  connection.query(updateQuery, [username], (err, result) => {
    if (err) {
      console.error('Verification DB error:', err);
      return res.status(500).send('Internal server error');
    }

    delete pendingVerifications[token];
    res.send('Email successfully verified! You can now log in.');
  });
});



//============================ Admin Dashboard ===============================================

app.get('/api/spaces', (req, res) => { //Selects every space and associated carpark
  const query = `
    SELECT 
      Spaces.SpaceID,
      Spaces.CarparkID,
      Carparks.Name AS CarparkName,
      Spaces.Price,
      Spaces.Occupied,
      Spaces.UserID,
      Spaces.Status
    FROM Spaces
    JOIN Carparks ON Spaces.CarparkID = Carparks.CarparkID
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching spaces with carpark names:', err);
      return res.status(500).json({ error: 'Failed to fetch space data' });
    }

    res.json(results); //returns as JSON object
  });
});

app.post('/api/cleanup-expired', (req, res) => {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const autoFreeQuery = `
    UPDATE Spaces s
    JOIN Requests r ON s.SpaceID = r.SpaceID
    SET s.Status = 'Available', s.UserID = NULL
    WHERE r.status = 'accepted' AND r.End <= ?
  `;

  const markCompletedRequests = `
    UPDATE Requests
    SET status = 'completed'
    WHERE status = 'accepted' AND End <= ?
  `;

  connection.query(autoFreeQuery, [now], err => {
    if (err) {
      console.error("Auto-cleanup error:", err);
      return res.status(500).json({ error: "Auto cleanup failed" });
    }

  connection.query(markCompletedRequests, [now], (err2) => {
    if (err2) {
      console.error("Request update error:", err2);
      return res.status(500).json({ error: "Request status update failed" });
    }

    res.json({ message: "Cleanup complete" });
  });
});
});


//============================ Manage Carparks =================================================

app.put('/api/carparks/:id', (req, res) => { //Designed for updating carparks
    const { name, size } = req.body;
    const { id } = req.params;
  
    if (!name || size == null) {
      return res.status(400).json({ error: 'Name and size are required' });
    }
  
    const query = 'UPDATE Carparks SET Name = ?, Size = ? WHERE CarparkID = ?';//Updates the table
    connection.query(query, [name, size, id], (err, result) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).json({ error: 'Failed to update car park' });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Car park not found' });
      }

      const getSpacesQuery = 'SELECT SpaceID FROM Spaces WHERE CarparkID = ? ORDER BY SpaceID';
      connection.query(getSpacesQuery, [id], (err2, spaces) => {
        if (err2) {
          console.error('Failed to get spaces:', err2);
          return res.status(500).json({ error: 'Error fetching spaces' });
        }

        if (spaces.length > size) {
        const toDelete = spaces.slice(size).map(s => s.SpaceID);
        const deleteQuery = 'DELETE FROM Spaces WHERE SpaceID IN (?)';
        connection.query(deleteQuery, [toDelete], (err3) => {
          if (err3) {
            console.error('Error deleting extra spaces:', err3);
            return res.status(500).json({ error: 'Failed to reduce space count' });
          }

          res.json({ message: 'Car park updated and spaces trimmed' });
        });
      } else {
        res.json({ message: 'Car park updated' });
      }
    });
  });
});

  //not sure if this is ever used?
app.delete('/api/spaces/:id', (req, res) => { //Deleting the spaces by id
    const { id } = req.params;

    const query = 'DELETE FROM Spaces WHERE SpaceID = ?';
    connection.query(query, [id], (err) => {
        if (err) {
            console.error('Error deleting space:', err);
            return res.status(500).json({ error: 'Failed to delete space' });
        }

        res.json({ message: 'Space deleted' });
    });
});

app.get('/api/carparks', (req, res) => { //Selects data from carpark
  const query = 'SELECT CarparkID, Name, Size FROM Carparks'; //for whatever reson, SELECT * was not working

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving car parks:', err);
      return res.status(500).json({ error: 'Failed to retrieve car parks' });
    }

    res.json(results);
  });
});

app.post('/api/carparks', (req, res) => { //Uploads new carparks
    const { name, size } = req.body;

    if (!name || size == null || size <= 0) {
        return res.status(400).json({ error: 'Name and valid size are required' });
    }

    const query = 'INSERT INTO Carparks (CarparkID, Name, Size) VALUES (?, ?, ?)';

    connection.query(query, [getRandomInt(9999),name, size], (err, result) => {
        if (err) {
            console.error('Error adding car park:', err);
            return res.status(500).json({ error: 'Failed to add car park' });
        }

        res.status(201).json({
            message: 'Car park created',
            CarparkID: result.insertId
        });
    });
});

app.delete('/api/carparks/:id', (req, res) => { //Deletes carparks by id
    const { id } = req.params;

    const query = 'DELETE FROM Carparks WHERE CarparkID = ?';

    connection.query(query, [id], (err) => {
        if (err) {
            console.error('Error deleting car park:', err);
            return res.status(500).json({ error: 'Failed to delete car park' });
        }

        res.json({ message: 'Car park and related spaces deleted' });
    });
});

//============================ Manage Spaces ==================================================================

app.get('/api/spaces1', (req, res) => { //Alternative retrieval for spaces, selects spaces by carpark ID instead a lump of all spaces
  const { carparkId } = req.query;

  if (!carparkId) {
    return res.status(400).json({ error: 'carparkId is required' });
  }

  const query = `
    SELECT 
      Spaces.SpaceID,
      Spaces.CarparkID,
      Carparks.Name AS CarparkName,
      Spaces.Price,
      Spaces.Occupied,
      Spaces.UserID,
      Spaces.Status
    FROM Spaces
    JOIN Carparks ON Spaces.CarparkID = Carparks.CarparkID
    WHERE Spaces.CarparkID = ?
  `;

  connection.query(query, [carparkId], (err, results) => {
    if (err) {
      console.error('Failed to fetch spaces:', err);
      return res.status(500).json({ error: 'Failed to fetch spaces' });
    }

    res.json(results);
  });
});

app.put('/api/spaces/:id', (req, res) => { //allows for status updates of spaces
  const { id } = req.params;
  let { status, userId } = req.body;

  if (!status) {
    console.log("Missing status");
    return res.status(400).json({ error: 'Status is required' });
  }

  if (status === "Occupied") {
    if (!userId || isNaN(Number(userId))) {
      console.log("Invalid userId for Occupied status:", userId);
      return res.status(400).json({ error: 'Occupied status must include a valid userId' });
    }
  } else {
    userId = null;
  }

  const occupiedFlag = status === "Occupied" ? 1 : 0;
  const query = 'UPDATE Spaces SET Status = ?, UserID = ?, Occupied = ? WHERE SpaceID = ?';

  connection.query(query, [status, userId, occupiedFlag, id], (err, result) => {
    if (err) {
      console.log("ERROR - Query failed");
      console.log("Raw error object:", err);
      try {
        console.log("Stringified:", JSON.stringify(err, null, 2));
      } catch (e) {
        console.log("Could not stringify:", e.message);
      }
      return res.status(500).json({ error: 'Failed to update space' });
    }

    console.log("Query succeeded.");
    res.json({ message: 'Space status updated' });
  });
});

//============================ Book Parking & Handle requests =================================================

app.post('/api/requests', (req, res) => { //Creates request in the database
  const { carParkID, userID, startDate, endDate, cost, status } = req.body;

  //Basic validation
  if (!carParkID || !userID || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `
    INSERT INTO Requests (CarParkID, UserID, Start, End, Cost, Status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    query,
    [carParkID, userID, startDate, endDate, cost || 0.0, status || 'pending'],
    (err, result) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).json({ error: 'Database insert failed' });
      }

      res.status(201).json({ message: 'Request submitted', requestID: result.insertId });
    }
  );
});

//admin view - get all parking reqs with car park name
app.get('/api/requests', (req, res) => {
  const query = `
    SELECT
      r.ReqID AS id,
      r.CarParkID,
      r.UserID AS userID,
      r.Start AS startDate,
      r.End AS endDate,
      r.Cost AS cost,
      r.Status AS status,
      r.SpaceID,
      c.Name AS carPark
      FROM Requests r
      JOIN Carparks c ON r.CarParkID = c.CarparkID
    `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching requests:", err);
      return res.status(500).json({error: "Failed to retrieve reqs"});
    }
    res.json(results);
  });
});

// admin action: update parking request on accept/reject
app.put('/api/requests/:id', (req, res) => {
  const requestId = req.params.id;
  const { status, spaceId, endDate } = req.body;

  console.log("Request update:", { id: requestId, body: req.body });

  if (!status) {
    return res.status(400).json({ error: "status is required" });
  }

  let query = '';
  let params = [];

  if (status === 'completed' && endDate) {
    query = `
    UPDATE Requests
    SET Status = ?,
    End = ?
    WHERE ReqID = ?
    `;
    params = [status, endDate, requestId];
  } else if (status === 'accepted') {
    query = `
    UPDATE Requests
    SET Status = ?,
    SpaceID = ?
    WHERE ReqID = ?
    `;
    params = [status, spaceId || null, requestId];
  } else {
    query = `
    UPDATE Requests
    SET Status = ?
    WHERE ReqID = ?
    `;
    params = [status, requestId];
  }

  connection.query(query, params, (err, result) => {
    if (err) {
      console.error('Error updating request:', err);
      return res.status(500).json({ error: "Failed to update request"});
    }
    res.json({ message: "Request updated successfully"});
  });
});

app.post('/api/requests/:id/departure', (req, res) => { //If user departs, set status to completed in the backend
  const requestId = req.params.id;

  const findQuery = `
    SELECT SpaceID FROM Requests
    WHERE ReqID = ? AND status = 'accepted'
  `;

  connection.query(findQuery, [requestId], (err, results) => {
    if (err || results.length === 0) {
      console.error("Departure error:", err || "No such accepted request");
      return res.status(400).json({ error: "Invalid request ID or not accepted" });
    }

    const spaceId = results[0].SpaceID;

    const completeRequest = `UPDATE Requests SET status = 'completed' WHERE ReqID = ?`;
    const freeSpace = `UPDATE Spaces SET Status = 'Available', UserID = NULL, Occupied = 0 WHERE SpaceID = ?`;

    connection.query(completeRequest, [requestId], err1 => {
      if (err1) {
        console.error("Request completion error:", err1);
        return res.status(500).json({ error: "Failed to mark request complete" });
      }

      connection.query(freeSpace, [spaceId], err2 => {
        if (err2) {
          console.error("Space freeing error:", err2);
          return res.status(500).json({ error: "Failed to free space" });
        }

        res.json({ message: "Space released successfully" });
      });
    });
  });
});

app.post('/api/send-email', (req, res) => {
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ error: 'Missing email details' });
  }

  const mailOptions = {
    from: '"ParkEase" <chopseven@gmail.com>',
    to,
    subject,
    text
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Error sending email:', err);
      return res.status(500).json({ error: 'Failed to send email' });
    }
    res.status(200).json({ message: 'Email sent successfully' });
  });
});

//============================ Notifications =================================================

app.post('/api/notify', (req, res) => { //Endpoint for admin-sent notifications
  const { message } = req.body;

  if (!message) { //validation
    return res.status(400).json({ success: false, error: 'Message content is required' });
  }

  const query = 'SELECT Email FROM logininfo WHERE Type = "driver"'; //retrieve all user emails

  connection.query(query, async (err, results) => {
    if (err) {
      console.error('Database error while retrieving emails:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }

    const emails = results.map(row => row.Email);
    if (emails.length === 0) {
      return res.json({ success: true, count: 0 });
    }

    //Prepare email sending
    const sendEmailPromises = emails.map(email =>
      transporter.sendMail({
        from: '"ParkEase Admin" <chopseven@gmail.com>',
        to: email,
        subject: 'Important Parking Notification',
        text: message
      }).catch(error => {
        console.error(`Failed to send to ${email}:`, error);
        return null;
      })
    );

    const sendResults = await Promise.all(sendEmailPromises); //Execute email sending
    const successCount = sendResults.filter(r => r !== null).length; //Counts successfully sent emails

    res.json({ success: true, count: successCount });
  });
});

// CONTACT US FORM 
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const mailOptions = {
    from: '"ParkEase Contact" <chopseven@gmail.com>', //Sent from same account as verification
    to: 'parkeasehelp@gmail.com',                     //Destination inbox
    subject: `New Contact Form Message from ${name}`,
    text: `From: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Contact email error:", err);
      return res.status(500).json({ error: 'Failed to send message' });
    }
    res.json({ message: 'Message sent successfully' });
  });
});

//======================================= Event-Based Parking ============================================

app.get('/api/events', (req, res) => { //Retrieves existing events from
  const query = `
    SELECT Events.EventID, Events.Title, Events.Start, Events.End,
           Carparks.Name AS CarparkName, Events.CarparkID
    FROM Events
    JOIN Carparks ON Events.CarparkID = Carparks.CarparkID
  `;
  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch events' });
    res.json(results);
  });
});

app.post('/api/events', async (req, res) => { //Creates new events
  const { EventID, Title, Start, End, CarparkID } = req.body;

  if (!EventID || !Title || !Start || !End || !CarparkID) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try{
    await new Promise((resolve, reject) => { //Promises all insertion queries will relay a response
      connection.query(
        `INSERT INTO Events (EventID, Title, Start, End, CarparkID)
         VALUES (?, ?, ?, ?, ?)`,
        [EventID, Title, Start, End, CarparkID],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
    res.status(201).json({ message: "Event created" });

  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Event creation failed", details: err.message });
  }
});

//Block spaces for an event
app.post('/api/events/:eventId/block', (req, res) => {
  const { eventId } = req.params;
  const { count } = req.body;

  connection.query(
    `SELECT * FROM Events WHERE EventID = ?`,
    [eventId],
    (err, results) => {
      if (err || !results.length) {
        console.error("Event fetch failed:", err);
        return res.status(500).json({ error: 'Failed to find event' });
      }

      const event = results[0];
      const { CarparkID } = event;

      connection.query(
        `SELECT SpaceID FROM Spaces WHERE CarparkID = ? AND Status = 'Available' LIMIT ?`, //Ensures not more spaces can be assigned than exist
        [CarparkID, count],
        (err2, spaces) => {
          if (err2) {
            console.error("Space fetch failed:", err2);
            return res.status(500).json({ error: 'Failed to find spaces' });
          }

          if (spaces.length < count) {
            return res.status(400).json({ error: 'Not enough available spaces' });
          }

          let updated = 0;
          spaces.forEach(space => {
            connection.query(
              `UPDATE Spaces SET Status = 'Blocked' WHERE SpaceID = ?`, //Blocks selected number of spaces
              [space.SpaceID],
              (err3) => {
                if (err3) console.error("Block failed:", err3);
                updated++;

                if (updated === spaces.length) {
                  res.json({ message: `${updated} spaces blocked.` });
                }
              }
            );
          });
        }
      );
    }
  );
});

//Release blocked spaces for an event
app.post('/api/events/:eventId/release', (req, res) => {
  const { eventId } = req.params;

  connection.query(
    `SELECT * FROM Events WHERE EventID = ?`,
    [eventId],
    (err, results) => {
      if (err || !results.length) {
        console.error("Event fetch failed:", err);
        return res.status(500).json({ error: 'Failed to find event' });
      }

      const { CarparkID } = results[0];

      connection.query(
        `UPDATE Spaces SET Status = 'Available' WHERE CarparkID = ? AND Status = 'Blocked'`, //Unblocks the spaces
        [CarparkID],
        (err2, result) => {
          if (err2) {
            console.error("Release failed:", err2);
            return res.status(500).json({ error: 'Failed to release spaces' });
          }

          res.json({ message: `${result.affectedRows} spaces released.` });
        }
      );
    }
  );
});
app.delete('/api/events/:id', (req, res) => { //Deletes events and frees spaces
  const query = `DELETE FROM Events WHERE EventID = ?`;
  connection.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete event' });
    res.json({ message: 'Event deleted successfully' });
  });
});

//========================================================Account Details=================================================

// Get account details
app.get('/api/account', requireLogin, (req, res) => {
  const query = 'SELECT Email, PhoneNum AS phone, CarNum AS regNum FROM logininfo WHERE UserID = ?';
  connection.query(query, [req.session.UserID], (err, results) => {
    if (err || results.length !== 1) {
      return res.status(500).json({ error: "Failed to load account info" });
    }
    res.json(results[0]);
  });
});

// Verify password before editing
app.post('/api/account/verify', requireLogin, (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: "Password required" });

  const query = 'SELECT Passkey FROM logininfo WHERE UserID = ?';
  connection.query(query, [req.session.UserID], async (err, results) => {
    if (err || results.length !== 1) return res.status(500).json({ error: "DB error" });

    const valid = await bcrypt.compare(password, results[0].Passkey);
    if (!valid) return res.status(401).json({ error: "Incorrect password" });

    res.json({ message: "Password verified" });
  });
});

//Update account details
app.put('/api/account', requireLogin, (req, res) => {
  const { email, phone, regNum } = req.body;

  //check if email is already used by another account
  const checkQuery = 'SELECT UserID FROM logininfo WHERE Email = ? AND UserID != ?';
  connection.query(checkQuery, [email, req.session.UserID], (err, results) => {
    if (err) {
      console.error("Email check error:", err);
      return res.status(500).json({ error: "Failed to validate email" });
    }

    if (results.length > 0) {
      return res.status(409).json({ error: "That email is already in use by another account" });
    }

    const updateQuery = 'UPDATE logininfo SET Email = ?, PhoneNum = ?, CarNum = ? WHERE UserID = ?';
    connection.query(updateQuery, [email, phone, regNum, req.session.UserID], (err, result) => {
      if (err) {
        console.error("Account update error:", err);
        return res.status(500).json({ error: "Failed to update account" });
      }
      res.json({ message: "Account updated" });
    });
  });
});

//======================================================= Manage Users ==========================================================================

app.get('/api/users', requireLogin, requireAdmin, (req, res) => { //Retrieves user data from DB
  const query = 'SELECT UserID, Username, Email, Type, PhoneNum, CarNum, Verified FROM logininfo';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to retrieve users' });
    }
    res.json(results);
  });
});

app.delete('/api/users/:id', requireLogin, requireAdmin, (req, res) => {
  const { id } = req.params;
  
  // Prevent admin from deleting own account
  if (Number(id) === Number(req.session.UserID)) {
    return res.status(403).json({ error: 'Cannot delete your own admin account' });
  }

    const markUpcomingAcceptedAsCompleted = `
    UPDATE Requests 
    SET Status = 'completed' 
    WHERE UserID = ? 
      AND Status = 'accepted' 
      AND Start > NOW()
  `;

    const rejectPendingRequests = `
    UPDATE Requests 
    SET Status = 'rejected' 
    WHERE UserID = ? 
      AND Status = 'pending'
  `;

    const freeSpaces = `
    UPDATE Spaces 
    SET Status = 'Available', UserID = NULL, Occupied = 0 
    WHERE SpaceID IN (
      SELECT SpaceID FROM Requests 
      WHERE UserID = ? AND Status = 'accepted' AND Start > NOW() AND SpaceID IS NOT NULL
    )
  `;
  
  const deleteQuery = 'DELETE FROM logininfo WHERE UserID = ?';

  connection.query(markUpcomingAcceptedAsCompleted, [id], err1 => {
  if (err1) {
    console.error('Failed to complete future accepted sessions:', err1);
    return res.status(500).json({ error: 'Error completing sessions' });
  }

    connection.query(rejectPendingRequests, [id], err2 => {
      if (err2) {
        console.error('Failed to reject pending requests:', err2);
        return res.status(500).json({ error: 'Error rejecting requests' });
      }

      connection.query(freeSpaces, [id], err3 => {
        if (err3) {
          console.error('Error freeing spaces:', err3);
          return res.status(500).json({ error: 'Error releasing spaces' });
        }

        connection.query(deleteQuery, [id], (err4, result) => {
          if (err4) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ error: 'Failed to delete user' });
          }
            if (result.affectedRows === 0) {
              return res.status(404).json({ error: 'User not found' });
            }
            res.json({ message: 'User deleted successfully' });
          });
      });
    });
  });
});

//Finds user email
app.get('/api/users/:id/email', (req, res) => { 
  const userId = req.params.id;

  const query = 'SELECT Email FROM logininfo WHERE UserID = ?';
  connection.query(query, [userId], (err, results) => {
    if (err || results.length === 0) {
      console.error("Email lookup error:", err);
      return res.status(500).json({ error: "Failed to retrieve email" });
    }

    res.json({ email: results[0].Email });
  });
});

app.listen(port, () => { //Launches server on port
  console.log(`Listening on port ${port}`);
});


