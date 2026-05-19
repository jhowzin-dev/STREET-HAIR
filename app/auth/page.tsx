"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { LogIn, User, ShieldCheck } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { FormField } from "@/components/ui/FormField"
import { Alert } from "@/components/ui/Alert"
import { Spinner } from "@/components/ui/Spinner"

function AuthForm() {
  const router = useRouter()
  const { isLoading, error, success, setError, setSuccess, handleLogin, handleRegister, handleGoogleSignIn } = useAuth()
  const [mode, setMode] = useState<"login" | "register">("login")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode)
    setError("")
    setSuccess("")
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "login") {
      handleLogin(email, password)
    } else {
      handleRegister({ email, password, fullName, phone })
    }
  }

  return (
    <main className="relative min-h-screen bg-black flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        {/* Logo + Nome */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-32 h-32 relative mb-6">
            <Image
              src="/logo.jpg"
              alt="Street Hair"
              fill
              className="object-contain rounded-2xl"
              priority
            />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            Street Hair
          </h1>
          <p className="text-white/50 text-sm mt-2">
            {mode === "login" ? "Acesse sua conta" : "Crie sua conta"}
          </p>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-white text-black font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-50 mb-6"
        >
          <ShieldCheck className="w-5 h-5" />
          Entrar com Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-black px-2 text-white/40">ou use seu email</span>
          </div>
        </div>

        {/* Alerts */}
        {error && <Alert className="mb-4">{error}</Alert>}
        {success && <Alert variant="success" className="mb-4">{success}</Alert>}

        <form onSubmit={onSubmit} className="space-y-5">
          {mode === "register" && (
            <>
              <FormField
                label="Nome completo"
                value={fullName}
                onChange={setFullName}
                placeholder="Seu nome completo"
                icon="user"
                required
              />
              <FormField
                label="Telefone"
                type="tel"
                value={phone}
                onChange={setPhone}
                placeholder="(11) 99999-9999"
              />
            </>
          )}

          <FormField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="seu@email.com"
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
            minLength={6}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Spinner size="sm" variant="dark" />
            ) : mode === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                Entrar
              </>
            ) : (
              <>
                <User className="w-4 h-4" />
                Criar conta
              </>
            )}
          </button>

          <p className="text-center text-white/50 text-sm">
            {mode === "login" ? (
              <>
                Não tem conta?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="text-amber-500 hover:text-amber-400 font-medium transition-colors"
                >
                  Cadastre-se
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-amber-500 hover:text-amber-400 font-medium transition-colors"
                >
                  Entrar
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </main>
  )
}

import { Suspense } from "react"

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black flex items-center justify-center">
          <Spinner size="md" />
        </main>
      }
    >
      <AuthForm />
    </Suspense>
  )
}
