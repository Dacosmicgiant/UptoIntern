const express = require("express");
const { body, param, query } = require("express-validator");
const router = express.Router();

// Import controllers and middleware
const {
  createResume,
  saveResume,
  loadResume,
  getAllResumes,
  deleteResume,
  downloadPDF,
  shareResume,
  getSharedResume,
  duplicateResume
} = require("../controllers/resumeController");

const { auth, optionalAuth } = require("../middleware/auth");

/**
 * @route   POST /api/resume/create
 * @desc    Create a new resume
 * @access  Public/Private
 */
router.post(
  "/create",
  [
    optionalAuth,
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
    body("location")
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage("Location must be between 1 and 100 characters")
      .trim(),
    body("summary")
      .optional()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Summary must be between 10 and 1000 characters")
      .trim(),
    body("experience")
      .optional()
      .isArray()
      .withMessage("Experience must be an array"),
    body("education")
      .optional()
      .isArray()
      .withMessage("Education must be an array"),
    body("skills")
      .optional()
      .isArray()
      .withMessage("Skills must be an array"),
    body("template")
      .optional()
      .isIn(["modern", "classic", "creative", "professional", "minimal"])
      .withMessage("Invalid template selection")
  ],
  createResume
);

/**
 * @route   PUT /api/resume/save
 * @desc    Save/Update resume (Auto-save functionality)
 * @access  Public/Private
 */
router.put(
  "/save",
  [
    optionalAuth,
    body("resumeId")
      .optional()
      .isMongoId()
      .withMessage("Invalid resume ID format"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    // Validate that either resumeId or email is provided
    body().custom((value, { req }) => {
      if (!req.body.resumeId && !req.body.email) {
        throw new Error("Either resumeId or email is required");
      }
      return true;
    }),
    body("name")
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage("Name must be between 1 and 100 characters")
      .trim(),
    body("phone")
      .optional()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage("Please provide a valid phone number"),
    body("role")
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage("Role must be between 1 and 200 characters")
      .trim(),
    body("summary")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Summary cannot exceed 1000 characters")
      .trim()
  ],
  saveResume
);

/**
 * @route   GET /api/resume/load/:identifier
 * @desc    Load resume by ID or email
 * @access  Public/Private
 */
router.get(
  "/load/:identifier",
  [
    optionalAuth,
    param("identifier")
      .notEmpty()
      .withMessage("Resume identifier is required")
      .custom((value) => {
        // Check if it's a valid MongoDB ObjectId or email
        const mongoose = require("mongoose");
        const isValidObjectId = mongoose.Types.ObjectId.isValid(value);
        const isValidEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value);
        
        if (!isValidObjectId && !isValidEmail) {
          throw new Error("Identifier must be a valid resume ID or email address");
        }
        return true;
      })
  ],
  loadResume
);

/**
 * @route   GET /api/resume/all
 * @desc    Get all resumes for authenticated user
 * @access  Private
 */
router.get(
  "/all",
  [
    auth,
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
    query("status")
      .optional()
      .isIn(["draft", "completed", "published"])
      .withMessage("Status must be draft, completed, or published")
  ],
  getAllResumes
);

/**
 * @route   DELETE /api/resume/:id
 * @desc    Delete resume
 * @access  Private
 */
router.delete(
  "/:id",
  [
    auth,
    param("id")
      .isMongoId()
      .withMessage("Invalid resume ID format")
  ],
  deleteResume
);

/**
 * @route   POST /api/resume/download-pdf
 * @desc    Generate and download PDF
 * @access  Public/Private
 */
router.post(
  "/download-pdf",
  [
    optionalAuth,
    body("resumeId")
      .isMongoId()
      .withMessage("Invalid resume ID format"),
    body("template")
      .optional()
      .isIn(["modern", "classic", "creative", "professional", "minimal"])
      .withMessage("Invalid template selection")
  ],
  downloadPDF
);

/**
 * @route   POST /api/resume/share/:id
 * @desc    Share resume (generate share link)
 * @access  Private
 */
router.post(
  "/share/:id",
  [
    auth,
    param("id")
      .isMongoId()
      .withMessage("Invalid resume ID format"),
    body("isPublic")
      .optional()
      .isBoolean()
      .withMessage("isPublic must be a boolean")
  ],
  shareResume
);

/**
 * @route   GET /api/resume/shared/:token
 * @desc    Get shared resume by token
 * @access  Public
 */
router.get(
  "/shared/:token",
  [
    param("token")
      .isLength({ min: 10 })
      .withMessage("Invalid share token")
      .isAlphanumeric()
      .withMessage("Share token must be alphanumeric")
  ],
  getSharedResume
);

/**
 * @route   POST /api/resume/duplicate/:id
 * @desc    Duplicate resume
 * @access  Private
 */
router.post(
  "/duplicate/:id",
  [
    auth,
    param("id")
      .isMongoId()
      .withMessage("Invalid resume ID format")
  ],
  duplicateResume
);

/**
 * @route   GET /api/resume/templates
 * @desc    Get available resume templates
 * @access  Public
 */
router.get("/templates", (req, res) => {
  const { getAvailableTemplates } = require("../services/pdfService");
  const templates = getAvailableTemplates();
  
  res.json({
    success: true,
    message: "Available templates retrieved successfully",
    data: { templates }
  });
});

/**
 * @route   POST /api/resume/validate
 * @desc    Validate resume data
 * @access  Public
 */
router.post(
  "/validate",
  [
    body("resumeData")
      .exists()
      .withMessage("Resume data is required")
      .isObject()
      .withMessage("Resume data must be an object")
  ],
  (req, res) => {
    try {
      const { validateResumeData } = require("../services/pdfService");
      const validation = validateResumeData(req.body.resumeData);
      
      res.json({
        success: true,
        message: "Resume data validated successfully",
        data: validation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to validate resume data",
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/resume/status
 * @desc    Get resume service status
 * @access  Public
 */
router.get("/status", (req, res) => {
  try {
    const { getPDFServiceStatus } = require("../services/pdfService");
    const { getServiceStatus } = require("../services/geminiService");
    
    const pdfStatus = getPDFServiceStatus();
    const aiStatus = getServiceStatus();
    
    res.json({
      success: true,
      message: "Resume service status retrieved successfully",
      data: {
        pdf: pdfStatus,
        ai: aiStatus,
        database: {
          isConnected: require("mongoose").connection.readyState === 1,
          connectionState: require("mongoose").connection.readyState
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get service status",
      error: error.message
    });
  }
});

module.exports = router;