const CACHE_NAME = 'jansoochna-cache-v2'
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Mukta:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
]

self.addEventListener('install', (event) => {
  self.skipWaiting() // Activate new SW immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    })
  )
  self.clients.claim() // Take control of all pages immediately
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Skip API calls — let them go straight to network
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/socket.io')) {
    return
  }

  // For navigation requests (page loads), always serve index.html for SPA routing
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/index.html'))
        .then((response) => response || new Response('Offline', { status: 503 }))
    )
    return
  }

  // For static assets: Network-first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200 && event.request.method === 'GET') {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
        })
      })
  )
})
