// models/Assignment.js
const pool = require('../config/dbConfig');
const { getCourseById } = require('./Course');

const getAssignmentById = async (assignmentId) => {
  const assignmentQuery = 'SELECT * FROM assignment WHERE assignmentid = $1';
  const assignmentResult = await pool.query(assignmentQuery, [assignmentId]);
  if (assignmentResult.rows.length === 0) return null;
  
  const assignment = assignmentResult.rows[0];
  assignment.course = await getCourseById(assignment.courseid);
  return assignment;
};

module.exports = { getAssignmentById };
