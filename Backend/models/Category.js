const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Category ID is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      maxlength: [200, "Description cannot exceed 200 characters"],
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "#000000",
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Please enter a valid hex color"],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    articleCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    subscriberCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    metadata: {
      keywords: [String],
      relatedCategories: [String],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes
categorySchema.index({ id: 1 })
categorySchema.index({ isActive: 1, sortOrder: 1 })

// Static methods
categorySchema.statics.findActive = function () {
  return this.find({ isActive: true }).sort({ sortOrder: 1, name: 1 })
}

categorySchema.statics.findWithStats = function () {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: "articles",
        localField: "id",
        foreignField: "category",
        as: "articles",
      },
    },
    {
      $addFields: {
        articleCount: { $size: "$articles" },
        recentArticleCount: {
          $size: {
            $filter: {
              input: "$articles",
              cond: {
                $gte: ["$$this.publishedAt", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        articles: 0,
      },
    },
    { $sort: { sortOrder: 1, name: 1 } },
  ])
}

// Instance methods
categorySchema.methods.updateArticleCount = async function () {
  const Article = mongoose.model("Article")
  this.articleCount = await Article.countDocuments({
    category: this.id,
    isActive: true,
  })
  return this.save({ validateBeforeSave: false })
}

module.exports = mongoose.model("Category", categorySchema)
