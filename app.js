// /app.js
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const userRoutes = require('./routes/userRoutes');
const coursesRoutes = require('./routes/courseRoutes')
const assignmentsRoutes = require('./routes/assignmentRoutes')
const queryRoutes = require('./routes/queryRoutes')
const materialRoutes = require('./routes/materialRoutes')
const submissionRoutes = require('./routes/submissionRoutes')
const pool = require('./config/dbConfig'); // Using pg connection pool
const errorHandler = require('./middlewares/errorMiddleware'); // Import error handler
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Passport.js authentication setup
require('./config/Passport')(passport);  // Initialize Passport.js

// Routes
app.use('/api/users', userRoutes);
app.use('/api/courses',coursesRoutes)
app.use('/api/material',materialRoutes)
app.use('/api/assignments',assignmentsRoutes)
app.use('/api/queries',queryRoutes)
app.use('/api/submissions', submissionRoutes)

// Test DB connection before starting the server
pool.connect()
  .then(() => {
    console.log('Database connected successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });
  
// Apply error handling middleware (this will catch any errors)
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
