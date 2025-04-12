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
  console.log(courseId)
  const query = `
    SELECT *
    FROM material
    WHERE courseid = $1
    ORDER BY createdat DESC;
  `;
  
  try {
    const result = await pool.query(query, [courseId]);
    return result.rows; // returns all materials in descending order by createdAt
  } catch (error) {
    console.error('Error fetching course materials:', error);
    throw error;
  }
};
module.exports = { getMaterialById,getCourseMaterials };