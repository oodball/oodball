// Vercel function to get VAPID public key
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const publicKey = process.env.VAPID_PUBLIC_KEY || 'BKEj54IqzhMP-3CazFJgkpc3ESbUP-zG7KXSyZvlapJGvn1_YYlX0XR5uSjjv3EGCiLBMOtRWK_zn9RTGA5pd04';
  
  res.json({ publicKey });
}
