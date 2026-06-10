const Anthropic = require('@anthropic-ai/sdk');
const { COMPANY } = require('../config/constants');
const { SYSTEM_PROMPT } = require('../config/prompts');
const { buildHistory, loadPersistentContext } = require('./leadService');
const { saveToHistory } = require('../utils/stateManager');
const { askGPT } = require('./gpt');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL  = 'claude-sonnet-4-6';

const buildMessages = async (phone, userMessage, state, systemNote) => {
  const userData     = state.data || {};
  const contextParts = [];

  if (userData.name)                                         contextParts.push(`Name: ${userData.name}`);
  if (userData.destination || userData.destination_country) contextParts.push(`Destination: ${userData.destination || userData.destination_country}`);
  if (userData.program_level)                               contextParts.push(`Program: ${userData.program_level}`);
  if (userData.service || userData.service_interested)      contextParts.push(`Service: ${userData.service || userData.service_interested}`);
  if (userData.timeline)                                    contextParts.push(`Timeline: ${userData.timeline}`);
  if (userData.exam)                                        contextParts.push(`Exam: ${userData.exam}`);
  if (userData.loan_region)                                 contextParts.push(`Loan region: ${userData.loan_region}`);
  if (userData.age)                                         contextParts.push(`Age: ${userData.age}`);
  if (userData.fears)                                       contextParts.push(`Concerns: ${userData.fears}`);
  if (userData.budget || userData.budget_range)             contextParts.push(`Budget: ${userData.budget || userData.budget_range}`);
  if (userData.english_medium)                              contextParts.push(`English-medium background: ${userData.english_medium}`);
  if (userData.waec_english)                                contextParts.push(`WAEC English: ${userData.waec_english}`);
  if (userData.ielts_score)                                 contextParts.push(`IELTS score: ${userData.ielts_score}`);
  if (userData.ielts_fear)                                  contextParts.push(`Has IELTS anxiety — explore waivers/MOI before suggesting test prep`);
  if (userData.notes)                                       contextParts.push(`Notes: ${userData.notes}`);

  const sessionContext    = contextParts.length > 0 ? `\n[Session: ${contextParts.join(' | ')}]` : '';
  const persistentContext = await loadPersistentContext(phone);
  const fullContext       = (sessionContext + persistentContext).trim();

  const history = await buildHistory(phone, state);
  const reAnchor = history.length >= 8
    ? '\n[ANCHOR: Long conversation — you are Ade, warm Nigerian relocation strategist texting on WhatsApp. Next reply: max 2–3 sentences, plain text only, one question, no bullets, no asterisks. Do NOT repeat anything already discussed. Do NOT open with "Great!", "Absolutely!", "That\'s exciting!", or any filler word.]'
    : '';
  const today   = new Date().toLocaleDateString('en-NG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Lagos',
  });

  const platform     = phone.startsWith('tg_') ? 'Telegram' : 'WhatsApp';
  const platformNote = platform === 'WhatsApp'
    ? '[Platform: WhatsApp — plain text only. No asterisks, no underscores, no markdown of any kind. No bullet points or numbered lists. Natural line breaks only. Must read like a normal human chat message.]'
    : '[Platform: Telegram — markdown renders. Use *bold* sparingly where it feels natural.]';

  const baseContent = fullContext
    ? `${userMessage}\n\n${fullContext}\nToday's date: ${today}\n${platformNote}${reAnchor}`
    : `${userMessage}\nToday's date: ${today}\n${platformNote}${reAnchor}`;

  return [
    ...history,
    {
      role:    'user',
      content: systemNote ? `${baseContent}\n\n[INSTRUCTION: ${systemNote}]` : baseContent,
    },
  ];
};

// Strip machine trigger tags before saving to chat history or sending as visible text
const stripTags = (text) => text
  .replace(/\[\[SEND_PAYMENT_LINK\]\]/g, '')
  .replace(/\[\[PROFILE_READY\]\]/g, '')
  .trim();

const askAI = async (phone, userMessage, state, systemNote = '') => {
  try {
    const messages = await buildMessages(phone, userMessage, state, systemNote);

    // PRIMARY: Claude Sonnet with prompt caching — best instruction following + cost-efficient at scale
    try {
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

    } catch (claudeErr) {
      console.log('[AI] Claude failed — falling back to GPT:', claudeErr.message);
      if (claudeErr.message?.includes('credit balance')) {
        console.error('[AI] BILLING: Top up at console.anthropic.com');
      }
    }

    // FALLBACK: GPT-4o
    if (process.env.OPENAI_API_KEY) {
      try {
        const rawReply = await askGPT(messages, systemNote);
        await saveToHistory(phone, state, userMessage, stripTags(rawReply));
        return rawReply;
      } catch (gptErr) {
        console.error('[AI] GPT fallback also failed:', gptErr.message);
        if (gptErr.response?.status === 429 || gptErr.message?.includes('quota')) {
          console.error('[AI] BILLING: OpenAI quota exhausted — top up at platform.openai.com');
        }
      }
    }

    return `Something went wrong on my end. Give me a moment and try again, or reach us directly on ${COMPANY.phone}`;

  } catch (err) {
    console.error('[AI] Fatal error:', err.message);
    return `Something went wrong on my end. Give me a moment and try again, or reach us directly on ${COMPANY.phone}`;
  }
};

module.exports = { askAI };
