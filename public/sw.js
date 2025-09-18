// Service Worker for Push Notifications
const CACHE_NAME = 'foodball-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  let notificationData;
  try {
    notificationData = event.data.json();
  } catch (error) {
    console.error('Error parsing notification data:', error);
    notificationData = {
      title: 'New Foodball Entry!',
      body: 'A new restaurant review has been posted',
      url: 'https://www.oodball.com/foodball'
    };
  }

  const notificationOptions = {
    body: notificationData.body || 'A new restaurant review has been posted',
    icon: notificationData.icon || 'https://oodball.com/notification-icon-192.png',
    badge: notificationData.badge || 'https://oodball.com/notification-badge-72.png',
    data: {
      url: notificationData.url || 'https://www.oodball.com/foodball'
    },
    actions: [
      {
        action: 'view',
        title: 'View Entry',
        icon: '/images/view-icon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/close-icon.png'
      }
    ],
    tag: 'foodball-entry',
    requireInteraction: false,
    vibrate: [200, 100, 200, 100, 200],
    silent: false,
    renotify: true,
    timestamp: Date.now(),
    dir: 'ltr'
  };

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'New Foodball Entry!',
      notificationOptions
    )
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || 'https://oodball.com/foodball';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes('www.oodball.com') && 'focus' in client) {
            client.focus();
            client.navigate(urlToOpen);
            return;
          }
        }
        
        // If no window is open, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for offline support (optional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    // Handle background sync if needed
  }
});

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed:', event);
  
  event.waitUntil(
    // Re-subscribe with new subscription
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BKEj54IqzhMP-3CazFJgkpc3ESbUP-zG7KXSyZvlapJGvn1_YYlX0XR5uSjjv3EGCiLBMOtRWK_zn9RTGA5pd04'
    }).then((newSubscription) => {
      // Send new subscription to server
      return fetch('https://www.oodball.com/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: newSubscription,
          userId: 'current-user-id' // You'll need to get this from somewhere
        }),
      });
    })
  );
});
