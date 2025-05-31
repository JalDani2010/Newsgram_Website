"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "sidebar" | "panel"
  collapsible?: "icon" | "full" | false
  defaultOpen?: boolean
}

interface SidebarContextValue {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  variant: "sidebar" | "panel"
  collapsible: "icon" | "full" | false
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined)

function useSidebarContext() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider")
  }
  return context
}

const SidebarProvider = ({ children, defaultOpen = true }: { children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = React.useState(defaultOpen)
  const value = React.useMemo(
    () => ({ open, setOpen, variant: "sidebar", collapsible: "icon" }),
    [open, setOpen],
  ) as SidebarContextValue

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant = "sidebar", collapsible = false, defaultOpen = true, ...props }, ref) => {
    const [open, setOpen] = React.useState(defaultOpen)
    const value = React.useMemo(() => ({ open, setOpen, variant, collapsible }), [open, setOpen, variant, collapsible])

    return (
      <SidebarContext.Provider value={value}>
        <div
          ref={ref}
          className={cn(
            "flex flex-col",
            variant === "sidebar" && "border-r",
            variant === "panel" && "border-l",
            collapsible === "icon" && !open && "w-[56px]",
            collapsible === "full" && !open && "w-0 overflow-hidden",
            className,
          )}
          {...props}
        />
      </SidebarContext.Provider>
    )
  },
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { collapsible, open } = useSidebarContext()
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-[60px] items-center border-b px-4",
          collapsible === "icon" && !open && "justify-center px-0",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("flex-1 overflow-auto", className)} {...props} />
  },
)
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("border-t p-4", className)} {...props} />
  },
)
SidebarFooter.displayName = "SidebarFooter"

const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const { setOpen, open } = useSidebarContext()
    return (
      <button
        ref={ref}
        onClick={() => setOpen(!open)}
        className={cn("h-6 w-6 items-center justify-center", className)}
        {...props}
      >
        <span className="sr-only">Toggle Sidebar</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
    )
  },
)
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("flex flex-col gap-1", className)} {...props} />
  },
)
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn(className)} {...props} />
  },
)
SidebarMenuItem.displayName = "SidebarMenuItem"

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
  tooltip?: string
  asChild?: boolean
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, isActive, tooltip, asChild = false, ...props }, ref) => {
    const { open, collapsible } = useSidebarContext()
    const Comp = asChild ? React.Fragment : "button"
    const childProps = asChild ? {} : props

    return (
      <Comp {...childProps}>
        <div
          className={cn(
            "group flex h-9 items-center gap-2 rounded-md px-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            isActive && "bg-accent text-accent-foreground",
            collapsible === "icon" && !open && "justify-center px-0",
            className,
          )}
        >
          {props.children}
          {tooltip && collapsible === "icon" && !open && (
            <div className="absolute left-full ml-1 hidden translate-x-1 rounded-md bg-accent px-2 py-1 text-sm opacity-0 shadow-md transition-opacity group-hover:translate-x-0 group-hover:opacity-100 md:block">
              {tooltip}
            </div>
          )}
        </div>
      </Comp>
    )
  },
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("pb-4", className)} {...props} />
  },
)
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { collapsible, open } = useSidebarContext()
    return (
      <div
        ref={ref}
        className={cn(
          "px-3 py-2 text-xs font-medium text-muted-foreground",
          collapsible === "icon" && !open && "sr-only",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn(className)} {...props} />
  },
)
SidebarGroupContent.displayName = "SidebarGroupContent"

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarProvider,
}
