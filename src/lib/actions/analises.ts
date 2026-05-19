"use server"

import { createClient } from "@/core/utils/supabase-server"
import type { Appointment } from "@/domain/entities"

export interface AppointmentWithClient extends Appointment {
  client_name: string | null
  client_phone: string | null
}

//Busca TODOS os agendamentos com dados do cliente (profiles).

export async function getAllAppointmentsWithClients(): Promise<AppointmentWithClient[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      professional:professionals (name)
    `)
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true })

  if (error) throw new Error(error.message)

  // Busca nomes dos clientes via profiles
  const appointments = data || []
  const userIds = [...new Set(appointments.map((a) => a.user_id))]

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .in("id", userIds)

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) || [])

  return appointments.map((a) => ({
    ...a,
    professional: a.professional || null,
    client_name: profileMap.get(a.user_id)?.full_name || null,
    client_phone: profileMap.get(a.user_id)?.phone || null,
  }))
}

//Marca um agendamento como concluído (completo).
export async function markAppointmentAsCompleted(appointmentId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("appointments")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", appointmentId)

  if (error) throw new Error(error.message)

  return { success: true }
}
