"use server"

import { createClient } from "@/core/utils/supabase-server"
import type { Appointment } from "@/domain/entities"


//Busca TODOS os agendamentos.
export async function getAllAppointments(): Promise<Appointment[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("appointments")
    .select("*, professional:professionals (name)")
    .order("appointment_date", { ascending: false })
    .order("appointment_time", { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}


//Atualiza o status de um agendamento.
 
export async function updateAppointmentStatus(appointmentId: string, status: "confirmed" | "canceled" | "completed") {
  const supabase = await createClient()

  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId)

  if (error) throw new Error(error.message)
  return { success: true }
}

//Busca estatísticas para o dashboard do admin.
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

//Busca a role do usuário logado.
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
