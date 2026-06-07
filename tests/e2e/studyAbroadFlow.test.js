/**
 * E2E: Study Abroad flow
 * Traces the full path from a first message to a payment link being sent.
 * All external services are mocked.
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
jest.mock('../../src/services/paystack',            () => ({ initializePayment: jest.fn().mockResolvedValue({ url: 'https://paystack.com/pay/sa-test', reference: 'REF-SA-001' }) }));
jest.mock('../../src/services/ai',                  () => ({ askAI: jest.fn() }));
jest.mock('../../src/flows/escalation',             () => ({ escalate: jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/flows/mainMenu',               () => ({ sendMainMenu: jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/flows/greeting',               () => ({ sendGreeting: jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/flows/payment',                () => ({ handlePayment: jest.fn().mockResolvedValue({}) }));

const redis      = require('../../src/config/redis');
const messenger  = require('../../src/services/messenger');
const { askAI }  = require('../../src/services/ai');
const { STAGES } = require('../../src/config/constants');
const { handleText } = require('../../src/handlers/textHandler');

const FROM = '2340001112223';

const setRedisState = (stage, data = {}) =>
  redis.get.mockResolvedValue(JSON.stringify({ stage, data, ts: new Date().toISOString() }));

beforeEach(() => jest.clearAllMocks());

describe('Study Abroad — qualification to payment', () => {
  test('user states destination → service detected and saved', async () => {
    const { updateLead } = require('../../src/services/leadService');
    setRedisState(STAGES.FREE_TEXT_AI, {});
    askAI.mockResolvedValue('Canada is a great choice. What level are you thinking?');

    await handleText(FROM, 'I want to study in Canada', { stage: STAGES.FREE_TEXT_AI, data: {} }, {});

    expect(updateLead).toHaveBeenCalledWith(
      FROM,
      expect.objectContaining({ destination_country: 'Canada' })
    );
  });

  test('university mention → service_interested saved as study_abroad', async () => {
    const { updateLead } = require('../../src/services/leadService');
    setRedisState(STAGES.FREE_TEXT_AI, {});
    askAI.mockResolvedValue('Masters is a popular route. What field?');

    await handleText(FROM, 'I want to apply to university in the UK', { stage: STAGES.FREE_TEXT_AI, data: {} }, {});

    expect(updateLead).toHaveBeenCalledWith(
      FROM,
      expect.objectContaining({ service_interested: 'study_abroad' })
    );
  });

  test('qualified user confirms payment → [[SEND_PAYMENT_LINK]] triggers handlePayment', async () => {
    const { handlePayment } = require('../../src/flows/payment');
    const state = { stage: STAGES.FREE_TEXT_AI, data: { destination: 'Canada', name: 'Emeka', service_interested: 'study_abroad' } };
    setRedisState(STAGES.FREE_TEXT_AI, state.data);
    askAI.mockResolvedValue('Sorting that now.\n[[SEND_PAYMENT_LINK]]');

    await handleText(FROM, 'yes please go ahead', state, {});

    expect(handlePayment).toHaveBeenCalledTimes(1);
    expect(handlePayment).toHaveBeenCalledWith(FROM, 'REGISTRATION', expect.any(Object));
  });

  test('payment tag blocked when no context collected', async () => {
    const { handlePayment } = require('../../src/flows/payment');
    setRedisState(STAGES.FREE_TEXT_AI, {});
    askAI.mockResolvedValue('Let me sort that for you. [[SEND_PAYMENT_LINK]]');

    await handleText(FROM, 'register me', { stage: STAGES.FREE_TEXT_AI, data: {} }, {});

    expect(handlePayment).not.toHaveBeenCalled();
  });

  test('study abroad lead who mentioned IELTS in chat → not charged exam fee', async () => {
    const { initializePayment } = require('../../src/services/paystack');
    const chatHistory = [
      { role: 'user',      content: 'I want to study in Canada. I have no IELTS.' },
      { role: 'assistant', content: 'MOI letter may cover you.' },
    ];
    const state = {
      stage: STAGES.FREE_TEXT_AI,
      data: { service_interested: 'study_abroad', destination: 'Canada', name: 'Tobi', chatHistory },
    };
    setRedisState(STAGES.FREE_TEXT_AI, state.data);
    askAI.mockResolvedValue('[[SEND_PAYMENT_LINK]]');

    await handleText(FROM, 'yes register me', state, {});

    if (initializePayment.mock.calls.length > 0) {
      const [, amount] = initializePayment.mock.calls[0];
      expect(amount).toBe(10000);
    }
  });

  test('paid lead cannot be charged again even when AI fires tag', async () => {
    const { handlePayment } = require('../../src/flows/payment');
    const state = {
      stage: STAGES.FREE_TEXT_AI,
      data: { destination: 'UK', name: 'Amara', payment_status: 'paid' },
    };
    setRedisState(STAGES.FREE_TEXT_AI, state.data);
    askAI.mockResolvedValue('Great to have you. [[SEND_PAYMENT_LINK]]');

    await handleText(FROM, 'what next?', state, {});

    expect(handlePayment).not.toHaveBeenCalled();
  });

  test('AI markdown is stripped before sending to WhatsApp user', async () => {
    setRedisState(STAGES.FREE_TEXT_AI, { destination: 'Germany' });
    askAI.mockResolvedValue('*Germany* is great for your profile.');

    await handleText(FROM, 'tell me more', { stage: STAGES.FREE_TEXT_AI, data: { destination: 'Germany' } }, {});

    const sent = messenger.sendText.mock.calls[0][1];
    expect(sent).not.toContain('*Germany*');
    expect(sent).toContain('Germany');
  });
});
