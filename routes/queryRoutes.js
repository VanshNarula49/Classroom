// /routes/userRoutes.js
const express = require('express');
const { executeQuery} = require('../controllers/queryController');
const authenticateJWT = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/:queryId', executeQuery);

module.exports = router;

