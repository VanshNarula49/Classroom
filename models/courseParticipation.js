// models/CourseParticipation.js
const pool = require('../config/dbConfig');

const getParticipationForCourse = async (userId, courseId) => {
  const query = 'SELECT * FROM courseparticipation WHERE userid = $1 AND courseid = $2';
  const result = await pool.query(query, [userId, courseId]);
  return result.rows[0] || null;
};

const joinCourse = async (userId, courseId, role = 'Student') => {
  const query = `
    INSERT INTO public.courseparticipation (courseid, userid, role, enrollmentdate)
    VALUES ($1, $2, $3, CURRENT_DATE)
    RETURNING *;
  `;
  
  try {
    const result = await pool.query(query, [courseId, userId, role]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

module.exports = { 
  getParticipationForCourse,
  joinCourse
};
