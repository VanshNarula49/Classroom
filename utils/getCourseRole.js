// /utils/getCourseRole.js
function getCourseRole(user, course) {

    if (course.createdby === user.userId) {
      return 'teacher';

    }
    if (Array.isArray(course.taIds) && course.taIds.includes(user.userId)) {
      return 'ta';
    }
    if (Array.isArray(course.enrolledStudentIds) && course.enrolledStudentIds.includes(user.userId)) {
      return 'student';
    }
    return null; // Not associated with the course
  }
  
  module.exports = getCourseRole;
  