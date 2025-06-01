const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const cron = require("node-cron");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const newsRoutes = require("./routes/news");
const commentRoutes = require("./routes/comments");
const bookmarkRoutes = require("./routes/bookmarks");
const categoryRoutes = require("./routes/categories");

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const { authenticateToken } = require("./middleware/auth");

// Import services
const newsService = require("./services/newsService");

const app = express();
const PORT = process.env.PORT || 5000;
app.disable("etag");

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  handler: (req, res /*, next */) => {
    res.status(429).json({
      success: false,
      message: "Too many requests from this IP, please try again later.",
    });
  },
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Logging
app.use(morgan("combined"));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/newsapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // Initial news fetch
    newsService.fetchAndStoreNews();
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/categories", categoryRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use(errorHandler);

// Schedule news updates every 6 hours
cron.schedule("0 */6 * * *", () => {
  newsService.fetchAndStoreNews();
});

// Schedule cleanup of old articles every day at midnight
cron.schedule("0 0 * * *", () => {
  newsService.cleanupOldArticles();
});

app.listen(PORT, () => {});

module.exports = app;
