import { cn } from "@/lib/utils"

export const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  confirmed: {
    label: "Confirmado",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  canceled: {
    label: "Cancelado",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  completed: {
    label: "Concluído",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  no_show: {
    label: "Não compareceu",
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
}

interface StatusBadgeProps {
  status: string
  size?: "sm" | "md"
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status]
  const sizeClasses = size === "sm" ? "px-2 py-1 rounded text-xs" : "px-2 py-1 rounded-lg text-xs"

  return (
    <span className={cn("inline-block font-medium border", sizeClasses, config?.className ?? "bg-neutral-500/20 text-neutral-400 border-neutral-500/30")}>
      {config?.label ?? status}
    </span>
  )
}
