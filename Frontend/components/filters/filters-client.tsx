"use client"

import { CategoryFilter } from "@/components/filters/category-filter"
import { DateFilter } from "@/components/filters/date-filter"

export function FiltersClient() {
  return (
    <div className="flex flex-wrap items-center gap-4 justify-between">
      <div className="flex flex-wrap items-center gap-4">
        <CategoryFilter />
        <DateFilter />
      </div>
    </div>
  )
}
