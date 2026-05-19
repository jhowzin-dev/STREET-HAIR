import { cn } from "@/lib/utils"

interface DashboardCardProps {
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
  title?: string
  subtitle?: string
}

export function DashboardCard({ children, className, icon, title, subtitle }: DashboardCardProps) {
  return (
    <div className={cn("bg-neutral-900 border border-white/10 rounded-xl p-4", className)}>
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-2">
          {icon && <div className="text-amber-400">{icon}</div>}
          {title && <span className="text-white/40 text-xs">{title}</span>}
        </div>
      )}
      {children}
      {subtitle && <p className="text-white/40 text-xs mt-1">{subtitle}</p>}
    </div>
  )
}
