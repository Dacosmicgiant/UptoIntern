import React, { useState } from 'react';

const ProjectsSection = ({ data, onChange, onEnhance, isEnhancing }) => {
  const [expandedItems, setExpandedItems] = useState({});

  // Initialize with empty project if no data
  const projectsData = data && data.length > 0 ? data : [
    {
      title: '',
      description: '',
      duration: ''
    }
  ];

  const handleProjectChange = (index, field, value) => {
    const updatedProjects = [...projectsData];
    updatedProjects[index] = {
      ...updatedProjects[index],
      [field]: value
    };
    onChange(updatedProjects);
  };

  const addProject = () => {
    const newProject = {
      title: '',
      description: '',
      duration: ''
    };
    onChange([...projectsData, newProject]);
  };

  const removeProject = (index) => {
    if (projectsData.length > 1) {
      const updatedProjects = projectsData.filter((_, i) => i !== index);
      onChange(updatedProjects);
    }
  };

  const toggleExpanded = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleEnhanceClick = () => {
    const hasContent = projectsData.some(project => 
      project.title?.trim() || project.description?.trim()
    );
    
    if (!hasContent) {
      alert('Please add some project content first before enhancing');
      return;
    }
    onEnhance();
  };

  return (
    <div className="projects-section bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 text-lg">🚀</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Projects & Portfolio
            </h2>
            <p className="text-sm text-gray-600">
              Showcase your notable projects and contributions
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

          {/* Add Project Button */}
          <button
            onClick={addProject}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            <span>+</span>
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Project Items */}
      <div className="space-y-6">
        {projectsData.map((project, index) => (
          <div
            key={index}
            className="project-item p-5 border border-gray-200 rounded-lg bg-gray-50"
          >
            {/* Project Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => toggleExpanded(index)}
                className="flex items-center gap-2 text-left"
              >
                <span className={`transform transition-transform ${expandedItems[index] ? 'rotate-90' : ''}`}>
                  ▶️
                </span>
                <span className="font-medium text-gray-800">
                  {project.title || `Project ${index + 1}`}
                </span>
              </button>

              {projectsData.length > 1 && (
                <button
                  onClick={() => removeProject(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Project Form */}
            <div className={`space-y-4 ${expandedItems[index] !== false ? 'block' : 'hidden'}`}>
              {/* Project Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={project.title || ''}
                  onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                  placeholder="e.g., E-commerce Web Application"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isEnhancing}
                />
              </div>

              {/* Project Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration/Timeline
                </label>
                <input
                  type="text"
                  value={project.duration || ''}
                  onChange={(e) => handleProjectChange(index, 'duration', e.target.value)}
                  placeholder="e.g., 6 months, Jan 2023 - Jun 2023, or Ongoing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isEnhancing}
                />
              </div>

              {/* Project Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description *
                </label>
                <textarea
                  value={project.description || ''}
                  onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                  placeholder="Describe the project, your role, technologies used, challenges faced, and outcomes achieved. Include specific features, metrics, or impact when possible."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  disabled={isEnhancing}
                />
                <div className="text-sm text-gray-500 mt-1">
                  {project.description?.length || 0}/500 characters
                </div>
              </div>

              {/* Preview */}
              {(project.title || project.description) && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">🚀 Preview:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-800">
                        {project.title || 'Project Title'}
                      </h5>
                      {project.duration && (
                        <span className="text-sm text-gray-600">
                          {project.duration}
                        </span>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Project Tips */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-1">💡 Project Description Tips:</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Start with the problem you solved or goal you achieved</li>
                  <li>• Mention specific technologies, frameworks, or tools used</li>
                  <li>• Include your specific role and contributions</li>
                  <li>• Highlight measurable outcomes (users, performance, etc.)</li>
                  <li>• Add links to live demos or repositories if available</li>
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Categories Help */}
      <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
        <h3 className="font-medium text-indigo-900 mb-2">🎯 Project Categories:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-indigo-800">
          <div>
            <p className="font-medium mb-1">Web Development:</p>
            <ul className="space-y-1">
              <li>• Full-stack applications</li>
              <li>• Frontend interfaces</li>
              <li>• API development</li>
              <li>• E-commerce platforms</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Mobile & Desktop:</p>
            <ul className="space-y-1">
              <li>• Mobile applications</li>
              <li>• Desktop software</li>
              <li>• Cross-platform tools</li>
              <li>• System utilities</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Data & AI:</p>
            <ul className="space-y-1">
              <li>• Data analysis projects</li>
              <li>• Machine learning models</li>
              <li>• Automation scripts</li>
              <li>• Research initiatives</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Example Project */}
      {projectsData.length === 1 && !projectsData[0].title && !projectsData[0].description && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">📋 Example Project:</h3>
          <div className="text-sm text-gray-600">
            <p className="font-medium">"Task Management Web Application"</p>
            <p className="text-gray-500 mb-2">Duration: 4 months</p>
            <p className="italic">
              "Developed a full-stack task management application using React.js, Node.js, and MongoDB. 
              Implemented user authentication, real-time updates with Socket.io, and responsive design. 
              The application supports team collaboration features and has been used by 200+ users. 
              Deployed on AWS with CI/CD pipeline integration."
            </p>
          </div>
          <button
            onClick={() => {
              handleProjectChange(0, 'title', 'Task Management Web Application');
              handleProjectChange(0, 'duration', '4 months');
              handleProjectChange(0, 'description', 'Developed a full-stack task management application using React.js, Node.js, and MongoDB. Implemented user authentication, real-time updates with Socket.io, and responsive design. The application supports team collaboration features and has been used by 200+ users. Deployed on AWS with CI/CD pipeline integration.');
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
              <p className="font-medium text-purple-900">Enhancing Projects Section</p>
              <p className="text-sm text-purple-700">AI is improving your project descriptions...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsSection;