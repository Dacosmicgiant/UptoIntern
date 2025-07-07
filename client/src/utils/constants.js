/**
 * Application constants for UptoIntern Resume Builder
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  TIMEOUT: 60000, // 60 seconds
  ENDPOINTS: {
    SAVE_RESUME: '/api/myTemp/save',
    GET_RESUME: '/api/myTemp/get',
    ENHANCE_RESUME: '/api/myTemp/enhance',
    DOWNLOAD_RESUME: '/api/myTemp/download',
    UPLOAD_RESUME: '/api/upload/resume',
    PARSE_TEXT: '/api/upload/parse-text',
    UPLOAD_STATUS: '/api/upload/status',
    HEALTH_CHECK: '/health'
  }
};

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['.pdf', '.doc', '.docx', '.txt'],
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
};

// Resume Data Schema
export const RESUME_SCHEMA = {
  name: '',
  email: '',
  phone: '',
  linkedin: '',
  address: '',
  summary: '',
  experience: [
    {
      title: '',
      companyName: '',
      date: '',
      companyLocation: '',
      accomplishment: ['']
    }
  ],
  education: [
    {
      degree: '',
      institution: '',
      duration: '',
      location: ''
    }
  ],
  achievements: [
    {
      keyAchievements: '',
      describe: ''
    }
  ],
  skills: [''],
  languages: [''],
  projects: [
    {
      title: '',
      description: '',
      duration: ''
    }
  ],
  courses: [
    {
      title: '',
      description: '',
      duration: ''
    }
  ]
};

// Enhancement Options
export const ENHANCEMENT_OPTIONS = [
  {
    key: 'summary',
    label: 'Enhance Summary',
    icon: '📝',
    description: 'Improve your professional summary'
  },
  {
    key: 'experience',
    label: 'Enhance Experience',
    icon: '💼',
    description: 'Optimize your work experience descriptions'
  },
  {
    key: 'achievements',
    label: 'Enhance Achievements',
    icon: '🏆',
    description: 'Strengthen your achievement statements'
  },
  {
    key: 'projects',
    label: 'Enhance Projects',
    icon: '🚀',
    description: 'Improve project descriptions'
  },
  {
    key: 'skills',
    label: 'Enhance Skills',
    icon: '⚡',
    description: 'Optimize your skills section'
  }
];

// Section Icons and Colors
export const SECTION_CONFIG = {
  header: {
    icon: '👤',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600'
  },
  summary: {
    icon: '📝',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600'
  },
  experience: {
    icon: '💼',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600'
  },
  education: {
    icon: '🎓',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-600'
  },
  achievements: {
    icon: '🏆',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-600'
  },
  skills: {
    icon: '⚡',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600'
  },
  projects: {
    icon: '🚀',
    color: 'indigo',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-600'
  },
  courses: {
    icon: '📚',
    color: 'teal',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-600'
  }
};

// Validation Rules
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    REQUIRED: true
  },
  EMAIL: {
    REQUIRED: true,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  PHONE: {
    REQUIRED: true,
    PATTERN: /^[\+]?[0-9\s\-\(\)]{10,}$/
  },
  SUMMARY: {
    MIN_LENGTH: 50,
    MAX_LENGTH: 500,
    REQUIRED: true
  },
  SKILL: {
    MAX_COUNT: 20,
    MIN_COUNT: 1
  },
  ACCOMPLISHMENT: {
    MAX_LENGTH: 200,
    MIN_COUNT: 1
  }
};

// Toast Messages
export const TOAST_MESSAGES = {
  SAVE_SUCCESS: 'Resume saved successfully!',
  SAVE_ERROR: 'Failed to save resume',
  ENHANCE_SUCCESS: (section) => `${section} enhanced successfully!`,
  ENHANCE_ERROR: (section) => `Failed to enhance ${section}`,
  DOWNLOAD_SUCCESS: 'Resume downloaded successfully!',
  DOWNLOAD_ERROR: 'Failed to download resume',
  UPLOAD_SUCCESS: 'Resume uploaded successfully!',
  UPLOAD_ERROR: 'Failed to upload resume',
  SHARE_SUCCESS: 'Resume shared successfully!',
  SHARE_ERROR: 'Failed to share resume',
  VALIDATION_ERROR: 'Please fix validation errors before proceeding',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  RESUME_ID: 'resumeId',
  DRAFT_DATA: 'draftResumeData',
  USER_PREFERENCES: 'userPreferences',
  LAST_SAVE: 'lastSaveTimestamp'
};

// Application States
export const APP_STATES = {
  LOADING: 'loading',
  IDLE: 'idle',
  SAVING: 'saving',
  ENHANCING: 'enhancing',
  DOWNLOADING: 'downloading',
  UPLOADING: 'uploading',
  ERROR: 'error'
};

// Enhancement States
export const ENHANCEMENT_STATES = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Skill Categories for Suggestions
export const SKILL_CATEGORIES = {
  TECHNICAL: {
    label: 'Technical Skills',
    skills: [
      'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'HTML/CSS',
      'SQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'TypeScript', 'Angular',
      'Vue.js', 'PHP', 'Ruby', 'Go', 'Kotlin', 'Swift', 'C#', 'PostgreSQL',
      'Redis', 'Kubernetes', 'Jenkins', 'Terraform', 'GraphQL', 'REST APIs'
    ]
  },
  SOFT: {
    label: 'Soft Skills',
    skills: [
      'Leadership', 'Communication', 'Project Management', 'Problem Solving',
      'Team Collaboration', 'Critical Thinking', 'Time Management', 'Adaptability',
      'Creativity', 'Analytical Thinking', 'Negotiation', 'Presentation Skills',
      'Mentoring', 'Strategic Planning', 'Customer Service', 'Conflict Resolution'
    ]
  },
  TOOLS: {
    label: 'Tools & Software',
    skills: [
      'Microsoft Office', 'Google Workspace', 'Slack', 'Jira', 'Trello',
      'Figma', 'Adobe Creative Suite', 'Salesforce', 'HubSpot', 'Zoom',
      'Notion', 'Asana', 'VS Code', 'IntelliJ IDEA', 'Photoshop', 'Sketch',
      'Tableau', 'Power BI', 'Excel', 'PowerPoint', 'Confluence', 'GitHub'
    ]
  },
  LANGUAGES: {
    label: 'Languages',
    skills: [
      'English', 'Spanish', 'French', 'German', 'Chinese (Mandarin)',
      'Japanese', 'Korean', 'Portuguese', 'Italian', 'Russian', 'Arabic',
      'Hindi', 'Dutch', 'Swedish', 'Norwegian', 'Polish', 'Turkish'
    ]
  }
};

// Date Format Patterns
export const DATE_PATTERNS = [
  { pattern: /^\d{1,2}\/\d{4}$/, example: 'MM/YYYY' },
  { pattern: /^[A-Za-z]{3,9}\s\d{4}$/, example: 'Month YYYY' },
  { pattern: /^\d{4}$/, example: 'YYYY' },
  { pattern: /^\d{4}\s?-\s?\d{4}$/, example: 'YYYY-YYYY' },
  { pattern: /^[A-Za-z]{3,9}\s\d{4}\s?-\s?[A-Za-z]{3,9}\s\d{4}$/, example: 'Month YYYY - Month YYYY' },
  { pattern: /^[A-Za-z]{3,9}\s\d{4}\s?-\s?Present$/i, example: 'Month YYYY - Present' },
  { pattern: /^\d{1,2}\/\d{4}\s?-\s?\d{1,2}\/\d{4}$/, example: 'MM/YYYY - MM/YYYY' },
  { pattern: /^\d{1,2}\/\d{4}\s?-\s?Present$/i, example: 'MM/YYYY - Present' }
];

// Character Limits
export const CHARACTER_LIMITS = {
  NAME: 100,
  EMAIL: 100,
  PHONE: 20,
  LINKEDIN: 200,
  ADDRESS: 150,
  SUMMARY: 500,
  JOB_TITLE: 100,
  COMPANY_NAME: 100,
  LOCATION: 100,
  ACCOMPLISHMENT: 200,
  DEGREE: 150,
  INSTITUTION: 150,
  ACHIEVEMENT_TITLE: 100,
  ACHIEVEMENT_DESCRIPTION: 300,
  SKILL: 50,
  PROJECT_TITLE: 100,
  PROJECT_DESCRIPTION: 500,
  COURSE_TITLE: 150,
  COURSE_DESCRIPTION: 300
};

// Resume Completeness Weights
export const COMPLETENESS_WEIGHTS = {
  NAME: 10,
  EMAIL: 10,
  PHONE: 10,
  SUMMARY: 15,
  EXPERIENCE: 25,
  EDUCATION: 15,
  SKILLS: 10,
  PROJECTS: 5
};

// Default Examples
export const DEFAULT_EXAMPLES = {
  SUMMARY: "Experienced Full-Stack Developer with 5+ years of expertise in React, Node.js, and cloud technologies. Led development of scalable web applications serving 100K+ users, resulting in 30% improved performance. Passionate about creating innovative solutions and seeking opportunities to drive digital transformation in a forward-thinking technology company.",
  
  EXPERIENCE: {
    title: "Software Developer",
    companyName: "TechCorp Inc.",
    date: "Jan 2022 - Present",
    companyLocation: "New York, NY",
    accomplishment: [
      "Developed and maintained web applications using React.js and Node.js, serving 10,000+ daily users",
      "Improved application performance by 40% through code optimization and database query improvements",
      "Collaborated with cross-functional teams to deliver 15+ features on schedule"
    ]
  },
  
  ACHIEVEMENT: {
    keyAchievements: "Employee of the Year 2023",
    describe: "Recognized for exceptional performance and leadership in delivering critical projects ahead of schedule, resulting in $500K cost savings for the company."
  },
  
  PROJECT: {
    title: "E-commerce Web Application",
    description: "Developed a full-stack e-commerce platform using React, Node.js, and MongoDB. Implemented features including user authentication, payment processing, and inventory management. The application handles 1000+ daily transactions.",
    duration: "6 months"
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to server. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  VALIDATION_ERROR: 'Please fix the highlighted errors before proceeding.',
  FILE_TOO_LARGE: 'File size exceeds 10MB limit. Please choose a smaller file.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file.',
  ENHANCEMENT_ERROR: 'AI enhancement failed. Please try again.',
  SAVE_ERROR: 'Failed to save resume. Please try again.',
  DOWNLOAD_ERROR: 'Failed to generate PDF. Please try again.',
  UPLOAD_ERROR: 'Failed to upload file. Please try again.',
  SHARE_NOT_SUPPORTED: 'Sharing is not supported on this device.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: 'Resume saved successfully!',
  ENHANCEMENT_SUCCESS: 'Content enhanced successfully!',
  DOWNLOAD_SUCCESS: 'Resume downloaded successfully!',
  UPLOAD_SUCCESS: 'Resume uploaded and parsed successfully!',
  SHARE_SUCCESS: 'Resume shared successfully!',
  VALIDATION_SUCCESS: 'All validation checks passed!'
};