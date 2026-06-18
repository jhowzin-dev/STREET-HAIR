"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Trash2, Plus, CheckCircle, History, Calendar } from "lucide-react"
import { parse, isBefore, startOfDay, isSameDay } from "date-fns"
import { TopHeader } from "../widgets/TopHeader"
import { BottomNavigationBar } from "../widgets/BottomNavigationBar"
import { Spinner } from "@/components/ui/Spinner"
import { Alert } from "@/components/ui/Alert"
import { getAppointments, cancelAppointment } from "@/lib/actions/appointments"
import type { Appointment } from "@/domain/entities"
import { formatCurrency, formatDate } from "@/lib/formatters"

export default function AppointmentsPage() {
  const searchParams = useSearchParams()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming")
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }

    getAppointments()
      .then((data) => {
        if (data) setAppointments(data)
      })
      .catch((err) => {
        console.error("Erro ao carregar agendamentos:", err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [searchParams])

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      await cancelAppointment(id)
      setAppointments((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      console.error("Erro ao cancelar agendamento:", err)
      alert("Erro ao cancelar agendamento. Tente novamente.")
    } finally {
      setIsDeleting(null)
    }
  }

  const isPastOrCompleted = (a: Appointment) => {
    const date = parse(a.appointment_date, "yyyy-MM-dd", new Date())
    const now = new Date()
    const isCompleted = a.status === "completed"

    if (isCompleted) return true

    if (isBefore(date, startOfDay(now))) return true

    if (isSameDay(date, now)) {
      const [hourStr, minuteStr] = a.appointment_time.split(":")
      const appointmentTime = new Date(date)
      appointmentTime.setHours(Number(hourStr), Number(minuteStr), 0, 0)
      if (appointmentTime < now) return true
    }

    return false
  }

  const upcoming = appointments.filter((a) => !isPastOrCompleted(a))
  const history = appointments.filter((a) => isPastOrCompleted(a))

  return (
    <main className="relative min-h-screen bg-black flex flex-col">
      <TopHeader />
      <div className="flex-1 overflow-y-auto w-full px-6 pt-6 pb-40">
        <h1 className="text-white text-xl font-medium mb-6">Seus agendamentos</h1>

        {showSuccess && (
          <Alert variant="success" className="mb-4">
            <CheckCircle className="w-5 h-5" />
            Agendamento confirmado com sucesso!
          </Alert>
        )}

        <div className="flex gap-2 mb-6">
          <TabButton
            active={activeTab === "upcoming"}
            onClick={() => setActiveTab("upcoming")}
            icon={<Calendar className="w-4 h-4" />}
            label={`Próximos (${upcoming.length})`}
          />
          <TabButton
            active={activeTab === "history"}
            onClick={() => setActiveTab("history")}
            icon={<History className="w-4 h-4" />}
            label={`Histórico (${history.length})`}
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="text-white/40 mt-4 text-sm">Carregando agendamentos...</p>
          </div>
        ) : (
          <AppointmentsList
            appointments={activeTab === "upcoming" ? upcoming : history}
            isHistory={activeTab === "history"}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        )}

        <Link href="/booking" className="block mt-8">
          <div className="bg-[#D9D9D9] rounded-xl p-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-300 transition-colors">
            <Plus className="w-5 h-5 text-black" />
            <span className="text-black font-medium">Novo agendamento</span>
          </div>
        </Link>
      </div>
      <BottomNavigationBar />
    </main>
  )
}

/* --- Sub-components --- */

interface TabButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
        active ? "bg-white text-black" : "bg-neutral-800 text-white/60 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

interface AppointmentsListProps {
  appointments: Appointment[]
  isHistory: boolean
  onDelete: (id: string) => void
  isDeleting: string | null
}

function AppointmentsList({ appointments, isHistory, onDelete, isDeleting }: AppointmentsListProps) {
  if (appointments.length === 0) {
    return (
      <div className="text-white/40 text-center py-12">
        <p>Nenhum agendamento {isHistory ? "no histórico" : "futuro"}</p>
        <p className="text-sm mt-2">
          {isHistory
            ? "Seus cortes passados aparecerão aqui"
            : 'Toque em "Novo agendamento" para começar'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          isHistory={isHistory}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  )
}

interface AppointmentCardProps {
  appointment: Appointment
  isHistory: boolean
  onDelete: (id: string) => void
  isDeleting: string | null
}

function AppointmentCard({ appointment, isHistory, onDelete, isDeleting }: AppointmentCardProps) {
  // CORREÇÃO DE TIMEZONE: Convertendo a string AAAA-MM-DD diretamente sem passar pelo fuso UTC bagunçado do JS
  const [year, month, day] = appointment.appointment_date.split("-")
  const dateStr = `${day}/${month}/${year}`

  if (isHistory) {
    return (
      <div className="bg-neutral-800 border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                Concluído
              </span>
            </div>
            <p className="text-white/80 text-sm mb-1">
              <span className="font-medium">Profissional:</span>{" "}
              {appointment.professional?.name || "Sem preferência"}
            </p>
            <p className="text-white/50 text-xs mb-2">{appointment.services.join(", ")}</p>
            <div className="flex gap-4">
              <span className="text-white/60 text-sm">{dateStr}</span>
              <span className="text-white/60 text-sm">{appointment.appointment_time}</span>
            </div>
          </div>
          <DeleteButton
            id={appointment.id!}
            onDelete={onDelete}
            isDeleting={isDeleting}
            variant="dark"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-4 flex items-center justify-between">
      <div className="flex-1">
        <p className="text-black text-sm mb-1">
          <span className="font-medium">Profissional:</span>{" "}
          {appointment.professional?.name || "Sem preferência"}
        </p>
        <p className="text-black/70 text-xs mb-2">{appointment.services.join(", ")}</p>
        <div className="flex gap-4">
          <span className="text-black text-sm font-medium">{dateStr}</span>
          <span className="text-black text-sm font-medium">{appointment.appointment_time}</span>
        </div>
      </div>
      <DeleteButton
        id={appointment.id!}
        onDelete={onDelete}
        isDeleting={isDeleting}
        variant="light"
      />
    </div>
  )
}

interface DeleteButtonProps {
  id: string
  onDelete: (id: string) => void
  isDeleting: string | null
  variant: "light" | "dark"
}

function DeleteButton({ id, onDelete, isDeleting, variant }: DeleteButtonProps) {
  return (
    <button
      onClick={() => onDelete(id)}
      disabled={isDeleting === id}
      className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
        variant === "light" ? "hover:bg-gray-200" : "hover:bg-neutral-700"
      }`}
    >
      {isDeleting === id ? (
        <Spinner size="sm" variant={variant} />
      ) : (
        <Trash2 className={`w-5 h-5 ${variant === "light" ? "text-black" : "text-white/60"}`} />
      )}
    </button>
  )
}