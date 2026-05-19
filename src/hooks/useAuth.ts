import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { signIn, signUp, signInWithGoogle, signOut } from "@/lib/actions/auth"
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
        setSuccess("Conta criada com sucesso! Redirecionando...")
        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 1500)
        return true
      }
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true)
    setError("")
    try {
      const data = await signInWithGoogle()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar com Google")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleLogout = useCallback(async () => {
    await signOut()
  }, [])

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
    checkAdminRole,
  }
}
