import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "default" | "sm" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "default", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    default: "h-8 w-8",
    sm: "h-5 w-5",
    lg: "h-12 w-12",
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-current border-t-transparent text-primary",
          sizeClasses[size],
          className,
        )}
      />
    </div>
  )
}
