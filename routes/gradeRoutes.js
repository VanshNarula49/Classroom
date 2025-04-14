// /routes/gradeRoutes.js
const express = require('express');
const authenticateJWT = require('../middlewares/authMiddleware');
const { createGrade, getSubmissionGrades } = require('../controllers/gradeController');
const router = express.Router();

// Create a new grade for a submission (POST /api/grades)
// Only teachers and TAs can perform this action
router.post('/', authenticateJWT, createGrade);

// Get all grades for a specific submission (GET /api/grades/submission/:submissionId)
// Only teachers and TAs can perform this action
router.get('/submission/:submissionId', authenticateJWT, getSubmissionGrades);

module.exports = router;