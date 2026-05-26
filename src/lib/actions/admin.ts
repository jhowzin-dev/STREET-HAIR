"use server"

import { createClient } from "@/core/utils/supabase-server"
import type { Appointment } from "@/domain/entities"

// Definimos uma interface estendida idêntica à que funciona perfeitamente
export interface AppointmentWithClient extends Appointment {
  client_name: string
  client_phone: string | null
}

// Busca TODOS os agendamentos mapeando os nomes dos perfis sem quebrar o TypeScript
export async function getAllAppointments(): Promise<AppointmentWithClient[]> {
  const supabase = await createClient()

  // 1. Puxa os agendamentos normais com o nome do profissional
  const { data, error } = await supabase
    .from("appointments")
    .select("*, professional:professionals (name)")
    .order("appointment_date", { ascending: false })
    .order("appointment_time", { ascending: false })

  if (error) throw new Error(error.message)

  const appointments = data || []
  
  // 2. Extrai os IDs únicos dos utilizadores que agendaram
  const userIds = [...new Set(appointments.map((a) => a.user_id).filter(Boolean))]

  if (userIds.length === 0) {
    return appointments.map((a) => ({
      ...a,
      professional: a.professional || null,
      client_name: "Cliente sem nome",
      client_phone: null,
    }))
  }

  // 3. Busca os perfis correspondentes diretamente na tabela pública 'profiles'
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .in("id", userIds)

  // 4. Cria um mapa rápido para associar IDs aos perfis correspondentes
  const profileMap = new Map(profiles?.map((p) => [p.id, p]) || [])

  // 5. Retorna o agendamento injetando 'client_name' diretamente no objeto principal
  return appointments.map((a) => ({
    ...a,
    professional: a.professional || null,
    client_name: profileMap.get(a.user_id)?.full_name || "Cliente sem nome",
    client_phone: profileMap.get(a.user_id)?.phone || null,
  }))
}

// Atualiza o status de um agendamento.
export async function updateAppointmentStatus(appointmentId: string, status: "confirmed" | "canceled" | "completed") {
  const supabase = await createClient()

  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId)

  if (error) throw new Error(error.message)
  return { success: true }
}

// Busca estatísticas para o dashboard do admin.
export async function getAdminStats() {
  const supabase = await createClient()

  const today = new Date().toISOString().split("T")[0]

  const [
    { data: totalAppointments },
    { data: todayAppointments },
    { data: confirmedRevenue },
    { data: todayRevenueData },
  ] = await Promise.all([
    supabase.from("appointments").select("id", { count: "exact" }),
    supabase.from("appointments").select("id", { count: "exact" }).eq("appointment_date", today),
    supabase.from("appointments").select("total_price").eq("status", "confirmed"),
    supabase.from("appointments").select("total_price").eq("appointment_date", today).eq("status", "confirmed"),
  ])

  const totalRevenue = confirmedRevenue?.reduce((acc, a) => acc + (a.total_price || 0), 0) || 0
  const todayRevenue = todayRevenueData?.reduce((acc, a) => acc + (a.total_price || 0), 0) || 0

  return {
    totalAppointments: totalAppointments?.length || 0,
    todayAppointments: todayAppointments?.length || 0,
    totalRevenue,
    todayRevenue,
  }
}

// Busca a role do usuário logado.
export async function getCurrentUserRole(): Promise<string> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return ""

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  return data?.role || "user"
}