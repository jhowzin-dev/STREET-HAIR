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

    async function checkAndRedirect(session: { user: { id: string } }) {
      try {
        // Marca e-mail como verificado para usuários do Google (email já é verificado pelo provedor)
        const { data: profile } = await supabase
          .from("profiles")
          .select("phone, email_verified")
          .eq("id", session.user.id)
          .maybeSingle()

        // Se o e-mail ainda não está verificado (caso seja novo cadastro via OAuth)
        if (!profile?.email_verified) {
          await supabase
            .from("profiles")
            .update({
              email_verified: true,
              email_verified_at: new Date().toISOString(),
            })
            .eq("id", session.user.id)
        }

        // Verifica onboarding (telefone)
        if (!profile?.phone) {
          router.push("/onboarding")
          router.refresh()
        } else {
          router.push("/")
          router.refresh()
        }
      } catch {
        setError("Erro ao verificar perfil. Tente novamente.")
      }
    }

    // Verifica se ha uma sessao ativa apos o callback do OAuth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkAndRedirect(session)
      } else {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
          if (event === "SIGNED_IN" && currentSession) {
            checkAndRedirect(currentSession)
          }
        })

        const timeout = setTimeout(() => {
          setError("Nao foi possivel completar o login. Tente novamente.")
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
