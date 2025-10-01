"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { FileVideo } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/dashboard")
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <FileVideo className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
        <h1 className="text-2xl font-semibold mb-2">VanNote</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
