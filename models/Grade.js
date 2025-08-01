// models/Grade.js
const pool = require('../config/dbConfig');

const getGradeById = async (gradeId) => {
  const gradeQuery = 'SELECT * FROM grade WHERE gradeid = $1';
  const gradeResult = await pool.query(gradeQuery, [gradeId]);
  return gradeResult.rows[0] || null;
};

/**
 * Create a new grade for a submission or update the grade if it exists
 * @param {Object} gradeData - The grade data object
 * @param {number} gradeData.submissionId - ID of the submission being graded
 * @param {number} gradeData.score - The score awarded
 * @param {string} gradeData.feedback - Feedback for the submission
 * @param {number} gradeData.gradedBy - ID of the user grading the submission
 * @returns {Object} The created or updated grade
 */
// const createOrUpdateGrade = async (gradeData) => {
//   const { submissionId, score, feedback, gradedBy } = gradeData;
  
//   // Find the highest gradeseq for this submission
//   const seqQuery = 'SELECT MAX(gradeseq) FROM grade WHERE submissionid = $1';
//   const seqResult = await pool.query(seqQuery, [submissionId]);
  
//   // Set the next sequence number (1 if no grades exist yet)
//   const nextSeq = (seqResult.rows[0].max || 0) + 1;
  
//   // Create a new grade
//   const query = `
//     INSERT INTO grade (submissionid, gradeseq, score, feedback, gradedby)
//     VALUES ($1, $2, $3, $4, $5)
//     RETURNING *`;
  
//   const values = [submissionId, nextSeq, score, feedback, gradedBy];
  
//   const result = await pool.query(query, values);
//   return result.rows[0];
// };
const createOrUpdateGrade = async (gradeData) => {
  const { submissionId, score, feedback, gradedBy } = gradeData;
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    // Lock the entire grade table rows for this submission to prevent race conditions
    const lockQuery = 'SELECT * FROM grade WHERE submissionid = $1 FOR UPDATE';
    await client.query(lockQuery, [submissionId]);
    
    // Now safely get the MAX after acquiring the lock
    const seqQuery = 'SELECT MAX(gradeseq) FROM grade WHERE submissionid = $1';
    const seqResult = await client.query(seqQuery, [submissionId]);
    
    // Set the next sequence number (1 if no grades exist yet)
    const nextSeq = (seqResult.rows[0].max || 0) + 1;
    
    // Create a new grade
    const query = `
      INSERT INTO grade (submissionid, gradeseq, score, feedback, gradedby)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`;
    
    const values = [submissionId, nextSeq, score, feedback, gradedBy];
    
    const result = await client.query(query, values);
    
    // Commit transaction
    await client.query('COMMIT');
    
    return result.rows[0];
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // Release the client back to the pool
    client.release();
  }
};
/**
 * Get all grades for a specific submission
 * @param {number} submissionId - The ID of the submission
 * @returns {Array} Array of grade records
 */
const getGradesBySubmission = async (submissionId) => {
  const query = `
    SELECT g.*, u.name as grader_name 
    FROM grade g
    LEFT JOIN "User" u ON g.gradedby = u.userid
    WHERE g.submissionid = $1
    ORDER BY g.gradeseq DESC`;
    
  const result = await pool.query(query, [submissionId]);
  return result.rows;
};

module.exports = { 
  getGradeById,
  createOrUpdateGrade,
  getGradesBySubmission
};
