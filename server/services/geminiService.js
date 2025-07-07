const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
let genAI;
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } else {
    console.warn("⚠️ GEMINI_API_KEY not found in environment variables");
  }
} catch (error) {
  console.error("❌ Error initializing Gemini AI:", error.message);
}

/**
 * Enhancement prompts for different sections and styles
 */
const enhancementPrompts = {
  summary: {
    professional: `Enhance this professional summary to be more compelling and ATS-friendly. Make it concise, impactful, and highlight key achievements. Focus on quantifiable results and industry-relevant keywords. Keep it between 3-4 sentences and under 150 words.

Original: {content}

Enhanced summary:`,
    
    creative: `Rewrite this professional summary with a more creative and engaging tone while maintaining professionalism. Add personality and unique value proposition. Make it memorable and distinctive while keeping it professional.

Original: {content}

Creative summary:`,
    
    concise: `Make this professional summary more concise and impactful. Remove redundancy, focus on the most important achievements, and ensure every word adds value. Keep it under 100 words.

Original: {content}

Concise summary:`
  },

  experience: {
    professional: `Enhance these work accomplishments to be more professional and ATS-optimized. Use strong action verbs, quantify achievements where possible, and focus on results and impact. Follow the STAR method (Situation, Task, Action, Result) where applicable.

Original: {content}

Enhanced accomplishments (return as separate bullet points):`,
    
    creative: `Rewrite these work accomplishments with more engaging language while maintaining accuracy. Add impact and showcase problem-solving skills. Make them stand out while remaining truthful and professional.

Original: {content}

Creative accomplishments (return as separate bullet points):`,
    
    concise: `Make these work accomplishments more concise and impactful. Focus on the most important results and remove unnecessary words. Each point should be powerful and direct.

Original: {content}

Concise accomplishments (return as separate bullet points):`
  },

  achievements: {
    professional: `Enhance this achievement description to be more professional and impactful. Focus on the significance, impact, and skills demonstrated. Make it ATS-friendly and quantify the achievement where possible.

Original: {content}

Enhanced achievement:`,
    
    creative: `Rewrite this achievement with more engaging and compelling language. Highlight the unique aspects and make it memorable while maintaining professionalism and accuracy.

Original: {content}

Creative achievement:`,
    
    concise: `Make this achievement description more concise and powerful. Focus on the most important aspects and ensure maximum impact with fewer words.

Original: {content}

Concise achievement:`
  },

  projects: {
    professional: `Enhance this project description to be more professional and comprehensive. Focus on technologies used, challenges overcome, and results achieved. Make it technical yet accessible and ATS-friendly.

Original: {content}

Enhanced project description:`,
    
    creative: `Rewrite this project description with more engaging language that showcases innovation and problem-solving skills. Highlight unique aspects and make it compelling while remaining accurate.

Original: {content}

Creative project description:`,
    
    concise: `Make this project description more concise and impactful. Focus on key technologies, main challenges, and primary results. Remove unnecessary details while maintaining clarity.

Original: {content}

Concise project description:`
  },

  skills: {
    professional: `Organize and enhance this skills list to be more professional and comprehensive. Group related skills, use industry-standard terminology, and ensure ATS optimization. Remove duplicates and add relevant skills if obviously missing.

Original: {content}

Enhanced skills:`,
    
    creative: `Reformat this skills list in a more engaging way while maintaining professional standards. Group skills logically and use compelling descriptions where appropriate.

Original: {content}

Creative skills presentation:`,
    
    concise: `Make this skills list more concise and focused. Keep only the most relevant and strongest skills, remove redundancy, and ensure each skill adds value.

Original: {content}

Concise skills:`
  },

  education: {
    professional: `Enhance this education information to be more professional and comprehensive. Include relevant coursework, achievements, or projects if space allows. Make it ATS-friendly and highlight relevant qualifications.

Original: {content}

Enhanced education:`,
    
    creative: `Present this education information in a more engaging way while maintaining accuracy. Highlight unique aspects, relevant projects, or notable achievements.

Original: {content}

Creative education:`,
    
    concise: `Make this education information more concise while keeping all essential details. Focus on the most relevant aspects for the target role.

Original: {content}

Concise education:`
  }
};

/**
 * Enhance content using Gemini AI
 * @param {string} section - The resume section being enhanced
 * @param {string} content - The original content to enhance
 * @param {string} enhancementType - Type of enhancement (professional, creative, concise)
 * @returns {Promise<string>} Enhanced content
 */
const enhanceWithGemini = async (section, content, enhancementType = "professional") => {
  try {
    if (!genAI) {
      throw new Error("Gemini AI is not initialized. Please check your API key.");
    }

    if (!content || content.trim().length === 0) {
      throw new Error("Content is required for enhancement");
    }

    // Validate section and enhancement type
    const validSections = Object.keys(enhancementPrompts);
    const validTypes = ["professional", "creative", "concise"];

    if (!validSections.includes(section)) {
      console.warn(`Unknown section: ${section}, using 'summary' as default`);
      section = "summary";
    }

    if (!validTypes.includes(enhancementType)) {
      console.warn(`Unknown enhancement type: ${enhancementType}, using 'professional' as default`);
      enhancementType = "professional";
    }

    // Get the appropriate prompt
    const promptTemplate = enhancementPrompts[section][enhancementType];
    const prompt = promptTemplate.replace("{content}", content.trim());

    // Initialize the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 1000,
      },
    });

    // Generate enhanced content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const enhancedContent = response.text();

    if (!enhancedContent || enhancedContent.trim().length === 0) {
      throw new Error("AI generated empty response");
    }

    // Clean up the response
    const cleanedContent = enhancedContent
      .trim()
      .replace(/^Enhanced \w+:\s*/i, "")
      .replace(/^Creative \w+:\s*/i, "")
      .replace(/^Concise \w+:\s*/i, "")
      .replace(/^\*\*.*?\*\*\s*/, "")
      .trim();

    console.log(`✅ Enhanced ${section} content (${enhancementType} style)`);
    return cleanedContent;

  } catch (error) {
    console.error("❌ Error enhancing content with Gemini:", error.message);
    
    // Fallback enhancement based on section
    return getFallbackEnhancement(section, content, enhancementType);
  }
};

/**
 * Fallback enhancement when AI is not available
 * @param {string} section - The resume section
 * @param {string} content - Original content
 * @param {string} enhancementType - Enhancement type
 * @returns {string} Basic enhanced content
 */
const getFallbackEnhancement = (section, content, enhancementType) => {
  console.log("🔄 Using fallback enhancement");
  
  const fallbackEnhancements = {
    professional: {
      summary: (text) => {
        // Add professional keywords and structure
        if (text.length < 100) {
          return `${text} Demonstrated expertise in delivering high-quality results and driving organizational success through innovative solutions and collaborative leadership.`;
        }
        return text.replace(/\b(I|my|me)\b/gi, "").trim();
      },
      experience: (text) => {
        // Add action verbs and quantification suggestions
        return text
          .replace(/^(.)/gm, "• $1")
          .replace(/\b(worked|did|made)\b/gi, (match) => {
            const replacements = { worked: "collaborated", did: "executed", made: "developed" };
            return replacements[match.toLowerCase()] || match;
          });
      },
      default: (text) => text
    },
    creative: {
      summary: (text) => `${text} Passionate about innovation and excellence, bringing fresh perspectives to challenging projects.`,
      experience: (text) => text.replace(/\./g, ", showcasing strong problem-solving abilities."),
      default: (text) => text
    },
    concise: {
      summary: (text) => text.split(".").slice(0, 2).join(".") + ".",
      experience: (text) => text.split(".").map(s => s.trim()).filter(s => s.length > 10).slice(0, 3).join(". "),
      default: (text) => text.length > 100 ? text.substring(0, 100) + "..." : text
    }
  };

  const enhancementFunction = fallbackEnhancements[enhancementType]?.[section] || 
                              fallbackEnhancements[enhancementType]?.default ||
                              ((text) => text);

  return enhancementFunction(content);
};

/**
 * Check if Gemini AI is available and configured
 * @returns {boolean} True if Gemini is available
 */
const isGeminiAvailable = () => {
  return !!(genAI && process.env.GEMINI_API_KEY);
};

/**
 * Get AI service status
 * @returns {Object} Service status information
 */
const getServiceStatus = () => {
  return {
    isAvailable: isGeminiAvailable(),
    service: "Google Gemini AI",
    model: "gemini-1.5-flash",
    features: [
      "Professional content enhancement",
      "Creative writing assistance", 
      "Concise content optimization",
      "ATS-friendly formatting",
      "Multi-section support"
    ]
  };
};

/**
 * Enhance multiple sections in batch
 * @param {Object} sections - Object with section names and content
 * @param {string} enhancementType - Enhancement type
 * @returns {Promise<Object>} Enhanced sections
 */
const enhanceBatch = async (sections, enhancementType = "professional") => {
  const enhancedSections = {};
  const errors = {};

  for (const [sectionName, content] of Object.entries(sections)) {
    try {
      enhancedSections[sectionName] = await enhanceWithGemini(sectionName, content, enhancementType);
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error enhancing ${sectionName}:`, error.message);
      errors[sectionName] = error.message;
      enhancedSections[sectionName] = content; // Keep original on error
    }
  }

  return { enhancedSections, errors };
};

module.exports = {
  enhanceWithGemini,
  isGeminiAvailable,
  getServiceStatus,
  enhanceBatch,
  getFallbackEnhancement
};