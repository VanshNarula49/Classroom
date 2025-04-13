// /utils/caslAbility.js

const { AbilityBuilder, Ability } = require('@casl/ability');

function defineAbilitiesFor(user) {
  const { can, cannot, build } = new AbilityBuilder(Ability);
  const uid = Number(user.userId); // Ensure the user ID is a number

  // === Course ===
  // Any authenticated user can create a Course
  can('create', 'Course');

  if (user.courseRole === 'teacher') {
    // Teacher can read a Course if they are the creator or their ID is in teacherIds
    can('read', 'Course', course => {
      return Number(course.createdby) === uid || 
             (Array.isArray(course.teacherIds) && 
              course.teacherIds.some(id => Number(id) === uid));
    });
    
    // Teacher can delete a Course if they created it
    can('delete', 'Course', course => Number(course.createdby) === uid);
  }

  if (user.courseRole === 'ta') {
    // TA can read a Course if their ID is in taIds
    can('read', 'Course', course => 
      Array.isArray(course.taIds) && course.taIds.some(id => Number(id) === uid)
    );
  }

  if (user.courseRole === 'student') {
    // Student can read a Course if their ID is in enrolledStudentIds
    can('read', 'Course', course => 
      Array.isArray(course.enrolledStudentIds) && 
      course.enrolledStudentIds.some(id => Number(id) === uid)
    );
    
    // Student can enroll in a Course
    can('enroll', 'Course');
  }

  // === Course Participant (enrollment) ===
  if (user.courseRole === 'teacher') {
    // Teacher can update, add, or remove participants if they are the creator or in teacherIds
    can(['update', 'add', 'remove'], 'CourseParticipant', subject => {
      if (!subject.course) return false;
      
      return Number(subject.course.createdby) === uid || 
             (Array.isArray(subject.course.teacherIds) && 
              subject.course.teacherIds.some(id => Number(id) === uid));
    });
  }

  // === Assignment ===
  if (user.courseRole === 'teacher' || user.courseRole === 'ta') {
    // Teachers or TAs can create, read, or update assignments if they are the creator, in teacherIds, or in taIds
    can(['create', 'read', 'update'], 'Assignment', assignment => {
      if (!assignment.course) return false;
      
      return Number(assignment.course.createdby) === uid || 
             (Array.isArray(assignment.course.teacherIds) && 
              assignment.course.teacherIds.some(id => Number(id) === uid)) ||
             (Array.isArray(assignment.course.taIds) && 
              assignment.course.taIds.some(id => Number(id) === uid));
    });
  }
  
  if (user.courseRole === 'teacher') {
    // Teacher can delete an assignment if they are the course creator
    can('delete', 'Assignment', assignment => 
      assignment.course && Number(assignment.course.createdby) === uid
    );
  }
  
  if (user.courseRole === 'student') {
    // Student can read or submit an assignment if they are enrolled
    can(['read', 'submit'], 'Assignment', assignment => 
      assignment.course && 
      Array.isArray(assignment.course.enrolledStudentIds) && 
      assignment.course.enrolledStudentIds.some(id => Number(id) === uid)
    );
  }

  // === Submission ===
  if (user.courseRole === 'teacher' || user.courseRole === 'ta') {
    // Teachers or TAs can read a submission if they meet course conditions
    can('read', 'Submission', submission => {
      if (!submission.assignment || !submission.assignment.course) return false;
      
      const course = submission.assignment.course;
      return Number(course.createdby) === uid || 
             (Array.isArray(course.teacherIds) && 
              course.teacherIds.some(id => Number(id) === uid)) ||
             (Array.isArray(course.taIds) && 
              course.taIds.some(id => Number(id) === uid));
    });
    
    // Add specific ability for viewing any user's submission - only for teachers and TAs
    can('viewAnyUserSubmission', 'Submission', submission => {
      if (!submission.assignment || !submission.assignment.course) return false;
      
      const course = submission.assignment.course;
      return Number(course.createdby) === uid || 
             (Array.isArray(course.teacherIds) && 
              course.teacherIds.some(id => Number(id) === uid)) ||
             (Array.isArray(course.taIds) && 
              course.taIds.some(id => Number(id) === uid));
    });
    
    // Explicitly prevent teachers and TAs from creating submissions
    cannot('create', 'Submission');
  }
  
  if (user.courseRole === 'student') {
    // Student can create a submission for themselves if they are enrolled in the course
    can('create', 'Submission', submission => {
      // Verify the student is the one submitting
      if (Number(submission.studentid) !== uid) return false;
      
      // Verify the student is enrolled in the course
      if (!submission.assignment || !submission.assignment.course) return false;
      
      const course = submission.assignment.course;
      return Array.isArray(course.enrolledStudentIds) && 
             course.enrolledStudentIds.some(id => Number(id) === uid);
    });
    
    // Students can read their own submissions
    can('read', 'Submission', submission => Number(submission.studentid) === uid);
  }

  // === Grade ===
  if (user.courseRole === 'teacher' || user.courseRole === 'ta') {
    // Teachers or TAs can grade an assignment if they meet course conditions
    can('grade', 'Assignment', assignment => {
      if (!assignment.course) return false;
      
      return Number(assignment.course.createdby) === uid || 
             (Array.isArray(assignment.course.teacherIds) && 
              assignment.course.teacherIds.some(id => Number(id) === uid)) ||
             (Array.isArray(assignment.course.taIds) && 
              assignment.course.taIds.some(id => Number(id) === uid));
    });
    
    // They can update a grade if they are the grader
    can('update', 'Grade', grade => Number(grade.gradedby) === uid);
    
    // They can read all grades
    can('read', 'Grade');
  }
  
  if (user.courseRole === 'student') {
    // A student can read a grade if it belongs to them
    can('read', 'Grade', grade => Number(grade.studentid) === uid);
  }

  // === Material ===
  if (user.courseRole === 'teacher' || user.courseRole === 'ta') {
    // Teachers or TAs can create materials if they meet course conditions
    can('create', 'Material', material => {
      if (!material.course) return false;
      
      return Number(material.course.createdby) === uid || 
             (Array.isArray(material.course.teacherIds) && 
              material.course.teacherIds.some(id => Number(id) === uid)) ||
             (Array.isArray(material.course.taIds) && 
              material.course.taIds.some(id => Number(id) === uid));
    });
    
    // They can read materials if they meet course conditions
    can('read', 'Material', material => {
      if (!material.course) return false;
      
      return Number(material.course.createdby) === uid || 
             (Array.isArray(material.course.teacherIds) && 
              material.course.teacherIds.some(id => Number(id) === uid)) ||
             (Array.isArray(material.course.taIds) && 
              material.course.taIds.some(id => Number(id) === uid));
    });
  }
  
  if (user.courseRole === 'student') {
    // Students can read materials if they are enrolled in the course
    can('read', 'Material', material => 
      material.course && 
      Array.isArray(material.course.enrolledStudentIds) && 
      material.course.enrolledStudentIds.some(id => Number(id) === uid)
    );
  }

  // === Announcement ===
  if (user.courseRole === 'teacher' || user.courseRole === 'ta') {
    // Teachers or TAs can create announcements if they meet course conditions
    can('create', 'Announcement', announcement => {
      if (!announcement.course) return false;
      
      return Number(announcement.course.createdby) === uid || 
             (Array.isArray(announcement.course.teacherIds) && 
              announcement.course.teacherIds.some(id => Number(id) === uid)) ||
             (Array.isArray(announcement.course.taIds) && 
              announcement.course.taIds.some(id => Number(id) === uid));
    });
    
    // They can read announcements if they match course conditions
    can('read', 'Announcement', announcement => {
      if (!announcement.course) return false;
      
      return Number(announcement.course.createdby) === uid || 
             (Array.isArray(announcement.course.teacherIds) && 
              announcement.course.teacherIds.some(id => Number(id) === uid)) ||
             (Array.isArray(announcement.course.taIds) && 
              announcement.course.taIds.some(id => Number(id) === uid)) ||
             (Array.isArray(announcement.course.enrolledStudentIds) && 
              announcement.course.enrolledStudentIds.some(id => Number(id) === uid));
    });
  }
  
  if (user.courseRole === 'student') {
    // Students can read announcements if they are enrolled in the course
    can('read', 'Announcement', announcement => 
      announcement.course && 
      Array.isArray(announcement.course.enrolledStudentIds) && 
      announcement.course.enrolledStudentIds.some(id => Number(id) === uid)
    );
  }

  // === Comment ===
  // Replace the generic comment permissions with more specific ones based on parent type
  
  // For Announcement comments - anyone in the course can create/read
  can(['create', 'read'], 'Comment', comment => {
    if (comment.parentType !== 'Announcement' || !comment.parent) return false;
    
    const announcement = comment.parent;
    if (!announcement.course) return false;
    
    return Number(announcement.course.createdby) === uid || 
           (Array.isArray(announcement.course.teacherIds) && 
            announcement.course.teacherIds.some(id => Number(id) === uid)) ||
           (Array.isArray(announcement.course.taIds) && 
            announcement.course.taIds.some(id => Number(id) === uid)) ||
           (Array.isArray(announcement.course.enrolledStudentIds) && 
            announcement.course.enrolledStudentIds.some(id => Number(id) === uid));
  });
  
  // For Material comments - anyone in the course can create/read
  can(['create', 'read'], 'Comment', comment => {
    if (comment.parentType !== 'Material' || !comment.parent) return false;
    
    const material = comment.parent;
    if (!material.course) return false;
    
    return Number(material.course.createdby) === uid || 
           (Array.isArray(material.course.teacherIds) && 
            material.course.teacherIds.some(id => Number(id) === uid)) ||
           (Array.isArray(material.course.taIds) && 
            material.course.taIds.some(id => Number(id) === uid)) ||
           (Array.isArray(material.course.enrolledStudentIds) && 
            material.course.enrolledStudentIds.some(id => Number(id) === uid));
  });
  
  // For Assignment comments - anyone in the course can create/read
  can(['create', 'read'], 'Comment', comment => {
    if (comment.parentType !== 'Assignment' || !comment.parent) return false;
    
    const assignment = comment.parent;
    if (!assignment.course) return false;
    
    return Number(assignment.course.createdby) === uid || 
           (Array.isArray(assignment.course.teacherIds) && 
            assignment.course.teacherIds.some(id => Number(id) === uid)) ||
           (Array.isArray(assignment.course.taIds) && 
            assignment.course.taIds.some(id => Number(id) === uid)) ||
           (Array.isArray(assignment.course.enrolledStudentIds) && 
            assignment.course.enrolledStudentIds.some(id => Number(id) === uid));
  });
  
  // For Submission comments - only teachers, TAs, and the student who made the submission
  can(['create', 'read'], 'Comment', comment => {
    if (comment.parentType !== 'Submission' || !comment.parent) return false;
    
    const submission = comment.parent;
    
    // The student who made the submission can comment and view comments on their own submission
    if (Number(submission.studentid) === uid) return true;
    
    // Check if teacher/TA has access through course
    if (!submission.assignment || !submission.assignment.course) return false;
    
    const course = submission.assignment.course;
    return Number(course.createdby) === uid || 
           (Array.isArray(course.teacherIds) && 
            course.teacherIds.some(id => Number(id) === uid)) ||
           (Array.isArray(course.taIds) && 
            course.taIds.some(id => Number(id) === uid));
  });
  
  // Users can delete their own comments
  can('delete', 'Comment', comment => Number(comment.createdby) === uid);
  
  // Teachers can delete any comments in their courses
  if (user.courseRole === 'teacher') {
    can('delete', 'Comment', comment => {
      if (!comment.parent) return false;
      
      let course;
      
      if (comment.parentType === 'Announcement') {
        course = comment.parent.course;
      } else if (comment.parentType === 'Material') {
        course = comment.parent.course;
      } else if (comment.parentType === 'Assignment') {
        course = comment.parent.course;
      } else if (comment.parentType === 'Submission') {
        if (!comment.parent.assignment) return false;
        course = comment.parent.assignment.course;
      } else {
        return false;
      }
      
      if (!course) return false;
      
      return Number(course.createdby) === uid || 
             (Array.isArray(course.teacherIds) && 
              course.teacherIds.some(id => Number(id) === uid));
    });
  }

  // === AuditLog ===
  // Teachers can create audit logs
  if (user.courseRole === 'teacher') {
    can('create', 'AuditLog');
  }

  return build();
}

module.exports = defineAbilitiesFor;