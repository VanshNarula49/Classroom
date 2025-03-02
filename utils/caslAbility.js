// /utils/defineAbilities.js
const { AbilityBuilder, Ability } = require('@casl/ability');

function defineAbilitiesFor(user) {
  const { can, build } = new AbilityBuilder(Ability);

  // === Course Routes ===
  // Any user can create a Course
  can('create', 'Course');

  // Permissions on the Course resource depend solely on the courseRole
  if (user.courseRole === 'teacher') {
    can(['read', 'update'], 'Course', {
      $or: [
        { createdby: user.userId },
        { teacherIds: { $in: [user.userId] } }
      ]
    });
    can('delete', 'Course', { createdby: user.userId });
  }
  if (user.courseRole === 'ta') {
    can('read', 'Course', { taIds: { $in: [user.userId] } });
  }
  if (user.courseRole === 'student') {
    can('read', 'Course', { enrolledStudentIds: { $in: [user.userId] } });
    can('enroll', 'Course');
  }
if (user.courseRole === 'teacher') {
  can(['update', 'add', 'remove'], 'CourseParticipant', (subject) => {
    // Ensure the subject has a course object with a createdby field.
    if (!subject.course || typeof subject.course.createdby === 'undefined') {
      return false;
    }
    // The teacher must be part of the course either as the creator or be listed in teacherIds.
    const isProfessorInCourse =
      subject.course.createdby === user.userId ||
      (Array.isArray(subject.course.teacherIds) &&
        subject.course.teacherIds.includes(user.userId));
    // Disallow updating/adding/removing if the target is the creator.
    return isProfessorInCourse && subject.course.createdby !== subject.userid;
  });
}
  // === Course Participation ===
  if (user.courseRole === 'teacher') {
    can(['update', 'add', 'remove'], 'CourseParticipant', (subject) => {
      // Ensure the subject has a course object with a createdby field.
      if (!subject.course || typeof subject.course.createdby === 'undefined') {
        return false;
      }
      // The teacher must be part of the course either as the creator or be listed in teacherIds.
      const isProfessorInCourse =
        subject.course.createdby === user.userId ||
        (Array.isArray(subject.course.teacherIds) &&
          subject.course.teacherIds.includes(user.userId));
      // Disallow updating/adding/removing if the target is the creator.
      return isProfessorInCourse && subject.course.createdby !== subject.userid;
    });
  }
  






  // === Assignment Routes ===
  if (user.courseRole === 'teacher' || user.courseRole === 'ta') {
    can('create', 'Assignment', { 
      course: { $or: [ { createdby: user.userId }, { taIds: { $in: [user.userId] } } ] } 
    });
    can(['read', 'update'], 'Assignment', { 
      course: { $or: [ { createdby: user.userId }, { taIds: { $in: [user.userId] } } ] }
    });
  }
  if (user.courseRole === 'teacher') {
    can('delete', 'Assignment', { course: { createdby: user.userId } });
  }
  if (user.courseRole === 'student') {
    can('read', 'Assignment', { course: { enrolledStudentIds: { $in: [user.userId] } } });
    can('submit', 'Assignment', { course: { enrolledStudentIds: { $in: [user.userId] } } });
  }

  // === Submission Routes ===
  if (user.courseRole === 'teacher' || user.courseRole === 'ta') {
    can('read', 'Submission', { 
      assignment: { $or: [ 
        { 'course.createdby': user.userId }, 
        { 'course.taIds': { $in: [user.userId] } } 
      ] }
    });
  }
  if (user.courseRole === 'student') {
    can('create', 'Submission', { studentid: user.userId });
  }

  // === Grading & Feedback Routes ===
  if (user.courseRole === 'teacher' || user.courseRole === 'ta') {
    can('grade', 'Assignment', { 
      course: { $or: [ 
        { createdby: user.userId }, 
        { taIds: { $in: [user.userId] } } 
      ] }
    });
    can('update', 'Grade', { gradedby: user.userId });
    can('read', 'Grade');
  }
  if (user.courseRole === 'student') {
    can('read', 'Grade', { studentid: user.userId });
  }

  // === Material Routes ===
  if (user.courseRole === 'teacher' || user.courseRole === 'ta') {
    can('create', 'Material', { 
      course: { $or: [ 
        { createdby: user.userId }, 
        { taIds: { $in: [user.userId] } } 
      ] }
    });
    can('read', 'Material', { 
      course: { $or: [ 
        { createdby: user.userId }, 
        { taIds: { $in: [user.userId] } }, 
        { enrolledStudentIds: { $in: [user.userId] } } 
      ] }
    });
  }
  if (user.courseRole === 'student') {
    can('read', 'Material', { course: { enrolledStudentIds: { $in: [user.userId] } } });
  }

  // === Announcement Routes ===
  if (user.courseRole === 'teacher' || user.courseRole === 'ta') {
    can('create', 'Announcement', { 
      course: { $or: [ 
        { createdby: user.userId }, 
        { taIds: { $in: [user.userId] } } 
      ] }
    });
    can('read', 'Announcement', { 
      course: { $or: [ 
        { createdby: user.userId }, 
        { taIds: { $in: [user.userId] } }, 
        { enrolledStudentIds: { $in: [user.userId] } } 
      ] }
    });
  }
  if (user.courseRole === 'student') {
    can('read', 'Announcement', { course: { enrolledStudentIds: { $in: [user.userId] } } });
  }

  // === Discussion & Comment Routes ===
  can(['create', 'read'], 'Comment');

  // === Audit Log Routes ===
  if (user.courseRole === 'teacher') {
    can('create', 'AuditLog');
  }

  return build();
}

module.exports = defineAbilitiesFor;
