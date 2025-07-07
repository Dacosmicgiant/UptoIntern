import React, { useState } from 'react';

const CoursesSection = ({ data, onChange }) => {
  const [expandedItems, setExpandedItems] = useState({});

  // Initialize with empty course if no data
  const coursesData = data && data.length > 0 ? data : [
    {
      title: '',
      description: '',
      duration: ''
    }
  ];

  const handleCourseChange = (index, field, value) => {
    const updatedCourses = [...coursesData];
    updatedCourses[index] = {
      ...updatedCourses[index],
      [field]: value
    };
    onChange(updatedCourses);
  };

  const addCourse = () => {
    const newCourse = {
      title: '',
      description: '',
      duration: ''
    };
    onChange([...coursesData, newCourse]);
  };

  const removeCourse = (index) => {
    if (coursesData.length > 1) {
      const updatedCourses = coursesData.filter((_, i) => i !== index);
      onChange(updatedCourses);
    }
  };

  const toggleExpanded = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const addQuickCourse = (courseData) => {
    const newCourse = {
      title: courseData.title,
      description: courseData.description,
      duration: courseData.duration
    };
    onChange([...coursesData.filter(c => c.title?.trim() || c.description?.trim()), newCourse]);
  };

  // Popular course suggestions
  const popularCourses = [
    {
      title: 'AWS Cloud Practitioner',
      description: 'Fundamental understanding of AWS Cloud services and deployment',
      duration: '40 hours'
    },
    {
      title: 'Google Analytics Certified',
      description: 'Web analytics and data-driven marketing strategies',
      duration: '20 hours'
    },
    {
      title: 'Scrum Master Certification',
      description: 'Agile project management and Scrum framework expertise',
      duration: '16 hours'
    },
    {
      title: 'Full Stack Web Development',
      description: 'Complete web development bootcamp covering frontend and backend',
      duration: '6 months'
    }
  ];

  return (
    <div className="courses-section bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
            <span className="text-teal-600 text-lg">📚</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Courses & Certifications
            </h2>
            <p className="text-sm text-gray-600">
              Professional development and continuous learning
            </p>
          </div>
        </div>

        {/* Add Course Button */}
        <button
          onClick={addCourse}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
        >
          <span>+</span>
          <span>Add Course</span>
        </button>
      </div>

      {/* Course Items */}
      <div className="space-y-6">
        {coursesData.map((course, index) => (
          <div
            key={index}
            className="course-item p-5 border border-gray-200 rounded-lg bg-gray-50"
          >
            {/* Course Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => toggleExpanded(index)}
                className="flex items-center gap-2 text-left"
              >
                <span className={`transform transition-transform ${expandedItems[index] ? 'rotate-90' : ''}`}>
                  ▶️
                </span>
                <span className="font-medium text-gray-800">
                  {course.title || `Course ${index + 1}`}
                </span>
              </button>

              {coursesData.length > 1 && (
                <button
                  onClick={() => removeCourse(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Course Form */}
            <div className={`space-y-4 ${expandedItems[index] !== false ? 'block' : 'hidden'}`}>
              {/* Course Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course/Certification Title *
                </label>
                <input
                  type="text"
                  value={course.title || ''}
                  onChange={(e) => handleCourseChange(index, 'title', e.target.value)}
                  placeholder="e.g., AWS Certified Solutions Architect"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Course Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration/Completion Date
                </label>
                <input
                  type="text"
                  value={course.duration || ''}
                  onChange={(e) => handleCourseChange(index, 'duration', e.target.value)}
                  placeholder="e.g., 3 months, 40 hours, or Dec 2023"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Course Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description/Skills Gained
                </label>
                <textarea
                  value={course.description || ''}
                  onChange={(e) => handleCourseChange(index, 'description', e.target.value)}
                  placeholder="Describe what you learned, skills gained, or the scope of the certification. Include the issuing organization if applicable."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <div className="text-sm text-gray-500 mt-1">
                  {course.description?.length || 0}/300 characters
                </div>
              </div>

              {/* Preview */}
              {(course.title || course.description) && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">📚 Preview:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-800">
                        {course.title || 'Course Title'}
                      </h5>
                      {course.duration && (
                        <span className="text-sm text-gray-600">
                          {course.duration}
                        </span>
                      )}
                    </div>
                    {course.description && (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {course.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Popular Courses Suggestions */}
      <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
        <h3 className="font-medium text-teal-900 mb-3">🌟 Popular Courses & Certifications:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {popularCourses.map((course, index) => (
            <div
              key={index}
              className="p-3 bg-white rounded-lg border border-teal-100 hover:border-teal-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-800">{course.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{course.description}</p>
                  <p className="text-xs text-teal-600 mt-1">{course.duration}</p>
                </div>
                <button
                  onClick={() => addQuickCourse(course)}
                  className="text-xs text-teal-700 hover:text-teal-900 ml-2 flex-shrink-0"
                >
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Categories */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">📖 Course Categories:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-1">Technology:</p>
            <ul className="space-y-1">
              <li>• Programming Languages</li>
              <li>• Cloud Platforms (AWS, Azure, GCP)</li>
              <li>• Web Development Frameworks</li>
              <li>• Database Management</li>
              <li>• Cybersecurity</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Business & Management:</p>
            <ul className="space-y-1">
              <li>• Project Management (PMP, Scrum)</li>
              <li>• Digital Marketing</li>
              <li>• Data Analytics</li>
              <li>• Business Analysis</li>
              <li>• Leadership Development</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Design & Creative:</p>
            <ul className="space-y-1">
              <li>• UI/UX Design</li>
              <li>• Graphic Design</li>
              <li>• Video Production</li>
              <li>• Content Creation</li>
              <li>• Photography</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tips for Courses Section */}
      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
        <h3 className="font-medium text-green-900 mb-2">💡 Tips for Courses Section:</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Include completion dates or duration to show recent learning</li>
          <li>• Focus on courses relevant to your target role</li>
          <li>• Mention the issuing organization or platform (Coursera, Udemy, etc.)</li>
          <li>• Include both formal certifications and online courses</li>
          <li>• Highlight any hands-on projects or practical applications</li>
          <li>• Keep descriptions concise but informative</li>
        </ul>
      </div>

      {/* Example Course */}
      {coursesData.length === 1 && !coursesData[0].title && !coursesData[0].description && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">📋 Example Course:</h3>
          <div className="text-sm text-gray-600">
            <p className="font-medium">"Complete React Developer Course"</p>
            <p className="text-gray-500 mb-2">Duration: 3 months</p>
            <p className="italic">
              "Comprehensive React.js course covering hooks, context API, Redux, and modern development practices. 
              Built 5 real-world projects including an e-commerce application and social media dashboard. 
              Completed by Udemy with certificate of completion."
            </p>
          </div>
          <button
            onClick={() => {
              handleCourseChange(0, 'title', 'Complete React Developer Course');
              handleCourseChange(0, 'duration', '3 months');
              handleCourseChange(0, 'description', 'Comprehensive React.js course covering hooks, context API, Redux, and modern development practices. Built 5 real-world projects including an e-commerce application and social media dashboard. Completed by Udemy with certificate of completion.');
            }}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Use this example
          </button>
        </div>
      )}
    </div>
  );
};

export default CoursesSection;