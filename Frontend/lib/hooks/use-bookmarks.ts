"use client";

import { useState, useEffect, useCallback } from "react";
import { getUserBookmarks, addBookmark, removeBookmark } from "@/lib/api/news";

/**
 * Custom hook to manage user bookmarks with server sync and localStorage fallback.
 */
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load bookmarks from API on mount; fall back to localStorage if API fails.
  useEffect(() => {
    let isMounted = true;

    const loadBookmarks = async () => {
      try {
        const userBookmarks = await getUserBookmarks();
        const bookmarkIds = userBookmarks.map((article) => article.id);

        if (isMounted) {
          setBookmarks(bookmarkIds);
          localStorage.setItem("news-app-bookmarks", JSON.stringify(bookmarkIds));
        }
      } catch (error) {
        console.error("Failed to load bookmarks from API:", error);
        if (isMounted) {
          const stored = localStorage.getItem("news-app-bookmarks");
          if (stored) {
            try {
              const parsed = JSON.parse(stored) as string[];
              setBookmarks(parsed);
            } catch (e) {
              console.error("Failed to parse localStorage bookmarks:", e);
            }
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadBookmarks();
    return () => {
      isMounted = false;
    };
  }, []);

  // Check if a given articleId is currently bookmarked
  const isBookmarked = useCallback(
    (articleId: string) => {
      return bookmarks.includes(articleId);
    },
    [bookmarks]
  );

  // Toggle bookmark: optimistically update state & localStorage, then sync to server.
  const toggleBookmark = useCallback(
    async (articleId: string) => {
      const currentlyBookmarked = bookmarks.includes(articleId);
      let updatedBookmarks: string[];

      if (currentlyBookmarked) {
        // Remove bookmark optimistically
        updatedBookmarks = bookmarks.filter((id) => id !== articleId);
        setBookmarks(updatedBookmarks);
        localStorage.setItem("news-app-bookmarks", JSON.stringify(updatedBookmarks));

        try {
          await removeBookmark(articleId);
        } catch (error) {
          console.error("Failed to remove bookmark on server:", error);
          // Revert state if server call fails
          setBookmarks((prev) => {
            const reverted = [...prev, articleId];
            localStorage.setItem("news-app-bookmarks", JSON.stringify(reverted));
            return reverted;
          });
        }
      } else {
        // Add bookmark optimistically
        updatedBookmarks = [...bookmarks, articleId];
        setBookmarks(updatedBookmarks);
        localStorage.setItem("news-app-bookmarks", JSON.stringify(updatedBookmarks));

        try {
          await addBookmark(articleId);
        } catch (error) {
          console.error("Failed to add bookmark on server:", error);
          // Revert state if server call fails
          setBookmarks((prev) => {
            const reverted = prev.filter((id) => id !== articleId);
            localStorage.setItem("news-app-bookmarks", JSON.stringify(reverted));
            return reverted;
          });
        }
      }
    },
    [bookmarks]
  );

  // Return a shallow copy of all bookmarked IDs
  const getBookmarkedIds = useCallback(() => {
    return [...bookmarks];
  }, [bookmarks]);

  // Clear all bookmarks: optimistically clear, then attempt server‐side removal.
  const clearBookmarks = useCallback(async () => {
    const previousBookmarks = [...bookmarks];
    setBookmarks([]);
    localStorage.removeItem("news-app-bookmarks");

    try {
      await Promise.all(previousBookmarks.map((id) => removeBookmark(id)));
    } catch (error) {
      console.error("Failed to clear bookmarks on server:", error);
      // Restore previous state if server call fails
      setBookmarks(previousBookmarks);
      localStorage.setItem("news-app-bookmarks", JSON.stringify(previousBookmarks));
    }
  }, [bookmarks]);

  return {
    isBookmarked,
    toggleBookmark,
    getBookmarkedIds,
    clearBookmarks,
    isLoading,
  };
}
