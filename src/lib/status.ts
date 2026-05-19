import { AppointmentStatus } from "@/domain/entities"

export interface StatusConfig {
  label: string
  className: string
}

export const statusConfig: Record<AppointmentStatus | string, StatusConfig> = {
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


export function getStatusConfig(status: string): StatusConfig {
  return statusConfig[status] ?? {
    label: status,
    className: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30",
  }
}


export function getStatusColorClass(status: string): string {
  const config = getStatusConfig(status)
  return config.className
}


export function getStatusLabel(status: string): string {
  return getStatusConfig(status).label
}
