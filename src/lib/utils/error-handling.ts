/**
 * Error handling utilities for better development experience
 */

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  DATABASE = 'DATABASE',
  EXTERNAL_API = 'EXTERNAL_API',
  RATE_LIMIT = 'RATE_LIMIT',
  INTERNAL = 'INTERNAL'
}

/**
 * Create authentication error
 */
export function createAuthenticationError(message: string = 'Authentication required') {
  return {
    type: ErrorType.AUTHENTICATION,
    message,
    code: 'AUTH_REQUIRED'
  }
}

/**
 * Create authorization error
 */
export function createAuthorizationError(message: string = 'Access denied', details?: any) {
  return {
    type: ErrorType.AUTHORIZATION,
    message,
    code: 'ACCESS_DENIED',
    details
  }
}

/**
 * Create database error
 */
export function createDatabaseError(message: string = 'Database error occurred', details?: any) {
  return {
    type: ErrorType.DATABASE,
    message,
    code: 'DATABASE_ERROR',
    details
  }
}

/**
 * Log error with context
 */
export function logError(error: any, context?: string) {
  const errorMessage = error?.message || error?.toString() || 'Unknown error'
  const contextPrefix = context ? `[${context}] ` : ''
  
  console.error(`${contextPrefix}Error:`, errorMessage)
  
  if (error?.stack) {
    console.error('Stack trace:', error.stack)
  }
  
  return {
    type: ErrorType.INTERNAL,
    message: errorMessage,
    code: 'LOGGED_ERROR',
    context
  }
}

/**
 * Suppress known browser extension errors from console
 */
export const suppressExtensionErrors = () => {
  if (typeof window === 'undefined') return

  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn

  console.error = (...args) => {
    const errorMessage = args.join(' ')
    
    // Suppress known browser extension errors
    if (
      errorMessage.includes('content-script.js') ||
      errorMessage.includes('extension') ||
      errorMessage.includes('chrome-extension://') ||
      errorMessage.includes('moz-extension://') ||
      errorMessage.includes('safari-extension://')
    ) {
      // Silently ignore browser extension errors
      return
    }
    
    // Log other errors normally
    originalConsoleError.apply(console, args)
  }

  console.warn = (...args) => {
    const warningMessage = args.join(' ')
    
    // Suppress known browser extension warnings
    if (
      warningMessage.includes('content-script.js') ||
      warningMessage.includes('extension') ||
      warningMessage.includes('chrome-extension://') ||
      warningMessage.includes('moz-extension://') ||
      warningMessage.includes('safari-extension://')
    ) {
      // Silently ignore browser extension warnings
      return
    }
    
    // Log other warnings normally
    originalConsoleWarn.apply(console, args)
  }
}

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejections = () => {
  if (typeof window === 'undefined') return

  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason
    
    // Check if it's a browser extension error
    if (
      error?.message?.includes('content-script') ||
      error?.message?.includes('extension') ||
      error?.stack?.includes('chrome-extension://') ||
      error?.stack?.includes('moz-extension://') ||
      error?.stack?.includes('safari-extension://')
    ) {
      // Prevent the error from appearing in console
      event.preventDefault()
      return
    }
    
    // Log other unhandled rejections normally
    console.error('Unhandled promise rejection:', error)
  })
}

/**
 * Initialize error handling for development
 */
export const initializeErrorHandling = () => {
  if (process.env.NODE_ENV === 'development') {
    suppressExtensionErrors()
    handleUnhandledRejections()
  }
} 