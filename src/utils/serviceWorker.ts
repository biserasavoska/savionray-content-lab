// Service Worker registration and management utilities

interface ServiceWorkerConfig {
  swUrl?: string
  onUpdate?: (registration: ServiceWorkerRegistration) => void
  onSuccess?: (registration: ServiceWorkerRegistration) => void
  onError?: (error: Error) => void
  scope?: string
}

interface CacheStats {
  cacheNames: string[]
  totalSize: number
  itemCount: number
}

/**
 * Service Worker registration and management
 */
export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager
  private registration: ServiceWorkerRegistration | null = null
  private config: ServiceWorkerConfig = {}

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager()
    }
    return ServiceWorkerManager.instance
  }

  /**
   * Register the service worker
   */
  async register(config: ServiceWorkerConfig = {}): Promise<ServiceWorkerRegistration | null> {
    this.config = {
      swUrl: '/sw.js',
      scope: '/',
      ...config
    }

    if (!this.isSupported()) {
      console.warn('[SW] Service Workers not supported')
      return null
    }

    try {
      const registration = await navigator.serviceWorker.register(
        this.config.swUrl!,
        { scope: this.config.scope }
      )

      this.registration = registration
      this.setupEventListeners(registration)
      
      console.log('[SW] Service Worker registered successfully')
      this.config.onSuccess?.(registration)
      
      return registration
    } catch (error) {
      console.error('[SW] Service Worker registration failed:', error)
      this.config.onError?.(error as Error)
      return null
    }
  }

  /**
   * Unregister the service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false
    }

    try {
      const result = await this.registration.unregister()
      this.registration = null
      console.log('[SW] Service Worker unregistered')
      return result
    } catch (error) {
      console.error('[SW] Service Worker unregistration failed:', error)
      return false
    }
  }

  /**
   * Update the service worker
   */
  async update(): Promise<ServiceWorkerRegistration | null> {
    if (!this.registration) {
      console.warn('[SW] No registration found for update')
      return null
    }

    try {
      await this.registration.update()
      console.log('[SW] Service Worker updated')
      return this.registration
    } catch (error) {
      console.error('[SW] Service Worker update failed:', error)
      return null
    }
  }

  /**
   * Skip waiting and activate new service worker immediately
   */
  skipWaiting(): void {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<CacheStats> {
    if (!this.isSupported()) {
      return { cacheNames: [], totalSize: 0, itemCount: 0 }
    }

    try {
      const cacheNames = await caches.keys()
      let totalItemCount = 0

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()
        totalItemCount += keys.length
      }

      return {
        cacheNames,
        totalSize: 0, // Browser doesn't provide cache size API
        itemCount: totalItemCount
      }
    } catch (error) {
      console.error('[SW] Failed to get cache stats:', error)
      return { cacheNames: [], totalSize: 0, itemCount: 0 }
    }
  }

  /**
   * Clear all caches
   */
  async clearCaches(): Promise<boolean> {
    if (!this.isSupported()) {
      return false
    }

    try {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      console.log('[SW] All caches cleared')
      return true
    } catch (error) {
      console.error('[SW] Failed to clear caches:', error)
      return false
    }
  }

  /**
   * Check if service workers are supported
   */
  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serviceWorker' in navigator
  }

  /**
   * Check if app is running in standalone mode (PWA)
   */
  isStandalone(): boolean {
    if (typeof window === 'undefined') return false
    
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    )
  }

  /**
   * Get current registration
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration
  }

  /**
   * Get service worker state
   */
  getState(): {
    supported: boolean
    registered: boolean
    standalone: boolean
    updateAvailable: boolean
  } {
    return {
      supported: this.isSupported(),
      registered: this.registration !== null,
      standalone: this.isStandalone(),
      updateAvailable: this.registration?.waiting !== null
    }
  }

  private setupEventListeners(registration: ServiceWorkerRegistration): void {
    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[SW] New content available, update ready')
            this.config.onUpdate?.(registration)
          }
        })
      }
    })

    // Listen for controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] Controller changed, reloading page')
      window.location.reload()
    })

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleServiceWorkerMessage(event)
    })
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { data } = event

    switch (data.type) {
      case 'CACHE_UPDATED':
        console.log('[SW] Cache updated:', data.cacheName)
        break
      case 'OFFLINE_READY':
        console.log('[SW] App ready for offline use')
        break
      case 'UPDATE_AVAILABLE':
        console.log('[SW] Update available')
        this.config.onUpdate?.(this.registration!)
        break
      default:
        console.log('[SW] Message from service worker:', data)
    }
  }
}

/**
 * Install prompt manager for PWA installation
 */
export class InstallPromptManager {
  private deferredPrompt: any = null
  private installButton: HTMLElement | null = null

  /**
   * Initialize install prompt handling
   */
  init(installButtonSelector?: string): void {
    if (typeof window === 'undefined') return

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e
      this.showInstallButton()
    })

    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully')
      this.hideInstallButton()
      this.deferredPrompt = null
    })

    // Set up install button
    if (installButtonSelector) {
      this.installButton = document.querySelector(installButtonSelector)
      if (this.installButton) {
        this.installButton.addEventListener('click', () => this.promptInstall())
      }
    }
  }

  /**
   * Show the install prompt
   */
  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('[PWA] No install prompt available')
      return false
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt()
      
      // Wait for user response
      const choiceResult = await this.deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted install prompt')
        return true
      } else {
        console.log('[PWA] User dismissed install prompt')
        return false
      }
    } catch (error) {
      console.error('[PWA] Install prompt failed:', error)
      return false
    } finally {
      this.deferredPrompt = null
    }
  }

  /**
   * Check if install prompt is available
   */
  isInstallable(): boolean {
    return this.deferredPrompt !== null
  }

  /**
   * Check if app is already installed
   */
  isInstalled(): boolean {
    return ServiceWorkerManager.getInstance().isStandalone()
  }

  private showInstallButton(): void {
    if (this.installButton) {
      this.installButton.style.display = 'block'
    }
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('installpromptavailable'))
  }

  private hideInstallButton(): void {
    if (this.installButton) {
      this.installButton.style.display = 'none'
    }
  }
}

// Export singleton instances
export const serviceWorkerManager = ServiceWorkerManager.getInstance()
export const installPromptManager = new InstallPromptManager()

// Convenience functions
export async function registerServiceWorker(config?: ServiceWorkerConfig): Promise<ServiceWorkerRegistration | null> {
  return serviceWorkerManager.register(config)
}

export async function enablePWA(config?: { 
  swConfig?: ServiceWorkerConfig
  installButtonSelector?: string 
}): Promise<void> {
  // Register service worker
  await registerServiceWorker(config?.swConfig)
  
  // Initialize install prompt
  installPromptManager.init(config?.installButtonSelector)
  
  console.log('[PWA] Progressive Web App features enabled')
}

// React hook for service worker
export function useServiceWorker() {
  return {
    register: serviceWorkerManager.register.bind(serviceWorkerManager),
    unregister: serviceWorkerManager.unregister.bind(serviceWorkerManager),
    update: serviceWorkerManager.update.bind(serviceWorkerManager),
    skipWaiting: serviceWorkerManager.skipWaiting.bind(serviceWorkerManager),
    getCacheStats: serviceWorkerManager.getCacheStats.bind(serviceWorkerManager),
    clearCaches: serviceWorkerManager.clearCaches.bind(serviceWorkerManager),
    getState: serviceWorkerManager.getState.bind(serviceWorkerManager),
    isSupported: serviceWorkerManager.isSupported.bind(serviceWorkerManager),
    isStandalone: serviceWorkerManager.isStandalone.bind(serviceWorkerManager)
  }
}

// React hook for install prompt
export function useInstallPrompt() {
  return {
    promptInstall: installPromptManager.promptInstall.bind(installPromptManager),
    isInstallable: installPromptManager.isInstallable.bind(installPromptManager),
    isInstalled: installPromptManager.isInstalled.bind(installPromptManager)
  }
}