jest.mock('../../src/config/redis', () => ({
  get:    jest.fn(),
  set:    jest.fn().mockResolvedValue('OK'),
  setex:  jest.fn().mockResolvedValue('OK'),
  del:    jest.fn().mockResolvedValue(1),
}));

jest.mock('../../src/config/database', () => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: null, error: null }),
  insert: jest.fn().mockResolvedValue({ error: null }),
  update: jest.fn().mockReturnThis(),
}));

jest.mock('../../src/services/messenger', () => ({
  sendText:    jest.fn().mockResolvedValue({}),
  sendButtons: jest.fn().mockResolvedValue({}),
}));

jest.mock('../../src/services/notifyOwner', () => ({
  notifyOwner: jest.fn().mockResolvedValue({}),
}));

jest.mock('../../src/services/notificationService', () => ({
  notifyStaff: jest.fn().mockResolvedValue({}),
}));

jest.mock('../../src/services/leadService', () => ({
  upsertLead: jest.fn().mockResolvedValue({}),
  updateLead: jest.fn().mockResolvedValue({}),
  getLead:    jest.fn().mockResolvedValue(null),
  logMessage: jest.fn().mockResolvedValue({}),
}));

jest.mock('../../src/services/paystack', () => ({
  initializePayment: jest.fn().mockResolvedValue({
    url:       'https://paystack.com/pay/test-abc',
    reference: 'REF-INTEGRATION-001',
  }),
}));

const redis      = require('../../src/config/redis');
const messenger  = require('../../src/services/messenger');
const { initializePayment } = require('../../src/services/paystack');
const { updateLead }        = require('../../src/services/leadService');
const { STAGES, REGISTRATION_FEE } = require('../../src/config/constants');
const { handlePayment, onPaymentConfirmed } = require('../../src/flows/payment');

const makeState = (data = {}) => ({ stage: STAGES.FREE_TEXT_AI, data });

beforeEach(() => jest.clearAllMocks());

describe('handlePayment — REGISTRATION action', () => {
  const FROM = '2341000000001';

  test('calls initializePayment and sends link to user', async () => {
    const state = makeState({ name: 'Tobi', destination: 'Canada' });
    await handlePayment(FROM, 'REGISTRATION', state);

    expect(initializePayment).toHaveBeenCalledTimes(1);
    expect(messenger.sendText).toHaveBeenCalledWith(
      FROM,
      expect.stringContaining('https://paystack.com/pay/test-abc')
    );
  });

  test('charges the registration fee amount', async () => {
    const state = makeState({ name: 'Emeka' });
    await handlePayment(FROM, 'REGISTRATION', state);

    const [, amount] = initializePayment.mock.calls[0];
    expect(amount).toBe(REGISTRATION_FEE);
  });

  test('saves payment_ref and payment_url to Redis state', async () => {
    redis.get.mockResolvedValue(null);
    const state = makeState({ name: 'Amara' });
    await handlePayment(FROM, 'REGISTRATION', state);

    expect(redis.setex).toHaveBeenCalled();
    const [, , written] = redis.setex.mock.calls[0];
    const saved = JSON.parse(written);
    expect(saved.data.payment_ref).toBe('REF-INTEGRATION-001');
    expect(saved.data.payment_url).toBe('https://paystack.com/pay/test-abc');
  });

  test('transitions state to PAYMENT_AWAITING', async () => {
    redis.get.mockResolvedValue(null);
    const state = makeState({ name: 'Bola' });
    await handlePayment(FROM, 'REGISTRATION', state);

    const [, , written] = redis.setex.mock.calls[0];
    expect(JSON.parse(written).stage).toBe(STAGES.PAYMENT_AWAITING);
  });

  test('updates lead payment_status to pending', async () => {
    const state = makeState({});
    await handlePayment(FROM, 'REGISTRATION', state);

    expect(updateLead).toHaveBeenCalledWith(
      FROM,
      expect.objectContaining({ payment_status: 'pending' })
    );
  });

  test('uses custom amount from state.data.payment_amount if action is PAY_NOW', async () => {
    const state = makeState({ payment_amount: 85000 });
    await handlePayment(FROM, 'PAY_NOW', state);

    const [, amount] = initializePayment.mock.calls[0];
    expect(amount).toBe(85000);
  });

  test('sends Paystack fallback message when initializePayment throws', async () => {
    initializePayment.mockRejectedValueOnce(new Error('Paystack error'));
    const state = makeState({});
    await handlePayment(FROM, 'REGISTRATION', state);

    expect(messenger.sendText).toHaveBeenCalledWith(
      FROM,
      expect.stringMatching(/issue generating the link|reach us directly/i)
    );
  });
});

describe('onPaymentConfirmed', () => {
  const FROM  = '2341000000002';
  const AMOUNT = 10000;
  const REF   = 'REF-CONFIRMED-001';

  test('sends confirmation message to user', async () => {
    await onPaymentConfirmed(FROM, AMOUNT, REF);

    expect(messenger.sendText).toHaveBeenCalledWith(
      FROM,
      expect.stringMatching(/payment confirmed|you are in/i)
    );
  });

  test('updates lead payment_status to paid', async () => {
    await onPaymentConfirmed(FROM, AMOUNT, REF);

    expect(updateLead).toHaveBeenCalledWith(
      FROM,
      expect.objectContaining({ payment_status: 'paid', payment_reference: REF })
    );
  });

  test('resets state to FREE_TEXT_AI after payment', async () => {
    redis.get.mockResolvedValue(null);
    await onPaymentConfirmed(FROM, AMOUNT, REF);

    const setexCalls = redis.setex.mock.calls;
    const lastCall   = setexCalls[setexCalls.length - 1];
    expect(JSON.parse(lastCall[2]).stage).toBe(STAGES.FREE_TEXT_AI);
  });

  test('notifies owner of confirmed payment', async () => {
    const { notifyOwner } = require('../../src/services/notifyOwner');
    await onPaymentConfirmed(FROM, AMOUNT, REF);

    expect(notifyOwner).toHaveBeenCalledWith(
      expect.stringMatching(/payment confirmed/i)
    );
  });
});
