const cron      = require('node-cron');
const Anthropic = require('@anthropic-ai/sdk');
const axios     = require('axios');

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

// ── Generate morning message ──────────────────────────────
const generateMorningMessage = async () => {
  const day  = new Date().toLocaleDateString('en-NG', { weekday:'long', timeZone:'Africa/Lagos' });
  const hour = new Date().toLocaleTimeString('en-NG', { hour:'2-digit', timeZone:'Africa/Lagos' });

  const response = await client.messages.create({
    model:      MODEL,
    max_tokens: 250,
    messages: [{
      role:    'user',
      content: `You are Ade — a sharp, warm Nigerian who has personally helped thousands of Nigerians study abroad and relocate. You are dropping a morning message in a Telegram group of 900+ Nigerians who are serious about studying abroad, getting visas, or relocating internationally.

Today is ${day}, around ${hour} WAT.

Your job is to share ONE genuinely useful, specific, conversion-focused fact or insight that:

- Is directly relevant to Nigerians trying to study or relocate abroad
- Comes from real knowledge — not generic advice
- Makes someone think "I did not know that" or "this changes things for me"
- Creates a real reason to take action today

Topics you can draw from — pick one randomly and go deep:
- Specific visa processing times for Nigerian passport holders (Canada, UK, Germany, Australia, Schengen, Ireland, Netherlands, New Zealand, UAE, Malaysia)
- Hidden costs Nigerians overlook when planning to study abroad (application fees, credential evaluation, health insurance, settlement funds)
- IELTS band score requirements by country and by program type and what happens if you fall short
- How the Canada PGWP actually works and why a 2 year program gives you 3 years work permit not 2
- Germany blocked account requirements and how much Nigerians need to show for student visa
- UK Graduate Route visa and what sectors are actually hiring international graduates right now
- Study loans — who qualifies, age rules, what programs are eligible, what is covered
- Post-study work rights comparison across Canada UK Germany Australia Ireland Netherlands
- Scholarship opportunities Nigerian students regularly miss and how to find them
- Proof of funds — exact amounts required per destination and what counts as valid proof
- Common reasons Nigerian visa applications get rejected and what actually fixes them
- What ApplyBoard Africa has done for clients — real outcomes, success rate, destinations covered
- The difference between conditional and unconditional offers and why it matters for your visa
- How Nigerian students can work while studying in different countries — hours allowed by law
- Why Germany is one of the best decisions a Nigerian student can make right now
- How study abroad can lead to permanent residency — Canada Express Entry, Australia PR, UK ILR
- What NECO and WAEC equivalency looks like in different countries and how to handle it
- Vocational and diploma programs abroad that lead to strong careers and are easier to get into
- How to get a Canadian student visa faster using the SDS stream
- What Brexit changed for Nigerian students going to the UK
- How to combine IELTS prep with your application process to save 3 to 6 months
- The real cost of studying in Canada vs UK vs Germany for a Nigerian family
- How the ApplyBoard Africa loan works — who qualifies, what it covers, repayment terms
- Why some Nigerian students get rejected for visas even with strong academics
- Mental and emotional things Nigerians face abroad that nobody talks about before they leave

Rules for writing:
- Open with something unexpected — a fact, a number, a question, a bold statement — not "good morning everyone"
- Write like you are texting someone you genuinely care about helping
- One idea only — go deep not broad
- Keep it under 5 sentences
- Use 1 or 2 emojis where they feel natural — not forced
- End the message with a new line containing only: "DM me to talk about your situation → ${BOT_LINK}"
- Never sound like a company announcement or newsletter
- Never be vague — use specific numbers, timelines, country names, program names
- Rotate your opening style — sometimes start with a fact, sometimes a question, sometimes a provocative statement, sometimes a story opener
- Make it feel like it was written today for Nigerians specifically`,
    }],
  });

  return response.content[0]?.text || '';
};

// ── Generate weekly poll ──────────────────────────────────
const generateWeeklyPoll = async () => {
  const response = await client.messages.create({
    model:      MODEL,
    max_tokens: 300,
    messages: [{
      role:    'user',
      content: `You are creating a weekly poll for a Telegram group of 900+ Nigerians who are planning to study abroad, get visas, or relocate internationally. The group is run by ApplyBoard Africa, a consultancy that has helped 5,000+ Nigerian clients.

Create ONE poll question that:
- Feels like something a curious, smart friend would ask — not a corporate survey
- Gets at something real that people in this group are actually thinking or worried about
- Will make people want to vote AND comment
- Is specific to the Nigerian experience of studying abroad or relocating
- Could spark a conversation in the group

Topics to draw from — pick one and make it specific:
- The real reason people keep delaying their study abroad plans
- Fears about leaving Nigeria — family, money, uncertainty, loneliness
- What people wish they knew before starting the process
- Funding strategies — loan, family support, scholarship, personal savings
- Which destination they are leaning toward and why
- IELTS and language test anxiety
- Visa rejection fears
- Post-graduation plans — stay abroad or come back
- Whether their family supports the decision to leave
- What stage of planning they are actually at right now
- Whether they trust consultancies or prefer to DIY
- The biggest misconception they had about studying abroad
- What would make them take action this week
- Their biggest motivation for wanting to leave — career, safety, lifestyle, education quality
- How long they have been "planning" without actually starting

Generate a question that is direct, human, and slightly provocative — not safe and boring.

Respond with ONLY valid JSON, no explanation, no markdown:
{
  "question": "your poll question here — max 255 characters",
  "options": ["option 1", "option 2", "option 3", "option 4"]
}

Each option should be short, real, and relatable to Nigerians. Maximum 100 characters per option.`,
    }],
  });

  try {
    const text    = response.content[0]?.text || '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed  = JSON.parse(cleaned);

    // Validate lengths — Telegram limits
    if (parsed.question.length > 255) {
      parsed.question = parsed.question.slice(0, 252) + '...';
    }
    parsed.options = parsed.options.map(o =>
      o.length > 100 ? o.slice(0, 97) + '...' : o
    );

    return parsed;
  } catch {
    return {
      question: 'Be honest — what is actually stopping you from starting your study abroad process right now?',
      options:  ['Money is not ready', 'IELTS is the problem', 'Family does not support it', 'I do not know where to start'],
    };
  }
};

// ── Welcome new member ────────────────────────────────────
const sendWelcomeMessage = async (member, chatId) => {
  try {
    const name = member.first_name || 'friend';

    const response = await client.messages.create({
      model:      MODEL,
      max_tokens: 180,
      messages: [{
        role:    'user',
        content: `You are Ade, a warm and sharp Nigerian consultant who has helped thousands of Nigerians study abroad and relocate. Someone called ${name} just joined a Telegram group of 900+ Nigerians who are planning to study abroad or relocate internationally.

Write a short personal welcome message for ${name} that:
- Feels like it was written for them specifically — not copy-pasted
- Acknowledges they just took a real step by joining
- Creates a sense that something genuinely useful is available here
- Invites them to start a private conversation with you
- Ends with: "Start here → ${BOT_LINK}"
- Maximum 3 sentences
- Use 1 emoji naturally somewhere in the message
- Do NOT open with "Welcome to the group" or "Welcome ${name}" — be more original
- Sound like a real person, warm but not over the top
- Make them feel like joining this group was a smart decision`,
      }],
    });

    const message = response.content[0]?.text ||
      `Hey ${name}, glad you found this space 👋 This is where Nigerians who are serious about going abroad actually figure things out — no noise, just real information and real help. Start a conversation with me directly → ${BOT_LINK}`;

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