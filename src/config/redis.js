require('dotenv').config();
const Redis = require('ioredis');

if (!process.env.REDIS_URL) throw new Error('[REDIS] REDIS_URL is not set in .env');

const redis = new Redis(process.env.REDIS_URL, {
  tls: { rejectUnauthorized: false }, // Required for Upstash TLS
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 5) {
      console.error('[REDIS] Max retries reached. Giving up.');
      return null; // Stop retrying
    }
    const delay = Math.min(times * 300, 3000);
    console.warn(`[REDIS] Retry attempt ${times} — reconnecting in ${delay}ms`);
    return delay;
  },
  enableReadyCheck: true,
  lazyConnect: false,
});

redis.on('connect',  () => console.log('[REDIS] Connected successfully'));
redis.on('ready',    () => console.log('[REDIS] Ready to accept commands'));
redis.on('error',    (err) => console.error('[REDIS] Error:', err.message));
redis.on('close',    () => console.warn('[REDIS] Connection closed'));
redis.on('reconnecting', () => console.warn('[REDIS] Reconnecting...'));

module.exports = redis;