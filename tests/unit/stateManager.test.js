jest.mock('../../src/config/redis', () => ({
  get:    jest.fn(),
  set:    jest.fn(),
  setex:  jest.fn().mockResolvedValue('OK'),
  del:    jest.fn().mockResolvedValue(1),
}));

const redis = require('../../src/config/redis');
const { getState, setState, updateData, clearState, isMessageSeen, tryLock, releaseLock } =
  require('../../src/utils/stateManager');
const { STAGES, REDIS_KEYS } = require('../../src/config/constants');

const PHONE = '2348012345678';

beforeEach(() => jest.clearAllMocks());

describe('getState', () => {
  test('returns persisted state when Redis has data', async () => {
    const stored = { stage: STAGES.FREE_TEXT_AI, data: { name: 'Emeka' } };
    redis.get.mockResolvedValue(JSON.stringify(stored));

    const result = await getState(PHONE);
    expect(result.stage).toBe(STAGES.FREE_TEXT_AI);
    expect(result.data.name).toBe('Emeka');
  });

  test('returns default GREETING state when Redis returns null', async () => {
    redis.get.mockResolvedValue(null);
    const result = await getState(PHONE);
    expect(result.stage).toBe(STAGES.GREETING);
    expect(result.data).toEqual({});
  });

  test('returns default GREETING state on Redis error', async () => {
    redis.get.mockRejectedValue(new Error('Redis down'));
    const result = await getState(PHONE);
    expect(result.stage).toBe(STAGES.GREETING);
  });

  test('uses the correct Redis key', async () => {
    redis.get.mockResolvedValue(null);
    await getState(PHONE);
    expect(redis.get).toHaveBeenCalledWith(REDIS_KEYS.state(PHONE));
  });
});

describe('setState', () => {
  test('merges new data with existing data', async () => {
    const existing = JSON.stringify({ stage: STAGES.FREE_TEXT_AI, data: { name: 'Tobi' } });
    redis.get.mockResolvedValue(existing);

    await setState(PHONE, STAGES.FREE_TEXT_AI, { destination: 'Canada' });

    const [, , written] = redis.setex.mock.calls[0];
    const saved = JSON.parse(written);
    expect(saved.data.name).toBe('Tobi');
    expect(saved.data.destination).toBe('Canada');
  });

  test('sets the stage correctly', async () => {
    redis.get.mockResolvedValue(null);
    await setState(PHONE, STAGES.PAYMENT_AWAITING, {});

    const [, , written] = redis.setex.mock.calls[0];
    expect(JSON.parse(written).stage).toBe(STAGES.PAYMENT_AWAITING);
  });

  test('includes a ts timestamp in written state', async () => {
    redis.get.mockResolvedValue(null);
    await setState(PHONE, STAGES.FREE_TEXT_AI, {});

    const [, , written] = redis.setex.mock.calls[0];
    expect(JSON.parse(written).ts).toBeDefined();
  });
});

describe('updateData', () => {
  test('preserves current stage when updating data', async () => {
    const existing = JSON.stringify({ stage: STAGES.PAYMENT_AWAITING, data: { ref: 'ABC' } });
    redis.get.mockResolvedValue(existing);

    await updateData(PHONE, { payment_url: 'https://paystack.com/pay/x' });

    const [, , written] = redis.setex.mock.calls[0];
    const saved = JSON.parse(written);
    expect(saved.stage).toBe(STAGES.PAYMENT_AWAITING);
    expect(saved.data.ref).toBe('ABC');
    expect(saved.data.payment_url).toBe('https://paystack.com/pay/x');
  });
});

describe('clearState', () => {
  test('deletes the Redis key for the phone number', async () => {
    await clearState(PHONE);
    expect(redis.del).toHaveBeenCalledWith(REDIS_KEYS.state(PHONE));
  });

  test('does not throw on Redis error', async () => {
    redis.del.mockRejectedValue(new Error('Redis down'));
    await expect(clearState(PHONE)).resolves.not.toThrow();
  });
});

describe('isMessageSeen', () => {
  test('returns false for a new message (NX set succeeds → "OK")', async () => {
    redis.set.mockResolvedValue('OK');
    const result = await isMessageSeen('msg-001');
    expect(result).toBe(false);
  });

  test('returns true for a duplicate message (NX set returns null)', async () => {
    redis.set.mockResolvedValue(null);
    const result = await isMessageSeen('msg-001');
    expect(result).toBe(true);
  });

  test('returns false (allow through) on Redis error', async () => {
    redis.set.mockRejectedValue(new Error('Redis down'));
    const result = await isMessageSeen('msg-001');
    expect(result).toBe(false);
  });
});

describe('tryLock / releaseLock', () => {
  test('tryLock returns true when lock acquired', async () => {
    redis.set.mockResolvedValue('OK');
    expect(await tryLock(PHONE)).toBe(true);
  });

  test('tryLock returns false when lock already held', async () => {
    redis.set.mockResolvedValue(null);
    expect(await tryLock(PHONE)).toBe(false);
  });

  test('tryLock returns true (fail-open) on Redis error', async () => {
    redis.set.mockRejectedValue(new Error('Redis down'));
    expect(await tryLock(PHONE)).toBe(true);
  });

  test('releaseLock deletes the lock key', async () => {
    await releaseLock(PHONE);
    expect(redis.del).toHaveBeenCalledWith(`lock:${PHONE}`);
  });
});
