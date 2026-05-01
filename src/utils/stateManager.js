const redis           = require('../config/redis');
const { STAGES, REDIS_KEYS, TTL } = require('../config/constants');

/**
 * Get conversation state for a phone number.
 * Returns default GREETING state if none exists or Redis is down.
 */
const getState = async (phone) => {
  try {
    const raw = await redis.get(REDIS_KEYS.state(phone));
    if (!raw) return { stage: STAGES.GREETING, data: {} };
    return JSON.parse(raw);
  } catch (err) {
    console.error('[STATE] getState error:', err.message);
    return { stage: STAGES.GREETING, data: {} }; // Safe default
  }
};

/**
 * Set conversation state. Merges new data with existing data.
 * Never overwrites fields not included in the update.
 */
const setState = async (phone, stage, newData = {}) => {
  try {
    const current  = await getState(phone);
    const updated  = {
      stage,
      data: { ...current.data, ...newData },
      ts:   new Date().toISOString(),
    };
    await redis.setex(
      REDIS_KEYS.state(phone),
      TTL.STATE,
      JSON.stringify(updated)
    );
    return updated;
  } catch (err) {
    console.error('[STATE] setState error:', err.message);
    return { stage, data: newData };
  }
};

/**
 * Update data fields only — stage remains unchanged.
 */
const updateData = async (phone, newData = {}) => {
  try {
    const current = await getState(phone);
    return setState(phone, current.stage, newData);
  } catch (err) {
    console.error('[STATE] updateData error:', err.message);
  }
};

/**
 * Reset state completely — used after payment confirmed or on demand.
 */
const clearState = async (phone) => {
  try {
    await redis.del(REDIS_KEYS.state(phone));
  } catch (err) {
    console.error('[STATE] clearState error:', err.message);
  }
};

/**
 * Check if an incoming message ID has been seen before (deduplication).
 * Meta occasionally delivers the same webhook twice.
 */
const isMessageSeen = async (messageId) => {
  try {
    const key    = REDIS_KEYS.msgSeen(messageId);
    const result = await redis.set(key, '1', 'EX', TTL.MSG_DEDUP, 'NX');
    return result === null; // null = key already existed = duplicate
  } catch (err) {
    console.error('[STATE] isMessageSeen error:', err.message);
    return false; // On Redis error, allow message through
  }
};

module.exports = { getState, setState, updateData, clearState, isMessageSeen };