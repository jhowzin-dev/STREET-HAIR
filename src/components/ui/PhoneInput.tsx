"use client"

import { useRef, useEffect, forwardRef, memo } from "react"
import { formatPhoneNumber } from "@/lib/utils/phone"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  /** Se verdadeiro, aplica foco apenas uma vez ao montar */
  autoFocus?: boolean
}

const PhoneInputBase = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput(
    { value, onChange, placeholder = "(00) 00000-0000", className = "", disabled = false, autoFocus = false },
    forwardedRef
  ) {
    const localRef = useRef<HTMLInputElement>(null)

    // Focus controlado: apenas uma vez, quando o componente monta
    useEffect(() => {
      if (autoFocus && localRef.current) {
        // Timeout para garantir que o modal jÃ¡ abriu e o input estÃ¡ visÃ­vel
        const timer = setTimeout(() => {
          localRef.current?.focus({ preventScroll: true })
        }, 50)
        return () => clearTimeout(timer)
      }
    }, [autoFocus])

    // Atualizar a referÃªncia forwardada de forma uncontrolled-friendly
    useEffect(() => {
      if (!forwardedRef) return
      if (typeof forwardedRef === "function") {
        forwardedRef(localRef.current)
      } else {
        forwardedRef.current = localRef.current
      }
    }, [forwardedRef])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      // Aceita apenas dÃ­gitos
      const digitsOnly = rawValue.replace(/\D/g, "")
      // Limita a 11 dÃ­gitos
      const limitedDigits = digitsOnly.slice(0, 11)
      // Formata com mÃ¡scara
      const formatted = formatPhoneNumber(limitedDigits)
      onChange(formatted)
    }

    return (
      <input
        ref={localRef}
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="tel"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={16}
        className={className}
      />
    )
  }
)

// Memo para evitar re-renders desnecessÃ¡rios se props nÃ£o mudarem
export const PhoneInput = memo(PhoneInputBase)
PhoneInput.displayName = "PhoneInput"
