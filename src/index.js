require('dotenv').config();

// ── Validate required env vars before anything loads ──────
const REQUIRED_ENV = [
  'WHATSAPP_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID',
  'TWILIO_WHATSAPP_NUMBER',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'REDIS_URL',
  'ANTHROPIC_API_KEY',
  'PAYSTACK_SECRET_KEY',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
];

const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('[STARTUP] Missing required environment variables:');
  missing.forEach((k) => console.error(`  ✗ ${k}`));
  process.exit(1);
}

const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const logger       = require('./config/logger');
const cookieParser = require('cookie-parser');

// ── Trigger DB + Redis connection on load ─────────────────
require('./config/database');
require('./config/redis');

const app = express();

// ── Admin CSP override — must come BEFORE helmet ──────────
app.use('/admin', (req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
  );
  next();
});

// ── Security middleware ───────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(logger);
app.use(cookieParser());

// ── Body parsing ──────────────────────────────────────────
app.use('/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Health check ──────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:  'ok',
    service: 'ApplyBoard Africa Bot',
    ts:      new Date().toISOString(),
    env:     process.env.NODE_ENV || 'development',
    gateway: 'Twilio WhatsApp',
  });
});

// ── Webhook routes ────────────────────────────────────────
const { verifyWebhook }  = require('./middleware/webhookVerify');
const { handleIncoming } = require('./handlers/messageHandler');

app.get('/webhook', verifyWebhook);

app.post('/webhook', async (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.status(200).send('<Response></Response>');

  try {
    if (!req.body?.From) return;
    await handleIncoming(req.body);
  } catch (err) {
    console.error('[WEBHOOK] Processing error:', err.message);
    console.error('[WEBHOOK] Stack:', err.stack);
  }
});

// ── Payment webhook (Paystack) ────────────────────────────
app.post('/payment/webhook', async (req, res) => {
  try {
    const { handlePaystackWebhook } = require('./services/paystack');
    await handlePaystackWebhook(req, res);
  } catch (err) {
    console.error('[PAYMENT WEBHOOK] Error:', err.message);
    if (!res.headersSent) res.sendStatus(500);
  }
});

// ── Admin dashboard ───────────────────────────────────────
const dashboardRoutes = require('./admin/dashboardRoutes');
app.use('/admin', dashboardRoutes);

// ── 404 handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Global error handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack);
  if (!res.headersSent) {
    res.status(500).json({
      error:   'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

// ── Start server ──────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║     ApplyBoard Africa Bot — ONLINE       ║');
  console.log(`║     Port: ${PORT}   ENV: ${(process.env.NODE_ENV || 'development').padEnd(14)}║`);
  console.log('║     Gateway: Twilio WhatsApp Sandbox     ║');
  console.log('║     /health  /webhook  /admin            ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
});

module.exports = app;