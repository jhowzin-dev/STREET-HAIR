"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { format, startOfDay, addDays, isToday, isBefore } from "date-fns"
import { User, PlusCircle, CalendarDays, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Spinner } from "@/components/ui/Spinner"
import { TopHeader } from "../widgets/TopHeader"
import { BottomNavigationBar } from "../widgets/BottomNavigationBar"
import { BookingOption } from "../widgets/BookingOption"
import { TotalDisplay } from "../widgets/TotalDisplay"
import { Calendar } from "@/components/ui/calendar"
import { createAppointment, getBookedSlots } from "@/lib/actions/appointments"
import { getProfessionals } from "@/lib/actions/professionals"
import { getServices } from "@/lib/actions/services"
import type { Professional, Service } from "@/domain/entities"
import { formatCurrency } from "@/lib/formatters"

// Gera horários de 40 em 40 minutos
const generateTimeSlots = (): string[] => {
  const slots: string[] = []
  let hour = 9
  let minute = 0

  while (hour < 19 || (hour === 19 && minute <= 30)) {
    slots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`)
    minute += 40
    if (minute >= 60) {
      minute -= 60
      hour += 1
    }
  }
  return slots
}

const allSlots = generateTimeSlots()

export default function BookingPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [bookedSlots, setBookedSlots] = useState<{
    appointment_time: string
    professional_id: string | null
  }[]>([])

  const [loadingProf, setLoadingProf] = useState(true)
  const [loadingServ, setLoadingServ] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTimeSlots, setShowTimeSlots] = useState(false)

  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())

  const timeSlotsRef = useRef<HTMLDivElement>(null)

  // Sincroniza o mês do calendário
  useEffect(() => {
    if (selectedDate) {
      setCalendarMonth(selectedDate)
    }
  }, [selectedDate])

 
  useEffect(() => {
    if (selectedDate && timeSlotsRef.current && showTimeSlots) {
      setTimeout(() => {
        timeSlotsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }, 200)
    }
  }, [selectedDate, showTimeSlots])

  // Carrega profissionais e serviços ao montar
  useEffect(() => {
    getProfessionals()
      .then((data) => {
        setProfessionals(data)
        setLoadingProf(false)
      })
      .catch(console.error)

    getServices()
      .then((data) => {
        setServices(data)
        setLoadingServ(false)
      })
      .catch(console.error)
  }, [])

  // Busca horários ocupados quando a data mudar
  useEffect(() => {
    if (!selectedDate) {
      setBookedSlots([])
      setShowTimeSlots(false)
      return
    }

    setLoadingSlots(true)
    setShowTimeSlots(false)
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    getBookedSlots(dateStr)
      .then((slots) => {
        setBookedSlots(slots)
        setLoadingSlots(false)
        setShowTimeSlots(true)
      })
      .catch((err) => {
        console.error(err)
        setLoadingSlots(false)
      })
  }, [selectedDate])

  const getBarberName = () => {
    if (selectedBarber === "any") return "Sem preferência"
    return professionals.find((b) => b.id === selectedBarber)?.name || ""
  }

  const isComplete = selectedBarber !== null && selectedDate && selectedTime && selectedServices.length > 0

  const handleConfirm = async () => {
    if (!isComplete || !selectedDate) return

    try {
      setIsSubmitting(true)
      await createAppointment({
        professional_id: selectedBarber === "any" ? null : selectedBarber,
        appointment_date: format(selectedDate, "yyyy-MM-dd"),
        appointment_time: selectedTime!,
        services: selectedServices.map((s) => s.name),
        total_price: selectedServices.reduce((sum, s) => sum + s.price, 0),
      })
      window.location.href = "/appointments?success=true"
    } catch (err) {
      console.error("Erro ao criar agendamento:", err)
      alert("Erro ao confirmar agendamento. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  // Filtra e computa os horários válidos na tela de forma otimizada
  const availableSlots = useMemo(() => {
    if (!selectedDate) return []

    const now = new Date()
    const currentIsToday = isToday(selectedDate)

    return allSlots.filter((time) => {
      // 1. Validar se o horário já passou (caso seja hoje)
      if (currentIsToday) {
        const [hourStr, minuteStr] = time.split(":")
        const slotDateTime = new Date(now)
        slotDateTime.setHours(Number(hourStr), Number(minuteStr), 0, 0)
        
        if (isBefore(slotDateTime, now)) {
          return false
        }
      }

      // 2. Validar se o horário já está agendado/ocupado no banco
      const isBooked = bookedSlots.some((slot) => {
        if (selectedBarber && selectedBarber !== "any" && slot.professional_id) {
          return slot.appointment_time === time && slot.professional_id === selectedBarber
        }
        return slot.appointment_time === time
      })

      return !isBooked
    })
  }, [selectedDate, bookedSlots, selectedBarber])

  return (
    <main className="relative min-h-screen bg-black flex flex-col">
      <TopHeader showBack />

      <div className="flex-1 overflow-y-auto w-full px-8 pt-10 pb-40">
        {/* SEÇÃO PROFISSIONAL */}
        <div className="mb-1">
          <BookingOption
            icon={<User className="w-7 h-7" strokeWidth={1.5} />}
            text={selectedBarber !== null ? getBarberName() : "selecione um profissional"}
            onClick={() => toggleSection("profissional")}
          />

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              expandedSection === "profissional" ? "max-h-[400px] opacity-100 mt-4" : "max-h-0 opacity-0"
            }`}
          >
            <div className="bg-neutral-800 rounded-xl p-4">
              <p className="text-white/60 text-sm mb-3">Selecione o profissional</p>
              {loadingProf ? (
                <div className="flex justify-center py-4">
                  <Spinner size="sm" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {professionals.map((barber, index) => (
                    <BarberCard
                      key={barber.id}
                      barber={barber}
                      index={index}
                      isSelected={selectedBarber === barber.id}
                      onSelect={() => {
                        setSelectedBarber(barber.id)
                        setExpandedSection("servico")
                      }}
                    />
                  ))}

                  <NoPreferenceCard
                    isSelected={selectedBarber === "any"}
                    onSelect={() => {
                      setSelectedBarber("any")
                      setExpandedSection("servico")
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEÇÃO SERVIÇO */}
        <div className="mb-2">
          <BookingOption
            icon={<PlusCircle className="w-7 h-7" strokeWidth={1.5} />}
            text={
              selectedServices.length > 0
                ? `${selectedServices.length} serviço(s) - ${formatCurrency(
                    selectedServices.reduce((sum, s) => sum + s.price, 0)
                  )}`
                : "selecione o(s) serviço(s)"
            }
            onClick={() => toggleSection("servico")}
          />

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              expandedSection === "servico" ? "max-h-[350px] opacity-100 mt-4" : "max-h-0 opacity-0"
            }`}
          >
            <div className="bg-neutral-800 rounded-xl p-4">
              <div className="max-h-[240px] overflow-y-auto space-y-3 pr-1">
                {loadingServ ? (
                  <div className="flex justify-center py-4">
                    <Spinner size="sm" />
                  </div>
                ) : (
                  services.map((service, idx) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      index={idx}
                      isSelected={selectedServices.some((s) => s.id === service.id)}
                      onToggle={() => {
                        if (selectedServices.some((s) => s.id === service.id)) {
                          setSelectedServices(selectedServices.filter((s) => s.id !== service.id))
                        } else {
                          setSelectedServices([...selectedServices, service])
                        }
                      }}
                    />
                  ))
                )}
              </div>

              {selectedServices.length > 0 && (
                <button
                  onClick={() => setExpandedSection("horario")}
                  className="w-full mt-4 bg-neutral-600 text-white font-semibold py-3 rounded-lg hover:bg-neutral-500 transition-all border border-white/30"
                >
                  Continuar ({selectedServices.length} serviço{selectedServices.length > 1 ? "s" : ""}{" "}
                  - {formatCurrency(selectedServices.reduce((sum, s) => sum + s.price, 0))})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SEÇÃO HORÁRIO */}
        <div className="mb-2">
          <BookingOption
            icon={<CalendarDays className="w-7 h-7" strokeWidth={1.5} />}
            text={
              selectedDate && selectedTime
                ? `${selectedDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} - ${selectedTime}`
                : "selecione data e horário"
            }
            onClick={() => toggleSection("horario")}
          />

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              expandedSection === "horario" ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
            }`}
          >
            <div className="bg-neutral-800 rounded-xl p-4 space-y-4 overflow-y-auto max-h-[420px]">
              <Card className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden">
                <CardContent className="p-3 flex justify-center overflow-hidden">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date)
                      setSelectedTime(null)
                    }}
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    fixedWeeks
                    disabled={(date) => isBefore(startOfDay(date), startOfDay(new Date()))}
                    className="p-0"
                  />
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  {[
                    { label: "Hoje", value: 0 },
                    { label: "Amanhã", value: 1 },
                    { label: "3 dias", value: 3 },
                    { label: "1 semana", value: 7 },
                  ].map((preset) => (
                    <Button
                      key={preset.value}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-neutral-700 border-white/20 text-white hover:bg-neutral-600 text-xs"
                      onClick={() => {
                        const newDate = addDays(new Date(), preset.value)
                        setSelectedDate(newDate)
                        setSelectedTime(null)
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </CardFooter>
              </Card>

              {selectedDate && (
                <div ref={timeSlotsRef}>
                  <TimeSlotsSection
                    selectedDate={selectedDate}
                    loadingSlots={loadingSlots}
                    availableSlots={availableSlots}
                    selectedTime={selectedTime}
                    onSelectTime={(time) => {
                      setSelectedTime(time)
                      setExpandedSection(null)
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TOTAL + BOTÃO CONFIRMAR */}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-10 w-full max-w-sm px-6 space-y-2">
        <TotalDisplay
          value={selectedServices.reduce((sum, s) => sum + s.price, 0) / 100}
        />

        {isComplete && (
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full bg-white text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Spinner size="sm" variant="dark" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                Confirmar Agendamento
              </>
            )}
          </button>
        )}
      </div>

      <BottomNavigationBar />
    </main>
  )
}

/* --- Sub-components --- */
interface BarberCardProps {
  barber: Professional
  index: number
  isSelected: boolean
  onSelect: () => void
}

function BarberCard({ barber, isSelected, onSelect }: BarberCardProps) {
  const firstName = barber.name.split(" ")[0].toLowerCase()
  const imageSrc = `/${firstName}.png`

  return (
    <div
      onClick={onSelect}
      className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${
        isSelected ? "scale-105" : ""
      }`}
    >
      <div
        className={`w-full aspect-square rounded-xl overflow-hidden relative ${
          isSelected ? "ring-2 ring-white" : ""
        }`}
      >
        <img 
          src={imageSrc} 
          alt={barber.name} 
          className="w-full h-full object-cover object-[center_20%]" // Mantém as duas fotos centralizadas na mesma altura
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />

        {/* Fallback cinza reserva */}
        <div className="hidden w-full h-full bg-neutral-700 items-center justify-center text-white/30 text-[10px] text-center p-1 font-medium uppercase">
          {firstName}
        </div>

        {isSelected && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-black rounded-full" />
            </div>
          </div>
        )}
      </div>
      <span
        className={`text-xs text-center leading-tight ${
          isSelected ? "text-white font-medium" : "text-white/70"
        }`}
      >
        {barber.name}
      </span>
    </div>
  )
}

interface NoPreferenceCardProps {
  isSelected: boolean
  onSelect: () => void
}

function NoPreferenceCard({ isSelected, onSelect }: NoPreferenceCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${
        isSelected ? "scale-105" : ""
      }`}
    >
      <div
        className={`w-full aspect-square rounded-xl overflow-hidden relative bg-neutral-600 flex items-center justify-center ${
          isSelected ? "ring-2 ring-white" : ""
        }`}
      >
        <User className="w-10 h-10 text-white/40" strokeWidth={1.5} />
        {isSelected && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-black rounded-full" />
            </div>
          </div>
        )}
      </div>
      <span className="text-xs text-center leading-tight text-white/70">
        Sem
        <br />
        preferência
      </span>
    </div>
  )
}

interface ServiceCardProps {
  service: Service
  index: number
  isSelected: boolean
  onToggle: () => void
}

function ServiceCard({ service, isSelected, onToggle }: ServiceCardProps) {
  return (
    <div
      onClick={onToggle}
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
        service.popular
          ? "bg-amber-500/20 border border-amber-500/50 text-white hover:bg-amber-500/30"
          : "bg-neutral-700 text-white hover:bg-neutral-600"
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span>{service.name}</span>
          {service.popular && (
            <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-bold">
              MAIS VENDIDO
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-medium">{formatCurrency(service.price)}</span>
          {service.original_price && (
            <span className="text-white/40 text-xs line-through">
              {formatCurrency(service.original_price)}
            </span>
          )}
        </div>
      </div>
      <div
        className={`w-5 h-5 rounded-full border-2 ${
          isSelected ? "border-black bg-black" : "border-white/50"
        }`}
      >
        {isSelected && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        )}
      </div>
    </div>
  )
}

interface TimeSlotsSectionProps {
  selectedDate: Date
  loadingSlots: boolean
  availableSlots: string[]
  selectedTime: string | null
  onSelectTime: (time: string) => void
}

function TimeSlotsSection({ selectedDate, loadingSlots, availableSlots, selectedTime, onSelectTime }: TimeSlotsSectionProps) {
  return (
    <div className="animate-slideUp">
      <p className="text-white/60 text-sm mb-3">
        Horários disponíveis para {selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
      </p>
      {loadingSlots ? (
        <div className="flex justify-center py-4">
          <Spinner size="sm" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {availableSlots.map((time) => (
            <div
              key={time}
              onClick={() => onSelectTime(time)}
              className={`p-3 rounded-lg text-center cursor-pointer transition-all bg-neutral-700 text-white hover:bg-neutral-600 relative ${
                selectedTime === time ? "ring-2 ring-white" : ""
              }`}
            >
              {time}
              {selectedTime === time && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-black rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {availableSlots.length === 0 && !loadingSlots && (
        <p className="text-white/40 text-xs mt-3 text-center">
          Todos os horários desta data estão ocupados ou indisponíveis
        </p>
      )}
    </div>
  )
}