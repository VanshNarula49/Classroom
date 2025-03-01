// /routes/userRoutes.js
const express = require('express');
const { register, login ,profile} = require('../controllers/UserController');
const authenticateJWT = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/profile', authenticateJWT, profile);

module.exports = router;

