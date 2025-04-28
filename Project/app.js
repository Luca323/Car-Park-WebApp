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

//Registration endpoint
app.post('/register', (req, res) => {
    const { username, passkey, phone, email, regNum } = req.body;

    if (!username || !passkey) {
        return res.status(400).json({ error: 'Username and password are required' }); //Checking fields aren't empty
    }

    const checkQuery = 'SELECT * FROM logininfo WHERE Username = ?'; //Ensures User dosen't exist with same email
    connection.query(checkQuery, [email], (err, results) => {
        if (err) {
            console.error('Check user error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const insertQuery = 'INSERT INTO logininfo (Username, Passkey, PhoneNum, Email, CarNum) VALUES (?, ?, ?, ?, ?)'; //Creates User in 'login info' table
        connection.query(insertQuery, [username, passkey, phone, email, regNum], (err, result) => {
            if (err) {
                console.error('Insert user error:', err);
                return res.status(500).json({ error: 'Database insert failed' });
            }

            res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
        });
    });
});

