// /routes/submissionRoutes.js
const express = require('express');
const authenticateJWT = require('../middlewares/authMiddleware');
const { 
  getPresignedUrl, 
  createSubmissionRecord, 
  getLatestUserSubmission,
  getOtherUserSubmission 
} = require('../controllers/submissionController');
const router = express.Router();

// Get presigned URL for file upload
// Route: GET /api/submissions/presigned-url
router.get('/presigned-url', authenticateJWT, getPresignedUrl);

// Create submission record after file upload
// Route: POST /api/submissions
router.post('/', authenticateJWT, createSubmissionRecord);

// Get latest submission for a specific assignment and user
// Route: GET /api/submissions/assignment/:assignmentId
// (gets current user's submission)
router.get('/assignment/:assignmentId', authenticateJWT, getLatestUserSubmission);

// Get latest submission for a specific assignment and specific user
// Route: GET /api/submissions/assignment/:assignmentId/user/:userId
// (primarily for teachers/TAs to view specific student's submission)
router.get('/assignment/:assignmentId/user/:userId', authenticateJWT, getOtherUserSubmission);

module.exports = router;
