"use server"

import { createClient } from "@/core/utils/supabase-server"
import type { Appointment } from "@/domain/entities"
import { getToday } from "@/lib/formatters"

// Busca todos os agendamentos
export async function getAllAppointments(): Promise<Appointment[]> {
  const supabase = await createClient()

  // Etapa 1: Busca os agendamentos normais incluindo o nome do profissional
  const { data, error } = await supabase
    .from("appointments")
    .select("*, professional:professionals (name)")
    .order("appointment_date", { ascending: false })
    .order("appointment_time", { ascending: false })

  if (error) throw new Error(error.message)

  const appointments = data || []
  
  // Etapa 2: Extrai os IDs únicos dos usuários que fizeram agendamentos
  const userIds = [...new Set(appointments.map((a) => a.user_id).filter(Boolean))]

  if (userIds.length === 0) return appointments

  // Etapa 3: Busca os perfis correspondentes na tabela pública 'profiles'
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .in("id", userIds)

  // 4. Cria um mapa rápido para associar IDs aos perfis correspondentes
  const profileMap = new Map(profiles?.map((p) => [p.id, p]) || [])

  // 5. Injeta o nome e o telefone diretamente respeitando a estrutura atual do seu objeto
  return appointments.map((a) => ({
    ...a,
    professional: a.professional || null,
    client_name: profileMap.get(a.user_id)?.full_name || "Cliente sem nome",
    client_phone: profileMap.get(a.user_id)?.phone || "Sem telefone",
  })) as Appointment[]
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

  const today = getToday()

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

// Delete a cancelled appointment (admin only).
export async function deleteCancelledAppointment(appointmentId: string) {
  const role = await getCurrentUserRole();
  if (role !== "admin") throw new Error("Unauthorized: admin role required");
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId)
    .select()
    
  if (error) throw new Error(error.message)
  
  // Se nenhuma linha foi deletada, significa que o agendamento não existia mais.
  // Retornamos success: false em vez de estourar um erro (throw) no servidor.
  if (!data || data.length === 0) {
    return { success: false, code: "NOT_FOUND", message: 'Agendamento não encontrado ou já removido.' }
  }
  
  return { success: true, deletedId: appointmentId }
}

// Revert appointment status (used to undo accidental changes)
export async function revertAppointmentStatus(appointmentId: string, currentStatus: string) {
  const role = await getCurrentUserRole();
  if (role !== "admin") throw new Error("Unauthorized: admin role required");
  const supabase = await createClient()
  let newStatus: string
  if (currentStatus === 'completed' || currentStatus === 'canceled') {
    newStatus = 'confirmed'
  } else {
    return { success: false, message: 'No revert needed' }
  }
  const { error } = await supabase
    .from('appointments')
    .update({ status: newStatus })
    .eq('id', appointmentId)
    .eq('status', currentStatus)
  if (error) throw new Error(error.message)
  return { success: true, newStatus }
}