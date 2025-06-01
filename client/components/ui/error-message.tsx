import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorMessageProps {
  message: string | null
  title?: string
}

export function ErrorMessage({ message, title = "Error" }: ErrorMessageProps) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message || "An unexpected error occurred."}</AlertDescription>
    </Alert>
  )
}
