"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getArticlesByCategory } from "@/lib/api/news";
import { NewsList } from "@/components/news/news-list";
import { DateFilter } from "@/components/filters/date-filter";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import type { Article } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { useSearchParams } from "next/navigation";

export default function CategoryPage() {
  const { id } = useParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const preset = searchParams.get("preset") || "";
  const date = searchParams.get("date") || "";

  const categoryName =
    CATEGORIES.find((cat) => cat.id === id)?.name || "Unknown Category";

  useEffect(() => {
    const fetchCategoryArticles = async () => {
      try {
        setIsLoading(true);
        // either
        const data = await getArticlesByCategory(id as string, {
          page: 1,
          pageSize: 10,
          // note: your existing getArticlesByCategory signature doesn't accept date,
          // so you may want to switch to getTopHeadlines here instead if you need date
        });
        setArticles(data);
      } catch {
        setError("Failed to load category articles");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchCategoryArticles();
  }, [id, preset, date]); // << add preset and date here

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{categoryName}</h1>
      <div className="mb-6 flex flex-wrap items-center gap-4">
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
          <p className="text-lg text-muted-foreground">
            No articles found in this category.
          </p>
        </div>
      ) : (
        <NewsList initialArticles={articles} />
      )}
    </div>
  );
}
