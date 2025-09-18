// NotificationManager - Handle push notification subscriptions
class NotificationManager {
  constructor() {
    this.vapidPublicKey = null;
    this.notificationServiceUrl = process.env.NODE_ENV === 'production' 
      ? 'https://www.oodball.com' 
      : 'http://localhost:3001';
  }

  // Check if notifications are supported
  isSupported() {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  // Get VAPID public key from server
  async getVapidPublicKey() {
    if (this.vapidPublicKey) {
      return this.vapidPublicKey;
    }

    try {
      const response = await fetch(`${this.notificationServiceUrl}/api/notifications/vapid-public-key`);
      const data = await response.json();
      this.vapidPublicKey = data.publicKey;
      return this.vapidPublicKey;
    } catch (error) {
      console.error('Failed to get VAPID public key:', error);
      // Fallback to hardcoded key (not recommended for production)
      this.vapidPublicKey = 'BKEj54IqzhMP-3CazFJgkpc3ESbUP-zG7KXSyZvlapJGvn1_YYlX0XR5uSjjv3EGCiLBMOtRWK_zn9RTGA5pd04';
      return this.vapidPublicKey;
    }
  }

  // Register service worker
  async registerServiceWorker() {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported in this browser');
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported');
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      throw new Error('Notification permission was denied');
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Subscribe to push notifications
  async subscribe(userId) {
    if (!userId) {
      throw new Error('User ID is required for subscription');
    }

    try {
      // Register service worker
      const registration = await this.registerServiceWorker();

      // Request permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error('Notification permission not granted');
      }

      // Get VAPID public key
      const publicKey = await this.getVapidPublicKey();

      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicKey)
      });

      // Send subscription to server
      const response = await fetch(`${this.notificationServiceUrl}/api/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription,
          userId: userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription to server');
      }

      console.log('Successfully subscribed to push notifications');
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(userId) {
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js');
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      // Remove subscription from server
      const response = await fetch(`${this.notificationServiceUrl}/api/notifications/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }

      console.log('Successfully unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  }

  // Check if user is currently subscribed
  async isSubscribed() {
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js');
      if (!registration) {
        return false;
      }

      const subscription = await registration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return false;
    }
  }

  // Get current subscription status
  async getSubscriptionStatus() {
    return {
      supported: this.isSupported(),
      permission: Notification.permission,
      subscribed: await this.isSubscribed()
    };
  }

  // Utility function to convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Send test notification (for admin use)
  async sendTestNotification(adminKey, title, body, url) {
    try {
      const response = await fetch(`${this.notificationServiceUrl}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title || 'Test Notification',
          body: body || 'This is a test notification',
          url: url || 'https://oodball.com/foodball',
          adminKey: adminKey
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }

      const result = await response.json();
      console.log('Test notification sent:', result);
      return result;
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
    }
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

export default notificationManager;
