const { Pool } = require('pg'); // PostgreSQL client
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,      // Database host (e.g., localhost or a remote IP)
  port: process.env.DB_PORT,      // Database port (5432 by default)
  user: process.env.DB_USER,      // Database username
  password: process.env.DB_PASSWORD, // Database password
  database: process.env.DB_NAME,  // Database name
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false, // Use SSL if needed
});

module.exports = pool;
