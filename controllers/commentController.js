const pool = require('../config/dbConfig');
const checkAbilityForResource = require('../middlewares/abilityMiddleware.js');
const defineAbilitiesFor = require('../utils/caslAbility');
const { 
  createComment, 
  getCommentsForParent, 
  deleteComment, 
  getCommentById, 
  updateComment 
} = require('../models/Comment'); // Assuming these functions exist
const { getUserById } = require('../models/User'); // Assuming this function exists
const { getAnnouncementById } = require('../models/Announcement'); // Assuming this function exists
const { getMaterialById } = require('../models/Material'); // Assuming this function exists
const { getAssignmentById } = require('../models/Assignment'); // Assuming this function exists
const { getSubmissionById } = require('../models/Submission'); // Assuming this function exists
const { getCourseById } = require('../models/Course');
const { generateCourseResource } = require('../utils/resourceGenerators');

/**
 * Helper function to normalize parent type to ensure first letter is capitalized
 */
function normalizeParentType(parentType) {
  if (!parentType) return '';
  return parentType.charAt(0).toUpperCase() + parentType.slice(1).toLowerCase();
}

/**
 * Helper function to load the parent entity with its course
 */
async function loadParentWithCourse(parentType, parentId) {
  try {
    // Normalize parent type to ensure proper capitalization
    const normalizedParentType = normalizeParentType(parentType);
    let parent, course;
    
    switch (normalizedParentType) {
      case 'Announcement':
        parent = await getAnnouncementById(parentId);
        if (!parent) return null;
        
        course = await getCourseById(parent.courseid);
        if (!course) return null;
        
        return {
          ...parent,
          course: generateCourseResource(course)
        };
        
      case 'Material':
        parent = await getMaterialById(parentId);
        if (!parent) return null;
        
        course = await getCourseById(parent.courseid);
        if (!course) return null;
        
        return {
          ...parent,
          course: generateCourseResource(course)
        };
        
      case 'Assignment':
        parent = await getAssignmentById(parentId);
        if (!parent) return null;
        
        course = await getCourseById(parent.courseid);
        if (!course) return null;
        
        return {
          ...parent,
          course: generateCourseResource(course)
        };
        
      case 'Submission':
        parent = await getSubmissionById(parentId);
        if (!parent) return null;
        
        const assignment = await getAssignmentById(parent.assignmentid);
        if (!assignment) return null;
        
        course = await getCourseById(assignment.courseid);
        if (!course) return null;
        
        return {
          ...parent,
          assignment: {
            ...assignment,
            course: generateCourseResource(course)
          }
        };
        
      default:
        return null;
    }
  } catch (error) {
    console.error('Error loading parent entity:', error);
    return null;
  }
}

/**
 * Loader function for CASL checks on comment creation
 */
const commentCreateLoader = async (req) => {
  const { parentType: rawParentType, parentId } = req.body;
  const parentType = normalizeParentType(rawParentType);
  
  if (!parentType || !parentId) {
    throw { status: 400, message: 'Parent type and ID are required', origin: 'CommentController' };
  }
  
  const parent = await loadParentWithCourse(parentType, parentId);
  if (!parent) {
    throw { status: 404, message: `${parentType} not found with id ${parentId}`, origin: 'Database' };
  }
  
  return { 
    parentType, 
    parent,
    createdby: req.user.userId
  };
};

/**
 * Loader function for CASL checks on comment reading
 */
const commentReadLoader = async (req) => {
  const { parentType: rawParentType, parentId } = req.params;
  const parentType = normalizeParentType(rawParentType);
  
  if (!parentType || !parentId) {
    throw { status: 400, message: 'Parent type and ID are required', origin: 'CommentController' };
  }
  
  const parent = await loadParentWithCourse(parentType, parentId);
  if (!parent) {
    throw { status: 404, message: `${parentType} not found with id ${parentId}`, origin: 'Database' };
  }
  
  return { 
    parentType, 
    parent 
  };
};

/**
 * Loader function for CASL checks on comment operations (delete/update)
 */
const commentOperationLoader = async (req) => {
  const commentId = req.params.id;
  
  if (!commentId) {
    throw { status: 400, message: 'Comment ID is required', origin: 'CommentController' };
  }
  
  const comment = await getCommentById(commentId);
  if (!comment) {
    throw { status: 404, message: 'Comment not found', origin: 'Database' };
  }
  
  // Ensure parent type is properly capitalized
  const parentType = normalizeParentType(comment.parenttype);
  const parent = await loadParentWithCourse(parentType, comment.parentid);
  if (!parent) {
    throw { status: 404, message: `Parent ${parentType} not found`, origin: 'Database' };
  }
  
  return {
    ...comment,
    parenttype: parentType, // Ensure consistent capitalization
    parent
  };
};

/**
 * Create a new comment
 */
const create = [
  checkAbilityForResource('create', 'Comment', commentCreateLoader),
  async (req, res, next) => {
    try {
      const { content, parentType: rawParentType, parentId } = req.body;
      const parentType = normalizeParentType(rawParentType);
      const userId = req.user.userId;
      
      if (!content) {
        return res.status(400).json({
          status: 'error',
          code: 400,
          message: 'Comment content is required'
        });
      }
      
      // Create the comment with normalized parent type
      const comment = await createComment(content, parentType, parentId, userId);
      
      // Get user details for response
      const user = await getUserById(userId);
      
      return res.status(201).json({
        status: 'success',
        code: 201,
        message: 'Comment created successfully',
        data: {
          ...comment,
          user: {
            id: user.userid,
            name: user.name,
            email: user.email
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
];

/**
 * Get comments for a specific parent
 */
const getComments = [
  checkAbilityForResource('read', 'Comment', commentReadLoader),
  async (req, res, next) => {
    try {
      const { parentType: rawParentType, parentId } = req.params;
      const parentType = normalizeParentType(rawParentType);
      
      // Get all comments for this parent
      const comments = await getCommentsForParent(parentType, parentId);
      
      return res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Comments retrieved successfully',
        data: comments
      });
    } catch (error) {
      next(error);
    }
  }
];

/**
 * Delete a comment
 */
const remove = [
  checkAbilityForResource('delete', 'Comment', commentOperationLoader),
  async (req, res, next) => {
    try {
      const commentId = req.params.id;
      
      // Delete the comment
      await deleteComment(commentId);
      
      return res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
];

/**
 * Update a comment
 */
const update = [
  checkAbilityForResource('delete', 'Comment', commentOperationLoader), // Reuse delete permission check
  async (req, res, next) => {
    try {
      const commentId = req.params.id;
      const { content } = req.body;
      const userId = req.user.userId;
      
      if (!content) {
        return res.status(400).json({
          status: 'error',
          code: 400,
          message: 'Content cannot be empty'
        });
      }
      
      const comment = await getCommentById(commentId);
      
      // Ensure user is updating their own comment
      if (comment.createdby !== userId) {
        return res.status(403).json({
          status: 'error',
          code: 403,
          message: 'You can only update your own comments'
        });
      }
      
      // Update the comment
      const updatedComment = await updateComment(commentId, content);
      
      return res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Comment updated successfully',
        data: updatedComment
      });
    } catch (error) {
      next(error);
    }
  }
];

module.exports = {
  create,
  getComments,
  remove,
  update
};