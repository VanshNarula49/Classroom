// /routes/assignmentRoutes.js
const express = require('express');
const authenticateJWT = require('../middlewares/authMiddleware');
const { createAssignment, getAssignments, getAssignmentUploadUrl } = require('../controllers/AssignmentController');
const router = express.Router();

// Create a new assignment (only teachers and TAs)
router.post('/:id', authenticateJWT, createAssignment);

// Get assignments (students, teachers, and TAs)
router.get('/:id', authenticateJWT, getAssignments);

// Get a presigned URL for uploading assignment files
router.get('/:id/presigned-url', authenticateJWT, getAssignmentUploadUrl);

module.exports = router;
