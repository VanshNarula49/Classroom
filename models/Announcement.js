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

module.exports = { getAnnouncementById };
