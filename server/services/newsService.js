const axios = require("axios");
const Article = require("../models/Article");
const moment = require("moment");

class OptimizedNewsService {
  constructor() {
    this.newsApiKey = process.env.NEWS_API_KEY;
    this.guardianApiKey = process.env.GUARDIAN_API_KEY;
    this.newsApiUrl = "https://newsapi.org/v2";
    this.guardianApiUrl = "https://content.guardianapis.com";

    // Add cache to prevent repeated API calls within a short window
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes

    // Reduced categories list for faster loading; you can add more if needed
    this.categories = [
      "technology",
      "business",
      "science",
      "health",
      "entertainment",
      "sports",
    ];
  }

  /**
   * Retrieve cached data if it exists and hasn't expired.
   * @param {string} key
   * @returns {any|null}
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Store data in cache with a timestamp.
   * @param {string} key
   * @param {any} data
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Entry point for fetching and storing news.
   * Uses a background job to fetch category news, then updates trending & cleans up old articles.
   */
  async fetchAndStoreNews() {
    try {
      // Fetch news in the background (non-blocking for UI)
      await this.fetchNewsInBackground();

      // After background fetch, update trending and clean up old articles
      await this.updateTrendingArticles();
      await this.cleanupOldArticles();
    } catch (error) {
      console.error("Error in fetchAndStoreNews:", error);
    }
  }

  /**
   * Spawns background tasks for fetching each category's news.
   * Limits to first 3 categories and 1 article per category to reduce load.
   */
  async fetchNewsInBackground() {
    const toFetch = this.categories.slice(0, 3);
    const fetchPromises = toFetch.map((category) =>
      this.fetchCategoryNews(category, 1)
    );

    // Use Promise.allSettled so one failure doesn't block others
    await Promise.allSettled(fetchPromises);
  }

  /**
   * Fetches news for a given category, but skips if there is a recent article in DB.
   * @param {string} category
   * @param {number} limit
   */
  async fetchCategoryNews(category, limit = 1) {
    try {
      // Check if there's at least one article for this category published in the last 2 hours
      const recentArticles = await Article.find({
        category,
        publishedAt: { $gte: moment().subtract(2, "hours").toDate() },
      })
        .limit(1)
        .lean();

      if (recentArticles.length > 0) {
        // Skip external API fetch if recent article exists
        return;
      }

      // Fetch from NewsAPI
      const newsApiArticles = await this.fetchFromNewsAPI(category, limit);

      // Fetch from Guardian API
      const guardianArticles = await this.fetchFromGuardianAPI(category, limit);

      // Combine both arrays
      const allArticles = [...newsApiArticles, ...guardianArticles];

      // Non-blocking storage of articles
      this.storeArticlesAsync(allArticles);
    } catch (error) {
      console.error(`Error fetching news for category "${category}":`, error);
    }
  }

  /**
   * Non-blocking storage: iterates through article data and calls storeArticle() asynchronously.
   * @param {Array<Object>} articles
   */
  async storeArticlesAsync(articles) {
    setImmediate(async () => {
      for (const articleData of articles) {
        try {
          await this.storeArticle(articleData);
        } catch (err) {
          console.error("Background storage error:", err);
        }
      }
    });
  }

  /**
   * Fetches top headlines from NewsAPI for a given category.
   * @param {string} category
   * @param {number} limit
   * @returns {Promise<Array<Object>>}
   */
  async fetchFromNewsAPI(category, limit = 1) {
    if (!this.newsApiKey) {
      console.warn("NewsAPI key not configured");
      return [];
    }

    const cacheKey = `newsapi_${category}_${limit}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`${this.newsApiUrl}/top-headlines`, {
        params: {
          apiKey: this.newsApiKey,
          category: this.mapCategoryForNewsAPI(category),
          country: "us",
          pageSize: limit,
          language: "en",
        },
        timeout: 5000, // 5 seconds timeout for faster fallback
      });

      const articles = response.data.articles.map((article) => ({
        title: article.title,
        description: article.description || "No description available",
        content:
          article.content || article.description || "No content available",
        author: article.author || "Unknown",
        source: article.source.name,
        sourceUrl: article.url,
        url: article.url,
        imageUrl: article.urlToImage,
        category,
        publishedAt: new Date(article.publishedAt),
        externalId: `newsapi_${Buffer.from(article.url).toString("base64")}`,
        language: "en",
        country: "us",
        isActive: true,
      }));

      this.setCachedData(cacheKey, articles);
      return articles;
    } catch (error) {
      console.error(
        `NewsAPI fetch error for category "${category}":`,
        error.message
      );
      return [];
    }
  }

  /**
   * Fetches articles from The Guardian API for a given category.
   * @param {string} category
   * @param {number} limit
   * @returns {Promise<Array<Object>>}
   */
  async fetchFromGuardianAPI(category, limit = 1) {
    if (!this.guardianApiKey) {
      console.warn("Guardian API key not configured");
      return [];
    }

    const cacheKey = `guardian_${category}_${limit}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`${this.guardianApiUrl}/search`, {
        params: {
          "api-key": this.guardianApiKey,
          section: this.mapCategoryForGuardian(category),
          "page-size": limit,
          "show-fields": "headline,byline,thumbnail,bodyText,short-url",
          "order-by": "newest",
        },
        timeout: 5000, // 5 seconds timeout
      });

      const articles = response.data.response.results.map((article) => ({
        title: article.fields?.headline || article.webTitle,
        description: this.extractDescription(article.fields?.bodyText || ""),
        content: article.fields?.bodyText || "",
        author: article.fields?.byline || "Guardian Staff",
        source: "The Guardian",
        sourceUrl: article.webUrl,
        url: article.webUrl,
        imageUrl: article.fields?.thumbnail,
        category,
        publishedAt: new Date(article.webPublicationDate),
        externalId: `guardian_${article.id}`,
        language: "en",
        country: "uk",
        isActive: true,
      }));

      this.setCachedData(cacheKey, articles);
      return articles;
    } catch (error) {
      console.error(
        `Guardian API fetch error for category "${category}":`,
        error.message
      );
      return [];
    }
  }

  /**
   * Stores or updates a single article document in the database.
   * Ensures no duplicate externalId and normalizes missing fields.
   * @param {Object} articleData
   */
  async storeArticle(articleData) {
    try {
      // Normalize description & content
      if (!articleData.description || articleData.description.trim() === "") {
        articleData.description = "No description available.";
      }
      if (!articleData.content || articleData.content.trim() === "") {
        articleData.content =
          articleData.description || "No content available.";
      }

      // Ensure 'url' field is set
      articleData.url = articleData.sourceUrl || articleData.url;

      const existing = await Article.findOne({
        externalId: articleData.externalId,
      });

      if (existing) {
        // Update existing document with new data
        Object.assign(existing, articleData);
        await existing.save();
      } else {
        const article = new Article(articleData);
        await article.save();
      }
    } catch (error) {
      // Ignore duplicate key errors
      if (error.code === 11000) {
        console.log(`Article already exists: ${articleData.title}`);
      } else {
        console.error("Error storing article:", error);
      }
    }
  }

  /**
   * Marks top articles from the last 24 hours as trending based on viewCount and likes.
   */
  async updateTrendingArticles() {
    try {
      // Reset all trending flags
      await Article.updateMany({}, { isTrending: false });

      const oneDayAgo = moment().subtract(1, "day").toDate();

      const trendingArticles = await Article.find({
        publishedAt: { $gte: oneDayAgo },
        isActive: true,
      })
        .sort({ viewCount: -1, likes: -1 })
        .limit(20)
        .lean();

      const trendingIds = trendingArticles.map((a) => a._id);
      if (trendingIds.length > 0) {
        await Article.updateMany(
          { _id: { $in: trendingIds } },
          { isTrending: true }
        );
      }
    } catch (error) {
      console.error("Error updating trending articles:", error);
    }
  }

  /**
   * Deletes articles older than 30 days with low engagement (viewCount < 10).
   */
  async cleanupOldArticles() {
    try {
      const thirtyDaysAgo = moment().subtract(30, "days").toDate();

      const result = await Article.deleteMany({
        publishedAt: { $lt: thirtyDaysAgo },
        viewCount: { $lt: 10 },
      });
    } catch (error) {
      console.error("Error cleaning up old articles:", error);
    }
  }

  /**
   * Maps our category names to NewsAPI's category parameter.
   * @param {string} category
   * @returns {string}
   */
  mapCategoryForNewsAPI(category) {
    const mapping = {
      technology: "technology",
      business: "business",
      science: "science",
      health: "health",
      entertainment: "entertainment",
      sports: "sports",
      politics: "general",
      world: "general",
    };
    return mapping[category] || "general";
  }

  /**
   * Maps our category names to Guardian API's section parameter.
   * @param {string} category
   * @returns {string}
   */
  mapCategoryForGuardian(category) {
    const mapping = {
      technology: "technology",
      business: "business",
      science: "science",
      health: "society",
      entertainment: "culture",
      sports: "sport",
      politics: "politics",
      world: "world",
    };
    return mapping[category] || "news";
  }

  /**
   * Strips HTML tags and truncates to 200 characters for a description.
   * @param {string} content
   * @returns {string}
   */
  extractDescription(content) {
    if (!content) return "";
    const plainText = content.replace(/<[^>]*>/g, "");
    return plainText.length > 200
      ? plainText.substring(0, 200) + "..."
      : plainText;
  }
}

module.exports = new OptimizedNewsService();
