import type React from "react";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Bookmark, Share2, Eye, MessageSquare } from "lucide-react";
import { useBookmarks } from "@/lib/hooks/use-bookmarks";
import type { Article } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/constants";

interface NewsCardProps {
  article: Article;
}

export function NewsCard({ article }: NewsCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [imageLoaded, setImageLoaded] = useState(false);

  const categoryName =
    CATEGORIES.find((cat) => cat.id === article.category)?.name || "";

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(article.id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      navigator
        .share({
          title: article.title,
          text: article.description,
          url: `/article/${article.id}`,
        })
        .catch(console.error);
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(
        window.location.origin + `/article/${article.id}`
      );
      alert("Link copied to clipboard!");
    }
  };

  // Format view count for display
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md news-card"
    >
      <Link href={`/article/${article.id}`} className="block">
        <div className="relative aspect-video overflow-hidden bg-muted article-card-image">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <LoadingSpinner size="sm" />
            </div>
          )}
          <Image
            src={article.imageUrl || "/placeholder.svg?height=200&width=400"}
            alt={article.title}
            fill
            className={`object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {categoryName && (
            <div className="absolute left-3 top-3 rounded-md bg-primary/80 px-2 py-1 text-xs font-medium text-primary-foreground category-badge">
              {categoryName}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="mb-2 line-clamp-2 text-xl font-semibold group-hover:text-primary">
            {article.title}
          </h3>
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {article.description}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <span>
                {formatDistanceToNow(new Date(article.publishedAt), {
                  addSuffix: true,
                })}
              </span>
              <span className="mx-2">•</span>
              <span>{article.source}</span>
            </div>

            <div className="flex space-x-2">
              {/* View count */}
              <div className="flex items-center mr-2">
                <Eye className="h-4 w-4 mr-1" />
                <span>{formatViewCount(article.viewCount)}</span>
              </div>

              {/* Comment count */}
              <div className="flex items-center mr-2">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{article.comments?.length || 0}</span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleBookmarkClick}
                aria-label={
                  isBookmarked(article.id)
                    ? "Remove from bookmarks"
                    : "Add to bookmarks"
                }
              >
                <Bookmark
                  className={`h-4 w-4 ${
                    isBookmarked(article.id) ? "fill-primary text-primary" : ""
                  }`}
                />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleShareClick}
                aria-label="Share article"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function LoadingSpinner({
  size = "default",
}: {
  size?: "default" | "sm" | "lg";
}) {
  const sizeClasses = {
    default: "h-8 w-8",
    sm: "h-5 w-5",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-2 border-current border-t-transparent text-primary ${sizeClasses[size]}`}
      />
    </div>
  );
}
