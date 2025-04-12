// controllers/assignment.controller.js

const checkAbilityForResource = require('../middlewares/abilityMiddleware.js');
const { getAssignmentsByCourseId } = require('../models/Assignment'); // adjust path if needed
const { generateCourseResource } = require('../utils/resourceGenerators');
const {getCourseById} = require('../models/Course');
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
      res.json({
        status: 'success',
        code: 200,
        message: 'Assignments fetched successfully.',
        data: assignments
      });
    } catch (error) {
      next(error);
    }
  }
];

module.exports = { getAssignments };
