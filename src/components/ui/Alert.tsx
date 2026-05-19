import { cn } from "@/lib/utils"

type AlertVariant = "error" | "success" | "warning" | "info"

interface AlertProps {
  children: React.ReactNode
  variant?: AlertVariant
  className?: string
}

const variantStyles: Record<AlertVariant, string> = {
  error: "bg-red-500/20 border-red-500/50 text-red-400",
  success: "bg-green-500/20 border-green-500/50 text-green-400",
  warning: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
  info: "bg-blue-500/20 border-blue-500/50 text-blue-400",
}

export function Alert({ children, variant = "error", className }: AlertProps) {
  return (
    <div
      className={cn(
        "border rounded-xl p-3 text-sm",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </div>
  )
}
