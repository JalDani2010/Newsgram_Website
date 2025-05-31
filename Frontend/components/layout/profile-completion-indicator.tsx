"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { User, ChevronRight } from "lucide-react"
import { getProfileCompletion } from "@/lib/cookies"

export function ProfileCompletionIndicator() {
  const [completion, setCompletion] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Try to get the completion from cookies
    const storedCompletion = getProfileCompletion()
    if (storedCompletion) {
      setCompletion(storedCompletion)
    } else {
      // Fallback to localStorage if cookie is not available
      const localStorageCompletion = localStorage.getItem("profileCompletion")
      if (localStorageCompletion) {
        setCompletion(Number.parseInt(localStorageCompletion, 10))
      }
    }

    // Listen for updates from the profile page
    const handleProfileUpdate = (event: any) => {
      if (event.detail && typeof event.detail.completion === "number") {
        setCompletion(event.detail.completion)
      }
    }

    // Only add event listeners in the browser
    if (typeof window !== "undefined") {
      window.addEventListener("profileCompletionUpdated", handleProfileUpdate as EventListener)

      return () => {
        window.removeEventListener("profileCompletionUpdated", handleProfileUpdate as EventListener)
      }
    }
  }, [])

  // Hide the indicator if profile is complete
  useEffect(() => {
    if (completion >= 100) {
      // Maybe show it for a bit with a success message before hiding
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 3000)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(true)
    }
  }, [completion])

  if (!isVisible) return null

  return (
    <div className="w-full bg-muted/50 border-b">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {completion < 100 ? `Complete your profile (${completion}%)` : "Profile complete! 🎉"}
            </span>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Progress value={completion} className="h-2 w-full sm:w-32 md:w-48" />

            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link href="/profile">
                {completion < 100 ? "Complete Now" : "View Profile"}
                <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
