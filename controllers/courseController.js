// controllers/course.controller.js
const checkAbilityForResource = require('../middlewares/abilityMiddleware.js');
const { getCoursesByUserId,createCourse ,isCourseCodeUnique,getCourseById, getCourseDetailsbyId} = require('../models/Course');
const { generateCourseResource } = require('../utils/resourceGenerators');

const validator = require('validator');
const crypto = require('crypto');
const { log } = require('console');





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
// Get A Single Course
const coursegen = async (req) => {
  // Ensure that the course ID is provided in the request parameters
  if (!req.params || !req.params.id) {
    throw { status: 400, message: 'Course ID is required', origin: 'Controller' };
  }

  const courseId = req.params.id;

  // Optional: Validate that courseId is numeric (if applicable)
  if (isNaN(courseId)) {
    throw { status: 400, message: 'Course ID must be a valid number', origin: 'Controller' };
  }

  // Retrieve the course from the database
  const rawCourse = await getCourseById(courseId);
  if (!rawCourse) {
    throw { status: 404, message: 'Course not found', origin: 'Database' };
  }

  // Generate a minimal, enriched Course resource for CASL
  const course = generateCourseResource(rawCourse);
  console.log(course,req.user)
  return course;
};


const getCourse =[checkAbilityForResource('read','Course',coursegen),async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.userId;

    const course = await getCourseDetailsbyId(courseId);

    if (!course) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'Course not found.',
        origin:'Database'
      });
    }


    res.json({
      status: 'success',
      code: 200,
      message: 'Course details fetched successfully.',
      data: course,
    });
  } catch (error) {
    next(error);
  }
}]

// Create Course

const generateUniqueCourseCode = async () => {
  let code;
  let isUnique = false;

  while (!isUnique) {
    code = crypto.randomBytes(3).toString('hex').toUpperCase(); // Generate 6-character alphanumeric
    isUnique = await isCourseCodeUnique(code); // Ensure it's unique
  }

  return code;
};

const addCourse = async (req, res, next) => {
  try {
    const { name, description, endDate } = req.body;

    if (!name || !description || !endDate) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Name, description, and end date are required.',
      });
    }

    // Trim inputs to remove unnecessary spaces
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    // Validate name length
    if (!validator.isLength(trimmedName, { min: 3, max: 100 })) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Course name must be between 3 and 100 characters.',
      });
    }

    // Validate description length
    if (!validator.isLength(trimmedDescription, { min: 10, max: 500 })) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Description must be between 10 and 500 characters.',
      });
    }

    // Validate endDate format
    if (!validator.isDate(endDate)) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Invalid date format for end date. Use YYYY-MM-DD.',
      });
    }

    // Get server current date as start date (YYYY-MM-DD format)
    const startDate = new Date().toISOString().split('T')[0];

    // Ensure startDate is before endDate
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Start date must be before end date.',
      });
    }

    // Generate a unique 6-character alphanumeric course code
    const code = await generateUniqueCourseCode();

    // Create the course after validation
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



module.exports = { addCourse,getCourses ,getCourse};
