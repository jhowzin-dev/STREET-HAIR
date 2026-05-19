"use server"

import { createClient } from "@/core/utils/supabase-server"
import type { Service } from "@/domain/entities"

export async function getServices(): Promise<Service[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("category", { ascending: false })
    .order("price")

  if (error) throw new Error(error.message)
  return data || []
}
