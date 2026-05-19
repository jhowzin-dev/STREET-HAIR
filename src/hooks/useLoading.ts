import { useState, useCallback } from "react"

interface UseLoadingReturn {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  withLoading: <T>(promise: Promise<T>) => Promise<T>
}

export function useLoading(initial = false): UseLoadingReturn {
  const [isLoading, setIsLoading] = useState(initial)

  const withLoading = useCallback(async <T,>(promise: Promise<T>): Promise<T> => {
    setIsLoading(true)
    try {
      const result = await promise
      return result
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { isLoading, setIsLoading, withLoading }
}
