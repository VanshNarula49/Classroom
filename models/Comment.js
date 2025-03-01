// models/Comment.js
const pool = require('../config/dbConfig');

const getCommentById = async (commentId) => {
  const commentQuery = 'SELECT * FROM comment WHERE commentid = $1';
  const commentResult = await pool.query(commentQuery, [commentId]);
  return commentResult.rows[0] || null;
};

module.exports = { getCommentById };
