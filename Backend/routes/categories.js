const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const Article = require("../models/Article");

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      name: 1,
    });

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get category by ID with article count
router.get("/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findOne({ id: categoryId, isActive: true });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const articleCount = await Article.countDocuments({ category: categoryId });

    res.json({
      success: true,
      category: {
        ...category.toObject(),
        articleCount,
      },
    });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
