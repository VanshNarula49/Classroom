// models/Course.js
const pool = require('../config/dbConfig');

const getCourseById = async (courseId) => {
  const query =`SELECT 
  c.courseid,
  c.name,
  c.description,
  c.createdby,
  COALESCE(ARRAY_AGG(DISTINCT cp.userid) FILTER (WHERE UPPER(cp.role) = 'TA'), '{}') AS taIds,
  COALESCE(ARRAY_AGG(DISTINCT cp.userid) FILTER (WHERE UPPER(cp.role) = 'STUDENT'), '{}') AS enrolledStudentIds,
  COALESCE(ARRAY_AGG(DISTINCT cp.userid) FILTER (WHERE UPPER(cp.role) = 'PROFESSOR'), '{}') AS teacherIds
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

const getCourseDetailsbyId = async (courseId) => {
  // First, get the basic course information
  const courseQuery = `
    SELECT 
      c.courseid,
      c.name,
      c.description,
      c.code,
      c.createdby,
      u.name AS createdbyName,
      u.email AS createdbyEmail
    FROM public.course c
    LEFT JOIN public."User" u ON c.createdby = u.userid
    WHERE c.courseid = $1
  `;

  // Query to get all participants with their details
  const participantsQuery = `
    SELECT 
      cp.userid,
      cp.role,
      u.name,
      u.email
    FROM public.courseparticipation cp
    JOIN public."User" u ON cp.userid = u.userid
    WHERE cp.courseid = $1
  `;

  try {
    // Get course basic details
    const courseResult = await pool.query(courseQuery, [courseId]);
    if (courseResult.rows.length === 0) return null;
    
    const course = courseResult.rows[0];
    
    // Get all participants
    const participantsResult = await pool.query(participantsQuery, [courseId]);
    
    // Initialize arrays for each role
    const professors = [];
    const teachingAssistants = [];
    const students = [];
    
    // Process participants by role
    participantsResult.rows.forEach(participant => {
      const participantObj = {
        id: participant.userid,
        name: participant.name,
        email: participant.email
      };
      
      // Add to the appropriate array based on role
      if (participant.role.toUpperCase() === 'PROFESSOR') {
        professors.push(participantObj);
      } else if (participant.role.toUpperCase() === 'TA') {
        teachingAssistants.push(participantObj);
      } else if (participant.role.toUpperCase() === 'STUDENT') {
        students.push(participantObj);
      }
    });
    
    // Add participants to the course object
    course.createdBy = {
      id: course.createdby,
      name: course.createdbyname,
      email: course.createdbyemail
    };
    
    // Replace the simple fields with objects
    course.professors = professors;
    course.teachingAssistants = teachingAssistants;
    course.students = students;
    
    // Clean up redundant fields
    delete course.createdby;
    delete course.createdbyname;
    delete course.createdbyemail;
    
    return course;
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw error;
  }
};

const getCoursesByUserId = async (userId) => {
  const query = `
   SELECT 
    c.*,
    u.name AS creator_name,
    cp.role AS userrole
FROM public.course c
JOIN public.courseparticipation cp ON c.courseid = cp.courseid
LEFT JOIN public."User" u ON c.createdby = u.userid
WHERE cp.userid = $1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};


const createCourse = async (userId, name, code, description, startDate, endDate) => {
  const query = `
    WITH new_course AS (
      INSERT INTO public.course (name, code, description, startdate, enddate, createdby, createdat)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    ),
    participation AS (
      INSERT INTO public.courseparticipation (courseid, userid, role, enrollmentdate)
      SELECT courseid, $6, 'Professor', startdate FROM new_course
      RETURNING courseid, userid, role, enrollmentdate
    )
    SELECT nc.*, p.enrollmentdate
    FROM new_course nc
    JOIN participation p ON nc.courseid = p.courseid;
  `;

  const values = [name, code, description, startDate, endDate, userId];

  const result = await pool.query(query, values);
  return result.rows[0]; // Returning the course details along with enrollment date
};

const isCourseCodeUnique = async (code) => {
  const query = `SELECT COUNT(*) FROM public.course WHERE code = $1`;
  const result = await pool.query(query, [code]);
  return result.rows[0].count == 0;
};

const getCourseByCode = async (code) => {
  const query = `SELECT * FROM public.course WHERE code = $1`;
  const result = await pool.query(query, [code]);
  return result.rows[0] || null;
};

const stream = async (courseId) => {
  // The SQL query uses UNION ALL to combine rows from three tables.
  // Each SELECT returns the following columns (adjusted as needed):
  //   id       - the primary key of the row from its table.
  //   type     - a literal indicating the type (announcement, assignment, or material).
  //   courseid - the course id.
  //   title    - the title of the item.
  //   createdby- the user id who created the item.
  //   createdat- the timestamp when the item was created.
const query = `SELECT id,
       type,
       courseid,
       title,
       content,
       description,
       duedate,
       resources,
       assignmenttype,
       gradereleased,
       defaultgrade,
       material_type,
       filepath,
       createdby,
       stream_createdat,
       creator_name
FROM (
  SELECT 
    a.announcementid AS id,
    'announcement' AS type,
    a.courseid,
    a.title,
    a.content,
    NULL::text AS description,
    NULL::timestamp AS duedate,
    NULL::text AS resources,
    NULL::text AS assignmenttype,
    NULL::boolean AS gradereleased,
    NULL::numeric AS defaultgrade,
    NULL::text AS material_type,
    NULL::text AS filepath,
    a.createdby,
    a.createdat AS stream_createdat,
    u.name AS creator_name
  FROM announcement a
  LEFT JOIN public."User" u ON a.createdby = u.userid
  WHERE a.courseid = $1

  UNION ALL

  SELECT 
    a.assignmentid AS id,
    'assignment' AS type,
    a.courseid,
    a.title,
    NULL::text AS content,
    a.description,
    a.duedate,
    a.resources,
    a.assignmenttype,
    a.gradereleased,
    a.defaultgrade,
    NULL::text AS material_type,
    NULL::text AS filepath,
    a.createdby,
    a.createdat AS stream_createdat,
    u.name AS creator_name
  FROM assignment a
  LEFT JOIN public."User" u ON a.createdby = u.userid
  WHERE a.courseid = $1

  UNION ALL

  SELECT 
    m.materialid AS id,
    'material' AS type,
    m.courseid,
    m.title,
    NULL::text AS content,
    m.description,
    NULL::timestamp AS duedate,
    NULL::text AS resources,
    NULL::text AS assignmenttype,
    NULL::boolean AS gradereleased,
    NULL::numeric AS defaultgrade,
    m.type AS material_type,
    m.filepath,
    m.createdby,
    m.createdat AS stream_createdat,
    u.name AS creator_name
  FROM material m
  LEFT JOIN public."User" u ON m.createdby = u.userid
  WHERE m.courseid = $1
) stream_data
ORDER BY stream_createdat DESC, type, id;`;
  try {
    const result = await pool.query(query, [courseId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching stream data:', error);
    throw error;
  }
};

module.exports = { 
  getCourseById, 
  getCourseDetailsbyId, 
  getCoursesByUserId, 
  createCourse, 
  isCourseCodeUnique, 
  stream,
  getCourseByCode 
};
