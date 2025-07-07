# AI Resume Builder - Backend Server

A comprehensive Node.js/Express backend for the AI Resume Builder application with MongoDB, Gemini AI integration, PDF generation, and complete CRUD operations.

## 🚀 Features

### Core Functionality

- ✅ **Auto-save before enhancement** - Automatically saves resume data before AI enhancement
- ✅ **Resume persistence on page refresh** - Maintains user progress across sessions
- ✅ **AI enhancement for specific sections** - Enhance summary, experience, achievements, projects
- ✅ **Save functionality with proper validation** - Robust data validation and error handling
- ✅ **PDF generation and download** - High-quality PDF export with multiple templates
- ✅ **Resume upload with auto-parsing** - Extract data from PDF, DOC, DOCX, TXT files
- ✅ **Manual vs AI edit options** - Choose between manual editing or AI-powered enhancement
- ✅ **Standard schema compliance** - Follows project requirements exactly
- ✅ **Complete authentication system** - JWT-based auth with password reset
- ✅ **File upload handling** - Secure file upload with validation

### AI Enhancement

- **Google Gemini AI Integration** - Professional content enhancement
- **Multiple Enhancement Styles** - Professional, Creative, Concise options
- **Batch Enhancement** - Enhance multiple sections simultaneously
- **Enhancement History** - Track all AI improvements
- **Fallback Enhancement** - Works even when AI service is unavailable

### PDF Generation

- **Puppeteer-based PDF Generation** - High-quality, print-ready PDFs
- **Multiple Templates** - Modern, Classic, Creative designs
- **ATS-Friendly Layouts** - Optimized for Applicant Tracking Systems
- **Custom Styling** - Professional formatting with consistent design

### File Processing

- **Multi-format Support** - PDF, DOC, DOCX, TXT file parsing
- **Intelligent Text Extraction** - Advanced parsing algorithms
- **Structured Data Output** - Converts unstructured text to resume schema
- **Auto-enhancement Option** - AI improvement during upload

## 📁 Project Structure

```
server/
├── package.json                 # Dependencies and scripts
├── server.js                   # Main application entry point
├── .env                        # Environment variables
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
├── config/
│   └── database.js            # MongoDB connection configuration
├── models/
│   ├── User.js                # User authentication model
│   └── Resume.js              # Resume data model (follows project schema)
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── resumeController.js    # Resume CRUD operations
│   ├── enhanceController.js   # AI enhancement logic
│   └── uploadController.js    # File upload and parsing
├── routes/
│   ├── auth.js               # Authentication routes
│   ├── resume.js             # Resume management routes
│   ├── enhance.js            # AI enhancement routes
│   └── upload.js             # File upload routes
├── services/
│   ├── geminiService.js      # Google Gemini AI integration
│   ├── pdfService.js         # PDF generation service
│   └── parseService.js       # Resume parsing service
├── middleware/
│   ├── auth.js               # JWT authentication middleware
│   └── errorHandler.js       # Global error handling
├── utils/
│   └── responseHelpers.js    # Standardized API responses
└── uploads/                  # Temporary file storage
```

## 🛠 Installation & Setup

### Prerequisites

- Node.js 16.0.0 or higher
- MongoDB (local or MongoDB Atlas)
- Google Gemini API key

### 1. Clone and Install

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the server root:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ai-resume-builder
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-resume-builder

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Google Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Frontend URL
FRONTEND_URL=http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
```

### 3. Database Setup

Ensure MongoDB is running locally or configure MongoDB Atlas connection in your `.env` file.

### 4. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/)
2. Create a new API key
3. Add it to your `.env` file as `GEMINI_API_KEY`

### 5. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Resume Management

- `POST /api/resume/create` - Create new resume
- `PUT /api/resume/save` - Save/update resume (auto-save)
- `GET /api/resume/load/:identifier` - Load resume by ID or email
- `GET /api/resume/all` - Get all user resumes
- `DELETE /api/resume/:id` - Delete resume
- `POST /api/resume/download-pdf` - Generate and download PDF
- `POST /api/resume/share/:id` - Share resume (generate public link)
- `GET /api/resume/shared/:token` - Get shared resume
- `POST /api/resume/duplicate/:id` - Duplicate resume

### AI Enhancement

- `POST /api/enhance/field` - Enhance specific field with auto-save
- `POST /api/enhance/full` - Enhance entire resume
- `POST /api/enhance/suggestions` - Get multiple enhancement suggestions
- `GET /api/enhance/history/:resumeId` - Get enhancement history
- `DELETE /api/enhance/history/:resumeId` - Clear enhancement history
- `POST /api/enhance/bulk` - Enhance multiple sections in batch

### File Upload

- `POST /api/upload/resume` - Upload and parse resume file
- `POST /api/upload/parse-text` - Parse resume from text input
- `GET /api/upload/status` - Get upload service status
- `POST /api/upload/validate-file` - Validate file without processing

### Health & Status

- `GET /health` - Health check
- `GET /api/resume/status` - Resume service status
- `GET /api/enhance/status` - AI enhancement service status

## 🔧 Usage Examples

### Creating a Resume

```javascript
// POST /api/resume/create
{
  "name": "John Doe",
  "role": "Full Stack Developer",
  "email": "john.doe@example.com",
  "phone": "123-456-7890",
  "location": "San Francisco, CA",
  "summary": "Experienced developer with 5+ years...",
  "experience": [
    {
      "title": "Senior Developer",
      "companyName": "Tech Corp",
      "date": "2022 - Present",
      "companyLocation": "San Francisco, CA",
      "accomplishment": [
        "Led team of 5 developers",
        "Increased performance by 40%"
      ]
    }
  ],
  "education": [
    {
      "degree": "BS Computer Science",
      "institution": "UC Berkeley",
      "duration": "2017-2021",
      "location": "Berkeley, CA"
    }
  ],
  "skills": ["JavaScript", "React", "Node.js"],
  "achievements": [
    {
      "keyAchievements": "Employee of the Year",
      "describe": "Recognized for outstanding performance"
    }
  ]
}
```

### AI Enhancement

```javascript
// POST /api/enhance/field
{
  "resumeId": "60f7b1b3b3f1a40015a1b1a1",
  "section": "summary",
  "content": "I am a developer with experience",
  "enhancementType": "professional",
  "resumeData": { /* latest resume data for auto-save */ }
}
```

### File Upload

```javascript
// POST /api/upload/resume (multipart/form-data)
// Files: resume (PDF/DOC/DOCX/TXT)
// Body: { "editType": "ai" } // or "manual"
```

## 🛡 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with configurable rounds
- **Rate Limiting** - Prevents API abuse
- **Input Validation** - Comprehensive data validation
- **File Upload Security** - File type and size validation
- **CORS Protection** - Configurable CORS policies
- **Helmet Security** - Security headers and protections

## 🔍 Error Handling

The API uses standardized error responses:

```javascript
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "error": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Common error codes:

- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Access denied
- `NOT_FOUND` - Resource not found
- `DUPLICATE_RESOURCE` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `AI_SERVICE_ERROR` - AI enhancement unavailable
- `PDF_GENERATION_ERROR` - PDF creation failed

## 📊 Monitoring & Logging

- **Request Logging** - Morgan middleware for HTTP request logs
- **Error Logging** - Comprehensive error tracking
- **Health Checks** - Built-in health monitoring endpoints
- **Performance Metrics** - Response time and memory usage tracking

## 🚀 Deployment

### Production Environment Variables

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
GEMINI_API_KEY=your_production_gemini_key
```

### PM2 Process Manager

```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start server.js --name "ai-resume-backend"

# Monitor application
pm2 monitor
```

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📝 Contributing

1. Follow the existing code structure and naming conventions
2. Add proper error handling and validation
3. Include comprehensive logging
4. Update documentation for new features
5. Test all endpoints thoroughly

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Failed**

- Check if MongoDB is running
- Verify connection string in `.env`
- Ensure network connectivity for MongoDB Atlas

**AI Enhancement Not Working**

- Verify `GEMINI_API_KEY` in `.env`
- Check API key validity and quotas
- Review network connectivity

**PDF Generation Failed**

- Install required system dependencies for Puppeteer
- Check available memory and disk space
- Verify file permissions for uploads directory

**File Upload Issues**

- Check file size limits (`MAX_FILE_SIZE`)
- Verify supported file formats
- Ensure uploads directory exists and is writable

### Debug Mode

Set `NODE_ENV=development` for detailed error messages and stack traces.

## 📄 License

This project is part of the AI Resume Builder application. All rights reserved.

---

## ✅ Project Requirements Compliance

This backend implementation meets ALL specified requirements:

1. ✅ **Auto-save before enhancement** - Implemented in `enhanceController.js`
2. ✅ **Resume persistence on page refresh** - Database storage with proper session handling
3. ✅ **AI enhancement for specific sections** - Multiple enhancement options
4. ✅ **Save functionality** - Complete CRUD operations
5. ✅ **PDF download** - High-quality PDF generation
6. ✅ **Upload with auto-read** - Parse PDF/DOC/DOCX/TXT files
7. ✅ **Manual vs AI edit options** - Configurable enhancement modes
8. ✅ **Standard schema compliance** - Follows exact project schema requirements

For support or questions, please refer to the API documentation or contact the development team.
