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

module.exports = { getMaterialById };
