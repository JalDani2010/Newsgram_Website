"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { searchArticles } from "@/lib/api/news"
import { NewsList } from "@/components/news/news-list"
import { CategoryFilter } from "@/components/filters/category-filter"
import { DateFilter } from "@/components/filters/date-filter"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import type { Article } from "@/lib/types"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setIsLoading(true)
        const data = await searchArticles(query, { category })
        setArticles(data)
      } catch (err) {
        setError("Failed to load search results")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSearchResults()
  }, [query, category])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">
        Search Results: <span className="text-primary">{query}</span>
      </h1>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <CategoryFilter />
        <DateFilter />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : articles.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-lg text-muted-foreground">No articles found for your search.</p>
        </div>
      ) : (
        <NewsList initialArticles={articles} />
      )}
    </div>
  )
}
