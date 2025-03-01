// models/Grade.js
const pool = require('../config/dbConfig');

const getGradeById = async (gradeId) => {
  const gradeQuery = 'SELECT * FROM grade WHERE gradeid = $1';
  const gradeResult = await pool.query(gradeQuery, [gradeId]);
  return gradeResult.rows[0] || null;
};

module.exports = { getGradeById };
