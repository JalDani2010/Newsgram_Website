"use client";

import { useSearchParams } from "next/navigation";
import { NewsList } from "@/components/news/news-list";
import { CategoryFilter } from "@/components/filters/category-filter";
import { DateFilter } from "@/components/filters/date-filter";

export default function NewsHomePage() {
  const searchParams = useSearchParams();

  const category = searchParams.get("category") || "";
  const date = searchParams.get("date") || "";
  const preset = searchParams.get("preset") || "";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Top Headlines</h1>
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <CategoryFilter />
            <DateFilter />
          </div>
        </div>
      </div>

      {/* Pass filter values to NewsList */}
      <NewsList />
    </div>
  );
}
