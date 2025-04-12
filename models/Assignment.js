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
const getAssignmentsByCourseId = async (courseId) => {
  // SQL query to retrieve all assignments for the course
  const assignmentQuery = `
    SELECT * 
    FROM assignment 
    WHERE courseid = $1
    ORDER BY createdat DESC
  `;
  const assignmentResult = await pool.query(assignmentQuery, [courseId]);
  
  // If there are no assignments, return an empty array
  if (assignmentResult.rows.length === 0) return [];
  
  // For each assignment, attach the course details using getCourseById.
  const assignments = await Promise.all(
    assignmentResult.rows.map(async (assignment) => {
      assignment.course = await getCourseById(assignment.courseid);
      return assignment;
    })
  );

  return assignments;
};
module.exports = { getAssignmentById, getAssignmentsByCourseId };
