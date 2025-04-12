// /routes/MaterialRoutes.js
const express = require('express');
const authenticateJWT = require('../middlewares/authMiddleware');
const { getMaterialsForCourse } = require('../controllers/materialController');
const router = express.Router();



// Get Materials (students, teachers, and TAs)
router.get('/:courseid', authenticateJWT, getMaterialsForCourse);



module.exports = router;
