const cron      = require('node-cron');
const Anthropic = require('@anthropic-ai/sdk');
const axios     = require('axios');
const tg        = require('./telegram');

const client   = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const GROUP_ID = process.env.TELEGRAM_GROUP_ID;
const BOT_LINK = 'https://t.me/ApplyBoardbot';
const MODEL    = 'claude-haiku-4-5-20251001';

// ── Telegram API helper ───────────────────────────────────
const telegramApi = async (method, data) => {
  const res = await axios.post(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`,
    data,
    { headers: { 'Content-Type': 'application/json' } }
  );
  return res.data;
};

// ── Generate morning message using Claude ─────────────────
const generateMorningMessage = async () => {
  const topics = [
    'Canada post-graduation work permit and how international students can stay and work for up to 3 years after graduating',
    'Germany tuition-free public universities and what Nigerian students need to know about applying',
    'UK Graduate Route visa that allows students to stay and work for 2 years after graduation',
    'Study loans available for Nigerian students going abroad including interest rates and repayment terms',
    'IELTS score requirements for top study destinations and tips to improve your band score',
    'Australian student visa work rights allowing 48 hours per fortnight during studies',
    'Ireland as an emerging study destination with strong tech job market for graduates',
    'Proof of funds requirements for Canada UK Germany Australia and Schengen visa applications',
    'How Nigerian students can get scholarships covering 10 to 50 percent of tuition at partner schools abroad',
    'The difference between a study visa and a student permit and why it matters for your application',
    'Netherlands English-taught masters programs and why it is becoming popular for Nigerian students',
    'How to choose between Canada and UK for a masters degree based on cost career goals and post-study options',
    'What happens if your visa gets rejected and how ApplyBoard Africa handles refusal cases with 95 percent success rate',
    'Brazil as an underrated affordable study destination with growing opportunities for African students',
    'How the PGWP Canada pathway works and why it is one of the best routes to Canadian permanent residency',
  ];

  const today = new Date().toLocaleDateString('en-NG', { weekday: 'long', timeZone: 'Africa/Lagos' });
  const topic = topics[new Date().getDate() % topics.length];

  const response = await client.messages.create({
    model:      MODEL,
    max_tokens: 300,
    messages: [{
      role:    'user',
      content: `You are writing a daily morning message for a Telegram group called ApplyBoard Africa.
The group has 900+ Nigerians who want to study abroad, get visas, or relocate internationally.

Today is ${today}.
Topic: ${topic}

Write a short, punchy, fact-based morning message that:
- Starts with a greeting relevant to the day
- Shares one genuinely useful and surprising fact about the topic
- Keeps it conversational and human — not corporate
- Creates curiosity and desire to learn more
- Ends with this exact call to action on its own line: "Send me a DM here → ${BOT_LINK}"
- Maximum 5 sentences total
- No emojis
- No hashtags
- Sound like a knowledgeable friend not a company`,
    }],
  });

  return response.content[0]?.text || '';
};

// ── Generate weekly poll ──────────────────────────────────
const generateWeeklyPoll = async () => {
  const pollTopics = [
    { question: 'Which country are you most seriously considering for studying abroad?', options: ['Canada', 'United Kingdom', 'Germany', 'Australia', 'Other'] },
    { question: 'What is your biggest concern about studying abroad?', options: ['Cost and funding', 'Visa approval', 'IELTS requirement', 'Choosing the right school', 'Family pressure'] },
    { question: 'Which stage of the study abroad process are you currently at?', options: ['Just researching', 'Preparing documents', 'Applied for admission', 'Waiting for visa', 'Already abroad'] },
    { question: 'What service do you need most help with right now?', options: ['University admission', 'Visa processing', 'Study loan', 'IELTS preparation', 'Travel and flights'] },
    { question: 'What is your target intake for studying abroad?', options: ['September 2025', 'January 2026', 'September 2026', 'January 2027', 'Still deciding'] },
    { question: 'Which program level are you planning to study?', options: ['Undergraduate', 'Masters', 'Diploma or Vocational', 'PhD', 'Short course'] },
    { question: 'How long have you been planning to study abroad?', options: ['Just started thinking about it', '3 to 6 months', '6 months to 1 year', 'Over 1 year', 'Already have admission'] },
  ];

  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return pollTopics[weekNumber % pollTopics.length];
};

// ── Send morning message ──────────────────────────────────
const sendMorningMessage = async () => {
  if (!GROUP_ID) { console.warn('[SCHEDULER] TELEGRAM_GROUP_ID not set'); return; }
  try {
    console.log('[SCHEDULER] Generating morning message...');
    const message = await generateMorningMessage();
    if (!message) return;

    await telegramApi('sendMessage', {
      chat_id:                  GROUP_ID,
      text:                     message,
      parse_mode:               'Markdown',
      disable_web_page_preview: true,
    });

    console.log('[SCHEDULER] Morning message sent');
  } catch (err) {
    console.error('[SCHEDULER] Morning message error:', err.message);
  }
};

// ── Send weekly poll ──────────────────────────────────────
const sendWeeklyPoll = async () => {
  if (!GROUP_ID) { console.warn('[SCHEDULER] TELEGRAM_GROUP_ID not set'); return; }
  try {
    console.log('[SCHEDULER] Sending weekly poll...');
    const poll = await generateWeeklyPoll();

    await telegramApi('sendPoll', {
      chat_id:                 GROUP_ID,
      question:                poll.question,
      options:                 poll.options,
      is_anonymous:            false,
      allows_multiple_answers: false,
    });

    console.log('[SCHEDULER] Weekly poll sent');
  } catch (err) {
    console.error('[SCHEDULER] Weekly poll error:', err.message);
  }
};

// ── Welcome new member ────────────────────────────────────
const sendWelcomeMessage = async (member, chatId) => {
  try {
    const name    = member.first_name || 'there';
    const message =
      `Welcome ${name}.\n\n` +
      `You just joined a community of people actively planning to study abroad, relocate, and build better futures.\n\n` +
      `Whether you are thinking about Canada, UK, Germany, Australia, or anywhere else — ` +
      `the information and support you need is here.\n\n` +
      `To get started with your own personalised plan, send me a direct message → ${BOT_LINK}`;

    await telegramApi('sendMessage', {
      chat_id:                  chatId,
      text:                     message,
      disable_web_page_preview: true,
    });

    console.log(`[SCHEDULER] Welcomed: ${name}`);
  } catch (err) {
    console.error('[SCHEDULER] Welcome error:', err.message);
  }
};

// ── Start all scheduled jobs ──────────────────────────────
const startScheduler = () => {
  if (!GROUP_ID) {
    console.warn('[SCHEDULER] TELEGRAM_GROUP_ID not set — scheduler disabled');
    return;
  }

  // Daily morning message — 8:00 AM WAT
  cron.schedule('0 8 * * *', () => {
    console.log('[SCHEDULER] Firing morning message...');
    sendMorningMessage();
  }, { timezone: 'Africa/Lagos' });

  // Weekly poll — Monday 9:00 AM WAT
  cron.schedule('0 9 * * 1', () => {
    console.log('[SCHEDULER] Firing weekly poll...');
    sendWeeklyPoll();
  }, { timezone: 'Africa/Lagos' });

  console.log('[SCHEDULER] All jobs scheduled:');
  console.log('[SCHEDULER]   Daily morning message → 8:00 AM WAT');
  console.log('[SCHEDULER]   Weekly poll           → Monday 9:00 AM WAT');
  console.log('[SCHEDULER]   Welcome new members   → on join event');
};

module.exports = {
  startScheduler,
  sendWelcomeMessage,
  sendMorningMessage,
  sendWeeklyPoll,
};