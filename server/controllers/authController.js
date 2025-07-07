const User = require("../models/User");
const { validationResult } = require("express-validator");
const { successResponse, errorResponse } = require("../utils/responseHelpers");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed", 400, errors.array());
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, "User with this email already exists", 409);
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    await user.save();

    // Generate auth token
    const token = user.generateAuthToken();

    // Remove password from response
    const userResponse = user.toJSON();

    return successResponse(res, "User registered successfully", {
      user: userResponse,
      token
    }, 201);

  } catch (error) {
    console.error("Registration error:", error);
    return errorResponse(res, "Failed to register user", 500, error.message);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed", 400, errors.array());
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    // Check if account is locked
    if (user.isLocked) {
      return errorResponse(res, "Account is temporarily locked due to too many failed login attempts", 423);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increase failed login attempts
      await User.increaseFailedAttempts(user._id);
      return errorResponse(res, "Invalid email or password", 401);
    }

    // Reset failed login attempts on successful login
    await User.resetFailedAttempts(user._id);
    
    // Update last login
    await user.updateLastLogin();

    // Generate auth token
    const token = user.generateAuthToken();

    // Remove password from response
    const userResponse = user.toJSON();

    return successResponse(res, "Login successful", {
      user: userResponse,
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, "Failed to login", 500, error.message);
  }
};

/**
 * Get current user profile
 * GET /api/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return errorResponse(res, "Authentication required", 401);
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, "Profile retrieved successfully", {
      user: user.toJSON()
    });

  } catch (error) {
    console.error("Get profile error:", error);
    return errorResponse(res, "Failed to retrieve profile", 500, error.message);
  }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed", 400, errors.array());
    }

    if (!req.user) {
      return errorResponse(res, "Authentication required", 401);
    }

    const { name, preferences } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Update allowed fields
    if (name !== undefined) {
      user.name = name.trim();
    }

    if (preferences !== undefined) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    return successResponse(res, "Profile updated successfully", {
      user: user.toJSON()
    });

  } catch (error) {
    console.error("Update profile error:", error);
    return errorResponse(res, "Failed to update profile", 500, error.message);
  }
};

/**
 * Change password
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed", 400, errors.array());
    }

    if (!req.user) {
      return errorResponse(res, "Authentication required", 401);
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return errorResponse(res, "Current password is incorrect", 400);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return successResponse(res, "Password changed successfully");

  } catch (error) {
    console.error("Change password error:", error);
    return errorResponse(res, "Failed to change password", 500, error.message);
  }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed", 400, errors.array());
    }

    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return successResponse(res, "If the email exists, a password reset link has been sent");
    }

    // Generate reset token
    const resetToken = user.generateResetToken();
    await user.save();

    // In a real application, you would send an email here
    // For now, we'll just return the token (remove this in production)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return successResponse(res, "If the email exists, a password reset link has been sent", {
      // Remove this in production
      resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return errorResponse(res, "Failed to process password reset request", 500, error.message);
  }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed", 400, errors.array());
    }

    const { token, newPassword } = req.body;

    const user = await User.findByResetToken(token);
    
    if (!user) {
      return errorResponse(res, "Invalid or expired reset token", 400);
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    // Generate new auth token
    const authToken = user.generateAuthToken();

    return successResponse(res, "Password reset successful", {
      user: user.toJSON(),
      token: authToken
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return errorResponse(res, "Failed to reset password", 500, error.message);
  }
};

/**
 * Verify JWT token
 * POST /api/auth/verify-token
 */
const verifyToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return errorResponse(res, "Token is required", 400);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.user.id);
      
      if (!user) {
        return errorResponse(res, "Invalid token", 401);
      }

      return successResponse(res, "Token is valid", {
        user: user.toJSON(),
        isValid: true
      });

    } catch (jwtError) {
      return errorResponse(res, "Invalid token", 401);
    }

  } catch (error) {
    console.error("Verify token error:", error);
    return errorResponse(res, "Failed to verify token", 500, error.message);
  }
};

/**
 * Logout user (invalidate token on client side)
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    // In a stateless JWT setup, logout is typically handled client-side
    // by removing the token from storage
    
    // Optional: You could maintain a blacklist of tokens in Redis/database
    // for added security in production applications

    return successResponse(res, "Logout successful");

  } catch (error) {
    console.error("Logout error:", error);
    return errorResponse(res, "Failed to logout", 500, error.message);
  }
};

/**
 * Delete user account
 * DELETE /api/auth/account
 */
const deleteAccount = async (req, res) => {
  try {
    if (!req.user) {
      return errorResponse(res, "Authentication required", 401);
    }

    const { password } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Verify password before deletion
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return errorResponse(res, "Password is incorrect", 400);
    }

    // Delete user and associated data
    await User.findByIdAndDelete(req.user.id);
    
    // Also delete user's resumes
    const Resume = require("../models/Resume");
    await Resume.deleteMany({ userId: req.user.id });

    return successResponse(res, "Account deleted successfully");

  } catch (error) {
    console.error("Delete account error:", error);
    return errorResponse(res, "Failed to delete account", 500, error.message);
  }
};

/**
 * Get authentication status and user stats
 * GET /api/auth/status
 */
const getAuthStatus = async (req, res) => {
  try {
    if (!req.user) {
      return successResponse(res, "Not authenticated", {
        isAuthenticated: false,
        user: null
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return successResponse(res, "User not found", {
        isAuthenticated: false,
        user: null
      });
    }

    // Get user's resume count
    const Resume = require("../models/Resume");
    const resumeCount = await Resume.countDocuments({ userId: req.user.id });

    return successResponse(res, "Authentication status", {
      isAuthenticated: true,
      user: user.toJSON(),
      stats: {
        resumeCount,
        accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)), // days
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error("Get auth status error:", error);
    return errorResponse(res, "Failed to get authentication status", 500, error.message);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyToken,
  logout,
  deleteAccount,
  getAuthStatus
};