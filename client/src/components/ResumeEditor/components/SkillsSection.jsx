import React, { useState } from 'react';

const SkillsSection = ({ data, onChange, onEnhance, isEnhancing }) => {
  const [newSkill, setNewSkill] = useState('');
  const [skillCategories, setSkillCategories] = useState({
    technical: [],
    soft: [],
    languages: [],
    tools: []
  });

  // Initialize with empty skills array if no data
  const skillsData = data && Array.isArray(data) && data.length > 0 ? data : [''];

  const handleSkillChange = (index, value) => {
    const updatedSkills = [...skillsData];
    updatedSkills[index] = value;
    onChange(updatedSkills.filter(skill => skill.trim() !== ''));
  };

  const addSkill = () => {
    if (newSkill.trim() !== '') {
      const updatedSkills = [...skillsData.filter(skill => skill.trim() !== ''), newSkill.trim()];
      onChange(updatedSkills);
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    const updatedSkills = skillsData.filter((_, i) => i !== index);
    onChange(updatedSkills.length > 0 ? updatedSkills : ['']);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const addQuickSkill = (skill) => {
    if (!skillsData.includes(skill)) {
      const updatedSkills = [...skillsData.filter(s => s.trim() !== ''), skill];
      onChange(updatedSkills);
    }
  };

  const handleEnhanceClick = () => {
    const hasContent = skillsData.some(skill => skill?.trim());
    
    if (!hasContent) {
      alert('Please add some skills first before enhancing');
      return;
    }
    onEnhance();
  };

  // Predefined skill suggestions
  const skillSuggestions = {
    technical: [
      'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'HTML/CSS',
      'SQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'TypeScript', 'Angular',
      'Vue.js', 'PHP', 'Ruby', 'Go', 'Kotlin', 'Swift'
    ],
    soft: [
      'Leadership', 'Communication', 'Project Management', 'Problem Solving',
      'Team Collaboration', 'Critical Thinking', 'Time Management', 'Adaptability',
      'Creativity', 'Analytical Thinking', 'Negotiation', 'Presentation Skills'
    ],
    tools: [
      'Microsoft Office', 'Google Workspace', 'Slack', 'Jira', 'Trello',
      'Figma', 'Adobe Creative Suite', 'Salesforce', 'HubSpot', 'Zoom',
      'Notion', 'Asana', 'VS Code', 'IntelliJ IDEA'
    ],
    languages: [
      'English', 'Spanish', 'French', 'German', 'Chinese (Mandarin)',
      'Japanese', 'Korean', 'Portuguese', 'Italian', 'Russian', 'Arabic', 'Hindi'
    ]
  };

  return (
    <div className="skills-section bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 text-lg">⚡</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Skills & Technologies
            </h2>
            <p className="text-sm text-gray-600">
              Your technical and professional competencies
            </p>
          </div>
        </div>

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
      </div>

      {/* Add New Skill */}
      <div className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a skill and press Enter or click Add"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isEnhancing}
          />
          <button
            onClick={addSkill}
            disabled={!newSkill.trim() || isEnhancing}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
          >
            Add Skill
          </button>
        </div>
      </div>

      {/* Current Skills */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-3">Your Skills:</h3>
        <div className="space-y-3">
          {skillsData.map((skill, index) => (
            <div key={index} className="flex gap-3 items-center">
              <input
                type="text"
                value={skill || ''}
                onChange={(e) => handleSkillChange(index, e.target.value)}
                placeholder="Enter a skill"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isEnhancing}
              />
              {skillsData.length > 1 && (
                <button
                  onClick={() => removeSkill(index)}
                  className="text-red-500 hover:text-red-700 px-2"
                  disabled={isEnhancing}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Skills Preview */}
        {skillsData.some(skill => skill?.trim()) && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">📄 Preview:</h4>
            <div className="flex flex-wrap gap-2">
              {skillsData
                .filter(skill => skill?.trim())
                .map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Skill Suggestions */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-700">💡 Skill Suggestions:</h3>
        
        {Object.entries(skillSuggestions).map(([category, skills]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600 capitalize">
              {category === 'technical' ? 'Technical Skills' : 
               category === 'soft' ? 'Soft Skills' : 
               category === 'tools' ? 'Tools & Software' : 
               'Languages'}:
            </h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <button
                  key={index}
                  onClick={() => addQuickSkill(skill)}
                  disabled={skillsData.includes(skill) || isEnhancing}
                  className={`
                    px-3 py-1 text-sm rounded-full border transition-colors
                    ${skillsData.includes(skill)
                      ? 'bg-green-100 text-green-800 border-green-300 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 cursor-pointer'
                    }
                  `}
                >
                  {skillsData.includes(skill) ? '✓ ' : '+ '}
                  {skill}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Skill Organization Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">📚 Organization Tips:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• List your strongest and most relevant skills first</li>
          <li>• Include both technical and soft skills</li>
          <li>• Be specific (e.g., "React.js" instead of just "JavaScript")</li>
          <li>• Include proficiency levels for languages if applicable</li>
          <li>• Keep the list concise and job-relevant (8-15 skills ideal)</li>
          <li>• Update regularly as you learn new technologies</li>
        </ul>
      </div>

      {/* Skill Levels (Optional Enhancement) */}
      {skillsData.some(skill => skill?.trim()) && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="font-medium text-yellow-900 mb-2">⭐ Pro Tip:</h3>
          <p className="text-sm text-yellow-800">
            Consider organizing your skills by categories (Technical, Soft Skills, Languages, Tools) 
            or adding proficiency levels (Beginner, Intermediate, Advanced) for better clarity.
          </p>
        </div>
      )}

      {/* Enhancement Status */}
      {isEnhancing && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent"></div>
            <div>
              <p className="font-medium text-purple-900">Enhancing Skills Section</p>
              <p className="text-sm text-purple-700">AI is optimizing your skills list...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsSection;