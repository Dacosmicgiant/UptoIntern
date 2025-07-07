import { useState, useCallback } from 'react';
import { resumeAPI } from '../utils/api';
import { TOAST_MESSAGES, ENHANCEMENT_STATES } from '../utils/constants';
import { toast } from 'react-toastify';

/**
 * Custom hook for AI enhancement functionality
 * Handles section-wise AI improvements and state management
 */
export const useAIEnhancement = () => {
  // State for tracking enhancement progress
  const [enhancementState, setEnhancementState] = useState(ENHANCEMENT_STATES.IDLE);
  const [enhancingSection, setEnhancingSection] = useState(null);
  const [enhancementHistory, setEnhancementHistory] = useState({});

  /**
   * Enhance a specific section using AI
   * @param {string} resumeId - Resume ID
   * @param {string} section - Section to enhance
   * @param {Function} updateCallback - Callback to update resume data
   * @param {Function} autoSaveCallback - Callback to auto-save before enhancement
   * @returns {Promise<boolean>} Success status
   */
  const enhanceSection = useCallback(async (
    resumeId, 
    section, 
    updateCallback, 
    autoSaveCallback
  ) => {
    try {
      setEnhancementState(ENHANCEMENT_STATES.PROCESSING);
      setEnhancingSection(section);

      // Auto-save before enhancement (critical requirement)
      let currentResumeId = resumeId;
      if (!currentResumeId) {
        currentResumeId = await autoSaveCallback();
        if (!currentResumeId) {
          throw new Error('Failed to save resume before enhancement');
        }
      }

      console.log(`🤖 Enhancing ${section} for resume ${currentResumeId}`);

      // Call enhancement API
      const response = await resumeAPI.enhance(currentResumeId, section);
      
      if (response.data?.data) {
        // Update the resume data with enhanced content
        updateCallback(response.data.data);
        
        // Track enhancement in history
        setEnhancementHistory(prev => ({
          ...prev,
          [section]: {
            timestamp: new Date().toISOString(),
            count: (prev[section]?.count || 0) + 1
          }
        }));

        setEnhancementState(ENHANCEMENT_STATES.SUCCESS);
        toast.success(TOAST_MESSAGES.ENHANCE_SUCCESS(section));
        
        return true;
      }
      
      throw new Error('No enhanced data received from API');
      
    } catch (error) {
      console.error(`Enhancement failed for ${section}:`, error);
      setEnhancementState(ENHANCEMENT_STATES.ERROR);
      
      // Determine error message
      let errorMessage = TOAST_MESSAGES.ENHANCE_ERROR(section);
      if (error.response?.status === 429) {
        errorMessage = 'Enhancement limit reached. Please try again later.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Enhancement timeout. Please try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
      return false;
      
    } finally {
      // Reset state after a delay
      setTimeout(() => {
        setEnhancementState(ENHANCEMENT_STATES.IDLE);
        setEnhancingSection(null);
      }, 2000);
    }
  }, []);

  /**
   * Enhance multiple sections in sequence
   * @param {string} resumeId - Resume ID
   * @param {Array} sections - Array of sections to enhance
   * @param {Function} updateCallback - Callback to update resume data
   * @param {Function} autoSaveCallback - Callback to auto-save
   * @returns {Promise<Object>} Results object with success/failure counts
   */
  const enhanceMultipleSections = useCallback(async (
    resumeId,
    sections,
    updateCallback,
    autoSaveCallback
  ) => {
    const results = {
      successful: [],
      failed: [],
      total: sections.length
    };

    let currentResumeId = resumeId;
    
    // Auto-save before starting
    if (!currentResumeId) {
      currentResumeId = await autoSaveCallback();
      if (!currentResumeId) {
        toast.error('Failed to save resume before enhancement');
        return results;
      }
    }

    const toastId = toast.loading(`Enhancing ${sections.length} sections...`);

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      
      try {
        toast.update(toastId, {
          render: `Enhancing ${section}... (${i + 1}/${sections.length})`,
          type: 'info',
          isLoading: true
        });

        const success = await enhanceSection(
          currentResumeId,
          section,
          updateCallback,
          () => Promise.resolve(currentResumeId) // Skip auto-save for subsequent sections
        );

        if (success) {
          results.successful.push(section);
        } else {
          results.failed.push(section);
        }

        // Add delay between enhancements to avoid rate limiting
        if (i < sections.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`Failed to enhance ${section}:`, error);
        results.failed.push(section);
      }
    }

    // Update final toast message
    toast.update(toastId, {
      render: `Enhanced ${results.successful.length}/${results.total} sections successfully`,
      type: results.failed.length === 0 ? 'success' : 'warning',
      isLoading: false,
      autoClose: 3000
    });

    return results;
  }, [enhanceSection]);

  /**
   * Get enhancement status for a specific section
   */
  const getSectionEnhancementStatus = useCallback((section) => {
    return {
      isEnhancing: enhancingSection === section,
      history: enhancementHistory[section],
      canEnhance: enhancementState === ENHANCEMENT_STATES.IDLE
    };
  }, [enhancingSection, enhancementHistory, enhancementState]);

  /**
   * Check if any section is currently being enhanced
   */
  const isAnyEnhancing = useCallback(() => {
    return enhancementState === ENHANCEMENT_STATES.PROCESSING;
  }, [enhancementState]);

  /**
   * Get enhancement statistics
   */
  const getEnhancementStats = useCallback(() => {
    const sections = Object.keys(enhancementHistory);
    const totalEnhancements = sections.reduce((total, section) => {
      return total + (enhancementHistory[section]?.count || 0);
    }, 0);

    return {
      sectionsEnhanced: sections.length,
      totalEnhancements,
      lastEnhanced: sections.length > 0 ? Math.max(
        ...sections.map(section => new Date(enhancementHistory[section]?.timestamp || 0))
      ) : null
    };
  }, [enhancementHistory]);

  /**
   * Reset enhancement history
   */
  const resetEnhancementHistory = useCallback(() => {
    setEnhancementHistory({});
  }, []);

  /**
   * Check if section has been enhanced recently (within last 5 minutes)
   */
  const isRecentlyEnhanced = useCallback((section) => {
    const sectionHistory = enhancementHistory[section];
    if (!sectionHistory) return false;

    const lastEnhanced = new Date(sectionHistory.timestamp);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    return lastEnhanced > fiveMinutesAgo;
  }, [enhancementHistory]);

  /**
   * Get recommended sections for enhancement based on content quality
   */
  const getRecommendedSections = useCallback((resumeData) => {
    const recommendations = [];

    // Check summary length and quality
    if (!resumeData.summary || resumeData.summary.length < 100) {
      recommendations.push({
        section: 'summary',
        reason: 'Summary could be more detailed',
        priority: 'high'
      });
    }

    // Check experience accomplishments
    if (resumeData.experience && resumeData.experience.length > 0) {
      const hasWeakAccomplishments = resumeData.experience.some(exp => 
        !exp.accomplishment || 
        exp.accomplishment.length < 2 ||
        exp.accomplishment.some(acc => acc.length < 50)
      );
      
      if (hasWeakAccomplishments) {
        recommendations.push({
          section: 'experience',
          reason: 'Experience descriptions could be stronger',
          priority: 'high'
        });
      }
    }

    // Check achievements
    if (!resumeData.achievements || 
        resumeData.achievements.length === 0 || 
        resumeData.achievements[0]?.describe?.length < 50) {
      recommendations.push({
        section: 'achievements',
        reason: 'Achievements section needs improvement',
        priority: 'medium'
      });
    }

    // Check projects
    if (resumeData.projects && resumeData.projects.length > 0) {
      const hasWeakProjects = resumeData.projects.some(project => 
        !project.description || project.description.length < 100
      );
      
      if (hasWeakProjects) {
        recommendations.push({
          section: 'projects',
          reason: 'Project descriptions could be more detailed',
          priority: 'medium'
        });
      }
    }

    return recommendations;
  }, []);

  return {
    // State
    enhancementState,
    enhancingSection,
    enhancementHistory,
    
    // Actions
    enhanceSection,
    enhanceMultipleSections,
    resetEnhancementHistory,
    
    // Utilities
    getSectionEnhancementStatus,
    isAnyEnhancing,
    getEnhancementStats,
    isRecentlyEnhanced,
    getRecommendedSections
  };
};