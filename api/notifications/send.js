// Vercel function for sending notifications
const { createClient } = require('@supabase/supabase-js');
const webpush = require('web-push');

const supabase = createClient(
  'https://mkusymfkgvqnzdjjznrq.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdXN5bWZrZ3Zxbnpkamp6bnJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2NjAxNiwiZXhwIjoyMDY4NzQyMDE2fQ.x6B3msrdM8OmzBE_20AXHdxIspeZI8FUset7dgCq5dE',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Configure web-push
webpush.setVapidDetails(
  'mailto:your-email@oodball.com',
  process.env.VAPID_PUBLIC_KEY || 'BKEj54IqzhMP-3CazFJgkpc3ESbUP-zG7KXSyZvlapJGvn1_YYlX0XR5uSjjv3EGCiLBMOtRWK_zn9RTGA5pd04',
  process.env.VAPID_PRIVATE_KEY || 'GhaWL5GVlGXOLBaaApPK07FftlxWxfnAnBdihgtbqv0'
);

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, body, url, adminKey } = req.body;
    
    // Simple admin authentication
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
}
