const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const Resume = require("../models/Resume");
const { parseResumeContent } = require("../services/parseService");
const { enhanceWithGemini } = require("../services/geminiService");
const { successResponse, errorResponse } = require("../utils/responseHelpers");
const { validationResult } = require("express-validator");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || "./uploads";
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1
  }
});

/**
 * Upload and parse resume file
 * POST /api/upload/resume
 */
const uploadResume = async (req, res) => {
  try {
    // Handle file upload
    upload.single('resume')(req, res, async (uploadError) => {
      if (uploadError) {
        console.error("File upload error:", uploadError);
        
        if (uploadError instanceof multer.MulterError) {
          if (uploadError.code === 'LIMIT_FILE_SIZE') {
            return errorResponse(res, "File too large. Maximum size is 10MB.", 400);
          }
          if (uploadError.code === 'LIMIT_FILE_COUNT') {
            return errorResponse(res, "Too many files. Only one file allowed.", 400);
          }
        }
        
        return errorResponse(res, uploadError.message || "File upload failed", 400);
      }

      if (!req.file) {
        return errorResponse(res, "No file uploaded", 400);
      }

      let filePath = req.file.path;

      try {
        // Parse the uploaded resume
        console.log(`📄 Parsing uploaded file: ${req.file.originalname}`);
        const parsedData = await parseResumeContent(filePath, req.file.mimetype);

        if (!parsedData || Object.keys(parsedData).length === 0) {
          throw new Error("Failed to extract data from the uploaded file");
        }

        // Process edit type (manual or AI)
        const { editType = "manual" } = req.body;
        let processedData = parsedData;

        if (editType === "ai") {
          console.log("🤖 Applying AI enhancement to parsed resume...");
          processedData = await enhanceFullResumeData(parsedData);
        }

        // Create resume record if user is authenticated
        let savedResume = null;
        if (req.user) {
          const resumeData = {
            ...processedData,
            userId: req.user.id,
            status: "draft"
          };

          savedResume = new Resume(resumeData);
          await savedResume.save();
        }

        // Clean up uploaded file
        try {
          await fs.unlink(filePath);
        } catch (cleanupError) {
          console.warn("Warning: Failed to delete uploaded file:", cleanupError.message);
        }

        return successResponse(res, "Resume uploaded and parsed successfully", {
          originalFileName: req.file.originalname,
          parsedData: processedData,
          editType,
          resume: savedResume ? {
            id: savedResume._id,
            completeness: savedResume.getCompletenessPercentage()
          } : null
        });

      } catch (parseError) {
        console.error("Resume parsing error:", parseError);
        
        // Clean up uploaded file on error
        try {
          await fs.unlink(filePath);
        } catch (cleanupError) {
          console.warn("Warning: Failed to delete uploaded file:", cleanupError.message);
        }

        return errorResponse(res, 
          "Failed to parse resume content. Please ensure the file contains readable text and try again.", 
          400, 
          parseError.message
        );
      }
    });

  } catch (error) {
    console.error("Upload resume error:", error);
    return errorResponse(res, "Failed to process file upload", 500, error.message);
  }
};

/**
 * Parse resume from text content (manual input)
 * POST /api/upload/parse-text
 */
const parseTextResume = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed", 400, errors.array());
    }

    const { content, editType = "manual" } = req.body;

    if (!content || content.trim().length === 0) {
      return errorResponse(res, "Resume content is required", 400);
    }

    // Parse the text content
    const parsedData = await parseResumeContent(content, "text/plain");

    if (!parsedData || Object.keys(parsedData).length === 0) {
      return errorResponse(res, "Failed to extract meaningful data from the provided text", 400);
    }

    // Apply AI enhancement if requested
    let processedData = parsedData;
    if (editType === "ai") {
      console.log("🤖 Applying AI enhancement to text resume...");
      processedData = await enhanceFullResumeData(parsedData);
    }

    // Create resume record if user is authenticated
    let savedResume = null;
    if (req.user) {
      const resumeData = {
        ...processedData,
        userId: req.user.id,
        status: "draft"
      };

      savedResume = new Resume(resumeData);
      await savedResume.save();
    }

    return successResponse(res, "Text resume parsed successfully", {
      parsedData: processedData,
      editType,
      resume: savedResume ? {
        id: savedResume._id,
        completeness: savedResume.getCompletenessPercentage()
      } : null
    });

  } catch (error) {
    console.error("Parse text resume error:", error);
    return errorResponse(res, "Failed to parse text resume", 500, error.message);
  }
};

/**
 * Get upload status and file information
 * GET /api/upload/status
 */
const getUploadStatus = async (req, res) => {
  try {
    const uploadDir = process.env.UPLOAD_DIR || "./uploads";
    
    // Check if upload directory exists
    let directoryExists = false;
    try {
      await fs.access(uploadDir);
      directoryExists = true;
    } catch (error) {
      directoryExists = false;
    }

    const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;

    return successResponse(res, "Upload status retrieved", {
      uploadDirectory: uploadDir,
      directoryExists,
      maxFileSize,
      maxFileSizeMB: Math.round(maxFileSize / (1024 * 1024)),
      allowedTypes: [
        "PDF (.pdf)",
        "Microsoft Word (.doc, .docx)",
        "Plain Text (.txt)"
      ],
      features: [
        "Automatic content extraction",
        "AI-powered enhancement",
        "Manual editing support",
        "ATS-friendly parsing"
      ]
    });

  } catch (error) {
    console.error("Get upload status error:", error);
    return errorResponse(res, "Failed to get upload status", 500, error.message);
  }
};

/**
 * Clean up old uploaded files
 * DELETE /api/upload/cleanup
 */
const cleanupUploads = async (req, res) => {
  try {
    // Only allow admins to perform cleanup
    if (!req.user || req.user.role !== 'admin') {
      return errorResponse(res, "Admin access required", 403);
    }

    const uploadDir = process.env.UPLOAD_DIR || "./uploads";
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    try {
      const files = await fs.readdir(uploadDir);
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(uploadDir, file);
        const stats = await fs.stat(filePath);
        
        if (Date.now() - stats.mtime.getTime() > maxAge) {
          try {
            await fs.unlink(filePath);
            deletedCount++;
          } catch (deleteError) {
            console.warn(`Failed to delete old file ${file}:`, deleteError.message);
          }
        }
      }

      return successResponse(res, "Cleanup completed", {
        deletedFiles: deletedCount,
        totalFiles: files.length
      });

    } catch (dirError) {
      return errorResponse(res, "Upload directory not accessible", 500);
    }

  } catch (error) {
    console.error("Cleanup uploads error:", error);
    return errorResponse(res, "Failed to cleanup uploads", 500, error.message);
  }
};

/**
 * Enhanced full resume data with AI
 * @param {Object} parsedData - Parsed resume data
 * @returns {Promise<Object>} Enhanced resume data
 */
const enhanceFullResumeData = async (parsedData) => {
  try {
    const enhancedData = { ...parsedData };
    const sectionsToEnhance = ['summary', 'experience', 'achievements', 'projects'];

    for (const section of sectionsToEnhance) {
      try {
        if (section === 'experience' && enhancedData.experience?.length > 0) {
          // Enhance experience accomplishments
          const enhancedExperience = [];
          
          for (const exp of enhancedData.experience) {
            if (exp.accomplishment && exp.accomplishment.length > 0) {
              const accomplishmentText = exp.accomplishment.join('. ');
              const enhanced = await enhanceWithGemini('experience', accomplishmentText, 'professional');
              const enhancedAccomplishments = enhanced.split('. ').filter(item => item.trim());
              
              enhancedExperience.push({
                ...exp,
                accomplishment: enhancedAccomplishments
              });
            } else {
              enhancedExperience.push(exp);
            }
          }
          
          enhancedData.experience = enhancedExperience;
        } else if (section === 'achievements' && enhancedData.achievements?.length > 0) {
          // Enhance achievements
          const enhancedAchievements = [];
          
          for (const achievement of enhancedData.achievements) {
            if (achievement.describe) {
              const enhanced = await enhanceWithGemini('achievements', achievement.describe, 'professional');
              enhancedAchievements.push({
                ...achievement,
                describe: enhanced
              });
            } else {
              enhancedAchievements.push(achievement);
            }
          }
          
          enhancedData.achievements = enhancedAchievements;
        } else if (section === 'projects' && enhancedData.projects?.length > 0) {
          // Enhance projects
          const enhancedProjects = [];
          
          for (const project of enhancedData.projects) {
            if (project.description) {
              const enhanced = await enhanceWithGemini('projects', project.description, 'professional');
              enhancedProjects.push({
                ...project,
                description: enhanced
              });
            } else {
              enhancedProjects.push(project);
            }
          }
          
          enhancedData.projects = enhancedProjects;
        } else if (enhancedData[section] && typeof enhancedData[section] === 'string') {
          // Enhance simple text fields
          enhancedData[section] = await enhanceWithGemini(section, enhancedData[section], 'professional');
        }

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (sectionError) {
        console.warn(`Failed to enhance ${section}:`, sectionError.message);
        // Keep original content if enhancement fails
      }
    }

    return enhancedData;

  } catch (error) {
    console.error("Error enhancing full resume data:", error);
    return parsedData; // Return original data if enhancement fails
  }
};

/**
 * Validate uploaded file
 * @param {Object} file - Multer file object
 * @returns {Object} Validation result
 */
const validateUploadedFile = (file) => {
  const errors = [];
  const warnings = [];

  if (!file) {
    errors.push("No file provided");
    return { isValid: false, errors, warnings };
  }

  // Check file size
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`);
  }

  // Check file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    errors.push("Unsupported file type");
  }

  // Warnings for optimal parsing
  if (file.mimetype === 'text/plain' && file.size < 1024) {
    warnings.push("Text file seems very small, parsing may be limited");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

module.exports = {
  uploadResume,
  parseTextResume,
  getUploadStatus,
  cleanupUploads,
  upload, // Export multer instance for use in routes
  validateUploadedFile
};