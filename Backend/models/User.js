const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
     // lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },
    location: {
      type: String,
      maxlength: [100, "Location cannot exceed 100 characters"],
      default: "",
    },
    website: {
      type: String,
      maxlength: [200, "Website URL cannot exceed 200 characters"],
      default: "",
    },
    interests: [
      {
        type: String,
        enum: ["technology", "business", "science", "health", "entertainment", "sports", "politics", "world"],
      },
    ],
    socialLinks: {
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      facebook: { type: String, default: "" },
    },
    notificationPreferences: {
      emailDigest: { type: Boolean, default: true },
      breakingNews: { type: Boolean, default: true },
      comments: { type: Boolean, default: false },
      recommendations: { type: Boolean, default: true },
    },
    privacySettings: {
      profileVisibility: {
        type: String,
        enum: ["public", "registered", "private"],
        default: "public",
      },
      showEmail: { type: Boolean, default: false },
      showLocation: { type: Boolean, default: true },
      allowDataCollection: { type: Boolean, default: true },
      allowPersonalization: { type: Boolean, default: true },
      allowThirdPartySharing: { type: Boolean, default: false },
      allowCommentNotifications: { type: Boolean, default: true },
      allowMarketingEmails: { type: Boolean, default: false },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual for profile completion percentage
userSchema.virtual("profileCompletion").get(function () {
  let completedFields = 0
  let totalFields = 0

  // Basic info fields
  const basicFields = ["name", "email", "bio", "location", "website"]
  basicFields.forEach((field) => {
    totalFields++
    if (this[field] && this[field].trim() !== "") completedFields++
  })

  // Interests
  totalFields++
  if (this.interests && this.interests.length > 0) completedFields++

  // Social links
  const socialFields = ["twitter", "linkedin", "facebook"]
  socialFields.forEach((field) => {
    totalFields++
    if (this.socialLinks[field] && this.socialLinks[field].trim() !== "") completedFields++
  })

  // Avatar (counts more)
  totalFields += 2
  if (this.avatar) completedFields += 2

  return Math.round((completedFields / totalFields) * 100)
})

// Index for better query performance
userSchema.index({ email: 1 })
userSchema.index({ interests: 1 })
userSchema.index({ createdAt: -1 })

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  console.log("→ now hashed to:", this.password);
  next();
});



// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date()
  return this.save({ validateBeforeSave: false })
}

module.exports = mongoose.model("User", userSchema)
