'use client'

import { useState, useCallback, useRef } from 'react'

import { logger } from '@/lib/utils/logger'

// ============================================================================
// FORM DATA HOOK
// ============================================================================

export interface FormField<T = any> {
  value: T
  error?: string
  touched: boolean
  required?: boolean
}

export interface FormState<T extends Record<string, any>> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
}

export type FormValidation<T> = {
  [K in keyof T]?: (value: T[K], allValues: T) => string | undefined
}

export interface UseFormDataOptions<T> {
  initialValues: T
  validation?: FormValidation<T>
  onSubmit?: (values: T) => Promise<void> | void
  onError?: (errors: Partial<Record<keyof T, string>>) => void
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

export function useFormData<T extends Record<string, any>>(
  options: UseFormDataOptions<T>
) {
  const {
    initialValues,
    validation = {},
    onSubmit,
    onError,
    validateOnChange = true,
    validateOnBlur = true
  } = options

  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
    isDirty: false
  })

  const initialValuesRef = useRef(initialValues)

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateField = useCallback((field: keyof T, value: T[keyof T]): string | undefined => {
    const validator = (validation as FormValidation<T>)[field]
    if (!validator) return undefined

    try {
      return validator(value, state.values)
    } catch (error) {
      logger.error(`Validation error for field ${String(field)}`, error as Error)
      return 'Validation error occurred'
    }
  }, [validation, state.values])

  const validateForm = useCallback((values: T = state.values): Partial<Record<keyof T, string>> => {
    const errors: Partial<Record<keyof T, string>> = {}

    for (const field of Object.keys(values) as Array<keyof T>) {
      const error = validateField(field, values[field])
      if (error) {
        errors[field] = error
      }
    }

    return errors
  }, [state.values, validateField])

  const isValid = useCallback((errors: Partial<Record<keyof T, string>>): boolean => {
    return Object.keys(errors).length === 0
  }, [])

  const isDirty = useCallback((values: T): boolean => {
    return JSON.stringify(values) !== JSON.stringify(initialValuesRef.current)
  }, [])

  // ============================================================================
  // FIELD MANAGEMENT
  // ============================================================================

  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setState(prev => {
      const newValues = { ...prev.values, [field]: value }
      const newErrors = { ...prev.errors }
      
      // Clear error when field is updated
      if (newErrors[field]) {
        delete newErrors[field]
      }

      // Validate on change if enabled
      if (validateOnChange) {
        const error = validateField(field, value)
        if (error) {
          newErrors[field] = error
        }
      }

      const allErrors = validateOnChange ? validateForm(newValues) : newErrors
      
      return {
        ...prev,
        values: newValues,
        errors: allErrors,
        isValid: isValid(allErrors),
        isDirty: isDirty(newValues)
      }
    })
  }, [validateOnChange, validateField, validateForm, isValid, isDirty])

  const setFieldTouched = useCallback((field: keyof T, touched: boolean = true) => {
    setState(prev => {
      const newTouched = { ...prev.touched, [field]: touched }
      const newErrors = { ...prev.errors }

      // Validate on blur if enabled
      if (validateOnBlur && touched) {
        const error = validateField(field, prev.values[field])
        if (error) {
          newErrors[field] = error
        } else if (newErrors[field]) {
          delete newErrors[field]
        }
      }

      const allErrors = validateOnBlur ? validateForm(prev.values) : newErrors

      return {
        ...prev,
        touched: newTouched,
        errors: allErrors,
        isValid: isValid(allErrors)
      }
    })
  }, [validateOnBlur, validateField, validateForm, isValid])

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
      isValid: isValid({ ...prev.errors, [field]: error })
    }))
  }, [isValid])

  // ============================================================================
  // FORM MANAGEMENT
  // ============================================================================

  const setValues = useCallback((values: Partial<T>) => {
    setState(prev => {
      const newValues = { ...prev.values, ...values }
      const allErrors = validateForm(newValues)
      
      return {
        ...prev,
        values: newValues,
        errors: allErrors,
        isValid: isValid(allErrors),
        isDirty: isDirty(newValues)
      }
    })
  }, [validateForm, isValid, isDirty])

  const reset = useCallback((newValues?: T) => {
    const values = newValues || initialValuesRef.current
    setState({
      values,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
      isDirty: false
    })
  }, [])

  const validate = useCallback(() => {
    const errors = validateForm()
    setState(prev => ({
      ...prev,
      errors,
      isValid: isValid(errors)
    }))
    return errors
  }, [validateForm, isValid])

  const submit = useCallback(async () => {
    if (!onSubmit) return

    const errors = validate()
    
    if (!isValid(errors)) {
      onError?.(errors)
      return
    }

    setState(prev => ({ ...prev, isSubmitting: true }))

    try {
      await onSubmit(state.values)
      
      logger.info('Form submitted successfully', { values: state.values })
      
      // Reset form after successful submission
      reset()
    } catch (error) {
      logger.error('Form submission failed', error as Error, { values: state.values })
      
      setState(prev => ({ ...prev, isSubmitting: false }))
      throw error
    }
  }, [onSubmit, validate, isValid, state.values, onError, reset])

  // ============================================================================
  // FIELD HELPERS
  // ============================================================================

  const getFieldProps = useCallback((field: keyof T) => {
    return {
      value: state.values[field],
      error: state.errors[field],
      touched: state.touched[field] || false,
      onChange: (value: T[keyof T]) => setFieldValue(field, value),
      onBlur: () => setFieldTouched(field, true),
      onFocus: () => setFieldTouched(field, false)
    }
  }, [state.values, state.errors, state.touched, setFieldValue, setFieldTouched])

  const getFieldError = useCallback((field: keyof T): string | undefined => {
    return state.touched[field] ? state.errors[field] : undefined
  }, [state.touched, state.errors])

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  return {
    // State
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    isDirty: state.isDirty,

    // Field management
    setFieldValue,
    setFieldTouched,
    setFieldError,
    getFieldProps,
    getFieldError,

    // Form management
    setValues,
    reset,
    validate,
    submit,

    // Utility
    hasErrors: Object.keys(state.errors).length > 0,
    isTouched: Object.keys(state.touched).length > 0
  }
}

// ============================================================================
// ASYNC FORM OPERATION HOOK
// ============================================================================

export interface AsyncFormOperationOptions<T> {
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
  onFinally?: () => void
}

export function useAsyncFormOperation<T>(
  operation: (data: T) => Promise<any>,
  options: AsyncFormOperationOptions<T> = {}
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (data: T) => {
    setIsLoading(true)
    setError(null)

    const endTimer = logger.time('Async Form Operation')

    try {
      const result = await operation(data)
      
      endTimer()
      options.onSuccess?.(result)
      
      logger.info('Async form operation completed successfully', { data })
      
      return result
    } catch (err) {
      endTimer()
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      
      logger.error('Async form operation failed', err as Error, { data })
      
      options.onError?.(err as Error)
      throw err
    } finally {
      setIsLoading(false)
      options.onFinally?.()
    }
  }, [operation, options])

  const reset = useCallback(() => {
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    execute,
    isLoading,
    error,
    reset
  }
} 