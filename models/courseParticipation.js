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

// Update a participant's role in a course
const updateParticipantRole = async (userId, courseId, newRole) => {
  // Verify the role is valid
  if (!['Professor', 'TA', 'Student'].includes(newRole)) {
    throw new Error('Invalid role specified. Valid roles are: Professor, TA, Student');
  }
  
  const query = `
    UPDATE public.courseparticipation
    SET role = $1
    WHERE userid = $2 AND courseid = $3
    RETURNING *;
  `;
  
  try {
    const result = await pool.query(query, [newRole, userId, courseId]);
    
    if (result.rows.length === 0) {
      throw new Error('No participation record found for this user in this course');
    }
    
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

module.exports = { 
  getParticipationForCourse,
  joinCourse,
  updateParticipantRole
};
