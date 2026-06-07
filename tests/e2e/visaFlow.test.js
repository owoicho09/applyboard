/**
 * E2E: Visa flow
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
jest.mock('../../src/services/paystack',            () => ({ initializePayment: jest.fn().mockResolvedValue({ url: 'https://paystack.com/pay/visa-test', reference: 'REF-VISA-001' }) }));
jest.mock('../../src/services/ai',                  () => ({ askAI: jest.fn() }));
jest.mock('../../src/flows/escalation',             () => ({ escalate: jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/flows/mainMenu',               () => ({ sendMainMenu: jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/flows/greeting',               () => ({ sendGreeting: jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/flows/payment',                () => ({ handlePayment: jest.fn().mockResolvedValue({}) }));

const redis      = require('../../src/config/redis');
const { askAI }  = require('../../src/services/ai');
const { STAGES } = require('../../src/config/constants');
const { handleText } = require('../../src/handlers/textHandler');

const FROM = '2340002223334';

const setRedisState = (stage, data = {}) =>
  redis.get.mockResolvedValue(JSON.stringify({ stage, data, ts: new Date().toISOString() }));

beforeEach(() => jest.clearAllMocks());

describe('Visa flow — signal detection', () => {
  test('"help me get a tourist visa" → service_interested saved as visa', async () => {
    const { updateLead } = require('../../src/services/leadService');
    setRedisState(STAGES.FREE_TEXT_AI, {});
    askAI.mockResolvedValue('Tourist visas are straightforward. Which country?');

    await handleText(FROM, 'help me get a tourist visa', { stage: STAGES.FREE_TEXT_AI, data: {} }, {});

    expect(updateLead).toHaveBeenCalledWith(
      FROM,
      expect.objectContaining({ service_interested: 'visa' })
    );
  });

  test('"embassy appointment" → service_interested saved as visa', async () => {
    const { updateLead } = require('../../src/services/leadService');
    setRedisState(STAGES.FREE_TEXT_AI, {});
    askAI.mockResolvedValue('We can help with embassy appointments. Which country are you applying to?');

    await handleText(FROM, 'I need help with my embassy appointment', { stage: STAGES.FREE_TEXT_AI, data: {} }, {});

    expect(updateLead).toHaveBeenCalledWith(
      FROM,
      expect.objectContaining({ service_interested: 'visa' })
    );
  });

  test('"I am not interested in a visa" — negation prevents visa being saved', async () => {
    const { updateLead } = require('../../src/services/leadService');
    setRedisState(STAGES.FREE_TEXT_AI, {});
    askAI.mockResolvedValue('Understood. What are you looking for instead?');

    await handleText(FROM, 'I am not interested in a visa', { stage: STAGES.FREE_TEXT_AI, data: {} }, {});

    const calls = updateLead.mock.calls;
    for (const [, updates] of calls) {
      if (updates.service_interested) {
        expect(updates.service_interested).not.toBe('visa');
      }
    }
  });
});

describe('Visa flow — payment', () => {
  test('qualified visa lead confirms payment → handlePayment triggered', async () => {
    const { handlePayment } = require('../../src/flows/payment');
    const state = {
      stage: STAGES.FREE_TEXT_AI,
      data: { service_interested: 'visa', destination: 'UK', name: 'Ngozi' },
    };
    setRedisState(STAGES.FREE_TEXT_AI, state.data);
    askAI.mockResolvedValue('Let me sort the registration. [[SEND_PAYMENT_LINK]]');

    await handleText(FROM, 'yes go ahead', state, {});

    expect(handlePayment).toHaveBeenCalledTimes(1);
  });

  test('bank account request during visa inquiry → hardcoded Paystack response, no AI', async () => {
    setRedisState(STAGES.FREE_TEXT_AI, { service_interested: 'visa' });

    await handleText(FROM, 'please give me your account number', { stage: STAGES.FREE_TEXT_AI, data: { service_interested: 'visa' } }, {});

    expect(askAI).not.toHaveBeenCalled();
  });
});

describe('Visa flow — escalation', () => {
  test('"speak to agent" escalates regardless of visa context', async () => {
    const { escalate } = require('../../src/flows/escalation');
    const state = {
      stage: STAGES.FREE_TEXT_AI,
      data: { service_interested: 'visa', destination: 'Canada' },
    };
    setRedisState(STAGES.FREE_TEXT_AI, state.data);

    await handleText(FROM, 'speak to agent', state, {});

    expect(askAI).not.toHaveBeenCalled();
    expect(escalate).toHaveBeenCalledWith(FROM, expect.any(Object));
  });
});
