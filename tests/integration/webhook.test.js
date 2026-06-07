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

jest.mock('../../src/services/messenger', () => ({
  sendText:    jest.fn().mockResolvedValue({}),
  sendButtons: jest.fn().mockResolvedValue({}),
}));

jest.mock('../../src/services/whatsapp', () => ({
  sendText: jest.fn().mockResolvedValue({}),
  markRead: jest.fn().mockResolvedValue({}),
}));

jest.mock('../../src/services/ai', () => ({
  askAI: jest.fn().mockResolvedValue('How can I help you?'),
}));

jest.mock('../../src/services/leadService', () => ({
  upsertLead: jest.fn().mockResolvedValue({}),
  updateLead: jest.fn().mockResolvedValue({}),
  getLead:    jest.fn().mockResolvedValue(null),
  logMessage: jest.fn().mockResolvedValue({}),
}));

jest.mock('../../src/services/notifyOwner',  () => ({ notifyOwner:  jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/services/notificationService', () => ({ notifyStaff: jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/services/paystack',     () => ({ initializePayment: jest.fn().mockResolvedValue({ url: 'https://paystack.com/pay/test', reference: 'REF-WHK-001' }) }));
jest.mock('../../src/flows/payment',         () => ({ handlePayment: jest.fn().mockResolvedValue({}), onPaymentConfirmed: jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/flows/escalation',      () => ({ escalate: jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/flows/mainMenu',        () => ({ sendMainMenu: jest.fn().mockResolvedValue({}) }));
jest.mock('../../src/flows/greeting',        () => ({ sendGreeting: jest.fn().mockResolvedValue({}) }));

const redis      = require('../../src/config/redis');
const messenger  = require('../../src/services/messenger');
const { askAI }  = require('../../src/services/ai');
const { STAGES } = require('../../src/config/constants');
const { handleText } = require('../../src/handlers/textHandler');

const FROM = '2340099988877';

const mockState = (stage = STAGES.FREE_TEXT_AI, data = {}) => {
  redis.get.mockResolvedValue(JSON.stringify({ stage, data, ts: new Date().toISOString() }));
};

beforeEach(() => jest.clearAllMocks());

describe('Webhook — message routing', () => {
  test('message triggers AI call in FREE_TEXT_AI stage', async () => {
    mockState(STAGES.FREE_TEXT_AI, {});
    await handleText(FROM, 'I want to study in Germany', { stage: STAGES.FREE_TEXT_AI, data: {} }, {});

    expect(askAI).toHaveBeenCalledTimes(1);
  });

  test('AI response is sent back to the user', async () => {
    mockState(STAGES.FREE_TEXT_AI, {});
    askAI.mockResolvedValueOnce('Germany is a great choice. What level are you thinking?');

    await handleText(FROM, 'Germany', { stage: STAGES.FREE_TEXT_AI, data: {} }, {});

    expect(messenger.sendText).toHaveBeenCalledWith(
      FROM,
      expect.stringContaining('Germany')
    );
  });

  test('hard trigger bypasses AI — "menu" routes to main menu', async () => {
    const { sendMainMenu } = require('../../src/flows/mainMenu');
    mockState(STAGES.FREE_TEXT_AI, {});

    await handleText(FROM, 'menu', { stage: STAGES.FREE_TEXT_AI, data: {} }, {});

    expect(askAI).not.toHaveBeenCalled();
    expect(sendMainMenu).toHaveBeenCalledWith(FROM);
  });

  test('hard trigger bypasses AI — "speak to agent" escalates', async () => {
    const { escalate } = require('../../src/flows/escalation');
    mockState(STAGES.FREE_TEXT_AI, {});

    await handleText(FROM, 'speak to agent', { stage: STAGES.FREE_TEXT_AI, data: {} }, {});

    expect(askAI).not.toHaveBeenCalled();
    expect(escalate).toHaveBeenCalledWith(FROM, expect.any(Object));
  });

  test('bank trigger fires without calling AI', async () => {
    mockState(STAGES.FREE_TEXT_AI, {});

    await handleText(FROM, 'give me account number', { stage: STAGES.FREE_TEXT_AI, data: {} }, {});

    expect(askAI).not.toHaveBeenCalled();
    expect(messenger.sendText).toHaveBeenCalledWith(
      FROM,
      expect.stringMatching(/paystack/i)
    );
  });

  test('paid trigger fires without calling AI', async () => {
    mockState(STAGES.FREE_TEXT_AI, {});

    await handleText(FROM, 'i have paid', { stage: STAGES.FREE_TEXT_AI, data: {} }, {});

    expect(askAI).not.toHaveBeenCalled();
    expect(messenger.sendText).toHaveBeenCalledWith(
      FROM,
      expect.stringMatching(/payment|confirm/i)
    );
  });

  test('empty state (new user in GREETING) sends greeting, not AI', async () => {
    const { sendGreeting } = require('../../src/flows/greeting');
    redis.get.mockResolvedValue(null);

    await handleText(FROM, 'hello', { stage: STAGES.GREETING, data: {} }, {});

    expect(askAI).not.toHaveBeenCalled();
    expect(sendGreeting).toHaveBeenCalled();
  });
});

describe('Webhook — duplicate message deduplication', () => {
  test('second identical message within lock window is dropped silently', async () => {
    mockState(STAGES.FREE_TEXT_AI, {});
    // Lock already held — set returns null (NX fails)
    redis.set.mockResolvedValueOnce(null);

    await handleText(FROM, 'hello again', { stage: STAGES.FREE_TEXT_AI, data: {} }, {});

    expect(askAI).not.toHaveBeenCalled();
    expect(messenger.sendText).not.toHaveBeenCalled();
  });
});
