// /controllers/submissionController.js
const pool = require('../config/dbConfig');
const path = require('path');
const { generateSubmissionResource, getPresignedUrlForGet } = require('../utils/resourceGenerators');
const { generateSecureUploadUrl, verifyUploadToken } = require('../utils/secureUpload');
const { getAssignmentById } = require('../models/Assignment');
const { createSubmission, getSubmissionById, getLatestUserSubmissionByAssignment } = require('../models/Submission');
const checkAbilityForResource = require('../middlewares/abilityMiddleware.js');
const { getCourseById } = require('../models/Course');
const { generateCourseResource } = require('../utils/resourceGenerators');

// Loader function to generate minimal submission resource for authorization
const submissionLoader = async (req) => {
  // For creating a new submission, we check against a temporary resource
  // based on the assignment and student information
  const assignmentId = req.query.assignmentId || req.body.assignmentId || req.params.assignmentId;
  
  if (!assignmentId) {
    throw { status: 400, message: 'Assignment ID is required', origin: 'Controller' };
  }
  
  // Get the assignment to check if it exists
  const assignment = await getAssignmentById(assignmentId);
  if (!assignment) {
    throw { status: 404, message: 'Assignment not found', origin: 'Database' };
  }

  // Get course details to properly set up the course context
  const courseId = assignment.courseid;
  const dbCourse = await getCourseById(courseId);
  if (!dbCourse) {
    throw { status: 404, message: 'Course not found', origin: 'Database' };
  }
  
  // Generate proper course resource with all required fields
  const courseResource = generateCourseResource(dbCourse);
  
  // Create a temporary submission resource for ability check
  const submissionResource = {
    studentid: req.user.userId,
    assignment: {
      assignmentid: assignmentId,
      course: courseResource
    }
  };
  
  return submissionResource;
};

// Loader function to load a specific submission for authorization checks
const submissionReaderLoader = async (req) => {
  const assignmentId = req.params.assignmentId;
  const userId = req.params.userId || req.user.userId;
  
  if (!assignmentId) {
    throw { status: 400, message: 'Assignment ID is required', origin: 'Controller' };
  }
  
  // Get the latest submission for this assignment and user
  const submission = await getLatestUserSubmissionByAssignment(assignmentId, userId);
  
  if (!submission) {
    throw { status: 404, message: 'Submission not found', origin: 'Database' };
  }
  
  // Return the submission with the nested assignment and course for CASL checks
  return submission;
};

// Specific loader for viewing another user's submission - requires teacher/TA role
const otherUserSubmissionLoader = async (req) => {
  const assignmentId = req.params.assignmentId;
  const userId = req.params.userId;
  
  if (!assignmentId || !userId) {
    throw { status: 400, message: 'Assignment ID and User ID are required', origin: 'Controller' };
  }
  
  // Get the latest submission for this assignment and user
  const submission = await getLatestUserSubmissionByAssignment(assignmentId, userId);
  
  if (!submission) {
    throw { status: 404, message: 'Submission not found', origin: 'Database' };
  }
  
  // Return the submission with the nested assignment and course for CASL checks
  return submission;
};

const getPresignedUrl = [
  checkAbilityForResource('create', 'Submission', submissionLoader),
  async (req, res) => {
    try {
      // Extract parameters from query
      const { fileExtension, assignmentId, courseId } = req.query;
      
      // Validate required parameters
      if (!fileExtension || !assignmentId || !courseId) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required parameters: fileExtension, assignmentId, and courseId are all required'
        });
      }
      
      // Clean up file extension (ensuring it starts with a dot)
      let normalizedExtension = fileExtension;
      if (!normalizedExtension.startsWith('.')) {
        normalizedExtension = '.' + normalizedExtension;
      }
      
      // Generate a secure upload URL using our JWT approach
      const { url, token } = await generateSecureUploadUrl({
        userId: req.user.userId,
        assignmentId: assignmentId,
        courseId: courseId,
        fileExtension: normalizedExtension,
        expiresIn: 300 // 5 minutes expiration
      });
      
      // Return the presigned URL and the token (key for frontend compatibility)
      // The frontend expects a 'key' field but will receive our secure token instead
      res.json({
        status: 'success',
        data: {
          url,
          key: token, // The frontend expects 'key' but we send the secure token
          expiresIn: 300
        }
      });
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to generate presigned URL for file upload',
        error: error.message
      });
    }
  }
];


const createSubmissionRecord = [
  checkAbilityForResource('create', 'Submission', submissionLoader),
  async (req, res) => {
    try {
      const { assignmentId, key: token } = req.body;
      
      // Validate required parameters
      if (!assignmentId || !token) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required parameters: assignmentId and key are required'
        });
      }
      
      // Verify the upload token
      const tokenData = verifyUploadToken(token);
      if (!tokenData) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid or expired upload token'
        });
      }
      
      // Verify the token belongs to this user and assignment
      if (tokenData.userId != req.user.userId || tokenData.assignmentId != assignmentId) {
        return res.status(403).json({
          status: 'error',
          message: 'Upload token does not match the current assignment or user'
        });
      }
      
      // Check if the assignment exists and get the due date
      const assignment = await getAssignmentById(assignmentId);
      if (!assignment) {
        return res.status(404).json({
          status: 'error',
          message: 'Assignment not found'
        });
      }
      
      // Check if submission is before the due date
      const now = new Date();
      const dueDate = new Date(assignment.duedate);
      
      if (now > dueDate) {
        return res.status(400).json({
          status: 'error',
          message: 'Submission rejected: Assignment due date has passed',
          data: {
            dueDate: dueDate,
            currentTime: now
          }
        });
      }
      
      // Create submission record in database using the secure fileKey from the token
      const submissionData = {
        assignmentId,
        studentId: req.user.userId,
        filePath: tokenData.fileKey // Use the secure file key from the verified token
      };
      
      const submission = await createSubmission(submissionData);
      
      res.status(201).json({
        status: 'success',
        message: 'Submission created successfully',
        data: { submission }
      });
    } catch (error) {
      console.error('Error creating submission:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create submission record',
        error: error.message
      });
    }
  }
];

/**
 * Get the latest submission for a specific assignment and user
 * The requesting user must have proper permissions (be the student who submitted,
 * or a teacher/TA in the course)
 */
const getLatestUserSubmission = [
  // Apply CASL authorization - checks if user can "read" this submission
  checkAbilityForResource('read', 'Submission', submissionReaderLoader),
  
  // Handler function after authorization passes
  async (req, res, next) => {
    try {
      const assignmentId = req.params.assignmentId;
      const userId = req.params.userId || req.user.userId;
      
      // The submission was already loaded in submissionReaderLoader
      // and attached to req.resource by the middleware
      const submission = req.resource;
      
      // Generate a view-only URL for the submission file instead of sending the filepath
      let responseData = { ...submission };
      
      if (submission.filepath) {
        // Create a view-only URL for the submission file with 1 hour expiration
        const viewUrl = await getPresignedUrlForGet(`classroom-uploads/${submission.filepath}`, 3600);
        responseData.fileUrl = viewUrl;
        
        // Remove the raw filepath to avoid exposing storage paths
        delete responseData.filepath;
      }
      
      // Don't send the enriched objects (assignment and course details)
      if (responseData.assignment) {
        delete responseData.assignment;
      }
      
      res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Latest submission fetched successfully',
        data: responseData
      });
    } catch (error) {
      next(error);
    }
  }
];

/**
 * Get the latest submission for another user (teacher/TA function)
 * This endpoint specifically requires the "viewAnyUserSubmission" permission
 * which is only granted to teachers and TAs who are part of the course
 */
const getOtherUserSubmission = [
  // Apply CASL authorization with the special "viewAnyUserSubmission" ability
  checkAbilityForResource('viewAnyUserSubmission', 'Submission', otherUserSubmissionLoader),
  
  // Handler function after authorization passes
  async (req, res, next) => {
    try {
      const assignmentId = req.params.assignmentId;
      const userId = req.params.userId;
      
      // The submission was already loaded in otherUserSubmissionLoader
      // and attached to req.resource by the middleware
      const submission = req.resource;
      
      // Generate a view-only URL for the submission file instead of sending the filepath
      let responseData = { ...submission };
      
      if (submission.filepath) {
        // Create a view-only URL for the submission file with 1 hour expiration
        const viewUrl = await getPresignedUrlForGet(`classroom-uploads/${submission.filepath}`, 3600);
        responseData.fileUrl = viewUrl;
        
        // Remove the raw filepath to avoid exposing storage paths
        delete responseData.filepath;
      }
      
      // Don't send the enriched objects (assignment and course details)
      if (responseData.assignment) {
        delete responseData.assignment;
      }
      
      res.status(200).json({
        status: 'success',
        code: 200,
        message: 'User submission fetched successfully',
        data: responseData
      });
    } catch (error) {
      next(error);
    }
  }
];

module.exports = {
  getPresignedUrl,
  createSubmissionRecord,
  getLatestUserSubmission,
  getOtherUserSubmission
};