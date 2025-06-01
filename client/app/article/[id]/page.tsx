"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getArticleById } from "@/lib/api/news"
import { ArticleHeader } from "@/components/article/article-header"
import { ArticleContent } from "@/components/article/article-content"
import { ArticleComments } from "@/components/article/article-comments"
import { RelatedArticles } from "@/components/article/related-articles"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import type { Article } from "@/lib/types"

export default function ArticlePage() {
  const { id } = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true)
        const data = await getArticleById(id as string)
        setArticle(data)
      } catch (err) {
        setError("Failed to load article")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchArticle()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="container mx-auto flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !article) {
    return <ErrorMessage message={error || "Article not found"} />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ArticleHeader article={article} />
      <ArticleContent article={article} />
      <ArticleComments articleId={article.id} initialCommentCount={article.comments?.length || 0} />
      <RelatedArticles categoryId={article.category} excludeId={article.id} />
    </div>
  )
}
