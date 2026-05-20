"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { ptBR } from "date-fns/locale"
import { format } from "date-fns"

import { cn } from "@/lib/utils"

type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = false, // Mudado para false para esconder dias passados fora do mês corrente
  month,
  onMonthChange,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(month || new Date())

  React.useEffect(() => {
    if (month) {
      setCurrentMonth(month)
    }
  }, [month])

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() - 1)
    setCurrentMonth(newMonth)
    onMonthChange?.(newMonth)
  }

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + 1)
    setCurrentMonth(newMonth)
    onMonthChange?.(newMonth)
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-3 mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="flex items-center justify-center w-8 h-8 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-white uppercase">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="flex items-center justify-center w-8 h-8 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <DayPicker
        showOutsideDays={showOutsideDays}
        locale={ptBR}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        className={cn("p-3", className)}
        classNames={{
          months: "flex flex-col items-center justify-center w-full",
          month: "space-y-4 w-full flex flex-col items-center",

          caption: "hidden",
          caption_label: "hidden",

          nav: "hidden",
          nav_button:
            "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 text-white absolute",
          nav_button_previous: "left-1",
          nav_button_next: "right-1",
          table: "w-full border-collapse space-y-1",

          head_row: "flex",
          head_cell:
            "text-neutral-400 rounded-md w-9 font-normal text-[0.8rem]",

          row: "flex w-full mt-2",

          cell:
            "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-neutral-800 rounded-md",

          day:
            "h-9 w-9 p-0 font-normal text-white hover:bg-neutral-800 rounded-md data-[disabled]:text-neutral-700 data-[disabled]:opacity-30 data-[disabled]:pointer-events-none",

          day_selected:
            "bg-white text-black hover:bg-white hover:text-black",

          day_today:
            "border border-white/20",

          day_outside:
            "text-neutral-600 opacity-50",

          day_disabled:
            "text-neutral-100 opacity-80 pointer-events-none",

          day_hidden: "invisible",
        }}
        components={{
          Chevron: (props: {
            className?: string
            size?: number
            disabled?: boolean
            orientation?: "left" | "right" | "up" | "down"
          }) => {
            if (props.orientation === "left") {
              return <ChevronLeft className="w-5 h-5" />
            }
            if (props.orientation === "up") {
              return <ChevronLeft className="w-5 h-5 rotate-90" />
            }
            if (props.orientation === "down") {
              return <ChevronLeft className="w-5 h-5 -rotate-90" />
            }
            return <ChevronRight className="w-5 h-5" />
          },
        }}
        {...props}
      />
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }