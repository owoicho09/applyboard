require('dotenv').config();

const REQUIRED_ENV = [
  'WHATSAPP_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID',
  'WEBHOOK_VERIFY_TOKEN',
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

require('./config/database');
require('./config/redis');

const app = express();

// ── Admin CSP override ────────────────────────────────────
app.use('/admin', (req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
  );
  next();
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(logger);
app.use(cookieParser());

// ── Body parsing ──────────────────────────────────────────
app.use('/webhook',         express.raw({ type: 'application/json' }));
app.use('/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Health check ──────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:    'ok',
    service:   'ApplyBoard Africa Bot',
    ts:        new Date().toISOString(),
    env:       process.env.NODE_ENV || 'development',
    gateway:   'Meta WhatsApp Cloud API + Telegram',
    scheduler: process.env.TELEGRAM_GROUP_ID ? 'active' : 'disabled',
  });
});

// ── Scheduler test (remove after testing) ────────────────
app.get('/test/morning', async (req, res) => {
  const { sendMorningMessage } = require('./services/scheduler');
  await sendMorningMessage();
  res.json({ ok: true, message: 'Morning message triggered' });
});

app.get('/test/poll', async (req, res) => {
  const { sendWeeklyPoll } = require('./services/scheduler');
  await sendWeeklyPoll();
  res.json({ ok: true, message: 'Poll triggered' });
});

// ── WhatsApp webhook ──────────────────────────────────────
const { verifyWebhook }  = require('./middleware/webhookVerify');
const { handleIncoming } = require('./handlers/messageHandler');

app.get('/webhook', verifyWebhook);

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  try {
    const body = JSON.parse(req.body);
    if (body.object !== 'whatsapp_business_account') return;
    const entry = body?.entry?.[0]?.changes?.[0]?.value;
    if (!entry?.messages?.[0]) return;
    await handleIncoming(entry);
  } catch (err) {
    console.error('[WEBHOOK] Error:', err.message);
  }
});

// ── Telegram webhook ──────────────────────────────────────
const { handleTelegram } = require('./handlers/telegramHandler');

app.post('/telegram/webhook', async (req, res) => {
  res.sendStatus(200);
  try {
    if (!req.body) return;
    await handleTelegram(req.body);
  } catch (err) {
    console.error('[TELEGRAM WEBHOOK] Error:', err.message);
  }
});

// ── Paystack callback ─────────────────────────────────────
app.get('/payment/callback', (req, res) => {
  const { reference } = req.query;
  res.send(`
    <html>
      <head>
        <title>Payment Processing</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 60px 20px; background: #f0fdf4; }
          h2   { color: #166534; }
          p    { color: #475569; }
          .ref { background: #dcfce7; padding: 8px 16px; border-radius: 8px; display: inline-block; font-weight: bold; color: #166534; }
        </style>
      </head>
      <body>
        <h2>Payment Received</h2>
        <p>Your payment is being confirmed.</p>
        <p>You will receive a message on WhatsApp or Telegram shortly.</p>
        <p class="ref">${reference || ''}</p>
        <p style="margin-top:24px;font-size:13px;color:#94a3b8">You can close this page.</p>
      </body>
    </html>
  `);
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

// ── 404 ───────────────────────────────────────────────────
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
  console.log('║     Gateway: Meta WhatsApp + Telegram    ║');
  console.log('║     /health  /webhook  /admin            ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');

  // ── Register Telegram webhook ─────────────────────────
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.BASE_URL) {
    const { registerWebhook } = require('./services/telegram');
    registerWebhook(process.env.BASE_URL)
      .then(() => console.log('[TELEGRAM] Webhook registered successfully'))
      .catch((err) => console.error('[TELEGRAM] Webhook registration failed:', err.message));
  }

  // ── Start group scheduler ─────────────────────────────
  if (process.env.TELEGRAM_GROUP_ID) {
    const { startScheduler } = require('./services/scheduler');
    startScheduler();
  } else {
    console.warn('[SCHEDULER] TELEGRAM_GROUP_ID not set — group features disabled');
  }
});

module.exports = app;