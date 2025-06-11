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
const announcementRoutes = require('./routes/announcementRoutes')
const commentRoutes = require('./routes/commentRoutes')
const gradeRoutes = require('./routes/gradeRoutes') // Import grade routes
const pool = require('./config/dbConfig'); // Using pg connection pool
const errorHandler = require('./middlewares/errorMiddleware'); // Import error handler
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost',
    'http://localhost:80',
    'http://127.0.0.1',
    'http://127.0.0.1:80'
  ],
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

// Passport.js authentication setup
require('./config/Passport')(passport);  // Initialize Passport.js

// Routes - Add /api prefix to all routes
app.use('/users', userRoutes);
app.use('/courses',coursesRoutes)
app.use('/material',materialRoutes)
app.use('/assignments',assignmentsRoutes)
app.use('/queries',queryRoutes)
app.use('/submissions', submissionRoutes)
app.use('/announcements', announcementRoutes)
app.use('/comments', commentRoutes)
app.use('/grades', gradeRoutes) // Register grade routes

// Health check route (keep consistent with other routes)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Classroom API is running',
    timestamp: new Date().toISOString()
  });
});

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
