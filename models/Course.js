// models/Course.js
const pool = require('../config/dbConfig');

const getCourseById = async (courseId) => {
  const query =`SELECT 
  c.courseid,
  c.name,
  c.description,
  c.createdby,
  COALESCE(ARRAY_AGG(DISTINCT cp.userid) FILTER (WHERE cp.role = 'Ta'), '{}') AS taIds,
  COALESCE(ARRAY_AGG(DISTINCT cp.userid) FILTER (WHERE cp.role = 'Student'), '{}') AS enrolledStudentIds,
  COALESCE(ARRAY_AGG(DISTINCT cp.userid) FILTER (WHERE cp.role = 'Professor'), '{}') AS teacherIds
FROM course c
LEFT JOIN courseparticipation cp ON c.courseid = cp.courseid
WHERE c.courseid = $1
GROUP BY c.courseid;
`;

  try {
    const result = await pool.query(query, [courseId]);
    if (result.rows.length === 0) return null;

    const course = result.rows[0];
    return course;
  } catch (error) {
    throw error;
  }
};




const getCoursesByUserId = async (userId) => {
  const query = `
    SELECT c.*, cp.role AS userrole
    FROM public.course c
    JOIN public.courseparticipation cp ON c.courseid = cp.courseid
    WHERE cp.userid = $1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};





module.exports = { getCourseById ,getCoursesByUserId};
