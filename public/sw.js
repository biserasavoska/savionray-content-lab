// Service Worker for Performance Optimization
// Caches static assets and API responses for better performance

const CACHE_NAME = 'savionray-content-lab-v1.0.0'
const STATIC_CACHE = 'static-cache-v1'
const API_CACHE = 'api-cache-v1'
const IMAGE_CACHE = 'image-cache-v1'

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/_next/static/css/',
  '/_next/static/js/',
  '/favicon.ico',
]

// API endpoints to cache
const CACHEABLE_API_ROUTES = [
  '/api/user/profile',
  '/api/organization/list',
  '/api/content/list',
  '/api/ideas/list',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== API_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request))
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request))
  } else {
    event.respondWith(handlePageRequest(request))
  }
})

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url)
  const isCacheable = CACHEABLE_API_ROUTES.some(route => 
    url.pathname.startsWith(route)
  )
  
  if (!isCacheable) {
    return fetch(request)
  }
  
  try {
    // Try network first
    const response = await fetch(request)
    
    if (response.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url)
    
    // Fallback to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for API requests
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This data is not available offline' 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const response = await fetch(request)
    
    if (response.ok) {
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('[SW] Failed to load image:', request.url)
    
    // Return placeholder image for failed loads
    return new Response(
      // 1x1 transparent pixel as fallback
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      {
        headers: { 'Content-Type': 'image/gif' }
      }
    )
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const response = await fetch(request)
    
    if (response.ok) {
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('[SW] Failed to load static asset:', request.url)
    return new Response('Asset not available offline', { status: 503 })
  }
}

// Handle page requests with network-first strategy
async function handlePageRequest(request) {
  try {
    const response = await fetch(request)
    return response
  } catch (error) {
    console.log('[SW] Network failed for page:', request.url)
    
    // Try to serve cached page
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Fallback to offline page
    return caches.match('/') || new Response('Page not available offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

// Helper functions
function isImageRequest(request) {
  return request.destination === 'image' ||
         /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(new URL(request.url).pathname)
}

function isStaticAsset(request) {
  const url = new URL(request.url)
  return url.pathname.startsWith('/_next/static/') ||
         url.pathname.startsWith('/static/') ||
         /\.(css|js|woff|woff2|ttf|eot)$/i.test(url.pathname)
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync())
  }
})

async function handleBackgroundSync() {
  console.log('[SW] Performing background sync')
  
  // Handle queued actions when back online
  try {
    const cache = await caches.open('offline-actions')
    const requests = await cache.keys()
    
    for (const request of requests) {
      try {
        await fetch(request)
        await cache.delete(request)
        console.log('[SW] Synced offline action:', request.url)
      } catch (error) {
        console.log('[SW] Failed to sync:', request.url)
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    getCacheSize().then(size => {
      event.ports[0].postMessage({ cacheSize: size })
    })
  }
})

async function getCacheSize() {
  const cacheNames = await caches.keys()
  let totalSize = 0
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName)
    const keys = await cache.keys()
    totalSize += keys.length
  }
  
  return totalSize
}