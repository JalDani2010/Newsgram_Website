const mongoose = require("mongoose")

const userActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activityType: {
      type: String,
      required: true,
      enum: ["view", "like", "comment", "bookmark", "share"],
      index: true,
    },
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
      index: true,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    sessionId: {
      type: String,
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
userActivitySchema.index({ userId: 1, createdAt: -1 })
userActivitySchema.index({ activityType: 1, createdAt: -1 })
userActivitySchema.index({ articleId: 1, activityType: 1 })
userActivitySchema.index({ createdAt: -1 })

// TTL index to automatically delete old activities after 90 days
userActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })

// Static methods
userActivitySchema.statics.findByUser = function (userId, options = {}) {
  const { activityType, page = 1, limit = 20, days = 30 } = options

  const query = { userId: userId }

  if (activityType) {
    query.activityType = activityType
  }

  if (days) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    query.createdAt = { $gte: startDate }
  }

  const skip = (page - 1) * limit

  return this.find(query).populate("articleId", "title slug category").sort({ createdAt: -1 }).skip(skip).limit(limit)
}

userActivitySchema.statics.getUserStats = function (userId, days = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$activityType",
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        totalActivities: { $sum: "$count" },
        activities: {
          $push: {
            activityType: "$_id",
            count: "$count",
          },
        },
      },
    },
  ])
}

userActivitySchema.statics.getPopularArticles = function (days = 7, limit = 10) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return this.aggregate([
    {
      $match: {
        activityType: { $in: ["view", "like", "share"] },
        articleId: { $exists: true },
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$articleId",
        views: { $sum: { $cond: [{ $eq: ["$activityType", "view"] }, 1, 0] } },
        likes: { $sum: { $cond: [{ $eq: ["$activityType", "like"] }, 1, 0] } },
        shares: { $sum: { $cond: [{ $eq: ["$activityType", "share"] }, 1, 0] } },
        totalEngagement: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "articles",
        localField: "_id",
        foreignField: "_id",
        as: "article",
      },
    },
    {
      $unwind: "$article",
    },
    {
      $project: {
        article: 1,
        views: 1,
        likes: 1,
        shares: 1,
        totalEngagement: 1,
        score: {
          $add: [{ $multiply: ["$views", 1] }, { $multiply: ["$likes", 3] }, { $multiply: ["$shares", 5] }],
        },
      },
    },
    { $sort: { score: -1 } },
    { $limit: limit },
  ])
}

module.exports = mongoose.model("UserActivity", userActivitySchema)
