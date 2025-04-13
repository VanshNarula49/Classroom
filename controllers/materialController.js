// controllers/material.controller.js

const { getCourseMaterials, createMaterial } = require('../models/Material');
const checkAbilityForResource = require('../middlewares/abilityMiddleware.js');
const { getCourseById } = require('../models/Course');
const { generateCourseResource } = require('../utils/resourceGenerators.js');
const { generateSecureMaterialUploadUrl, verifyUploadToken } = require('../utils/secureUpload');
const { getPresignedUrlForGet } = require('../config/minio');

/**
 * Loader function for CASL checks.
 * This returns a minimal object shaped like { course: { ... } }
 * so CASL can verify if the user can "read" Materials that belong to this course.
 */
async function materialLoader(req) {
  // 1) Validate `courseId`
  const courseId = req.params.courseId || req.params.courseid; // support either param name
  if (!courseId || isNaN(courseId)) {
    throw { status: 400, message: 'Invalid or missing courseId', origin: 'MaterialController' };
  }

  // 2) Fetch the course record from DB
  const dbCourse = await getCourseById(courseId);
  if (!dbCourse) {
    throw { status: 404, message: 'Course not found', origin: 'MaterialController' };
  }

  // 3) Build a minimal resource object for CASL
  //    This will be shaped like { course: { createdby, teacherIds, taIds, enrolledStudentIds } }
  const courseResource = generateCourseResource(dbCourse);

  // Return an object shaped like a "Material," but we only need the nested `course` for CASL
  return { course: courseResource };
}

/**
 * Controller to get all materials for a given course.
 * This is a two-part array:
 *  1) The CASL authorization middleware
 *  2) The actual Express handler function if authorized
 */
const getMaterialsForCourse = [
  // 1) CASL check: "read" action on "Material" subject
  checkAbilityForResource('read', 'Material', materialLoader),

  // 2) Actual controller logic
  async (req, res, next) => {
    try {
      // We'll assume the route param is :courseId or :courseid
      const courseId = req.params.courseId || req.params.courseid;

      // Fetch the actual Materials from the DB
      const dbMaterials = await getCourseMaterials(courseId);

      // Generate signed URLs for materials with files
      const materials = await Promise.all(dbMaterials.map(async (material) => {
        if (material.filepath) {
          // Create a presigned URL for viewing the file with 1 hour expiration
          material.fileUrl = await getPresignedUrlForGet(`classroom-uploads/${material.filepath}`, 3600);
          // Remove raw filepath from response for security
          delete material.filepath;
        }
        return material;
      }));

      return res.status(200).json({
        status: 'success',
        code: 200,
        message: `Materials for course #${courseId} fetched successfully.`,
        data: materials
      });
    } catch (error) {
      next(error);
    }
  }
];

/**
 * Controller to get a presigned URL for uploading material files.
 * Only teachers and TAs of the course can get the upload URL.
 */
const getMaterialUploadUrl = [
  // 1) CASL check: "create" action on "Material" subject
  checkAbilityForResource('create', 'Material', materialLoader),

  // 2) Actual controller logic
  async (req, res, next) => {
    try {
      // Extract parameters from query
      const { fileExtension } = req.query;
      const courseId = req.params.courseId || req.params.courseid;
      
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
      
      // Generate a secure upload URL using our JWT approach
      const { url, token } = await generateSecureMaterialUploadUrl({
        userId: req.user.userId,
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
      console.error('Error generating material upload URL:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to generate URL for material upload',
        error: error.message
      });
    }
  }
];

/**
 * Controller to create a new material for a course.
 * Only teachers and TAs of the course can create materials.
 */
const createCourseMaterial = [
  // 1) CASL check: "create" action on "Material" subject
  checkAbilityForResource('create', 'Material', materialLoader),

  // 2) Actual controller logic
  async (req, res, next) => {
    try {
      const courseId = req.params.courseId || req.params.courseid;
      const userId = req.user.userId;
      const { title, type, description, key: token } = req.body;

      // Validate required fields
      if (!title || !type) {
        return res.status(400).json({
          status: 'error',
          code: 400,
          message: 'Title and material type are required for creating a material',
        });
      }

      // Initialize filepath as null (for materials without attachments)
      let filepath = null;

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
        filepath = tokenData.fileKey;
      }

      // Create the material in the database
      const newMaterial = await createMaterial({
        title,
        type,
        description,
        filepath,
        courseId,
        createdBy: userId
      });

      // If the material has a file, add a URL for accessing it
      if (newMaterial.filepath) {
        // Generate a presigned URL for viewing
        newMaterial.fileUrl = await getPresignedUrlForGet(`classroom-uploads/${newMaterial.filepath}`, 3600);
        
        // Remove raw filepath from response for security
        delete newMaterial.filepath;
      }

      return res.status(201).json({
        status: 'success',
        code: 201,
        message: 'Material created successfully',
        data: newMaterial
      });
    } catch (error) {
      next(error);
    }
  }
];

module.exports = {
  getMaterialsForCourse,
  getMaterialUploadUrl,
  createCourseMaterial
};
