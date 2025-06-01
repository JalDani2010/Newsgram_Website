const express = require("express")
const Comment = require("../models/Comment")
const Article = require("../models/Article")
const UserActivity = require("../models/UserActivity")
const { auth } = require("../middleware/auth")
const { validateComment } = require("../middleware/validation")

const router = express.Router()

// @route   GET /api/comments/article/:articleId
// @desc    Get comments for an article
// @access  Public
router.get("/article/:articleId", async (req, res) => {
  try {
    const { articleId } = req.params
    const { page = 1, limit = 20 } = req.query

    const comments = await Comment.find({
      articleId,
      parentId: null,
      isDeleted: false,
    })
      .populate("userId", "name avatar")
      .populate({
        path: "replies",
        match: { isDeleted: false },
        populate: {
          path: "userId",
          select: "name avatar",
        },
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Comment.countDocuments({
      articleId,
      parentId: null,
      isDeleted: false,
    })

    // Transform comments to match frontend format
    const transformedComments = comments.map((comment) => ({
      id: comment._id,
      articleId: comment.articleId,
      author: comment.userId.name,
      authorAvatar: comment.userId.avatar,
      content: comment.content,
      createdAt: comment.createdAt,
      likes: comment.likes,
      replies:
        comment.replies?.map((reply) => ({
          id: reply._id,
          author: reply.userId.name,
          authorAvatar: reply.userId.avatar,
          content: reply.content,
          createdAt: reply.createdAt,
          likes: reply.likes,
        })) || [],
    }))

    res.json({
      success: true,
      comments: transformedComments,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get comments error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get comments",
    })
  }
})

// @route   POST /api/comments
// @desc    Create a new comment
// @access  Private
router.post("/", auth, validateComment, async (req, res) => {
  try {
    const { articleId, content, parentId } = req.body

    // Check if article exists
    const article = await Article.findById(articleId)
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      })
    }

    // Check if parent comment exists (for replies)
    if (parentId) {
      const parentComment = await Comment.findById(parentId)
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: "Parent comment not found",
        })
      }
    }

    // Create comment
    const comment = new Comment({
      articleId,
      userId: req.user._id,
      content,
      parentId: parentId || null,
    })

    await comment.save()
    await comment.populate("userId", "name avatar")

    // Log activity
    await UserActivity.create({
      userId: req.user._id,
      activityType: "comment",
      articleId,
      metadata: { commentId: comment._id },
    })

    // Transform comment to match frontend format
    const transformedComment = {
      id: comment._id,
      articleId: comment.articleId,
      author: comment.userId.name,
      authorAvatar: comment.userId.avatar,
      content: comment.content,
      createdAt: comment.createdAt,
      likes: comment.likes,
    }

    res.status(201).json({
      success: true,
      comment: transformedComment,
      message: "Comment created successfully",
    })
  } catch (error) {
    console.error("Create comment error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create comment",
    })
  }
})

// @route   PUT /api/comments/:id
// @desc    Update a comment
// @access  Private
router.put("/:id", auth, validateComment, async (req, res) => {
  try {
    const { content } = req.body

    const comment = await Comment.findById(req.params.id)

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this comment",
      })
    }

    // Update comment
    comment.content = content
    await comment.save()

    await comment.populate("userId", "name avatar")

    res.json({
      success: true,
      message: "Comment updated successfully",
      data: {
        comment,
      },
    })
  } catch (error) {
    console.error("Update comment error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update comment",
    })
  }
})

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    // Check if user owns the comment or is admin
    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      })
    }

    // Soft delete - mark as inactive
    comment.isDeleted = true
    await comment.save()

    res.json({
      success: true,
      message: "Comment deleted successfully",
    })
  } catch (error) {
    console.error("Delete comment error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
    })
  }
})

// @route   POST /api/comments/:id/like
// @desc    Like/unlike a comment
// @access  Private
router.post("/:id/like", auth, async (req, res) => {
  try {
    const { id: commentId } = req.params
    const userId = req.user._id

    const comment = await Comment.findById(commentId)
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    const hasLiked = comment.likedBy.some((uid) => uid.equals(userId))

    if (hasLiked) {
      // Unlike
      comment.likedBy.pull(userId)
      comment.likes = Math.max(0, comment.likes - 1)
    } else {
      // Like
      comment.likedBy.push(userId)
      comment.likes += 1
    }

    await comment.save()

    res.json({
      success: true,
      likes: comment.likes,
      hasLiked: !hasLiked,
      message: hasLiked ? "Comment unliked" : "Comment liked",
    })
  } catch (error) {
    console.error("Like comment error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to like comment",
    })
  }
})

// @route   POST /api/comments/:id/report
// @desc    Report a comment
// @access  Private
router.post("/:id/report", auth, async (req, res) => {
  try {
    const { reason } = req.body

    const comment = await Comment.findById(req.params.id)

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    // Check if user already reported this comment
    const existingReport = await UserActivity.findOne({
      userId: req.user._id,
      comment: comment._id,
      action: "report",
    })

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this comment",
      })
    }

    // Log report activity
    await UserActivity.create({
      userId: req.user._id,
      action: "report",
      comment: comment._id,
      metadata: { reason },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    // Increment report count
    await comment.report()

    res.json({
      success: true,
      message: "Comment reported successfully",
    })
  } catch (error) {
    console.error("Report comment error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to report comment",
    })
  }
})

// @route   GET /api/comments/user/:userId
// @desc    Get comments by user
// @access  Public
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 10 } = req.query

    const comments = await Comment.find({
      userId,
      isDeleted: false,
    })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Comment.countDocuments({
      userId,
      isDeleted: false,
    })

    // Transform comments to match frontend format
    const transformedComments = comments.map((comment) => ({
      id: comment._id,
      articleId: comment.articleId,
      author: comment.userId.name,
      authorAvatar: comment.userId.avatar,
      content: comment.content,
      createdAt: comment.createdAt,
      likes: comment.likes,
    }))

    res.json({
      success: true,
      comments: transformedComments,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get user comments error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get user comments",
    })
  }
})

module.exports = router
