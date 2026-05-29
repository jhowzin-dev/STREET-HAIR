"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Calendar, Scissors, ArrowLeft, User, Trash2 } from "lucide-react"
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

  // Estados dos filtros da parte de cima
  const [selectedBarber, setSelectedBarber] = useState<string>("todos")
  const [activeTab, setActiveTab] = useState<"hoje" | "concluidos" | "cancelados" | "todos">("hoje")

  // Coleta dinamicamente os nomes dos barbeiros
  const availableBarbers = useMemo(() => {
    const names = appointments
      .map((a) => a.professional?.name)
      .filter(Boolean) as string[]
    return [...new Set(names)]
  }, [appointments])

  // --- CONTADORES DINÂMICOS PARA AS ABAS (Respeitam o barbeiro selecionado) ---
  const tabCounts = useMemo(() => {
    const barberFiltered = appointments.filter((appointment) => {
      if (selectedBarber === "todos") return true
      return (appointment.professional?.name || "") === selectedBarber
    })

    return {
      hoje: barberFiltered.filter(a => a.appointment_date === today && a.status === "confirmed").length,
      concluidos: barberFiltered.filter(a => a.status === "completed").length,
      cancelados: barberFiltered.filter(a => a.appointment_date === today && a.status === "canceled").length,
      todos: barberFiltered.length
    }
  }, [appointments, selectedBarber, today])

  // Lógica de filtragem na listagem principal baseado na aba ativa
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const isToday = appointment.appointment_date === today

      let matchesStatus = true
      if (activeTab === "hoje") {
        matchesStatus = isToday && appointment.status === "confirmed"
      } else if (activeTab === "concluidos") {
        matchesStatus = appointment.status === "completed"
      } else if (activeTab === "cancelados") {
        matchesStatus = isToday && appointment.status === "canceled"
      }

      const barberName = appointment.professional?.name || ""
      let matchesBarber = true
      if (selectedBarber !== "todos") {
        matchesBarber = barberName === selectedBarber
      }

      return matchesStatus && matchesBarber
    })
  }, [appointments, activeTab, selectedBarber, today])

  const sortedAppointments = useMemo(() => {
    return [...filteredAppointments].sort((a, b) => {
      // Se não for a aba de hoje, ordena primeiro por data e depois por hora
      if (activeTab !== "hoje") {
        const dateCompare = a.appointment_date.localeCompare(b.appointment_date)
        if (dateCompare !== 0) return dateCompare
      }
      return a.appointment_time.localeCompare(b.appointment_time)
    })
  }, [filteredAppointments, activeTab])

  // Filtro para a seção inferior: Outros dias (sem ser hoje)
  const otherDaysAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => appointment.appointment_date !== today)
      .sort((a, b) => {
        const dateCompare = a.appointment_date.localeCompare(b.appointment_date)
        if (dateCompare !== 0) return dateCompare
        return a.appointment_time.localeCompare(b.appointment_time)
      })
  }, [appointments, today])

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
    <main className="min-h-screen bg-black text-white antialiased">
      {/* Header */}
      <header className="bg-neutral-950/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-400 hover:text-white transition-colors" />
          </Link>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">Painel Admin</h1>
            <p className="text-neutral-500 text-xs">Street Hair - Barbearia</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* Agenda Principal */}
        <section className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="p-5 border-b border-white/5 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  Controle de Agendamentos
                </h2>
                <p className="text-neutral-400 text-xs mt-0.5 capitalize">
                  {new Date().toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>

              {/* Filtro de Barbeiro */}
              <div className="relative">
                <select
                  value={selectedBarber}
                  onChange={(e) => setSelectedBarber(e.target.value)}
                  className="w-full sm:w-44 bg-neutral-950 text-neutral-300 text-xs rounded-xl border border-white/5 pl-8 pr-3 py-2 appearance-none focus:outline-none focus:border-amber-400 font-medium cursor-pointer transition-colors"
                >
                  <option value="todos">Todos os Barbeiros</option>
                  {availableBarbers.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <User className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Abas com Contadores */}
            <div className="flex gap-2 border-b border-white/5 pb-1 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab("hoje")}
                className={`text-xs font-semibold uppercase pb-2 px-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "hoje"
                    ? "border-amber-400 text-amber-400"
                    : "border-transparent text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Para Hoje ({tabCounts.hoje})
              </button>
              <button
                onClick={() => setActiveTab("concluidos")}
                className={`text-xs font-semibold uppercase pb-2 px-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "concluidos"
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Cortes Já Foram ({tabCounts.concluidos})
              </button>
              <button
                onClick={() => setActiveTab("cancelados")}
                className={`text-xs font-semibold uppercase pb-2 px-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "cancelados"
                    ? "border-rose-500 text-rose-400"
                    : "border-transparent text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Cancelados ({tabCounts.cancelados})
              </button>
              <button
                onClick={() => setActiveTab("todos")}
                className={`text-xs font-semibold uppercase pb-2 px-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "todos"
                    ? "border-neutral-200 text-neutral-200"
                    : "border-transparent text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Ver Tudo ({tabCounts.todos})
              </button>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {sortedAppointments.length === 0 ? (
              <EmptyState 
                icon={<Calendar className="w-6 h-6 mx-auto mb-2 text-neutral-600" />} 
                text="Nenhum agendamento encontrado para este filtro." 
              />
            ) : (
              sortedAppointments.map((appointment) => (
                <AppointmentRow
                  key={appointment.id}
                  appointment={appointment}
                  isUpdating={isUpdating}
                  onStatusChange={handleStatusChange}
                  showDateInBadge={activeTab !== "hoje"} // Passa a propriedade para mudar o layout dinamicamente
                />
              ))
            )}
          </div>
        </section>

        {/* Próximos Compromissos (Outros Dias) */}
        <section className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="p-4 border-b border-white/5">
            <h2 className="text-sm font-bold text-neutral-300 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-neutral-400" />
              Próximos Compromissos (Outros Dias)
            </h2>
          </div>

          <div className="divide-y divide-white/5 max-h-[380px] overflow-y-auto">
            {otherDaysAppointments.length === 0 ? (
              <EmptyState 
                icon={<Calendar className="w-6 h-6 mx-auto mb-2 text-neutral-600" />} 
                text="Sem agendamentos para outros dias." 
              />
            ) : (
              otherDaysAppointments.map((appointment) => (
                <CompactAppointmentRow 
                  key={appointment.id} 
                  appointment={appointment} 
                  isUpdating={isUpdating}
                  onCancel={handleStatusChange}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

/* --- Sub-componentes --- */

interface EmptyStateProps {
  icon: React.ReactNode
  text: string
}

function EmptyState({ icon, text }: EmptyStateProps) {
  return (
    <div className="p-8 text-center text-neutral-500">
      {icon}
      <p className="text-xs">{text}</p>
    </div>
  )
}

interface AppointmentRowProps {
  appointment: Appointment
  isUpdating: string | null
  onStatusChange: (id: string, status: "confirmed" | "canceled" | "completed") => void
  showDateInBadge: boolean // Nova prop para controlar o comportamento visual
}

// Card Principal de Agendamento
function AppointmentRow({ appointment, isUpdating, onStatusChange, showDateInBadge }: AppointmentRowProps) {
  const clientPhone = (appointment as any).client_phone
  const designatedBarber = appointment.professional?.name || "Não atribuído"

  // Formata a data para "DD/MM" caso precise exibir no quadrado
  const formattedDate = useMemo(() => {
    if (!appointment.appointment_date) return ""
    const [year, month, day] = appointment.appointment_date.split("-")
    return `${day}/${month}`
  }, [appointment.appointment_date])

  return (
    <div className="p-4 hover:bg-white/[0.02] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Quadrado da esquerda dinâmico */}
          <div className="w-12 h-12 bg-neutral-950 rounded-xl flex items-center justify-center shrink-0 border border-white/5">
            <span className="text-neutral-200 font-bold text-sm tracking-tight">
              {showDateInBadge ? formattedDate : appointment.appointment_time}
            </span>
          </div>
          <div>
            <p className="text-neutral-100 font-semibold text-sm">
              {(appointment as any).client_name || "Cliente sem nome"}
              {/* Se estiver mostrando a data no badge, joga a hora pra cá com o pontinho igual ao seu print */}
              {showDateInBadge && (
                <span className="text-neutral-500 text-xs font-normal ml-1.5">
                  • {appointment.appointment_time}
                </span>
              )}
            </p>
            {clientPhone && clientPhone !== "Sem telefone" && (
              <p className="text-xs text-neutral-400 font-normal mt-0.5">
                {clientPhone}
              </p>
            )}
            <p className="text-neutral-400 text-xs mt-1">{appointment.services.join(", ")}</p>
            
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 bg-white/5 text-neutral-300 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border border-white/5">
                <User className="w-2.5 h-2.5 text-amber-400" />
                {designatedBarber}
              </span>
            </div>
          </div>
        </div>
        <StatusBadge status={appointment.status} size="sm" />
      </div>

      <div className="flex items-center justify-between pt-1">
        <div /> 
        <span className="text-amber-400 font-semibold text-sm">
          {formatCurrency(appointment.total_price)}
        </span>
      </div>

      {appointment.status === "confirmed" && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onStatusChange(appointment.id, "completed")}
            disabled={isUpdating === appointment.id}
            className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl py-2.5 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {isUpdating === appointment.id ? (
              <Spinner size="sm" variant="light" className="mx-auto" />
            ) : (
              "Concluir Corte"
            )}
          </button>
          <button
            onClick={() => onStatusChange(appointment.id, "canceled")}
            disabled={isUpdating === appointment.id}
            className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl py-2.5 text-xs font-semibold transition-colors disabled:opacity-50"
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
  isUpdating: string | null
  onCancel: (id: string, status: "confirmed" | "canceled" | "completed") => void
}

// Card Compacto de Outros Dias
function CompactAppointmentRow({ appointment, isUpdating, onCancel }: CompactAppointmentRowProps) {
  const date = new Date(appointment.appointment_date + "T00:00:00")
  const clientPhone = (appointment as any).client_phone
  const designatedBarber = appointment.professional?.name || "Não atribuído"

  return (
    <div className="p-4 hover:bg-white/[0.01] transition-colors">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-neutral-950 border border-white/5 rounded-xl flex items-center justify-center flex-col leading-none shrink-0">
            <span className="text-neutral-200 font-bold text-[11px]">
              {date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-neutral-200 text-sm font-semibold truncate">
              {(appointment as any).client_name || "Cliente sem nome"}{" "}
              <span className="text-neutral-500 text-xs font-normal ml-1">
                • {appointment.appointment_time}
              </span>
            </p>
            {clientPhone && clientPhone !== "Sem telefone" && (
              <p className="text-[11px] text-neutral-400 font-normal mt-0.5">
                {clientPhone}
              </p>
            )}
            <p className="text-neutral-400 text-xs mt-0.5 truncate">{appointment.services.join(", ")}</p>
            <p className="text-[10px] text-neutral-500 font-medium mt-1">Atendido por: <span className="text-neutral-400">{designatedBarber}</span></p>
          </div>
        </div>

        <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
          <StatusBadge status={appointment.status} size="sm" />
          <p className="text-amber-400 text-xs font-semibold">
            {formatCurrency(appointment.total_price)}
          </p>
          
          {appointment.status === "confirmed" && (
            <button
              onClick={() => {
                if(confirm("Deseja realmente cancelar este agendamento?")) {
                  onCancel(appointment.id, "canceled")
                }
              }}
              disabled={isUpdating === appointment.id}
              className="mt-1 flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-medium transition-colors disabled:opacity-50"
            >
              {isUpdating === appointment.id ? (
                <Spinner size="sm" className="w-3 h-3" />
              ) : (
                <>
                  <Trash2 className="w-3 h-3" />
                  Cancelar
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}