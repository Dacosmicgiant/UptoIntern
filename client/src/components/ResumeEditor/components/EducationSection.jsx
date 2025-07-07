import React, { useState } from 'react';

const EducationSection = ({ data, onChange }) => {
  const [expandedItems, setExpandedItems] = useState({});

  // Initialize with empty education if no data
  const educationData = data && data.length > 0 ? data : [
    {
      degree: '',
      institution: '',
      duration: '',
      location: ''
    }
  ];

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...educationData];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value
    };
    onChange(updatedEducation);
  };

  const addEducation = () => {
    const newEducation = {
      degree: '',
      institution: '',
      duration: '',
      location: ''
    };
    onChange([...educationData, newEducation]);
  };

  const removeEducation = (index) => {
    if (educationData.length > 1) {
      const updatedEducation = educationData.filter((_, i) => i !== index);
      onChange(updatedEducation);
    }
  };

  const toggleExpanded = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="education-section bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-lg">🎓</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Education
            </h2>
            <p className="text-sm text-gray-600">
              Your academic background and qualifications
            </p>
          </div>
        </div>

        {/* Add Education Button */}
        <button
          onClick={addEducation}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
        >
          <span>+</span>
          <span>Add Education</span>
        </button>
      </div>

      {/* Education Items */}
      <div className="space-y-6">
        {educationData.map((education, index) => (
          <div
            key={index}
            className="education-item p-5 border border-gray-200 rounded-lg bg-gray-50"
          >
            {/* Education Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => toggleExpanded(index)}
                className="flex items-center gap-2 text-left"
              >
                <span className={`transform transition-transform ${expandedItems[index] ? 'rotate-90' : ''}`}>
                  ▶️
                </span>
                <span className="font-medium text-gray-800">
                  {education.degree || education.institution || `Education ${index + 1}`}
                </span>
              </button>

              {educationData.length > 1 && (
                <button
                  onClick={() => removeEducation(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Education Form */}
            <div className={`space-y-4 ${expandedItems[index] !== false ? 'block' : 'hidden'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Degree */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Degree/Program *
                  </label>
                  <input
                    type="text"
                    value={education.degree || ''}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    placeholder="e.g., Bachelor of Computer Science"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Institution */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution *
                  </label>
                  <input
                    type="text"
                    value={education.institution || ''}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    placeholder="e.g., University of Technology"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration/Year *
                  </label>
                  <input
                    type="text"
                    value={education.duration || ''}
                    onChange={(e) => handleEducationChange(index, 'duration', e.target.value)}
                    placeholder="e.g., 2018 - 2022 or 2022"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={education.location || ''}
                    onChange={(e) => handleEducationChange(index, 'location', e.target.value)}
                    placeholder="e.g., New York, NY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Preview */}
              {(education.degree || education.institution) && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">📄 Preview:</h4>
                  <div className="text-sm text-gray-800">
                    <p className="font-medium">
                      {education.degree || 'Degree'}
                    </p>
                    <p className="text-gray-600">
                      {education.institution || 'Institution'}
                      {education.location && ` • ${education.location}`}
                    </p>
                    {education.duration && (
                      <p className="text-gray-500">
                        {education.duration}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Education Types Help */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">📚 Common Education Types:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-1">Degrees:</p>
            <ul className="space-y-1">
              <li>• Bachelor of Science (B.S.)</li>
              <li>• Bachelor of Arts (B.A.)</li>
              <li>• Master of Science (M.S.)</li>
              <li>• Master of Business Administration (MBA)</li>
              <li>• Doctor of Philosophy (Ph.D.)</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Other Qualifications:</p>
            <ul className="space-y-1">
              <li>• Professional Certificate</li>
              <li>• Diploma</li>
              <li>• Associate Degree</li>
              <li>• Bootcamp Graduate</li>
              <li>• Online Course Completion</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Ordering Tip */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-sm text-yellow-800">
          💡 <strong>Tip:</strong> List your education in reverse chronological order (most recent first). 
          Include relevant coursework, honors, or GPA if it strengthens your application.
        </p>
      </div>
    </div>
  );
};

export default EducationSection;