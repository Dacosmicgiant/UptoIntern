import React, { useState, useRef, useEffect } from 'react';

const AIAssistant = ({ onEnhance, enhancingSection }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const enhanceOptions = [
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEnhanceClick = (optionKey) => {
    onEnhance(optionKey);
    setShowDropdown(false);
  };

  return (
    <div className="ai-assistant relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={!!enhancingSection}
        className={`
          ai-button flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${enhancingSection 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
          } 
          text-white
        `}
      >
        {enhancingSection ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Enhancing {enhancingSection}...</span>
          </>
        ) : (
          <>
            <span className="text-lg">🤖</span>
            <span>AI Assistant</span>
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {showDropdown && !enhancingSection && (
        <div className="dropdown absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-lg">🤖</span>
              AI Enhancement Options
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Choose a section to enhance with AI
            </p>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {enhanceOptions.map((option, index) => (
              <button
                key={option.key}
                onClick={() => handleEnhanceClick(option.key)}
                className={`
                  w-full text-left px-4 py-3 transition-colors duration-150
                  hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50
                  focus:outline-none focus:bg-blue-50
                  ${index !== enhanceOptions.length - 1 ? 'border-b border-gray-100' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{option.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {option.description}
                    </div>
                  </div>
                  <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="p-3 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>AI-Powered</span>
              </div>
              <span>•</span>
              <span>Each enhancement creates unique content</span>
            </div>
          </div>
        </div>
      )}

      {/* Enhancement Progress Indicator */}
      {enhancingSection && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            <div>
              <div className="font-medium text-gray-800">
                Enhancing {enhancingSection}...
              </div>
              <div className="text-sm text-gray-600">
                Please wait while AI improves your content
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;