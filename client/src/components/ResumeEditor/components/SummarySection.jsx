import React, { useState } from 'react';

const SummarySection = ({ data, onChange, onEnhance, isEnhancing }) => {
  const [charCount, setCharCount] = useState(data?.length || 0);
  const maxChars = 500;

  const handleTextChange = (value) => {
    setCharCount(value.length);
    onChange(value);
  };

  const handleEnhanceClick = () => {
    if (!data || data.trim().length === 0) {
      alert('Please write some content first before enhancing');
      return;
    }
    onEnhance();
  };

  return (
    <div className="summary-section bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-lg">📝</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Professional Summary
            </h2>
            <p className="text-sm text-gray-600">
              Brief overview of your experience and goals
            </p>
          </div>
        </div>

        {/* Enhance Button */}
        <button
          onClick={handleEnhanceClick}
          disabled={isEnhancing || !data || data.trim().length === 0}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${isEnhancing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : data && data.trim().length > 0
                ? 'bg-purple-500 hover:bg-purple-600 shadow-md hover:shadow-lg active:scale-95'
                : 'bg-gray-300 cursor-not-allowed'
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

      {/* Text Area */}
      <div className="space-y-3">
        <textarea
          value={data || ''}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Write a brief professional summary highlighting your key skills, experience, and career objectives. This should be 3-4 sentences that capture your professional identity and value proposition."
          maxLength={maxChars}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          disabled={isEnhancing}
        />

        {/* Character Count */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <span className={`
              ${charCount > maxChars * 0.9 
                ? 'text-red-600' 
                : charCount > maxChars * 0.7 
                  ? 'text-yellow-600' 
                  : 'text-gray-500'
              }
            `}>
              {charCount}/{maxChars} characters
            </span>
            
            {charCount > 0 && (
              <span className="text-gray-500">
                ~{Math.ceil(charCount / 5)} words
              </span>
            )}
          </div>

          {/* Enhancement Status */}
          {isEnhancing && (
            <div className="flex items-center gap-2 text-purple-600">
              <div className="animate-pulse w-2 h-2 bg-purple-600 rounded-full"></div>
              <span>AI is enhancing your summary...</span>
            </div>
          )}
        </div>
      </div>

      {/* Writing Tips */}
      {(!data || data.trim().length === 0) && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">💡 Writing Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Start with your professional title and years of experience</li>
            <li>• Highlight 2-3 key skills or specializations</li>
            <li>• Mention your biggest achievement or impact</li>
            <li>• End with your career objective or what you're seeking</li>
          </ul>
        </div>
      )}

      {/* Example Summary */}
      {(!data || data.trim().length === 0) && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">📋 Example:</h3>
          <p className="text-sm text-gray-600 italic">
            "Experienced Full-Stack Developer with 5+ years of expertise in React, Node.js, and cloud technologies. 
            Led development of scalable web applications serving 100K+ users, resulting in 30% improved performance. 
            Passionate about creating innovative solutions and seeking opportunities to drive digital transformation 
            in a forward-thinking technology company."
          </p>
          <button
            onClick={() => handleTextChange("Experienced Full-Stack Developer with 5+ years of expertise in React, Node.js, and cloud technologies. Led development of scalable web applications serving 100K+ users, resulting in 30% improved performance. Passionate about creating innovative solutions and seeking opportunities to drive digital transformation in a forward-thinking technology company.")}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Use this example
          </button>
        </div>
      )}

      {/* Preview */}
      {data && data.trim().length > 0 && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">📄 Preview:</h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-800 leading-relaxed">{data}</p>
          </div>
        </div>
      )}

      {/* Enhancement History */}
      {data && data.trim().length > 0 && (
        <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          <span>Content ready for enhancement</span>
        </div>
      )}
    </div>
  );
};

export default SummarySection;