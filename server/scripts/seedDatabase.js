const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const User = require("../models/User")
const Article = require("../models/Article")
const Category = require("../models/Category")
const Comment = require("../models/Comment")

// Sample data
const categories = [
  { id: "technology", name: "Technology", description: "Latest tech news and innovations", color: "#3b82f6" },
  { id: "business", name: "Business", description: "Business and finance news", color: "#10b981" },
  { id: "science", name: "Science", description: "Scientific discoveries and research", color: "#8b5cf6" },
  { id: "health", name: "Health", description: "Health and medical news", color: "#ef4444" },
  { id: "sports", name: "Sports", description: "Sports news and updates", color: "#f59e0b" },
  { id: "entertainment", name: "Entertainment", description: "Entertainment and celebrity news", color: "#ec4899" },
  { id: "politics", name: "Politics", description: "Political news and analysis", color: "#6b7280" },
  { id: "world", name: "World", description: "International news and events", color: "#14b8a6" },
]

const sampleArticles = [
  {
    title: "Revolutionary AI Technology Transforms Healthcare",
    description: "New artificial intelligence system shows promising results in early disease detection.",
    content:
      "A groundbreaking AI system developed by researchers has shown remarkable accuracy in detecting early signs of various diseases. The technology uses advanced machine learning algorithms to analyze medical imaging data and identify potential health issues before they become critical. Early trials have shown a 95% accuracy rate in detecting certain types of cancer, potentially saving thousands of lives through early intervention.",
    author: "Dr. Sarah Johnson",
    source: "TechHealth News",
    category: "technology",
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800",
    url: "https://example.com/ai-healthcare",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    viewCount: 1250,
    likes: 89,
    isBreaking: false,
    isTrending: true,
    tags: ["AI", "Healthcare", "Technology", "Medical"],
  },
  {
    title: "Global Markets Rally on Economic Recovery Signs",
    description: "Stock markets worldwide show strong gains as economic indicators point to recovery.",
    content:
      "Major stock indices around the world posted significant gains today as investors responded positively to new economic data suggesting a robust recovery. The Dow Jones Industrial Average rose 2.3%, while the S&P 500 gained 2.1%. European markets also showed strong performance, with the FTSE 100 up 1.8% and the DAX climbing 2.5%. Analysts attribute the rally to improving employment figures and increased consumer spending.",
    author: "Michael Chen",
    source: "Financial Times",
    category: "business",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
    url: "https://example.com/markets-rally",
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    viewCount: 2100,
    likes: 156,
    isBreaking: true,
    isTrending: true,
    tags: ["Markets", "Economy", "Finance", "Recovery"],
  },
  {
    title: "Scientists Discover New Species in Deep Ocean",
    description: "Marine biologists identify previously unknown creatures in the deepest parts of the ocean.",
    content:
      "A team of marine biologists has discovered several new species of deep-sea creatures during a recent expedition to the Mariana Trench. The newly identified species include a translucent fish with bioluminescent properties and a type of jellyfish that exhibits unique feeding behaviors. These discoveries provide valuable insights into how life adapts to extreme conditions and may have implications for understanding life on other planets.",
    author: "Dr. Emily Rodriguez",
    source: "Ocean Research Institute",
    category: "science",
    imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    url: "https://example.com/ocean-discovery",
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    viewCount: 890,
    likes: 67,
    isBreaking: false,
    isTrending: false,
    tags: ["Ocean", "Discovery", "Marine Biology", "Species"],
  },
]

const sampleUsers = [
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    bio: "Tech enthusiast and news reader",
    location: "San Francisco, CA",
    interests: ["technology", "business", "science"],
    role: "user",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    bio: "Business analyst and market watcher",
    location: "New York, NY",
    interests: ["business", "politics", "world"],
    role: "user",
  },
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    bio: "NewsApp administrator",
    location: "Remote",
    interests: ["technology", "business", "science", "politics"],
    role: "admin",
  },
]

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    // Clear existing data
    await Promise.all([User.deleteMany({}), Article.deleteMany({}), Category.deleteMany({}), Comment.deleteMany({})])
    console.log("Cleared existing data")

    // Seed categories
    await Category.insertMany(categories)
    console.log("Seeded categories")

    // Seed users
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(user.password, salt)
        return {
          ...user,
          password: hashedPassword,
        }
      }),
    )

    const createdUsers = await User.insertMany(hashedUsers)
    console.log("Seeded users")

    // Seed articles
    const createdArticles = await Article.insertMany(sampleArticles)
    console.log("Seeded articles")

    // Seed some sample comments
    const sampleComments = [
      {
        articleId: createdArticles[0]._id,
        userId: createdUsers[0]._id,
        content: "This is fascinating! AI in healthcare is going to revolutionize medicine.",
        likes: 12,
      },
      {
        articleId: createdArticles[0]._id,
        userId: createdUsers[1]._id,
        content: "Great article! Looking forward to seeing this technology in practice.",
        likes: 8,
      },
      {
        articleId: createdArticles[1]._id,
        userId: createdUsers[0]._id,
        content: "The market recovery is encouraging. Hopefully this trend continues.",
        likes: 15,
      },
    ]

    await Comment.insertMany(sampleComments)
    console.log("Seeded comments")

    console.log("Database seeded successfully!")
    console.log("\nSample login credentials:")
    console.log("User: john@example.com / password123")
    console.log("User: jane@example.com / password123")
    console.log("Admin: admin@example.com / admin123")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

// Run the seed function
seedDatabase()
