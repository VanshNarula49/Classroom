// /routes/assignmentRoutes.js
const express = require('express');
const authenticateJWT = require('../middlewares/authMiddleware');
const { createAssignment, getAssignments, submitAssignment } = require('../controllers/AssignmentController');
const router = express.Router();

// Create a new assignment (only teachers and TAs)
// router.post('/', authenticateJWT, createAssignment);

// Get assignments (students, teachers, and TAs)
router.get('/:id', authenticateJWT, getAssignments);

// Submit an assignment (students)
// router.post('/submit', authenticateJWT, submitAssignment);

module.exports = router;
