const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

// Import controllers and middleware
const {
  uploadResume,
  parseTextResume,
  getUploadStatus,
  cleanupUploads
} = require("../controllers/uploadController");

const { auth, optionalAuth } = require("../middleware/auth");

/**
 * @route   POST /api/upload/resume
 * @desc    Upload and parse resume file
 * @access  Public/Private
 */
router.post(
  "/resume",
  [
    optionalAuth,
    body("editType")
      .optional()
      .isIn(["manual", "ai"])
      .withMessage("Edit type must be either 'manual' or 'ai'")
  ],
  uploadResume
);

/**
 * @route   POST /api/upload/parse-text
 * @desc    Parse resume from text content (manual input)
 * @access  Public/Private
 */
router.post(
  "/parse-text",
  [
    optionalAuth,
    body("content")
      .exists()
      .withMessage("Resume content is required")
      .isLength({ min: 50, max: 50000 })
      .withMessage("Content must be between 50 and 50,000 characters")
      .trim(),
    body("editType")
      .optional()
      .isIn(["manual", "ai"])
      .withMessage("Edit type must be either 'manual' or 'ai'")
  ],
  parseTextResume
);

/**
 * @route   GET /api/upload/status
 * @desc    Get upload status and file information
 * @access  Public
 */
router.get("/status", getUploadStatus);

/**
 * @route   DELETE /api/upload/cleanup
 * @desc    Clean up old uploaded files (Admin only)
 * @access  Private (Admin)
 */
router.delete("/cleanup", auth, cleanupUploads);

/**
 * @route   POST /api/upload/validate-file
 * @desc    Validate uploaded file without processing
 * @access  Public
 */
router.post("/validate-file", (req, res) => {
  const multer = require("multer");
  const { upload, validateUploadedFile } = require("../controllers/uploadController");
  
  upload.single('resume')(req, res, (uploadError) => {
    if (uploadError) {
      return res.status(400).json({
        success: false,
        message: uploadError.message,
        error: uploadError.code || "UPLOAD_ERROR"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const validation = validateUploadedFile(req.file);
    
    // Clean up the uploaded file after validation
    const fs = require("fs");
    fs.unlink(req.file.path, (unlinkError) => {
      if (unlinkError) {
        console.warn("Failed to delete validation file:", unlinkError.message);
      }
    });

    res.json({
      success: validation.isValid,
      message: validation.isValid ? "File validation successful" : "File validation failed",
      data: {
        ...validation,
        file: {
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype
        }
      }
    });
  });
});

/**
 * @route   GET /api/upload/supported-formats
 * @desc    Get list of supported file formats
 * @access  Public
 */
router.get("/supported-formats", (req, res) => {
  const supportedFormats = [
    {
      extension: ".pdf",
      mimeType: "application/pdf",
      description: "Portable Document Format",
      maxSize: "10MB",
      parseQuality: "High",
      features: ["Text extraction", "Layout preservation", "Multi-page support"]
    },
    {
      extension: ".docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      description: "Microsoft Word Document (2007+)",
      maxSize: "10MB", 
      parseQuality: "Excellent",
      features: ["Full text extraction", "Formatting preservation", "Table support"]
    },
    {
      extension: ".doc",
      mimeType: "application/msword",
      description: "Microsoft Word Document (Legacy)",
      maxSize: "10MB",
      parseQuality: "Good",
      features: ["Text extraction", "Basic formatting"]
    },
    {
      extension: ".txt",
      mimeType: "text/plain",
      description: "Plain Text File",
      maxSize: "10MB",
      parseQuality: "Basic",
      features: ["Raw text parsing", "No formatting"]
    }
  ];

  res.json({
    success: true,
    message: "Supported file formats retrieved successfully",
    data: {
      formats: supportedFormats,
      maxFileSize: process.env.MAX_FILE_SIZE || "10MB",
      uploadDirectory: process.env.UPLOAD_DIR || "./uploads",
      recommendations: [
        "Use .docx or .pdf for best parsing results",
        "Ensure text is selectable (not scanned images)",
        "Use standard resume formatting",
        "Avoid complex layouts or graphics"
      ]
    }
  });
});

/**
 * @route   POST /api/upload/parse-sample
 * @desc    Parse a sample resume for testing
 * @access  Public
 */
router.post(
  "/parse-sample",
  [
    body("sampleType")
      .optional()
      .isIn(["developer", "manager", "designer", "analyst"])
      .withMessage("Sample type must be developer, manager, designer, or analyst")
  ],
  async (req, res) => {
    try {
      const { parseTextToStructuredData } = require("../services/parseService");
      const { successResponse, errorResponse } = require("../utils/responseHelpers");
      
      const { sampleType = "developer" } = req.body;
      
      const sampleResumes = {
        developer: `
John Doe
Senior Full Stack Developer
john.doe@email.com | (555) 123-4567 | LinkedIn: linkedin.com/in/johndoe | San Francisco, CA

PROFESSIONAL SUMMARY
Experienced Full Stack Developer with 5+ years of expertise in modern web technologies including React, Node.js, and cloud platforms. Proven track record of delivering scalable applications and leading development teams.

PROFESSIONAL EXPERIENCE

Senior Full Stack Developer
Tech Solutions Inc. | Jan 2022 - Present | San Francisco, CA
• Developed and maintained 15+ web applications using React, Node.js, and MongoDB
• Led a team of 4 junior developers and improved code quality by 40%
• Implemented CI/CD pipelines reducing deployment time by 60%
• Optimized database queries resulting in 35% performance improvement

Full Stack Developer
StartupXYZ | Jun 2020 - Dec 2021 | Remote
• Built responsive web applications using React and Express.js
• Integrated third-party APIs and payment gateways
• Collaborated with design team to implement pixel-perfect UIs

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2016 - 2020 | Berkeley, CA

SKILLS
JavaScript, TypeScript, React, Node.js, Express.js, MongoDB, PostgreSQL, AWS, Docker, Git

PROJECTS
E-Commerce Platform
Built a full-stack e-commerce platform with React frontend and Node.js backend
6 months

ACHIEVEMENTS
Best Innovation Award
Won company-wide innovation award for implementing automated testing framework
        `,
        manager: `
Jane Smith
Project Manager
jane.smith@email.com | (555) 987-6543 | LinkedIn: linkedin.com/in/janesmith | New York, NY

PROFESSIONAL SUMMARY
Results-driven Project Manager with 8+ years of experience leading cross-functional teams and delivering complex projects on time and within budget. Expert in Agile methodologies and stakeholder management.

PROFESSIONAL EXPERIENCE

Senior Project Manager
Global Tech Corp | Mar 2020 - Present | New York, NY
• Managed 10+ concurrent projects with budgets ranging from $100K to $2M
• Led cross-functional teams of 15+ members across multiple time zones
• Implemented Agile practices resulting in 25% faster delivery times
• Achieved 98% on-time project delivery rate

Project Manager
Innovation Labs | Jan 2018 - Feb 2020 | Boston, MA
• Coordinated product launches for 5 major software releases
• Managed stakeholder relationships and conducted regular status meetings
• Reduced project risks through proactive risk management strategies

EDUCATION
Master of Business Administration
Harvard Business School | 2016 - 2018 | Cambridge, MA

Bachelor of Science in Engineering
MIT | 2012 - 2016 | Cambridge, MA

SKILLS
Project Management, Agile, Scrum, JIRA, MS Project, Stakeholder Management, Risk Management

CERTIFICATIONS
Project Management Professional (PMP)
Certified ScrumMaster (CSM)
        `
      };
      
      const sampleContent = sampleResumes[sampleType] || sampleResumes.developer;
      const parsedData = await parseTextToStructuredData(sampleContent);
      
      return successResponse(res, "Sample resume parsed successfully", {
        sampleType,
        originalContent: sampleContent,
        parsedData
      });
      
    } catch (error) {
      console.error("Parse sample error:", error);
      return errorResponse(res, "Failed to parse sample resume", 500, error.message);
    }
  }
);

/**
 * @route   GET /api/upload/tips
 * @desc    Get tips for better resume parsing
 * @access  Public
 */
router.get("/tips", (req, res) => {
  const tips = {
    preparation: [
      "Use a standard resume format with clear section headers",
      "Ensure text is selectable (not scanned images)",
      "Use consistent formatting throughout the document",
      "Avoid complex layouts, tables, or graphics that might interfere with parsing"
    ],
    sections: [
      "Start with your name and contact information at the top",
      "Use clear section headers like 'Experience', 'Education', 'Skills'",
      "List work experience in reverse chronological order",
      "Include specific achievements and quantifiable results"
    ],
    fileFormat: [
      "PDF or DOCX files work best for parsing",
      "Ensure file size is under 10MB",
      "Use standard fonts like Arial, Calibri, or Times New Roman",
      "Avoid password-protected files"
    ],
    enhancement: [
      "Choose 'AI Edit' for automatic content improvement",
      "Select 'Manual Edit' if you prefer to keep original content",
      "AI enhancement can improve grammar, add action verbs, and optimize for ATS",
      "Review AI suggestions before finalizing"
    ]
  };

  res.json({
    success: true,
    message: "Resume parsing tips retrieved successfully",
    data: { tips }
  });
});

module.exports = router;