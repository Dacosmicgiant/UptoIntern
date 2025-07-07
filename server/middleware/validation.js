const { body, param, query, validationResult } = require("express-validator");
const { validationErrorResponse } = require("../utils/responseHelpers");

/**
 * Handle validation errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors.array());
  }
  
  next();
};

/**
 * Resume validation rules
 */
const resumeValidation = {
  create: [
    body("name")
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage("Name must be between 1 and 100 characters")
      .trim(),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    body("phone")
      .optional()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage("Please provide a valid phone number"),
    body("role")
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage("Role must be between 1 and 200 characters")
      .trim(),
    handleValidationErrors
  ],
  
  save: [
    body("resumeId")
      .optional()
      .isMongoId()
      .withMessage("Invalid resume ID format"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    body().custom((value, { req }) => {
      if (!req.body.resumeId && !req.body.email) {
        throw new Error("Either resumeId or email is required");
      }
      return true;
    }),
    handleValidationErrors
  ]
};

/**
 * User validation rules
 */
const userValidation = {
  register: [
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
      .withMessage("Password must contain at least one lowercase letter, one uppercase letter, and one number"),
    handleValidationErrors
  ],
  
  login: [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    body("password")
      .exists()
      .withMessage("Password is required")
      .notEmpty()
      .withMessage("Password cannot be empty"),
    handleValidationErrors
  ]
};

/**
 * Enhancement validation rules
 */
const enhancementValidation = {
  field: [
    body("section")
      .exists()
      .withMessage("Section is required")
      .isIn([
        "summary", "experience", "education", "skills", 
        "achievements", "projects", "courses", "certifications"
      ])
      .withMessage("Invalid section"),
    body("content")
      .exists()
      .withMessage("Content is required")
      .isLength({ min: 10, max: 5000 })
      .withMessage("Content must be between 10 and 5000 characters")
      .trim(),
    body("enhancementType")
      .optional()
      .isIn(["professional", "creative", "concise", "improve"])
      .withMessage("Enhancement type must be professional, creative, concise, or improve"),
    handleValidationErrors
  ]
};

/**
 * File upload validation rules
 */
const uploadValidation = {
  parseText: [
    body("content")
      .exists()
      .withMessage("Resume content is required")
      .isLength({ min: 50, max: 50000 })
      .withMessage("Content must be between 50 and 50,000 characters")
      .trim(),
    body("editType")
      .optional()
      .isIn(["manual", "ai"])
      .withMessage("Edit type must be either 'manual' or 'ai'"),
    handleValidationErrors
  ]
};

module.exports = {
  handleValidationErrors,
  resumeValidation,
  userValidation,
  enhancementValidation,
  uploadValidation
};