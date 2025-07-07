import React, { useState } from 'react';

const AchievementsSection = ({ data, onChange, onEnhance, isEnhancing }) => {
  const [expandedItems, setExpandedItems] = useState({});

  // Initialize with empty achievement if no data
  const achievementsData = data && data.length > 0 ? data : [
    {
      keyAchievements: '',
      describe: ''
    }
  ];

  const handleAchievementChange = (index, field, value) => {
    const updatedAchievements = [...achievementsData];
    updatedAchievements[index] = {
      ...updatedAchievements[index],
      [field]: value
    };
    onChange(updatedAchievements);
  };

  const addAchievement = () => {
    const newAchievement = {
      keyAchievements: '',
      describe: ''
    };
    onChange([...achievementsData, newAchievement]);
  };

  const removeAchievement = (index) => {
    if (achievementsData.length > 1) {
      const updatedAchievements = achievementsData.filter((_, i) => i !== index);
      onChange(updatedAchievements);
    }
  };

  const toggleExpanded = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleEnhanceClick = () => {
    const hasContent = achievementsData.some(achievement => 
      achievement.keyAchievements?.trim() || achievement.describe?.trim()
    );
    
    if (!hasContent) {
      alert('Please add some achievements first before enhancing');
      return;
    }
    onEnhance();
  };

  return (
    <div className="achievements-section bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-yellow-600 text-lg">🏆</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Achievements & Awards
            </h2>
            <p className="text-sm text-gray-600">
              Recognition, awards, and notable accomplishments
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
                <span>Enhance</span>
              </>
            )}
          </button>

          {/* Add Achievement Button */}
          <button
            onClick={addAchievement}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            <span>+</span>
            <span>Add Achievement</span>
          </button>
        </div>
      </div>

      {/* Achievement Items */}
      <div className="space-y-6">
        {achievementsData.map((achievement, index) => (
          <div
            key={index}
            className="achievement-item p-5 border border-gray-200 rounded-lg bg-gray-50"
          >
            {/* Achievement Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => toggleExpanded(index)}
                className="flex items-center gap-2 text-left"
              >
                <span className={`transform transition-transform ${expandedItems[index] ? 'rotate-90' : ''}`}>
                  ▶️
                </span>
                <span className="font-medium text-gray-800">
                  {achievement.keyAchievements || `Achievement ${index + 1}`}
                </span>
              </button>

              {achievementsData.length > 1 && (
                <button
                  onClick={() => removeAchievement(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Achievement Form */}
            <div className={`space-y-4 ${expandedItems[index] !== false ? 'block' : 'hidden'}`}>
              {/* Achievement Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Achievement Title *
                </label>
                <input
                  type="text"
                  value={achievement.keyAchievements || ''}
                  onChange={(e) => handleAchievementChange(index, 'keyAchievements', e.target.value)}
                  placeholder="e.g., Employee of the Year 2023"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isEnhancing}
                />
              </div>

              {/* Achievement Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={achievement.describe || ''}
                  onChange={(e) => handleAchievementChange(index, 'describe', e.target.value)}
                  placeholder="Describe the achievement, including context, your role, and the impact. What made this accomplishment significant?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  disabled={isEnhancing}
                />
              </div>

              {/* Character count for description */}
              <div className="text-sm text-gray-500">
                {achievement.describe?.length || 0}/300 characters
              </div>

              {/* Preview */}
              {(achievement.keyAchievements || achievement.describe) && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">🏆 Preview:</h4>
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">
                      {achievement.keyAchievements || 'Achievement Title'}
                    </p>
                    {achievement.describe && (
                      <p className="text-gray-600 mt-1">
                        {achievement.describe}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Achievement Categories Help */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">🌟 Achievement Categories:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-1">Professional Awards:</p>
            <ul className="space-y-1">
              <li>• Employee of the Month/Year</li>
              <li>• Performance Excellence</li>
              <li>• Innovation Award</li>
              <li>• Team Achievement</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Academic Honors:</p>
            <ul className="space-y-1">
              <li>• Dean's List</li>
              <li>• Magna Cum Laude</li>
              <li>• Scholarship Recipient</li>
              <li>• Academic Competition</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Industry Recognition:</p>
            <ul className="space-y-1">
              <li>• Professional Certifications</li>
              <li>• Publication/Patent</li>
              <li>• Speaking Engagements</li>
              <li>• Industry Rankings</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Writing Tips */}
      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
        <h3 className="font-medium text-green-900 mb-2">💡 Writing Tips:</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Be specific about what you achieved and when</li>
          <li>• Include the organization or body that gave the recognition</li>
          <li>• Mention the criteria or competition size if relevant</li>
          <li>• Focus on the impact or significance of the achievement</li>
          <li>• Use numbers and metrics where possible</li>
        </ul>
      </div>

      {/* Example Achievement */}
      {achievementsData.length === 1 && !achievementsData[0].keyAchievements && !achievementsData[0].describe && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">📋 Example:</h3>
          <div className="text-sm text-gray-600">
            <p className="font-medium">"Top Sales Performer Q3 2023"</p>
            <p className="mt-1 italic">
              "Achieved 150% of quarterly sales target, generating $2.5M in revenue and ranking #1 
              out of 45 sales representatives company-wide. Recognized for exceptional client 
              relationship management and strategic account development."
            </p>
          </div>
          <button
            onClick={() => {
              handleAchievementChange(0, 'keyAchievements', 'Top Sales Performer Q3 2023');
              handleAchievementChange(0, 'describe', 'Achieved 150% of quarterly sales target, generating $2.5M in revenue and ranking #1 out of 45 sales representatives company-wide. Recognized for exceptional client relationship management and strategic account development.');
            }}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Use this example
          </button>
        </div>
      )}

      {/* Enhancement Status */}
      {isEnhancing && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent"></div>
            <div>
              <p className="font-medium text-purple-900">Enhancing Achievements</p>
              <p className="text-sm text-purple-700">AI is improving your achievement descriptions...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsSection;