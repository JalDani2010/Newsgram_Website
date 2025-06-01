// app/news/NewsClient.tsx
"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { NewsList } from "@/components/news/news-list";

export default function NewsClient() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const date = searchParams.get("date") || "";
  const preset = searchParams.get("preset") || "";

  return <NewsList />;
}
