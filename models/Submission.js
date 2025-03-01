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

module.exports = { getSubmissionById };
