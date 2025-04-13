// models/Submission.js
const pool = require('../config/dbConfig');
const { getAssignmentById } = require('./Assignment');

const getSubmissionById = async (submissionId) => {
  const submissionQuery = 'SELECT * FROM submission WHERE submissionid = $1';
  const submissionResult = await pool.query(submissionQuery, [submissionId]);
  if (submissionResult.rows.length === 0) return null;
  
  const submission = submissionResult.rows[0];
  submission.assignment = await getAssignmentById(submission.assignmentid);
  return submission;
};

const createSubmission = async (data) => {
  const { assignmentId, studentId, filePath } = data;
  const query = `
    INSERT INTO submission (assignmentid, studentid, submitteddate, filepath) 
    VALUES ($1, $2, CURRENT_TIMESTAMP, $3) 
    RETURNING *`;
  const values = [assignmentId, studentId, filePath];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getSubmissionsByAssignment = async (assignmentId) => {
  const query = `
    SELECT s.*, u.name as student_name 
    FROM submission s 
    JOIN "User" u ON s.studentid = u.userid 
    WHERE s.assignmentid = $1 
    ORDER BY s.submitteddate DESC`;
  const result = await pool.query(query, [assignmentId]);
  return result.rows;
};

const getStudentSubmission = async (assignmentId, studentId) => {
  const query = `
    SELECT * FROM submission 
    WHERE assignmentid = $1 AND studentid = $2`;
  const result = await pool.query(query, [assignmentId, studentId]);
  return result.rows[0] || null;
};

/**
 * Get the latest submission for a specific assignment and student
 * Includes assignment details for CASL authorization
 * 
 * @param {number} assignmentId - The ID of the assignment
 * @param {number} studentId - The ID of the student
 * @returns {Object|null} The latest submission with assignment details or null if not found
 */
const getLatestUserSubmissionByAssignment = async (assignmentId, studentId) => {
  const query = `
    SELECT s.*, u.name as student_name 
    FROM submission s
    JOIN "User" u ON s.studentid = u.userid
    WHERE s.assignmentid = $1 AND s.studentid = $2
    ORDER BY s.submitteddate DESC
    LIMIT 1`;
  
  const result = await pool.query(query, [assignmentId, studentId]);
  
  if (result.rows.length === 0) return null;
  
  const submission = result.rows[0];
  
  // Include assignment details for CASL authorization
  submission.assignment = await getAssignmentById(submission.assignmentid);
  
  return submission;
};

module.exports = { 
  getSubmissionById,
  createSubmission,
  getSubmissionsByAssignment,
  getStudentSubmission,
  getLatestUserSubmissionByAssignment
};
