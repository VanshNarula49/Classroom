// /utils/resourceGenerators.js

/**
 * Generate a minimal Course resource.
 * Only includes the IDs needed for CASL checks.
 *
 * @param {Object} dbCourse - Raw course record from the DB.
 * @returns {Object} - Minimal course resource.
 */
function generateCourseResource(dbCourse) {
  return {
    courseid: dbCourse.courseid,
    createdby: dbCourse.createdby,  // Updated field: creator's user ID
    taIds: Array.isArray(dbCourse.taids) ? dbCourse.taids : [],
    enrolledStudentIds: Array.isArray(dbCourse.enrolledstudentids) ? dbCourse.enrolledstudentids : [],
    teacherIds: Array.isArray(dbCourse.teacherids) ? dbCourse.teacherids : []  // Updated to include teachers
  };
}
  
  /**
   * Generate a minimal Assignment resource.
   * Only includes the assignment ID and its associated minimal course resource.
   *
   * @param {Object} dbAssignment - Raw assignment record from the DB.
   * @returns {Object} - Minimal assignment resource.
   */
  function generateAssignmentResource(dbAssignment) {
    return {
      assignmentid: dbAssignment.assignmentid,
      // Only include the minimal course info
      course: dbAssignment.course ? generateCourseResource(dbAssignment.course) : undefined
    };
  }
  
  /**
   * Generate a minimal Material resource.
   * Only includes the material ID and its associated minimal course resource.
   *
   * @param {Object} dbMaterial - Raw material record from the DB.
   * @returns {Object} - Minimal material resource.
   */
  function generateMaterialResource(dbMaterial) {
    return {
      materialid: dbMaterial.materialid,
      course: dbMaterial.course ? generateCourseResource(dbMaterial.course) : undefined
    };
  }
  
  /**
   * Generate a minimal Announcement resource.
   * Only includes the announcement ID and its associated minimal course resource.
   *
   * @param {Object} dbAnnouncement - Raw announcement record from the DB.
   * @returns {Object} - Minimal announcement resource.
   */
  function generateAnnouncementResource(dbAnnouncement) {
    return {
      announcementid: dbAnnouncement.announcementid,
      course: dbAnnouncement.course ? generateCourseResource(dbAnnouncement.course) : undefined
    };
  }
  
  /**
   * Generate a minimal Submission resource.
   * In this design, a submission is tied to an assignment.
   *
   * @param {Object} dbSubmission - Raw submission record from the DB.
   * @returns {Object} - Minimal submission resource.
   */
  function generateSubmissionResource(dbSubmission) {
    return {
      submissionid: dbSubmission.submissionid,
      // Tie the submission to an assignment (which includes a nested course)
      assignment: dbSubmission.assignment ? generateAssignmentResource(dbSubmission.assignment) : undefined,
      studentid: dbSubmission.studentid
    };
  }
  
  /**
   * Generate a minimal Grade resource.
   * Only includes the IDs needed for CASL rules.
   *
   * @param {Object} dbGrade - Raw grade record from the DB.
   * @returns {Object} - Minimal grade resource.
   */
  function generateGradeResource(dbGrade) {
    return {
      gradeid: dbGrade.gradeid,
      submissionid: dbGrade.submissionid,
      studentid: dbGrade.studentid,
      gradedby: dbGrade.gradedby
    };
  }
  
  /**
   * Generate a minimal Comment resource.
   * Only includes the comment ID and reference to its parent.
   *
   * @param {Object} dbComment - Raw comment record from the DB.
   * @returns {Object} - Minimal comment resource.
   */
  function generateCommentResource(dbComment) {
    return {
      commentid: dbComment.commentid,
      parentid: dbComment.parentid,
      parenttype: dbComment.parenttype
    };
  }
  
  module.exports = {
    generateCourseResource,
    generateAssignmentResource,
    generateMaterialResource,
    generateAnnouncementResource,
    generateSubmissionResource,
    generateGradeResource,
    generateCommentResource
  };
  