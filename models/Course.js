// models/Course.js
const pool = require('../config/dbConfig');

const getCourseById = async (courseId) => {
  const courseQuery = 'SELECT * FROM course WHERE courseid = $1';
  const courseResult = await pool.query(courseQuery, [courseId]);
  if (courseResult.rows.length === 0) return null;
  
  const course = courseResult.rows[0];
  const participationQuery = 'SELECT userid, role FROM courseparticipation WHERE courseid = $1';
  const participationResult = await pool.query(participationQuery, [courseId]);
  
  const taIds = [];
  const enrolledStudentIds = [];
  participationResult.rows.forEach(({ userid, role }) => {
    if (role.toLowerCase() === 'ta') {
      taIds.push(userid);
    } else if (role.toLowerCase() === 'student') {
      enrolledStudentIds.push(userid);
    }
  });
  course.taIds = taIds;
  course.enrolledStudentIds = enrolledStudentIds;
  return course;
};

module.exports = { getCourseById };
