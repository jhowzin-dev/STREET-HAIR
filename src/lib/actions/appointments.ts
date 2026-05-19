"use server"

import { createClient } from "@/core/utils/supabase-server"
import type { Appointment } from "@/domain/entities"

export async function getAppointments(): Promise<Appointment[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Não autenticado")

  const { data, error } = await supabase
    .from("appointments")
    .select("*, professional:professionals (name)")
    .eq("user_id", user.id)
    .neq("status", "canceled")
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getBookedSlots(
  date: string,
): Promise<{ appointment_time: string; professional_id: string | null }[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("appointments")
    .select("appointment_time, professional_id")
    .eq("appointment_date", date)
    .neq("status", "canceled")

  if (error) throw new Error(error.message)
  return data || []
}

export async function createAppointment(appointment: {
  professional_id: string | null
  appointment_date: string
  appointment_time: string
  services: string[]
  total_price: number
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Não autenticado")

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      user_id: user.id,
      ...appointment,
      status: "confirmed",
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function cancelAppointment(appointmentId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Não autenticado")

  const { error } = await supabase
    .from("appointments")
    .update({ status: "canceled" })
    .eq("id", appointmentId)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)
  return { success: true }
}
