"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { searchArticles } from "@/lib/api/news"
import type { Article } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([])
        return
      }

      try {
        setIsLoading(true)
        const results = await searchArticles(query, { limit: 5 })
        setSuggestions(results)
      } catch (error) {
        console.error("Error fetching suggestions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setIsFocused(false)
    }
  }

  const handleSuggestionClick = (articleId: string) => {
    router.push(`/article/${articleId}`)
    setQuery("")
    setSuggestions([])
    setIsFocused(false)
  }

  const clearSearch = () => {
    setQuery("")
    setSuggestions([])
    inputRef.current?.focus()
  }

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search news..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="w-full pr-10"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {query ? (
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={clearSearch}>
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </form>

      {isFocused && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-background p-2 shadow-lg">
          <ul>
            {suggestions.map((article) => (
              <li key={article.id}>
                <button
                  className="w-full rounded-md px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleSuggestionClick(article.id)}
                >
                  <p className="line-clamp-1 font-medium">{article.title}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{article.source}</p>
                </button>
              </li>
            ))}
            <li className="mt-1 border-t pt-1">
              <button
                className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-primary hover:bg-accent"
                onClick={handleSubmit}
              >
                Search for "{query}"
              </button>
            </li>
          </ul>
        </div>
      )}

      {isFocused && isLoading && (
        <div className="absolute z-10 mt-1 flex w-full items-center justify-center rounded-md border bg-background p-4 shadow-lg">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  )
}
