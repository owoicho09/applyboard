/**
 * E2E: Loan / Scholarship flow
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
jest.mock('../../src/services/paystack',            () => ({ initializePayment: jest.fn().mockResolvedValue({ url: 'https://paystack.com/pay/loan-test', reference: 'REF-LOAN-001' }) }));
jest.mock('../../src/services/ai',                  () => ({ askAI: jest.fn() }));
jest.mock('../../src/flows/escalation',             () => ({ escalate: jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/flows/mainMenu',               () => ({ sendMainMenu: jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/flows/greeting',               () => ({ sendGreeting: jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/flows/payment',                () => ({ handlePayment: jest.fn().mockResolvedValue({}) }));

const redis      = require('../../src/config/redis');
const { askAI }  = require('../../src/services/ai');
const { STAGES } = require('../../src/config/constants');
const { handleText } = require('../../src/handlers/textHandler');

const FROM = '2340003334445';

const setRedisState = (stage, data = {}) =>
  redis.get.mockResolvedValue(JSON.stringify({ stage, data, ts: new Date().toISOString() }));

beforeEach(() => jest.clearAllMocks());

describe('Loan flow — signal detection', () => {
  test('"I need a student loan for my masters" → saved as loan, NOT study_abroad', async () => {
    const { updateLead } = require('../../src/services/leadService');
    setRedisState(STAGES.FREE_TEXT_AI, {});
    askAI.mockResolvedValue('Loans are available for Masters. Which country?');

    await handleText(FROM, 'I need a student loan for my masters', { stage: STAGES.FREE_TEXT_AI, data: {} }, {});

    expect(updateLead).toHaveBeenCalledWith(
      FROM,
      expect.objectContaining({ service_interested: 'loan' })
    );

    const calls = updateLead.mock.calls;
    for (const [, updates] of calls) {
      if (updates.service_interested) {
        expect(updates.service_interested).not.toBe('study_abroad');
      }
    }
  });

  test('"scholarship" mention → service_interested saved as loan', async () => {
    const { updateLead } = require('../../src/services/leadService');
    setRedisState(STAGES.FREE_TEXT_AI, {});
    askAI.mockResolvedValue('Scholarships cover 10–50% at partner schools. What program level?');

    await handleText(FROM, 'I am looking for a scholarship to study abroad', { stage: STAGES.FREE_TEXT_AI, data: {} }, {});

    expect(updateLead).toHaveBeenCalledWith(
      FROM,
      expect.objectContaining({ service_interested: 'loan' })
    );
  });

  test('"I don\'t need a loan" — negation prevents loan being saved', async () => {
    const { updateLead } = require('../../src/services/leadService');
    setRedisState(STAGES.FREE_TEXT_AI, {});
    askAI.mockResolvedValue('Understood. What are you looking for?');

    await handleText(FROM, "I don't need a loan, I can self-fund", { stage: STAGES.FREE_TEXT_AI, data: {} }, {});

    const calls = updateLead.mock.calls;
    for (const [, updates] of calls) {
      if (updates.service_interested) {
        expect(updates.service_interested).not.toBe('loan');
      }
    }
  });

  test('"no scholarship needed" — negation prevents loan being saved', async () => {
    const { updateLead } = require('../../src/services/leadService');
    setRedisState(STAGES.FREE_TEXT_AI, {});
    askAI.mockResolvedValue('Great, self-funding gives you more flexibility.');

    await handleText(FROM, 'no scholarship needed, I can self-fund', { stage: STAGES.FREE_TEXT_AI, data: {} }, {});

    const calls = updateLead.mock.calls;
    for (const [, updates] of calls) {
      if (updates.service_interested) {
        expect(updates.service_interested).not.toBe('loan');
      }
    }
  });
});

describe('Loan flow — payment', () => {
  test('qualified loan lead confirms → handlePayment triggered', async () => {
    const { handlePayment } = require('../../src/flows/payment');
    const state = {
      stage: STAGES.FREE_TEXT_AI,
      data: { service_interested: 'loan', destination: 'Germany', name: 'Rotimi', loan_interest: true },
    };
    setRedisState(STAGES.FREE_TEXT_AI, state.data);
    askAI.mockResolvedValue('Registering you now. [[SEND_PAYMENT_LINK]]');

    await handleText(FROM, 'yes register me', state, {});

    expect(handlePayment).toHaveBeenCalledTimes(1);
  });

  test('loan lead who already paid cannot be charged again', async () => {
    const { handlePayment } = require('../../src/flows/payment');
    const state = {
      stage: STAGES.FREE_TEXT_AI,
      data: { service_interested: 'loan', destination: 'Canada', name: 'Ike', payment_status: 'paid' },
    };
    setRedisState(STAGES.FREE_TEXT_AI, state.data);
    askAI.mockResolvedValue('Let me get you sorted. [[SEND_PAYMENT_LINK]]');

    await handleText(FROM, 'what happens next?', state, {});

    expect(handlePayment).not.toHaveBeenCalled();
  });
});
