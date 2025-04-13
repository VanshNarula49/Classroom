// models/Material.js
const pool = require('../config/dbConfig');
const { getCourseById } = require('./Course');

const getMaterialById = async (materialId) => {
  const materialQuery = 'SELECT * FROM material WHERE materialid = $1';
  const materialResult = await pool.query(materialQuery, [materialId]);
  if (materialResult.rows.length === 0) return null;
  
  const material = materialResult.rows[0];
  material.course = await getCourseById(material.courseid);
  return material;
};

const getCourseMaterials = async (courseId) => {
  console.log(courseId);
  const query = `
    SELECT m.*, u.name AS creator_name
    FROM material m
    LEFT JOIN public."User" u ON m.createdby = u.userid
    WHERE m.courseid = $1
    ORDER BY m.createdat DESC;
  `;
  
  try {
    const result = await pool.query(query, [courseId]);
    return result.rows; // returns all materials with creator_name in descending order by createdAt
  } catch (error) {
    console.error('Error fetching course materials:', error);
    throw error;
  }
};

/**
 * Creates a new material for a course
 * @param {Object} materialData - The material data
 * @param {string} materialData.title - Material title
 * @param {string} materialData.type - Material type
 * @param {string|null} materialData.description - Optional material description
 * @param {string|null} materialData.filepath - Optional filepath if material has an attachment
 * @param {number} materialData.courseId - ID of course this material belongs to
 * @param {number} materialData.createdBy - ID of user creating the material
 * @returns {Object} Newly created material
 */
const createMaterial = async (materialData) => {
  const { title, type, description, filepath, courseId, createdBy } = materialData;
  
  const query = `
    INSERT INTO material (title, type, description, filepath, courseid, createdby, createdat)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING *;
  `;
  
  try {
    const result = await pool.query(query, [
      title, 
      type, 
      description, 
      filepath, 
      courseId, 
      createdBy
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating material:', error);
    throw error;
  }
};

module.exports = { getMaterialById, getCourseMaterials, createMaterial };