

export type AppointmentStatus = "confirmed" | "canceled" | "completed" | "no_show"
export type UserRole = "client" | "admin" | "super_admin"
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6 // Sunday(0) - Saturday(6)

export interface Professional {
  id: string
  name: string
  image_url: string | null
  bio: string | null
  active: boolean
  specialties: string[]
  role: string
  phone?: string | null
  email?: string | null
  instagram?: string | null
  experience_years?: number
  rating?: number // 0-5
  created_at?: string
}

export interface Service {
  id: string
  name: string
  description?: string | null
  price: number 
  original_price: number | null
  popular: boolean
  category: string
  duration_minutes: number
  active: boolean
  order_index?: number
  image_url?: string | null
}

export interface TimeSlot {
  time: string 
  available: boolean
  blocked_reason?: string | null
}

export interface Appointment {
  id: string
  user_id: string
  professional_id: string | null
  appointment_date: string 
  appointment_time: string 
  services: string[]
  total_price: number 
  status: AppointmentStatus
  notes: string | null
  created_at: string
  updated_at?: string | null
  confirmed_at?: string | null
  canceled_at?: string | null
  completed_at?: string | null
  cancellation_reason?: string | null
  professional?: Professional | null
  professional_name?: string | null
  client_name?: string | null
}

export interface NotificationPreferences {
  reminders: boolean
  promotions: boolean
  news: boolean
}

export interface UserProfile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  notification_preferences: NotificationPreferences
  created_at?: string
  updated_at?: string | null
}

export interface WorkingHours {
  day: WeekDay 
  open_time: string 
  close_time: string 
  is_open: boolean
}

export interface BookingConfig {
  slot_interval_minutes: number 
  advance_booking_days: number 
  min_booking_hours: number 
  allow_same_day: boolean
  working_hours: WorkingHours[]
}

export const formatCurrency = (cents: number): string => {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`
}

export const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[^\d,.-]/g, "").replace(",", ".")
  return Math.round(parseFloat(cleaned) * 100)
}

export const validStatuses: AppointmentStatus[] = [
  "confirmed",
  "canceled",
  "completed",
  "no_show",
]

export const isValidStatus = (status: string): status is AppointmentStatus => {
  return validStatuses.includes(status as AppointmentStatus)
}

export const isAdminRole = (role: string): boolean => {
  return role === "admin" || role === "super_admin"
}
