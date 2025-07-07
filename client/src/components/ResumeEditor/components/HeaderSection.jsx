import React from 'react';

const HeaderSection = ({ data, onChange }) => {
  const handleInputChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <div className="header-section bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name - Full width */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={data.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your.email@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={data.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn Profile
          </label>
          <input
            type="url"
            value={data.linkedin || ''}
            onChange={(e) => handleInputChange('linkedin', e.target.value)}
            placeholder="linkedin.com/in/yourprofile"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={data.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="City, State/Country"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Validation Messages */}
      <div className="mt-4 space-y-1">
        {!data.name && (
          <p className="text-sm text-red-600">⚠️ Name is required</p>
        )}
        {!data.email && (
          <p className="text-sm text-red-600">⚠️ Email is required</p>
        )}
        {!data.phone && (
          <p className="text-sm text-red-600">⚠️ Phone number is required</p>
        )}
      </div>

      {/* Preview */}
      <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {data.name || 'Your Name'}
          </h1>
          <div className="mt-2 space-y-1 text-gray-600">
            <p>{data.email || 'your.email@example.com'}</p>
            <p>{data.phone || '+1 (555) 123-4567'}</p>
            {data.linkedin && (
              <p className="text-blue-600">{data.linkedin}</p>
            )}
            {data.address && <p>{data.address}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderSection;