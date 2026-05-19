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

  return { success: true, user: { id: data.user.id, email: data.user.email } }
}

// SIGN UP
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

  // Cria o usuário no Auth com metadata
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone: phone || null },
    },
  })

  if (error) throw new Error(error.message)
  if (!data.user) throw new Error("Registro falhou")

  // Upsert do perfil
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: data.user.id,
    full_name: fullName,
    phone: phone || null,
    avatar_url: null,
    role: "user",
  }, { onConflict: "id" })

  if (profileError) {
    console.error("Erro ao criar perfil na tabela profiles:", profileError)
  }

  return { success: true, user: { id: data.user.id, email: data.user.email } }
}

// SIGN IN WITH GOOGLE
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

// SIGN OUT
export async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) throw new Error(error.message)

  revalidatePath("/", "layout")
  redirect("/auth")
}

// GET CURRENT USER
export async function getCurrentUser() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  return {
    id: user.id,
    email: user.email,
  }
}
