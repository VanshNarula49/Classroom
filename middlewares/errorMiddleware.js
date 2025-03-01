// /middlewares/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
  console.error(err); // Log the error for debugging

  // Handle JWT-related errors (e.g., invalid or expired token)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      code: 401,
      message: 'Invalid or expired token. Please log in again.',
      details: err.message, // Provide specific error details for debugging
    });
  }

  // Handle custom errors (like "Email already in use")
  if (err.status && err.message) {
    return res.status(err.status).json({
      status: 'error',
      code: err.status,
      message: err.message,
      details: err.details || 'No additional details available.',
      origin: err.origin || 'Controller',
    });
  }

  // Handle general database errors (e.g., unique constraint violation in PostgreSQL)
  if (err.code === '23505') {  // PostgreSQL unique constraint violation (e.g., duplicate email)
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: `Duplicate value found. ${err.table ? `Failed to insert in ${err.table}.` : ''} Please ensure unique values.`,
      details: err.details || 'Email already in use.',
      origin: 'Database',
    });
  }

  // Handle validation errors (e.g., from Joi or express-validator)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: 'Validation error(s) occurred.',
      errors: err.errors,
      origin: 'Validation',
    });
  }

  // Default error handler for any unhandled errors
  return res.status(500).json({
    status: 'error',
    code: 500,
    message: 'Something went wrong. Please try again later.',
    details: err.message || 'Unexpected error occurred.',
    origin: err.origin || 'Unknown',
  });
};

module.exports = errorHandler;
