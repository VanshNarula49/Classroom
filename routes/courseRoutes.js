// /routes/courseRoutes.js
const express = require('express');
const authenticateJWT = require('../middlewares/authMiddleware');
const { getCourses, addCourse, getCourse, streamCourse, joinCourseByCode, getUserRole } = require('../controllers/courseController');
const router = express.Router();

// Create a new course (only teachers)
router.post('/', authenticateJWT,  addCourse);

// Join a course using a course code
router.post('/join', authenticateJWT, joinCourseByCode);

// Get courses (all users who are enrolled in the course or teachers/TAs can access)
router.get('/', authenticateJWT, getCourses);
router.get('/:id/stream', authenticateJWT, streamCourse);

// Get Course with id
router.get('/:id', authenticateJWT, getCourse);

// Get user role in a specific course
router.get('/:id/role', authenticateJWT, getUserRole);

module.exports = router;
