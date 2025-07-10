// Resource preloading utilities for performance optimization

interface PreloadOptions {
  priority?: 'high' | 'low' | 'auto'
  crossOrigin?: 'anonymous' | 'use-credentials'
  integrity?: string
  timeout?: number
}

interface PreloadResult {
  success: boolean
  resource: string
  error?: Error
  loadTime?: number
}

/**
 * Preload critical resources for better performance
 */
export class ResourcePreloader {
  private static instance: ResourcePreloader
  private preloadedResources = new Map<string, Promise<PreloadResult>>()
  private preloadQueue: Array<{ url: string; type: string; options?: PreloadOptions }> = []
  private isProcessing = false

  static getInstance(): ResourcePreloader {
    if (!ResourcePreloader.instance) {
      ResourcePreloader.instance = new ResourcePreloader()
    }
    return ResourcePreloader.instance
  }

  /**
   * Preload a CSS file
   */
  async preloadCSS(href: string, options: PreloadOptions = {}): Promise<PreloadResult> {
    return this.preloadResource(href, 'style', options)
  }

  /**
   * Preload a JavaScript file
   */
  async preloadJS(src: string, options: PreloadOptions = {}): Promise<PreloadResult> {
    return this.preloadResource(src, 'script', options)
  }

  /**
   * Preload an image
   */
  async preloadImage(src: string, options: PreloadOptions = {}): Promise<PreloadResult> {
    return this.preloadResource(src, 'image', options)
  }

  /**
   * Preload a font
   */
  async preloadFont(href: string, options: PreloadOptions = {}): Promise<PreloadResult> {
    return this.preloadResource(href, 'font', { 
      ...options, 
      crossOrigin: options.crossOrigin || 'anonymous' 
    })
  }

  /**
   * Preload JSON data
   */
  async preloadJSON(url: string, options: PreloadOptions = {}): Promise<PreloadResult> {
    return this.preloadResource(url, 'fetch', options)
  }

  /**
   * Preload multiple resources in parallel
   */
  async preloadBatch(resources: Array<{ url: string; type: string; options?: PreloadOptions }>): Promise<PreloadResult[]> {
    const promises = resources.map(({ url, type, options }) => 
      this.preloadResource(url, type, options)
    )
    return Promise.all(promises)
  }

  /**
   * Queue resources for background preloading
   */
  queuePreload(url: string, type: string, options?: PreloadOptions): void {
    this.preloadQueue.push({ url, type, options })
    this.processQueue()
  }

  /**
   * Preload critical route components
   */
  async preloadRoute(routePath: string): Promise<PreloadResult[]> {
    const routeManifest = this.getRouteManifest(routePath)
    const resources = routeManifest.map(resource => ({
      url: resource.url,
      type: resource.type,
      options: { priority: 'high' as const }
    }))
    
    return this.preloadBatch(resources)
  }

  /**
   * Preload Next.js pages
   */
  async preloadNextPage(href: string): Promise<void> {
    if (typeof window !== 'undefined' && 'next' in window) {
      try {
        const router = (window as any).next.router
        if (router && router.prefetch) {
          await router.prefetch(href)
        }
      } catch (error) {
        console.warn('Failed to preload Next.js page:', error)
      }
    }
  }

  /**
   * Check if resource is already preloaded
   */
  isPreloaded(url: string): boolean {
    return this.preloadedResources.has(url)
  }

  /**
   * Clear preload cache
   */
  clearCache(): void {
    this.preloadedResources.clear()
  }

  /**
   * Get preload statistics
   */
  getStats(): { total: number; successful: number; failed: number; cached: number } {
    let successful = 0
    let failed = 0
    
    this.preloadedResources.forEach(async (promise) => {
      try {
        const result = await promise
        if (result.success) successful++
        else failed++
      } catch {
        failed++
      }
    })

    return {
      total: this.preloadedResources.size,
      successful,
      failed,
      cached: this.preloadedResources.size
    }
  }

  private async preloadResource(url: string, type: string, options: PreloadOptions = {}): Promise<PreloadResult> {
    // Check if already preloading/preloaded
    if (this.preloadedResources.has(url)) {
      return this.preloadedResources.get(url)!
    }

    const promise = this.createPreloadPromise(url, type, options)
    this.preloadedResources.set(url, promise)
    
    return promise
  }

  private async createPreloadPromise(url: string, type: string, options: PreloadOptions): Promise<PreloadResult> {
    const startTime = performance.now()
    
    try {
      // Use different strategies based on resource type
      switch (type) {
        case 'image':
          await this.preloadImageResource(url, options)
          break
        case 'style':
          await this.preloadStyleResource(url, options)
          break
        case 'script':
          await this.preloadScriptResource(url, options)
          break
        case 'font':
          await this.preloadFontResource(url, options)
          break
        case 'fetch':
          await this.preloadFetchResource(url, options)
          break
        default:
          await this.preloadGenericResource(url, type, options)
      }

      const loadTime = performance.now() - startTime
      
      return {
        success: true,
        resource: url,
        loadTime
      }
    } catch (error) {
      return {
        success: false,
        resource: url,
        error: error as Error,
        loadTime: performance.now() - startTime
      }
    }
  }

  private preloadImageResource(src: string, options: PreloadOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      const timeout = options.timeout || 10000
      const timeoutId = setTimeout(() => {
        reject(new Error(`Image preload timeout: ${src}`))
      }, timeout)

      img.onload = () => {
        clearTimeout(timeoutId)
        resolve()
      }
      
      img.onerror = () => {
        clearTimeout(timeoutId)
        reject(new Error(`Failed to preload image: ${src}`))
      }
      
      if (options.crossOrigin) {
        img.crossOrigin = options.crossOrigin
      }
      
      img.src = src
    })
  }

  private preloadStyleResource(href: string, options: PreloadOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'style'
      link.href = href
      
      if (options.crossOrigin) {
        link.crossOrigin = options.crossOrigin
      }
      
      if (options.integrity) {
        link.integrity = options.integrity
      }

      link.onload = () => resolve()
      link.onerror = () => reject(new Error(`Failed to preload CSS: ${href}`))
      
      document.head.appendChild(link)
    })
  }

  private preloadScriptResource(src: string, options: PreloadOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'script'
      link.href = src
      
      if (options.crossOrigin) {
        link.crossOrigin = options.crossOrigin
      }

      link.onload = () => resolve()
      link.onerror = () => reject(new Error(`Failed to preload script: ${src}`))
      
      document.head.appendChild(link)
    })
  }

  private preloadFontResource(href: string, options: PreloadOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'font'
      link.type = 'font/woff2'
      link.href = href
      link.crossOrigin = options.crossOrigin || 'anonymous'

      link.onload = () => resolve()
      link.onerror = () => reject(new Error(`Failed to preload font: ${href}`))
      
      document.head.appendChild(link)
    })
  }

  private async preloadFetchResource(url: string, options: PreloadOptions): Promise<void> {
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }

    if (options.crossOrigin) {
      fetchOptions.mode = options.crossOrigin === 'anonymous' ? 'cors' : 'same-origin'
    }

    const response = await fetch(url, fetchOptions)
    
    if (!response.ok) {
      throw new Error(`Failed to preload resource: ${url} (${response.status})`)
    }
    
    // Cache the response
    await response.clone().text()
  }

  private preloadGenericResource(url: string, type: string, options: PreloadOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = type as any
      link.href = url
      
      if (options.crossOrigin) {
        link.crossOrigin = options.crossOrigin
      }

      link.onload = () => resolve()
      link.onerror = () => reject(new Error(`Failed to preload ${type}: ${url}`))
      
      document.head.appendChild(link)
    })
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.preloadQueue.length === 0) {
      return
    }

    this.isProcessing = true

    try {
      while (this.preloadQueue.length > 0) {
        const batch = this.preloadQueue.splice(0, 3) // Process 3 at a time
        await this.preloadBatch(batch)
        
        // Small delay to prevent blocking
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } finally {
      this.isProcessing = false
    }
  }

  private getRouteManifest(routePath: string): Array<{ url: string; type: string }> {
    // This would be populated from your build manifest
    // For now, return common resources
    return [
      { url: `/_next/static/chunks/pages${routePath}.js`, type: 'script' },
      { url: '/_next/static/css/app.css', type: 'style' },
    ]
  }
}

// Convenience functions
export const preloader = ResourcePreloader.getInstance()

export function preloadCriticalResources(): Promise<PreloadResult[]> {
  return preloader.preloadBatch([
    { url: '/_next/static/css/app.css', type: 'style', options: { priority: 'high' } },
    { url: '/fonts/inter-var.woff2', type: 'font', options: { priority: 'high' } },
  ])
}

export function preloadRouteResources(route: string): Promise<PreloadResult[]> {
  return preloader.preloadRoute(route)
}

// React hook for preloading
export function usePreloader() {
  return {
    preloadImage: preloader.preloadImage.bind(preloader),
    preloadCSS: preloader.preloadCSS.bind(preloader),
    preloadJS: preloader.preloadJS.bind(preloader),
    preloadFont: preloader.preloadFont.bind(preloader),
    preloadJSON: preloader.preloadJSON.bind(preloader),
    preloadRoute: preloader.preloadRoute.bind(preloader),
    preloadNextPage: preloader.preloadNextPage.bind(preloader),
    isPreloaded: preloader.isPreloaded.bind(preloader),
    getStats: preloader.getStats.bind(preloader),
  }
}