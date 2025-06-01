const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const Bookmark = require("../models/Bookmark");
const Article = require("../models/Article");
const UserActivity = require("../models/UserActivity");

// Get user bookmarks
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const bookmarks = await Bookmark.find({ userId: req.user._id })
      .populate("articleId")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Bookmark.countDocuments({ userId: req.user._id });

    // Transform bookmarks to return articles
    const articles = bookmarks
      .filter((bookmark) => bookmark.articleId) // Filter out null articles
      .map((bookmark) => ({
        id: bookmark.articleId._id,
        title: bookmark.articleId.title,
        description: bookmark.articleId.description,
        content: bookmark.articleId.content,
        author: bookmark.articleId.author,
        source: bookmark.articleId.source,
        category: bookmark.articleId.category,
        imageUrl: bookmark.articleId.imageUrl,
        url: bookmark.articleId.url,
        publishedAt: bookmark.articleId.publishedAt,
        viewCount: bookmark.articleId.viewCount,
        likes: bookmark.articleId.likes,
        bookmarkedAt: bookmark.createdAt,
      }));

    res.json({
      success: true,
      bookmarks: articles,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Add bookmark
router.post("/", auth, async (req, res) => {
  try {
    const { articleId } = req.body;

    if (!articleId) {
      return res.status(400).json({
        success: false,
        message: "Article ID is required",
      });
    }

    // Verify article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({
      userId: req.user._id,
      articleId,
    });

    if (existingBookmark) {
      return res.status(400).json({
        success: false,
        message: "Article already bookmarked",
      });
    }

    const bookmark = new Bookmark({
      userId: req.user._id,
      articleId,
    });

    await bookmark.save();

    // Log user activity
    await UserActivity.create({
      userId: req.user._id,
      activityType: "bookmark",
      articleId,
      metadata: { bookmarkId: bookmark._id },
    });

    res.status(201).json({
      success: true,
      message: "Article bookmarked successfully",
    });
  } catch (error) {
    console.error("Add bookmark error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Remove bookmark
router.delete("/:articleId", auth, async (req, res) => {
  try {
    const { articleId } = req.params;

    const bookmark = await Bookmark.findOneAndDelete({
      userId: req.user._id,
      articleId,
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found",
      });
    }

    res.json({
      success: true,
      message: "Bookmark removed successfully",
    });
  } catch (error) {
    console.error("Remove bookmark error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Check if article is bookmarked
router.get("/check/:articleId", auth, async (req, res) => {
  try {
    const { articleId } = req.params;

    const bookmark = await Bookmark.findOne({
      userId: req.user._id,
      articleId,
    });

    res.json({
      success: true,
      isBookmarked: !!bookmark,
    });
  } catch (error) {
    console.error("Check bookmark error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
