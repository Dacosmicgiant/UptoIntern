/**
 * Validation utilities for resume data
 * Ensures data integrity and provides user feedback
 */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (flexible format)
const PHONE_REGEX = /^[\+]?[0-9\s\-\(\)]{10,}$/;

// URL validation regex
const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (!EMAIL_REGEX.test(email.trim())) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, message: 'Phone number is required' };
  }
  
  if (!PHONE_REGEX.test(phone.trim())) {
    return { isValid: false, message: 'Please enter a valid phone number' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate URL (LinkedIn, portfolio, etc.)
 * @param {string} url - URL to validate
 * @param {boolean} required - Whether the field is required
 * @returns {Object} Validation result with isValid and message
 */
export const validateURL = (url, required = false) => {
  if (!url || url.trim() === '') {
    if (required) {
      return { isValid: false, message: 'URL is required' };
    }
    return { isValid: true, message: '' };
  }
  
  if (!URL_REGEX.test(url.trim())) {
    return { isValid: false, message: 'Please enter a valid URL' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate required text field
 * @param {string} text - Text to validate
 * @param {string} fieldName - Name of the field for error message
 * @param {number} minLength - Minimum length required
 * @param {number} maxLength - Maximum length allowed
 * @returns {Object} Validation result with isValid and message
 */
export const validateRequiredText = (text, fieldName, minLength = 1, maxLength = 500) => {
  if (!text || text.trim() === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  if (text.trim().length < minLength) {
    return { isValid: false, message: `${fieldName} must be at least ${minLength} characters` };
  }
  
  if (text.trim().length > maxLength) {
    return { isValid: false, message: `${fieldName} must be less than ${maxLength} characters` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate date format (flexible)
 * @param {string} date - Date string to validate
 * @param {boolean} required - Whether the field is required
 * @returns {Object} Validation result with isValid and message
 */
export const validateDate = (date, required = false) => {
  if (!date || date.trim() === '') {
    if (required) {
      return { isValid: false, message: 'Date is required' };
    }
    return { isValid: true, message: '' };
  }
  
  // Allow flexible date formats (MM/YYYY, Jan 2022, 2022-2023, etc.)
  const datePatterns = [
    /^\d{1,2}\/\d{4}$/, // MM/YYYY
    /^[A-Za-z]{3,9}\s\d{4}$/, // Month YYYY
    /^\d{4}$/, // YYYY
    /^\d{4}\s?-\s?\d{4}$/, // YYYY-YYYY
    /^[A-Za-z]{3,9}\s\d{4}\s?-\s?[A-Za-z]{3,9}\s\d{4}$/, // Month YYYY - Month YYYY
    /^[A-Za-z]{3,9}\s\d{4}\s?-\s?Present$/i, // Month YYYY - Present
    /^\d{1,2}\/\d{4}\s?-\s?\d{1,2}\/\d{4}$/, // MM/YYYY - MM/YYYY
    /^\d{1,2}\/\d{4}\s?-\s?Present$/i // MM/YYYY - Present
  ];
  
  const isValidFormat = datePatterns.some(pattern => pattern.test(date.trim()));
  
  if (!isValidFormat) {
    return { 
      isValid: false, 
      message: 'Please use a valid date format (e.g., "Jan 2022", "01/2022", "2022-2023", or "Jan 2022 - Present")' 
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate skills array
 * @param {Array} skills - Array of skills to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateSkills = (skills) => {
  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    return { isValid: false, message: 'At least one skill is required' };
  }
  
  const validSkills = skills.filter(skill => skill && skill.trim() !== '');
  
  if (validSkills.length === 0) {
    return { isValid: false, message: 'At least one valid skill is required' };
  }
  
  if (validSkills.length > 20) {
    return { isValid: false, message: 'Please limit to 20 skills maximum' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate experience section
 * @param {Array} experience - Array of experience objects
 * @returns {Object} Validation result with isValid, message, and errors array
 */
export const validateExperience = (experience) => {
  if (!experience || !Array.isArray(experience) || experience.length === 0) {
    return { isValid: false, message: 'At least one work experience is required', errors: [] };
  }
  
  const errors = [];
  
  experience.forEach((exp, index) => {
    const expErrors = [];
    
    if (!exp.title || exp.title.trim() === '') {
      expErrors.push('Job title is required');
    }
    
    if (!exp.companyName || exp.companyName.trim() === '') {
      expErrors.push('Company name is required');
    }
    
    if (!exp.date || exp.date.trim() === '') {
      expErrors.push('Employment dates are required');
    }
    
    if (!exp.accomplishment || !Array.isArray(exp.accomplishment) || 
        !exp.accomplishment.some(acc => acc && acc.trim() !== '')) {
      expErrors.push('At least one accomplishment is required');
    }
    
    if (expErrors.length > 0) {
      errors.push({
        index,
        title: exp.title || `Experience ${index + 1}`,
        errors: expErrors
      });
    }
  });
  
  if (errors.length > 0) {
    return { 
      isValid: false, 
      message: 'Please fix the following experience section errors', 
      errors 
    };
  }
  
  return { isValid: true, message: '', errors: [] };
};

/**
 * Validate education section
 * @param {Array} education - Array of education objects
 * @returns {Object} Validation result with isValid, message, and errors array
 */
export const validateEducation = (education) => {
  if (!education || !Array.isArray(education) || education.length === 0) {
    return { isValid: false, message: 'At least one education entry is required', errors: [] };
  }
  
  const errors = [];
  
  education.forEach((edu, index) => {
    const eduErrors = [];
    
    if (!edu.degree || edu.degree.trim() === '') {
      eduErrors.push('Degree/Program is required');
    }
    
    if (!edu.institution || edu.institution.trim() === '') {
      eduErrors.push('Institution is required');
    }
    
    if (!edu.duration || edu.duration.trim() === '') {
      eduErrors.push('Duration/Year is required');
    }
    
    if (eduErrors.length > 0) {
      errors.push({
        index,
        title: edu.degree || `Education ${index + 1}`,
        errors: eduErrors
      });
    }
  });
  
  if (errors.length > 0) {
    return { 
      isValid: false, 
      message: 'Please fix the following education section errors', 
      errors 
    };
  }
  
  return { isValid: true, message: '', errors: [] };
};

/**
 * Validate complete resume data
 * @param {Object} resumeData - Complete resume data object
 * @returns {Object} Validation result with isValid, message, and section errors
 */
export const validateCompleteResume = (resumeData) => {
  const validationResults = {
    isValid: true,
    message: '',
    sections: {}
  };
  
  // Validate header information
  const nameValidation = validateRequiredText(resumeData.name, 'Name', 2, 100);
  const emailValidation = validateEmail(resumeData.email);
  const phoneValidation = validatePhone(resumeData.phone);
  
  if (!nameValidation.isValid || !emailValidation.isValid || !phoneValidation.isValid) {
    validationResults.isValid = false;
    validationResults.sections.header = {
      name: nameValidation,
      email: emailValidation,
      phone: phoneValidation
    };
  }
  
  // Validate LinkedIn if provided
  if (resumeData.linkedin) {
    const linkedinValidation = validateURL(resumeData.linkedin);
    if (!linkedinValidation.isValid) {
      validationResults.sections.header = {
        ...validationResults.sections.header,
        linkedin: linkedinValidation
      };
      validationResults.isValid = false;
    }
  }
  
  // Validate summary
  const summaryValidation = validateRequiredText(resumeData.summary, 'Professional Summary', 50, 500);
  if (!summaryValidation.isValid) {
    validationResults.isValid = false;
    validationResults.sections.summary = summaryValidation;
  }
  
  // Validate experience
  const experienceValidation = validateExperience(resumeData.experience);
  if (!experienceValidation.isValid) {
    validationResults.isValid = false;
    validationResults.sections.experience = experienceValidation;
  }
  
  // Validate education
  const educationValidation = validateEducation(resumeData.education);
  if (!educationValidation.isValid) {
    validationResults.isValid = false;
    validationResults.sections.education = educationValidation;
  }
  
  // Validate skills
  const skillsValidation = validateSkills(resumeData.skills);
  if (!skillsValidation.isValid) {
    validationResults.isValid = false;
    validationResults.sections.skills = skillsValidation;
  }
  
  // Set overall message
  if (!validationResults.isValid) {
    validationResults.message = 'Please fix the validation errors before saving or downloading your resume';
  } else {
    validationResults.message = 'Resume validation passed successfully';
  }
  
  return validationResults;
};

/**
 * Get resume completeness percentage
 * @param {Object} resumeData - Resume data object
 * @returns {number} Completion percentage (0-100)
 */
export const getResumeCompleteness = (resumeData) => {
  const sections = [
    { key: 'name', weight: 10, check: (data) => data.name && data.name.trim() !== '' },
    { key: 'email', weight: 10, check: (data) => validateEmail(data.email).isValid },
    { key: 'phone', weight: 10, check: (data) => validatePhone(data.phone).isValid },
    { key: 'summary', weight: 15, check: (data) => data.summary && data.summary.trim().length >= 50 },
    { key: 'experience', weight: 25, check: (data) => validateExperience(data.experience).isValid },
    { key: 'education', weight: 15, check: (data) => validateEducation(data.education).isValid },
    { key: 'skills', weight: 10, check: (data) => validateSkills(data.skills).isValid },
    { key: 'projects', weight: 5, check: (data) => data.projects && data.projects.length > 0 && data.projects[0].title }
  ];
  
  let totalWeight = 0;
  let completedWeight = 0;
  
  sections.forEach(section => {
    totalWeight += section.weight;
    if (section.check(resumeData)) {
      completedWeight += section.weight;
    }
  });
  
  return Math.round((completedWeight / totalWeight) * 100);
};