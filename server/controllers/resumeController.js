const Resume = require("../models/Resume");
const { validationResult } = require("express-validator");
const { successResponse, errorResponse } = require("../utils/responseHelpers");
const { generatePDF } = require("../services/pdfService");

/**
 * Create a new resume
 * POST /api/resume/create
 */
const createResume = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed", 400, errors.array());
    }

    const resumeData = req.body;
    
    // Add user ID if authenticated
    if (req.user) {
      resumeData.userId = req.user.id;
    }

    // Set default values for required fields if not provided
    const defaultData = {
      name: resumeData.name || "Your Name",
      role: resumeData.role || "Your Professional Role",
      phone: resumeData.phone || "123-456-7890",
      email: resumeData.email || "your.email@example.com",
      location: resumeData.location || "Your City, Country",
      summary: resumeData.summary || "Write a compelling professional summary here...",
      experience: resumeData.experience || [],
      education: resumeData.education || [],
      achievements: resumeData.achievements || [],
      skills: resumeData.skills || [],
      languages: resumeData.languages || [],
      projects: resumeData.projects || [],
      courses: resumeData.courses || [],
      certifications: resumeData.certifications || [],
      hobbies: resumeData.hobbies || []
    };

    const newResume = new Resume({ ...defaultData, ...resumeData });
    const savedResume = await newResume.save();

    return successResponse(res, "Resume created successfully", {
      resume: savedResume,
      completeness: savedResume.getCompletenessPercentage()
    }, 201);

  } catch (error) {
    console.error("Error creating resume:", error);
    return errorResponse(res, "Failed to create resume", 500, error.message);
  }
};

/**
 * Save/Update resume (Auto-save functionality)
 * PUT /api/resume/save
 */
const saveResume = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed", 400, errors.array());
    }

    const { resumeId, email, ...updateData } = req.body;
    
    let resume;
    
    // Find resume by ID or email
    if (resumeId) {
      resume = await Resume.findById(resumeId);
    } else if (email) {
      resume = await Resume.findOne({ email });
    } else {
      return errorResponse(res, "Resume ID or email is required", 400);
    }

    if (!resume) {
      // Create new resume if not found
      const newResume = new Resume(updateData);
      if (req.user) {
        newResume.userId = req.user.id;
      }
      await newResume.save();
      
      return successResponse(res, "Resume created successfully", {
        resume: newResume,
        completeness: newResume.getCompletenessPercentage()
      }, 201);
    }

    // Update existing resume
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        resume[key] = updateData[key];
      }
    });

    // Update version and last modified
    resume.version += 1;
    resume.lastModified = new Date();

    const updatedResume = await resume.save();

    return successResponse(res, "Resume saved successfully", {
      resume: updatedResume,
      completeness: updatedResume.getCompletenessPercentage()
    });

  } catch (error) {
    console.error("Error saving resume:", error);
    return errorResponse(res, "Failed to save resume", 500, error.message);
  }
};

/**
 * Load resume by ID or email
 * GET /api/resume/load/:identifier
 */
const loadResume = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const resume = await Resume.findByIdentifier(identifier);
    
    if (!resume) {
      return errorResponse(res, "Resume not found", 404);
    }

    // Check if user has access to this resume
    if (resume.userId && req.user && resume.userId.toString() !== req.user.id) {
      return errorResponse(res, "Access denied", 403);
    }

    return successResponse(res, "Resume loaded successfully", {
      resume,
      completeness: resume.getCompletenessPercentage()
    });

  } catch (error) {
    console.error("Error loading resume:", error);
    return errorResponse(res, "Failed to load resume", 500, error.message);
  }
};

/**
 * Get all resumes for authenticated user
 * GET /api/resume/all
 */
const getAllResumes = async (req, res) => {
  try {
    if (!req.user) {
      return errorResponse(res, "Authentication required", 401);
    }

    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user.id };
    if (status) {
      query.status = status;
    }

    const resumes = await Resume.find(query)
      .sort({ lastModified: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-enhancementHistory");

    const total = await Resume.countDocuments(query);

    const resumesWithCompleteness = resumes.map(resume => ({
      ...resume.toObject(),
      completeness: resume.getCompletenessPercentage()
    }));

    return successResponse(res, "Resumes retrieved successfully", {
      resumes: resumesWithCompleteness,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: resumes.length,
        totalItems: total
      }
    });

  } catch (error) {
    console.error("Error getting resumes:", error);
    return errorResponse(res, "Failed to retrieve resumes", 500, error.message);
  }
};

/**
 * Delete resume
 * DELETE /api/resume/:id
 */
const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resume = await Resume.findById(id);
    
    if (!resume) {
      return errorResponse(res, "Resume not found", 404);
    }

    // Check if user has permission to delete
    if (resume.userId && req.user && resume.userId.toString() !== req.user.id) {
      return errorResponse(res, "Access denied", 403);
    }

    await Resume.findByIdAndDelete(id);

    return successResponse(res, "Resume deleted successfully");

  } catch (error) {
    console.error("Error deleting resume:", error);
    return errorResponse(res, "Failed to delete resume", 500, error.message);
  }
};

/**
 * Generate and download PDF
 * POST /api/resume/download-pdf
 */
const downloadPDF = async (req, res) => {
  try {
    const { resumeId, template = "modern" } = req.body;
    
    const resume = await Resume.findById(resumeId);
    
    if (!resume) {
      return errorResponse(res, "Resume not found", 404);
    }

    // Check access permissions
    if (resume.userId && req.user && resume.userId.toString() !== req.user.id) {
      return errorResponse(res, "Access denied", 403);
    }

    // Generate PDF
    const pdfBuffer = await generatePDF(resume, template);
    
    // Set response headers for PDF download
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${resume.name}_Resume.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    res.end(pdfBuffer);

  } catch (error) {
    console.error("Error generating PDF:", error);
    return errorResponse(res, "Failed to generate PDF", 500, error.message);
  }
};

/**
 * Share resume (generate share link)
 * POST /api/resume/share/:id
 */
const shareResume = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublic = true } = req.body;
    
    const resume = await Resume.findById(id);
    
    if (!resume) {
      return errorResponse(res, "Resume not found", 404);
    }

    // Check permissions
    if (resume.userId && req.user && resume.userId.toString() !== req.user.id) {
      return errorResponse(res, "Access denied", 403);
    }

    resume.isPublic = isPublic;
    
    if (isPublic && !resume.shareToken) {
      resume.shareToken = require("crypto").randomBytes(32).toString("hex");
    }

    await resume.save();

    const shareUrl = isPublic 
      ? `${process.env.FRONTEND_URL}/shared/${resume.shareToken}`
      : null;

    return successResponse(res, "Share settings updated successfully", {
      isPublic,
      shareUrl,
      shareToken: isPublic ? resume.shareToken : null
    });

  } catch (error) {
    console.error("Error sharing resume:", error);
    return errorResponse(res, "Failed to update share settings", 500, error.message);
  }
};

/**
 * Get shared resume by token
 * GET /api/resume/shared/:token
 */
const getSharedResume = async (req, res) => {
  try {
    const { token } = req.params;
    
    const resume = await Resume.findOne({ 
      shareToken: token, 
      isPublic: true 
    }).select("-enhancementHistory");
    
    if (!resume) {
      return errorResponse(res, "Shared resume not found or no longer public", 404);
    }

    return successResponse(res, "Shared resume retrieved successfully", {
      resume: {
        ...resume.toObject(),
        completeness: resume.getCompletenessPercentage()
      }
    });

  } catch (error) {
    console.error("Error getting shared resume:", error);
    return errorResponse(res, "Failed to retrieve shared resume", 500, error.message);
  }
};

/**
 * Duplicate resume
 * POST /api/resume/duplicate/:id
 */
const duplicateResume = async (req, res) => {
  try {
    const { id } = req.params;
    
    const originalResume = await Resume.findById(id);
    
    if (!originalResume) {
      return errorResponse(res, "Resume not found", 404);
    }

    // Check permissions
    if (originalResume.userId && req.user && originalResume.userId.toString() !== req.user.id) {
      return errorResponse(res, "Access denied", 403);
    }

    // Create duplicate
    const duplicateData = originalResume.toObject();
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    delete duplicateData.shareToken;
    delete duplicateData.enhancementHistory;
    
    duplicateData.name = `${duplicateData.name} (Copy)`;
    duplicateData.isPublic = false;
    duplicateData.status = "draft";
    duplicateData.version = 1;

    const duplicatedResume = new Resume(duplicateData);
    await duplicatedResume.save();

    return successResponse(res, "Resume duplicated successfully", {
      resume: duplicatedResume,
      completeness: duplicatedResume.getCompletenessPercentage()
    }, 201);

  } catch (error) {
    console.error("Error duplicating resume:", error);
    return errorResponse(res, "Failed to duplicate resume", 500, error.message);
  }
};

module.exports = {
  createResume,
  saveResume,
  loadResume,
  getAllResumes,
  deleteResume,
  downloadPDF,
  shareResume,
  getSharedResume,
  duplicateResume
};