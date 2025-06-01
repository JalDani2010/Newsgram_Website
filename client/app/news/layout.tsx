import type React from "react"
import { Suspense } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Footer } from "@/components/layout/footer"

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col news-app">
      <Suspense fallback={<NavbarSkeleton />}>
        <Navbar />
      </Suspense>
      <div className="flex flex-1">
        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar />
        </Suspense>
        <main className="flex-1">{children}</main>
      </div>
      <Footer />
    </div>
  )
}

function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-50 bg-background navbar">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="h-8 w-32 animate-pulse rounded bg-muted"></div>
        <div className="flex items-center space-x-4">
          <div className="h-10 w-64 animate-pulse rounded bg-muted"></div>
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
        </div>
      </div>
    </header>
  )
}

function SidebarSkeleton() {
  return (
    <aside className="w-64 hidden md:block sidebar overflow-y-auto">
      <div className="p-4">
        <div className="mb-8">
          <div className="h-4 w-20 animate-pulse rounded bg-muted mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted"></div>
            ))}
          </div>
        </div>
        <div>
          <div className="h-4 w-20 animate-pulse rounded bg-muted mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted"></div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
