"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { setCookieConsent, getCookieConsent } from "@/lib/cookies"

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    // Check if user has already given consent
    const hasConsented = getCookieConsent()
    if (hasConsented === undefined || hasConsented === null) {
      // Only show the consent banner if consent hasn't been given yet
      setShowConsent(true)
    }
  }, [])

  const handleAccept = () => {
    setCookieConsent(true)
    setShowConsent(false)
  }

  const handleDecline = () => {
    setCookieConsent(false)
    setShowConsent(false)
  }

  if (!showConsent) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t p-4 shadow-lg">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-1">We use cookies</h3>
            <p className="text-sm text-muted-foreground">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
              By clicking "Accept All", you consent to our use of cookies.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleDecline}>
              Decline
            </Button>
            <Button size="sm" onClick={handleAccept}>
              Accept All
            </Button>
            <Button variant="ghost" size="icon" className="ml-2" onClick={() => setShowConsent(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
