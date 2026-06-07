const supabase = require('../../src/config/database');

jest.mock('../../src/config/database', () => {
  const chain = {
    from:   jest.fn(),
    select: jest.fn(),
    eq:     jest.fn(),
    single: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  };
  // Make each chain method return `chain` so calls can be chained
  Object.keys(chain).forEach((k) => {
    if (k !== 'single' && k !== 'insert') {
      chain[k].mockReturnValue(chain);
    }
  });
  chain.single.mockResolvedValue({ data: null, error: null });
  chain.insert.mockResolvedValue({ error: null });
  return chain;
});

jest.mock('../../src/services/notifyOwner', () => ({
  notifyOwner: jest.fn().mockResolvedValue({}),
}));

const { upsertLead, updateLead, getLead, logMessage } = require('../../src/services/leadService');

const PHONE = '2340011122233';

beforeEach(() => jest.clearAllMocks());

describe('upsertLead', () => {
  test('inserts a new lead when none exists', async () => {
    supabase.single.mockResolvedValueOnce({ data: null, error: null });

    await upsertLead(PHONE, { name: 'Chidi', service_interested: 'study_abroad' });

    expect(supabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({ phone_number: PHONE, name: 'Chidi' })
    );
  });

  test('updates existing lead without overwriting confirmed name', async () => {
    supabase.single.mockResolvedValueOnce({ data: { id: 1, name: 'ConfirmedName' }, error: null });

    await upsertLead(PHONE, { name: 'NewDisplayName', service_interested: 'visa' });

    expect(supabase.update).toHaveBeenCalledWith(
      expect.not.objectContaining({ name: 'NewDisplayName' })
    );
  });

  test('does not throw when supabase errors silently', async () => {
    supabase.single.mockRejectedValueOnce(new Error('DB error'));
    await expect(upsertLead(PHONE, {})).resolves.not.toThrow();
  });
});

describe('updateLead', () => {
  test('calls supabase update with correct phone and fields', async () => {
    await updateLead(PHONE, { payment_status: 'paid' });

    expect(supabase.update).toHaveBeenCalledWith(
      expect.objectContaining({ payment_status: 'paid' })
    );
    expect(supabase.eq).toHaveBeenCalledWith('phone_number', PHONE);
  });

  test('always includes last_interaction timestamp', async () => {
    await updateLead(PHONE, { name: 'Tobi' });

    const updateArgs = supabase.update.mock.calls[0][0];
    expect(updateArgs.last_interaction).toBeDefined();
  });

  test('does not throw on DB error', async () => {
    supabase.update.mockImplementationOnce(() => {
      throw new Error('DB error');
    });
    await expect(updateLead(PHONE, {})).resolves.not.toThrow();
  });
});

describe('getLead', () => {
  test('returns lead data when found', async () => {
    const mockLead = { phone_number: PHONE, name: 'Amara', destination_country: 'UK' };
    supabase.single.mockResolvedValueOnce({ data: mockLead, error: null });

    const result = await getLead(PHONE);
    expect(result).toEqual(mockLead);
  });

  test('returns null when no lead found', async () => {
    supabase.single.mockResolvedValueOnce({ data: null, error: null });

    const result = await getLead(PHONE);
    expect(result).toBeNull();
  });

  test('returns null on DB error', async () => {
    supabase.single.mockRejectedValueOnce(new Error('DB error'));

    const result = await getLead(PHONE);
    expect(result).toBeNull();
  });
});

describe('logMessage', () => {
  test('inserts conversation record with correct fields', async () => {
    supabase.single.mockResolvedValueOnce({ data: { id: 42 }, error: null });

    await logMessage(PHONE, 'inbound', 'text', 'Hello there');

    expect(supabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        phone_number:  PHONE,
        direction:     'inbound',
        message_type:  'text',
        content:       'Hello there',
      })
    );
  });

  test('truncates message content to 4096 characters', async () => {
    supabase.single.mockResolvedValueOnce({ data: { id: 1 }, error: null });

    const long = 'x'.repeat(5000);
    await logMessage(PHONE, 'inbound', 'text', long);

    const insertArgs = supabase.insert.mock.calls[0][0];
    expect(insertArgs.content.length).toBeLessThanOrEqual(4096);
  });

  test('handles null content without throwing', async () => {
    supabase.single.mockResolvedValueOnce({ data: null, error: null });
    await expect(logMessage(PHONE, 'inbound', 'text', null)).resolves.not.toThrow();
  });
});
