import { ReactNode, useState } from "react"
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  mail: Mail,
  lock: Lock,
  user: User,
}

interface FormFieldProps {
  label: string
  type?: "text" | "email" | "password" | "tel"
  value: string
  onChange: (value: string) => void
  placeholder?: string
  icon?: "mail" | "lock" | "user" | ReactNode
  required?: boolean
  minLength?: number
  disabled?: boolean
  className?: string
}

export function FormField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  required = false,
  minLength,
  disabled = false,
  className,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password"
  const inputType = isPassword ? (showPassword ? "text" : "password") : type

  const IconComponent = typeof icon === "string" && icon in iconMap ? iconMap[icon] : null

  return (
    <div className={cn("w-full", className)}>
      <label className="block text-white/80 text-sm mb-1.5 font-medium">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
            {typeof icon === "string" && IconComponent ? (
              <IconComponent className="w-5 h-5" />
            ) : (
              icon
            )}
          </div>
        )}
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          disabled={disabled}
          className={cn(
            "w-full bg-neutral-800 text-white rounded-xl border border-white/10",
            "focus:border-amber-500 outline-none transition-colors",
            icon ? "pl-11" : "px-4",
            isPassword ? "pr-12" : "pr-4",
            "py-3.5"
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  )
}
