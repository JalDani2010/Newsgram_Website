"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CATEGORIES } from "@/lib/constants"

export function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category") || ""

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (categoryId) {
      params.set("category", categoryId)
    } else {
      params.delete("category")
    }

    const query = params.toString()
    const url = query ? `?${query}` : window.location.pathname
    router.push(url)
  }

  const currentCategoryName = currentCategory
    ? CATEGORIES.find((cat) => cat.id === currentCategory)?.name
    : "All Categories"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-muted/30">
          <span>{currentCategoryName}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleCategoryChange("")} className="flex items-center justify-between">
            <span>All Categories</span>
            {!currentCategory && <Check className="h-4 w-4" />}
          </DropdownMenuItem>

          {CATEGORIES.map((category) => (
            <DropdownMenuItem
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className="flex items-center justify-between"
            >
              <span>{category.name}</span>
              {currentCategory === category.id && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
