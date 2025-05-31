"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { getTopHeadlines } from "@/lib/api/news"
import { NewsCard } from "@/components/news/news-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { Button } from "@/components/ui/button"
import type { Article } from "@/lib/types"
import { useInView } from "react-intersection-observer"
import { subDays, subMonths, subYears, formatISO } from "date-fns"

interface NewsListProps {
  initialArticles?: Article[]
}

export function NewsList({ initialArticles }: NewsListProps) {
  const searchParams = useSearchParams()
  const category = searchParams.get("category") || ""
  const preset = searchParams.get("preset") || "all"
  const customDate = searchParams.get("date") || ""

  // derive a single ISO date filter from preset or custom date
  const dateFilter = (() => {
    if (preset === "today")       return formatISO(subDays(new Date(), 1))
    if (preset === "week")        return formatISO(subDays(new Date(), 7))
    if (preset === "month")       return formatISO(subMonths(new Date(), 1))
    if (preset === "year")        return formatISO(subYears(new Date(), 1))
    if (preset === "custom" && customDate) return formatISO(new Date(customDate))
    return "" // no date filter
  })()

  const [articles, setArticles] = useState<Article[]>(initialArticles || [])
  const [isLoading, setIsLoading] = useState(!initialArticles)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: false })
  const initialFetchedRef = useRef(false)

  // whenever category/preset/dateFilter changes, reset back to page 1
  useEffect(() => {
    setPage(1)
    initialFetchedRef.current = false
    setArticles([])
    setHasMore(true)
  }, [category, preset, customDate])

  // initial fetch or refetch on filter change
  useEffect(() => {
    if (!initialFetchedRef.current) {
      initialFetchedRef.current = true
      fetchArticles(1)
    }
  }, [category, dateFilter])

  // infinite-scroll loader
  useEffect(() => {
    if (
      initialFetchedRef.current &&
      inView &&
      hasMore &&
      !loadingMore &&
      !isLoading
    ) {
      loadMore()
    }
  }, [inView, hasMore, loadingMore, isLoading])

  async function fetchArticles(pageNum: number) {
    try {
      pageNum === 1 ? setIsLoading(true) : setLoadingMore(true)

      const data = await getTopHeadlines({
        page: pageNum,
        pageSize: 10,
        category,
        date: dateFilter,
      })

      if (pageNum === 1) {
        setArticles(data)
      } else {
        setArticles((prev) => [...prev, ...data])
      }
      setHasMore(data.length === 10)
    } catch (err) {
      console.error(err)
      setError("Failed to load articles")
    } finally {
      setIsLoading(false)
      setLoadingMore(false)
    }
  }

  function loadMore() {
    const next = page + 1
    setPage(next)
    fetchArticles(next)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) return <ErrorMessage message={error} />

  if (articles.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-lg text-muted-foreground">No articles found.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, idx) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <NewsCard article={article} />
          </motion.div>
        ))}
      </div>

      {loadingMore && (
        <div className="mt-8 flex justify-center">
          <LoadingSpinner />
        </div>
      )}

      {hasMore && !loadingMore && (
        <div ref={ref} className="mt-8 flex justify-center">
          <Button onClick={loadMore} disabled={loadingMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
