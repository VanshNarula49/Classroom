// /routes/courseRoutes.js
const express = require('express');
const authenticateJWT = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/abilityMiddleware');
const { createCourse, getCourses } = require('../controllers/CourseController');
const router = express.Router();

// Create a new course (only teachers)
router.post('/', authenticateJWT, authorize('manage', 'Course'), createCourse);

// Get courses (all users who are enrolled in the course or teachers/TAs can access)
router.get('/', authenticateJWT, authorize('read', 'Course'), getCourses);

module.exports = router;
