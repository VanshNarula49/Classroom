// models/Announcement.js
const pool = require('../config/dbConfig');
const { getCourseById } = require('./Course');

const getAnnouncementById = async (announcementId) => {
  const announcementQuery = 'SELECT * FROM announcement WHERE announcementid = $1';
  const announcementResult = await pool.query(announcementQuery, [announcementId]);
  if (announcementResult.rows.length === 0) return null;
  
  const announcement = announcementResult.rows[0];
  announcement.course = await getCourseById(announcement.courseid);
  return announcement;
};
const getAnnouncementsByCourseId = async (courseId) => {
  // Query to get all announcements for the given course
  const announcementQuery = `
    SELECT * 
    FROM announcement 
    WHERE courseid = $1
    ORDER BY createdat DESC
  `;
  const announcementResult = await pool.query(announcementQuery, [courseId]);
  
  // If there are no rows, return an empty array
  if (announcementResult.rows.length === 0) return [];

  // For each announcement, attach the course details
  const announcements = await Promise.all(
    announcementResult.rows.map(async (announcement) => {
      // This assumes getCourseById returns the course details for a given courseId
      announcement.course = await getCourseById(announcement.courseid);
      return announcement;
    })
  );

  return announcements;
};


module.exports = { getAnnouncementById ,getAnnouncementsByCourseId};
