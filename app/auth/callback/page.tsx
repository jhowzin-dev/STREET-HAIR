"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/core/utils/supabase"

import { Spinner } from "@/components/ui/Spinner"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Verifica se há uma sessão ativa após o callback do OAuth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/")
        router.refresh()
      } else {
       
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
          if (event === "SIGNED_IN" && currentSession) {
            router.push("/")
            router.refresh()
          }
        })

        
        const timeout = setTimeout(() => {
          setError("Não foi possível completar o login. Tente novamente.")
        }, 10000)

        return () => {
          subscription.unsubscribe()
          clearTimeout(timeout)
        }
      }
    })
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full text-center">
          <p className="text-red-400 text-sm mb-2">Erro no login</p>
          <p className="text-white/60 text-sm">{error}</p>
          <button
            onClick={() => window.location.href = "/auth"}
            className="mt-4 w-full bg-white text-black font-medium py-3 rounded-xl"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <Spinner size="lg" />
      <p className="text-white/60 mt-4 text-sm">Finalizando login...</p>
    </div>
  )
}
