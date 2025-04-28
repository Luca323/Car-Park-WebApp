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
    const { username, passkey } = req.body;

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

        const insertQuery = 'INSERT INTO logininfo (Username, Passkey) VALUES (?, ?)';
        connection.query(insertQuery, [username, passkey], (err, result) => {
            if (err) {
                console.error('Insert user error:', err);
                return res.status(500).json({ error: 'Database insert failed' });
            }

            res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
        });
    });
});

