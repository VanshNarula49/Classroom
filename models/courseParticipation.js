// models/CourseParticipation.js
const pool = require('../config/dbConfig');

const getParticipationForCourse = async (userId, courseId) => {
  const query = 'SELECT * FROM courseparticipation WHERE userid = $1 AND courseid = $2';
  const result = await pool.query(query, [userId, courseId]);
  return result.rows[0] || null;
};

module.exports = { getParticipationForCourse };
