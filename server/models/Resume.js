const mongoose = require("mongoose");

// Standard Resume Schema following the project requirements
const resumeSchema = new mongoose.Schema({
  // Basic Information (Required)
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"]
  },
  role: {
    type: String,
    required: [true, "Role is required"],
    trim: true,
    maxlength: [200, "Role cannot exceed 200 characters"]
  },
  phone: {
    type: String,
    required: [true, "Phone is required"],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  linkedin: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w\-_]+\/?$/.test(v);
      },
      message: "Please enter a valid LinkedIn URL"
    }
  },
  location: {
    type: String,
    required: [true, "Location is required"],
    trim: true,
    maxlength: [100, "Location cannot exceed 100 characters"]
  },

  // Professional Summary
  summary: {
    type: String,
    required: [true, "Summary is required"],
    trim: true,
    minlength: [50, "Summary should be at least 50 characters"],
    maxlength: [1000, "Summary cannot exceed 1000 characters"]
  },

  // Work Experience
  experience: [{
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [100, "Job title cannot exceed 100 characters"]
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"]
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      trim: true,
      maxlength: [50, "Date cannot exceed 50 characters"]
    },
    companyLocation: {
      type: String,
      required: [true, "Company location is required"],
      trim: true,
      maxlength: [100, "Company location cannot exceed 100 characters"]
    },
    accomplishment: [{
      type: String,
      trim: true,
      maxlength: [500, "Accomplishment cannot exceed 500 characters"]
    }]
  }],

  // Education
  education: [{
    degree: {
      type: String,
      required: [true, "Degree is required"],
      trim: true,
      maxlength: [100, "Degree cannot exceed 100 characters"]
    },
    institution: {
      type: String,
      required: [true, "Institution is required"],
      trim: true,
      maxlength: [100, "Institution cannot exceed 100 characters"]
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true,
      maxlength: [50, "Duration cannot exceed 50 characters"]
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"]
    }
  }],

  // Achievements
  achievements: [{
    keyAchievements: {
      type: String,
      required: [true, "Achievement title is required"],
      trim: true,
      maxlength: [100, "Achievement title cannot exceed 100 characters"]
    },
    describe: {
      type: String,
      required: [true, "Achievement description is required"],
      trim: true,
      maxlength: [500, "Achievement description cannot exceed 500 characters"]
    }
  }],

  // Skills
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, "Skill cannot exceed 50 characters"]
  }],

  // Languages
  languages: [{
    type: String,
    trim: true,
    maxlength: [50, "Language cannot exceed 50 characters"]
  }],

  // Projects
  projects: [{
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [100, "Project title cannot exceed 100 characters"]
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
      maxlength: [500, "Project description cannot exceed 500 characters"]
    },
    duration: {
      type: String,
      trim: true,
      maxlength: [50, "Project duration cannot exceed 50 characters"]
    }
  }],

  // Courses
  courses: [{
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [100, "Course title cannot exceed 100 characters"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Course description cannot exceed 500 characters"]
    }
  }],

  // Certifications
  certifications: [{
    title: {
      type: String,
      required: [true, "Certification title is required"],
      trim: true,
      maxlength: [100, "Certification title cannot exceed 100 characters"]
    },
    issuedBy: {
      type: String,
      trim: true,
      maxlength: [100, "Issuer cannot exceed 100 characters"]
    },
    year: {
      type: String,
      trim: true,
      maxlength: [20, "Year cannot exceed 20 characters"]
    }
  }],

  // Hobbies (Optional)
  hobbies: [{
    type: String,
    trim: true,
    maxlength: [50, "Hobby cannot exceed 50 characters"]
  }],

  // Template Selection
  template: {
    type: String,
    default: "modern",
    enum: ["modern", "classic", "creative", "professional", "minimal"]
  },

  // User Association
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // Allow anonymous resumes
  },

  // Version Control
  version: {
    type: Number,
    default: 1
  },

  // Status
  status: {
    type: String,
    enum: ["draft", "completed", "published"],
    default: "draft"
  },

  // Enhancement History
  enhancementHistory: [{
    section: String,
    originalContent: String,
    enhancedContent: String,
    enhancedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Metadata
  isPublic: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name display
resumeSchema.virtual("displayName").get(function() {
  return this.name || "Anonymous User";
});

// Pre-save middleware
resumeSchema.pre("save", function(next) {
  this.lastModified = new Date();
  
  // Generate share token if public
  if (this.isPublic && !this.shareToken) {
    this.shareToken = require("crypto").randomBytes(32).toString("hex");
  }
  
  next();
});

// Method to check if resume is complete
resumeSchema.methods.isComplete = function() {
  return !!(
    this.name && 
    this.email && 
    this.phone && 
    this.role && 
    this.summary && 
    this.experience?.length > 0 &&
    this.education?.length > 0
  );
};

// Method to get resume completeness percentage
resumeSchema.methods.getCompletenessPercentage = function() {
  let score = 0;
  const totalFields = 10;
  
  if (this.name) score++;
  if (this.email) score++;
  if (this.phone) score++;
  if (this.role) score++;
  if (this.summary) score++;
  if (this.experience?.length > 0) score++;
  if (this.education?.length > 0) score++;
  if (this.skills?.length > 0) score++;
  if (this.achievements?.length > 0) score++;
  if (this.projects?.length > 0) score++;
  
  return Math.round((score / totalFields) * 100);
};

// Static method to find by email or ID
resumeSchema.statics.findByIdentifier = function(identifier) {
  const isEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(identifier);
  const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
  
  if (isEmail) {
    return this.findOne({ email: identifier });
  } else if (isObjectId) {
    return this.findById(identifier);
  } else {
    return null;
  }
};

module.exports = mongoose.model("Resume", resumeSchema);