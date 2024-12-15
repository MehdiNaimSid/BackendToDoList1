const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the MySQL database!');
    }
});

// Example endpoint
app.get('/', (req, res) => {
    res.send('Welcome to the Express-MySQL server!');
});


// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

const authRoutes = require('./routes/auth');

app.use('/auth', authRoutes);

const listRoutes = require('./routes/lists');

app.use('/lists', listRoutes);

const taskRoutes = require('./routes/tasks');

app.use('/tasks', taskRoutes);

const shareRoutes = require('./routes/share');

app.use('/lists/share', shareRoutes);

