### **1. Authentication Routes**
These routes are used for logging in and registering users.

- **POST `/api/auth/register`**  
  - **Role**: Any user (Admin/Teacher)  
  - **Description**: Register a new user (teacher, student, or TA).  
  - **ABAC**: Only **admin** can create other users; regular users can register themselves.

- **POST `/api/auth/login`**  
  - **Role**: Any user  
  - **Description**: Login a user and return a JWT token.  
  - **ABAC**: No role check; checks user credentials.

- **GET `/api/auth/logout`**  
  - **Role**: Any authenticated user  
  - **Description**: Logout the current user by invalidating their JWT token.  
  - **ABAC**: Only the logged-in user can log out.

---

### **2. Course Routes**
These routes are used to manage courses and enrollments.

- **POST `/api/courses`**  
  - **Role**: Teacher  
  - **Description**: Create a new course.  
  - **ABAC**: Ensure the user is a **teacher**.

- **GET `/api/courses`**  
  - **Role**: Teacher, Teaching Assistant, Student  
  - **Description**: List all courses the user is associated with.  
  - **ABAC**: Filter courses based on the **user’s role** and **enrollment**.
    - **Teacher**: Can view all courses they created.
    - **TA**: Can view courses they assist in.
    - **Student**: Can view courses they are enrolled in.

- **GET `/api/courses/{id}`**  
  - **Role**: Teacher, Teaching Assistant, Student  
  - **Description**: Get details of a specific course.  
  - **ABAC**: Ensure the user is authorized to view the course (teacher, TA, or enrolled student).

- **PUT `/api/courses/{id}`**  
  - **Role**: Teacher  
  - **Description**: Update course details.  
  - **ABAC**: Ensure that the user is the **teacher** of the course.

- **DELETE `/api/courses/{id}`**  
  - **Role**: Teacher  
  - **Description**: Delete a course.  
  - **ABAC**: Ensure that the user is the **teacher** of the course.

- **POST `/api/courses/{id}/enroll`**  
  - **Role**: Student  
  - **Description**: Enroll in a course using the unique CourseCode.  
  - **ABAC**: Ensure the user is a **student** and not already enrolled.

- **POST `/api/courses/{id}/students/{userId}`**  
  - **Role**: Teacher  
  - **Description**: Add a student or TA to a course.  
  - **ABAC**: Ensure the user is a **teacher** and the added user is a **student** or **TA**.

- **DELETE `/api/courses/{id}/students/{userId}`**  
  - **Role**: Teacher  
  - **Description**: Remove a student or TA from a course.  
  - **ABAC**: Ensure the user is the **teacher** of the course.

---

### **3. Assignment Routes**
These routes are used to manage assignments within courses.

- **POST `/api/courses/{id}/assignments`**  
  - **Role**: Teacher, Teaching Assistant  
  - **Description**: Create a new assignment for a course.  
  - **ABAC**: Ensure the user is a **teacher** or **TA** for the course.

- **GET `/api/courses/{id}/assignments`**  
  - **Role**: Teacher, Teaching Assistant, Student  
  - **Description**: View assignments for a course.  
  - **ABAC**: Ensure the user is authorized to view the assignments (teacher, TA, or student enrolled in the course).

- **GET `/api/assignments/{id}`**  
  - **Role**: Teacher, Teaching Assistant, Student  
  - **Description**: View details of a specific assignment.  
  - **ABAC**: Ensure the user is authorized to view the assignment.

- **PUT `/api/assignments/{id}`**  
  - **Role**: Teacher, Teaching Assistant  
  - **Description**: Update an existing assignment.  
  - **ABAC**: Ensure the user is a **teacher** or **TA** for the course.

- **DELETE `/api/assignments/{id}`**  
  - **Role**: Teacher  
  - **Description**: Delete an assignment.  
  - **ABAC**: Ensure the user is a **teacher** for the course.

---

### **4. Submission Routes**
These routes are used to manage student submissions for assignments.

- **POST `/api/assignments/{id}/submit`**  
  - **Role**: Student  
  - **Description**: Submit an assignment.  
  - **ABAC**: Ensure the user is a **student** enrolled in the course and has not exceeded the due date.

- **GET `/api/assignments/{id}/submissions`**  
  - **Role**: Teacher, Teaching Assistant  
  - **Description**: View all submissions for an assignment.  
  - **ABAC**: Ensure the user is a **teacher** or **TA** for the course.

- **GET `/api/assignments/{id}/submissions/{userId}`**  
  - **Role**: Teacher, Teaching Assistant  
  - **Description**: View a specific submission for an assignment.  
  - **ABAC**: Ensure the user is a **teacher** or **TA** for the course.

---

### **5. Grading and Feedback Routes**
These routes are used to grade student submissions.

- **POST `/api/assignments/{id}/grades`**  
  - **Role**: Teacher, Teaching Assistant  
  - **Description**: Grade a student’s assignment.  
  - **ABAC**: Ensure the user is a **teacher** or **TA** for the course.

- **PUT `/api/assignments/{id}/grades/{studentId}`**  
  - **Role**: Teacher  
  - **Description**: Modify a student’s grade.  
  - **ABAC**: Ensure the user is a **teacher** for the course.

- **GET `/api/grades/{id}`**  
  - **Role**: Teacher, Student  
  - **Description**: View a student's grade for an assignment.  
  - **ABAC**: Ensure the user is authorized to view the grade.
    - **Student**: Can only view their own grade.
    - **Teacher**: Can view any grade for assignments they graded.

---

### **6. Material Routes**
These routes are used to upload and view course materials.

- **POST `/api/courses/{id}/materials`**  
  - **Role**: Teacher, Teaching Assistant  
  - **Description**: Upload materials (e.g., files, links) for a course.  
  - **ABAC**: Ensure the user is a **teacher** or **TA** for the course.

- **GET `/api/courses/{id}/materials`**  
  - **Role**: Teacher, Teaching Assistant, Student  
  - **Description**: View materials for a course.  
  - **ABAC**: Ensure the user is authorized to view the materials (teacher, TA, or enrolled student).

---

### **7. Announcement Routes**
These routes are used to post and view course announcements.

- **POST `/api/courses/{id}/announcements`**  
  - **Role**: Teacher, Teaching Assistant  
  - **Description**: Post an announcement for a course.  
  - **ABAC**: Ensure the user is a **teacher** or **TA** for the course.

- **GET `/api/courses/{id}/announcements`**  
  - **Role**: Teacher, Teaching Assistant, Student  
  - **Description**: View announcements for a course.  
  - **ABAC**: Ensure the user is authorized to view the announcements (teacher, TA, or enrolled student).

---

### **8. Discussion and Comment Routes**
These routes are used for course discussions and comments.

- **POST `/api/discussions/{id}/comments`**  
  - **Role**: Teacher, Teaching Assistant, Student  
  - **Description**: Post a comment on a discussion or assignment.  
  - **ABAC**: Ensure the user is authorized to comment (teacher, TA, or student).

- **GET `/api/discussions/{id}/comments`**  
  - **Role**: Teacher, Teaching Assistant, Student  
  - **Description**: View all comments for a discussion or assignment.  
  - **ABAC**: Ensure the user is authorized to view the comments (teacher, TA, or student).

---

### **9. Audit Log Routes**
These routes log actions like submissions, grading, and announcements.

- **POST `/api/audit-logs`**  
  - **Role**: Admin, Teacher  
  - **Description**: Log system actions for tracking purposes.  
  - **ABAC**: Automatically triggered by system events.

---

