// controllers/course.controller.js

const checkAbilityForResource = require('../middlewares/abilityMiddleware.js');
const {
  getCoursesByUserId,
  createCourse,
  isCourseCodeUnique,
  getCourseById,
  getCourseDetailsbyId,
  stream
} = require('../models/Course');
const { generateCourseResource } = require('../utils/resourceGenerators');
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
const streamCourse = [ checkAbilityForResource('read', 'Course', coursegen),async (req, res, next) => {
  try {
    const courseId = req.params.id;
    if (!courseId || isNaN(courseId)) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Course ID is required and must be numeric.'
      });
    }
    const result = await stream(courseId)
    res.json({
      status: 'success',
      code: 200,
      message: 'Stream data fetched successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
}]

module.exports = {
  addCourse,
  getCourses,
  getCourse,
  streamCourse
};
