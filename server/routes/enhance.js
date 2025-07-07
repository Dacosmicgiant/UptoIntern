const express = require("express");
const { body, param, query } = require("express-validator");
const router = express.Router();

// Import controllers and middleware
const {
  enhanceField,
  enhanceFullResume,
  getEnhancementSuggestions,
  getEnhancementHistory,
  clearEnhancementHistory
} = require("../controllers/enhanceController");

const { auth, optionalAuth } = require("../middleware/auth");

/**
 * @route   POST /api/enhance/field
 * @desc    Auto-save and enhance a specific field
 * @access  Public/Private
 */
router.post(
  "/field",
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
    body("section")
      .exists()
      .withMessage("Section is required")
      .isIn([
        "summary", "experience", "education", "skills", 
        "achievements", "projects", "courses", "certifications"
      ])
      .withMessage("Invalid section. Must be one of: summary, experience, education, skills, achievements, projects, courses, certifications"),
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
    body("resumeData")
      .optional()
      .isObject()
      .withMessage("Resume data must be an object")
  ],
  enhanceField
);

/**
 * @route   POST /api/enhance/full
 * @desc    Enhance entire resume with AI
 * @access  Public/Private
 */
router.post(
  "/full",
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
    body("enhancementType")
      .optional()
      .isIn(["professional", "creative", "concise", "ats-optimized"])
      .withMessage("Enhancement type must be professional, creative, concise, or ats-optimized")
  ],
  enhanceFullResume
);

/**
 * @route   POST /api/enhance/suggestions
 * @desc    Get enhancement suggestions for a field
 * @access  Public
 */
router.post(
  "/suggestions",
  [
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
      .isLength({ min: 10, max: 2000 })
      .withMessage("Content must be between 10 and 2000 characters")
      .trim()
  ],
  getEnhancementSuggestions
);

/**
 * @route   GET /api/enhance/history/:resumeId
 * @desc    Get enhancement history for a resume
 * @access  Private
 */
router.get(
  "/history/:resumeId",
  [
    auth,
    param("resumeId")
      .isMongoId()
      .withMessage("Invalid resume ID format"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50")
  ],
  getEnhancementHistory
);

/**
 * @route   DELETE /api/enhance/history/:resumeId
 * @desc    Clear enhancement history for a resume
 * @access  Private
 */
router.delete(
  "/history/:resumeId",
  [
    auth,
    param("resumeId")
      .isMongoId()
      .withMessage("Invalid resume ID format")
  ],
  clearEnhancementHistory
);

/**
 * @route   POST /api/enhance/bulk
 * @desc    Enhance multiple sections in batch
 * @access  Public/Private
 */
router.post(
  "/bulk",
  [
    optionalAuth,
    body("sections")
      .exists()
      .withMessage("Sections object is required")
      .isObject()
      .withMessage("Sections must be an object")
      .custom((sections) => {
        const validSections = [
          "summary", "experience", "education", "skills", 
          "achievements", "projects", "courses", "certifications"
        ];
        
        const sectionKeys = Object.keys(sections);
        if (sectionKeys.length === 0) {
          throw new Error("At least one section is required");
        }
        
        for (const key of sectionKeys) {
          if (!validSections.includes(key)) {
            throw new Error(`Invalid section: ${key}`);
          }
          
          if (!sections[key] || typeof sections[key] !== 'string') {
            throw new Error(`Content for section ${key} must be a non-empty string`);
          }
          
          if (sections[key].length < 10 || sections[key].length > 5000) {
            throw new Error(`Content for section ${key} must be between 10 and 5000 characters`);
          }
        }
        
        return true;
      }),
    body("enhancementType")
      .optional()
      .isIn(["professional", "creative", "concise"])
      .withMessage("Enhancement type must be professional, creative, or concise")
  ],
  async (req, res) => {
    try {
      const { enhanceBatch } = require("../services/geminiService");
      const { successResponse, errorResponse } = require("../utils/responseHelpers");
      
      const { sections, enhancementType = "professional" } = req.body;
      
      const result = await enhanceBatch(sections, enhancementType);
      
      return successResponse(res, "Batch enhancement completed", result);
      
    } catch (error) {
      console.error("Bulk enhancement error:", error);
      return errorResponse(res, "Failed to enhance sections", 500, error.message);
    }
  }
);

/**
 * @route   GET /api/enhance/status
 * @desc    Get AI enhancement service status
 * @access  Public
 */
router.get("/status", (req, res) => {
  try {
    const { getServiceStatus, isGeminiAvailable } = require("../services/geminiService");
    
    const status = getServiceStatus();
    
    res.json({
      success: true,
      message: "Enhancement service status retrieved successfully",
      data: {
        ...status,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get enhancement service status",
      error: error.message
    });
  }
});

/**
 * @route   POST /api/enhance/test
 * @desc    Test AI enhancement functionality
 * @access  Public
 */
router.post(
  "/test",
  [
    body("content")
      .optional()
      .default("I am a software developer with experience in web development.")
      .isLength({ min: 10, max: 1000 })
      .withMessage("Test content must be between 10 and 1000 characters")
      .trim()
  ],
  async (req, res) => {
    try {
      const { enhanceWithGemini } = require("../services/geminiService");
      const { successResponse, errorResponse } = require("../utils/responseHelpers");
      
      const { content } = req.body;
      
      const testResult = await enhanceWithGemini("summary", content, "professional");
      
      return successResponse(res, "AI enhancement test completed", {
        original: content,
        enhanced: testResult,
        service: "Google Gemini AI",
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("Enhancement test error:", error);
      return errorResponse(res, "AI enhancement test failed", 500, error.message);
    }
  }
);

/**
 * @route   GET /api/enhance/templates
 * @desc    Get available enhancement templates/styles
 * @access  Public
 */
router.get("/templates", (req, res) => {
  const templates = {
    professional: {
      name: "Professional",
      description: "Formal, ATS-friendly language with industry keywords",
      features: ["Action verbs", "Quantified achievements", "Industry terminology", "ATS optimization"],
      bestFor: ["Corporate roles", "Traditional industries", "Senior positions"]
    },
    creative: {
      name: "Creative",
      description: "Engaging, personality-driven content with unique voice",
      features: ["Compelling narratives", "Personal branding", "Unique value proposition", "Memorable phrasing"],
      bestFor: ["Creative industries", "Startups", "Marketing roles", "Design positions"]
    },
    concise: {
      name: "Concise",
      description: "Brief, impactful statements focused on key achievements",
      features: ["Bullet-point optimization", "Key metrics focus", "Essential information only", "Scanning-friendly"],
      bestFor: ["Executive roles", "Technical positions", "When space is limited"]
    }
  };

  res.json({
    success: true,
    message: "Enhancement templates retrieved successfully",
    data: { templates }
  });
});

module.exports = router;