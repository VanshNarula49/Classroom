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
    SELECT a.*, u.name AS creator_name
    FROM assignment a
    LEFT JOIN public."User" u ON a.createdby = u.userid
    WHERE a.courseid = $1
    ORDER BY a.createdat DESC;
  `;
  const assignmentResult = await pool.query(assignmentQuery, [courseId]);
  
  // If there are no assignments, return an empty array
  if (assignmentResult.rows.length === 0) return [];
 
  return assignmentResult.rows;
};

/**
 * Create a new assignment
 * @param {Object} assignmentData - The assignment data
 * @returns {Object} The created assignment
 */
const createAssignment = async (assignmentData) => {
  const { title, instructions, dueDate, points, courseId, createdBy, resource } = assignmentData;
  
  // Use the 'resources' column (plural) as it's defined in the database schema
  const query = `
    INSERT INTO assignment (
      title, 
      description, 
      duedate, 
      resources, 
      courseid, 
      createdby, 
      createdat
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING *
  `;
  
  const result = await pool.query(query, [
    title,
    instructions,
    dueDate,
    resource, // Store in the 'resources' column
    courseId,
    createdBy
  ]);
  
  return result.rows[0];
};

module.exports = { 
  getAssignmentById, 
  getAssignmentsByCourseId,
  createAssignment 
};
