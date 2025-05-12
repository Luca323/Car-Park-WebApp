const express = require('express');
const connection = require('./db');
const path = require('path');
const app = express();
const nodemailer = require('nodemailer');
const session = require('express-session');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'chopseven@gmail.com',
    pass: 'bxqf vaim aucu qgyr' 
  }
});

const { v4: uuidv4 } = require('uuid');
let pendingVerifications = {}; // { token: username }


app.use(session({
  secret: process.env.SESSION_SECRET || 'strong-fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

const port = 8080;

//================================== URLs ====================================================
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'login.html'));
});

app.get('/contactus', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'contact-us.html'));
});

app.get('/bookparking', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'book-parking.html'));
});

app.get('/driverdashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'driver-dashboard.html'));
});

app.get('/managecarparks', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'manage-carparks.html'));
});

app.get('/manageevents', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'manage-events.html'));
});

app.get('/managespaces', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'manage-spaces.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'register.html'));
});

app.get('/sendnotif', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'send-notif.html'));
});

app.get('/admindashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'admin-dashboard.html'));
});

app.use(express.json());

//Serve dashboard
app.use(express.static(path.join(__dirname, 'Public')));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});

app.get('/api/me', (req, res) => {
  if (req.session && req.session.UserID) {
    res.json({ userID: req.session.UserID });
  } else {
    res.json({ userID: null });
  }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

function getRandomInt(max) { 
    return Math.floor(Math.random() * max);
  }

//============================ Brute force prevention for login ==============================
const rateLimit = require('express-rate-limit');

// Create a limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 1000, 
  max: 5, 
  message: {
    error: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

//============================ Login/Register/Logout ================================================
const bcrypt = require('bcrypt');

app.post('/login', loginLimiter, (req, res) => {
  const { username, passkey } = req.body;
  if (!username || !passkey) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  

  const query = 'SELECT UserID, Passkey, Type, Verified FROM logininfo WHERE Username = ?';
  connection.query(query, [username], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length !== 1) return res.status(401).json({ error: 'Invalid login' });
    if (Number(results[0].Verified) !== 1) {
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }
    

    const storedHash = results[0].Passkey;
    const match = await bcrypt.compare(passkey, storedHash);

    if (match) {
      req.session.UserID = results[0].UserID;
      return res.status(200).json({ message: 'Login successful', Type: results[0].Type });
    } else {
      return res.status(401).json({ error: 'Invalid login' });
    }
  });
});

const saltRounds = 10; 

// Registration endpoint
app.post('/register', (req, res) => {
    const { username, passkey, phone, email, regNum } = req.body;

    if (!username || !passkey) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const checkQuery = 'SELECT * FROM logininfo WHERE Username = ?';
    connection.query(checkQuery, [username], (err, results) => {
        if (err) {
            console.error('Check user error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash the password before storing
        bcrypt.hash(passkey, saltRounds, (err, hashedPassword) => {
            if (err) {
                console.error('Password hashing error:', err);
                return res.status(500).json({ error: 'Failed to process password' });
            }

            const genID = getRandomInt(9999);
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
                  from: '"ParkEase" <chopseven@gmail.com>',
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

  const updateQuery = 'UPDATE logininfo SET Verified = TRUE WHERE Username = ?';
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

app.get('/api/spaces', (req, res) => {
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

    res.json(results);
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

app.put('/api/carparks/:id', (req, res) => {
    const { name, size } = req.body;
    const { id } = req.params;
  
    if (!name || size == null) {
      return res.status(400).json({ error: 'Name and size are required' });
    }
  
    const query = 'UPDATE Carparks SET Name = ?, Size = ? WHERE CarparkID = ?';
    connection.query(query, [name, size, id], (err, result) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).json({ error: 'Failed to update car park' });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Car park not found' });
      }
  
      res.json({ message: 'Car park updated' });
    });
  });

app.delete('/api/spaces/:id', (req, res) => {
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

app.get('/api/carparks', (req, res) => {
  const query = 'SELECT CarparkID, Name, Size FROM Carparks';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving car parks:', err);
      return res.status(500).json({ error: 'Failed to retrieve car parks' });
    }

    res.json(results);
  });
});

app.post('/api/carparks', (req, res) => {
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

app.delete('/api/carparks/:id', (req, res) => {
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

app.get('/api/spaces1', (req, res) => {
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

app.put('/api/spaces/:id', (req, res) => {
  const { id } = req.params;
  const { status, userId } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const query = 'UPDATE Spaces SET Status = ?, UserID = ? WHERE SpaceID = ?';

  connection.query(query, [status, userId, id], (err, result) => {
    if (err) {
      console.error('Failed to update space:', err);
      return res.status(500).json({ error: 'Failed to update space' });
    }

    res.json({ message: 'Space status updated' });
  });
});

//============================ Book Parking & Handle requests =================================================

app.post('/api/requests', (req, res) => {
  const { carParkID, userID, startDate, endDate, cost, status } = req.body;

  // Basic validation
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

// admin view - get all parking reqs with car park name
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

//============================ Notifications =================================================

app.post('/api/notify', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: 'Message content is required' });
  }

  const query = 'SELECT Email FROM logininfo WHERE Type = "driver"';

  connection.query(query, async (err, results) => {
    if (err) {
      console.error('Database error while retrieving emails:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }

    const emails = results.map(row => row.Email);
    if (emails.length === 0) {
      return res.json({ success: true, count: 0 });
    }

    // Prepare email sending
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

    const sendResults = await Promise.all(sendEmailPromises);
    const successCount = sendResults.filter(r => r !== null).length;

    res.json({ success: true, count: successCount });
  });
});




