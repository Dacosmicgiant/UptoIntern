const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
    maxlength: [50, "Name cannot exceed 50 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  preferences: {
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system"
    },
    notifications: {
      type: Boolean,
      default: true
    },
    defaultTemplate: {
      type: String,
      default: "modern"
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free"
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  verificationToken: String,
  verificationExpires: Date,
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      delete ret.verificationToken;
      delete ret.verificationExpires;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Virtual for account lock status
userSchema.virtual("isLocked").get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for full display name
userSchema.virtual("displayName").get(function() {
  return this.name || this.email.split("@")[0];
});

// Pre-save middleware to hash password
userSchema.pre("save", async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  const payload = {
    user: {
      id: this._id,
      email: this.email,
      role: this.role
    }
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Instance method to generate password reset token
userSchema.methods.generateResetToken = function() {
  const crypto = require("crypto");
  const token = crypto.randomBytes(32).toString("hex");
  
  this.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return token;
};

// Instance method to generate verification token
userSchema.methods.generateVerificationToken = function() {
  const crypto = require("crypto");
  const token = crypto.randomBytes(32).toString("hex");
  
  this.verificationToken = crypto.createHash("sha256").update(token).digest("hex");
  this.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return token;
};

// Static method to increase failed login attempts
userSchema.statics.increaseFailedAttempts = async function(userId) {
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  const user = await this.findById(userId);
  if (!user) return;

  user.loginAttempts += 1;

  if (user.loginAttempts >= maxAttempts) {
    user.lockUntil = Date.now() + lockTime;
  }

  await user.save();
};

// Static method to reset failed login attempts
userSchema.statics.resetFailedAttempts = async function(userId) {
  await this.findByIdAndUpdate(userId, {
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find user by reset token
userSchema.statics.findByResetToken = function(token) {
  const crypto = require("crypto");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  
  return this.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });
};

// Static method to find user by verification token
userSchema.statics.findByVerificationToken = function(token) {
  const crypto = require("crypto");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  
  return this.findOne({
    verificationToken: hashedToken,
    verificationExpires: { $gt: Date.now() }
  });
};

// Method to check if user can create more resumes
userSchema.methods.canCreateResume = function() {
  const limits = {
    free: 3,
    pro: 50,
    enterprise: -1 // unlimited
  };
  
  const userLimit = limits[this.subscription.plan] || limits.free;
  return userLimit === -1 || this.resumeCount < userLimit;
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

module.exports = mongoose.model("User", userSchema);