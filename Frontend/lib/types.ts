export interface Article {
  id: string
  title: string
  description: string
  content: string
  author: string
  source: string
  publishedAt: string
  imageUrl: string
  category: string
  url: string
  viewCount: number
  comments: Comment[]
}

export interface Comment {
  id: string
  articleId: string
  author: string
  authorAvatar?: string
  content: string
  createdAt: string
  likes: number
  replies?: Comment[]
}

export interface Category {
  id: string
  name: string
}
