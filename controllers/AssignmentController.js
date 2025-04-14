// controllers/assignment.controller.js

const checkAbilityForResource = require('../middlewares/abilityMiddleware.js');
const { getAssignmentsByCourseId, getAssignmentById, toggleGradeReleased } = require('../models/Assignment'); 
const { generateCourseResource } = require('../utils/resourceGenerators');
const { getCourseById } = require('../models/Course');
const { generateSecureUploadUrl, verifyUploadToken, generateSecureAssignmentUploadUrl } = require('../utils/secureUpload');
const { getPresignedUrlForGet } = require('../config/minio');
const pool = require('../config/dbConfig');

/**
 * Loader function for the assignments endpoint.
 * It retrieves the course by ID and returns a minimal resource object
 * that is used by the CASL middleware to enforce permissions.
 *
 * Expected to return an object with a key "course", so that CASL rules
 * on "Assignment" (which reference assignment.course) work properly.
 */
const assignmentCourseGen = async (req) => {
  if (!req.params || !req.params.id) {
    throw { status: 400, message: 'Course ID is required', origin: 'AssignmentController' };
  }
  const courseId = req.params.id;
  if (isNaN(courseId)) {
    throw { status: 400, message: 'Course ID must be a valid number', origin: 'AssignmentController' };
  }
  const rawCourse = await getCourseById(courseId);
  if (!rawCourse) {
    throw { status: 404, message: 'Course not found', origin: 'Database' };
  }
  // Generate a minimal course resource for CASL
  const course = generateCourseResource(rawCourse);
  // Return an object with property "course" as expected by CASL rules for Assignment
  return { course };
};

/**
 * Controller to get all assignments for a given course.
 * Uses a CASL middleware to ensure the current user is allowed to read assignments
 * for the course.
 *
 * Route: GET /courses/:id/assignments
 */
const getAssignments = [
  checkAbilityForResource('read', 'Assignment', assignmentCourseGen),
  async (req, res, next) => {
    try {
      const courseId = req.params.id;
      const assignments = await getAssignmentsByCourseId(courseId);
      
      // Generate signed URLs for assignments with resources/files
      const assignmentsWithUrls = await Promise.all(assignments.map(async (assignment) => {
        if (assignment.resources) {
          // Create a presigned URL for viewing the file with 1 hour expiration
          assignment.resources = await getPresignedUrlForGet(`classroom-uploads/${assignment.resources}`, 3600);
          // Remove raw filepath from response for security
      
        }
        return assignment;
      }));
      
      res.json({
        status: 'success',
        code: 200,
        message: 'Assignments fetched successfully.',
        data: assignmentsWithUrls
      });
    } catch (error) {
      next(error);
    }
  }
];

/**
 * Controller to get a presigned URL for uploading assignment files.
 * Only teachers and TAs of the course can get the upload URL.
 */
const getAssignmentUploadUrl = [
  checkAbilityForResource('create', 'Assignment', assignmentCourseGen),
  
  async (req, res, next) => {
    try {
      // Extract parameters from query
      const { fileExtension } = req.query;
      const courseId = req.params.id;
      
      // Validate required parameters
      if (!fileExtension) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required parameter: fileExtension is required'
        });
      }
      
      // Clean up file extension (ensuring it starts with a dot)
      let normalizedExtension = fileExtension;
      if (!normalizedExtension.startsWith('.')) {
        normalizedExtension = '.' + normalizedExtension;
      }
      
      // Generate a secure upload URL using our assignment-specific function
      const { url, token } = await generateSecureAssignmentUploadUrl({
        userId: req.user.userId,
        courseId: courseId,
        fileExtension: normalizedExtension,
        expiresIn: 300 // 5 minutes expiration
      });
      
      // Return the presigned URL and the token
      res.json({
        status: 'success',
        data: {
          url,
          key: token, // The frontend expects 'key' but we send the secure token
          expiresIn: 300
        }
      });
    } catch (error) {
      console.error('Error generating assignment upload URL:', error);
      next(error);
    }
  }
];

/**
 * Controller to create a new assignment.
 * Only teachers and TAs of the course can create assignments.
 */
const createAssignment = [
  checkAbilityForResource('create', 'Assignment', assignmentCourseGen),
  
  async (req, res, next) => {
    try {
      const courseId = req.params.id;
      const userId = req.user.userId;
      const { title, instructions, dueDate, points, key: token } = req.body;

      // Validate required fields
      if (!title) {
        return res.status(400).json({
          status: 'error',
          code: 400,
          message: 'Title is required for creating an assignment',
        });
      }

      // Initialize resource as null (for assignments without attachments)
      let resource = null;

      // If token is provided, verify it and get the filepath
      if (token) {
        // Verify the upload token
        const tokenData = verifyUploadToken(token);
        if (!tokenData) {
          return res.status(400).json({
            status: 'error',
            message: 'Invalid or expired upload token'
          });
        }
        
        // Verify the token belongs to this user and course
        if (tokenData.userId != userId || tokenData.courseId != courseId) {
          return res.status(403).json({
            status: 'error',
            message: 'Upload token does not match the current course or user'
          });
        }

        // Use the secure fileKey from the token
        resource = tokenData.fileKey;
      }

      // Create the assignment in the database
      const insertQuery = `
        INSERT INTO assignment (title, description, duedate, defaultgrade, courseid, createdby, resources, createdat)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *
      `;
      
      const result = await pool.query(insertQuery, [
        title,
        instructions,
        dueDate,
        points,  // This will be mapped to defaultgrade now
        courseId,
        userId,
        resource
      ]);

      const newAssignment = result.rows[0];

      // If the assignment has a file, add a URL for accessing it
      if (newAssignment.resources) {
        // Generate a presigned URL for viewing
        newAssignment.fileUrl = await getPresignedUrlForGet(`classroom-uploads/${newAssignment.resources}`, 3600);
        
        // Remove raw filepath from response for security
        delete newAssignment.resources;
      }

      return res.status(201).json({
        status: 'success',
        code: 201,
        message: 'Assignment created successfully',
        data: newAssignment
      });
    } catch (error) {
      next(error);
    }
  }
];

/**
 * Loader function for accessing specific assignment.
 * It retrieves the assignment by ID and returns it with the course information
 * that is used by the CASL middleware to enforce permissions.
 */
const assignmentLoader = async (req) => {
  if (!req.params || !req.params.id) {
    throw { status: 400, message: 'Assignment ID is required', origin: 'AssignmentController' };
  }
  const assignmentId = req.params.id;
  if (isNaN(assignmentId)) {
    throw { status: 400, message: 'Assignment ID must be a valid number', origin: 'AssignmentController' };
  }
  const assignment = await getAssignmentById(assignmentId);
  if (!assignment) {
    throw { status: 404, message: 'Assignment not found', origin: 'Database' };
  }
  return assignment;
};

/**
 * Controller to toggle the grade release status of an assignment.
 * Only teachers of the course can toggle grade release status.
 *
 * Route: PUT /assignments/:id/toggle-grade-release
 */
const toggleGradeRelease = [
  // Only teachers can toggle grade release, not TAs
  checkAbilityForResource('update', 'Assignment', assignmentLoader),
  
  async (req, res, next) => {
    try {
      const assignmentId = req.params.id;
      
      // Toggle the grade release status
      const updatedAssignment = await toggleGradeReleased(assignmentId);
      
      if (!updatedAssignment) {
        return res.status(404).json({
          status: 'error',
          code: 404,
          message: 'Assignment not found'
        });
      }
      
      return res.status(200).json({
        status: 'success',
        code: 200,
        message: `Grades are now ${updatedAssignment.gradereleased ? 'released' : 'hidden'} for this assignment`,
        data: {
          assignmentId: updatedAssignment.assignmentid,
          gradeReleased: updatedAssignment.gradereleased
        }
      });
    } catch (error) {
      next(error);
    }
  }
];

module.exports = { 
  getAssignments,
  getAssignmentUploadUrl,
  createAssignment,
  toggleGradeRelease
};
