"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, Scissors, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { updateAppointmentStatus } from "@/lib/actions/admin"
import type { Appointment } from "@/domain/entities"
import { formatCurrency } from "@/lib/formatters"
import { StatusBadge } from "@/presentation/widgets/StatusBadge"
import { Spinner } from "@/components/ui/Spinner"

interface DashboardStats {
  totalAppointments: number
  todayAppointments: number
  totalRevenue: number
  todayRevenue: number
}

interface Props {
  appointments: Appointment[]
  stats: DashboardStats
}

export default function AdminDashboard({ appointments, stats }: Props) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const router = useRouter()
  const today = new Date().toISOString().split("T")[0]

  const todayAppointments = appointments.filter((a) => a.appointment_date === today)

  const sortedToday = [...todayAppointments].sort((a, b) =>
    a.appointment_time.localeCompare(b.appointment_time)
  )

  const handleStatusChange = async (
    id: string,
    status: "confirmed" | "canceled" | "completed"
  ) => {
    setIsUpdating(id)
    try {
      await updateAppointmentStatus(id, status)
      router.refresh()
    } catch (err) {
      console.error("Erro ao atualizar status:", err)
      alert("Erro ao atualizar status")
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">Painel Admin</h1>
            <p className="text-white/40 text-xs">Street Hair - Barbearia</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Agenda do Dia */}
        <section className="bg-neutral-900 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Agenda de Hoje
            </h2>
            <p className="text-white/40 text-sm mt-0.5">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="divide-y divide-white/5">
            {sortedToday.length === 0 ? (
              <EmptyState icon={<Calendar className="w-8 h-8 mx-auto mb-3 opacity-50" />} text="Nenhum agendamento para hoje" />
            ) : (
              sortedToday.map((appointment) => (
                <AppointmentRow
                  key={appointment.id}
                  appointment={appointment}
                  isUpdating={isUpdating}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>
        </section>

        {/* Lista de Todos os Agendamentos */}
        <section className="bg-neutral-900 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Scissors className="w-5 h-5 text-amber-400" />
              Todos os Agendamentos
            </h2>
          </div>

          <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
            {appointments.length === 0 ? (
              <EmptyState icon={<Calendar className="w-8 h-8 mx-auto mb-3 opacity-50" />} text="Nenhum agendamento encontrado" />
            ) : (
              appointments.slice(0, 10).map((appointment) => (
                <CompactAppointmentRow key={appointment.id} appointment={appointment} />
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

/* --- Sub-components --- */

interface EmptyStateProps {
  icon: React.ReactNode
  text: string
}

function EmptyState({ icon, text }: EmptyStateProps) {
  return (
    <div className="p-8 text-center text-white/40">
      {icon}
      <p className="text-sm">{text}</p>
    </div>
  )
}

interface AppointmentRowProps {
  appointment: Appointment
  isUpdating: string | null
  onStatusChange: (id: string, status: "confirmed" | "canceled" | "completed") => void
}

function AppointmentRow({ appointment, isUpdating, onStatusChange }: AppointmentRowProps) {
  return (
    <div className="p-4 hover:bg-white/5 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">{appointment.appointment_time}</span>
          </div>
          <div>
            <p className="text-white font-medium text-sm">
             {appointment.client_name || "Cliente sem nome"}
            </p>
            <p className="text-white/40 text-xs">{appointment.services.join(", ")}</p>
          </div>
        </div>
        <StatusBadge status={appointment.status} size="sm" />
      </div>

      <div className="flex items-center justify-between">
        <div></div> 
        <span className="text-amber-400 font-medium text-sm">
          {formatCurrency(appointment.total_price)}
        </span>
      </div>

      {appointment.status === "confirmed" && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onStatusChange(appointment.id, "completed")}
            disabled={isUpdating === appointment.id}
            className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg py-2 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {isUpdating === appointment.id ? (
              <Spinner size="sm" variant="light" className="mx-auto" />
            ) : (
              "Concluir"
            )}
          </button>
          <button
            onClick={() => onStatusChange(appointment.id, "canceled")}
            disabled={isUpdating === appointment.id}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg py-2 text-xs font-medium transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}

interface CompactAppointmentRowProps {
  appointment: Appointment
}

function CompactAppointmentRow({ appointment }: CompactAppointmentRowProps) {
  const date = new Date(appointment.appointment_date)

  return (
    <div className="p-4 hover:bg-white/5 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center flex-col leading-none">
            <span className="text-white font-bold text-[11px]">
              {date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
            </span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">
              {appointment.client_name || "Cliente sem nome"}{" "}
              <span className="text-white/40 text-xs font-normal ml-1">
                • {appointment.appointment_time}
              </span>
            </p>
            <p className="text-white/40 text-xs">{appointment.services.join(", ")}</p>
          </div>
        </div>
        <div className="text-right">
          <StatusBadge status={appointment.status} size="sm" />
          <p className="text-amber-400 text-xs mt-1 font-medium">
            {formatCurrency(appointment.total_price)}
          </p>
        </div>
      </div>
    </div>
  )
}