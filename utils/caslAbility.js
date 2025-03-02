const { AbilityBuilder, Ability } = require('@casl/ability');

function defineAbilitiesFor(user) {
  const { can, build } = new AbilityBuilder(Ability);

  // === Course Routes ===
  // Any user can create a Course
  can('create', 'Course');

  // Permissions on the Course resource depend solely on the courseRole
  if (user.courseRole === 'teacher') {

    // Teacher can read or update a Course if they are the creator or listed as a teacher
    can('read', 'Course', { createdby: user.userId });
    can('read', 'Course', { teacherIds: { $in: [user.userId] } });

    // Teacher can delete a Course if they are the creator
    can('delete', 'Course', { createdby: user.userId });
  }

  // TA can read the Course if they are listed in taIds
  if (user.courseRole === 'ta') {
    can('read', 'Course', { taIds: { $in: [user.userId] } });
  }

  // Student can read the Course if they are enrolled in the course
  if (user.courseRole === 'student') {
    can('read', 'Course', { enrolledStudentIds: { $in: [user.userId] } });
    can('enroll', 'Course');
  }

  // === Course Participant Routes ===
  // Teacher can update, add, or remove participants in the Course
  if (user.courseRole === 'teacher') {
    can(['update', 'add', 'remove'], 'CourseParticipant', (subject) => {
      if (!subject.course || typeof subject.course.createdby === 'undefined') {
        return false;
      }

      const isProfessorInCourse =
        subject.course.createdby === user.userId ||
        (Array.isArray(subject.course.teacherIds) &&
          subject.course.teacherIds.includes(user.userId));

      return isProfessorInCourse && subject.course.createdby !== subject.userid;
    });
  }

  // === Assignment Routes ===
  if (user.courseRole === 'teacher' || user.courseRole === 'ta') {
    // Can create and update assignments if they are the creator or listed as TA
    can('create', 'Assignment', {
      course: { createdby: user.userId, taIds: { $in: [user.userId] } }
    });
    can(['read', 'update'], 'Assignment', {
      course: { createdby: user.userId, taIds: { $in: [user.userId] } }
    });
  }

  if (user.courseRole === 'teacher') {
    // Can delete assignments if they are the creator
    can('delete', 'Assignment', { course: { createdby: user.userId } });
  }

  if (user.courseRole === 'student') {
    // Students can read assignments if they are enrolled
    can('read', 'Assignment', { course: { enrolledStudentIds: { $in: [user.userId] } } });
    // Students can submit assignments if they are enrolled
    can('submit', 'Assignment', { course: { enrolledStudentIds: { $in: [user.userId] } } });
  }

  // === Submission Routes ===
  if (user.courseRole === 'teacher' || user.courseRole === 'ta') {
    // Can read submissions if they are the course creator or a TA
    can('read', 'Submission', {
      assignment: { 'course.createdby': user.userId, 'course.taIds': { $in: [user.userId] } }
    });
  }

  if (user.courseRole === 'student') {
    // Students can create submissions for their own assignments
    can('create', 'Submission', { studentid: user.userId });
  }

  // === Grading & Feedback Routes ===
  if (user.courseRole === 'teacher' || user.courseRole === 'ta') {
    // Can grade assignments if they are the course creator or a TA
    can('grade', 'Assignment', {
      course: { createdby: user.userId, taIds: { $in: [user.userId] } }
    });
    can('update', 'Grade', { gradedby: user.userId });
    can('read', 'Grade');
  }

  if (user.courseRole === 'student') {
    // Students can read their grades
    can('read', 'Grade', { studentid: user.userId });
  }

  // === Material Routes ===
  if (user.courseRole === 'teacher' || user.courseRole === 'ta') {
    // Can create materials if they are the course creator or a TA
    can('create', 'Material', {
      course: { createdby: user.userId, taIds: { $in: [user.userId] } }
    });
    // Can read materials if they are the course creator, a TA, or enrolled students
    can('read', 'Material', {
      course: { createdby: user.userId, taIds: { $in: [user.userId] }, enrolledStudentIds: { $in: [user.userId] } }
    });
  }

  if (user.courseRole === 'student') {
    // Students can read materials if they are enrolled
    can('read', 'Material', { course: { enrolledStudentIds: { $in: [user.userId] } } });
  }

  // === Announcement Routes ===
  if (user.courseRole === 'teacher' || user.courseRole === 'ta') {
    // Can create announcements if they are the course creator or a TA
    can('create', 'Announcement', {
      course: { createdby: user.userId, taIds: { $in: [user.userId] } }
    });
    // Can read announcements if they are the course creator, a TA, or enrolled students
    can('read', 'Announcement', {
      course: { createdby: user.userId, taIds: { $in: [user.userId] }, enrolledStudentIds: { $in: [user.userId] } }
    });
  }

  if (user.courseRole === 'student') {
    // Students can read announcements if they are enrolled
    can('read', 'Announcement', { course: { enrolledStudentIds: { $in: [user.userId] } } });
  }

  // === Discussion & Comment Routes ===
  can(['create', 'read'], 'Comment');

  // === Audit Log Routes ===
  if (user.courseRole === 'teacher') {
    // Teachers can create audit logs
    can('create', 'AuditLog');
  }

  return build();
}

module.exports = defineAbilitiesFor;
