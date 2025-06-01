import { Suspense } from "react"
import { CategoryFilter } from "@/components/filters/category-filter"
import { DateFilter } from "@/components/filters/date-filter"
import NewsClient from "./NewsClient"

export default function NewsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Top Headlines</h1>
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <Suspense fallback={<FilterSkeleton />}>
              <CategoryFilter />
            </Suspense>
            <Suspense fallback={<FilterSkeleton />}>
              <DateFilter />
            </Suspense>
          </div>
        </div>
      </div>

      <Suspense fallback={<NewsLoadingFallback />}>
        <NewsClient />
      </Suspense>
    </div>
  )
}

function FilterSkeleton() {
  return <div className="h-10 w-32 animate-pulse rounded-md bg-muted"></div>
}

function NewsLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full border-2 border-current border-t-transparent text-primary h-12 w-12" />
    </div>
  )
}
