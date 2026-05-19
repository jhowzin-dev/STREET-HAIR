"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/Spinner"

export default function RegisterRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/auth?tab=register")
  }, [router])

  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <Spinner size="md" />
    </main>
  )
}
