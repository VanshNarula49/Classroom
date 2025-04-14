// controllers/course.controller.js

const checkAbilityForResource = require('../middlewares/abilityMiddleware.js');
const {
  getCoursesByUserId,
  createCourse,
  isCourseCodeUnique,
  getCourseById,
  getCourseDetailsbyId,
  stream,
  getCourseByCode
} = require('../models/Course');
const { getParticipationForCourse, joinCourse } = require('../models/courseParticipation');
const { generateCourseResource } = require('../utils/resourceGenerators');
const { getPresignedUrlForGet } = require('../config/minio');
const validator = require('validator');
const crypto = require('crypto');

// Get all courses for the current user
const getCourses = async (req, res, next) => {
  try {
    const courses = await getCoursesByUserId(req.user.userId);
    res.json({
      status: 'success',
      code: 200,
      message: 'Courses fetched successfully.',
      data: { courses }
    });
  } catch (error) {
    next(error);
  }
};

// Loader function to generate minimal course resource for authorization
const coursegen = async (req) => {
  if (!req.params || !req.params.id) {
    throw { status: 400, message: 'Course ID is required', origin: 'Controller' };
  }
  const courseId = req.params.id;
  if (isNaN(courseId)) {
    throw { status: 400, message: 'Course ID must be a valid number', origin: 'Controller' };
  }
  const rawCourse = await getCourseById(courseId);
  if (!rawCourse) {
    throw { status: 404, message: 'Course not found', origin: 'Database' };
  }
  const course = generateCourseResource(rawCourse);
  return course;
};

// Get a single course's details (protected by CASL)
const getCourse = [
  checkAbilityForResource('read', 'Course', coursegen),
  async (req, res, next) => {
    try {
      const courseId = req.params.id;
      const course = await getCourseDetailsbyId(courseId);
      if (!course) {
        return res.status(404).json({
          status: 'error',
          code: 404,
          message: 'Course not found.',
          origin: 'Database'
        });
      }
      res.json({
        status: 'success',
        code: 200,
        message: 'Course details fetched successfully.',
        data: course
      });
    } catch (error) {
      next(error);
    }
  }
];

// Generate a unique course code
const generateUniqueCourseCode = async () => {
  let code;
  let isUnique = false;
  while (!isUnique) {
    code = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-character alphanumeric
    isUnique = await isCourseCodeUnique(code);
  }
  return code;
};

// Create a new course
const addCourse = async (req, res, next) => {
  try {
    const { name, description, endDate } = req.body;
    if (!name || !description || !endDate) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Name, description, and end date are required.'
      });
    }
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    if (!validator.isLength(trimmedName, { min: 3, max: 100 })) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Course name must be between 3 and 100 characters.'
      });
    }
    if (!validator.isLength(trimmedDescription, { min: 10, max: 500 })) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Description must be between 10 and 500 characters.'
      });
    }
    if (!validator.isDate(endDate)) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Invalid date format for end date. Use YYYY-MM-DD.'
      });
    }
    const startDate = new Date().toISOString().split('T')[0];
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Start date must be before end date.'
      });
    }
    const code = await generateUniqueCourseCode();
    const newCourse = await createCourse(
      req.user.userId,
      trimmedName,
      code,
      trimmedDescription,
      startDate,
      endDate
    );
    res.status(201).json({
      status: 'success',
      code: 201,
      message: 'Course created successfully.',
      data: { course: newCourse }
    });
  } catch (error) {
    next(error);
  }
};

// Stream: Retrieve announcements, assignments, and materials in one aggregated result
const streamCourse = [ 
  checkAbilityForResource('read', 'Course', coursegen),
  async (req, res, next) => {
    try {
      const courseId = req.params.id;
      if (!courseId || isNaN(courseId)) {
        return res.status(400).json({
          status: 'error',
          code: 400,
          message: 'Course ID is required and must be numeric.'
        });
      }
      
      // Get stream data from database
      const results = await stream(courseId);
      
      // Generate signed URLs for material files
      const processedResults = await Promise.all(results.map(async (item) => {
        // Only process items of type 'material' that have a filepath
        if (item.type === 'material' && item.filepath) {
          // Create a presigned URL for the file with 1 hour expiration
          const fileUrl = await getPresignedUrlForGet(`classroom-uploads/${item.filepath}`, 3600);
          
          // Add the signed URL to the item and remove the raw filepath
          return {
            ...item,
            filepath: fileUrl // Remove raw filepath for security
          };
        }
        if (item.type === 'assignment' && item.resources) {
          // Create a presigned URL for the file with 1 hour expiration
          const fileUrl = await getPresignedUrlForGet(`classroom-uploads/${item.resource}`, 3600);
          
          // Add the signed URL to the item and remove the raw filepath
          return {
            ...item,
            resources: fileUrl // Remove raw filepath for security
          };
        }
        // Return other items unchanged
        return item;
      }));
      
      res.json({
        status: 'success',
        code: 200,
        message: 'Stream data fetched successfully.',
        data: processedResults
      });
    } catch (error) {
      next(error);
    }
  }
];

// Join a course using its code
const joinCourseByCode = async (req, res, next) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Course code is required.'
      });
    }
    
    // Find course by code
    const course = await getCourseByCode(code);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'Course not found with the provided code.'
      });
    }
    
    // Check if user is already enrolled in the course
    const existingParticipation = await getParticipationForCourse(req.user.userId, course.courseid);
    if (existingParticipation) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'You are already enrolled in this course.'
      });
    }
    
    // Join the course as a student
    const participation = await joinCourse(req.user.userId, course.courseid);
    
    res.status(201).json({
      status: 'success',
      code: 201,
      message: 'Successfully joined the course.',
      data: {
        course: {
          id: course.courseid,
          name: course.name,
          description: course.description,
          role: participation.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user role in a specific course
const getUserRole = [
  checkAbilityForResource('read', 'Course', coursegen),
  async (req, res, next) => {
    try {
      const courseId = req.params.id;
      const userId = req.user.userId;
      
      if (!courseId || isNaN(courseId)) {
        return res.status(400).json({
          status: 'error',
          code: 400,
          message: 'Course ID is required and must be numeric.'
        });
      }
      
      // The course resource is already attached to req by the CASL middleware
      const course = req.resource;
      
      // Determine the user's role based on the course resource
      let role = null;
      
      // Check if user is the course creator (teacher)
      if (course.createdby == userId) {
        role = 'Professor';
      }
      // Check if user is a TA
      else if (Array.isArray(course.taIds) && course.taIds.includes(Number(userId))) {
        role = 'TA';
      }
      // Check if user is a student
      else if (Array.isArray(course.enrolledStudentIds) && course.enrolledStudentIds.includes(Number(userId))) {
        role = 'Student';
      }
      
      if (!role) {
        return res.status(404).json({
          status: 'error',
          code: 403,
          message: 'You are not enrolled in this course.'
        });
      }
      
      res.json({
        status: 'success',
        code: 200,
        message: 'User role fetched successfully.',
        data: {
          userId: userId,
          courseId: parseInt(courseId),
          role: role
        }
      });
    } catch (error) {
      next(error);
    }
  }
];

module.exports = {
  addCourse,
  getCourses,
  getCourse,
  streamCourse,
  joinCourseByCode,
  getUserRole
};
