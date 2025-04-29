const express = require('express');
const connection = require('./db'); //Importing the connection
const path = require('path');

const app = express();
const port = 8080;

app.use(express.json());

//Serve login page
app.use(express.static(path.join(__dirname, 'Public')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'login.html'));
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

function getRandomInt(max) { //Simple rng algorithm for ID generation
    return Math.floor(Math.random() * max);
  }

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

    const compare = 'SELECT Passkey, Type FROM logininfo WHERE Username = ?';
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
            return res.status(200).json({ message: 'Login successful', Type: accType });
        } else {
            return res.status(401).json({ error: 'Incorrect username or password' });
        }
    });
});
