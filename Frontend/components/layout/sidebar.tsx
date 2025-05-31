"use client"

import type React from "react"

import { usePathname, useSearchParams } from "next/navigation"
import { Newspaper, TrendingUp, Bookmark, Clock, Layers } from "lucide-react"
import { CATEGORIES } from "@/lib/constants"

// Define which routes are available in your application
const AVAILABLE_ROUTES = {
  home: true, // Top Headlines - usually available
  trending: false, // Set to true if this route exists
  bookmarks: false, // Set to true if this route exists
  readLater: false, // Set to true if this route exists
  categories: true, // Set to true if category filtering works
}

export function Sidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category") || ""

  const handleClick = (e: React.MouseEvent, isAvailable: boolean, routeName: string) => {
    if (!isAvailable) {
      e.preventDefault()
      e.stopPropagation()
      // Optional: Show a message that this feature is coming soon
      // alert(`${routeName} feature is coming soon!`)
      return false
    }
  }

  // Helper function to get link classes
  const getLinkClasses = (isActive: boolean, isAvailable: boolean) => {
    let classes = "flex items-center gap-3 px-3 py-2 rounded-md transition-colors "

    if (isActive) {
      classes += "bg-accent text-primary "
    }

    if (isAvailable) {
      classes += "hover:bg-accent cursor-pointer"
    } else {
      classes += "opacity-50 cursor-not-allowed hover:bg-transparent"
    }

    return classes
  }

  return (
    <aside className="w-64 hidden md:block sidebar overflow-y-auto">
      <div className="p-4">
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">Discover</h3>
          <nav>
            <ul className="space-y-2">
              {/* Top Headlines */}
              <li>
                <a
                  href="/"
                  className={getLinkClasses(pathname === "/", AVAILABLE_ROUTES.home)}
                  onClick={(e) => handleClick(e, AVAILABLE_ROUTES.home, "Top Headlines")}
                >
                  <Newspaper className="h-5 w-5" />
                  <span>Top Headlines</span>
                </a>
              </li>

              {/* Trending */}
              <li>
                <a
                  href="/trending"
                  className={getLinkClasses(pathname === "/trending", AVAILABLE_ROUTES.trending)}
                  onClick={(e) => handleClick(e, AVAILABLE_ROUTES.trending, "Trending")}
                >
                  <TrendingUp className="h-5 w-5" />
                  <span>Trending</span>
                </a>
              </li>

              {/* Bookmarks */}
              <li>
                <a
                  href="/bookmarks"
                  className={getLinkClasses(pathname === "/bookmarks", AVAILABLE_ROUTES.bookmarks)}
                  onClick={(e) => handleClick(e, AVAILABLE_ROUTES.bookmarks, "Bookmarks")}
                >
                  <Bookmark className="h-5 w-5" />
                  <span>Bookmarks</span>
                </a>
              </li>

              {/* Read Later */}
              <li>
                <a
                  href="/read-later"
                  className={getLinkClasses(pathname === "/read-later", AVAILABLE_ROUTES.readLater)}
                  onClick={(e) => handleClick(e, AVAILABLE_ROUTES.readLater, "Read Later")}
                >
                  <Clock className="h-5 w-5" />
                  <span>Read Later</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">Categories</h3>
          <nav>
            <ul className="space-y-2">
              {CATEGORIES.map((category) => (
                <li key={category.id}>
                  <a
                    href={`/news?category=${category.id}`}
                    className={getLinkClasses(currentCategory === category.id, AVAILABLE_ROUTES.categories)}
                    onClick={(e) => handleClick(e, AVAILABLE_ROUTES.categories, category.name)}
                  >
                    <Layers className="h-5 w-5" />
                    <span>{category.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </aside>
  )
}
