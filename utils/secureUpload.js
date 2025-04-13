// utils/secureUpload.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getPresignedUrlForUpload } = require('../config/minio');

const JWT_SECRET = process.env.JWT_SECRET || 'secure-upload-secret-key-change-in-production';
const TOKEN_EXPIRY = '15m'; // 15 minutes

/**
 * Generates a secure upload token for file uploads
 * The token contains encrypted information about the upload without exposing paths
 *
 * @param {Object} payload - The upload context (userId, assignmentId, courseId, etc.)
 * @returns {string} - JWT token with encrypted file information
 */
const generateUploadToken = (payload) => {
  // Generate a random file key - this will NEVER be exposed to the client
  const randomString = crypto.randomBytes(8).toString('hex');
  const fileKey = `submissions/${payload.courseId}/${payload.assignmentId}/${payload.userId}_${randomString}${payload.fileExtension}`;
  
  // Create JWT token with needed information
  return jwt.sign(
    { 
      uploadId: randomString,
      fileKey,  // The actual path that will be stored securely in the token
      assignmentId: payload.assignmentId,
      userId: payload.userId,
      courseId: payload.courseId,
      fileExtension: payload.fileExtension
    }, 
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

/**
 * Verifies and decodes an upload token
 *
 * @param {string} token - The JWT token to verify
 * @returns {Object|null} - The decoded payload or null if invalid
 */
const verifyUploadToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Error verifying upload token:', error);
    return null;
  }
};

/**
 * Generates a presigned URL for uploading using a secure token approach
 *
 * @param {Object} payload - The upload context
 * @returns {Object} - Object with presigned URL and upload token
 */
const generateSecureUploadUrl = async (payload) => {
  // Generate the token with embedded file key
  const token = generateUploadToken(payload);
  
  // Decode the token to get the file key (we need it for the presigned URL)
  const decoded = verifyUploadToken(token);
  if (!decoded) {
    throw new Error('Failed to create secure upload token');
  }
  
  // Generate the presigned URL using the file key from the token
  const presignedUrl = await getPresignedUrlForUpload(`classroom-uploads/${decoded.fileKey}`, payload.expiresIn || 300);
  
  // Return only the URL and token to the client (not the file key)
  return {
    url: presignedUrl,
    token: token
  };
};

/**
 * Generates a secure upload token for material uploads
 * The token contains encrypted information about the upload without exposing paths
 *
 * @param {Object} payload - The upload context for course materials
 * @returns {string} - JWT token with encrypted file information
 */
const generateMaterialUploadToken = (payload) => {
  // Generate a random file key - this will NEVER be exposed to the client
  const randomString = crypto.randomBytes(8).toString('hex');
  const fileKey = `materials/${payload.courseId}/${randomString}${payload.fileExtension}`;
  
  // Create JWT token with needed information
  return jwt.sign(
    { 
      uploadId: randomString,
      fileKey,  // The actual path that will be stored securely in the token
      userId: payload.userId,
      courseId: payload.courseId,
      fileExtension: payload.fileExtension
    }, 
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

/**
 * Generates a presigned URL for uploading course materials using a secure token approach
 *
 * @param {Object} payload - The upload context for materials
 * @returns {Object} - Object with presigned URL and upload token
 */
const generateSecureMaterialUploadUrl = async (payload) => {
  // Generate the token with embedded file key
  const token = generateMaterialUploadToken(payload);
  
  // Decode the token to get the file key (we need it for the presigned URL)
  const decoded = verifyUploadToken(token);
  if (!decoded) {
    throw new Error('Failed to create secure upload token for material');
  }
  
  // Generate the presigned URL using the file key from the token
  const presignedUrl = await getPresignedUrlForUpload(`classroom-uploads/${decoded.fileKey}`, payload.expiresIn || 300);
  
  // Return only the URL and token to the client (not the file key)
  return {
    url: presignedUrl,
    token: token
  };
};

module.exports = {
  generateSecureUploadUrl,
  verifyUploadToken,
  generateSecureMaterialUploadUrl
};