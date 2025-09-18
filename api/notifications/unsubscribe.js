// Vercel function for unsubscribing from notifications
const { createClient } = require('@supabase/supabase-js');

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

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    // Remove subscription from Supabase
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing subscription:', error);
      return res.status(500).json({ error: 'Failed to remove subscription' });
    }

    console.log('Subscription removed for user:', userId);
    res.json({ success: true, message: 'Subscription removed successfully' });
  } catch (error) {
    console.error('Error in unsubscribe endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
