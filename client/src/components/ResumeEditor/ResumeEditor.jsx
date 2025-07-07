import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

// Component imports
import AIAssistant from './components/AIAssistant';
import ActionButtons from './components/ActionButtons';
import UploadResume from './components/UploadResume';
import HeaderSection from './components/HeaderSection.jsx';
import SummarySection from './components/SummarySection';
import ExperienceSection from './components/ExperienceSection';
import EducationSection from './components/EducationSection';
import AchievementsSection from './components/AchievementsSection';
import SkillsSection from './components/SkillsSection';
import ProjectsSection from './components/ProjectsSection';
import CoursesSection from './components/CoursesSection';

// Initial resume schema as per requirements
const initialResumeData = {
  name: "John Doe",
  email: "john.doe@email.com",
  phone: "+1 (555) 123-4567",
  linkedin: "linkedin.com/in/johndoe",
  address: "New York, NY",
  summary: "Experienced professional with expertise in full-stack development...",
  experience: [
    {
      title: "Software Developer",
      companyName: "Tech Company",
      date: "Jan 2022 - Present",
      companyLocation: "New York",
      accomplishment: [
        "Developed scalable web applications using React and Node.js",
        "Improved system performance by 30% through optimization",
        "Led a team of 5 developers on critical projects"
      ]
    }
  ],
  education: [
    {
      degree: "Bachelor of Computer Science",
      institution: "University of Technology",
      duration: "2018 - 2022",
      location: "New York"
    }
  ],
  achievements: [
    {
      keyAchievements: "Best Developer Award",
      describe: "Received recognition for outstanding performance in 2023"
    }
  ],
  skills: ["React.js", "Node.js", "MongoDB", "JavaScript", "Python"],
  languages: ["English", "Spanish"],
  projects: [
    {
      title: "E-commerce Platform",
      description: "Built a full-stack e-commerce application with payment integration",
      duration: "6 months"
    }
  ],
  courses: [
    {
      title: "Advanced React Development",
      description: "Comprehensive course on React.js and modern development practices",
      duration: "3 months"
    }
  ]
};

const ResumeEditor = () => {
  const [resumeData, setResumeData] = useState(initialResumeData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [enhancingSection, setEnhancingSection] = useState(null);
  const resumeRef = useRef(null);

  // Load saved resume on component mount
  useEffect(() => {
    loadSavedResume();
  }, []);

  const loadSavedResume = async () => {
    const resumeId = localStorage.getItem('resumeId');
    if (resumeId) {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:5000/api/myTemp/get/${resumeId}`);
        if (response.data) {
          setResumeData(response.data);
          console.log('Loaded saved resume:', resumeId);
        }
      } catch (error) {
        console.error('Failed to load saved resume:', error);
        localStorage.removeItem('resumeId'); // Clear invalid ID
        toast.info('Starting with a new resume');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveResume = async (showToast = true) => {
    try {
      setIsSaving(true);
      console.log('Saving resume data:', resumeData);

      const response = await axios.post('http://localhost:5000/api/myTemp/save', resumeData);
      
      if (response.status === 200) {
        const savedData = response.data.data;
        setResumeData(prev => ({ ...prev, _id: savedData._id }));
        localStorage.setItem('resumeId', savedData._id);
        
        if (showToast) {
          toast.success('Resume saved successfully!');
        }
        return savedData._id;
      }
    } catch (error) {
      if (showToast) {
        toast.error('Failed to save resume');
      }
      console.error('Save error:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnhanceSection = async (section) => {
    try {
      setEnhancingSection(section);
      
      // Auto-save before enhancement (critical requirement)
      if (!resumeData._id) {
        await handleSaveResume(false);
      }

      if (!resumeData._id) {
        toast.error('Please save your resume first');
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/myTemp/enhance/${resumeData._id}`,
        { field: section }
      );

      if (response.data && response.data.data) {
        setResumeData(prev => ({
          ...prev,
          ...response.data.data
        }));
        toast.success(`${section} enhanced successfully!`);
      }
    } catch (error) {
      toast.error(`Failed to enhance ${section}`);
      console.error('Enhancement error:', error);
    } finally {
      setEnhancingSection(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resumeData._id) {
      toast.error('Please save your resume first');
      return;
    }

    try {
      setIsDownloading(true);
      
      // Auto-save before download
      await handleSaveResume(false);

      const loadingToastId = toast.loading('Preparing your resume PDF...');

      const response = await axios.get(
        `http://localhost:5000/api/myTemp/download/${resumeData._id}`,
        { responseType: 'blob' }
      );

      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error(`Expected PDF, got ${contentType}`);
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'UptoSkills_Resume.pdf');
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
    } catch (error) {
      toast.error('Failed to download resume');
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Professional Resume',
          text: 'Check out my professional resume created with UptoSkills',
          url: window.location.href
        });
        toast.success('Resume shared successfully!');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast.error('Failed to share resume');
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.info('Resume link copied to clipboard!');
      } catch (error) {
        toast.info('Web Share API not supported on this device');
      }
    }
  };

  const handleResumeUploaded = (uploadedData) => {
    setResumeData(uploadedData);
    setShowUpload(false);
    toast.success('Resume uploaded successfully!');
  };

  const updateResumeField = (field, value) => {
    setResumeData(prev => ({ ...prev, [field]: value }));
  };

  const updateResumeSection = (section, data) => {
    setResumeData(prev => ({ ...prev, [section]: data }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading your resume...</div>
      </div>
    );
  }

  return (
    <div className="resume-editor min-h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white shadow-md p-4 mb-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800">Resume Editor</h1>
            {resumeData._id && (
              <span className="text-sm text-green-600">✓ Saved</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <ActionButtons
              onSave={() => handleSaveResume(true)}
              onDownload={handleDownloadPDF}
              onShare={handleShare}
              onUpload={() => setShowUpload(true)}
              isLoading={isSaving}
              isDownloading={isDownloading}
            />
            <AIAssistant 
              onEnhance={handleEnhanceSection}
              enhancingSection={enhancingSection}
            />
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <UploadResume
          onClose={() => setShowUpload(false)}
          onResumeUploaded={handleResumeUploaded}
        />
      )}

      {/* Resume Content */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div ref={resumeRef} className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8 space-y-6">
            <HeaderSection 
              data={resumeData} 
              onChange={updateResumeField}
            />
            
            <SummarySection 
              data={resumeData.summary} 
              onChange={(value) => updateResumeField('summary', value)}
              onEnhance={() => handleEnhanceSection('summary')}
              isEnhancing={enhancingSection === 'summary'}
            />
            
            <ExperienceSection 
              data={resumeData.experience} 
              onChange={(data) => updateResumeSection('experience', data)}
              onEnhance={() => handleEnhanceSection('experience')}
              isEnhancing={enhancingSection === 'experience'}
            />
            
            <EducationSection 
              data={resumeData.education} 
              onChange={(data) => updateResumeSection('education', data)}
            />
            
            <AchievementsSection 
              data={resumeData.achievements} 
              onChange={(data) => updateResumeSection('achievements', data)}
              onEnhance={() => handleEnhanceSection('achievements')}
              isEnhancing={enhancingSection === 'achievements'}
            />
            
            <SkillsSection 
              data={resumeData.skills} 
              onChange={(data) => updateResumeSection('skills', data)}
              onEnhance={() => handleEnhanceSection('skills')}
              isEnhancing={enhancingSection === 'skills'}
            />
            
            <ProjectsSection 
              data={resumeData.projects} 
              onChange={(data) => updateResumeSection('projects', data)}
              onEnhance={() => handleEnhanceSection('projects')}
              isEnhancing={enhancingSection === 'projects'}
            />
            
            <CoursesSection 
              data={resumeData.courses} 
              onChange={(data) => updateResumeSection('courses', data)}
            />
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default ResumeEditor;