"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Shield, User, Globe, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getPrivacySettings, setPrivacySettings } from "@/lib/cookies"

// Default privacy settings
const defaultSettings = {
  profileVisibility: "public",
  showEmail: false,
  showLocation: true,
  allowDataCollection: true,
  allowPersonalization: true,
  allowThirdPartySharing: false,
  allowCommentNotifications: true,
  allowMarketingEmails: false,
}

export default function PrivacySettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [settings, setSettings] = useState(defaultSettings)
  const router = useRouter()

  // Load settings from cookies on initial render
  useEffect(() => {
    const savedSettings = getPrivacySettings()
    if (savedSettings) {
      setSettings(savedSettings)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call to update privacy settings
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Save settings to cookies
      setPrivacySettings(settings)

      setSuccess("Privacy settings updated successfully")

      // Redirect after a delay
      setTimeout(() => {
        router.push("/profile")
      }, 2000)
    } catch (err) {
      console.error("Failed to update privacy settings", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSwitchChange = (key: string, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: checked,
    }))
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/profile")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Profile
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-primary" />
            Privacy Settings
          </CardTitle>
          <CardDescription>Control how your information is used and who can see it</CardDescription>
        </CardHeader>

        <CardContent>
          {success && (
            <Alert className="mb-6 bg-green-500/10 text-green-500 border-green-500/20">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <User className="mr-2 h-4 w-4" />
                Profile Privacy
              </h3>

              <div className="space-y-4">
                <div>
                  <Label className="text-base">Who can see your profile?</Label>
                  <RadioGroup
                    value={settings.profileVisibility}
                    onValueChange={(value) => setSettings({ ...settings, profileVisibility: value })}
                    className="mt-2 space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" />
                      <Label htmlFor="public" className="font-normal">
                        Public (Anyone can view)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="registered" id="registered" />
                      <Label htmlFor="registered" className="font-normal">
                        Registered Users Only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" />
                      <Label htmlFor="private" className="font-normal">
                        Private (Only you)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showEmail">Show Email Address</Label>
                    <p className="text-sm text-muted-foreground">Allow other users to see your email address</p>
                  </div>
                  <Switch
                    id="showEmail"
                    checked={settings.showEmail}
                    onCheckedChange={(checked) => handleSwitchChange("showEmail", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showLocation">Show Location</Label>
                    <p className="text-sm text-muted-foreground">Display your location on your profile</p>
                  </div>
                  <Switch
                    id="showLocation"
                    checked={settings.showLocation}
                    onCheckedChange={(checked) => handleSwitchChange("showLocation", checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Globe className="mr-2 h-4 w-4" />
                Data & Personalization
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowDataCollection">Data Collection</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow us to collect usage data to improve our services
                    </p>
                  </div>
                  <Switch
                    id="allowDataCollection"
                    checked={settings.allowDataCollection}
                    onCheckedChange={(checked) => handleSwitchChange("allowDataCollection", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowPersonalization">Content Personalization</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow us to personalize content based on your interests
                    </p>
                  </div>
                  <Switch
                    id="allowPersonalization"
                    checked={settings.allowPersonalization}
                    onCheckedChange={(checked) => handleSwitchChange("allowPersonalization", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowThirdPartySharing">Third-Party Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">Allow sharing your data with trusted third parties</p>
                  </div>
                  <Switch
                    id="allowThirdPartySharing"
                    checked={settings.allowThirdPartySharing}
                    onCheckedChange={(checked) => handleSwitchChange("allowThirdPartySharing", checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                Communication Preferences
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowCommentNotifications">Comment Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when someone comments on your activity
                    </p>
                  </div>
                  <Switch
                    id="allowCommentNotifications"
                    checked={settings.allowCommentNotifications}
                    onCheckedChange={(checked) => handleSwitchChange("allowCommentNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowMarketingEmails">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Receive promotional emails and special offers</p>
                  </div>
                  <Switch
                    id="allowMarketingEmails"
                    checked={settings.allowMarketingEmails}
                    onCheckedChange={(checked) => handleSwitchChange("allowMarketingEmails", checked)}
                  />
                </div>
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter>
          <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Privacy Settings
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
