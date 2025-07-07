const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs").promises;
const os = require("os");

/**
 * Modern Resume Template HTML Generator
 */
const generateModernTemplate = (resumeData) => {
  const {
    name = "Your Name",
    role = "Your Role",
    phone = "",
    email = "",
    linkedin = "",
    location = "",
    summary = "",
    experience = [],
    education = [],
    skills = [],
    achievements = [],
    projects = [],
    languages = [],
    certifications = [],
    courses = []
  } = resumeData;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Resume</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.4;
            color: #333;
            font-size: 12px;
        }
        
        .container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            display: flex;
            min-height: 297mm;
        }
        
        .sidebar {
            width: 35%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
        }
        
        .main-content {
            width: 65%;
            padding: 30px 25px;
        }
        
        .profile-img {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            font-weight: bold;
        }
        
        .name {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 5px;
        }
        
        .title {
            font-size: 14px;
            text-align: center;
            opacity: 0.9;
            margin-bottom: 25px;
        }
        
        .contact-info {
            margin-bottom: 25px;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            font-size: 11px;
        }
        
        .contact-icon {
            width: 16px;
            height: 16px;
            margin-right: 10px;
            background: rgba(255,255,255,0.2);
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .sidebar-section {
            margin-bottom: 25px;
        }
        
        .sidebar-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 12px;
            padding-bottom: 5px;
            border-bottom: 2px solid rgba(255,255,255,0.3);
        }
        
        .skills-list {
            list-style: none;
        }
        
        .skill-item {
            margin-bottom: 6px;
            font-size: 11px;
        }
        
        .skill-bar {
            width: 100%;
            height: 4px;
            background: rgba(255,255,255,0.2);
            border-radius: 2px;
            margin-top: 3px;
        }
        
        .skill-progress {
            height: 100%;
            background: white;
            border-radius: 2px;
            width: 85%;
        }
        
        .main-title {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 8px;
        }
        
        .main-subtitle {
            font-size: 16px;
            color: #7f8c8d;
            margin-bottom: 20px;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 12px;
            padding-bottom: 5px;
            border-bottom: 2px solid #667eea;
        }
        
        .summary {
            font-size: 12px;
            line-height: 1.5;
            color: #555;
            text-align: justify;
        }
        
        .experience-item, .education-item, .project-item {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
        }
        
        .experience-item:last-child, .education-item:last-child, .project-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .job-title, .degree-title, .project-title {
            font-size: 14px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 3px;
        }
        
        .company-name, .institution-name {
            font-size: 12px;
            color: #667eea;
            font-weight: 600;
            margin-bottom: 2px;
        }
        
        .date-location {
            font-size: 10px;
            color: #7f8c8d;
            margin-bottom: 8px;
        }
        
        .accomplishments {
            list-style: none;
            padding-left: 0;
        }
        
        .accomplishment-item {
            font-size: 11px;
            line-height: 1.4;
            margin-bottom: 4px;
            padding-left: 12px;
            position: relative;
        }
        
        .accomplishment-item::before {
            content: "•";
            color: #667eea;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        
        .achievements-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
        }
        
        .achievement-item {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 5px;
            border-left: 3px solid #667eea;
        }
        
        .achievement-title {
            font-size: 12px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 4px;
        }
        
        .achievement-desc {
            font-size: 11px;
            color: #555;
            line-height: 1.4;
        }
        
        .languages-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .language-item {
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
            padding: 4px 8px;
            border-radius: 15px;
            font-size: 10px;
            font-weight: 500;
        }
        
        @media print {
            .container {
                box-shadow: none;
                margin: 0;
                width: 100%;
            }
            
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="sidebar">
            <div class="profile-img">${name.charAt(0).toUpperCase()}</div>
            <div class="name">${name}</div>
            <div class="title">${role}</div>
            
            <div class="contact-info">
                ${phone ? `<div class="contact-item"><div class="contact-icon">📞</div>${phone}</div>` : ''}
                ${email ? `<div class="contact-item"><div class="contact-icon">✉️</div>${email}</div>` : ''}
                ${location ? `<div class="contact-item"><div class="contact-icon">📍</div>${location}</div>` : ''}
                ${linkedin ? `<div class="contact-item"><div class="contact-icon">💼</div>${linkedin}</div>` : ''}
            </div>
            
            ${skills.length > 0 ? `
            <div class="sidebar-section">
                <div class="sidebar-title">Skills</div>
                <ul class="skills-list">
                    ${skills.map(skill => `
                        <li class="skill-item">
                            ${skill}
                            <div class="skill-bar">
                                <div class="skill-progress"></div>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
            ` : ''}
            
            ${languages.length > 0 ? `
            <div class="sidebar-section">
                <div class="sidebar-title">Languages</div>
                <div class="languages-list">
                    ${languages.map(lang => `<span class="language-item">${lang}</span>`).join('')}
                </div>
            </div>
            ` : ''}
            
            ${certifications.length > 0 ? `
            <div class="sidebar-section">
                <div class="sidebar-title">Certifications</div>
                ${certifications.map(cert => `
                    <div style="margin-bottom: 8px; font-size: 11px;">
                        <div style="font-weight: bold;">${cert.title || cert}</div>
                        ${cert.issuedBy ? `<div style="opacity: 0.8; font-size: 10px;">${cert.issuedBy}</div>` : ''}
                        ${cert.year ? `<div style="opacity: 0.8; font-size: 10px;">${cert.year}</div>` : ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}
        </div>
        
        <div class="main-content">
            <div class="main-title">${name}</div>
            <div class="main-subtitle">${role}</div>
            
            ${summary ? `
            <div class="section">
                <div class="section-title">Professional Summary</div>
                <div class="summary">${summary}</div>
            </div>
            ` : ''}
            
            ${experience.length > 0 ? `
            <div class="section">
                <div class="section-title">Professional Experience</div>
                ${experience.map(exp => `
                    <div class="experience-item">
                        <div class="job-title">${exp.title || 'Job Title'}</div>
                        <div class="company-name">${exp.companyName || 'Company Name'}</div>
                        <div class="date-location">${exp.date || 'Date'} • ${exp.companyLocation || 'Location'}</div>
                        ${exp.accomplishment && exp.accomplishment.length > 0 ? `
                        <ul class="accomplishments">
                            ${exp.accomplishment.map(acc => `<li class="accomplishment-item">${acc}</li>`).join('')}
                        </ul>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${education.length > 0 ? `
            <div class="section">
                <div class="section-title">Education</div>
                ${education.map(edu => `
                    <div class="education-item">
                        <div class="degree-title">${edu.degree || 'Degree'}</div>
                        <div class="institution-name">${edu.institution || 'Institution'}</div>
                        <div class="date-location">${edu.duration || 'Duration'} • ${edu.location || 'Location'}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${projects.length > 0 ? `
            <div class="section">
                <div class="section-title">Projects</div>
                ${projects.map(project => `
                    <div class="project-item">
                        <div class="project-title">${project.title || 'Project Title'}</div>
                        ${project.duration ? `<div class="date-location">${project.duration}</div>` : ''}
                        <div class="accomplishment-item">${project.description || 'Project description'}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${achievements.length > 0 ? `
            <div class="section">
                <div class="section-title">Key Achievements</div>
                <div class="achievements-grid">
                    ${achievements.map(achievement => `
                        <div class="achievement-item">
                            <div class="achievement-title">${achievement.keyAchievements || 'Achievement'}</div>
                            <div class="achievement-desc">${achievement.describe || 'Achievement description'}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${courses.length > 0 ? `
            <div class="section">
                <div class="section-title">Courses & Training</div>
                ${courses.map(course => `
                    <div style="margin-bottom: 10px;">
                        <div style="font-weight: bold; font-size: 12px; color: #2c3e50;">${course.title || course}</div>
                        ${course.description ? `<div style="font-size: 11px; color: #555; margin-top: 2px;">${course.description}</div>` : ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}
        </div>
    </div>
</body>
</html>
  `;
};

/**
 * Generate PDF from resume data
 * @param {Object} resumeData - Resume data object
 * @param {string} template - Template type (default: 'modern')
 * @returns {Promise<Buffer>} PDF buffer
 */
const generatePDF = async (resumeData, template = "modern") => {
  let browser;
  let tempDir;
  
  try {
    // Create temporary directory for this PDF generation session
    tempDir = path.join(
      os.tmpdir(),
      `resume_pdf_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    );

    // Generate HTML content based on template
    let htmlContent;
    switch (template) {
      case "modern":
      default:
        htmlContent = generateModernTemplate(resumeData);
        break;
    }

    // Launch Puppeteer with optimized settings
    const puppeteerOptions = {
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        `--user-data-dir=${tempDir}`
      ],
      timeout: 60000
    };

    // Use custom executable path if provided
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      puppeteerOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    browser = await puppeteer.launch(puppeteerOptions);
    const page = await browser.newPage();

    // Set page content with improved error handling
    await page.setContent(htmlContent, { 
      waitUntil: "networkidle0",
      timeout: 30000
    });

    // Set viewport for consistent rendering
    await page.setViewport({ 
      width: 1200, 
      height: 1600,
      deviceScaleFactor: 2
    });

    // Generate PDF with high quality settings
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "10mm",
        right: "10mm", 
        bottom: "10mm",
        left: "10mm"
      },
      displayHeaderFooter: false,
      timeout: 30000
    });

    console.log(`✅ PDF generated successfully for ${resumeData.name || 'Unknown'}`);
    return pdfBuffer;

  } catch (error) {
    console.error("❌ Error generating PDF:", error.message);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  } finally {
    // Clean up browser and temporary directory
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.warn("Warning: Failed to close browser:", closeError.message);
      }
    }

    if (tempDir) {
      try {
        await fs.rmdir(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.warn("Warning: Failed to clean up temporary directory:", cleanupError.message);
      }
    }
  }
};

/**
 * Get available PDF templates
 * @returns {Array} List of available templates
 */
const getAvailableTemplates = () => {
  return [
    {
      id: "modern",
      name: "Modern Professional",
      description: "Clean, modern design with sidebar layout",
      preview: "/templates/modern-preview.jpg",
      isDefault: true
    },
    {
      id: "classic",
      name: "Classic Professional", 
      description: "Traditional single-column layout",
      preview: "/templates/classic-preview.jpg",
      isDefault: false
    },
    {
      id: "creative",
      name: "Creative Design",
      description: "Creative layout with visual elements",
      preview: "/templates/creative-preview.jpg", 
      isDefault: false
    }
  ];
};

/**
 * Validate resume data for PDF generation
 * @param {Object} resumeData - Resume data to validate
 * @returns {Object} Validation result
 */
const validateResumeData = (resumeData) => {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!resumeData.name || resumeData.name.trim() === "") {
    errors.push("Name is required");
  }

  if (!resumeData.email || resumeData.email.trim() === "") {
    errors.push("Email is required");
  }

  // Recommended fields
  if (!resumeData.phone || resumeData.phone.trim() === "") {
    warnings.push("Phone number is recommended");
  }

  if (!resumeData.summary || resumeData.summary.trim() === "") {
    warnings.push("Professional summary is recommended");
  }

  if (!resumeData.experience || resumeData.experience.length === 0) {
    warnings.push("Work experience is recommended");
  }

  if (!resumeData.education || resumeData.education.length === 0) {
    warnings.push("Education information is recommended");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completeness: calculateCompleteness(resumeData)
  };
};

/**
 * Calculate resume completeness percentage
 * @param {Object} resumeData - Resume data
 * @returns {number} Completeness percentage
 */
const calculateCompleteness = (resumeData) => {
  const fields = [
    'name', 'email', 'phone', 'role', 'summary', 
    'experience', 'education', 'skills'
  ];
  
  let score = 0;
  fields.forEach(field => {
    if (resumeData[field] && 
        (Array.isArray(resumeData[field]) ? resumeData[field].length > 0 : resumeData[field].trim() !== "")) {
      score++;
    }
  });
  
  return Math.round((score / fields.length) * 100);
};

/**
 * Get PDF generation status and capabilities
 * @returns {Object} Service status
 */
const getPDFServiceStatus = () => {
  return {
    isAvailable: true,
    engine: "Puppeteer",
    formats: ["PDF"],
    templates: getAvailableTemplates(),
    maxFileSize: "10MB",
    features: [
      "High-quality PDF generation",
      "Multiple template options",
      "Print-ready formatting",
      "ATS-friendly layouts",
      "Custom branding support"
    ]
  };
};

module.exports = {
  generatePDF,
  getAvailableTemplates,
  validateResumeData,
  calculateCompleteness,
  getPDFServiceStatus
};