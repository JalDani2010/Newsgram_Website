import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to the login page when accessing the root route
  redirect("/login")

  // No additional code needed as the updates only contain the redirect statement
}
