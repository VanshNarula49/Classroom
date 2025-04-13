// controllers/query.controller.js

const pool = require('../config/dbConfig');


/**
 * Controller to handle all academic data queries
 * Route: POST /queries/:queryId
 */
const executeQuery = async (req, res, next) => {
  try {
    const queryId = parseInt(req.params.queryId);
    
    if (isNaN(queryId) || queryId < 1 || queryId > 10) {
      throw { status: 400, message: 'Invalid query ID. Must be between 1 and 10.', origin: 'QueryController' };
    }
    
    // Parameter validation based on query type
    switch (queryId) {
      case 1: // List of students enrolled in a course
      case 2: // All materials posted for a specific course
      case 4: // Find all announcements in a course by professors
        // These queries require courseId unconditionally
        if (!req.body.courseId) {
          throw { status: 400, message: 'Course ID is required', origin: 'QueryController' };
        }
        break;

      case 3: // List all comments under a particular assignment
        if (!req.body.assignmentId) {
          throw { status: 400, message: 'Assignment ID is required', origin: 'QueryController' };
        }
        break;
        
      case 6: // Performance of a specific student in each course
        if (!req.body.userId) {
          throw { status: 400, message: 'User ID is required', origin: 'QueryController' };
        }
        break;
        
      // Cases 5, 7, 8, 9, and 10 don't have required parameters, they have optional filters
    }
    
    let queryText;
    let queryParams = [];
    
    // Set up the specific query
    switch (queryId) {
      case 1: // List of students enrolled in a course
        queryText = `
          SELECT u.UserId, u.Name, u.Email, c.Name AS CourseName  
          FROM COURSEPARTICIPATION cp  
          JOIN "User" u ON cp.UserId = u.UserId  
          JOIN COURSE c ON cp.CourseId = c.CourseId
          WHERE cp.Role = 'Student' AND c.CourseId = $1
          ORDER BY c.Name, u.Name
        `;
        queryParams = [req.body.courseId];
        break;
        
      case 2: // All materials posted for a specific course
        queryText = `
          SELECT  
              m.MaterialId,  
              m.Title AS MaterialTitle,  
              m.Type AS MaterialType,  
              m.Description,  
              m.FilePath,  
              u.Name AS PostedBy,  
              m.CreatedAt  
          FROM MATERIAL m  
          JOIN COURSE c ON m.CourseId = c.CourseId  
          JOIN "User" u ON m.CreatedBy = u.UserId  
          WHERE m.CourseId = $1  
          ORDER BY m.CreatedAt DESC
        `;
        queryParams = [req.body.courseId];
        break;
        
      case 3: // List all comments under a particular assignment
        queryText = `
          SELECT  
              com.CommentId,  
              com.Content,  
              com.PostedAt,  
              u.Name AS Commenter  
          FROM COMMENT com  
          JOIN "User" u ON com.PostedBy = u.UserId  
          WHERE com.ParentId = $1 AND com.ParentType = 'Assignment'  
          ORDER BY com.PostedAt
        `;
        queryParams = [req.body.assignmentId];
        break;
        
      case 4: // Find all announcements in a course by professors
        queryText = `
          SELECT  
              a.AnnouncementId,  
              a.Title,  
              a.Content,  
              a.CreatedAt,  
              u.Name AS InstructorName  
          FROM ANNOUNCEMENT a  
          JOIN COURSE c ON a.CourseId = c.CourseId  
          JOIN COURSEPARTICIPATION cp ON c.CourseId = cp.CourseId  
          JOIN "User" u ON cp.UserId = u.UserId  
          WHERE cp.Role = 'Professor' AND c.CourseId = $1
          ORDER BY a.CreatedAt DESC
        `;
        queryParams = [req.body.courseId];
        break;
        
      case 5: // Identifies late submissions
        queryText = `
          SELECT  
              s.SubmissionId,  
              u.Name AS StudentName,  
              c.Name AS CourseName,  
              a.Title AS AssignmentTitle,  
              s.SubmittedDate,  
              a.DueDate,  
              (EXTRACT(EPOCH FROM s.SubmittedDate) - EXTRACT(EPOCH FROM a.DueDate)) / 86400 AS DaysLate  
          FROM SUBMISSION s  
          JOIN ASSIGNMENT a ON s.AssignmentId = a.AssignmentId  
          JOIN COURSE c ON a.CourseId = c.CourseId  
          JOIN "User" u ON s.StudentId = u.UserId  
          WHERE s.SubmittedDate > a.DueDate
        `;
        
        // Add optional course filter if provided
        if (req.body.courseId) {
          queryText += ` AND c.CourseId = $1`;
          queryParams = [req.body.courseId];
        }
        
        queryText += ` ORDER BY DaysLate DESC, c.Name, a.Title`;
        break;
        
      case 6: // Performance of a specific student in each course
        queryText = `
          SELECT  
              c.Name AS CourseName,  
              ROUND(AVG(g.Score), 2) AS AverageGrade,  
              COUNT(a.AssignmentId) AS TotalAssignments,  
              COUNT(s.SubmissionId) AS CompletedAssignments,  
              COUNT(a.AssignmentId) - COUNT(s.SubmissionId) AS MissingAssignments,  
              COUNT(s.SubmissionId) FILTER (WHERE s.SubmittedDate > a.DueDate) AS LateSubmissions  
          FROM COURSE c  
          JOIN COURSEPARTICIPATION cp ON c.CourseId = cp.CourseId  
          JOIN ASSIGNMENT a ON c.CourseId = a.CourseId  
          LEFT JOIN SUBMISSION s ON a.AssignmentId = s.AssignmentId AND s.StudentId = $1  
          LEFT JOIN GRADE g ON s.SubmissionId = g.SubmissionId  
          WHERE cp.UserId = $1  
          GROUP BY c.CourseId
        `;
        queryParams = [req.body.userId];
        break;
        
      case 7: // Average scores, score ranges, and failure rates for each assignment
        queryText = `
          SELECT  
              a.Title AS AssignmentTitle,  
              c.Name AS CourseName,  
              COUNT(s.SubmissionId) AS NumberOfSubmissions,  
              AVG(g.Score) AS AverageScore,  
              MIN(g.Score) AS MinScore,  
              MAX(g.Score) AS MaxScore,  
              (MAX(g.Score) - MIN(g.Score)) AS ScoreRange,  
              SUM(CASE WHEN g.Score < 30 THEN 1 ELSE 0 END) * 100.0 / COUNT(g.GradeId) AS FailRate  
          FROM ASSIGNMENT a  
          JOIN COURSE c ON a.CourseId = c.CourseId  
          JOIN SUBMISSION s ON a.AssignmentId = s.AssignmentId  
          JOIN GRADE g ON s.SubmissionId = g.SubmissionId
        `;
        
        // Add optional course filter if provided
        if (req.body.courseId) {
          queryText += ` WHERE c.CourseId = $1`;
          queryParams = [req.body.courseId];
        }
        
        queryText += ` GROUP BY a.AssignmentId, c.Name, c.CourseId ORDER BY c.CourseId`;
        break;
        
      case 8: // Completion rates, average scores, and late submissions per student
        queryText = `
          SELECT  
              u.UserId,  
              u.Name AS StudentName,  
              c.CourseId,  
              c.Name AS CourseName,  
              COUNT(a.AssignmentId) AS TotalAssignments,  
              COUNT(s.SubmissionId) AS CompletedAssignments,  
              ROUND(COUNT(s.SubmissionId) * 100.0 / COUNT(a.AssignmentId), 2) AS CompletionRate,  
              AVG(g.Score) AS AverageScore,  
              COUNT(s.SubmissionId) FILTER (WHERE s.SubmittedDate > a.DueDate) AS LateSubmissions  
          FROM "User" u  
          JOIN COURSEPARTICIPATION cp ON u.UserId = cp.UserId  
          JOIN COURSE c ON cp.CourseId = c.CourseId  
          JOIN ASSIGNMENT a ON c.CourseId = a.CourseId  
          LEFT JOIN SUBMISSION s ON a.AssignmentId = s.AssignmentId AND s.StudentId = u.UserId  
          LEFT JOIN GRADE g ON s.SubmissionId = g.SubmissionId  
          WHERE cp.Role = 'Student'
        `;
        
        // Add optional user filter if provided
        if (req.body.userId) {
          queryText += ` AND u.UserId = $1`;
          queryParams = [req.body.userId];
        }
        
        queryText += ` GROUP BY u.UserId, u.Name, c.CourseId, c.Name ORDER BY c.Name, u.Name`;
        break;
        
      case 9: // Grade distribution per course
        queryText = `
          SELECT  
              c.CourseId,  
              c.Name AS CourseName,  
              COUNT(g.GradeId) AS TotalGrades,  
              AVG(g.Score) AS AverageScore,  
              ROUND(SUM(CASE WHEN g.Score >= 90 THEN 1 ELSE 0 END) * 100.0 / COUNT(g.GradeId), 2) AS APercentage,  
              ROUND(SUM(CASE WHEN g.Score >= 75 AND g.Score < 90 THEN 1 ELSE 0 END) * 100.0 / COUNT(g.GradeId), 2) AS BPercentage,  
              ROUND(SUM(CASE WHEN g.Score >= 60 AND g.Score < 75 THEN 1 ELSE 0 END) * 100.0 / COUNT(g.GradeId), 2) AS CPercentage,  
              ROUND(SUM(CASE WHEN g.Score >= 45 AND g.Score < 60 THEN 1 ELSE 0 END) * 100.0 / COUNT(g.GradeId), 2) AS DPercentage,  
              ROUND(SUM(CASE WHEN g.Score >= 30 AND g.Score < 45 THEN 1 ELSE 0 END) * 100.0 / COUNT(g.GradeId), 2) AS EPercentage,  
              ROUND(SUM(CASE WHEN g.Score < 30 THEN 1 ELSE 0 END) * 100.0 / COUNT(g.GradeId), 2) AS FPercentage  
          FROM GRADE g  
          JOIN SUBMISSION s ON g.SubmissionId = s.SubmissionId  
          JOIN ASSIGNMENT a ON s.AssignmentId = a.AssignmentId  
          JOIN COURSE c ON a.CourseId = c.CourseId
        `;
        
        // Add optional course filter if provided
        
        
        queryText += ` GROUP BY c.CourseId, c.Name HAVING COUNT(g.GradeId) > 0 ORDER BY c.CourseId`;
        break;
        
      case 10: // Identifying students at risk of failing
        queryText = `
          WITH StudentPerformance AS (  
              SELECT  
                  u.UserId,  
                  u.Name AS StudentName,  
                  c.CourseId,  
                  c.Name AS CourseName,  
                  COUNT(a.AssignmentId) AS TotalAssignments,  
                  COUNT(s.SubmissionId) AS CompletedAssignments,  
                  ROUND(COUNT(s.SubmissionId) * 100.0 / COUNT(a.AssignmentId), 2) AS CompletionRate,  
                  AVG(g.Score) AS AverageScore,  
                  COUNT(s.SubmissionId) FILTER (WHERE s.SubmittedDate > a.DueDate) AS LateSubmissions  
              FROM "User" u  
              JOIN COURSEPARTICIPATION cp ON u.UserId = cp.UserId  
              JOIN COURSE c ON cp.CourseId = c.CourseId  
              JOIN ASSIGNMENT a ON c.CourseId = a.CourseId  
              LEFT JOIN SUBMISSION s ON a.AssignmentId = s.AssignmentId AND s.StudentId = u.UserId  
              LEFT JOIN GRADE g ON s.SubmissionId = g.SubmissionId  
              WHERE cp.Role = 'Student'  
              GROUP BY u.UserId, u.Name, c.CourseId, c.Name  
          )  
          SELECT * FROM StudentPerformance  
          WHERE AverageScore < 30 
          ORDER BY AverageScore
        `;
        break;
    }
    
    // Execute the query
    const result = await pool.query(queryText, queryParams);
    
    // Return the query results
    res.json({
      status: 'success',
      code: 200,
      message: `Query ${queryId} executed successfully.`,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { executeQuery };