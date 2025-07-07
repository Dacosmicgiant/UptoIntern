const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

// Import controllers and middleware
const {
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
} = require("../controllers/authController");

const { auth, optionalAuth } = require("../middleware/auth");

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  "/register",
  [
    body("name")
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters")
      .trim()
      .escape(),
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must contain at least one lowercase letter, one uppercase letter, and one number")
  ],
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    body("password")
      .exists()
      .withMessage("Password is required")
      .notEmpty()
      .withMessage("Password cannot be empty")
  ],
  login
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", auth, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  "/profile",
  [
    auth,
    body("name")
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters")
      .trim()
      .escape(),
    body("preferences.theme")
      .optional()
      .isIn(["light", "dark", "system"])
      .withMessage("Theme must be light, dark, or system"),
    body("preferences.notifications")
      .optional()
      .isBoolean()
      .withMessage("Notifications must be a boolean"),
    body("preferences.defaultTemplate")
      .optional()
      .isString()
      .withMessage("Default template must be a string")
  ],
  updateProfile
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  "/change-password",
  [
    auth,
    body("currentPassword")
      .exists()
      .withMessage("Current password is required")
      .notEmpty()
      .withMessage("Current password cannot be empty"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("New password must contain at least one lowercase letter, one uppercase letter, and one number")
  ],
  changePassword
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail()
  ],
  forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  "/reset-password",
  [
    body("token")
      .exists()
      .withMessage("Reset token is required")
      .notEmpty()
      .withMessage("Reset token cannot be empty"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("New password must contain at least one lowercase letter, one uppercase letter, and one number")
  ],
  resetPassword
);

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify JWT token
 * @access  Public
 */
router.post(
  "/verify-token",
  [
    body("token")
      .exists()
      .withMessage("Token is required")
      .notEmpty()
      .withMessage("Token cannot be empty")
  ],
  verifyToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", auth, logout);

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete(
  "/account",
  [
    auth,
    body("password")
      .exists()
      .withMessage("Password is required for account deletion")
      .notEmpty()
      .withMessage("Password cannot be empty")
  ],
  deleteAccount
);

/**
 * @route   GET /api/auth/status
 * @desc    Get authentication status
 * @access  Public/Private
 */
router.get("/status", optionalAuth, getAuthStatus);

module.exports = router;