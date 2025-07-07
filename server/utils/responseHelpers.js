/**
 * Standard success response helper
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object} data - Response data (optional)
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} JSON response
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Standard error response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string|Object} error - Error details (optional)
 * @returns {Object} JSON response
 */
const errorResponse = (res, message, statusCode = 500, error = null) => {
  const response = {
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString()
  };

  if (error !== null) {
    if (typeof error === 'string') {
      response.error = error;
    } else if (Array.isArray(error)) {
      response.errors = error;
    } else {
      response.details = error;
    }
  }

  return res.status(statusCode).json(response);
};

/**
 * Paginated response helper
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination info
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} JSON response
 */
const paginatedResponse = (res, message, data, pagination, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      current: pagination.current || 1,
      total: pagination.total || 1,
      count: data.length,
      totalItems: pagination.totalItems || data.length,
      hasNext: pagination.current < pagination.total,
      hasPrev: pagination.current > 1
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Created resource response helper
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object} data - Created resource data
 * @param {string} resourceId - ID of created resource (optional)
 * @returns {Object} JSON response
 */
const createdResponse = (res, message, data, resourceId = null) => {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };

  if (resourceId) {
    response.resourceId = resourceId;
    // Set Location header for REST best practices
    res.setHeader('Location', `${req.baseUrl}/${resourceId}`);
  }

  return res.status(201).json(response);
};

/**
 * No content response helper (for DELETE operations)
 * @param {Object} res - Express response object
 * @param {string} message - Success message (optional)
 * @returns {Object} JSON response
 */
const noContentResponse = (res, message = "Operation completed successfully") => {
  return res.status(204).json({
    success: true,
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Validation error response helper
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 * @returns {Object} JSON response
 */
const validationErrorResponse = (res, errors) => {
  const formattedErrors = errors.map(error => ({
    field: error.param || error.path,
    message: error.msg || error.message,
    value: error.value,
    location: error.location
  }));

  return res.status(400).json({
    success: false,
    message: "Validation failed",
    statusCode: 400,
    errors: formattedErrors,
    timestamp: new Date().toISOString()
  });
};

/**
 * Unauthorized response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message (optional)
 * @returns {Object} JSON response
 */
const unauthorizedResponse = (res, message = "Authentication required") => {
  return res.status(401).json({
    success: false,
    message,
    statusCode: 401,
    error: "UNAUTHORIZED",
    timestamp: new Date().toISOString()
  });
};

/**
 * Forbidden response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message (optional)
 * @returns {Object} JSON response
 */
const forbiddenResponse = (res, message = "Access forbidden") => {
  return res.status(403).json({
    success: false,
    message,
    statusCode: 403,
    error: "FORBIDDEN",
    timestamp: new Date().toISOString()
  });
};

/**
 * Not found response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message (optional)
 * @returns {Object} JSON response
 */
const notFoundResponse = (res, message = "Resource not found") => {
  return res.status(404).json({
    success: false,
    message,
    statusCode: 404,
    error: "NOT_FOUND",
    timestamp: new Date().toISOString()
  });
};

/**
 * Conflict response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message (optional)
 * @returns {Object} JSON response
 */
const conflictResponse = (res, message = "Resource already exists") => {
  return res.status(409).json({
    success: false,
    message,
    statusCode: 409,
    error: "CONFLICT",
    timestamp: new Date().toISOString()
  });
};

/**
 * Too many requests response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message (optional)
 * @param {number} retryAfter - Retry after seconds (optional)
 * @returns {Object} JSON response
 */
const tooManyRequestsResponse = (res, message = "Too many requests", retryAfter = null) => {
  const response = {
    success: false,
    message,
    statusCode: 429,
    error: "TOO_MANY_REQUESTS",
    timestamp: new Date().toISOString()
  };

  if (retryAfter) {
    response.retryAfter = retryAfter;
    res.setHeader('Retry-After', retryAfter);
  }

  return res.status(429).json(response);
};

/**
 * Service unavailable response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message (optional)
 * @param {number} retryAfter - Retry after seconds (optional)
 * @returns {Object} JSON response
 */
const serviceUnavailableResponse = (res, message = "Service temporarily unavailable", retryAfter = null) => {
  const response = {
    success: false,
    message,
    statusCode: 503,
    error: "SERVICE_UNAVAILABLE",
    timestamp: new Date().toISOString()
  };

  if (retryAfter) {
    response.retryAfter = retryAfter;
    res.setHeader('Retry-After', retryAfter);
  }

  return res.status(503).json(response);
};

/**
 * API response with metadata
 * @param {Object} res - Express response object
 * @param {string} message - Response message
 * @param {Object} data - Response data
 * @param {Object} meta - Metadata (optional)
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} JSON response
 */
const responseWithMeta = (res, message, data, meta = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: {
      ...meta,
      requestId: res.locals.requestId || null,
      version: process.env.API_VERSION || "1.0.0",
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * File download response helper
 * @param {Object} res - Express response object
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} filename - Download filename
 * @param {string} contentType - MIME type
 * @returns {Object} File response
 */
const fileDownloadResponse = (res, fileBuffer, filename, contentType = 'application/octet-stream') => {
  res.set({
    'Content-Type': contentType,
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length': fileBuffer.length
  });

  return res.end(fileBuffer);
};

/**
 * Redirect response helper
 * @param {Object} res - Express response object
 * @param {string} url - Redirect URL
 * @param {number} statusCode - HTTP status code (default: 302)
 * @returns {Object} Redirect response
 */
const redirectResponse = (res, url, statusCode = 302) => {
  return res.status(statusCode).json({
    success: true,
    message: "Redirecting",
    redirectUrl: url,
    statusCode,
    timestamp: new Date().toISOString()
  });
};

/**
 * Health check response helper
 * @param {Object} res - Express response object
 * @param {Object} healthData - Health check data
 * @returns {Object} JSON response
 */
const healthCheckResponse = (res, healthData = {}) => {
  const defaultHealth = {
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development"
  };

  return res.status(200).json({
    success: true,
    message: "Service is healthy",
    data: { ...defaultHealth, ...healthData },
    timestamp: new Date().toISOString()
  });
};

/**
 * API version response helper
 * @param {Object} res - Express response object
 * @param {Object} versionInfo - Version information
 * @returns {Object} JSON response
 */
const versionResponse = (res, versionInfo = {}) => {
  const defaultVersion = {
    api: process.env.API_VERSION || "1.0.0",
    app: process.env.npm_package_version || "1.0.0",
    node: process.version,
    environment: process.env.NODE_ENV || "development"
  };

  return res.status(200).json({
    success: true,
    message: "Version information",
    data: { ...defaultVersion, ...versionInfo },
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  tooManyRequestsResponse,
  serviceUnavailableResponse,
  responseWithMeta,
  fileDownloadResponse,
  redirectResponse,
  healthCheckResponse,
  versionResponse
};