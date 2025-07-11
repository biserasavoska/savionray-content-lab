// Memory leak prevention and monitoring utilities

interface MemorySnapshot {
  timestamp: number
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  componentCount: number
  listenerCount: number
}

interface LeakDetectionConfig {
  maxMemoryGrowth: number // MB
  sampleInterval: number // ms
  maxSamples: number
  alertThreshold: number // MB
}

/**
 * Memory leak detection and prevention utilities
 */
export class MemoryMonitor {
  private static instance: MemoryMonitor
  private snapshots: MemorySnapshot[] = []
  private intervals: NodeJS.Timeout[] = []
  private config: LeakDetectionConfig = {
    maxMemoryGrowth: 50, // 50MB
    sampleInterval: 30000, // 30 seconds
    maxSamples: 20,
    alertThreshold: 100 // 100MB
  }
  private componentRegistry = new Map<string, number>()
  private listenerRegistry = new Map<string, EventListener[]>()

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor()
    }
    return MemoryMonitor.instance
  }

  /**
   * Start memory monitoring
   */
  startMonitoring(config?: Partial<LeakDetectionConfig>): void {
    if (typeof window === 'undefined') return

    this.config = { ...this.config, ...config }
    
    const interval = setInterval(() => {
      this.takeSnapshot()
      this.analyzeMemoryGrowth()
    }, this.config.sampleInterval)

    this.intervals.push(interval)
    console.log('[MemoryMonitor] Started monitoring')
  }

  /**
   * Stop memory monitoring
   */
  stopMonitoring(): void {
    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals = []
    console.log('[MemoryMonitor] Stopped monitoring')
  }

  /**
   * Take a memory snapshot
   */
  takeSnapshot(): MemorySnapshot | null {
    if (typeof window === 'undefined' || !(window.performance as any).memory) {
      return null
    }

    const memory = (window.performance as any).memory
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      componentCount: this.getComponentCount(),
      listenerCount: this.getListenerCount()
    }

    this.snapshots.push(snapshot)
    
    // Keep only recent snapshots
    if (this.snapshots.length > this.config.maxSamples) {
      this.snapshots.shift()
    }

    return snapshot
  }

  /**
   * Get current memory usage
   */
  getCurrentMemoryUsage(): { used: number; total: number; limit: number } | null {
    if (typeof window === 'undefined' || !(window.performance as any).memory) {
      return null
    }

    const memory = (window.performance as any).memory
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
    }
  }

  /**
   * Analyze memory growth trends
   */
  analyzeMemoryGrowth(): void {
    if (this.snapshots.length < 3) return

    const recent = this.snapshots.slice(-3)
    const growthRate = this.calculateGrowthRate(recent)
    const currentUsage = recent[recent.length - 1].usedJSHeapSize / 1048576 // MB

    if (growthRate > this.config.maxMemoryGrowth) {
      console.warn('[MemoryMonitor] High memory growth detected:', {
        growthRate: `${growthRate.toFixed(2)}MB`,
        currentUsage: `${currentUsage.toFixed(2)}MB`,
        snapshots: recent.length
      })
    }

    if (currentUsage > this.config.alertThreshold) {
      console.error('[MemoryMonitor] Memory usage exceeded threshold:', {
        current: `${currentUsage.toFixed(2)}MB`,
        threshold: `${this.config.alertThreshold}MB`
      })
    }
  }

  /**
   * Register a component for tracking
   */
  registerComponent(name: string): void {
    const count = this.componentRegistry.get(name) || 0
    this.componentRegistry.set(name, count + 1)
  }

  /**
   * Unregister a component
   */
  unregisterComponent(name: string): void {
    const count = this.componentRegistry.get(name) || 0
    if (count > 1) {
      this.componentRegistry.set(name, count - 1)
    } else {
      this.componentRegistry.delete(name)
    }
  }

  /**
   * Register an event listener for tracking
   */
  registerListener(key: string, listener: EventListener): void {
    const listeners = this.listenerRegistry.get(key) || []
    listeners.push(listener)
    this.listenerRegistry.set(key, listeners)
  }

  /**
   * Unregister an event listener
   */
  unregisterListener(key: string, listener: EventListener): void {
    const listeners = this.listenerRegistry.get(key) || []
    const index = listeners.indexOf(listener)
    if (index > -1) {
      listeners.splice(index, 1)
      if (listeners.length === 0) {
        this.listenerRegistry.delete(key)
      }
    }
  }

  /**
   * Force garbage collection (if available)
   */
  forceGC(): void {
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc()
      console.log('[MemoryMonitor] Forced garbage collection')
    } else {
      console.warn('[MemoryMonitor] Garbage collection not available')
    }
  }

  /**
   * Get memory statistics
   */
  getStats(): {
    snapshots: number
    components: number
    listeners: number
    memoryGrowth: number
    currentUsage: number | null
  } {
    const currentUsage = this.getCurrentMemoryUsage()
    const memoryGrowth = this.snapshots.length >= 2 
      ? this.calculateGrowthRate(this.snapshots.slice(-2))
      : 0

    return {
      snapshots: this.snapshots.length,
      components: this.getComponentCount(),
      listeners: this.getListenerCount(),
      memoryGrowth,
      currentUsage: currentUsage?.used || null
    }
  }

  /**
   * Clear all tracking data
   */
  clear(): void {
    this.snapshots = []
    this.componentRegistry.clear()
    this.listenerRegistry.clear()
  }

  private calculateGrowthRate(snapshots: MemorySnapshot[]): number {
    if (snapshots.length < 2) return 0

    const first = snapshots[0]
    const last = snapshots[snapshots.length - 1]
    const timeDiff = last.timestamp - first.timestamp
    const memoryDiff = (last.usedJSHeapSize - first.usedJSHeapSize) / 1048576 // MB

    // Calculate growth per minute
    return (memoryDiff / timeDiff) * 60000
  }

  private getComponentCount(): number {
    return Array.from(this.componentRegistry.values()).reduce((sum, count) => sum + count, 0)
  }

  private getListenerCount(): number {
    return Array.from(this.listenerRegistry.values()).reduce((sum, listeners) => sum + listeners.length, 0)
  }
}

/**
 * Memory-safe event listener utility
 */
export class SafeEventListener {
  private listeners = new Map<string, EventListener>()
  private abortController = new AbortController()

  addEventListener(
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ): void {
    const key = `${target.constructor.name}-${type}`
    
    // Remove existing listener if any
    this.removeEventListener(target, type)
    
    // Add new listener with abort signal
    const safeOptions = {
      ...options,
      signal: this.abortController.signal
    }
    
    target.addEventListener(type, listener, safeOptions)
    this.listeners.set(key, listener)
    
    // Track for memory monitoring
    MemoryMonitor.getInstance().registerListener(key, listener)
  }

  removeEventListener(target: EventTarget, type: string): void {
    const key = `${target.constructor.name}-${type}`
    const listener = this.listeners.get(key)
    
    if (listener) {
      target.removeEventListener(type, listener)
      this.listeners.delete(key)
      MemoryMonitor.getInstance().unregisterListener(key, listener)
    }
  }

  removeAllListeners(): void {
    this.abortController.abort()
    this.listeners.clear()
    this.abortController = new AbortController()
  }
}

/**
 * Memory-safe timeout/interval utility
 */
export class SafeTimer {
  private timers = new Set<NodeJS.Timeout>()

  setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timer = setTimeout(() => {
      callback()
      this.timers.delete(timer)
    }, delay)
    
    this.timers.add(timer)
    return timer
  }

  setInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const timer = setInterval(callback, delay)
    this.timers.add(timer)
    return timer
  }

  clearTimeout(timer: NodeJS.Timeout): void {
    clearTimeout(timer)
    this.timers.delete(timer)
  }

  clearInterval(timer: NodeJS.Timeout): void {
    clearInterval(timer)
    this.timers.delete(timer)
  }

  clearAll(): void {
    this.timers.forEach(timer => {
      clearTimeout(timer)
      clearInterval(timer)
    })
    this.timers.clear()
  }
}

/**
 * WeakMap-based cache for preventing memory leaks
 */
export class WeakCache<K extends object, V> {
  private cache = new WeakMap<K, V>()

  get(key: K): V | undefined {
    return this.cache.get(key)
  }

  set(key: K, value: V): void {
    this.cache.set(key, value)
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  delete(key: K): boolean {
    return this.cache.delete(key)
  }
}

// Export singleton instance
export const memoryMonitor = MemoryMonitor.getInstance()

// React hook for memory monitoring
export function useMemoryMonitor(componentName: string) {
  return {
    registerComponent: () => memoryMonitor.registerComponent(componentName),
    unregisterComponent: () => memoryMonitor.unregisterComponent(componentName),
    getCurrentUsage: memoryMonitor.getCurrentMemoryUsage.bind(memoryMonitor),
    getStats: memoryMonitor.getStats.bind(memoryMonitor),
    forceGC: memoryMonitor.forceGC.bind(memoryMonitor)
  }
}

// Utility function to check for common memory leak patterns
export function detectMemoryLeaks(): {
  suspiciousPatterns: string[]
  recommendations: string[]
} {
  const suspiciousPatterns: string[] = []
  const recommendations: string[] = []

  // Check for excessive DOM nodes
  if (typeof document !== 'undefined') {
    const elementCount = document.querySelectorAll('*').length
    if (elementCount > 10000) {
      suspiciousPatterns.push(`High DOM node count: ${elementCount}`)
      recommendations.push('Consider virtual scrolling for large lists')
    }
  }

  // Check for excessive event listeners
  const stats = memoryMonitor.getStats()
  if (stats.listeners > 1000) {
    suspiciousPatterns.push(`High event listener count: ${stats.listeners}`)
    recommendations.push('Use SafeEventListener or cleanup listeners in useEffect')
  }

  // Check memory growth
  if (stats.memoryGrowth > 10) {
    suspiciousPatterns.push(`High memory growth rate: ${stats.memoryGrowth.toFixed(2)}MB/min`)
    recommendations.push('Profile memory usage and fix memory leaks')
  }

  return { suspiciousPatterns, recommendations }
}