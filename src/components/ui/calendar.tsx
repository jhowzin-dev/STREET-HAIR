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
  showOutsideDays = false,
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

  // Configura o idioma local para iniciar a semana na Segunda-feira (1). 
  // Assim, a ordem das colunas fica: seg, ter, qua, qui, sex, sab, dom.
  const customLocale = {
    ...ptBR,
    options: { ...ptBR.options, weekStartsOn: 1 as const }
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
        <span className="text-sm font-medium text-white uppercase tracking-wider">
          {format(currentMonth, "MMMM yyyy", { locale: customLocale })}
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
        locale={customLocale}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        className={cn("p-3 select-none", className)}
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

          head_row: "flex justify-between w-full px-1",
          head_cell:
            "text-neutral-400 rounded-md w-9 font-semibold text-[0.8rem] text-center uppercase tracking-wider",

          row: "flex w-full justify-between mt-2 px-1",

          cell:
            "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-neutral-800 rounded-md",

          day:
            "h-9 w-9 p-0 font-normal text-white hover:bg-neutral-800 rounded-md data-[disabled]:text-neutral-700 data-[disabled]:opacity-25 data-[disabled]:pointer-events-none transition-all",

          day_selected:
            "bg-white text-black hover:bg-white hover:text-black font-semibold shadow-lg shadow-white/10",

          day_today:
            "border border-white/30 font-medium text-amber-400",

          day_outside:
            "text-neutral-600 opacity-50",

          day_disabled:
            "text-neutral-500 opacity-25 pointer-events-none data-[disabled]:text-neutral-600",

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