const fs = require("fs").promises;
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");

/**
 * Parse resume content from various file formats
 * @param {string} filePathOrContent - File path or direct content
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<Object>} Parsed resume data
 */
const parseResumeContent = async (filePathOrContent, mimeType) => {
  try {
    let textContent = "";

    // Extract text based on file type
    switch (mimeType) {
      case "application/pdf":
        textContent = await extractFromPDF(filePathOrContent);
        break;
      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        textContent = await extractFromWord(filePathOrContent);
        break;
      case "text/plain":
        textContent = typeof filePathOrContent === 'string' && !filePathOrContent.includes('/') && !filePathOrContent.includes('\\')
          ? filePathOrContent // Direct text content
          : await fs.readFile(filePathOrContent, "utf8");
        break;
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }

    if (!textContent || textContent.trim().length === 0) {
      throw new Error("No readable content found in the file");
    }

    // Parse the extracted text into structured data
    const parsedData = await parseTextToStructuredData(textContent);

    console.log("✅ Resume content parsed successfully");
    return parsedData;

  } catch (error) {
    console.error("❌ Error parsing resume content:", error.message);
    throw error;
  }
};

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} Extracted text
 */
const extractFromPDF = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

/**
 * Extract text from Word document
 * @param {string} filePath - Path to Word document
 * @returns {Promise<string>} Extracted text
 */
const extractFromWord = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    throw new Error(`Failed to extract text from Word document: ${error.message}`);
  }
};

/**
 * Parse extracted text into structured resume data
 * @param {string} text - Raw text content
 * @returns {Object} Structured resume data
 */
const parseTextToStructuredData = async (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const resumeData = {
    name: "",
    role: "",
    phone: "",
    email: "",
    linkedin: "",
    location: "",
    summary: "",
    experience: [],
    education: [],
    achievements: [],
    skills: [],
    languages: [],
    projects: [],
    courses: [],
    certifications: []
  };

  // Extract basic information
  extractBasicInfo(lines, resumeData);
  
  // Extract sections
  extractSections(lines, resumeData);
  
  // Clean and validate data
  cleanResumeData(resumeData);

  return resumeData;
};

/**
 * Extract basic personal information
 * @param {Array} lines - Array of text lines
 * @param {Object} resumeData - Resume data object to populate
 */
const extractBasicInfo = (lines, resumeData) => {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const linkedinRegex = /(linkedin\.com\/in\/[\w-]+|linkedin\.com\/pub\/[\w-]+)/i;

  // Find name (usually the first non-empty line or largest text)
  if (lines.length > 0) {
    resumeData.name = lines[0];
  }

  // Extract contact information from first few lines
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    
    // Extract email
    const emailMatch = line.match(emailRegex);
    if (emailMatch && !resumeData.email) {
      resumeData.email = emailMatch[0];
    }
    
    // Extract phone
    const phoneMatch = line.match(phoneRegex);
    if (phoneMatch && !resumeData.phone) {
      resumeData.phone = phoneMatch[0];
    }
    
    // Extract LinkedIn
    const linkedinMatch = line.match(linkedinRegex);
    if (linkedinMatch && !resumeData.linkedin) {
      resumeData.linkedin = `https://${linkedinMatch[0]}`;
    }
    
    // Extract location (common patterns)
    if (!resumeData.location && isLocationLine(line)) {
      resumeData.location = line;
    }
  }

  // Try to extract role/title from early lines
  for (let i = 1; i < Math.min(5, lines.length); i++) {
    if (isRoleLine(lines[i]) && !resumeData.role) {
      resumeData.role = lines[i];
      break;
    }
  }
};

/**
 * Extract sections from resume text
 * @param {Array} lines - Array of text lines
 * @param {Object} resumeData - Resume data object to populate
 */
const extractSections = (lines, resumeData) => {
  const sectionKeywords = {
    summary: ['summary', 'profile', 'objective', 'about'],
    experience: ['experience', 'employment', 'work history', 'career', 'professional experience'],
    education: ['education', 'academic', 'qualification', 'degree'],
    skills: ['skills', 'technical skills', 'competencies', 'expertise'],
    achievements: ['achievements', 'accomplishments', 'awards', 'recognition'],
    projects: ['projects', 'portfolio', 'work samples'],
    certifications: ['certifications', 'certificates', 'licenses'],
    courses: ['courses', 'training', 'coursework']
  };

  let currentSection = '';
  let sectionContent = [];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Check if this line is a section header
    const detectedSection = detectSectionHeader(lowerLine, sectionKeywords);
    
    if (detectedSection) {
      // Process previous section
      if (currentSection && sectionContent.length > 0) {
        processSectionContent(currentSection, sectionContent, resumeData);
      }
      
      // Start new section
      currentSection = detectedSection;
      sectionContent = [];
    } else if (currentSection) {
      // Add content to current section
      sectionContent.push(line);
    }
  }

  // Process final section
  if (currentSection && sectionContent.length > 0) {
    processSectionContent(currentSection, sectionContent, resumeData);
  }
};

/**
 * Detect section headers
 * @param {string} line - Text line to check
 * @param {Object} sectionKeywords - Keywords for each section
 * @returns {string|null} Detected section name or null
 */
const detectSectionHeader = (line, sectionKeywords) => {
  for (const [section, keywords] of Object.entries(sectionKeywords)) {
    for (const keyword of keywords) {
      if (line.includes(keyword) && line.length < 50) {
        return section;
      }
    }
  }
  return null;
};

/**
 * Process content for a specific section
 * @param {string} section - Section name
 * @param {Array} content - Section content lines
 * @param {Object} resumeData - Resume data object to populate
 */
const processSectionContent = (section, content, resumeData) => {
  const text = content.join(' ').trim();
  
  switch (section) {
    case 'summary':
      resumeData.summary = text;
      break;
      
    case 'experience':
      resumeData.experience = parseExperience(content);
      break;
      
    case 'education':
      resumeData.education = parseEducation(content);
      break;
      
    case 'skills':
      resumeData.skills = parseSkills(content);
      break;
      
    case 'achievements':
      resumeData.achievements = parseAchievements(content);
      break;
      
    case 'projects':
      resumeData.projects = parseProjects(content);
      break;
      
    case 'certifications':
      resumeData.certifications = parseCertifications(content);
      break;
      
    case 'courses':
      resumeData.courses = parseCourses(content);
      break;
  }
};

/**
 * Parse experience section
 * @param {Array} content - Experience content lines
 * @returns {Array} Parsed experience entries
 */
const parseExperience = (content) => {
  const experiences = [];
  let currentExp = null;

  for (const line of content) {
    if (isJobTitle(line)) {
      if (currentExp) {
        experiences.push(currentExp);
      }
      currentExp = {
        title: line,
        companyName: "",
        date: "",
        companyLocation: "",
        accomplishment: []
      };
    } else if (currentExp) {
      if (isCompanyName(line)) {
        currentExp.companyName = line;
      } else if (isDateRange(line)) {
        currentExp.date = line;
      } else if (isLocation(line)) {
        currentExp.companyLocation = line;
      } else if (line.length > 10) {
        currentExp.accomplishment.push(line);
      }
    }
  }

  if (currentExp) {
    experiences.push(currentExp);
  }

  return experiences;
};

/**
 * Parse education section
 * @param {Array} content - Education content lines
 * @returns {Array} Parsed education entries
 */
const parseEducation = (content) => {
  const education = [];
  let currentEdu = null;

  for (const line of content) {
    if (isDegree(line)) {
      if (currentEdu) {
        education.push(currentEdu);
      }
      currentEdu = {
        degree: line,
        institution: "",
        duration: "",
        location: ""
      };
    } else if (currentEdu) {
      if (isInstitution(line)) {
        currentEdu.institution = line;
      } else if (isDateRange(line)) {
        currentEdu.duration = line;
      } else if (isLocation(line)) {
        currentEdu.location = line;
      }
    }
  }

  if (currentEdu) {
    education.push(currentEdu);
  }

  return education;
};

/**
 * Parse skills section
 * @param {Array} content - Skills content lines
 * @returns {Array} Parsed skills array
 */
const parseSkills = (content) => {
  const skills = [];
  const text = content.join(' ');
  
  // Split by common separators
  const separators = [',', '•', '·', '|', '\n', ';'];
  let skillItems = [text];
  
  for (const sep of separators) {
    skillItems = skillItems.flatMap(item => item.split(sep));
  }
  
  for (const skill of skillItems) {
    const cleanSkill = skill.trim();
    if (cleanSkill.length > 1 && cleanSkill.length < 50) {
      skills.push(cleanSkill);
    }
  }
  
  return skills;
};

/**
 * Parse achievements section
 * @param {Array} content - Achievements content lines
 * @returns {Array} Parsed achievements array
 */
const parseAchievements = (content) => {
  const achievements = [];
  
  for (const line of content) {
    if (line.length > 10) {
      achievements.push({
        keyAchievements: extractAchievementTitle(line),
        describe: line
      });
    }
  }
  
  return achievements;
};

/**
 * Parse projects section
 * @param {Array} content - Projects content lines
 * @returns {Array} Parsed projects array
 */
const parseProjects = (content) => {
  const projects = [];
  let currentProject = null;

  for (const line of content) {
    if (isProjectTitle(line)) {
      if (currentProject) {
        projects.push(currentProject);
      }
      currentProject = {
        title: line,
        description: "",
        duration: ""
      };
    } else if (currentProject) {
      if (isDateRange(line)) {
        currentProject.duration = line;
      } else if (line.length > 10) {
        currentProject.description += (currentProject.description ? ' ' : '') + line;
      }
    }
  }

  if (currentProject) {
    projects.push(currentProject);
  }

  return projects;
};

/**
 * Parse certifications section
 * @param {Array} content - Certifications content lines
 * @returns {Array} Parsed certifications array
 */
const parseCertifications = (content) => {
  const certifications = [];
  
  for (const line of content) {
    if (line.length > 5) {
      certifications.push({
        title: line,
        issuedBy: "",
        year: extractYear(line)
      });
    }
  }
  
  return certifications;
};

/**
 * Parse courses section
 * @param {Array} content - Courses content lines
 * @returns {Array} Parsed courses array
 */
const parseCourses = (content) => {
  const courses = [];
  
  for (const line of content) {
    if (line.length > 5) {
      courses.push({
        title: line,
        description: ""
      });
    }
  }
  
  return courses;
};

// Helper functions for content detection
const isLocationLine = (line) => {
  const locationPatterns = [
    /\b\w+,\s*\w+\b/, // City, State
    /\b\w+,\s*\w{2}\b/, // City, ST
    /\b\d{5}(-\d{4})?\b/ // ZIP code
  ];
  return locationPatterns.some(pattern => pattern.test(line));
};

const isRoleLine = (line) => {
  const roleKeywords = ['developer', 'engineer', 'manager', 'analyst', 'designer', 'consultant', 'specialist'];
  return roleKeywords.some(keyword => line.toLowerCase().includes(keyword));
};

const isJobTitle = (line) => {
  return line.length > 5 && line.length < 100 && /^[A-Z]/.test(line);
};

const isCompanyName = (line) => {
  return line.length > 2 && line.length < 100;
};

const isDateRange = (line) => {
  const datePatterns = [
    /\d{4}\s*-\s*\d{4}/, // 2020 - 2023
    /\d{1,2}\/\d{4}\s*-\s*\d{1,2}\/\d{4}/, // 01/2020 - 12/2023
    /\w+\s+\d{4}\s*-\s*\w+\s+\d{4}/, // Jan 2020 - Dec 2023
    /present|current/i
  ];
  return datePatterns.some(pattern => pattern.test(line));
};

const isLocation = (line) => {
  return line.length > 3 && line.length < 50 && /[A-Za-z]/.test(line);
};

const isDegree = (line) => {
  const degreeKeywords = ['bachelor', 'master', 'phd', 'doctorate', 'associate', 'diploma', 'certificate'];
  return degreeKeywords.some(keyword => line.toLowerCase().includes(keyword));
};

const isInstitution = (line) => {
  const institutionKeywords = ['university', 'college', 'institute', 'school'];
  return institutionKeywords.some(keyword => line.toLowerCase().includes(keyword)) || 
         (line.length > 5 && line.length < 100);
};

const isProjectTitle = (line) => {
  return line.length > 5 && line.length < 100 && /^[A-Z]/.test(line);
};

const extractAchievementTitle = (line) => {
  // Extract first few words as title
  const words = line.split(' ');
  return words.slice(0, 3).join(' ');
};

const extractYear = (line) => {
  const yearMatch = line.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? yearMatch[0] : "";
};

/**
 * Clean and validate resume data
 * @param {Object} resumeData - Resume data to clean
 */
const cleanResumeData = (resumeData) => {
  // Set defaults for required fields
  if (!resumeData.name || resumeData.name.trim() === "") {
    resumeData.name = "Your Name";
  }
  
  if (!resumeData.email || resumeData.email.trim() === "") {
    resumeData.email = "your.email@example.com";
  }
  
  if (!resumeData.phone || resumeData.phone.trim() === "") {
    resumeData.phone = "123-456-7890";
  }
  
  if (!resumeData.role || resumeData.role.trim() === "") {
    resumeData.role = "Professional Role";
  }
  
  if (!resumeData.location || resumeData.location.trim() === "") {
    resumeData.location = "Your City, Country";
  }

  // Clean arrays
  resumeData.skills = resumeData.skills.filter(skill => skill && skill.trim().length > 0);
  resumeData.languages = resumeData.languages.filter(lang => lang && lang.trim().length > 0);
  
  // Remove empty objects from arrays
  resumeData.experience = resumeData.experience.filter(exp => exp.title && exp.title.trim().length > 0);
  resumeData.education = resumeData.education.filter(edu => edu.degree && edu.degree.trim().length > 0);
  resumeData.achievements = resumeData.achievements.filter(ach => ach.keyAchievements && ach.keyAchievements.trim().length > 0);
  resumeData.projects = resumeData.projects.filter(proj => proj.title && proj.title.trim().length > 0);
};

module.exports = {
  parseResumeContent,
  extractFromPDF,
  extractFromWord,
  parseTextToStructuredData
};