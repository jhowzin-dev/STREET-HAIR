"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Check,
  Filter,
  Calendar,
  Clock,
  User,
  Phone,
  CircleDollarSign, 
  CheckCheck, 
} from "lucide-react" 
import { markAppointmentAsCompleted } from "@/lib/actions/analises"
import { Spinner } from "@/components/ui/Spinner"
import { StatusBadge } from "@/presentation/widgets/StatusBadge"
import type { AppointmentWithClient } from "@/lib/actions/analises"
import { formatCurrency, todayStr, formatDate } from "@/lib/formatters"
import { getStatusConfig } from "@/lib/status"

type FilterType = "all" | "today" | "future" | "completed"

interface Props {
  appointments: AppointmentWithClient[]
}

export default function AnalisesPage({ appointments }: Props) {
  const [filter, setFilter] = useState<FilterType>("all")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const router = useRouter()

  const today = todayStr()

  const filtered = useMemo(() => {
    switch (filter) {
      case "today":
        return appointments.filter((a) => a.appointment_date === today)
      case "future":
        return appointments.filter(
          (a) => a.appointment_date > today && a.status !== "canceled"
        )
      case "completed":
        return appointments.filter((a) => a.status === "completed")
      default:
        return appointments
    }
  }, [filter, appointments, today])

  const handleMarkCompleted = async (id: string) => {
    setProcessingId(id)
    try {
      await markAppointmentAsCompleted(id)
      router.refresh()
    } catch (err) {
      console.error(err)
      alert("Erro ao marcar como concluído.")
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Header */}
      <header className="bg-[#0a0a0a] border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">Análises</h1>
            <p className="text-white/40 text-xs">Street Hair - Barbearia</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Título */}
        <div className="text-center mb-12">
          <div className="inline-block border border-[#FF6B2C] px-4 py-1 text-xs uppercase tracking-[0.2em] text-[#FF6B2C] mb-4">
            Estatísticas de Agendamentos
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            Acompanhamento de <span className="text-[#FF6B2C]">Serviços</span>
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Monitore todos os agendamentos da barbearia. Use os filtros para
            visualizar apenas os dados que precisa.
          </p>
        </div>

        {/* Filtros Rápidos */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          <FilterButton
            label="Hoje"
            subLabel={appointments.filter((a) => a.appointment_date === today).length.toString()}
            active={filter === "today"}
            onClick={() => setFilter("today")}
          />
          <FilterButton
            label="Futuros"
            subLabel={appointments.filter((a) => a.appointment_date > today && a.status !== "canceled").length.toString()}
            active={filter === "future"}
            onClick={() => setFilter("future")}
          />
          <FilterButton
            label="Concluídos"
            subLabel={appointments.filter((a) => a.status === "completed").length.toString()}
            active={filter === "completed"}
            onClick={() => setFilter("completed")}
          />
          <FilterButton
            label="Todos"
            subLabel={appointments.length.toString()}
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
        </div>

        {/* Lista de Agendamentos */}
        {filtered.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
            <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-lg">Nenhum agendamento encontrado.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              today={today}
              processingId={processingId}
              onMarkCompleted={handleMarkCompleted}
            />
          ))}
        </div>
      </div>
    </main>
  )
}

/* --- Sub-components --- */

function FilterButton({
  label,
  subLabel,
  active,
  onClick,
}: {
  label: string
  subLabel: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
        active
          ? "bg-[#FF6B2C] text-black border-[#FF6B2C] shadow-[0_0_20px_rgba(255,107,44,0.3)]"
          : "bg-[#111] text-white/60 border-white/10 hover:border-[#FF6B2C] hover:text-white"
      }`}
    >
      <span>{label}</span>
      <span className="text-xs opacity-60 border-l border-current pl-2 ml-1">{subLabel}</span>
    </button>
  )
}

interface AppointmentCardProps {
  appointment: AppointmentWithClient
  today: string
  processingId: string | null
  onMarkCompleted: (id: string) => void
}

function AppointmentCard({ appointment, today, processingId, onMarkCompleted }: AppointmentCardProps) {
  const isToday = appointment.appointment_date === today
  const showCompleteBtn =
    appointment.status === "confirmed" && (isToday || appointment.appointment_date < today)

  return (
    <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden hover:border-[#FF6B2C]/50 transition-colors group hover:shadow-lg hover:shadow-[#FF6B2C]/5">
      <div className="p-6 space-y-5">
        {/* Title / Date Block */}
        <div className="border-l-4 border-[#FF6B2C] pl-4">
          <h3 className="text-2xl font-black uppercase tracking-tight leading-none text-white mb-1">
            {isToday ? "Hoje" : formatDate(appointment.appointment_date)}
          </h3>
          <span className="text-xs text-white/40 font-medium uppercase tracking-wider">
            {isToday ? "Confira o agendamento do dia!" : "Agendamento reservado"}
          </span>
        </div>

        {/* Detalhes */}
        <div className="space-y-3">
          <TableRow
            icon={<User size={15} className="text-[#FF6B2C]" />}
            label={appointment.client_name || "N/A"}
            value={appointment.client_phone || "N/A"}
            phone
          />
          <TableRow
            icon={<Calendar size={15} className="text-[#FF6B2C]" />}
            label="Dia"
            value={formatDate(appointment.appointment_date)}
          />
          <TableRow
            icon={<Clock size={15} className="text-[#FF6B2C]" />}
            label="Horário"
            value={appointment.appointment_time.substring(0, 5)}
          />
          <TableRow
            icon={<Check size={15} className="text-[#FF6B2C]" />}
            label="Serviços"
            value={Array.isArray(appointment.services)
              ? appointment.services.join(", ")
              : String(appointment.services ?? "")
            }
          />
          <TableRow
            icon={<CircleDollarSign size={15} className="text-[#FF6B2C]" />}
            label="Valor"
            value={formatCurrency(appointment.total_price)}
          />

          <div className="flex items-center gap-3 text-sm text-white/70">
            <div className={`w-2 h-2 rounded-full ${getStatusColorDot(appointment.status)}`} />
            <span className="uppercase tracking-wide text-xs font-semibold text-white/50">
              Status
            </span>
          </div>
        </div>

        {/* Ações: Concluir e Status Badge */}
        <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
          {showCompleteBtn ? (
            <button
              onClick={() => onMarkCompleted(appointment.id!)}
              disabled={processingId === appointment.id}
              className="w-full bg-[#FF6B2C] text-black font-black uppercase text-lg tracking-widest py-3 px-6 border-2 border-[#FF6B2C] hover:bg-transparent hover:text-[#FF6B2C] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processingId === appointment.id ? (
                <Spinner size="sm" variant="dark" />
              ) : (
                <CheckCheck className="w-5 h-5" />
              )}
              Concluir
            </button>
          ) : (
            <div className="flex justify-center">
              <StatusBadge status={appointment.status} size="md" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TableRow({
  icon,
  label,
  value,
  phone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  phone?: boolean
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="flex flex-col">
        <span className="text-xs font-bold uppercase tracking-wide text-white/60 mb-0.5">{label}</span>
        <span className={`font-medium ${phone ? "text-[#FF6B2C]" : "text-white"}`}>{value}</span>
      </div>
    </div>
  )
}

/**
 * Retorna a classe de cor para o dot de status
 */
function getStatusColorDot(status: string): string {
  const config = getStatusConfig(status)
  // Extrai a cor do className (ex: "bg-green-500/20" -> "bg-green-500")
  const match = config.className.match(/bg-([a-z]+-\d+)\/\d+/)
  if (match) {
    return `bg-${match[1]}`
  }
  return "bg-white/40"
}
