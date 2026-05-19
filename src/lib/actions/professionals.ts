"use server"

import { createClient } from "@/core/utils/supabase-server"
import type { Professional } from "@/domain/entities"

export async function getProfessionals(): Promise<Professional[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("professionals")
    .select("*")
    .eq("active", true)
    .order("name")

  if (error) throw new Error(error.message)
  return data || []
}
