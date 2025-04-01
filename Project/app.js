const express = require('express');
const mysql = require('mysql')
const app = express();
const port = 8080;

app.get('/',(req,res) => {
    res.send('Server Starting!')
});

app.listen(port, () => {
    console.log(`Listening on port ${port}!`)
});

var connection = mysql.createConnection({
    host: 'localhost',
    user: "root",
    password: "",
    database: "parkease"
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.stack);
        return;
    }
    console.log('Connected to MySQL as ID', connection.threadId);
});