/**
 * E2E: Test Prep flow (IELTS, TOEFL, GRE, etc.)
 * Test prep does NOT use the ₦10,000 registration fee.
 * Clients pay the class fee directly.
 */

jest.mock('../../src/config/redis', () => ({
  get:    jest.fn(),
  set:    jest.fn().mockResolvedValue('OK'),
  setex:  jest.fn().mockResolvedValue('OK'),
  del:    jest.fn().mockResolvedValue(1),
}));

jest.mock('../../src/config/database', () => ({
  from:   jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq:     jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: null, error: null }),
  insert: jest.fn().mockResolvedValue({ error: null }),
  update: jest.fn().mockReturnThis(),
}));

jest.mock('../../src/services/messenger',           () => ({ sendText: jest.fn().mockResolvedValue({}), sendButtons: jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/services/whatsapp',            () => ({ sendText: jest.fn().mockResolvedValue({}), markRead: jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/services/notifyOwner',         () => ({ notifyOwner: jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/services/notificationService', () => ({ notifyStaff: jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/services/leadService',         () => ({ upsertLead: jest.fn().mockResolvedValue({}), updateLead: jest.fn().mockResolvedValue({}), getLead: jest.fn().mockResolvedValue(null), logMessage: jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/services/paystack',            () => ({ initializePayment: jest.fn().mockResolvedValue({ url: 'https://paystack.com/pay/tp-test', reference: 'REF-TP-001' }) }));
jest.mock('../../src/services/ai',                  () => ({ askAI: jest.fn() }));
jest.mock('../../src/flows/escalation',             () => ({ escalate: jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/flows/mainMenu',               () => ({ sendMainMenu: jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/flows/greeting',               () => ({ sendGreeting: jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/flows/payment',                () => ({ handlePayment: jest.fn().mockResolvedValue({}) }));

const redis      = require('../../src/config/redis');
const { askAI }  = require('../../src/services/ai');
const { STAGES } = require('../../src/config/constants');
const { handleText } = require('../../src/handlers/textHandler');

const FROM = '2340004445556';

const setRedisState = (stage, data = {}) =>
  redis.get.mockResolvedValue(JSON.stringify({ stage, data, ts: new Date().toISOString() }));

beforeEach(() => jest.clearAllMocks());

describe('Test prep — signal detection', () => {
  test('"IELTS prep classes" → service_interested saved as test_prep', async () => {
    const { updateLead } = require('../../src/services/leadService');
    setRedisState(STAGES.FREE_TEXT_AI, {});
    askAI.mockResolvedValue('IELTS classes run 6 weeks. Next batch starts June 1st.');

    await handleText(FROM, 'I want to take IELTS prep classes', { stage: STAGES.FREE_TEXT_AI, data: {} }, {});

    expect(updateLead).toHaveBeenCalledWith(
      FROM,
      expect.objectContaining({ service_interested: 'test_prep' })
    );
  });

  test('"IELTS" mention saves exam type', async () => {
    const { updateLead } = require('../../src/services/leadService');
    setRedisState(STAGES.FREE_TEXT_AI, {});
    askAI.mockResolvedValue('IELTS Academic or General — which are you preparing for?');

    await handleText(FROM, 'I want to prepare for IELTS', { stage: STAGES.FREE_TEXT_AI, data: {} }, {});

    expect(updateLead).toHaveBeenCalledWith(
      FROM,
      expect.objectContaining({ exam: 'IELTS' })
    );
  });
});

describe('Test prep — payment guardrails', () => {
  test('test_prep with no exam — AI tag blocked by guardrail', async () => {
    const { handlePayment } = require('../../src/flows/payment');
    const state = {
      stage: STAGES.FREE_TEXT_AI,
      data: { service_interested: 'test_prep', destination: 'UK' },
    };
    setRedisState(STAGES.FREE_TEXT_AI, state.data);
    askAI.mockResolvedValue('Let me register you. [[SEND_PAYMENT_LINK]]');

    await handleText(FROM, 'I want to register for the class', state, {});

    expect(handlePayment).not.toHaveBeenCalled();
  });

  test('test_prep with confirmed exam → payment allowed', async () => {
    const { handlePayment } = require('../../src/flows/payment');
    const state = {
      stage: STAGES.FREE_TEXT_AI,
      data: { service_interested: 'test_prep', exam: 'IELTS', destination: 'UK' },
    };
    setRedisState(STAGES.FREE_TEXT_AI, state.data);
    askAI.mockResolvedValue('[[SEND_PAYMENT_LINK]]');

    await handleText(FROM, 'yes pay for the class', state, {});

    expect(handlePayment).toHaveBeenCalledTimes(1);
    const passedState = handlePayment.mock.calls[0][2];
    expect(passedState?.data?.exam).toBe('IELTS');
  });

  test('test_prep user asking about class schedule — no payment link fired', async () => {
    const { handlePayment } = require('../../src/flows/payment');
    const state = {
      stage: STAGES.FREE_TEXT_AI,
      data: { service_interested: 'test_prep', exam: 'IELTS' },
    };
    setRedisState(STAGES.FREE_TEXT_AI, state.data);
    askAI.mockResolvedValue('IELTS classes start June 1st. Card holders attend free. Want to secure your spot?');

    await handleText(FROM, 'when does IELTS class start?', state, {});

    expect(handlePayment).not.toHaveBeenCalled();
  });

  test('bank account request during test prep inquiry → Paystack response, AI not called', async () => {
    setRedisState(STAGES.FREE_TEXT_AI, { service_interested: 'test_prep', exam: 'GRE' });

    await handleText(FROM, 'give me your bank account details', { stage: STAGES.FREE_TEXT_AI, data: { service_interested: 'test_prep' } }, {});

    expect(askAI).not.toHaveBeenCalled();
  });

  test('payment_url dedup — existing URL resent instead of generating a new link', async () => {
    const { handlePayment }   = require('../../src/flows/payment');
    const { sendText }        = require('../../src/services/messenger');
    const EXISTING_URL = 'https://paystack.com/pay/existing-tp';
    const state = {
      stage: STAGES.FREE_TEXT_AI,
      data: { service_interested: 'test_prep', exam: 'TOEFL', payment_url: EXISTING_URL },
    };
    setRedisState(STAGES.FREE_TEXT_AI, state.data);
    askAI.mockResolvedValue('Here you go. [[SEND_PAYMENT_LINK]]');

    await handleText(FROM, 'yes', state, {});

    expect(handlePayment).not.toHaveBeenCalled();
    expect(sendText).toHaveBeenCalledWith(
      FROM,
      expect.stringContaining(EXISTING_URL)
    );
  });
});
