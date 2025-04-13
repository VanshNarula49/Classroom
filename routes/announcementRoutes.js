// routes/announcementRoutes.js
const express = require('express');
const authenticateJWT = require('../middlewares/authMiddleware');
const { getAnnouncementsForCourse, getAnnouncement, createCourseAnnouncement } = require('../controllers/announcementController');
const router = express.Router();

// Get all announcements for a course
// Accessible by all course participants (students, teachers, TAs)
router.get('/:courseid', authenticateJWT, getAnnouncementsForCourse);

// Get a specific announcement by ID
// Accessible by all course participants (students, teachers, TAs)
router.get('/single/:id', authenticateJWT, getAnnouncement);

// Create a new announcement for a course
// Only accessible by teachers and TAs of the course
router.post('/:courseid', authenticateJWT, createCourseAnnouncement);

module.exports = router;