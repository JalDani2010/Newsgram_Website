"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Menu, X, Search, User, Bell } from "lucide-react"
import { SearchBar } from "@/components/filters/search-bar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { ProfileCompletionIndicator } from "@/components/layout/profile-completion-indicator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getProfileCompletion, getUserData, clearAllCookies } from "@/lib/cookies"

// Define which features are available
const AVAILABLE_FEATURES = {
  search: false, // Set to true when search functionality is implemented
  notifications: false, // Set to true when notifications are implemented
  bookmarks: false, // Set to true when bookmarks page exists
  settings: false, // Set to true when settings page exists
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showProfileIndicator, setShowProfileIndicator] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category") || ""

  // Load user data and check if we should show the profile completion indicator
  useEffect(() => {
    // Get user data from cookies
    const user = getUserData()
    if (user) {
      setUserData(user)
    }

    // Check profile completion
    const profileCompletion = getProfileCompletion()
    if (profileCompletion && profileCompletion >= 100) {
      setShowProfileIndicator(false)
    } else {
      setShowProfileIndicator(true)
    }

    const handleProfileUpdate = (event: any) => {
      if (event.detail && typeof event.detail.completion === "number") {
        if (event.detail.completion >= 100) {
          // Maybe keep it visible for a bit with a success message
          setTimeout(() => {
            setShowProfileIndicator(false)
          }, 3000)
        } else {
          setShowProfileIndicator(true)
        }
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = () => {
    // Clear all cookies
    clearAllCookies()

    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.clear()
    }

    // Redirect to login page
    router.push("/login")
  }

  const handleDisabledFeature = (featureName: string) => {
    // Optional: Show a message that this feature is coming soon
    // alert(`${featureName} feature is coming soon!`)
  }

  const handleSearchInput = (e: React.FormEvent) => {
    if (!AVAILABLE_FEATURES.search) {
      e.preventDefault()
      handleDisabledFeature("Search")
    }
  }

  const handleLinkClick = (e: React.MouseEvent, isAvailable: boolean, featureName: string) => {
    if (!isAvailable) {
      e.preventDefault()
      e.stopPropagation()
      handleDisabledFeature(featureName)
      return false
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-background navbar">
      {showProfileIndicator && <ProfileCompletionIndicator />}

      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/news" className="mr-6 flex items-center space-x-2">
            <span className="text-2xl font-bold text-foreground">NewsApp</span>
          </Link>
          <nav className="hidden md:flex">
            <ul className="flex space-x-6">
              <li>
                <Link
                  href="/news"
                  className={`hover:text-primary ${pathname === "/news" ? "text-primary font-medium" : ""}`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href={`/news?category=technology`}
                  className={`hover:text-primary ${currentCategory === "technology" ? "text-primary font-medium" : ""}`}
                >
                  Technology
                </Link>
              </li>
              <li>
                <Link
                  href={`/news?category=business`}
                  className={`hover:text-primary ${currentCategory === "business" ? "text-primary font-medium" : ""}`}
                >
                  Business
                </Link>
              </li>
              <li>
                <Link
                  href={`/news?category=science`}
                  className={`hover:text-primary ${currentCategory === "science" ? "text-primary font-medium" : ""}`}
                >
                  Science
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search Input - Disabled when not available */}
          <div className="hidden md:block w-64 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search
                className={`h-4 w-4 ${
                  AVAILABLE_FEATURES.search ? "text-muted-foreground" : "text-muted-foreground/50"
                }`}
              />
            </div>
            <input
              type="search"
              placeholder={AVAILABLE_FEATURES.search ? "Search news..." : "Search coming soon..."}
              className={`w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                !AVAILABLE_FEATURES.search ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!AVAILABLE_FEATURES.search}
              onFocus={handleSearchInput}
            />
          </div>

          {/* Notifications dropdown - Disabled when not available */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`relative ${!AVAILABLE_FEATURES.notifications ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={!AVAILABLE_FEATURES.notifications}
                onClick={() => !AVAILABLE_FEATURES.notifications && handleDisabledFeature("Notifications")}
              >
                <Bell className="h-5 w-5" />
                {AVAILABLE_FEATURES.notifications && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    3
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            {AVAILABLE_FEATURES.notifications && (
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[1, 2, 3].map((i) => (
                  <DropdownMenuItem key={i} className="flex flex-col items-start py-2">
                    <div className="font-medium">New article in Technology</div>
                    <div className="text-sm text-muted-foreground">
                      Check out the latest tech news about AI advancements
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">2 hours ago</div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-primary">
                  <Link href="/notifications">View all notifications</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>

          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 overflow-hidden">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={userData?.avatar || "/placeholder.svg?height=32&width=32&text=JD"}
                    alt={userData?.name || "User"}
                  />
                  <AvatarFallback>
                    {userData?.name
                      ? userData.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                      : "JD"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/profile" className="flex w-full items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={!AVAILABLE_FEATURES.bookmarks ? "opacity-50" : ""}
                onClick={(e) => handleLinkClick(e, AVAILABLE_FEATURES.bookmarks, "Bookmarks")}
              >
                <a
                  href="/bookmarks"
                  className="flex w-full items-center"
                  onClick={(e) => handleLinkClick(e, AVAILABLE_FEATURES.bookmarks, "Bookmarks")}
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  Bookmarks
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={!AVAILABLE_FEATURES.settings ? "opacity-50" : ""}
                onClick={(e) => handleLinkClick(e, AVAILABLE_FEATURES.settings, "Settings")}
              >
                <a
                  href="/settings"
                  className="flex w-full items-center"
                  onClick={(e) => handleLinkClick(e, AVAILABLE_FEATURES.settings, "Settings")}
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Settings
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <div className="flex w-full items-center">
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="container mx-auto px-4 pb-4 md:hidden">
          <div className="mb-4">
            {AVAILABLE_FEATURES.search ? (
              <SearchBar />
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground/50" />
                </div>
                <input
                  type="search"
                  placeholder="Search coming soon..."
                  className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-md opacity-50 cursor-not-allowed"
                  disabled
                />
              </div>
            )}
          </div>
          <nav>
            <ul className="flex flex-col space-y-2">
              <li>
                <Link
                  href="/news"
                  className={`block p-2 hover:bg-accent hover:text-accent-foreground rounded-md ${
                    pathname === "/news" ? "bg-accent text-accent-foreground" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/category/technology"
                  className={`block p-2 hover:bg-accent hover:text-accent-foreground rounded-md ${
                    pathname === "/category/technology" ? "bg-accent text-accent-foreground" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Technology
                </Link>
              </li>
              <li>
                <Link
                  href="/category/business"
                  className={`block p-2 hover:bg-accent hover:text-accent-foreground rounded-md ${
                    pathname === "/category/business" ? "bg-accent text-accent-foreground" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Business
                </Link>
              </li>
              <li>
                <Link
                  href="/category/science"
                  className={`block p-2 hover:bg-accent hover:text-accent-foreground rounded-md ${
                    pathname === "/category/science" ? "bg-accent text-accent-foreground" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Science
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className={`block p-2 hover:bg-accent hover:text-accent-foreground rounded-md ${
                    pathname === "/profile" ? "bg-accent text-accent-foreground" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}
