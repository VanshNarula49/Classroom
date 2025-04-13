// models/Comment.js
const pool = require('../config/dbConfig');

/**
 * Get a comment by its ID
 * @param {number} commentId - The ID of the comment to retrieve
 * @returns {Promise<Object|null>} - Comment object or null if not found
 */
const getCommentById = async (commentId) => {
  const commentQuery = 'SELECT * FROM comment WHERE commentid = $1';
  const commentResult = await pool.query(commentQuery, [commentId]);
  return commentResult.rows[0] || null;
};

/**
 * Create a new comment
 * @param {Object} commentData - Comment data to insert
 * @param {string} commentData.content - Comment content
 * @param {number} commentData.postedby - User ID who posted the comment
 * @param {number} commentData.parentid - ID of the parent resource
 * @param {string} commentData.parenttype - Type of the parent ('Announcement', 'Submission', 'Material')
 * @returns {Promise<Object>} - Created comment object
 */
const createComment = async (commentData) => {
  const { content, postedby, parentid, parenttype } = commentData;
  
  const query = `
    INSERT INTO comment (content, postedby, postedat, parentid, parenttype)
    VALUES ($1, $2, NOW(), $3, $4)
    RETURNING *
  `;
  
  const result = await pool.query(query, [content, postedby, parentid, parenttype]);
  return result.rows[0];
};

/**
 * Get all comments for a specific parent resource
 * @param {number} parentId - ID of the parent resource
 * @param {string} parentType - Type of the parent ('Announcement', 'Submission', 'Material')
 * @returns {Promise<Array>} - Array of comments
 */
const getCommentsByParent = async (parentId, parentType) => {
  const query = `
    SELECT c.*, u.name as posted_by_name
    FROM comment c
    JOIN "User" u ON c.postedby = u.userid
    WHERE c.parentid = $1 AND c.parenttype = $2
    ORDER BY c.postedat
  `;
  
  const result = await pool.query(query, [parentId, parentType]);
  return result.rows;
};

/**
 * Get all comments for a specific parent entity
 * @param {string} parentType - The parent entity type (Announcement, Material, Assignment, Submission)
 * @param {number} parentId - The ID of the parent entity
 * @returns {Promise<Array>} Array of comments with user details
 */
async function getCommentsForParent(parentType, parentId) {
  const query = `
    SELECT 
      c.CommentId as commentid, 
      c.Content as content, 
      c.ParentType as parenttype, 
      c.ParentId as parentid, 
      c.PostedBy as createdby, 
      c.PostedAt as createdat,
      u.UserId as "user.id",
      u.Name as "user.name",
      u.Email as "user.email"
    FROM COMMENT c
    JOIN "User" u ON c.PostedBy = u.UserId
    WHERE c.ParentType = $1 AND c.ParentId = $2
    ORDER BY c.PostedAt ASC
  `;
  
  try {
    const result = await pool.query(query, [parentType, parentId]);
    
    // Transform the flat results into nested objects
    const comments = result.rows.map(row => {
      const { "user.id": userId, "user.name": userName, "user.email": userEmail, ...comment } = row;
      return {
        ...comment,
        user: {
          id: userId,
          name: userName,
          email: userEmail
        }
      };
    });
    
    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw { status: 500, message: 'Failed to fetch comments', origin: 'Database', details: error.message };
  }
}

/**
 * Update a comment
 * @param {number} commentId - ID of the comment to update
 * @param {string} content - New content for the comment
 * @returns {Promise<Object|null>} - Updated comment or null if not found
 */
const updateComment = async (commentId, content) => {
  const query = `
    UPDATE comment
    SET content = $1
    WHERE commentid = $2
    RETURNING *
  `;
  
  const result = await pool.query(query, [content, commentId]);
  return result.rows[0] || null;
};

/**
 * Delete a comment
 * @param {number} commentId - ID of the comment to delete
 * @returns {Promise<boolean>} - True if deleted, false if not found
 */
const deleteComment = async (commentId) => {
  const query = 'DELETE FROM comment WHERE commentid = $1 RETURNING *';
  const result = await pool.query(query, [commentId]);
  
  return result.rowCount > 0;
};

module.exports = { 
  getCommentById,
  createComment,
  getCommentsByParent,
  getCommentsForParent,
  updateComment,
  deleteComment
};
