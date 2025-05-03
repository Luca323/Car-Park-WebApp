const express = require('express');
const connection = require('./db'); //Importing the connection
const path = require('path');
const app = express();
const session = require('express-session');

app.use(session({ //Not sure what this does tbh
  secret: 'balls',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

const port = 8080;

app.use(express.json());

//Serve login page
app.use(express.static(path.join(__dirname, 'Public')));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'dashboard.html'));
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

function getRandomInt(max) { //Simple rng algorithm for ID generation
    return Math.floor(Math.random() * max);
  }

//============================ Login/Register ================================================

//Registration endpoint
app.post('/register', (req, res) => {
    const { username, passkey, phone, email, regNum } = req.body;

    if (!username || !passkey) {
        return res.status(400).json({ error: 'Username and password are required' }); //Checking fields aren't empty
    }

    const checkQuery = 'SELECT * FROM logininfo WHERE Username = ?'; //Ensures User dosen't exist with same details
    connection.query(checkQuery, [username], (err, results) => {
        if (err) {
            console.error('Check user error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const genID = getRandomInt(9999) //Generates random int

        const insertQuery = 'INSERT INTO logininfo (UserID, Username, Passkey, PhoneNum, Email, CarNum) VALUES (?, ?, ?, ?, ?, ?)'; //Creates User in 'login info' table
        connection.query(insertQuery, [genID,username, passkey, phone, email, regNum], (err, result) => {
            if (err) {
                console.error('Insert user error:', err);
                return res.status(500).json({ error: 'Database insert failed' });
            }

            res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
        });
    });
});

//Log-In Endpoint
app.post("/login", (req, res) => {
    const { username, passkey } = req.body;

    if (!username || !passkey) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const compare = 'SELECT UserID, Passkey, Type FROM logininfo WHERE Username = ?';
    connection.query(compare, [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Incorrect username or password' });
        }

        if (results.length > 1) {
            return res.status(409).json({ error: 'Logic error: duplicate usernames' });
        }

        const storedPasskey = results[0].Passkey;
        const accType = results[0].Type;

        if (passkey === storedPasskey) {
            req.session.UserID = results[0].UserID;
            return res.status(200).json(
                { message: 'Login successful', Type: accType

                });
        } else {
            return res.status(401).json({ error: 'Incorrect username or password' });
        }
    });
});

app.get('/api/me', (req, res) => {
    res.json({ userID: req.session.UserID || null });
  });

//============================ Admin Dashboard ===============================================

app.get('/api/me', (req, res) => { //Simple reusable to retrieve userID
    res.json({ userID: req.session.UserID || null });
  });

app.get('/api/spaces', (req, res) => {
    const query = `
      SELECT 
        Spaces.SpaceID,
        Spaces.CarparkID,
        Carparks.Name AS CarparkName,
        Spaces.Price,
        Spaces.Occupied,
        Spaces.UserID
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


//============================ Manage Carpark =================================================

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

