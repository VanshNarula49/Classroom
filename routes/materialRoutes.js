// /routes/MaterialRoutes.js
const express = require('express');
const authenticateJWT = require('../middlewares/authMiddleware');
const { getMaterialsForCourse, getMaterialUploadUrl, createCourseMaterial } = require('../controllers/materialController');
const router = express.Router();

// Get Materials (students, teachers, and TAs)
router.get('/:courseid', authenticateJWT, getMaterialsForCourse);

// Get presigned URL for material upload (only teachers and TAs)
router.get('/:courseid/presigned-url', authenticateJWT, getMaterialUploadUrl);

// Create Material (only teachers and TAs)
router.post('/:courseid', authenticateJWT, createCourseMaterial);

module.exports = router;
