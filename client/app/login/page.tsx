"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Newspaper, Mail, Lock, User, ArrowRight } from "lucide-react"
import { setCookie, COOKIE_KEYS, setUserData } from "@/lib/cookies"
import { loginUser, registerUser } from "@/lib/api/auth"

export default function LoginPage() {
  const router = useRouter()

  // Which tab is active?
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  // Signup form state
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")

  // Shared loading & error
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Helper to get a cookie by name
  const readCookie = (name: string): string | null => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`))
    return match ? decodeURIComponent(match[1]) : null
  }

  useEffect(() => {
    // Only on the login tab, once loading is done and there's no error
    if (activeTab === "login" && !isLoading && error === "" && readCookie(COOKIE_KEYS.AUTH_TOKEN)) {
      router.push("/news")
    }
  }, [activeTab, isLoading, error, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // 1. Validate
    if (!loginEmail || !loginPassword) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    try {
      // 2. Call API
      const res = await loginUser({
        email: loginEmail,
        password: loginPassword,
      })

      // 3. On success, set cookie & user then redirect
      if (res.success && res.token) {
        const days = rememberMe ? 30 : 1
        setCookie(COOKIE_KEYS.AUTH_TOKEN, res.token, days)
        if (res.user) setUserData(res.user)
        router.push("/news")
      } else {
        setError(res.message || "Login failed")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // 1. Validate
    if (!signupName || !signupEmail || !signupPassword) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }
    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      // 2. Call API
      const res = await registerUser({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
      })

      // 3. On success, set cookie & user then redirect
      if (res.success && res.token) {
        setCookie(COOKIE_KEYS.AUTH_TOKEN, res.token, 1)
        if (res.user) setUserData(res.user)
        router.push("/news")
      } else {
        setError(res.message || "Registration failed")
      }
    } catch (err: any) {
      console.error("Signup error:", err)
      setError(err.message || "Signup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex items-center justify-center">
          <Newspaper className="h-8 w-8 text-primary mr-2" />
          <h1 className="text-3xl font-bold">NewsApp</h1>
        </div>

        <Tabs defaultValue="login" onValueChange={(v) => setActiveTab(v as "login" | "signup")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* ——— LOGIN TAB ——— */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Login to access your personalized news feed</CardDescription>
              </CardHeader>
              <CardContent>
                {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        placeholder="name@example.com"
                        type="email"
                        className="pl-10"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="login-password">Password</Label>
                      <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        className="pl-10"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" checked={rememberMe} onCheckedChange={(c) => setRememberMe(c === true)} />
                    <Label htmlFor="remember" className="text-sm">
                      Remember me
                    </Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Logging in...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Login
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <div className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button className="text-primary hover:underline" onClick={() => setActiveTab("signup")}>
                    Sign up
                  </button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* ——— SIGNUP TAB ——— */}
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>Sign up to get personalized news and updates</CardDescription>
              </CardHeader>
              <CardContent>
                {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        placeholder="John Doe"
                        className="pl-10"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        placeholder="name@example.com"
                        type="email"
                        className="pl-10"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        className="pl-10"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <Link href="#" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="#" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Creating account...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Sign Up
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <div className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button className="text-primary hover:underline" onClick={() => setActiveTab("login")}>
                    Login
                  </button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
