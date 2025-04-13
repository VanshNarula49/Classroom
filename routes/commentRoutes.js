// /routes/commentRoutes.js
const express = require('express');
const authenticateJWT = require('../middlewares/authMiddleware');
const { 
  getComments, 
  create, 
  update, 
  remove 
} = require('../controllers/commentController');
const router = express.Router();

// Get comments for a parent resource (announcement, material, submission)
// Route: GET /api/comments/:parentType/:parentId
router.get('/:parentType/:parentId', authenticateJWT, getComments);

// Add a new comment to a parent resource
// Route: POST /api/comments
router.post('/', authenticateJWT, create);

// Update a comment (only by the comment author)
// Route: PUT /api/comments/:commentId
router.put('/:commentId', authenticateJWT, update);

// Delete a comment (only by the comment author or course instructor)
// Route: DELETE /api/comments/:commentId
router.delete('/:commentId', authenticateJWT, remove);

module.exports = router;