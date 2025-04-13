// controllers/announcementController.js

const { getAnnouncementsByCourseId, getAnnouncementById, createAnnouncement } = require('../models/Announcement');
const checkAbilityForResource = require('../middlewares/abilityMiddleware.js');
const { getCourseById } = require('../models/Course');
const { generateCourseResource } = require('../utils/resourceGenerators.js');
const validator = require('validator');

/**
 * Loader function for CASL checks.
 * This returns a minimal object shaped like { course: { ... } }
 * so CASL can verify if the user can perform actions on Announcements that belong to this course.
 */
async function announcementLoader(req) {
  // 1) Validate `courseId`
  const courseId = req.params.courseId || req.params.courseid;
  if (!courseId || isNaN(courseId)) {
    throw { status: 400, message: 'Invalid or missing courseId', origin: 'AnnouncementController' };
  }

  // 2) Fetch the course record from DB
  const dbCourse = await getCourseById(courseId);
  if (!dbCourse) {
    throw { status: 404, message: 'Course not found', origin: 'AnnouncementController' };
  }

  // 3) Build a minimal resource object for CASL
  //    This will be shaped like { course: { createdby, teacherIds, taIds, enrolledStudentIds } }
  const courseResource = generateCourseResource(dbCourse);

  // Return an object shaped like an "Announcement," but we only need the nested `course` for CASL
  return { course: courseResource };
}

/**
 * Controller to get all announcements for a given course.
 * This is a two-part array:
 *  1) The CASL authorization middleware
 *  2) The actual Express handler function if authorized
 */
const getAnnouncementsForCourse = [
  // 1) CASL check: "read" action on "Announcement" subject
  checkAbilityForResource('read', 'Announcement', announcementLoader),

  // 2) Actual controller logic
  async (req, res, next) => {
    try {
      // We'll assume the route param is :courseId or :courseid
      const courseId = req.params.courseId || req.params.courseid;

      // Fetch the actual Announcements from the DB
      const fullAnnouncements = await getAnnouncementsByCourseId(courseId);
      
      // Simplify the response by removing course details
      const simplifiedAnnouncements = fullAnnouncements.map(announcement => {
        // Create a new object without the course property
        const { course, ...announcementWithoutCourse } = announcement;
        return announcementWithoutCourse;
      });

      return res.status(200).json({
        status: 'success',
        code: 200,
        message: `Announcements for course #${courseId} fetched successfully.`,
        data: simplifiedAnnouncements
      });
    } catch (error) {
      next(error);
    }
  }
];

/**
 * Controller to get a specific announcement by ID.
 */
const getAnnouncement = [
  // This endpoint requires the announcement ID, not just course ID
  async (req, res, next) => {
    try {
      const announcementId = req.params.announcementId || req.params.id;
      if (!announcementId || isNaN(announcementId)) {
        return res.status(400).json({
          status: 'error',
          code: 400,
          message: 'Invalid or missing announcement ID',
        });
      }

      const fullAnnouncement = await getAnnouncementById(announcementId);
      if (!fullAnnouncement) {
        return res.status(404).json({
          status: 'error',
          code: 404,
          message: 'Announcement not found',
        });
      }

      // Use the actual announcement for CASL check rather than using a loader
      req.ability = req.ability || await req.getAbility();
      if (!req.ability.can('read', { subject: 'Announcement', ...fullAnnouncement })) {
        return res.status(403).json({
          status: 'error',
          code: 403,
          message: 'You do not have permission to view this announcement',
        });
      }

      // Simplify the response by removing course details
      const { course, ...simplifiedAnnouncement } = fullAnnouncement;

      return res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Announcement fetched successfully.',
        data: simplifiedAnnouncement
      });
    } catch (error) {
      next(error);
    }
  }
];

/**
 * Controller to create a new announcement for a course.
 * Only teachers and TAs of the course can create announcements.
 */
const createCourseAnnouncement = [
  // 1) CASL check: "create" action on "Announcement" subject
  checkAbilityForResource('create', 'Announcement', announcementLoader),

  // 2) Actual controller logic
  async (req, res, next) => {
    try {
      const courseId = req.params.courseId || req.params.courseid;
      const userId = req.user.userId;
      const { title, content } = req.body;

      // Validate required fields
      if (!title || !content) {
        return res.status(400).json({
          status: 'error',
          code: 400,
          message: 'Title and content are required for creating an announcement',
        });
      }

      // Validate title and content
      const trimmedTitle = title.trim();
      const trimmedContent = content.trim();

      if (!validator.isLength(trimmedTitle, { min: 3, max: 100 })) {
        return res.status(400).json({
          status: 'error',
          code: 400,
          message: 'Announcement title must be between 3 and 100 characters.',
        });
      }

      if (!validator.isLength(trimmedContent, { min: 10, max: 2000 })) {
        return res.status(400).json({
          status: 'error',
          code: 400,
          message: 'Announcement content must be between 10 and 2000 characters.',
        });
      }

      // Create the announcement in the database
      const fullAnnouncement = await createAnnouncement({
        courseId,
        createdBy: userId,
        title: trimmedTitle,
        content: trimmedContent
      });

      // Simplify the response by removing course details
      const { course, ...simplifiedAnnouncement } = fullAnnouncement;

      return res.status(201).json({
        status: 'success',
        code: 201,
        message: 'Announcement created successfully',
        data: simplifiedAnnouncement
      });
    } catch (error) {
      next(error);
    }
  }
];

module.exports = {
  getAnnouncementsForCourse,
  getAnnouncement,
  createCourseAnnouncement
};