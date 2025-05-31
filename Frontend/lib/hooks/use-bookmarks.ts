"use client"

import { useState, useEffect } from "react"
import { getUserBookmarks, addBookmark, removeBookmark } from "@/lib/api/news"

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load bookmarks from API on mount
  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const userBookmarks = await getUserBookmarks()
        const bookmarkIds = userBookmarks.map((article) => article.id)
        setBookmarks(bookmarkIds)
      } catch (error) {
        console.error("Failed to load bookmarks:", error)
        // Fallback to localStorage
        const storedBookmarks = localStorage.getItem("news-app-bookmarks")
        if (storedBookmarks) {
          try {
            setBookmarks(JSON.parse(storedBookmarks))
          } catch (error) {
            console.error("Failed to parse bookmarks:", error)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadBookmarks()
  }, [])

  // Check if an article is bookmarked
  const isBookmarked = (articleId: string) => {
    return bookmarks.includes(articleId)
  }

  // Toggle bookmark status
  const toggleBookmark = async (articleId: string) => {
    try {
      if (bookmarks.includes(articleId)) {
        await removeBookmark(articleId)
        setBookmarks((prev) => prev.filter((id) => id !== articleId))
      } else {
        await addBookmark(articleId)
        setBookmarks((prev) => [...prev, articleId])
      }

      // Also update localStorage as backup
      const newBookmarks = bookmarks.includes(articleId)
        ? bookmarks.filter((id) => id !== articleId)
        : [...bookmarks, articleId]
      localStorage.setItem("news-app-bookmarks", JSON.stringify(newBookmarks))
    } catch (error) {
      console.error("Failed to toggle bookmark:", error)
      // Fallback to localStorage only
      setBookmarks((prev) => {
        const newBookmarks = prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId]
        localStorage.setItem("news-app-bookmarks", JSON.stringify(newBookmarks))
        return newBookmarks
      })
    }
  }

  // Get all bookmarked article IDs
  const getBookmarkedIds = () => {
    return [...bookmarks]
  }

  // Clear all bookmarks
  const clearBookmarks = async () => {
    try {
      // Clear from server (would need an API endpoint)
      const promises = bookmarks.map((id) => removeBookmark(id))
      await Promise.all(promises)
    } catch (error) {
      console.error("Failed to clear bookmarks on server:", error)
    }

    setBookmarks([])
    localStorage.removeItem("news-app-bookmarks")
  }

  return {
    isBookmarked,
    toggleBookmark,
    getBookmarkedIds,
    clearBookmarks,
    isLoading,
  }
}

