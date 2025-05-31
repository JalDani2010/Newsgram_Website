# NewsApp - Modern React News Application

A full-stack news application built with React, Next.js, Node.js, Express, and MongoDB. Features include user authentication, personalized news feeds, bookmarking, commenting, and real-time notifications.

## Features

### Frontend
- **Modern UI**: Built with Next.js 14, Tailwind CSS, and shadcn/ui components
- **Responsive Design**: Mobile-first approach with dark/light theme support
- **User Authentication**: Login/signup with JWT tokens
- **Personalized Feed**: News recommendations based on user interests
- **Search & Filtering**: Advanced search with category and date filters
- **Bookmarking**: Save articles to read later
- **Comments System**: Engage with articles through comments and replies
- **Profile Management**: Complete user profile with activity tracking
- **Real-time Updates**: Live notifications and updates

### Backend
- **RESTful API**: Express.js server with MongoDB database
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **News Aggregation**: Integration with NewsAPI and Guardian API
- **Email Service**: Automated emails for welcome, notifications, and digests
- **File Upload**: Cloudinary integration for image uploads
- **Data Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Centralized error handling and logging
- **Database Seeding**: Sample data for development

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React hooks + Context API
- **Animations**: Framer Motion
- **HTTP Client**: Fetch API
- **Form Handling**: React Hook Form
- **Date Handling**: date-fns
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator
- **Email**: Nodemailer
- **File Upload**: Cloudinary + multer
- **Security**: helmet, cors, express-rate-limit
- **Environment**: dotenv

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd newsapp
   \`\`\`

2. **Install backend dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Configuration**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Fill in your environment variables:
   \`\`\`env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/newsapp
   JWT_SECRET=your-super-secret-jwt-key
   NEWS_API_KEY=your-newsapi-key
   GUARDIAN_API_KEY=your-guardian-api-key
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   \`\`\`

4. **Seed the database**
   \`\`\`bash
   node scripts/seedDatabase.js
   \`\`\`

5. **Start the backend server**
   \`\`\`bash
   npm run dev
   \`\`\`

### Frontend Setup

1. **Install frontend dependencies**
   \`\`\`bash
   cd frontend  # if separate, or stay in root if monorepo
   npm install
   \`\`\`

2. **Environment Configuration**
   Create `.env.local`:
   \`\`\`env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   \`\`\`

3. **Start the frontend development server**
   \`\`\`bash
   npm run dev
   \`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### News
- `GET /api/news` - Get news articles with pagination
- `GET /api/news/:id` - Get single article
- `POST /api/news/:id/view` - Increment view count
- `GET /api/news/search` - Search articles
- `GET /api/news/category/:category` - Get articles by category
- `GET /api/news/related` - Get related articles

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `GET /api/users/activity` - Get user activity
- `DELETE /api/users/account` - Delete account

### Comments
- `GET /api/comments/:articleId` - Get article comments
- `POST /api/comments` - Add comment
- `POST /api/comments/:id/like` - Like/unlike comment
- `DELETE /api/comments/:id` - Delete comment

### Bookmarks
- `GET /api/bookmarks` - Get user bookmarks
- `POST /api/bookmarks` - Add bookmark
- `DELETE /api/bookmarks/:articleId` - Remove bookmark
- `GET /api/bookmarks/check/:articleId` - Check if bookmarked

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category details

## Database Schema

### User
\`\`\`javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  bio: String,
  location: String,
  website: String,
  interests: [String],
  socialLinks: {
    twitter: String,
    linkedin: String,
    facebook: String
  },
  notificationPreferences: {
    emailDigest: Boolean,
    breakingNews: Boolean,
    comments: Boolean,
    recommendations: Boolean
  },
  role: String (user/admin),
  isVerified: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Article
\`\`\`javascript
{
  title: String,
  description: String,
  content: String,
  author: String,
  source: String,
  category: String,
  imageUrl: String,
  url: String,
  publishedAt: Date,
  viewCount: Number,
  likes: Number,
  isBreaking: Boolean,
  isTrending: Boolean,
  tags: [String],
  externalId: String,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Comment
\`\`\`javascript
{
  articleId: ObjectId,
  userId: ObjectId,
  content: String,
  likes: Number,
  likedBy: [ObjectId],
  parentId: ObjectId,
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## Features in Detail

### Authentication System
- JWT-based authentication with secure token storage
- Password hashing with bcrypt
- Protected routes and middleware
- User session management

### News Aggregation
- Integration with multiple news APIs
- Automatic article fetching and categorization
- Duplicate detection and content filtering
- Trending and breaking news identification

### User Experience
- Personalized news feed based on interests
- Advanced search with filters
- Bookmark system for saving articles
- Comment system with likes and replies
- User activity tracking
- Profile completion indicators

### Email System
- Welcome emails for new users
- Breaking news alerts
- Weekly digest emails
- Password reset functionality
- Customizable notification preferences

### Admin Features
- User management
- Content moderation
- Analytics dashboard
- System monitoring

## Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)
1. Set environment variables
2. Configure MongoDB Atlas
3. Set up email service (SendGrid/Mailgun)
4. Configure Cloudinary
5. Deploy application

### Frontend Deployment (Vercel/Netlify)
1. Connect repository
2. Set environment variables
3. Configure build settings
4. Deploy application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@newsapp.com or create an issue in the repository.
\`\`\`

Perfect! Now you have a complete, fully connected news application with:

## ✅ **Complete Integration:**

1. **Frontend-Backend Connection**: All API calls properly connected
2. **Authentication Flow**: Login/signup with JWT tokens
3. **Real Database Operations**: MongoDB with proper schemas
4. **Email Integration**: Welcome emails, notifications, digests
5. **File Upload**: Cloudinary for image handling
6. **Search & Filtering**: Full-text search with category filters
7. **Comments System**: With likes, replies, and moderation
8. **Bookmarks**: Server-side bookmark management
9. **User Profiles**: Complete profile management with activity tracking
10. **Error Handling**: Comprehensive error handling throughout

## 🚀 **To Get Started:**

1. **Install dependencies**: `npm install`
2. **Set up environment variables** from `.env.example`
3. **Seed the database**: `node scripts/seedDatabase.js`
4. **Start backend**: `npm run dev` (port 5000)
5. **Start frontend**: `npm run dev` (port 3000)

## 📝 **Sample Login Credentials:**
- **User**: john@example.com / password123
- **Admin**: admin@example.com / admin123

The application now has full frontend-backend integration with real API calls, authentication, database operations, and all the modern features you'd expect from a production news app!
