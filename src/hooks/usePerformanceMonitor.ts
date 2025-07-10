import { useEffect, useRef, useCallback } from 'react'
import { perf } from '@/utils/performance'

interface PerformanceMonitorOptions {
  trackRender?: boolean
  trackInteraction?: boolean
  componentName: string
}

export function usePerformanceMonitor({
  trackRender = true,
  trackInteraction: enableInteractionTracking = true,
  componentName
}: PerformanceMonitorOptions) {
  const renderStartTime = useRef<number>()
  const mounted = useRef(false)

  // Track component render time
  useEffect(() => {
    if (trackRender) {
      if (!mounted.current) {
        renderStartTime.current = perf.now()
        perf.mark(`${componentName}-render-start`)
        mounted.current = true
      }

      const renderEndTime = perf.now()
      perf.mark(`${componentName}-render-end`)
      
      const duration = perf.measure(
        `${componentName}-render-duration`,
        `${componentName}-render-start`,
        `${componentName}-render-end`
      )

      if (duration && duration > 16) { // 16ms = 60fps threshold
        console.warn(`${componentName} render took ${duration.toFixed(2)}ms (>16ms)`)
      }
    }
  })

  // Track user interactions
  const recordInteraction = useCallback((interactionName: string) => {
    if (enableInteractionTracking) {
      perf.mark(`${componentName}-${interactionName}`)
      
      // Track to analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'performance_interaction', {
          component: componentName,
          interaction: interactionName,
          timestamp: Date.now()
        })
      }
    }
  }, [componentName, enableInteractionTracking])

  // Memory usage monitoring
  const getMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && (window.performance as any).memory) {
      const memory = (window.performance as any).memory
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      }
    }
    return null
  }, [])

  return {
    trackInteraction: recordInteraction,
    getMemoryUsage
  }
}