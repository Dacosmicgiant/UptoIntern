import React, { useState } from 'react';

const ExperienceSection = ({ data, onChange, onEnhance, isEnhancing }) => {
  const [expandedItems, setExpandedItems] = useState({});

  // Initialize with empty experience if no data
  const experienceData = data && data.length > 0 ? data : [
    {
      title: '',
      companyName: '',
      date: '',
      companyLocation: '',
      accomplishment: ['']
    }
  ];

  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...experienceData];
    updatedExperience[index] = {
      ...updatedExperience[index],
      [field]: value
    };
    onChange(updatedExperience);
  };

  const handleAccomplishmentChange = (expIndex, accIndex, value) => {
    const updatedExperience = [...experienceData];
    const updatedAccomplishments = [...(updatedExperience[expIndex].accomplishment || [''])];
    updatedAccomplishments[accIndex] = value;
    updatedExperience[expIndex] = {
      ...updatedExperience[expIndex],
      accomplishment: updatedAccomplishments
    };
    onChange(updatedExperience);
  };

  const addAccomplishment = (expIndex) => {
    const updatedExperience = [...experienceData];
    updatedExperience[expIndex] = {
      ...updatedExperience[expIndex],
      accomplishment: [...(updatedExperience[expIndex].accomplishment || ['']), '']
    };
    onChange(updatedExperience);
  };

  const removeAccomplishment = (expIndex, accIndex) => {
    const updatedExperience = [...experienceData];
    const updatedAccomplishments = updatedExperience[expIndex].accomplishment.filter((_, i) => i !== accIndex);
    updatedExperience[expIndex] = {
      ...updatedExperience[expIndex],
      accomplishment: updatedAccomplishments.length > 0 ? updatedAccomplishments : ['']
    };
    onChange(updatedExperience);
  };

  const addExperience = () => {
    const newExperience = {
      title: '',
      companyName: '',
      date: '',
      companyLocation: '',
      accomplishment: ['']
    };
    onChange([...experienceData, newExperience]);
  };

  const removeExperience = (index) => {
    if (experienceData.length > 1) {
      const updatedExperience = experienceData.filter((_, i) => i !== index);
      onChange(updatedExperience);
    }
  };

  const toggleExpanded = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleEnhanceClick = () => {
    const hasContent = experienceData.some(exp => 
      exp.title?.trim() || exp.companyName?.trim() || 
      exp.accomplishment?.some(acc => acc?.trim())
    );
    
    if (!hasContent) {
      alert('Please add some experience content first before enhancing');
      return;
    }
    onEnhance();
  };

  return (
    <div className="experience-section bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-lg">💼</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Work Experience
            </h2>
            <p className="text-sm text-gray-600">
              Your professional work history and achievements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Enhance Button */}
          <button
            onClick={handleEnhanceClick}
            disabled={isEnhancing}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
              ${isEnhancing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple-500 hover:bg-purple-600 shadow-md hover:shadow-lg active:scale-95'
              } 
              text-white text-sm
            `}
          >
            {isEnhancing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Enhancing...</span>
              </>
            ) : (
              <>
                <span className="text-sm">🤖</span>
                <span>Enhance All</span>
              </>
            )}
          </button>

          {/* Add Experience Button */}
          <button
            onClick={addExperience}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            <span>+</span>
            <span>Add Experience</span>
          </button>
        </div>
      </div>

      {/* Experience Items */}
      <div className="space-y-6">
        {experienceData.map((experience, expIndex) => (
          <div
            key={expIndex}
            className="experience-item p-5 border border-gray-200 rounded-lg bg-gray-50"
          >
            {/* Experience Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => toggleExpanded(expIndex)}
                className="flex items-center gap-2 text-left"
              >
                <span className={`transform transition-transform ${expandedItems[expIndex] ? 'rotate-90' : ''}`}>
                  ▶️
                </span>
                <span className="font-medium text-gray-800">
                  {experience.title || experience.companyName || `Experience ${expIndex + 1}`}
                </span>
              </button>

              {experienceData.length > 1 && (
                <button
                  onClick={() => removeExperience(expIndex)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Experience Form */}
            <div className={`space-y-4 ${expandedItems[expIndex] !== false ? 'block' : 'hidden'}`}>
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={experience.title || ''}
                    onChange={(e) => handleExperienceChange(expIndex, 'title', e.target.value)}
                    placeholder="e.g., Software Developer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isEnhancing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={experience.companyName || ''}
                    onChange={(e) => handleExperienceChange(expIndex, 'companyName', e.target.value)}
                    placeholder="e.g., TechCorp Inc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isEnhancing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Period *
                  </label>
                  <input
                    type="text"
                    value={experience.date || ''}
                    onChange={(e) => handleExperienceChange(expIndex, 'date', e.target.value)}
                    placeholder="e.g., Jan 2022 - Present"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isEnhancing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={experience.companyLocation || ''}
                    onChange={(e) => handleExperienceChange(expIndex, 'companyLocation', e.target.value)}
                    placeholder="e.g., New York, NY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isEnhancing}
                  />
                </div>
              </div>

              {/* Accomplishments */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Key Accomplishments *
                  </label>
                  <button
                    onClick={() => addAccomplishment(expIndex)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                    disabled={isEnhancing}
                  >
                    + Add Accomplishment
                  </button>
                </div>

                <div className="space-y-3">
                  {(experience.accomplishment || ['']).map((accomplishment, accIndex) => (
                    <div key={accIndex} className="flex items-start gap-3">
                      <span className="text-gray-400 mt-3 text-sm">•</span>
                      <div className="flex-1">
                        <textarea
                          value={accomplishment || ''}
                          onChange={(e) => handleAccomplishmentChange(expIndex, accIndex, e.target.value)}
                          placeholder="Describe a specific achievement or responsibility. Start with an action verb and include metrics when possible."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          disabled={isEnhancing}
                        />
                      </div>
                      {experience.accomplishment && experience.accomplishment.length > 1 && (
                        <button
                          onClick={() => removeAccomplishment(expIndex, accIndex)}
                          className="text-red-500 hover:text-red-700 mt-2"
                          disabled={isEnhancing}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-1">💡 Tips for Strong Accomplishments:</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Start with action verbs (Led, Developed, Improved, Managed)</li>
                  <li>• Include specific numbers and metrics when possible</li>
                  <li>• Focus on results and impact, not just responsibilities</li>
                  <li>• Keep each point concise but descriptive</li>
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhancement Status */}
      {isEnhancing && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent"></div>
            <div>
              <p className="font-medium text-purple-900">Enhancing Experience Section</p>
              <p className="text-sm text-purple-700">AI is improving your accomplishment descriptions...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceSection;