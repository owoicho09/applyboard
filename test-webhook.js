// Quick end-to-end webhook driver for local testing
// Usage: node test-webhook.js "<message text>" [phone]
require('dotenv').config();
const http = require('http');

const phone   = process.argv[3] || '2348099999999';
const msgText = process.argv[2] || 'Hello';
const msgId   = 'wamid.test.' + Date.now();

const payload = JSON.stringify({
  object: 'whatsapp_business_account',
  entry: [{
    changes: [{
      value: {
        messages: [{
          id:        msgId,
          from:      phone,
          type:      'text',
          text:      { body: msgText },
          timestamp: String(Math.floor(Date.now() / 1000)),
        }],
        contacts: [{
          profile: { name: 'Test User' },
          wa_id:   phone,
        }],
      },
    }],
  }],
});

const req = http.request({
  hostname: 'localhost',
  port:     3000,
  path:     '/webhook',
  method:   'POST',
  headers: {
    'Content-Type':   'application/json',
    'Content-Length': Buffer.byteLength(payload),
  },
}, res => {
  console.log('[WEBHOOK] HTTP', res.statusCode);
});

req.on('error', e => console.error('[WEBHOOK] Error:', e.message));
req.write(payload);
req.end();
