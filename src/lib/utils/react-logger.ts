'use client'

/**
 * REACT LOGGER UTILITIES
 * 
 * Client-side logging utilities for React components.
 * This file is separate to avoid server component issues.
 */

import { useEffect, useRef } from 'react'
import { logger } from './logger'

// ============================================================================
// REACT HOOK FOR COMPONENT LOGGING
// ============================================================================

export function useLogger(componentName: string) {
  const componentLogger = useRef({
    debug: (message: string, context?: Record<string, any>) => 
      logger.debug(`[${componentName}] ${message}`, context),
    info: (message: string, context?: Record<string, any>) => 
      logger.info(`[${componentName}] ${message}`, context),
    warn: (message: string, context?: Record<string, any>) => 
      logger.warn(`[${componentName}] ${message}`, context),
    error: (message: string, error?: Error, context?: Record<string, any>) => 
      logger.error(`[${componentName}] ${message}`, error, context)
  })

  useEffect(() => {
    componentLogger.current.debug('Component mounted')
    return () => {
      componentLogger.current.debug('Component unmounted')
    }
  }, [])

  return componentLogger.current
}

// ============================================================================
// REACT ERROR BOUNDARY LOGGING
// ============================================================================

export function logReactError(error: Error, errorInfo?: any, componentName?: string) {
  logger.error('React component error', error, {
    componentName,
    componentStack: errorInfo?.componentStack,
    errorBoundary: true
  })
}

// ============================================================================
// REACT EVENT LOGGING
// ============================================================================

export function logReactEvent(event: string, componentName: string, context?: Record<string, any>) {
  logger.info(`React event: ${event}`, {
    componentName,
    event,
    ...context
  })
}

// ============================================================================
// REACT PERFORMANCE LOGGING
// ============================================================================

export function usePerformanceLogger(componentName: string) {
  const startTime = useRef<number>(Date.now())

  useEffect(() => {
    const duration = Date.now() - startTime.current
    logger.info(`Component render completed`, {
      componentName,
      renderDuration: duration
    })
  })

  return {
    logRender: (duration?: number) => {
      const actualDuration = duration || (Date.now() - startTime.current)
      logger.debug(`Component render`, {
        componentName,
        renderDuration: actualDuration
      })
    }
  }
} 