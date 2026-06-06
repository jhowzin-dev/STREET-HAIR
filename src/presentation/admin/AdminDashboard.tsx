"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Calendar, Scissors, ArrowLeft, User, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { updateAppointmentStatus, revertAppointmentStatus } from "@/lib/actions/admin"
import type { Appointment } from "@/domain/entities"
import { formatCurrency } from "@/lib/formatters"
import { StatusBadge } from "@/presentation/widgets/StatusBadge"
import { Spinner } from "@/components/ui/Spinner"
import ConfirmModal from "@/components/ui/ConfirmModal"
import { getToday, formatFull } from "@/lib/formatters"

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

  const today = getToday()

  // Estados dos filtros da parte de cima
   const [selectedBarber, setSelectedBarber] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<"hoje" | "concluidos" | "cancelados">("hoje")

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
       if (selectedBarber === "all") return true
        return (appointment.professional?.name || "") === selectedBarber
    })

     return {
       hoje: barberFiltered.filter(a => a.appointment_date === today && a.status === "confirmed").length,
        // Only completed appointments from today
        concluidos: barberFiltered.filter(a => a.appointment_date === today && a.status === "completed").length,
       cancelados: barberFiltered.filter(a => a.appointment_date === today && a.status === "canceled").length
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
          // Completed appointments only from today
          matchesStatus = isToday && appointment.status === "completed"
        } else if (activeTab === "cancelados") {
        matchesStatus = isToday && appointment.status === "canceled"
      }

      const barberName = appointment.professional?.name || ""
      let matchesBarber = true
       if (selectedBarber !== "all") {
        matchesBarber = barberName === selectedBarber
      }

      return matchesStatus && matchesBarber
    })
  }, [appointments, activeTab, selectedBarber, today])

  // Próximos Agendamentos (dias futuros)
  const futureAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.appointment_date > today)
      .sort((a, b) => {
        const dateCompare = a.appointment_date.localeCompare(b.appointment_date)
        if (dateCompare !== 0) return dateCompare
        return a.appointment_time.localeCompare(b.appointment_time)
      })
  }, [appointments, today])

  const sortedAppointments = useMemo(() => {
    // Always sort by time ascending for the selected day
    return [...filteredAppointments].sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
  }, [filteredAppointments])


  // ---------- Histórico e Faturamento ----------
  // Initialize month state (from URL or today)
  const [monthDate, setMonthDate] = useState(() => {
    const param = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("month") : null
    if (param) {
      const parsed = new Date(param + "-01T00:00:00")
      return isNaN(parsed.getTime()) ? new Date() : parsed
    }
    return new Date()
  })

  // State for filter (default "todos")
  const [historyFilter, setHistoryFilter] = useState<"hoje" | "semana" | "mes" | "todos">("todos")


  // Sync month, filter and barber to URL (shallow, keep scroll)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const monthParam = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`
    params.set('month', monthParam)
    params.set('filter', historyFilter)
    params.set('barber', selectedBarber)
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false })
  }, [monthDate, historyFilter, selectedBarber])

  // Helper to sync filter state to URL (month & barber handled by effect above)
  const syncFilterToUrl = (filter: typeof historyFilter) => {
    const params = new URLSearchParams(window.location.search)
    params.set('filter', filter)
    // Preserve current month and barber
    const monthParam = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`
    params.set('month', monthParam)
    params.set('barber', selectedBarber)
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false })
  }

  // Update filter and URL when user selects a filter
  const handleFilterChange = (f: typeof historyFilter) => {
    setHistoryFilter(f)
    syncFilterToUrl(f)
  }

  // Detect if the selected month is the current month
  const isCurrentMonth = useMemo(() => {
    const now = new Date()
    return now.getFullYear() === monthDate.getFullYear() && now.getMonth() === monthDate.getMonth()
  }, [monthDate])

  // Central month range (start/end ISO strings) for the selected month
  // List of unique barbers for filter dropdown
  const barbers = useMemo(() => {
    const set = new Set<string>()
    appointments.forEach((a) => {
      const name = a.professional?.name
      if (name) set.add(name)
    })
    return Array.from(set).sort()
  }, [appointments])

  // Central month range (start/end ISO strings) for the selected month
  const monthRange = useMemo(() => {
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0)
    const fmt = (d: Date) => d.toISOString().split("T")[0]
    return { start: fmt(start), end: fmt(end) }
  }, [monthDate])





  // Helper to get start/end of week (Monday‑Sunday) based on a given date string (YYYY‑MM‑DD)
  const getWeekBounds = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00")
    const day = d.getDay()
    const diffToMonday = (day + 6) % 7 // 0 (Sun) -> 6, 1 (Mon) -> 0, etc.
    const monday = new Date(d)
    monday.setDate(d.getDate() - diffToMonday)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const fmt = (dt: Date) => dt.toISOString().split("T")[0]
    return { start: fmt(monday), end: fmt(sunday) }
  }

  // getMonthBounds removed – monthRange memo now provides start/end for the selected month

  // Helper to build a date string (YYYY-MM-DD) based on the selected month context and a specific day number
  const buildSelectedDate = (day: number) => {
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth() // 0‑based
    // Create date; if day exceeds month length, Date will roll over – clamp to last day of month
    const date = new Date(year, month, day)
    const iso = date.toISOString().split("T")[0]
    return iso
  }

   // List of completed appointments filtered by the selected period, respecting the selected month (monthDate)
  const historyAppointments = useMemo(() => {
    const completed = appointments.filter((a) => a.status === "completed")
    const filterByBarber = (list: typeof completed) => {
      return selectedBarber === "all" ? list : list.filter((a) => a.professional?.name === selectedBarber)
    }
    if (historyFilter === "hoje") {
      // Use today's day of month but within the selected month
      const selectedToday = buildSelectedDate(new Date().getDate())
      const result = completed.filter((a) => a.appointment_date === selectedToday)
      return filterByBarber(result)
    }
    if (historyFilter === "semana") {
      const day = new Date().getDate()
      const selectedDay = buildSelectedDate(day)
      const { start, end } = getWeekBounds(selectedDay)
      // Ensure we stay inside the selected month as well
      const { start: monthStart, end: monthEnd } = monthRange
      const weekStart = start > monthStart ? start : monthStart
      const weekEnd = end < monthEnd ? end : monthEnd
      const result = completed.filter((a) => a.appointment_date >= weekStart && a.appointment_date <= weekEnd)
      return filterByBarber(result)
    }
    if (historyFilter === "mes") {
      const { start, end } = monthRange
      const result = completed.filter((a) => a.appointment_date >= start && a.appointment_date <= end)
      return filterByBarber(result)
    }
    // "todos" – restrict to selected month and barber
    const { start, end } = monthRange
    const result = completed.filter((a) => a.appointment_date >= start && a.appointment_date <= end)
    return filterByBarber(result)
  }, [appointments, historyFilter, monthRange, selectedBarber])

  // Revenue calculations – always based on *completed* appointments, using the same bounds as above and respecting the selected month
  // Métricas de faturamento e quantidade de atendimentos no mês selecionado
const monthCount = useMemo(() => {
  const { start, end } = monthRange
  const filtered = appointments.filter((a) => a.status === "completed" && a.appointment_date >= start && a.appointment_date <= end)
  return selectedBarber === "all" ? filtered.length : filtered.filter((a) => a.professional?.name === selectedBarber).length
}, [appointments, monthRange, selectedBarber])

const historyRevenue = useMemo(() => {
    const sum = (list: Appointment[]) =>
      list.reduce((acc, a) => acc + (a.total_price || 0), 0)
    // Helper to apply barber filter
    const applyBarber = (list: Appointment[]) =>
      selectedBarber === "all" ? list : list.filter((a) => a.professional?.name === selectedBarber)
    // Hoje (within selected month)
    const selectedToday = buildSelectedDate(new Date().getDate())
    const hojeRaw = appointments.filter((a) => a.status === "completed" && a.appointment_date === selectedToday)
    const hoje = applyBarber(hojeRaw)
    // Semana (within selected month)
    const day = new Date().getDate()
    const selectedDay = buildSelectedDate(day)
    const { start: weekStartRaw, end: weekEndRaw } = getWeekBounds(selectedDay)
    const { start: monthStart, end: monthEnd } = monthRange
    const weekStart = weekStartRaw > monthStart ? weekStartRaw : monthStart
    const weekEnd = weekEndRaw < monthEnd ? weekEndRaw : monthEnd
    const semanaRaw = appointments.filter((a) => a.status === "completed" && a.appointment_date >= weekStart && a.appointment_date <= weekEnd)
    const semana = applyBarber(semanaRaw)
    // Mês (selected month)
    const { start: monthStartFull, end: monthEndFull } = monthRange
    const mesRaw = appointments.filter((a) => a.status === "completed" && a.appointment_date >= monthStartFull && a.appointment_date <= monthEndFull)
    const mes = applyBarber(mesRaw)
    // Total (all completed) – also respect barber filter
    const totalRaw = appointments.filter((a) => a.status === "completed")
    const total = applyBarber(totalRaw)
    return {
      hoje: sum(hoje),
      semana: sum(semana),
      mes: sum(mes),
      total: sum(total),
    }
  }, [appointments, monthRange, selectedBarber])

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
{formatFull(today)}
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

            </div>
          </div>

          <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
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

          {/* Próximos Agendamentos (dias futuros) */}
          <section className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm mt-6">
            <div className="p-4 border-b border-white/5">
              <h2 className="text-sm font-bold text-neutral-300 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-neutral-400" />
                Próximos Agendamentos
              </h2>
            </div>
            <div className="divide-y divide-white/5 max-h-[380px] overflow-y-auto">
              {futureAppointments.length === 0 ? (
                <EmptyState
                  icon={<Calendar className="w-6 h-6 mx-auto mb-2 text-neutral-600" />}
                  text="Nenhum agendamento futuro encontrado."
                />
              ) : (
                futureAppointments.map((appointment) => (
                  <AppointmentRow
                    key={appointment.id}
                    appointment={appointment}
                    isUpdating={isUpdating}
                    onStatusChange={handleStatusChange}
                    showDateInBadge={true}
                  />
                ))
              )}
            </div>
          </section>

          {/* Próximos Compromissos (Outros Dias) */}
          <section className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
<div className="flex items-center justify-between p-4 border-b border-white/5">
               <h2 className="text-sm font-bold text-neutral-300 flex items-center gap-2">
                 <Scissors className="w-4 h-4 text-neutral-400" />
                 Histórico e Faturamento
               </h2>
               <div className="bg-neutral-950 p-2 rounded-xl text-center">
                 <p className="text-xs text-neutral-400">Total</p>
                 <p className="text-amber-400 font-bold text-lg" data-testid="total-revenue">{formatCurrency(historyRevenue.total)}</p>
               </div>
             </div>

          {/* Filtros de período */}
{/* Seletor de mês centralizado e destacado */}
<div className="flex items-center justify-center gap-4 border-b border-white/5 pb-2 px-4">
  <button
onClick={() => setMonthDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth() - 1); return d; })}
    className="p-2 text-neutral-400 hover:text-amber-400"
    aria-label="Mês anterior"
  >
    <ChevronLeft className="w-6 h-6" />
  </button>
  <span className="text-lg font-medium text-neutral-400">
    {monthDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
  </span>
  <button
onClick={() => setMonthDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + 1); return d; })}
    className="p-2 text-neutral-400 hover:text-amber-400"
    aria-label="Próximo mês"
  >
    <ChevronRight className="w-6 h-6" />
  </button>
</div>

{/* Filtro de barbeiro */}
<div className="flex items-center justify-center gap-2 mb-2">
  <label htmlFor="barber-select" className="text-xs text-neutral-400">Barbeiro:</label>
  <select
    id="barber-select"
    value={selectedBarber}
    onChange={(e) => setSelectedBarber(e.target.value)}
    className="bg-neutral-950 text-neutral-400 p-1 rounded"
  >
    <option value="all">Todos os Barbeiros</option>
    {barbers.map((b) => (
      <option key={b} value={b}>{b}</option>
    ))}
  </select>
</div>

{/* Filtros de período (Hoje | Semana | Mês) */}
{isCurrentMonth && (
  <div className="flex justify-center gap-4 border-b border-white/5 pb-2 px-4">
    {(["hoje", "semana", "mes"] as const).map((f) => (
      <button
        key={f}
        onClick={() => handleFilterChange(f)}
        className={`text-xs font-semibold uppercase pb-2 px-2 border-b-2 transition-all whitespace-nowrap ${
          historyFilter === f
            ? "border-amber-400 text-amber-400"
            : "border-transparent text-neutral-400 hover:text-neutral-200"
        }`}
      >
        {f.charAt(0).toUpperCase() + f.slice(1)}
      </button>
    ))}
  </div>
)}

{/* Resumo de faturamento */}
{isCurrentMonth ? (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
    <div className="bg-neutral-950 p-3 rounded-xl text-center">
      <p className="text-xs text-neutral-400">Hoje</p>
      <p className="text-amber-400 font-bold text-lg">{formatCurrency(historyRevenue.hoje)}</p>
    </div>
    <div className="bg-neutral-950 p-3 rounded-xl text-center">
      <p className="text-xs text-neutral-400">Semana</p>
      <p className="text-amber-400 font-bold text-lg">{formatCurrency(historyRevenue.semana)}</p>
    </div>
    <div className="bg-neutral-950 p-3 rounded-xl text-center">
      <p className="text-xs text-neutral-400">Mês</p>
      <p className="text-amber-400 font-bold text-lg">{formatCurrency(historyRevenue.mes)}</p>
    </div>
    <div className="bg-neutral-950 p-3 rounded-xl text-center">
      <p className="text-xs text-neutral-400">Total</p>
      <p className="text-amber-400 font-bold text-lg">{formatCurrency(historyRevenue.total)}</p>
    </div>
  </div>
) : (
  <div className="grid grid-cols-1 gap-4 p-4">
    <div className="bg-neutral-950 p-3 rounded-xl text-center">
      <p className="text-xs text-neutral-400">Mês</p>
      <p className="text-xs text-neutral-400">{monthCount} atendimentos</p>
      <p className="text-amber-400 font-bold text-lg">{formatCurrency(historyRevenue.mes)}</p>
    </div>
  </div>
)}

          <div className="divide-y divide-white/5 max-h-[380px] overflow-y-auto">
            {historyAppointments.length === 0 ? (
              <EmptyState 
                icon={<Calendar className="w-6 h-6 mx-auto mb-2 text-neutral-600" />} 
                text="Nenhum histórico encontrado para o filtro selecionado." 
              />
            ) : (
              historyAppointments.map((appointment) => (
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
  const router = useRouter();


  const [showRevertConfirm, setShowRevertConfirm] = useState(false)


  const clientPhone = (appointment as any).client_phone
  const designatedBarber = appointment.professional?.name || "Não atribuído"

  // Formata a data para "DD/MM" caso precise exibir no quadrado
  const formattedDate = useMemo(() => {
    if (!appointment.appointment_date) return ""
    const [year, month, day] = appointment.appointment_date.split("-")
    return `${day}/${month}`
  }, [appointment.appointment_date])

  return (<>
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
      {/* Revert status button for completed or canceled */}
      {(appointment.status === "completed" || appointment.status === "canceled") && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={async () => {
                setShowRevertConfirm(true)
            }}
            disabled={isUpdating === appointment.id}
            className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl py-2.5 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            Reverter
          </button>
        </div>
      )}


    </div>
    {/* Revert Confirmation Modal */}
    <ConfirmModal
      open={showRevertConfirm}
      message="Deseja reverter o status deste agendamento?"
      onCancel={() => setShowRevertConfirm(false)}
      onConfirm={async () => {
        try {
          await revertAppointmentStatus(appointment.id, appointment.status)
          router.refresh()
        } catch (e) {
          console.error(e)
          alert('Erro ao reverter o status.')
        } finally {
          setShowRevertConfirm(false)
        }
      }}
    />

    </>
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