"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/Spinner"

export default function LoginRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/auth")
  }, [router])

  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <Spinner size="md" />
    </main>
  )
}
