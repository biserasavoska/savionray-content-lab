/**
 * ERROR HANDLING UTILITIES
 * 
 * Centralized error handling for consistent error management across the application.
 * Provides error types, logging, and response helpers.
 */

// ============================================================================
// ERROR TYPES
// ============================================================================

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  DATABASE = 'DATABASE',
  EXTERNAL_API = 'EXTERNAL_API',
  INTERNAL = 'INTERNAL',
  RATE_LIMIT = 'RATE_LIMIT'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AppError {
  type: ErrorType
  message: string
  code: string
  severity: ErrorSeverity
  details?: Record<string, any>
  timestamp: Date
  userId?: string
  requestId?: string
}

export interface ErrorResponse {
  success: false
  error: {
    type: ErrorType
    message: string
    code: string
    details?: Record<string, any>
  }
  timestamp: string
  requestId?: string
}

// ============================================================================
// ERROR CREATION HELPERS
// ============================================================================

export function createError(
  type: ErrorType,
  message: string,
  code: string,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  details?: Record<string, any>
): AppError {
  return {
    type,
    message,
    code,
    severity,
    details,
    timestamp: new Date()
  }
}

export function createValidationError(
  field: string,
  message: string,
  details?: Record<string, any>
): AppError {
  return createError(
    ErrorType.VALIDATION,
    `Validation error for ${field}: ${message}`,
    'VALIDATION_ERROR',
    ErrorSeverity.LOW,
    { field, ...details }
  )
}

export function createAuthenticationError(
  message: string = 'Authentication required',
  details?: Record<string, any>
): AppError {
  return createError(
    ErrorType.AUTHENTICATION,
    message,
    'AUTHENTICATION_ERROR',
    ErrorSeverity.MEDIUM,
    details
  )
}

export function createAuthorizationError(
  message: string = 'Insufficient permissions',
  details?: Record<string, any>
): AppError {
  return createError(
    ErrorType.AUTHORIZATION,
    message,
    'AUTHORIZATION_ERROR',
    ErrorSeverity.MEDIUM,
    details
  )
}

export function createNotFoundError(
  resource: string,
  id?: string,
  details?: Record<string, any>
): AppError {
  const message = id 
    ? `${resource} with id ${id} not found`
    : `${resource} not found`
  
  return createError(
    ErrorType.NOT_FOUND,
    message,
    'NOT_FOUND_ERROR',
    ErrorSeverity.LOW,
    { resource, id, ...details }
  )
}

export function createDatabaseError(
  message: string,
  details?: Record<string, any>
): AppError {
  return createError(
    ErrorType.DATABASE,
    message,
    'DATABASE_ERROR',
    ErrorSeverity.HIGH,
    details
  )
}

export function createInternalError(
  message: string = 'Internal server error',
  details?: Record<string, any>
): AppError {
  return createError(
    ErrorType.INTERNAL,
    message,
    'INTERNAL_ERROR',
    ErrorSeverity.CRITICAL,
    details
  )
}

// ============================================================================
// ERROR LOGGING
// ============================================================================

export function logError(error: AppError, context?: Record<string, any>): void {
  const logData = {
    ...error,
    context,
    timestamp: error.timestamp.toISOString()
  }

  // Log based on severity
  switch (error.severity) {
    case ErrorSeverity.LOW:
      console.warn('App Warning:', logData)
      break
    case ErrorSeverity.MEDIUM:
      console.error('App Error:', logData)
      break
    case ErrorSeverity.HIGH:
    case ErrorSeverity.CRITICAL:
      console.error('Critical App Error:', logData)
      // In production, you might want to send to external logging service
      // await sendToLoggingService(logData)
      break
  }
}

// ============================================================================
// API RESPONSE HELPERS
// ============================================================================

export function createErrorResponse(
  error: AppError,
  requestId?: string
): ErrorResponse {
  return {
    success: false,
    error: {
      type: error.type,
      message: error.message,
      code: error.code,
      details: error.details
    },
    timestamp: error.timestamp.toISOString(),
    requestId
  }
}

export function getHttpStatusFromErrorType(type: ErrorType): number {
  switch (type) {
    case ErrorType.VALIDATION:
      return 400
    case ErrorType.AUTHENTICATION:
      return 401
    case ErrorType.AUTHORIZATION:
      return 403
    case ErrorType.NOT_FOUND:
      return 404
    case ErrorType.CONFLICT:
      return 409
    case ErrorType.RATE_LIMIT:
      return 429
    case ErrorType.DATABASE:
    case ErrorType.EXTERNAL_API:
    case ErrorType.INTERNAL:
    default:
      return 500
  }
}

// ============================================================================
// API ROUTE ERROR HANDLING
// ============================================================================

export async function handleApiError(
  error: unknown,
  requestId?: string
): Promise<{ status: number; body: ErrorResponse }> {
  let appError: AppError

  // Convert different error types to AppError
  if (isAppError(error)) {
    appError = error
  } else if (error instanceof Error) {
    appError = createInternalError(error.message, { originalError: error.stack })
  } else {
    appError = createInternalError('Unknown error occurred')
  }

  // Add request context
  appError.requestId = requestId

  // Log the error
  logError(appError)

  // Create response
  const status = getHttpStatusFromErrorType(appError.type)
  const body = createErrorResponse(appError, requestId)

  return { status, body }
}

export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error &&
    'code' in error &&
    'severity' in error &&
    'timestamp' in error
  )
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateRequired(
  value: any,
  fieldName: string
): AppError | null {
  if (value === null || value === undefined || value === '') {
    return createValidationError(fieldName, `${fieldName} is required`)
  }
  return null
}

export function validateString(
  value: any,
  fieldName: string,
  minLength?: number,
  maxLength?: number
): AppError | null {
  if (typeof value !== 'string') {
    return createValidationError(fieldName, `${fieldName} must be a string`)
  }

  if (minLength && value.length < minLength) {
    return createValidationError(fieldName, `${fieldName} must be at least ${minLength} characters`)
  }

  if (maxLength && value.length > maxLength) {
    return createValidationError(fieldName, `${fieldName} must be no more than ${maxLength} characters`)
  }

  return null
}

export function validateEmail(value: any, fieldName: string): AppError | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (typeof value !== 'string' || !emailRegex.test(value)) {
    return createValidationError(fieldName, `${fieldName} must be a valid email address`)
  }

  return null
}

export function validateId(value: any, fieldName: string): AppError | null {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return createValidationError(fieldName, `${fieldName} must be a valid ID`)
  }

  return null
}

// ============================================================================
// BULK VALIDATION
// ============================================================================

export function validateObject(
  obj: Record<string, any>,
  validations: Record<string, (value: any, fieldName: string) => AppError | null>
): { isValid: boolean; errors: AppError[] } {
  const errors: AppError[] = []

  for (const [fieldName, validationFn] of Object.entries(validations)) {
    const error = validationFn(obj[fieldName], fieldName)
    if (error) {
      errors.push(error)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// ============================================================================
// REQUEST ID GENERATION
// ============================================================================

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
} 