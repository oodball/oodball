#!/usr/bin/env node

/**
 * Script to send push notifications when new food entries are added
 * Usage: node send-notification.js "Entry Title" [entry-id]
 * 
 * Examples:
 * node send-notification.js "Kurry Curry" 15
 * node send-notification.js "New Restaurant Review"
 * 
 * You can also set environment variables:
 * NOTIFICATION_SERVICE_URL=http://localhost:3001
 * ADMIN_KEY=your-admin-key
 */

const https = require('https');
const http = require('http');
const url = require('url');

// Configuration
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'https://oodball.com';
const ADMIN_KEY = process.env.ADMIN_KEY || 'foodball-admin-2025';

// Parse command line arguments
const args = process.argv.slice(2);
const entryTitle = args[0];
const entryId = args[1];

if (!entryTitle) {
  console.error('❌ Error: Please provide an entry title');
  console.log('Usage: node send-notification.js "Entry Title" [entry-id]');
  console.log('Example: node send-notification.js "Kurry Curry" 15');
  process.exit(1);
}

// Build notification data
const notificationData = {
  title: `🍴 NEW FOOD ENTRY UNLOCKED! 🍴`,
  body: `${entryTitle} added to the menu!`,
  url: entryId 
    ? `https://oodball.com/foodball/${entryId}`
    : 'https://oodball.com/foodball',
  adminKey: ADMIN_KEY
};

// Parse the notification service URL
const serviceUrl = new URL(NOTIFICATION_SERVICE_URL);
const isHttps = serviceUrl.protocol === 'https:';
const httpModule = isHttps ? https : http;

// Prepare the request
const postData = JSON.stringify(notificationData);
const options = {
  hostname: serviceUrl.hostname,
  port: serviceUrl.port || (isHttps ? 443 : 80),
  path: '/api/notifications/send',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🚀 Sending notification...');
console.log(`📱 Title: ${notificationData.title}`);
console.log(`📝 Body: ${notificationData.body}`);
console.log(`🔗 URL: ${notificationData.url}`);
console.log(`🌐 Service: ${NOTIFICATION_SERVICE_URL}`);
console.log('');

// Send the request
const req = httpModule.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(responseData);
      
      if (res.statusCode === 200 && response.success) {
        console.log('✅ Notification sent successfully!');
        console.log(`📊 Sent to ${response.sent} subscribers`);
        if (response.failed > 0) {
          console.log(`⚠️  Failed to send to ${response.failed} subscribers`);
        }
        console.log('');
        console.log('🎉 Users will receive the notification on their devices!');
      } else {
        console.error('❌ Failed to send notification:');
        console.error(`Status: ${res.statusCode}`);
        console.error(`Response: ${responseData}`);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      console.error('Raw response:', responseData);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  
  if (error.code === 'ECONNREFUSED') {
    console.error('');
    console.error('💡 Make sure the notification service is running:');
    console.error('   cd /path/to/your/project');
    console.error('   node notification-service.js');
    console.error('');
    console.error('   Or if using npm:');
    console.error('   npm start');
  }
  
  process.exit(1);
});

// Send the request
req.write(postData);
req.end();

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Notification sending cancelled');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Notification sending terminated');
  process.exit(0);
});
