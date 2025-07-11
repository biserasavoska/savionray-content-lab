// Performance utility functions to replace heavy dependencies

/**
 * Native debounce implementation to replace lodash debounce
 * Reduces bundle size by ~70KB
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T & { cancel: () => void; flush: () => void } {
  let timeoutId: NodeJS.Timeout
  let lastArgs: Parameters<T>
  
  const debouncedFn = (...args: Parameters<T>) => {
    lastArgs = args
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
  
  debouncedFn.cancel = () => {
    clearTimeout(timeoutId)
  }
  
  debouncedFn.flush = () => {
    clearTimeout(timeoutId)
    if (lastArgs) {
      func(...lastArgs)
    }
  }
  
  return debouncedFn as T & { cancel: () => void; flush: () => void }
}

/**
 * Native throttle implementation
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T & { cancel: () => void } {
  let lastCall = 0
  let timeoutId: NodeJS.Timeout | null = null
  
  const throttledFn = (...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now()
        timeoutId = null
        func(...args)
      }, delay - (now - lastCall))
    }
  }
  
  throttledFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
  
  return throttledFn as T & { cancel: () => void }
}

/**
 * Performance monitoring utilities
 */
export const perf = {
  mark: (name: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(name)
    }
  },
  
  measure: (name: string, startMark: string, endMark?: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      try {
        window.performance.measure(name, startMark, endMark)
        const measures = window.performance.getEntriesByName(name)
        return measures[measures.length - 1]?.duration
      } catch (e) {
        console.warn('Performance measurement failed:', e)
        return null
      }
    }
    return null
  },
  
  now: () => {
    if (typeof window !== 'undefined' && window.performance) {
      return window.performance.now()
    }
    return Date.now()
  }
}

/**
 * Memory-efficient array chunk function
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * Deep object merge without lodash
 */
export function merge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  const result = { ...target }
  
  for (const source of sources) {
    for (const key in source) {
      if (source[key] !== undefined) {
        if (typeof source[key] === 'object' && !Array.isArray(source[key]) && source[key] !== null) {
          result[key] = merge(result[key] || ({} as any), source[key] as any)
        } else {
          result[key] = source[key] as any
        }
      }
    }
  }
  
  return result
}