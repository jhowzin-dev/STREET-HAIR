"use server"

import { createClient } from "@/core/utils/supabase-server"
import type { UserProfile } from "@/domain/entities"

export async function getProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Busca o perfil na tabela profiles
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  // Se perfil existe, retorna mesclado com email
  if (data && !error) {
    return {
      ...data,
      email: user.email,
      role: data.role || "user",
    }
  }

  console.warn("Perfil não encontrado para o usuário:", user.id, "Criando perfil fallback...")

  const fullNameFromMeta = user.user_metadata?.full_name || user.user_metadata?.name
  const fullName = fullNameFromMeta || user.email?.split("@")[0] || "Usuário"

  const { error: insertError } = await supabase.from("profiles").insert({
    id: user.id,
    full_name: fullName,
    phone: null,
    avatar_url: null,
    role: "user",
  })

  if (insertError) {
    console.error("Erro ao criar perfil fallback:", insertError)
    return {
      id: user.id,
      full_name: fullName,
      email: user.email,
      phone: null,
      avatar_url: null,
      role: "user",
    }
  }

  return {
    id: user.id,
    full_name: fullName,
    email: user.email,
    phone: null,
    avatar_url: null,
    role: "user",
  }
}

export async function updateProfile(updates: {
  full_name?: string | null
  phone?: string | null
  avatar_url?: string | null
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Não autenticado")

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id)

  if (error) throw new Error(error.message)

  return { success: true }
}