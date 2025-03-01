// /routes/assignmentRoutes.js
const express = require('express');
const authenticateJWT = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/authorizationMiddleware');
const { createAssignment, getAssignments, submitAssignment } = require('../controllers/AssignmentController');
const router = express.Router();

// Create a new assignment (only teachers and TAs)
router.post('/', authenticateJWT, authorize('manage', 'Assignment'), createAssignment);

// Get assignments (students, teachers, and TAs)
router.get('/', authenticateJWT, authorize('read', 'Assignment'), getAssignments);

// Submit an assignment (students)
router.post('/submit', authenticateJWT, authorize('submit', 'Assignment'), submitAssignment);

module.exports = router;
