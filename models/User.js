// /models/User.js
const pool = require('../config/dbConfig'); // Import the connection pool

// SQL to create a new user (used in the controller)
const createUser = async (name, email, password) => {
  const query = `
    INSERT INTO "User" (name, email, password, createdat)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    RETURNING *;
  `;
  const values = [name, email, password];  // Pass the user data into the query

  try {
    const result = await pool.query(query, values);  // Execute the query
    return result.rows[0];  // Return the created user (first row from result)
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// SQL to find a user by email (used in the login controller)
const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM "User" WHERE email = $1';  // Query to fetch user by email
  const values = [email];  // Pass email as parameter to query

  try {
    const result = await pool.query(query, values);  // Execute the query
    return result.rows[0];  // Return the user (first row from result)
  } catch (error) {
    throw error;
  }
};

// Export the functions to be used in the controller
module.exports = {
  createUser,
  findUserByEmail,
};
