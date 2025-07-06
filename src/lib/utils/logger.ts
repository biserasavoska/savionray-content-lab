/**
 * CENTRALIZED LOGGING UTILITY
 * 
 * Provides structured, environment-aware logging with request correlation,
 * performance tracking, and production-ready features.
 */

// ============================================================================
// LOG LEVELS
// ============================================================================

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export const LOG_LEVEL_NAMES = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.CRITICAL]: 'CRITICAL'
}

// ============================================================================
// LOG ENTRY INTERFACE
// ============================================================================

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  requestId?: string
  userId?: string
  sessionId?: string
  context?: Record<string, any>
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
  performance?: {
    duration: number
    operation: string
  }
  metadata?: {
    file?: string
    function?: string
    line?: number
    userAgent?: string
    ip?: string
  }
}

// ============================================================================
// LOGGER CONFIGURATION
// ============================================================================

export interface LoggerConfig {
  level: LogLevel
  environment: 'development' | 'staging' | 'production'
  enableConsole: boolean
  enableStructured: boolean
  enablePerformance: boolean
  enableRequestCorrelation: boolean
  externalService?: {
    endpoint: string
    apiKey: string
  }
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  environment: (process.env.NODE_ENV as any) || 'development',
  enableConsole: true,
  enableStructured: true,
  enablePerformance: true,
  enableRequestCorrelation: true
}

// ============================================================================
// LOGGER CLASS
// ============================================================================

class Logger {
  private config: LoggerConfig
  private requestId?: string
  private userId?: string
  private sessionId?: string
  private startTime: number

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.startTime = Date.now()
  }

  // ============================================================================
  // REQUEST CONTEXT MANAGEMENT
  // ============================================================================

  setRequestContext(requestId: string, userId?: string, sessionId?: string): void {
    this.requestId = requestId
    this.userId = userId
    this.sessionId = sessionId
  }

  clearRequestContext(): void {
    this.requestId = undefined
    this.userId = undefined
    this.sessionId = undefined
  }

  // ============================================================================
  // CORE LOGGING METHODS
  // ============================================================================

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context)
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error)
  }

  critical(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.CRITICAL, message, context, error)
  }

  // ============================================================================
  // PERFORMANCE LOGGING
  // ============================================================================

  time(operation: string): () => void {
    const start = Date.now()
    return () => {
      const duration = Date.now() - start
      this.log(LogLevel.INFO, `Operation completed: ${operation}`, undefined, undefined, {
        duration,
        operation
      })
    }
  }

  async timeAsync<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now()
    try {
      const result = await fn()
      const duration = Date.now() - start
      this.log(LogLevel.INFO, `Async operation completed: ${operation}`, undefined, undefined, {
        duration,
        operation
      })
      return result
    } catch (error) {
      const duration = Date.now() - start
      this.log(LogLevel.ERROR, `Async operation failed: ${operation}`, undefined, error as Error, {
        duration,
        operation
      })
      throw error
    }
  }

  // ============================================================================
  // API LOGGING HELPERS
  // ============================================================================

  logApiRequest(method: string, url: string, body?: any, headers?: Record<string, string>): void {
    this.info('API Request', {
      method,
      url,
      body: this.sanitizeBody(body),
      headers: this.sanitizeHeaders(headers)
    })
  }

  logApiResponse(method: string, url: string, status: number, body?: any, duration?: number): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO
    this.log(level, 'API Response', {
      method,
      url,
      status,
      body: this.sanitizeBody(body),
      duration
    })
  }

  logApiError(method: string, url: string, error: Error, duration?: number): void {
    this.error('API Error', error, {
      method,
      url,
      duration
    })
  }

  // ============================================================================
  // DATABASE LOGGING HELPERS
  // ============================================================================

  logDbQuery(operation: string, table: string, duration?: number, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, 'Database Query', {
      operation,
      table,
      duration,
      ...context
    })
  }

  logDbError(operation: string, table: string, error: Error, context?: Record<string, any>): void {
    this.error('Database Error', error, {
      operation,
      table,
      ...context
    })
  }

  // ============================================================================
  // AUTHENTICATION LOGGING HELPERS
  // ============================================================================

  logAuthEvent(event: string, userId?: string, context?: Record<string, any>): void {
    this.info('Authentication Event', {
      event,
      userId,
      ...context
    })
  }

  logAuthError(event: string, error: Error, userId?: string, context?: Record<string, any>): void {
    this.error('Authentication Error', error, {
      event,
      userId,
      ...context
    })
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error,
    performance?: { duration: number; operation: string }
  ): void {
    // Check if we should log this level
    if (level < this.config.level) {
      return
    }

    // Create log entry
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      requestId: this.requestId,
      userId: this.userId,
      sessionId: this.sessionId,
      context: this.sanitizeContext(context),
      performance,
      metadata: this.getMetadata()
    }

    // Add error information if provided
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      }
    }

    // Output based on configuration
    if (this.config.enableConsole) {
      this.outputToConsole(entry)
    }

    if (this.config.enableStructured) {
      this.outputStructured(entry)
    }

    // Send to external service if configured
    if (this.config.externalService) {
      this.sendToExternalService(entry).catch(err => {
        // Fallback to console if external service fails
        console.error('Failed to send log to external service:', err)
        this.outputToConsole(entry)
      })
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const { level, message, timestamp, context, error, performance } = entry
    const levelName = LOG_LEVEL_NAMES[level]
    const prefix = `[${timestamp}] [${levelName}]`

    // Color coding for different environments
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.CRITICAL]: '\x1b[35m' // Magenta
    }

    const reset = '\x1b[0m'
    const color = this.config.environment === 'development' ? colors[level] : ''

    // Basic message
    console.log(`${color}${prefix} ${message}${reset}`)

    // Context
    if (context && Object.keys(context).length > 0) {
      console.log(`${color}  Context:${reset}`, context)
    }

    // Error details
    if (error) {
      console.log(`${color}  Error:${reset}`, error.message)
      if (error.stack && this.config.environment === 'development') {
        console.log(`${color}  Stack:${reset}`, error.stack)
      }
    }

    // Performance info
    if (performance) {
      console.log(`${color}  Performance:${reset} ${performance.operation} took ${performance.duration}ms`)
    }

    // Request correlation
    if (this.requestId) {
      console.log(`${color}  Request ID:${reset} ${this.requestId}`)
    }
  }

  private outputStructured(entry: LogEntry): void {
    // In production, you might want to output structured JSON
    if (this.config.environment === 'production') {
      console.log(JSON.stringify(entry))
    }
  }

  private async sendToExternalService(entry: LogEntry): Promise<void> {
    if (!this.config.externalService) return

    try {
      const response = await fetch(this.config.externalService.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.externalService.apiKey}`
        },
        body: JSON.stringify(entry)
      })

      if (!response.ok) {
        throw new Error(`External logging service responded with ${response.status}`)
      }
    } catch (error) {
      // Don't throw - we don't want logging failures to break the app
      console.error('Failed to send log to external service:', error)
    }
  }

  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined

    const sanitized = { ...context }

    // Remove sensitive information
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization']
    sensitiveKeys.forEach(key => {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]'
      }
    })

    return sanitized
  }

  private sanitizeBody(body?: any): any {
    if (!body) return undefined

    // Remove sensitive fields from request/response bodies
    const sensitiveFields = ['password', 'token', 'secret', 'authorization']
    const sanitized = JSON.parse(JSON.stringify(body))

    const removeSensitive = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj

      if (Array.isArray(obj)) {
        return obj.map(removeSensitive)
      }

      const result: any = {}
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.includes(key.toLowerCase())) {
          result[key] = '[REDACTED]'
        } else {
          result[key] = removeSensitive(value)
        }
      }
      return result
    }

    return removeSensitive(sanitized)
  }

  private sanitizeHeaders(headers?: Record<string, string>): Record<string, string> | undefined {
    if (!headers) return undefined

    const sanitized = { ...headers }
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key']
    
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]'
      }
    })

    return sanitized
  }

  private getMetadata(): LogEntry['metadata'] {
    return {}
  }
}

// ============================================================================
// GLOBAL LOGGER INSTANCE
// ============================================================================

export const logger = new Logger()

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export const log = {
  debug: (message: string, context?: Record<string, any>) => logger.debug(message, context),
  info: (message: string, context?: Record<string, any>) => logger.info(message, context),
  warn: (message: string, context?: Record<string, any>) => logger.warn(message, context),
  error: (message: string, error?: Error, context?: Record<string, any>) => logger.error(message, error, context),
  critical: (message: string, error?: Error, context?: Record<string, any>) => logger.critical(message, error, context),
  time: (operation: string) => logger.time(operation),
  timeAsync: <T>(operation: string, fn: () => Promise<T>) => logger.timeAsync(operation, fn)
}

// ============================================================================
// REQUEST CONTEXT HELPERS
// ============================================================================

export function setRequestContext(requestId: string, userId?: string, sessionId?: string): void {
  logger.setRequestContext(requestId, userId, sessionId)
}

export function clearRequestContext(): void {
  logger.clearRequestContext()
}

// ============================================================================
// MIDDLEWARE FOR NEXT.JS
// ============================================================================

export function createRequestLogger() {
  return function requestLogger(req: any, res: any, next: any) {
    const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const startTime = Date.now()

    // Set request context
    setRequestContext(requestId)

    // Log request
    logger.logApiRequest(
      req.method,
      req.url,
      req.body,
      req.headers
    )

    // Override res.end to log response
    const originalEnd = res.end
    res.end = function(chunk: any, encoding: any) {
      const duration = Date.now() - startTime
      
      logger.logApiResponse(
        req.method,
        req.url,
        res.statusCode,
        chunk,
        duration
      )

      // Clear request context
      clearRequestContext()

      // Call original end
      originalEnd.call(this, chunk, encoding)
    }

    next()
  }
}

// ============================================================================
// REACT HOOK FOR COMPONENT LOGGING
// ============================================================================

// Note: React hooks are moved to a separate file to avoid server component issues
// See: src/lib/utils/react-logger.ts 