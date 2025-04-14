// /controllers/gradeController.js
const pool = require('../config/dbConfig');
const { createOrUpdateGrade, getGradesBySubmission } = require('../models/Grade');
const { getSubmissionById } = require('../models/Submission');
const { getAssignmentById } = require('../models/Assignment');
const { getCourseById } = require('../models/Course');
const { generateCourseResource } = require('../utils/resourceGenerators');
const checkAbilityForResource = require('../middlewares/abilityMiddleware.js');

// Loader function for grade submission authorization check
const gradeSubmissionLoader = async (req) => {
  const submissionId = req.params.submissionId || req.body.submissionId;
  
  if (!submissionId) {
    throw { status: 400, message: 'Submission ID is required', origin: 'Controller' };
  }
  
  // Get the submission details
  const submission = await getSubmissionById(submissionId);
  if (!submission) {
    throw { status: 404, message: 'Submission not found', origin: 'Database' };
  }
  
  // Get assignment details
  const assignment = await getAssignmentById(submission.assignmentid);
  if (!assignment) {
    throw { status: 404, message: 'Assignment not found', origin: 'Database' };
  }
  
  // Get course details
  const courseId = assignment.courseid;
  const dbCourse = await getCourseById(courseId);
  if (!dbCourse) {
    throw { status: 404, message: 'Course not found', origin: 'Database' };
  }
  
  // Generate course resource with all required fields for ability check
  const courseResource = generateCourseResource(dbCourse);
  
  // Create assignment resource with course attached
  const assignmentResource = {
    ...assignment,
    course: courseResource
  };
  
  return assignmentResource;
};

/**
 * Create a new grade entry for a submission
 * This action can only be performed by teachers and TAs
 */
const createGrade = [
  // Check if user has permission to grade this assignment
  checkAbilityForResource('grade', 'Assignment', gradeSubmissionLoader),
  
  async (req, res) => {
    try {
      const { submissionId, score, feedback } = req.body;
      
      // Validate required fields
      if (!submissionId || score === undefined) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required parameters: submissionId and score are required'
        });
      }
      
      // Get submission and assignment details to validate against default grade
      const submission = await getSubmissionById(submissionId);
      if (!submission) {
        return res.status(404).json({
          status: 'error',
          message: 'Submission not found'
        });
      }
      
      const assignment = await getAssignmentById(submission.assignmentid);
      if (!assignment) {
        return res.status(404).json({
          status: 'error',
          message: 'Assignment not found'
        });
      }
      
      const maxPossibleScore = assignment.defaultgrade;
      
      // Validate score range (0 to defaultgrade)
      if (score < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Score cannot be less than 0'
        });
      }
      
      if (score > maxPossibleScore) {
        return res.status(400).json({
          status: 'error',
          message: `Score cannot exceed the maximum possible score (${maxPossibleScore}) for this assignment`
        });
      }
      
      // Create the grade
      const gradeData = {
        submissionId,
        score,
        feedback: feedback || '',
        gradedBy: req.user.userId
      };
      
      const grade = await createOrUpdateGrade(gradeData);
      
      res.status(201).json({
        status: 'success',
        message: 'Grade submitted successfully',
        data: { grade }
      });
    } catch (error) {
      console.error('Error creating grade:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to submit grade',
        error: error.message
      });
    }
  }
];

/**
 * Get all grades for a specific submission
 */
const getSubmissionGrades = [
  // Check if user has permission to view grades
  checkAbilityForResource('grade', 'Assignment', gradeSubmissionLoader),
  
  async (req, res) => {
    try {
      const { submissionId } = req.params;
      
      if (!submissionId) {
        return res.status(400).json({
          status: 'error',
          message: 'Submission ID is required'
        });
      }
      
      // Get all grades for this submission
      const grades = await getGradesBySubmission(submissionId);
      
      res.status(200).json({
        status: 'success',
        message: 'Grades retrieved successfully',
        data: { grades }
      });
    } catch (error) {
      console.error('Error fetching grades:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch grades',
        error: error.message
      });
    }
  }
];

module.exports = {
  createGrade,
  getSubmissionGrades
};