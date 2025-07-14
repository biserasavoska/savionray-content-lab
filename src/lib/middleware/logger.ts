/**
 * NEXT.JS LOGGING MIDDLEWARE
 * 
 * Provides request logging, context management, and performance tracking
 * for Next.js API routes and pages.
 */

import { NextRequest, NextResponse } from 'next/server'

import { logger, setRequestContext, clearRequestContext } from '@/lib/utils/logger'

// ============================================================================
// REQUEST LOGGING MIDDLEWARE
// ============================================================================

export function withLogging(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    const startTime = Date.now()
    const requestId = req.headers.get('x-request-id') || 
                     `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Extract user info from session if available
    const userId = req.headers.get('x-user-id') || undefined
    const sessionId = req.headers.get('x-session-id') || undefined

    // Set request context
    setRequestContext(requestId, userId, sessionId)

    try {
      // Log request
      logger.logApiRequest(
        req.method,
        req.url,
        await getRequestBody(req),
        Object.fromEntries(req.headers.entries())
      )

      // Execute handler
      const response = await handler(req, ...args)

      // Calculate duration
      const duration = Date.now() - startTime

      // Log response
      logger.logApiResponse(
        req.method,
        req.url,
        response?.status || 200,
        await getResponseBody(response),
        duration
      )

      // Add request ID to response headers
      if (response instanceof NextResponse) {
        response.headers.set('x-request-id', requestId)
      }

      return response

    } catch (error) {
      // Calculate duration
      const duration = Date.now() - startTime

      // Log error
      logger.logApiError(
        req.method,
        req.url,
        error as Error,
        duration
      )

      // Return error response
      return NextResponse.json(
        { 
          success: false, 
          error: 'Internal server error',
          requestId 
        },
        { status: 500 }
      )

    } finally {
      // Clear request context
      clearRequestContext()
    }
  }
}

// ============================================================================
// API ROUTE WRAPPER
// ============================================================================

export function createApiHandler(handler: Function) {
  return withLogging(handler)
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function getRequestBody(req: NextRequest): Promise<any> {
  try {
    const contentType = req.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return await req.json()
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      return Object.fromEntries(await req.formData())
    }
    return undefined
  } catch {
    return undefined
  }
}

async function getResponseBody(response: any): Promise<any> {
  try {
    if (response instanceof NextResponse) {
      const clone = response.clone()
      const contentType = clone.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        return await clone.json()
      }
    }
    return undefined
  } catch {
    return undefined
  }
}

// ============================================================================
// PERFORMANCE TRACKING
// ============================================================================

export function withPerformanceTracking<T extends any[], R>(
  operation: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    return logger.timeAsync(operation, () => fn(...args))
  }
}

// ============================================================================
// DATABASE OPERATION WRAPPER
// ============================================================================

export function withDbLogging<T extends any[], R>(
  operation: string,
  table: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now()
    
    try {
      const result = await fn(...args)
      const duration = Date.now() - startTime
      
      logger.logDbQuery(operation, table, duration)
      return result
      
    } catch (error) {
      const duration = Date.now() - startTime
      logger.logDbError(operation, table, error as Error)
      throw error
    }
  }
}

// ============================================================================
// AUTHENTICATION WRAPPER
// ============================================================================

export function withAuthLogging<T extends any[], R>(
  event: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      const result = await fn(...args)
      logger.logAuthEvent(event)
      return result
      
    } catch (error) {
      logger.logAuthError(event, error as Error)
      throw error
    }
  }
} 