// Push Notification Service for Foodball Updates
// Run this with: node notification-service.js

const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://oodball.com'],
  credentials: true
}));
app.use(express.json());

// Supabase client
const supabase = createClient(
  'https://mkusymfkgvqnzdjjznrq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdXN5bWZrZ3Zxbnpkamp6bnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNjYwMTYsImV4cCI6MjA2ODc0MjAxNn0.u_5mw3AKSzpSKgKP7ssEs6sQ2jXRLRhbCD2OhviKMb8'
);

// VAPID keys for push notifications
// Generate these with: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BH8Q3C2L1vC8a_g1wF3p2N1y2OqR5nI6d4YjT8uA_VpF1e9E4pA7rKoW2mJ1nV5rM8cH0dY4uT2pA6iS3oH1mL9';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'e1-8a3Q4R7tU9vI2wK5nO1mP8jH4cA6xE3yB9zF2sL7';

// Configure web-push
webpush.setVapidDetails(
  'mailto:your-email@oodball.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Route to get VAPID public key
app.get('/api/notifications/vapid-public-key', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// Route to subscribe to notifications
app.post('/api/notifications/subscribe', async (req, res) => {
  try {
    const { subscription, userId } = req.body;
    
    if (!subscription || !userId) {
      return res.status(400).json({ error: 'Subscription and userId required' });
    }

    // Store subscription in Supabase
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        subscription: JSON.stringify(subscription),
        endpoint: subscription.endpoint,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error storing subscription:', error);
      return res.status(500).json({ error: 'Failed to store subscription' });
    }

    console.log('Subscription stored for user:', userId);
    res.json({ success: true, message: 'Subscription stored successfully' });
  } catch (error) {
    console.error('Error in subscribe endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to unsubscribe from notifications
app.post('/api/notifications/unsubscribe', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'UserId required' });
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing subscription:', error);
      return res.status(500).json({ error: 'Failed to remove subscription' });
    }

    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Error in unsubscribe endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to send notification to all subscribers (for when you add new entries)
app.post('/api/notifications/send', async (req, res) => {
  try {
    const { title, body, url, adminKey } = req.body;
    
    // Simple admin authentication - replace with your preferred method
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'foodball-admin-2025') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get all subscriptions from database
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.json({ success: true, message: 'No subscribers to notify', sent: 0 });
    }

    // Send notifications to all subscribers
    const notificationPromises = subscriptions.map(async (sub) => {
      try {
        const subscription = JSON.parse(sub.subscription);
        
        const payload = JSON.stringify({
          title: title || 'New Foodball Entry!',
          body: body || 'A new restaurant review has been posted',
          url: url || 'https://oodball.com/foodball',
          icon: 'https://oodball.com/images/foodball-icon.png',
          badge: 'https://oodball.com/images/foodball-badge.png'
        });

        await webpush.sendNotification(subscription, payload);
        return { success: true, userId: sub.user_id };
      } catch (error) {
        console.error(`Failed to send notification to user ${sub.user_id}:`, error);
        
        // If subscription is invalid, remove it from database
        if (error.statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', sub.user_id);
        }
        
        return { success: false, userId: sub.user_id, error: error.message };
      }
    });

    const results = await Promise.all(notificationPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Notifications sent: ${successful} successful, ${failed} failed`);
    res.json({ 
      success: true, 
      message: `Notifications sent to ${successful} users`, 
      sent: successful,
      failed: failed
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'Foodball Notification Service' });
});

app.listen(PORT, () => {
  console.log(`🚀 Notification service running on port ${PORT}`);
  console.log(`📱 VAPID public key: ${VAPID_PUBLIC_KEY}`);
  console.log(`🔔 Ready to send push notifications!`);
});

module.exports = app;
