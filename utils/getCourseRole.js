// /utils/getCourseRole.js
function getCourseRole(user, course) {
  console.log('DEBUG getCOurseRole', user, course);
  
  // Handle case variations for course.createdby/createdBy
  if (course.createdby == user.userId || course.createdBy == user.userId) {
    return 'teacher';
  }
  
  // Handle case variations for TAs
  // Check both taids/taIds and convert to lowercase for comparison
  const taidsList = course.taids || course.taIds || course.taIds || [];
  if (Array.isArray(taidsList) && taidsList.includes(user.userId)) {
    return 'ta';
  }
  
  // Handle case variations for students
  // Check enrolledstudentids/enrolledStudentIds and convert to lowercase for comparison
  const studentList = course.enrolledstudentids || course.enrolledStudentIds || [];
  if (Array.isArray(studentList) && studentList.includes(user.userId)) {
    return 'student';
  }
  
  // Also check teacherIds as an alternative way to identify teachers
  const teacherList = course.teacherIds || course.teacherids || [];
  if (Array.isArray(teacherList) && teacherList.includes(user.userId)) {
    return 'teacher';
  }
  
  return null; // Not associated with the course
}

module.exports = getCourseRole;
