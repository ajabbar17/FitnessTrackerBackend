// Load environment variables
require('dotenv').config();

// Import pg
const { Pool } = require('pg');

// Configure the database connection
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST, // Ensure this matches your database's host
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Test the connection
pool.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
  } else {
    console.log('Connected to the PostgreSQL database.');
  }
});

module.exports = pool;
