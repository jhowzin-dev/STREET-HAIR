"use server"

import { createClient } from "@/core/utils/supabase-server"

// ── REENVIAR OTP ──────────────────────────────────────
// Envia um novo código OTP para o e-mail informado.
export async function sendEmailOtp(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Não criar usuário, apenas enviar OTP
    },
  })

  if (error) {
    console.error("[sendEmailOtp] Falha ao enviar OTP:", error)
    throw new Error(error.message)
  }

  return { success: true }
}

// ── VERIFICAR OTP (código de e-mail) ─────────────────────────
// Valida o token que o usuário digitou.
// Se for válido, cria sessão automaticamente.
export async function verifyEmailOtp({
  token,
  email,
}: {
  token: string
  email: string
}) {
  const supabase = await createClient()

  // Usa verifyOtp para validar o token de 6 digitos.
  // type: 'email' é para OTPs enviados por signInWithOtp
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  })

  if (error) {
    console.error("[verifyEmailOtp] Falha na verificação:", error)
    throw new Error(error.message)
  }

  if (!data.user) {
    throw new Error("Token inválido ou expirado. Tente novamente.")
  }

  // Marca como verificado na tabela profiles
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      email_verified: true,
      email_verified_at: new Date().toISOString(),
    })
    .eq("id", data.user.id)

  if (updateError) {
    console.error("[verifyEmailOtp] Erro ao atualizar perfil:", updateError)
  }

  return { success: true, userId: data.user.id }
}

// ── REENVIAR OTP (wrapper público) ─────────────────────────
export async function resendEmailOtp(email: string) {
  return sendEmailOtp(email)
}

// ── CHECAR SE E-MAIL ESTÁ VERIFICADO (Server Action) ───────
export async function isEmailVerified(userId?: string) {
  const supabase = await createClient()

  // Se não receber userId, pega o user atual
  let id = userId
  if (!id) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    id = user.id
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email_verified")
    .eq("id", id)
    .maybeSingle()

  if (!profile) return false

  // Se o Supabase Auth já marcou o e-mail como confirmado
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email_confirmed_at) return true

  return !!profile.email_verified
}
