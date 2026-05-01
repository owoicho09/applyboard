const redis                      = require('../config/redis');
const { REDIS_KEYS, TTL, RATE }  = require('../config/constants');

/**
 * Returns true if this phone number has exceeded the rate limit.
 * Uses Redis INCR + EXPIRE for atomic counting.
 */
const isRateLimited = async (phone) => {
  try {
    const key   = REDIS_KEYS.rateLimit(phone);
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, TTL.RATE_LIMIT);
    }
    return count > RATE.MAX_MESSAGES_PER_MINUTE;
  } catch (err) {
    console.error('[RATE LIMITER] Error:', err.message);
    return false; // On Redis error, allow message through
  }
};

module.exports = { isRateLimited };