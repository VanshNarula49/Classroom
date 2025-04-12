// controllers/material.controller.js

const { getCourseMaterials } = require('../models/Material');
const checkAbilityForResource = require('../middlewares/abilityMiddleware.js');
const { getCourseById } = require('../models/Course');
const { generateCourseResource, generateMaterialResource } = require('../utils/resourceGenerators.js');

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

      // Optionally, transform each material if needed:
      // const materials = dbMaterials.map((m) => generateMaterialResource(m));
      // Or just send them directly:
      const materials = dbMaterials;

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

module.exports = {
  getMaterialsForCourse
};
