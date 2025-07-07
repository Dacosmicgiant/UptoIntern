import React, { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const UploadResume = ({ onClose, onResumeUploaded }) => {
  const [file, setFile] = useState(null);
  const [editType, setEditType] = useState('manual');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    // Check file size
    if (selectedFile.size > maxFileSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Check file type
    const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      toast.error(`Please upload a valid file type: ${allowedTypes.join(', ')}`);
      return;
    }

    setFile(selectedFile);
    toast.success('File selected successfully!');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('editType', editType);

    try {
      setUploading(true);
      
      const loadingToastId = toast.loading(
        editType === 'ai' 
          ? 'Uploading and enhancing your resume with AI...' 
          : 'Uploading and parsing your resume...'
      );

      const response = await axios.post(
        'http://localhost:5000/api/upload/resume',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000 // 60 seconds timeout for large files
        }
      );

      if (response.data.success) {
        const { parsedData, resume } = response.data.data;
        
        toast.update(loadingToastId, {
          render: editType === 'ai' 
            ? 'Resume uploaded and enhanced successfully!' 
            : 'Resume uploaded and parsed successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });

        // Pass the parsed data to parent component
        onResumeUploaded(parsedData);
        
        // Store resume ID if available
        if (resume && resume.id) {
          localStorage.setItem('resumeId', resume.id);
        }
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Failed to upload resume';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Upload timeout. Please try with a smaller file.';
      }
      
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="upload-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">📄</span>
              Upload Resume
            </h2>
            <button
              onClick={onClose}
              disabled={uploading}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Upload your existing resume to get started quickly
          </p>
        </div>

        {/* File Upload Area */}
        <div className="p-6">
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
              ${dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
              ${file ? 'border-green-400 bg-green-50' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />

            {file ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <span className="text-4xl">✅</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={clearFile}
                  disabled={uploading}
                  className="text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <span className="text-4xl">📁</span>
                </div>
                <div>
                  <p className="text-gray-800 font-medium">
                    Drop your resume here or click to browse
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Supports: PDF, DOC, DOCX, TXT (Max 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Edit Type Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose editing preference:
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="editType"
                  value="manual"
                  checked={editType === 'manual'}
                  onChange={(e) => setEditType(e.target.value)}
                  disabled={uploading}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-800">Manual Edit</div>
                  <div className="text-sm text-gray-600">
                    Upload and edit the resume content yourself
                  </div>
                </div>
              </label>
              
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="editType"
                  value="ai"
                  checked={editType === 'ai'}
                  onChange={(e) => setEditType(e.target.value)}
                  disabled={uploading}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-800 flex items-center gap-1">
                    AI Edit
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Let AI automatically improve grammar and enhance content
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200
              ${!file || uploading
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
              }
            `}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload & Parse</span>
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadResume;