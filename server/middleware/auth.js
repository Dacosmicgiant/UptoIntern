const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Authentication middleware - Protects routes requiring login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next function
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "") || 
                  req.header("x-auth-token");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user and attach to request
      const user = await User.findById(decoded.user.id).select("-password");
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Access denied. User not found."
        });
      }

      // Check if user account is locked
      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          message: "Account is temporarily locked. Please try again later."
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError.message);
      
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired. Please login again.",
          error: "TOKEN_EXPIRED"
        });
      }
      
      if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token. Please login again.",
          error: "INVALID_TOKEN"
        });
      }
      
      return res.status(401).json({
        success: false,
        message: "Token verification failed.",
        error: "TOKEN_VERIFICATION_FAILED"
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authentication",
      error: error.message
    });
  }
};

/**
 * Optional authentication middleware - Does not fail if no token provided
 * Useful for routes that work for both authenticated and anonymous users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "") || 
                  req.header("x-auth-token");

    if (!token) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user and attach to request
      const user = await User.findById(decoded.user.id).select("-password");
      
      if (user && !user.isLocked) {
        req.user = user;
      } else {
        req.user = null;
      }
    } catch (jwtError) {
      // Invalid token, continue without authentication
      console.warn("Optional auth - invalid token:", jwtError.message);
      req.user = null;
    }

    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    // On error, continue without authentication
    req.user = null;
    next();
  }
};

/**
 * Admin authorization middleware - Requires admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authorization",
      error: error.message
    });
  }
};

/**
 * Rate limiting based on user
 * @param {number} maxRequests - Maximum requests per window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Express middleware function
 */
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map();

  return (req, res, next) => {
    try {
      const identifier = req.user?.id || req.ip;
      const now = Date.now();
      
      if (!userRequests.has(identifier)) {
        userRequests.set(identifier, { count: 1, resetTime: now + windowMs });
        return next();
      }

      const userLimit = userRequests.get(identifier);
      
      if (now > userLimit.resetTime) {
        // Reset the limit
        userRequests.set(identifier, { count: 1, resetTime: now + windowMs });
        return next();
      }

      if (userLimit.count >= maxRequests) {
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
        });
      }

      userLimit.count++;
      next();
    } catch (error) {
      console.error("Rate limit middleware error:", error);
      next(); // Continue on error
    }
  };
};

/**
 * Subscription-based feature access control
 * @param {string} feature - Feature name to check access for
 * @returns {Function} Express middleware function
 */
const requireFeature = (feature) => {
  const featureAccess = {
    free: ["basic_resume", "pdf_download"],
    pro: ["basic_resume", "pdf_download", "ai_enhancement", "multiple_templates", "sharing"],
    enterprise: ["basic_resume", "pdf_download", "ai_enhancement", "multiple_templates", "sharing", "analytics", "team_management"]
  };

  return (req, res, next) => {
    try {
      if (!req.user) {
        // Allow free features for anonymous users
        if (featureAccess.free.includes(feature)) {
          return next();
        }
        
        return res.status(401).json({
          success: false,
          message: "Authentication required for this feature"
        });
      }

      const userPlan = req.user.subscription?.plan || "free";
      const allowedFeatures = featureAccess[userPlan] || featureAccess.free;

      if (!allowedFeatures.includes(feature)) {
        return res.status(403).json({
          success: false,
          message: `This feature requires a ${feature === "ai_enhancement" ? "Pro" : "higher"} subscription`,
          currentPlan: userPlan,
          requiredFeature: feature
        });
      }

      next();
    } catch (error) {
      console.error("Feature access middleware error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error during feature access check",
        error: error.message
      });
    }
  };
};

/**
 * Validate API key for external integrations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateApiKey = (req, res, next) => {
  try {
    const apiKey = req.header("X-API-Key");
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "API key required"
      });
    }

    // In a real application, you would validate against a database
    // For now, we'll use environment variable
    const validApiKey = process.env.API_KEY;
    
    if (!validApiKey || apiKey !== validApiKey) {
      return res.status(401).json({
        success: false,
        message: "Invalid API key"
      });
    }

    next();
  } catch (error) {
    console.error("API key validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during API key validation",
      error: error.message
    });
  }
};

module.exports = {
  auth,
  optionalAuth,
  requireAdmin,
  userRateLimit,
  requireFeature,
  validateApiKey
};