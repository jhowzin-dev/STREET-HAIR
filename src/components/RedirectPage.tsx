"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/Spinner"

interface RedirectPageProps {
  to: string
}

export default function RedirectPage({ to }: RedirectPageProps) {
  const router = useRouter()

  useEffect(() => {
    router.replace(to)
  }, [router, to])

  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <Spinner size="md" />
    </main>
  )
}
