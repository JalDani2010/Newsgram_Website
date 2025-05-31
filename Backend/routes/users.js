const express = require("express")
const User = require("../models/User")
const UserActivity = require("../models/UserActivity")
const Bookmark = require("../models/Bookmark")
const bcrypt = require("bcryptjs")
const {  auth } = require("../middleware/auth")
const { validateProfileUpdate } = require("../middleware/validation")
const cloudinaryService = require("../services/cloudinaryService")
const multer = require("multer")

const router = express.Router()

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"), false)
    }
  },
})

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")

    res.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", auth, validateProfileUpdate, async (req, res) => {
  try {
    const updates = req.body

    // Remove sensitive fields that shouldn't be updated here
    delete updates.password
    delete updates.email
    delete updates.role

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password")

    res.json({
      success: true,
      user,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({
      success: false,
      message: error.message ||  "Server error",
    })
  }
})

// @route   POST /api/users/avatar
// @desc    Upload user avatar
// @access  Private
router.post("/avatar", auth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      })
    }

    // Upload to Cloudinary
    const result = await cloudinaryService.uploadImage(req.file.buffer, {
      folder: "avatars",
      public_id: `avatar_${req.user._id}`,
      transformation: [
        { width: 200, height: 200, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    })

    // Update user avatar
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true, runValidators: true },
    )

    res.json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        avatar: result.secure_url,
        user,
      },
    })
  } catch (error) {
    console.error("Avatar upload error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to upload avatar",
    })
  }
})

// @route   DELETE /api/users/avatar
// @desc    Delete user avatar
// @access  Private
router.delete("/avatar", auth, async (req, res) => {
  try {
    // Delete from Cloudinary
    if (req.user.avatar) {
      await cloudinaryService.deleteImage(`avatar_${req.user._id}`)
    }

    // Update user
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: null }, { new: true })

    res.json({
      success: true,
      message: "Avatar deleted successfully",
      data: {
        user,
      },
    })
  } catch (error) {
    console.error("Delete avatar error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete avatar",
    })
  }
})

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      })
    }

    const user = await User.findById(req.user._id)

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update password
    await User.findByIdAndUpdate(req.user._id, {
      password: hashedPassword,
    })

    res.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/users/activity
// @desc    Get user activity history
// @access  Private
router.get("/activity", auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query

    const query = { userId: req.user._id }
    if (type) {
      query.activityType = type
    }

    const activities = await UserActivity.find(query)
      .populate("articleId", "title description imageUrl publishedAt")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await UserActivity.countDocuments(query)

    res.json({
      success: true,
      activities,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get activity error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    const days = Number.parseInt(req.query.days) || 30

    // Get activity stats
    const activityStats = await UserActivity.getUserStats(req.user._id, days)

    // Get bookmark stats
    const bookmarkStats = await Bookmark.getStats(req.user._id)

    // Get reading stats
    const readingStats = await UserActivity.aggregate([
      {
        $match: {
          user: req.user._id,
          action: "view",
          createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    res.json({
      success: true,
      data: {
        activity: activityStats[0] || { totalActivities: 0, activities: [] },
        bookmarks: bookmarkStats[0] || {
          total: 0,
          readLater: 0,
          favorites: 0,
          archived: 0,
          read: 0,
          unread: 0,
        },
        reading: readingStats,
        profileCompletion: req.user.profileCompletion,
      },
    })
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get user statistics",
    })
  }
})

// @route   POST /api/users/deactivate
// @desc    Deactivate user account
// @access  Private
router.post("/deactivate", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false })

    res.json({
      success: true,
      message: "Account deactivated successfully",
    })
  } catch (error) {
    console.error("Deactivate account error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to deactivate account",
    })
  }
})

// @route   DELETE /api/users/account
// @desc    Delete user account permanently
// @access  Private
router.delete("/account", auth, async (req, res) => {
  console.log("🎯 DELETE /account route hit")
  console.log("🔍 User ID from auth:", req.user._id)
  console.log("🔍 Request body:", req.body)

  try {
    const { password } = req.body

    // Check if password is provided
    if (!password) {
      console.log("❌ No password provided")
      return res.status(400).json({
        success: false,
        message: "Password is required to delete account",
      })
    }

    console.log("🔍 Password received:", password ? "Present" : "Missing")

    // IMPORTANT: Explicitly select the password field
    const user = await User.findById(req.user._id).select("+password")
    console.log("👤 User found:", user ? "YES" : "NO")
    console.log("🔐 User password hash:", user?.password ? "Present" : "Missing")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Additional validation
    if (!user.password) {
      console.log("❌ User password hash is missing from database")
      return res.status(500).json({
        success: false,
        message: "User password data is corrupted",
      })
    }

    // Verify password
    console.log("🔐 Comparing passwords...")
    const isMatch = await bcrypt.compare(password, user.password)
    console.log("🔐 Password match:", isMatch)

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      })
    }

    console.log("🗑️ Starting account deletion...")

    // Delete user data
    await Promise.all([
      User.findByIdAndDelete(req.user._id),
      UserActivity.deleteMany({ userId: req.user._id }),
      Bookmark.deleteMany({ user: req.user._id }),
    ])

    // Delete avatar from Cloudinary
    if (user.avatar) {
      try {
        await cloudinaryService.deleteImage(`avatar_${req.user._id}`)
      } catch (cloudinaryError) {
        console.log("⚠️ Failed to delete avatar from Cloudinary:", cloudinaryError.message)
        // Don't fail the entire operation for this
      }
    }

    console.log("✅ Account deletion completed")

    res.json({
      success: true,
      message: "Account deleted successfully",
    })
  } catch (error) {
    console.error("❌ Delete account error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete account",
    })
  }
})

// @route   GET /api/users/export
// @desc    Export user data
// @access  Private
router.get("/export", auth, async (req, res) => {
  try {
    // Get user data
    const user = await User.findById(req.user._id)

    // Get user activities
    const activities = await UserActivity.find({ userId: req.user._id }).populate("articleId", "title")

    // Get bookmarks
    const bookmarks = await Bookmark.find({ user: req.user._id }).populate("articleId", "title description")

    const exportData = {
      user: {
        name: user.name,
        email: user.email,
        bio: user.bio,
        location: user.location,
        website: user.website,
        interests: user.interests,
        socialLinks: user.socialLinks,
        joinDate: user.createdAt,
      },
      activities: activities.map((activity) => ({
        action: activity.action,
        article: activity.articleId?.title,
        date: activity.createdAt,
        metadata: activity.metadata,
      })),
      bookmarks: bookmarks.map((bookmark) => ({
        article: bookmark.articleId?.title,
        category: bookmark.category,
        notes: bookmark.notes,
        tags: bookmark.tags,
        isRead: bookmark.isRead,
        date: bookmark.createdAt,
      })),
      exportDate: new Date(),
    }

    res.json({
      success: true,
      data: exportData,
    })
  } catch (error) {
    console.error("Export data error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to export user data",
    })
  }
})

module.exports = router
