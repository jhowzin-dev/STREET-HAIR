"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, LogIn, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { FormField } from "@/components/ui/FormField"
import { Alert } from "@/components/ui/Alert"
import { Spinner } from "@/components/ui/Spinner"

export default function AdminLoginPage() {
  const router = useRouter()
  const { isLoading, error, setError, handleLogin, checkAdminRole } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await handleLogin(email, password)
    if (success) {
      const isAdmin = await checkAdminRole()
      if (!isAdmin) {
        setError("Você não tem permissão de admin.")
        return
      }
      router.push("/admin")
      router.refresh()
    }
  }

  return (
    <main className="relative min-h-screen bg-black flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Área Administrativa</h1>
          <p className="text-white/60">Acesso restrito para barbeiros</p>
        </div>

        {error && <Alert className="mb-4">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="admin@streethair.com"
            icon="mail"
            required
          />

          <FormField
            label="Senha"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            icon="lock"
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-500 text-black font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-400 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Spinner size="sm" variant="dark" />
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Acessar Painel
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  )
}
