import type { Article, Comment } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("newsapp_auth_token="))
      ?.split("=")[1] || null
  );
}

// Helper function to make authenticated requests
async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {}
) {
  
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  console.log("Fetching:", `${API_BASE_URL}${url}`, options, headers);

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

// Get top headlines with pagination
export async function getTopHeadlines({
  page = 1,
  pageSize = 10,
  category = "",
  date = "",
}: {
  page?: number;
  pageSize?: number;
  category?: string;
  date?: string;
} = {}): Promise<Article[]> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: pageSize.toString(),
    ...(category && { category }),
    ...(date && { date }),
  });

  // makeAuthenticatedRequest returns { success, data: { articles, pagination } }
  const response = await makeAuthenticatedRequest(`/news?${params}`);
  return response.data.articles || [];
}

// Get article by ID
export async function getArticleById(id: string): Promise<Article> {
  const response = await makeAuthenticatedRequest(`/news/${id}`);
  return response.data.article;
}

// Increment article view count
export async function incrementArticleViewCount(id: string): Promise<number> {
  const response = await makeAuthenticatedRequest(`/news/${id}/view`, {
    method: "POST",
  });
  return response.data.viewCount;
}

// Get article comments
export async function getArticleComments(
  articleId: string
): Promise<Comment[]> {
  const response = await makeAuthenticatedRequest(
    `/comments/article/${articleId}`
  );
  return response.comments || [];
}

export async function addComment(
  articleId: string,
  comment: Omit<Comment, "id" | "createdAt" | "likes">
): Promise<Comment> {
  const response = await makeAuthenticatedRequest(`/comments`, {
    method: "POST",
    body: JSON.stringify({ articleId, content: comment.content }),
  });
  return response.comment;
}

export async function likeComment(
  commentId: string
): Promise<{ likes: number }> {
  const response = await makeAuthenticatedRequest(
    `/comments/${commentId}/like`,
    { method: "POST" }
  );
  return { likes: response.likes };
}

export async function searchArticles(
  query: string,
  options: { category?: string; limit?: number } = {}
): Promise<Article[]> {
  const params = new URLSearchParams({
    q: query,
    ...(options.category && { category: options.category }),
    ...(options.limit && { limit: options.limit.toString() }),
  });
  const response = await makeAuthenticatedRequest(`/news/search?${params}`);
  return response.data.articles || [];
}

export async function getArticlesByCategory(
  categoryId: string,
  options: { page?: number; pageSize?: number } = {}
): Promise<Article[]> {
  const { page = 1, pageSize = 10 } = options;
  const params = new URLSearchParams({
    page: page.toString(),
    limit: pageSize.toString(),
  });
  const response = await makeAuthenticatedRequest(
    `/news/category/${categoryId}?${params}`
  );
  return response.data.articles || [];
}

export async function getRelatedArticles(
  categoryId: string,
  excludeId: string,
  limit = 3
): Promise<Article[]> {
  const params = new URLSearchParams({
    limit: limit.toString(),
  });
  const response = await makeAuthenticatedRequest(
    `/news/${excludeId}/related?${params}`
  );
  return response.data.articles || [];
}

// // ————————————————————————————————————————————————————————————————
// //  Bookmarks
// // ————————————————————————————————————————————————————————————————

export async function getUserBookmarks(): Promise<Article[]> {
  const response = await makeAuthenticatedRequest(`/bookmarks`);
  return response.bookmarks || [];
}

export async function addBookmark(articleId: string): Promise<void> {
  await makeAuthenticatedRequest(`/bookmarks`, {
    method: "POST",
    body: JSON.stringify({ articleId }),
  });
}

export async function removeBookmark(articleId: string): Promise<void> {
  await makeAuthenticatedRequest(`/bookmarks/${articleId}`, {
    method: "DELETE",
  });
}

export async function isArticleBookmarked(articleId: string): Promise<boolean> {
  try {
    const response = await makeAuthenticatedRequest(
      `/bookmarks/check/${articleId}`
    );
    return response.isBookmarked;
  } catch {
    return false;
  }
}
