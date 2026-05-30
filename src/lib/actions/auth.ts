"use server"

import { createClient } from "@/core/utils/supabase-server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// SIGN IN 
export async function signIn({ email, password }: { email: string; password: string }) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw new Error(error.message)
  if (!data.user) throw new Error("Login falhou")

  // Checa se e-mail está confirmado na tabela profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("email_verified, email_verified_at")
    .eq("id", data.user.id)
    .maybeSingle()

  const isVerified =
    !!data.user.email_confirmed_at ||
    !!profile?.email_verified

  return {
    success: true,
    user: { id: data.user.id, email: data.user.email },
    emailVerified: isVerified,
  }
}

//  SIGN UP 
export async function signUp({
  email,
  password,
  fullName,
  phone,
}: {
  email: string
  password: string
  fullName: string
  phone?: string
}) {
  const supabase = await createClient()

  // Cria o usuário NO AUTH
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone: phone || null },
    },
  })

  if (error) {
    // Se o erro for porque usuario ja existe, avisamos
    if (error.message.includes("already been registered")) {
      throw new Error("Este e-mail já está cadastrado. Tente fazer login.")
    }
    throw new Error(error.message)
  }

  if (!data.user) throw new Error("Registro falhou")

  // Cria o perfil com email_verified = false
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: data.user.id,
    full_name: fullName,
    phone: phone || null,
    avatar_url: null,
    role: "user",
    email_verified: false,
    email_verified_at: null,
  }, { onConflict: "id" })

  if (profileError) {
    console.error("Erro ao criar perfil na tabela profiles:", profileError)
  }

  // Faz logout para impedir acesso sem verificação
  await supabase.auth.signOut()

  // Envia OTP para confirmar e-mail
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Nao criar novo usuario, apenas enviar OTP
    },
  })

  if (otpError) {
    console.error("Erro ao enviar OTP:", otpError)
    throw new Error("Erro ao enviar código de verificação. Tente novamente.")
  }

  return { success: true, user: { id: data.user.id, email: data.user.email } }
}

// ── SIGN IN WITH GOOGLE ────────────────────────
export async function signInWithGoogle() {
  const redirectTo =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${redirectTo}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  if (error) throw new Error(error.message)

  return { url: data.url }
}

// ── SIGN OUT ───────────────────────────────────
export async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) throw new Error(error.message)

  revalidatePath("/", "layout")
  redirect("/auth")
}

// ── GET CURRENT USER ───────────────────────────
export async function getCurrentUser() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  // Busca verificação de e-mail na tabela
  const { data: profile } = await supabase
    .from("profiles")
    .select("email_verified, email_verified_at, phone")
    .eq("id", user.id)
    .maybeSingle()

  return {
    id: user.id,
    email: user.email,
    emailVerified: !!user.email_confirmed_at || !!profile?.email_verified,
    phone: profile?.phone || null,
  }
}
