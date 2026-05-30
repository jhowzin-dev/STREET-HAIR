"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Mail, RotateCcw, ArrowRight, Check } from "lucide-react"
import { Spinner } from "@/components/ui/Spinner"
import { verifyEmailOtp, resendEmailOtp } from "@/lib/actions/email-verification"

function ConfirmPageContent() {
  const searchParams = useSearchParams()
  const emailFromUrl = searchParams.get("email") || ""

  const [code, setCode] = useState("")
  const [email, setEmail] = useState(emailFromUrl)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  // Timer de reenvio de 60 segundos
  useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [resendTimer])

  // Validação do código de 8 dígitos
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 8) {
      setError("Digite o código de 8 dígitos")
      return
    }
    if (!email) {
      setError("Informe o e-mail para verificar")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await verifyEmailOtp({ email, token: code })
      setIsVerified(true)
      setSuccess("E-mail verificado com sucesso!")
      setTimeout(() => { window.location.href = "/" }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código inválido.")
      setCode("")
    } finally {
      setIsLoading(false)
    }
  }

  // Função de reenvio do código
  const handleResend = async () => {
    if (!email || resendTimer > 0) return
    setIsLoading(true)
    setError(null)
    try {
      await resendEmailOtp(email)
      setResendTimer(60) // Inicia o contador de 60s
      setSuccess("Novo código enviado!")
    } catch (err) {
      setError("Erro ao reenviar código.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen bg-black flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 relative mb-6">
            <Image src="/logo.jpg" alt="Street Hair" fill className="object-contain rounded-2xl" priority />
          </div>
          <h1 className="text-2xl font-black text-white uppercase">Street Hair</h1>
        </div>

        <div className="max-w-sm mx-auto w-full space-y-6">
          <h2 className="text-xl font-bold text-white text-center">Confirme seu e-mail</h2>
          <p className="text-white/50 text-sm text-center">
            Digite o código de **8 dígitos** enviado para <span className="text-amber-500 font-medium">{email}</span>
          </p>

          {!isVerified && (
            <form onSubmit={handleVerify} className="space-y-6">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 8)
                  setCode(val)
                }}
                placeholder="00000000"
                required
                maxLength={8}
                pattern="\d{8}"
                className="w-full bg-neutral-800 text-white rounded-xl border border-white/10 px-4 py-3.5 text-center text-lg font-mono tracking-widest"
              />
              
              <button type="submit" className="w-full bg-white text-black font-semibold py-3.5 rounded-xl hover:bg-gray-200">
                {isLoading ? <Spinner size="sm" variant="dark" /> : "Verificar código"}
              </button>

              {/* Botão de Reenvio */}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0 || isLoading}
                className="w-full text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {resendTimer > 0 ? `Reenviar em ${resendTimer}s` : "Reenviar código"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}

export default function ConfirmPageWrapper() {
  return <Suspense fallback={<main className="min-h-screen bg-black flex items-center justify-center"><Spinner size="md" /></main>}><ConfirmPageContent /></Suspense>
}