import axios from 'axios';
import { toast } from 'react-toastify';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error);
    
    // Handle common error scenarios
    if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found.');
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Resume API endpoints
export const resumeAPI = {
  /**
   * Save resume data to backend
   * @param {Object} resumeData - Complete resume data object
   * @returns {Promise} API response with saved resume data including _id
   */
  save: async (resumeData) => {
    try {
      const response = await api.post('/api/myTemp/save', resumeData);
      return response;
    } catch (error) {
      console.error('Failed to save resume:', error);
      throw error;
    }
  },

  /**
   * Get resume data by ID
   * @param {string} resumeId - Resume ID from localStorage
   * @returns {Promise} API response with resume data
   */
  get: async (resumeId) => {
    try {
      const response = await api.get(`/api/myTemp/get/${resumeId}`);
      return response;
    } catch (error) {
      console.error('Failed to get resume:', error);
      throw error;
    }
  },

  /**
   * Enhance resume section using AI
   * @param {string} resumeId - Resume ID
   * @param {string} field - Section to enhance (summary, experience, achievements, etc.)
   * @returns {Promise} API response with enhanced data
   */
  enhance: async (resumeId, field) => {
    try {
      const response = await api.post(`/api/myTemp/enhance/${resumeId}`, { 
        field 
      });
      return response;
    } catch (error) {
      console.error(`Failed to enhance ${field}:`, error);
      throw error;
    }
  },

  /**
   * Download resume as PDF
   * @param {string} resumeId - Resume ID
   * @returns {Promise} Blob response for PDF download
   */
  download: async (resumeId) => {
    try {
      const response = await api.get(`/api/myTemp/download/${resumeId}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to download PDF:', error);
      throw error;
    }
  }
};

// Upload API endpoints
export const uploadAPI = {
  /**
   * Upload resume file for parsing
   * @param {FormData} formData - File data with editType
   * @returns {Promise} API response with parsed resume data
   */
  uploadResume: async (formData) => {
    try {
      const response = await api.post('/api/upload/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000 // 2 minutes for file upload
      });
      return response;
    } catch (error) {
      console.error('Failed to upload resume:', error);
      throw error;
    }
  },

  /**
   * Parse text resume content
   * @param {Object} textData - Plain text resume content
   * @returns {Promise} API response with parsed data
   */
  parseText: async (textData) => {
    try {
      const response = await api.post('/api/upload/parse-text', textData);
      return response;
    } catch (error) {
      console.error('Failed to parse text:', error);
      throw error;
    }
  },

  /**
   * Get upload status and configuration
   * @returns {Promise} Upload configuration and limits
   */
  getUploadStatus: async () => {
    try {
      const response = await api.get('/api/upload/status');
      return response;
    } catch (error) {
      console.error('Failed to get upload status:', error);
      throw error;
    }
  }
};

// Utility functions
export const apiUtils = {
  /**
   * Check if resume ID exists and is valid
   * @param {string} resumeId - Resume ID to validate
   * @returns {Promise<boolean>} True if valid, false otherwise
   */
  validateResumeId: async (resumeId) => {
    if (!resumeId) return false;
    
    try {
      await resumeAPI.get(resumeId);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Auto-save wrapper with error handling
   * @param {Object} resumeData - Resume data to save
   * @param {boolean} showToast - Whether to show success toast
   * @returns {Promise<string|null>} Resume ID or null if failed
   */
  autoSave: async (resumeData, showToast = false) => {
    try {
      const response = await resumeAPI.save(resumeData);
      const resumeId = response.data?.data?._id;
      
      if (resumeId) {
        localStorage.setItem('resumeId', resumeId);
        if (showToast) {
          toast.success('Resume saved successfully!');
        }
        return resumeId;
      }
      
      throw new Error('No resume ID returned from server');
    } catch (error) {
      if (showToast) {
        toast.error('Failed to save resume');
      }
      console.error('Auto-save failed:', error);
      return null;
    }
  },

  /**
   * Enhanced section handler with auto-save
   * @param {string} resumeId - Current resume ID
   * @param {string} section - Section to enhance
   * @param {Function} updateCallback - Function to update state with enhanced data
   * @returns {Promise<boolean>} Success status
   */
  enhanceWithAutoSave: async (resumeId, section, updateCallback) => {
    try {
      if (!resumeId) {
        throw new Error('Resume ID is required for enhancement');
      }

      // Call enhancement API
      const response = await resumeAPI.enhance(resumeId, section);
      
      if (response.data?.data) {
        // Update the state with enhanced data
        updateCallback(response.data.data);
        toast.success(`${section} enhanced successfully!`);
        return true;
      }
      
      throw new Error('No enhanced data received');
    } catch (error) {
      toast.error(`Failed to enhance ${section}`);
      console.error(`Enhancement failed for ${section}:`, error);
      return false;
    }
  },

  /**
   * Download resume with proper error handling
   * @param {string} resumeId - Resume ID
   * @param {string} filename - Download filename
   * @returns {Promise<boolean>} Success status
   */
  downloadResume: async (resumeId, filename = 'UptoSkills_Resume.pdf') => {
    try {
      if (!resumeId) {
        toast.error('Please save your resume first');
        return false;
      }

      const loadingToastId = toast.loading('Preparing your resume PDF...');
      
      const response = await resumeAPI.download(resumeId);
      
      // Verify it's a PDF
      const contentType = response.headers['content-type'];
      if (!contentType?.includes('application/pdf')) {
        throw new Error(`Expected PDF, got ${contentType}`);
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.update(loadingToastId, {
        render: 'Resume downloaded successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      return true;
    } catch (error) {
      toast.error('Failed to download resume');
      console.error('Download failed:', error);
      return false;
    }
  }
};

// Health check function
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    console.log('✅ Backend is healthy:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend health check failed:', error);
    return false;
  }
};

// Export the configured axios instance for custom requests
export default api;