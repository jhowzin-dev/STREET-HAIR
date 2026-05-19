import { useState, useCallback } from "react"

interface UseFormStateReturn<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
  setValue: <K extends keyof T>(field: K, value: T[K]) => void
  setError: (field: keyof T, error: string) => void
  clearErrors: () => void
  setSubmitting: (submitting: boolean) => void
  reset: () => void
}

export function useFormState<T extends Record<string, unknown>>(
  initialValues: T
): UseFormStateReturn<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting)
  }, [])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setIsSubmitting(false)
  }, [initialValues])

  return {
    values,
    errors,
    isSubmitting,
    setValue,
    setError,
    clearErrors,
    setSubmitting,
    reset,
  }
}
