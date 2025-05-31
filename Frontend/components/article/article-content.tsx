"use client"

import { motion } from "framer-motion"
import type { Article } from "@/lib/types"

interface ArticleContentProps {
  article: Article
}

export function ArticleContent({ article }: ArticleContentProps) {
  // Split content into paragraphs
  const paragraphs = article.content.split("\n\n").filter(Boolean)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="prose prose-lg mx-auto max-w-3xl dark:prose-invert"
    >
      {paragraphs.map((paragraph, index) => (
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="mb-6"
        >
          {paragraph}
        </motion.p>
      ))}
    </motion.div>
  )
}
