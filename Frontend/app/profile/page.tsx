"use client";

import type React from "react";
import { User } from "lucide-react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  MapPin,
  Globe,
  Calendar,
  Edit3,
  Camera,
  Save,
  X,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { deleteAccount } from "@/lib/api/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  getUserData,
  setUserData,
  getProfileCompletion,
  setProfileCompletion,
  getNotificationPreferences,
  setNotificationPreferences,
  getCookie,
  COOKIE_KEYS,
} from "@/lib/cookies";
import { updateUserProfile, getCurrentUser } from "@/lib/api/auth";

// Initial user data structure
const initialUserData = {
  name: "",
  email: "",
  bio: "",
  location: "",
  website: "",
  joinDate: "May 2025",
  avatar: "/placeholder.svg?height=200&width=200&text=JD",
  interests: [] as string[],
  socialLinks: {
    twitter: "",
    linkedin: "",
    facebook: "",
  },
  notificationPreferences: {
    emailDigest: true,
    breakingNews: true,
    comments: false,
    recommendations: true,
  },
};

export default function ProfilePage() {
  const [userData, setUserDataState] = useState(initialUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(initialUserData);
  const [profileCompletion, setProfileCompletionState] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // Load user data from API and cookies on initial render
  const handleDeleteAccount = async () => {
    // Ask the user for their password
    const password = window.prompt(
      "Enter your password to confirm account deletion:"
    );
    if (!password) {
      return;
    }

    if (!confirm("Are you sure? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = getCookie(COOKIE_KEYS.AUTH_TOKEN);
      if (!token) throw new Error("Not authenticated");
      await deleteAccount(token, password);
      // Clear cookies/localStorage, then redirect:
      router.push("/login");
    } catch (err: any) {
      console.error("Delete account failed:", err);
      alert(err.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = getCookie(COOKIE_KEYS.AUTH_TOKEN);
        if (!token) {
          router.push("/login");
          return;
        }

        // Try to get fresh data from API
        try {
          const apiUserData = await getCurrentUser(token);
          if (apiUserData) {
            setUserDataState(apiUserData);
            setEditedData(apiUserData);
            setUserData(apiUserData); // Update cookies
          }
        } catch (apiError) {
          console.error("Failed to fetch user from API:", apiError);
          // Fallback to cookie data
          const savedUserData = getUserData();
          if (savedUserData) {
            setUserDataState(savedUserData);
            setEditedData(savedUserData);
          }
        }

        const savedCompletion = getProfileCompletion();
        if (savedCompletion) {
          setProfileCompletionState(savedCompletion);
        }

        const savedNotificationPrefs = getNotificationPreferences();
        if (savedNotificationPrefs) {
          setUserDataState((prev) => ({
            ...prev,
            notificationPreferences: savedNotificationPrefs,
          }));
          setEditedData((prev) => ({
            ...prev,
            notificationPreferences: savedNotificationPrefs,
          }));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setError("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  // Calculate profile completion percentage
  useEffect(() => {
    let completedFields = 0;
    let totalFields = 0;

    // Basic info
    const basicInfoFields = ["name", "email", "bio", "location", "website"];
    basicInfoFields.forEach((field) => {
      totalFields++;
      if (userData[field as keyof typeof userData]) completedFields++;
    });

    // Interests
    totalFields++;
    if (userData.interests.length > 0) completedFields++;

    // Social links
    Object.keys(userData.socialLinks).forEach((key) => {
      totalFields++;
      if (userData.socialLinks[key as keyof typeof userData.socialLinks])
        completedFields++;
    });

    // Avatar (counts more)
    totalFields += 2;
    if (userData.avatar !== "/placeholder.svg?height=200&width=200&text=JD")
      completedFields += 2;

    const percentage = Math.round((completedFields / totalFields) * 100);
    setProfileCompletionState(percentage);

    // Save to cookies
    setProfileCompletion(percentage);

    // Only run in browser environment
    if (typeof window !== "undefined") {
      // Save to localStorage for the navbar to access
      localStorage.setItem("profileCompletion", percentage.toString());

      // Dispatch an event for the navbar to listen to
      if (typeof CustomEvent === "function") {
        const event = new CustomEvent("profileCompletionUpdated", {
          detail: { completion: percentage },
        });
        window.dispatchEvent(event);
      }
    }
  }, [userData]);

  const handleEditToggle = async () => {
    if (isEditing) {
      // Save changes
      setIsSaving(true);
      setError("");

      try {
        const token = getCookie(COOKIE_KEYS.AUTH_TOKEN);
        if (token) {
          // Update via API
          const updatedUser = await updateUserProfile(token, editedData);
          setUserDataState(updatedUser);
          setUserData(updatedUser); // Update cookies
        } else {
          // Fallback to cookies only
          setUserDataState(editedData);
          setUserData(editedData);
        }

        // Update notification preferences in cookies
        setNotificationPreferences(editedData.notificationPreferences);
      } catch (error: any) {
        console.error("Failed to save profile:", error);
        setError(error.message || "Failed to save profile changes");
        // Don't exit edit mode if save failed
        setIsSaving(false);
        return;
      } finally {
        setIsSaving(false);
      }
    } else {
      // Start editing
      setEditedData(userData);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value,
      },
    }));
  };

  const handleNotificationChange = (name: string, checked: boolean) => {
    setEditedData((prev) => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [name]: checked,
      },
    }));
  };

  const handleInterestToggle = (category: string) => {
    setEditedData((prev) => {
      const interests = [...prev.interests];
      if (interests.includes(category)) {
        return { ...prev, interests: interests.filter((i) => i !== category) };
      } else {
        return { ...prev, interests: [...interests, category] };
      }
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(userData);
    setError("");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Button
          onClick={handleEditToggle}
          variant={isEditing ? "default" : "outline"}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving...
            </>
          ) : isEditing ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Profile completion card */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle>Profile Completion</CardTitle>
          <CardDescription>
            Complete your profile to get the most out of NewsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {profileCompletion}% Complete
              </span>
              <span className="text-sm text-muted-foreground">
                {profileCompletion < 100 ? "Keep going!" : "All done!"}
              </span>
            </div>
            <Progress value={profileCompletion} className="h-2" />
          </div>

          {profileCompletion < 100 && (
            <div className="mt-4 rounded-md bg-muted p-3">
              <h4 className="text-sm font-medium">Suggested next steps:</h4>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {!userData.bio && <li>• Add a short bio about yourself</li>}
                {!userData.location && <li>• Add your location</li>}
                {userData.interests.length === 0 && (
                  <li>• Select your news interests</li>
                )}
                {!userData.socialLinks.twitter &&
                  !userData.socialLinks.linkedin &&
                  !userData.socialLinks.facebook && (
                    <li>• Connect at least one social media account</li>
                  )}
                {userData.avatar ===
                  "/placeholder.svg?height=200&width=200&text=JD" && (
                  <li>• Upload a profile picture</li>
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left column - Profile picture and basic info */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 relative">
                <Avatar className="h-32 w-32 mx-auto">
                  <AvatarImage
                    src={isEditing ? editedData.avatar : userData.avatar}
                    alt="Profile picture"
                  />
                  <AvatarFallback className="text-2xl">
                    {userData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full"
                    onClick={() => console.log("Upload photo")}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <CardTitle>
                {isEditing ? editedData.name : userData.name}
              </CardTitle>
              <CardDescription className="flex items-center justify-center">
                <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                Joined {userData.joinDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!isEditing ? (
                  <>
                    {userData.bio && (
                      <div>
                        <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                          About
                        </h3>
                        <p>{userData.bio}</p>
                      </div>
                    )}

                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{userData.email}</span>
                    </div>

                    {userData.location && (
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{userData.location}</span>
                      </div>
                    )}

                    {userData.website && (
                      <div className="flex items-center">
                        <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                        <a
                          href={userData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {userData.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}

                    {/* Social links */}
                    {(userData.socialLinks.twitter ||
                      userData.socialLinks.linkedin ||
                      userData.socialLinks.facebook) && (
                      <div className="pt-2">
                        <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                          Connect
                        </h3>
                        <div className="flex space-x-2">
                          {userData.socialLinks.twitter && (
                            <Button variant="outline" size="icon" asChild>
                              <a
                                href={userData.socialLinks.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z" />
                                </svg>
                              </a>
                            </Button>
                          )}
                          {userData.socialLinks.linkedin && (
                            <Button variant="outline" size="icon" asChild>
                              <a
                                href={userData.socialLinks.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                              </a>
                            </Button>
                          )}
                          {userData.socialLinks.facebook && (
                            <Button variant="outline" size="icon" asChild>
                              <a
                                href={userData.socialLinks.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={editedData.name}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={editedData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us a bit about yourself"
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        value={editedData.email}
                        onChange={handleInputChange}
                        type="email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={editedData.location}
                        onChange={handleInputChange}
                        placeholder="City, Country"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        value={editedData.website}
                        onChange={handleInputChange}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Social Links</h3>

                      <div className="space-y-2">
                        <Label htmlFor="twitter" className="flex items-center">
                          <svg
                            className="mr-2 h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z" />
                          </svg>
                          Twitter
                        </Label>
                        <Input
                          id="twitter"
                          name="twitter"
                          value={editedData.socialLinks.twitter}
                          onChange={handleSocialLinkChange}
                          placeholder="https://twitter.com/username"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedin" className="flex items-center">
                          <svg
                            className="mr-2 h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                          LinkedIn
                        </Label>
                        <Input
                          id="linkedin"
                          name="linkedin"
                          value={editedData.socialLinks.linkedin}
                          onChange={handleSocialLinkChange}
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="facebook" className="flex items-center">
                          <svg
                            className="mr-2 h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          Facebook
                        </Label>
                        <Input
                          id="facebook"
                          name="facebook"
                          value={editedData.socialLinks.facebook}
                          onChange={handleSocialLinkChange}
                          placeholder="https://facebook.com/username"
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          className="w-full"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Tabs for different sections */}
        <div className="md:col-span-2">
          <Tabs defaultValue="interests" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="interests">Interests</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="interests">
              <Card>
                <CardHeader>
                  <CardTitle>News Interests</CardTitle>
                  <CardDescription>
                    Select categories you're interested in to personalize your
                    news feed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {CATEGORIES.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center space-x-2"
                      >
                        {isEditing ? (
                          <div
                            className={`flex cursor-pointer items-center rounded-md border p-2 ${
                              editedData.interests.includes(category.id)
                                ? "border-primary bg-primary/10"
                                : "border-border"
                            }`}
                            onClick={() => handleInterestToggle(category.id)}
                          >
                            <span
                              className={
                                editedData.interests.includes(category.id)
                                  ? "text-primary"
                                  : ""
                              }
                            >
                              {category.name}
                            </span>
                          </div>
                        ) : (
                          <Badge
                            variant={
                              userData.interests.includes(category.id)
                                ? "default"
                                : "outline"
                            }
                            className="px-3 py-1"
                          >
                            {category.name}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Your Activity</CardTitle>
                  <CardDescription>
                    View your recent activity on NewsApp
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div>
                      <h3 className="mb-4 text-lg font-medium">
                        Recently Read
                      </h3>
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-start space-x-4">
                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                              <img
                                src={`/placeholder.svg?height=64&width=64&text=News`}
                                alt="Article thumbnail"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">
                                Sample Article Title {i}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Read 2 days ago
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-4 text-lg font-medium">
                        Your Comments
                      </h3>
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <div key={i} className="rounded-lg border p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <h4 className="font-medium">
                                On: Sample Article Title {i}
                              </h4>
                              <span className="text-xs text-muted-foreground">
                                3 days ago
                              </span>
                            </div>
                            <p className="text-sm">
                              This is a great article! I learned a lot from it
                              and will be sharing it with my colleagues.
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-4 text-lg font-medium">Bookmarks</h3>
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-start space-x-4">
                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                              <img
                                src={`/placeholder.svg?height=64&width=64&text=News`}
                                alt="Article thumbnail"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">
                                Bookmarked Article {i}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Saved 5 days ago
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Manage how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailDigest">Weekly Email Digest</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive a weekly summary of top news in your interests
                        </p>
                      </div>
                      <Switch
                        id="emailDigest"
                        checked={
                          isEditing
                            ? editedData.notificationPreferences.emailDigest
                            : userData.notificationPreferences.emailDigest
                        }
                        onCheckedChange={
                          isEditing
                            ? (checked) =>
                                handleNotificationChange("emailDigest", checked)
                            : undefined
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="breakingNews">
                          Breaking News Alerts
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about major breaking news stories
                        </p>
                      </div>
                      <Switch
                        id="breakingNews"
                        checked={
                          isEditing
                            ? editedData.notificationPreferences.breakingNews
                            : userData.notificationPreferences.breakingNews
                        }
                        onCheckedChange={
                          isEditing
                            ? (checked) =>
                                handleNotificationChange(
                                  "breakingNews",
                                  checked
                                )
                            : undefined
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="comments">Comment Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive alerts when someone replies to your comments
                        </p>
                      </div>
                      <Switch
                        id="comments"
                        checked={
                          isEditing
                            ? editedData.notificationPreferences.comments
                            : userData.notificationPreferences.comments
                        }
                        onCheckedChange={
                          isEditing
                            ? (checked) =>
                                handleNotificationChange("comments", checked)
                            : undefined
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="recommendations">
                          Personalized Recommendations
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Get article recommendations based on your reading
                          history
                        </p>
                      </div>
                      <Switch
                        id="recommendations"
                        checked={
                          isEditing
                            ? editedData.notificationPreferences.recommendations
                            : userData.notificationPreferences.recommendations
                        }
                        onCheckedChange={
                          isEditing
                            ? (checked) =>
                                handleNotificationChange(
                                  "recommendations",
                                  checked
                                )
                            : undefined
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push("/change-password")}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push("/privacy-settings")}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Privacy Settings
                    </Button>

                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        "Deleting…"
                      ) : (
                        <>
                          <X className="mr-2 h-4 w-4" /> Delete Account
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
