const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "technology",
        "business",
        "science",
        "health",
        "sports",
        "entertainment",
        "politics",
        "world",
      ],
    },
    imageUrl: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      required: true,
    },
    publishedAt: {
      type: Date,
      required: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    isBreaking: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    externalId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
articleSchema.index({ category: 1, publishedAt: -1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ viewCount: -1 });
articleSchema.index({ isTrending: 1, publishedAt: -1 });
articleSchema.index({ title: "text", description: "text", content: "text" });

// Virtual for comments
articleSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "articleId",
});

// models/Article.js
articleSchema.virtual("id").get(function() {
  return this._id.toHexString();
});
articleSchema.set("toJSON", { virtuals: true });
;



module.exports = mongoose.model("Article", articleSchema);
