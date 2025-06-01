const mongoose = require("mongoose")

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["read_later", "favorite", "archive"],
      default: "read_later",
      index: true,
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Tag cannot exceed 50 characters"],
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Compound indexes
bookmarkSchema.index({ userId: 1, articleId: 1 }, { unique: true })
bookmarkSchema.index({ userId: 1, category: 1, createdAt: -1 })
bookmarkSchema.index({ userId: 1, isRead: 1, createdAt: -1 })

// Pre-save middleware
bookmarkSchema.pre("save", function (next) {
  if (this.isModified("isRead") && this.isRead && !this.readAt) {
    this.readAt = new Date()
  }
  next()
})

// Static methods
bookmarkSchema.statics.findByUser = function (userId, options = {}) {
  const { category, isRead, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = options

  const query = { userId }

  if (category) {
    query.category = category
  }

  if (typeof isRead === "boolean") {
    query.isRead = isRead
  }

  const skip = (page - 1) * limit
  const sort = {}
  sort[sortBy] = sortOrder === "desc" ? -1 : 1

  return this.find(query)
    .populate("articleId", "title description imageUrl category publishedAt author source readingTime")
    .sort(sort)
    .skip(skip)
    .limit(limit)
}

bookmarkSchema.statics.findByUserAndCategory = function (userId, category) {
  return this.find({ userId, category })
    .populate("articleId", "title description imageUrl category publishedAt author source readingTime")
    .sort({ createdAt: -1 })
}

bookmarkSchema.statics.getStats = function (userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        readLater: { $sum: { $cond: [{ $eq: ["$category", "read_later"] }, 1, 0] } },
        favorites: { $sum: { $cond: [{ $eq: ["$category", "favorite"] }, 1, 0] } },
        archived: { $sum: { $cond: [{ $eq: ["$category", "archive"] }, 1, 0] } },
        read: { $sum: { $cond: ["$isRead", 1, 0] } },
        unread: { $sum: { $cond: [{ $not: "$isRead" }, 1, 0] } },
      },
    },
  ])
}

// Instance methods
bookmarkSchema.methods.markAsRead = function () {
  this.isRead = true
  this.readAt = new Date()
  return this.save()
}

bookmarkSchema.methods.markAsUnread = function () {
  this.isRead = false
  this.readAt = null
  return this.save()
}

bookmarkSchema.methods.changeCategory = function (newCategory) {
  this.category = newCategory
  return this.save()
}

module.exports = mongoose.model("Bookmark", bookmarkSchema)
