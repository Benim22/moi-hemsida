// Service Worker för Moi Sushi - Notifikationsstöd
const CACHE_NAME = 'moi-sushi-v1'

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated')
  event.waitUntil(self.clients.claim())
})

// Push event för notifikationer
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received')
  
  const options = {
    body: event.data ? event.data.text() : 'Ny beställning mottagen!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    tag: 'moi-order',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Visa beställning'
      },
      {
        action: 'dismiss',
        title: 'Stäng'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('Moi Sushi', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked')
  
  event.notification.close()
  
  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow('/terminal')
    )
  }
})

// Message event
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
}) 