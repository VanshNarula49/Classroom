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
  const announcementQuery = `
    SELECT * 
    FROM announcement 
    WHERE courseid = $1
    ORDER BY createdat DESC
  `;
  const announcementResult = await pool.query(announcementQuery, [courseId]);
  
  if (announcementResult.rows.length === 0) return [];

  const announcements = await Promise.all(
    announcementResult.rows.map(async (announcement) => {
      announcement.course = await getCourseById(announcement.courseid);
      return announcement;
    })
  );

  return announcements;
};

/**
 * Creates a new announcement for a course
 * 
 * @param {Object} announcementData - The announcement data
 * @param {number} announcementData.courseId - The ID of the course
 * @param {number} announcementData.createdBy - The ID of the user creating the announcement
 * @param {string} announcementData.title - The title of the announcement
 * @param {string} announcementData.content - The content of the announcement
 * @returns {Object} The created announcement
 */
const createAnnouncement = async (announcementData) => {
  const { courseId, createdBy, title, content } = announcementData;
  
  const query = `
    INSERT INTO announcement (courseid, createdby, title, content, createdat)
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    RETURNING *
  `;
  
  const values = [courseId, createdBy, title, content];
  const result = await pool.query(query, values);
  
  if (result.rows.length === 0) {
    throw new Error('Failed to create announcement');
  }
  
  const announcement = result.rows[0];
  announcement.course = await getCourseById(courseId);
  
  return announcement;
};

module.exports = { 
  getAnnouncementById, 
  getAnnouncementsByCourseId,
  createAnnouncement
};
