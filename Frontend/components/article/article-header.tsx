"use client"

import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Bookmark, Share2, Eye } from "lucide-react"
import { useBookmarks } from "@/lib/hooks/use-bookmarks"
import type { Article } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { CATEGORIES } from "@/lib/constants"

interface ArticleHeaderProps {
  article: Article
}

export function ArticleHeader({ article }: ArticleHeaderProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const categoryName = CATEGORIES.find((cat) => cat.id === article.category)?.name || ""

  const handleShareClick = () => {
    if (navigator.share) {
      navigator
        .share({
          title: article.title,
          text: article.description,
          url: window.location.href,
        })
        .catch(console.error)
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  // Format view count for display
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`
    }
    return `${count} views`
  }

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center space-x-2">
        <Link
          href={`/category/${article.category}`}
          className="rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary hover:bg-primary/20"
        >
          {categoryName}
        </Link>
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
        </span>

        {/* View count */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Eye className="h-4 w-4 mr-1" />
          <span>{formatViewCount(article.viewCount)}</span>
        </div>
      </div>

      <h1 className="mb-4 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">{article.title}</h1>

      <p className="mb-6 text-xl text-muted-foreground">{article.description}</p>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <Image
              src="/placeholder.svg?height=40&width=40"
              alt={article.author || "Author"}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-medium">{article.author || "Staff Writer"}</p>
            <p className="text-sm text-muted-foreground">{article.source}</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
            onClick={() => toggleBookmark(article.id)}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked(article.id) ? "fill-primary text-primary" : ""}`} />
            <span>{isBookmarked(article.id) ? "Saved" : "Save"}</span>
          </Button>

          <Button variant="outline" size="sm" className="flex items-center space-x-2" onClick={handleShareClick}>
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </div>

      {article.imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={article.imageUrl || "/placeholder.svg"}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
    </div>
  )
}
