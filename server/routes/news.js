const express = require("express");
const Article = require("../models/Article");
const UserActivity = require("../models/UserActivity");
const { auth, optionalAuth } = require("../middleware/auth");
const newsService = require("../services/newsService");

const router = express.Router();

// @route   GET /api/news
// @desc    Get news articles with pagination and filtering
// @access  Public
router.get("/", optionalAuth, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const {
      category,
      search,
      sortBy = "publishedAt",
      sortOrder = "desc",
      trending,
      breaking,
    } = req.query;
    const { preset, date } = req.query;
    // Build query
    const query = {};
    if (date) {
      // filter by exact date or after that date
      query.publishedAt = { $gte: new Date(date) };
    } else if (preset) {
      const now = new Date();
      let start;
      switch (preset) {
        case "today":
          start = startOfToday();
          break;
        case "week":
          start = startOfWeek(now);
          break;
        case "month":
          start = startOfMonth(now);
          break;
        case "year":
          start = startOfYear(now);
          break;
      }
      if (start) {
        query.publishedAt = { $gte: start };
      }
    }
    if (category) {
      query.category = category;
    }

    if (trending === "true") {
      query.isTrending = true;
    }

    if (breaking === "true") {
      query.isBreaking = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const articles = await Article.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("comments");

    const total = await Article.countDocuments(query);

    // Log search activity if user is authenticated
    if (req.user && search) {
      await UserActivity.create({
        user: req.user._id,
        action: "search",
        metadata: { query: search },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
    }

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get news error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch news articles",
    });
  }
});

// @route   GET /api/news/trending
// @desc    Get trending news articles
// @access  Public
router.get("/trending", async (req, res) => {
  try {
    const limit = Number.parseInt(req.query.limit) || 10;

    const articles = await Article.findTrending(limit);

    res.json({
      success: true,
      data: {
        articles,
      },
    });
  } catch (error) {
    console.error("Get trending news error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trending news",
    });
  }
});

// @route   GET /api/news/breaking
// @desc    Get breaking news articles
// @access  Public
router.get("/breaking", async (req, res) => {
  try {
    const limit = Number.parseInt(req.query.limit) || 5;

    const articles = await Article.findBreaking(limit);

    res.json({
      success: true,
      data: {
        articles,
      },
    });
  } catch (error) {
    console.error("Get breaking news error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch breaking news",
    });
  }
});

// @route   GET /api/news/personalized
// @desc    Get personalized news based on user interests
// @access  Private
router.get("/personalized", auth, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userInterests = req.user.interests || [];

    const query = {};

    if (userInterests.length > 0) {
      query.category = { $in: userInterests };
    }

    const articles = await Article.find(query)
      .sort({ publishedAt: -1, viewCount: -1 })
      .skip(skip)
      .limit(limit)
      .populate("comments");

    const total = await Article.countDocuments(query);

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get personalized news error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch personalized news",
    });
  }
});

// @route   GET /api/news/category/:categoryId
// @desc    Get news by category
// @access  Public
router.get("/category/:categoryId", optionalAuth, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const articles = await Article.find({
      category: categoryId,
    })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("comments");

    const total = await Article.countDocuments({
      category: categoryId,
    });

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get category news error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category news",
    });
  }
});

// @route   GET /api/news/:id
// @desc    Get single news article
// @access  Public
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const article = await Article.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
    }).populate("comments");

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Increment view count
    article.viewCount = (article.viewCount || 0) + 1;
    await article.save({ validateBeforeSave: false });

    // Log view activity if user is authenticated
    if (req.user) {
      await UserActivity.create({
        userId: req.user._id,
        activityType: "view",
        articleId: article._id,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
    }

    res.json({
      success: true,
      data: {
        article,
      },
    });
  } catch (error) {
    console.error("Get article error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch article",
    });
  }
});

// @route   GET /api/news/:id/related
// @desc    Get related articles
// @access  Public
router.get("/:id/related", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    const limit = Number.parseInt(req.query.limit) || 3;

    const relatedArticles = await Article.find({
      category: article.category,
      _id: { $ne: article._id },
    })
      .sort({ publishedAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: {
        articles: relatedArticles,
      },
    });
  } catch (error) {
    console.error("Get related articles error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch related articles",
    });
  }
});

// @route   POST /api/news/:id/like
// @desc    Like/unlike an article
// @access  Private
router.post("/:id/like", auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Check if user already liked this article
    const existingActivity = await UserActivity.findOne({
      user: req.user._id,
      article: article._id,
      action: "like",
    });

    if (existingActivity) {
      // Unlike
      await UserActivity.deleteOne({ _id: existingActivity._id });
      article.likes = Math.max(0, article.likes - 1);
    } else {
      // Like
      await UserActivity.create({
        user: req.user._id,
        action: "like",
        article: article._id,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      article.likes += 1;
    }

    await article.save();

    res.json({
      success: true,
      data: {
        liked: !existingActivity,
        likes: article.likes,
      },
    });
  } catch (error) {
    console.error("Like article error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to like article",
    });
  }
});

// @route   POST /api/news/:id/share
// @desc    Share an article
// @access  Private
router.post("/:id/share", auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Log share activity
    await UserActivity.create({
      user: req.user._id,
      action: "share",
      article: article._id,
      metadata: req.body.platform ? { platform: req.body.platform } : {},
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    // Increment share count
    article.shares += 1;
    await article.save();

    res.json({
      success: true,
      data: {
        shares: article.shares,
      },
    });
  } catch (error) {
    console.error("Share article error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to share article",
    });
  }
});

// @route   POST /api/news/refresh
// @desc    Manually refresh news (admin only)
// @access  Private
router.post("/refresh", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await newsService.fetchAndStoreNews();

    res.json({
      success: true,
      message: "News refresh initiated",
    });
  } catch (error) {
    console.error("Refresh news error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to refresh news",
    });
  }
});

module.exports = router;
