import React from 'react';

const ActionButtons = ({ 
  onSave, 
  onDownload, 
  onShare, 
  onUpload, 
  isLoading, 
  isDownloading 
}) => {
  return (
    <div className="action-buttons flex items-center gap-3 flex-wrap">
      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg active:scale-95'
          } 
          text-white
        `}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Saving...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Save</span>
          </>
        )}
      </button>

      {/* Download Button */}
      <button
        onClick={onDownload}
        disabled={isDownloading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${isDownloading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg active:scale-95'
          } 
          text-white
        `}
      >
        {isDownloading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Downloading...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download PDF</span>
          </>
        )}
      </button>

      {/* Share Button */}
      <button
        onClick={onShare}
        className="
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          bg-purple-500 hover:bg-purple-600 text-white shadow-md hover:shadow-lg active:scale-95
        "
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
        <span>Share</span>
      </button>

      {/* Upload Button */}
      <button
        onClick={onUpload}
        className="
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg active:scale-95
        "
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span>Upload Resume</span>
      </button>

      {/* Mobile responsive separator */}
      <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
      
      {/* Quick Actions Info */}
      <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          <span>Auto-save enabled</span>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;