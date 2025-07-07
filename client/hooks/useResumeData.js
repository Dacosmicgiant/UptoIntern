import { useState, useEffect, useCallback } from 'react';
import { resumeAPI, apiUtils } from '../utils/api';
import { RESUME_SCHEMA, STORAGE_KEYS, TOAST_MESSAGES } from '../utils/constants';
import { validateCompleteResume, getResumeCompleteness } from '../utils/validation';
import { toast } from 'react-toastify';

/**
 * Custom hook for managing resume data state and operations
 * Handles CRUD operations, validation, auto-save, and persistence
 */
export const useResumeData = () => {
  // State management
  const [resumeData, setResumeData] = useState(RESUME_SCHEMA);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [completenessPercentage, setCompletenessPercentage] = useState(0);
  const [isDirty, setIsDirty] = useState(false); // Track unsaved changes

  // Load saved resume on hook initialization
  useEffect(() => {
    loadSavedResume();
  }, []);

  // Update completeness percentage when resume data changes
  useEffect(() => {
    const percentage = getResumeCompleteness(resumeData);
    setCompletenessPercentage(percentage);
  }, [resumeData]);

  // Auto-save draft to localStorage when data changes
  useEffect(() => {
    if (isDirty && resumeData) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(STORAGE_KEYS.DRAFT_DATA, JSON.stringify(resumeData));
      }, 1000); // Save draft after 1 second of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [resumeData, isDirty]);

  /**
   * Load saved resume from server or localStorage
   */
  const loadSavedResume = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const resumeId = localStorage.getItem(STORAGE_KEYS.RESUME_ID);
      
      if (resumeId) {
        // Try to load from server
        const response = await resumeAPI.get(resumeId);
        if (response.data) {
          setResumeData(response.data);
          setLastSaved(new Date());
          setIsDirty(false);
          console.log('Resume loaded from server:', resumeId);
          return;
        }
      }
      
      // Fallback to draft data from localStorage
      const draftData = localStorage.getItem(STORAGE_KEYS.DRAFT_DATA);
      if (draftData) {
        try {
          const parsedData = JSON.parse(draftData);
          setResumeData({ ...RESUME_SCHEMA, ...parsedData });
          setIsDirty(true);
          console.log('Draft resume loaded from localStorage');
        } catch (error) {
          console.error('Error parsing draft data:', error);
        }
      }
      
    } catch (error) {
      console.error('Failed to load saved resume:', error);
      // Clear invalid resume ID
      localStorage.removeItem(STORAGE_KEYS.RESUME_ID);
      
      // Load draft if available
      const draftData = localStorage.getItem(STORAGE_KEYS.DRAFT_DATA);
      if (draftData) {
        try {
          const parsedData = JSON.parse(draftData);
          setResumeData({ ...RESUME_SCHEMA, ...parsedData });
          setIsDirty(true);
        } catch (error) {
          console.error('Error parsing draft data:', error);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Save resume to server
   */
  const saveResume = useCallback(async (showToast = true) => {
    try {
      setIsSaving(true);
      
      // Validate before saving
      const validation = validateCompleteResume(resumeData);
      setValidationErrors(validation.sections || {});
      
      if (!validation.isValid && showToast) {
        toast.warning(TOAST_MESSAGES.VALIDATION_ERROR);
        return null;
      }

      console.log('Saving resume data:', resumeData);

      const response = await resumeAPI.save(resumeData);
      
      if (response.status === 200 && response.data?.data) {
        const savedData = response.data.data;
        const resumeId = savedData._id;
        
        // Update state
        setResumeData(prev => ({ ...prev, _id: resumeId }));
        setLastSaved(new Date());
        setIsDirty(false);
        
        // Store in localStorage
        localStorage.setItem(STORAGE_KEYS.RESUME_ID, resumeId);
        localStorage.setItem(STORAGE_KEYS.LAST_SAVE, new Date().toISOString());
        
        if (showToast) {
          toast.success(TOAST_MESSAGES.SAVE_SUCCESS);
        }
        
        return resumeId;
      }
      
      throw new Error('Invalid response from server');
      
    } catch (error) {
      console.error('Save error:', error);
      if (showToast) {
        toast.error(TOAST_MESSAGES.SAVE_ERROR);
      }
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [resumeData]);

  /**
   * Update a single field in resume data
   */
  const updateField = useCallback((field, value) => {
    setResumeData(prev => {
      const newData = { ...prev, [field]: value };
      return newData;
    });
    setIsDirty(true);
  }, []);

  /**
   * Update a section in resume data
   */
  const updateSection = useCallback((section, data) => {
    setResumeData(prev => {
      const newData = { ...prev, [section]: data };
      return newData;
    });
    setIsDirty(true);
  }, []);

  /**
   * Reset resume to default template
   */
  const resetResume = useCallback(() => {
    setResumeData(RESUME_SCHEMA);
    setValidationErrors({});
    setLastSaved(null);
    setIsDirty(false);
    
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.RESUME_ID);
    localStorage.removeItem(STORAGE_KEYS.DRAFT_DATA);
    localStorage.removeItem(STORAGE_KEYS.LAST_SAVE);
    
    toast.info('Resume reset to default template');
  }, []);

  /**
   * Load resume from uploaded/parsed data
   */
  const loadFromUpload = useCallback((uploadedData) => {
    const mergedData = { ...RESUME_SCHEMA, ...uploadedData };
    setResumeData(mergedData);
    setValidationErrors({});
    setIsDirty(true);
    
    toast.success(TOAST_MESSAGES.UPLOAD_SUCCESS);
  }, []);

  /**
   * Auto-save before performing operations
   */
  const autoSave = useCallback(async () => {
    if (isDirty || !resumeData._id) {
      return await saveResume(false);
    }
    return resumeData._id;
  }, [isDirty, resumeData._id, saveResume]);

  /**
   * Validate current resume data
   */
  const validateResume = useCallback(() => {
    const validation = validateCompleteResume(resumeData);
    setValidationErrors(validation.sections || {});
    return validation;
  }, [resumeData]);

  /**
   * Get validation status for a specific section
   */
  const getSectionValidation = useCallback((section) => {
    return validationErrors[section] || { isValid: true };
  }, [validationErrors]);

  /**
   * Check if resume has unsaved changes
   */
  const hasUnsavedChanges = useCallback(() => {
    return isDirty;
  }, [isDirty]);

  /**
   * Get time since last save
   */
  const getTimeSinceLastSave = useCallback(() => {
    if (!lastSaved) return null;
    
    const now = new Date();
    const diffMs = now - lastSaved;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return lastSaved.toLocaleDateString();
  }, [lastSaved]);

  // Return the hook interface
  return {
    // State
    resumeData,
    isLoading,
    isSaving,
    lastSaved,
    validationErrors,
    completenessPercentage,
    isDirty,
    
    // Actions
    updateField,
    updateSection,
    saveResume,
    resetResume,
    loadFromUpload,
    autoSave,
    validateResume,
    
    // Utilities
    getSectionValidation,
    hasUnsavedChanges,
    getTimeSinceLastSave,
    
    // Direct data setters (for special cases)
    setResumeData
  };
};