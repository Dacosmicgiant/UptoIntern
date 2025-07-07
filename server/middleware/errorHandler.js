const mongoose = require("mongoose");

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  console.error("Error Details:", {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found with id: ${err.value}`;
    error = {
      message,
      statusCode: 404,
      error: "RESOURCE_NOT_FOUND"
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
    error = {
      message,
      statusCode: 409,
      error: "DUPLICATE_RESOURCE"
    };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map(val => val.message).join(", ");
    error = {
      message: `Validation Error: ${message}`,
      statusCode: 400,
      error: "VALIDATION_ERROR",
      details: Object.values(err.errors).map(val => ({
        field: val.path,
        message: val.message,
        value: val.value
      }))
    };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = {
      message: "Invalid token",
      statusCode: 401,
      error: "INVALID_TOKEN"
    };
  }

  if (err.name === "TokenExpiredError") {
    error = {
      message: "Token expired",
      statusCode: 401,
      error: "TOKEN_EXPIRED"
    };
  }

  // Multer errors (file upload)
  if (err.code === "LIMIT_FILE_SIZE") {
    error = {
      message: "File too large",
      statusCode: 400,
      error: "FILE_TOO_LARGE"
    };
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    error = {
      message: "Too many files",
      statusCode: 400,
      error: "TOO_MANY_FILES"
    };
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    error = {
      message: "Unexpected file field",
      statusCode: 400,
      error: "UNEXPECTED_FILE"
    };
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    error = {
      message: "Too many requests",
      statusCode: 429,
      error: "RATE_LIMIT_EXCEEDED"
    };
  }

  // PDF generation errors
  if (err.message && err.message.includes("puppeteer")) {
    error = {
      message: "PDF generation failed",
      statusCode: 500,
      error: "PDF_GENERATION_ERROR"
    };
  }

  // AI service errors
  if (err.message && (err.message.includes("Gemini") || err.message.includes("OpenAI"))) {
    error = {
      message: "AI service temporarily unavailable",
      statusCode: 503,
      error: "AI_SERVICE_ERROR"
    };
  }

  // Database connection errors
  if (err.name === "MongoNetworkError" || err.name === "MongoTimeoutError") {
    error = {
      message: "Database connection error",
      statusCode: 503,
      error: "DATABASE_CONNECTION_ERROR"
    };
  }

  // File system errors
  if (err.code === "ENOENT") {
    error = {
      message: "File not found",
      statusCode: 404,
      error: "FILE_NOT_FOUND"
    };
  }

  if (err.code === "EACCES" || err.code === "EPERM") {
    error = {
      message: "Permission denied",
      statusCode: 403,
      error: "PERMISSION_DENIED"
    };
  }

  // Default error response
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || "Internal server error";
  const errorCode = error.error || "INTERNAL_SERVER_ERROR";

  // Prepare error response
  const errorResponse = {
    success: false,
    message,
    error: errorCode,
    statusCode,
    timestamp: new Date().toISOString()
  };

  // Add additional details in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
    errorResponse.details = error.details;
    
    if (req.body && Object.keys(req.body).length > 0) {
      errorResponse.requestBody = req.body;
    }
    
    if (req.params && Object.keys(req.params).length > 0) {
      errorResponse.requestParams = req.params;
    }
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFound = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;
  
  console.warn("404 Not Found:", {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString()
  });

  res.status(404).json({
    success: false,
    message,
    error: "NOT_FOUND",
    statusCode: 404,
    timestamp: new Date().toISOString(),
    suggestion: "Please check the URL and try again"
  });
};

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch errors and pass to error middleware
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.error = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error handler
 * @param {Array} errors - Array of validation errors
 * @param {Object} res - Express response object
 */
const handleValidationErrors = (errors, res) => {
  const formattedErrors = errors.map(error => ({
    field: error.param,
    message: error.msg,
    value: error.value,
    location: error.location
  }));

  return res.status(400).json({
    success: false,
    message: "Validation failed",
    error: "VALIDATION_ERROR",
    statusCode: 400,
    details: formattedErrors,
    timestamp: new Date().toISOString()
  });
};

/**
 * Database error handler
 * @param {Error} err - Database error
 * @param {Object} res - Express response object
 */
const handleDatabaseError = (err, res) => {
  let message = "Database operation failed";
  let statusCode = 500;
  let errorCode = "DATABASE_ERROR";

  if (err.name === "ValidationError") {
    message = "Data validation failed";
    statusCode = 400;
    errorCode = "VALIDATION_ERROR";
  } else if (err.code === 11000) {
    message = "Duplicate entry found";
    statusCode = 409;
    errorCode = "DUPLICATE_ENTRY";
  } else if (err.name === "CastError") {
    message = "Invalid data format";
    statusCode = 400;
    errorCode = "INVALID_FORMAT";
  }

  return res.status(statusCode).json({
    success: false,
    message,
    error: errorCode,
    statusCode,
    timestamp: new Date().toISOString()
  });
};

/**
 * API error handler for external service failures
 * @param {Error} err - API error
 * @param {string} service - Service name
 * @param {Object} res - Express response object
 */
const handleApiError = (err, service, res) => {
  console.error(`${service} API Error:`, err);

  return res.status(503).json({
    success: false,
    message: `${service} service is temporarily unavailable`,
    error: "EXTERNAL_SERVICE_ERROR",
    statusCode: 503,
    service,
    timestamp: new Date().toISOString(),
    retryAfter: 300 // 5 minutes
  });
};

/**
 * File operation error handler
 * @param {Error} err - File operation error
 * @param {Object} res - Express response object
 */
const handleFileError = (err, res) => {
  let message = "File operation failed";
  let statusCode = 500;
  let errorCode = "FILE_ERROR";

  if (err.code === "ENOENT") {
    message = "File not found";
    statusCode = 404;
    errorCode = "FILE_NOT_FOUND";
  } else if (err.code === "EACCES" || err.code === "EPERM") {
    message = "Permission denied";
    statusCode = 403;
    errorCode = "PERMISSION_DENIED";
  } else if (err.code === "ENOSPC") {
    message = "Insufficient storage space";
    statusCode = 507;
    errorCode = "INSUFFICIENT_STORAGE";
  }

  return res.status(statusCode).json({
    success: false,
    message,
    error: errorCode,
    statusCode,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  AppError,
  handleValidationErrors,
  handleDatabaseError,
  handleApiError,
  handleFileError
};