import { useState, useCallback } from "react"

interface UseToggleReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  set: (value: boolean) => void
}

export function useToggle(initial = false): UseToggleReturn {
  const [isOpen, setIsOpen] = useState(initial)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])
  const set = useCallback((value: boolean) => setIsOpen(value), [])

  return { isOpen, open, close, toggle, set }
}
