import { useState, useEffect, useCallback } from 'react'

// API Data Fetching Hook
interface UseApiDataOptions<T> {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  dependencies?: any[]
  enabled?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

interface UseApiDataReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  mutate: (newData: T) => void
}

export function useApiData<T>({
  url,
  method = 'GET',
  body,
  headers = {},
  dependencies = [],
  enabled = true,
  onSuccess,
  onError
}: UseApiDataOptions<T>): UseApiDataReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      }

      if (body && method !== 'GET') {
        options.body = JSON.stringify(body)
      }

      const response = await fetch(url, options)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
      onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [url, method, body, headers, enabled, onSuccess, onError])

  const refetch = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  const mutate = useCallback((newData: T) => {
    setData(newData)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...dependencies])

  return {
    data,
    loading,
    error,
    refetch,
    mutate
  }
}

// Form Data Management Hook
interface UseFormDataOptions<T> {
  initialData: T
  onSubmit?: (data: T) => void | Promise<void>
  onValidate?: (data: T) => Record<string, string> | null
}

interface UseFormDataReturn<T> {
  formData: T
  updateFormData: (key: keyof T, value: any) => void
  setFormData: (data: T) => void
  resetForm: () => void
  errors: Record<string, string>
  loading: boolean
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

export function useFormData<T extends Record<string, any>>({
  initialData,
  onSubmit,
  onValidate
}: UseFormDataOptions<T>): UseFormDataReturn<T> {
  const [formData, setFormDataState] = useState<T>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const updateFormData = useCallback((key: keyof T, value: any) => {
    setFormDataState(prev => ({
      ...prev,
      [key]: value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[key as string]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key as string]
        return newErrors
      })
    }
  }, [errors])

  const setFormData = useCallback((data: T) => {
    setFormDataState(data)
  }, [])

  const resetForm = useCallback(() => {
    setFormDataState(initialData)
    setErrors({})
  }, [initialData])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!onSubmit) return

    // Validate form
    if (onValidate) {
      const validationErrors = onValidate(formData)
      if (validationErrors) {
        setErrors(validationErrors)
        return
      }
    }

    setLoading(true)
    setErrors({})

    try {
      await onSubmit(formData)
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ submit: error.message })
      }
    } finally {
      setLoading(false)
    }
  }, [formData, onSubmit, onValidate])

  return {
    formData,
    updateFormData,
    setFormData,
    resetForm,
    errors,
    loading,
    handleSubmit
  }
}

// Local Storage Hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}

// Debounce Hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
} 