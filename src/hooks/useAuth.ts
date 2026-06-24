import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { signIn, signUp, signInWithGoogle } from "@/lib/actions/auth"
import { createClient } from "@/core/utils/supabase"
import { verifyEmailOtp, resendEmailOtp } from "@/lib/actions/email-verification"
import { getCurrentUserRole } from "@/lib/actions/admin"

interface UseAuthReturn {
  isLoading: boolean
  error: string
  success: string
  setError: (error: string) => void
  setSuccess: (success: string) => void
  handleLogin: (email: string, password: string) => Promise<boolean>
  handleRegister: (data: {
    email: string
    password: string
    fullName: string
    phone?: string
  }) => Promise<boolean>
  handleGoogleSignIn: () => Promise<void>
  handleLogout: () => Promise<void>
  handleVerifyOtp: (otpCode: string, email: string) => Promise<boolean>
  handleResendOtp: (email: string) => Promise<boolean>
  checkAdminRole: () => Promise<boolean>
}

export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError("")
    try {
      const result = await signIn({ email, password })
      if (result.success) {
        if (!result.emailVerified) {
          window.location.href = `/confirm?email=${encodeURIComponent(email)}`
          return true
        }
        router.push("/")
        router.refresh()
        return true
      }
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const handleRegister = useCallback(async (data: {
    email: string
    password: string
    fullName: string
    phone?: string
  }): Promise<boolean> => {
    setIsLoading(true)
    setError("")
    setSuccess("")
    try {
      const cleanPhone = data.phone ? data.phone.replace(/\D/g, "") : undefined
      const result = await signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: cleanPhone || undefined,
      })
      if (result.success) {
        setSuccess("Conta criada! Digite o código de verificação enviado para seu e-mail.")
        window.location.href = `/confirm?email=${encodeURIComponent(data.email)}`
        return true
      }
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleVerifyOtp = useCallback(async (otpCode: string, email: string): Promise<boolean> => {
    setIsLoading(true)
    setError("")
    setSuccess("")
    try {
      await verifyEmailOtp({ email, token: otpCode })
      setSuccess("E-mail confirmado com sucesso!")
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código inválido ou expirado")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleResendOtp = useCallback(async (email: string): Promise<boolean> => {
    setIsLoading(true)
    setError("")
    try {
      await resendEmailOtp(email)
      setSuccess("Novo código de verificação enviado!")
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao reenviar código")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true)
    setError("")
    try {
      const result = await signInWithGoogle()
      if (result.url) {
        window.location.href = result.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar com Google")
    } finally {
      setIsLoading(false)
    }
  }, [])

const handleLogout = useCallback(async () => {
  setIsLoading(true)
  setError("")
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    router.push("/auth")
    router.refresh()
  } catch (err) {
    setError(err instanceof Error ? err.message : "Erro ao sair")
  } finally {
    setIsLoading(false)
  }
}, [router])

  const checkAdminRole = useCallback(async (): Promise<boolean> => {
    try {
      const role = await getCurrentUserRole()
      return role === "admin" || role === "super_admin"
    } catch {
      return false
    }
  }, [])

  return {
    isLoading,
    error,
    success,
    setError,
    setSuccess,
    handleLogin,
    handleRegister,
    handleGoogleSignIn,
    handleLogout,
    handleVerifyOtp,
    handleResendOtp,
    checkAdminRole,
  }
}
