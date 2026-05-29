"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/core/utils/supabase"
import { updateProfile } from "@/lib/actions/profile"
import { PhoneInput } from "@/components/ui/PhoneInput"
import { Spinner } from "@/components/ui/Spinner"
import { LogOut } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [userName, setUserName] = useState("")
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth")
          return
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("phone, full_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle()

        if (profile?.phone) {
          router.push("/")
          return
        }

        const name = profile?.full_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Usuario"

        const avatar = profile?.avatar_url ||
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          null

        setUserName(name)
        setUserAvatar(avatar)
      } catch (err) {
        console.error("Erro ao carregar dados do usuario:", err)
        setError("Erro ao carregar dados. Por favor, recarregue a pagina.")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const handleSavePhone = async () => {
    if (!phone || phone.replace(/\D/g, "").length < 11) {
      setError("Por favor, digite um numero de WhatsApp valido com DDD.")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await updateProfile({ phone })
      window.location.href = "/"
    } catch (err) {
      console.error("Erro ao salvar telefone:", err)
      setError("Erro ao salvar telefone. Tente novamente.")
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth")
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="text-white/60 mt-4 text-sm">Carregando...</p>
      </div>
    )
  }

  return (
    // Fundo cinza bem escuro para destacar o card centralizado
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
      
      {/* O "Quadrado" (Card Centralizado) */}
      <div className="w-full max-w-sm bg-neutral-900 border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col">
        
        {/* Topo: Foto menor e Nome juntos */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-800 mb-3 relative border-2 border-amber-500/20">
            {userAvatar ? (
              <Image
                src={userAvatar}
                alt={userName}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xl text-white/40">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold text-white text-center">
            Olá, {userName.split(" ")[0]}!
          </h2>
        </div>

        {/* Mensagem discreta e menor */}
        <p className="text-white/60 text-xs leading-relaxed text-center mb-6 px-2">
          Para confirmarmos seus agendamentos e enviarmos lembretes, precisamos do seu WhatsApp.
        </p>

        {/* Form Input e Botão compactos */}
        <div className="space-y-4 flex-1">
          <div>
            <label className="block text-white/70 text-xs mb-1.5 font-medium pl-1">
              WhatsApp
            </label>
            <PhoneInput
              value={phone}
              onChange={setPhone}
              autoFocus
              className="w-full bg-neutral-950 text-white text-sm p-3.5 rounded-xl border border-white/10 focus:border-amber-500 outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            onClick={handleSavePhone}
            disabled={isSaving}
            className="w-full bg-amber-500 text-black text-sm font-semibold h-12 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-400 transition-colors disabled:opacity-50 mt-2"
          >
            {isSaving ? (
              <Spinner size="sm" variant="dark" />
            ) : (
              "Continuar"
            )}
          </button>
        </div>

        {/* Logout menor fixado no rodapé do card */}
        <button
          onClick={handleLogout}
          className="mt-6 flex items-center justify-center gap-2 text-white/30 hover:text-white/50 transition-colors text-xs pt-2 border-t border-white/5"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair da conta
        </button>

      </div>
    </div>
  )
}