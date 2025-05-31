"use client"

import { useEffect, useState } from "react"
import { getRelatedArticles } from "@/lib/api/news"
import { NewsCard } from "@/components/news/news-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import type { Article } from "@/lib/types"

interface RelatedArticlesProps {
  categoryId: string
  excludeId: string
}

export function RelatedArticles({ categoryId, excludeId }: RelatedArticlesProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      try {
        setIsLoading(true)
        const data = await getRelatedArticles(categoryId, excludeId)
        setArticles(data)
      } catch (err) {
        setError("Failed to load related articles")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelatedArticles()
  }, [categoryId, excludeId])

  if (isLoading) {
    return (
      <div className="mt-12 flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (articles.length === 0) {
    return null
  }

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="mb-6 text-2xl font-bold">Related Articles</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}
