"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"

type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={ptBR}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-4 w-full flex flex-col",
        
        // Contêiner principal do cabeçalho 
        caption: "flex items-center justify-between w-full relative pt-1 h-8 mb-2",
        
        // Texto centralizado do Mês e Ano
        caption_label: "text-base font-semibold text-white capitalize mx-auto z-0",
        
        // Container dos botões posicionado de forma absoluta sobrepondo o cabeçalho
        nav: "absolute inset-x-1 top-2 flex items-center justify-between pointer-events-none z-10 w-full",
        
        // Botão anterior 
        button_previous: cn(
          "h-8 w-8 rounded-md bg-neutral-800 hover:bg-neutral-700 text-white/70 hover:text-white transition-all flex items-center justify-center pointer-events-auto"
        ),
        // Botão próximo 
        button_next: cn(
          "h-8 w-8 rounded-md bg-neutral-800 hover:bg-neutral-700 text-white/70 hover:text-white transition-all flex items-center justify-center pointer-events-auto"
        ),

        table: "w-full border-collapse",
        head_row: "flex justify-between",
        head_cell: "text-white/40 rounded-md w-10 font-medium text-[0.8rem]",
        row: "flex w-full justify-between mt-2",
        cell: "relative h-10 w-10 text-center text-sm p-0",
        
        day: cn(
          "h-10 w-10 rounded-lg text-white hover:bg-white/10 transition-all duration-200"
        ),
        day_selected: "bg-white text-black hover:bg-white hover:text-black font-semibold",
        day_today: "border border-white/20 bg-white/5 text-white",
        day_outside: "text-white/10 opacity-20",
        day_disabled: "text-white/20 opacity-30 line-through cursor-not-allowed",
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
            return <ChevronLeft className="w-4 h-4" />
          }
          if (props.orientation === "up") {
            return <ChevronLeft className="w-4 h-4 rotate-90" />
          }
          if (props.orientation === "down") {
            return <ChevronLeft className="w-4 h-4 -rotate-90" />
          }
          return <ChevronRight className="w-4 h-4" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }