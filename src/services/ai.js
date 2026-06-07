const Anthropic = require('@anthropic-ai/sdk');
const { COMPANY } = require('../config/constants');
const { SYSTEM_PROMPT } = require('../config/prompts');
const { buildHistory, loadPersistentContext } = require('./leadService');
const { saveToHistory } = require('../utils/stateManager');
const { askGPT } = require('./gpt');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL  = 'claude-haiku-4-5-20251001';

const buildMessages = async (phone, userMessage, state, systemNote) => {
  const userData     = state.data || {};
  const contextParts = [];

  if (userData.name)            contextParts.push(`Name: ${userData.name}`);
  if (userData.destination)     contextParts.push(`Destination: ${userData.destination}`);
  if (userData.program_level)   contextParts.push(`Program: ${userData.program_level}`);
  if (userData.service)         contextParts.push(`Service: ${userData.service}`);
  if (userData.timeline)        contextParts.push(`Timeline: ${userData.timeline}`);
  if (userData.exam)            contextParts.push(`Exam: ${userData.exam}`);
  if (userData.loan_region)     contextParts.push(`Loan region: ${userData.loan_region}`);
  if (userData.age)             contextParts.push(`Age: ${userData.age}`);
  if (userData.fears)           contextParts.push(`Concerns: ${userData.fears}`);
  if (userData.budget)          contextParts.push(`Budget: ${userData.budget}`);
  if (userData.english_medium)  contextParts.push(`English-medium background: ${userData.english_medium}`);
  if (userData.waec_english)    contextParts.push(`WAEC English: ${userData.waec_english}`);
  if (userData.ielts_score)     contextParts.push(`IELTS score: ${userData.ielts_score}`);
  if (userData.ielts_fear)      contextParts.push(`Has IELTS anxiety — explore waivers/MOI before suggesting test prep`);

  const sessionContext    = contextParts.length > 0 ? `\n[Session: ${contextParts.join(' | ')}]` : '';
  const persistentContext = await loadPersistentContext(phone);
  const fullContext       = (sessionContext + persistentContext).trim();

  const history = await buildHistory(phone, state);
  const today   = new Date().toLocaleDateString('en-NG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Lagos',
  });

  const platform     = phone.startsWith('tg_') ? 'Telegram' : 'WhatsApp';
  const platformNote = platform === 'WhatsApp'
    ? '[Platform: WhatsApp — write in plain text only. No asterisks, no underscores, no markdown symbols of any kind. Use natural line breaks. Formatting must feel like a normal chat message.]'
    : '[Platform: Telegram — markdown renders. Use *bold* sparingly where it feels natural.]';

  const baseContent = fullContext
    ? `${userMessage}\n\n${fullContext}\nToday's date: ${today}\n${platformNote}`
    : `${userMessage}\nToday's date: ${today}\n${platformNote}`;

  return [
    ...history,
    {
      role:    'user',
      content: systemNote ? `${baseContent}\n\n[INSTRUCTION: ${systemNote}]` : baseContent,
    },
  ];
};

const stripTags = (text) => text.replace(/\[\[SEND_PAYMENT_LINK\]\]/g, '').trim();

const askAI = async (phone, userMessage, state, systemNote = '') => {
  let messages;
  try {
    messages = await buildMessages(phone, userMessage, state, systemNote);

    // PRIMARY: GPT — use when credits are available
    if (process.env.OPENAI_API_KEY) {
      try {
        const rawReply = await askGPT(messages, systemNote);
        await saveToHistory(phone, state, userMessage, stripTags(rawReply));
        return rawReply;
      } catch (gptErr) {
        console.log('[AI] GPT failed — falling back to Claude:', gptErr.message);
        if (gptErr.response?.status === 429 || gptErr.message?.includes('quota')) {
          console.error('[AI] BILLING: OpenAI quota exhausted — top up at platform.openai.com');
        }
      }
    }

    // FALLBACK: Claude with overload retry
    const apiCall = () => client.messages.create({
      model:      MODEL,
      max_tokens: 800,
      system: [{
        type:          'text',
        text:          SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      }],
      messages,
    });

    let response;
    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        response = await apiCall();
        break;
      } catch (retryErr) {
        const isOverloaded = retryErr.status === 529 || retryErr.message?.includes('overloaded');
        if (isOverloaded && attempt < 2) {
          console.log('[AI] Claude overloaded — retrying...');
          await new Promise((res) => setTimeout(res, 2000));
        } else {
          throw retryErr;
        }
      }
    }

    const rawReply = response.content[0]?.text || '';
    await saveToHistory(phone, state, userMessage, stripTags(rawReply));
    return rawReply;

  } catch (err) {
    console.error('[AI] All providers failed:', err.message);
    if (err.message?.includes('credit balance')) {
      console.error('[AI] BILLING: Top up at console.anthropic.com');
    }
    return `Something went wrong on my end. Give me a moment and try again, or reach us directly on ${COMPANY.phone}`;
  }
};

module.exports = { askAI };
