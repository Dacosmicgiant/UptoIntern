const Resume = require("../models/Resume");
const { enhanceWithGemini } = require("../services/geminiService");
const { successResponse, errorResponse } = require("../utils/responseHelpers");
const { validationResult } = require("express-validator");

/**
 * Auto-save and enhance a specific field
 * POST /api/enhance/field
 */
const enhanceField = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed", 400, errors.array());
    }

    const { resumeId, email, section, content, enhancementType = "improve" } = req.body;

    // Step 1: Auto-save current resume data first
    if (req.body.resumeData) {
      try {
        let resume;
        
        if (resumeId) {
          resume = await Resume.findById(resumeId);
        } else if (email) {
          resume = await Resume.findOne({ email });
        }

        if (resume) {
          // Update resume with latest data
          Object.keys(req.body.resumeData).forEach(key => {
            if (req.body.resumeData[key] !== undefined) {
              resume[key] = req.body.resumeData[key];
            }
          });
          resume.lastModified = new Date();
          await resume.save();
        }
      } catch (saveError) {
        console.warn("Auto-save failed:", saveError.message);
        // Continue with enhancement even if auto-save fails
      }
    }

    // Step 2: Validate enhancement request
    if (!section || !content) {
      return errorResponse(res, "Section and content are required for enhancement", 400);
    }

    // Step 3: Enhance the content using AI
    const enhancedContent = await enhanceWithGemini(section, content, enhancementType);

    if (!enhancedContent) {
      return errorResponse(res, "Failed to enhance content", 500);
    }

    // Step 4: Save enhancement history if resume exists
    if (resumeId || email) {
      try {
        let resume;
        
        if (resumeId) {
          resume = await Resume.findById(resumeId);
        } else if (email) {
          resume = await Resume.findOne({ email });
        }

        if (resume) {
          // Add to enhancement history
          resume.enhancementHistory.push({
            section,
            originalContent: content,
            enhancedContent,
            enhancedAt: new Date()
          });

          // Update the actual field with enhanced content
          if (resume[section] !== undefined) {
            resume[section] = enhancedContent;
          }

          await resume.save();
        }
      } catch (historyError) {
        console.warn("Failed to save enhancement history:", historyError.message);
        // Continue to return enhanced content even if history save fails
      }
    }

    return successResponse(res, "Content enhanced successfully", {
      section,
      originalContent: content,
      enhancedContent,
      enhancementType
    });

  } catch (error) {
    console.error("Error enhancing field:", error);
    return errorResponse(res, "Failed to enhance content", 500, error.message);
  }
};

/**
 * Enhance entire resume with AI
 * POST /api/enhance/full
 */
const enhanceFullResume = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed", 400, errors.array());
    }

    const { resumeId, email, enhancementType = "professional" } = req.body;
    
    let resume;
    
    if (resumeId) {
      resume = await Resume.findById(resumeId);
    } else if (email) {
      resume = await Resume.findOne({ email });
    } else {
      return errorResponse(res, "Resume ID or email is required", 400);
    }

    if (!resume) {
      return errorResponse(res, "Resume not found", 404);
    }

    // Check permissions
    if (resume.userId && req.user && resume.userId.toString() !== req.user.id) {
      return errorResponse(res, "Access denied", 403);
    }

    const enhancementResults = {};
    const sectionsToEnhance = [
      'summary',
      'experience',
      'achievements',
      'projects'
    ];

    // Step 1: Auto-save current state
    resume.lastModified = new Date();
    await resume.save();

    // Step 2: Enhance each section
    for (const section of sectionsToEnhance) {
      try {
        if (section === 'experience') {
          // Handle experience array
          if (resume.experience && resume.experience.length > 0) {
            const enhancedExperience = [];
            
            for (const exp of resume.experience) {
              const accomplishmentText = Array.isArray(exp.accomplishment) 
                ? exp.accomplishment.join('. ') 
                : exp.accomplishment || '';
              
              if (accomplishmentText) {
                const enhanced = await enhanceWithGemini('experience', accomplishmentText, enhancementType);
                const enhancedAccomplishments = enhanced.split('. ').filter(item => item.trim());
                
                enhancedExperience.push({
                  ...exp.toObject(),
                  accomplishment: enhancedAccomplishments
                });
              } else {
                enhancedExperience.push(exp.toObject());
              }
            }
            
            resume.experience = enhancedExperience;
            enhancementResults.experience = "Enhanced";
          }
        } else if (section === 'achievements') {
          // Handle achievements array
          if (resume.achievements && resume.achievements.length > 0) {
            const enhancedAchievements = [];
            
            for (const achievement of resume.achievements) {
              if (achievement.describe) {
                const enhanced = await enhanceWithGemini('achievements', achievement.describe, enhancementType);
                enhancedAchievements.push({
                  ...achievement.toObject(),
                  describe: enhanced
                });
              } else {
                enhancedAchievements.push(achievement.toObject());
              }
            }
            
            resume.achievements = enhancedAchievements;
            enhancementResults.achievements = "Enhanced";
          }
        } else if (section === 'projects') {
          // Handle projects array
          if (resume.projects && resume.projects.length > 0) {
            const enhancedProjects = [];
            
            for (const project of resume.projects) {
              if (project.description) {
                const enhanced = await enhanceWithGemini('projects', project.description, enhancementType);
                enhancedProjects.push({
                  ...project.toObject(),
                  description: enhanced
                });
              } else {
                enhancedProjects.push(project.toObject());
              }
            }
            
            resume.projects = enhancedProjects;
            enhancementResults.projects = "Enhanced";
          }
        } else {
          // Handle simple text fields
          if (resume[section] && typeof resume[section] === 'string') {
            const enhanced = await enhanceWithGemini(section, resume[section], enhancementType);
            resume[section] = enhanced;
            enhancementResults[section] = "Enhanced";
          }
        }

        // Add small delay to avoid API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (sectionError) {
        console.error(`Error enhancing ${section}:`, sectionError.message);
        enhancementResults[section] = `Error: ${sectionError.message}`;
      }
    }

    // Step 3: Save enhanced resume
    resume.version += 1;
    resume.lastModified = new Date();
    
    // Add full enhancement to history
    resume.enhancementHistory.push({
      section: 'full_resume',
      originalContent: 'Full resume enhancement',
      enhancedContent: `Enhanced with ${enhancementType} style`,
      enhancedAt: new Date()
    });

    await resume.save();

    return successResponse(res, "Resume enhanced successfully", {
      resume,
      enhancementResults,
      enhancementType,
      completeness: resume.getCompletenessPercentage()
    });

  } catch (error) {
    console.error("Error enhancing full resume:", error);
    return errorResponse(res, "Failed to enhance resume", 500, error.message);
  }
};

/**
 * Get enhancement suggestions for a field
 * POST /api/enhance/suggestions
 */
const getEnhancementSuggestions = async (req, res) => {
  try {
    const { section, content } = req.body;

    if (!section || !content) {
      return errorResponse(res, "Section and content are required", 400);
    }

    // Generate multiple enhancement variations
    const suggestions = [];
    const enhancementTypes = ['professional', 'creative', 'concise'];

    for (const type of enhancementTypes) {
      try {
        const suggestion = await enhanceWithGemini(section, content, type);
        suggestions.push({
          type,
          content: suggestion,
          label: type.charAt(0).toUpperCase() + type.slice(1)
        });
      } catch (error) {
        console.warn(`Failed to generate ${type} suggestion:`, error.message);
      }
    }

    if (suggestions.length === 0) {
      return errorResponse(res, "Failed to generate suggestions", 500);
    }

    return successResponse(res, "Enhancement suggestions generated", {
      section,
      originalContent: content,
      suggestions
    });

  } catch (error) {
    console.error("Error generating suggestions:", error);
    return errorResponse(res, "Failed to generate suggestions", 500, error.message);
  }
};

/**
 * Get enhancement history for a resume
 * GET /api/enhance/history/:resumeId
 */
const getEnhancementHistory = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const resume = await Resume.findById(resumeId).select('enhancementHistory');

    if (!resume) {
      return errorResponse(res, "Resume not found", 404);
    }

    // Check permissions
    if (resume.userId && req.user && resume.userId.toString() !== req.user.id) {
      return errorResponse(res, "Access denied", 403);
    }

    const skip = (page - 1) * limit;
    const history = resume.enhancementHistory
      .sort((a, b) => new Date(b.enhancedAt) - new Date(a.enhancedAt))
      .slice(skip, skip + parseInt(limit));

    const total = resume.enhancementHistory.length;

    return successResponse(res, "Enhancement history retrieved", {
      history,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: history.length,
        totalItems: total
      }
    });

  } catch (error) {
    console.error("Error getting enhancement history:", error);
    return errorResponse(res, "Failed to retrieve enhancement history", 500, error.message);
  }
};

/**
 * Clear enhancement history for a resume
 * DELETE /api/enhance/history/:resumeId
 */
const clearEnhancementHistory = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return errorResponse(res, "Resume not found", 404);
    }

    // Check permissions
    if (resume.userId && req.user && resume.userId.toString() !== req.user.id) {
      return errorResponse(res, "Access denied", 403);
    }

    resume.enhancementHistory = [];
    await resume.save();

    return successResponse(res, "Enhancement history cleared successfully");

  } catch (error) {
    console.error("Error clearing enhancement history:", error);
    return errorResponse(res, "Failed to clear enhancement history", 500, error.message);
  }
};

module.exports = {
  enhanceField,
  enhanceFullResume,
  getEnhancementSuggestions,
  getEnhancementHistory,
  clearEnhancementHistory
};