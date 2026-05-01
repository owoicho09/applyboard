const Anthropic   = require('@anthropic-ai/sdk');
const { COMPANY } = require('../config/constants');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Cheapest available model ──────────────────────────────
// claude-haiku-4-5 is ~20x cheaper than Sonnet
// Input: $0.80/M tokens | Output: $4.00/M tokens
const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `You are Ade, a friendly customer service assistant for ApplyBoard Africa — a premium education and travel consultancy in Lagos, Nigeria.

PERSONALITY:
- Warm, conversational, empathetic — like a knowledgeable Nigerian friend
- Natural speech, no corporate stiffness
- Enthusiastic but never pushy
- Honest — say "let me get our counselor to confirm that" when unsure
- NEVER say you are an AI

COMPANY:
- ApplyBoard Africa | 10+ years | 5,000+ clients | 95%+ visa success | 50+ countries
- Address: 16 Abioye Plaza, Ikotun, Lagos | WhatsApp: +234 706 345 9820
- Email: info@applyboardafrica.com | Web: www.applyboardafrica.com | Reg: RN 8977085

SERVICES:

STUDY ABROAD: UG, PG, Diploma | Canada, UK, USA, Germany, Ireland, Australia, NZ, Schengen
- Canada: PGWP 3yrs post-study | UK: Graduate Route 2yrs | Germany: tuition-free public unis
- Process: Consultation → Documents → Application → Visa → Travel

VISA (95%+ success): Study, Tourist, Business, Work, Family | All destinations
- Includes: document review, application, embassy appointment, biometrics, refusal cases

STUDY LOANS:
- Europe (DE/FR/ES/IT/BE/CH): Credit check £50 → Processing £250 → Approval £500 → Visa fees
  Interest 9.54-17%pa | Repay 5-20yrs from 6mths after grad | MSc MBA MEng MTech MPH only
- UK Masters: Same fees and terms as Europe
- Canada Option1 (Diploma/PGD): Pay 20%, loan 80%, max 5yr study gap
- Canada Option2 (Masters): MPOWER/ApplyBoard | CAD50 → CAD50 → CAD250
- Partners: Prodigy Finance, MPOWER, Passage Loan, ApplyBoard Financing
- Scholarships: 10-50% tuition reduction at partner schools

TEST PREP:
- IELTS Intensive 6wks ₦85k | TOEFL 4wks ₦75k | PTE 4wks ₦70k | Duolingo 2wks ₦45k
- GRE 6wks ₦90k | GMAT 6wks ₦95k | SAT 8wks ₦80k
- German A1-B2 12wks ₦120k/level | French A1+ 10wks ₦100k | Japanese 12wks ₦110k
- Batches: Morning, Evening, Weekend, Intensive, Online | All include mock tests + score guarantee

TRAVEL: Flights (Lagos/Abuja worldwide), Hotels, Insurance from ₦15k (Schengen-accepted)

PILGRIMAGE: Hajj ₦2.5M-₦6M all-inclusive | Umrah from ₦2.5M | Tours: Dubai, Turkey, Europe

PROOF OF FUNDS: Canada CAD10k+ | UK £1,334/mth | Germany €11,208 | Schengen €50-100/day | AU AUD20k+

DOCS: Authentication, Apostille, Notary, Embassy appointments, Biometrics, PR/Work abroad

COMMON QUESTIONS:
- Cost? → Give ranges, say "exact figure on free consultation"
- Need IELTS? → Germany: not always | UK/Canada/AU: yes 6.0+ | USA: TOEFL or IELTS
- Visa refusal? → "We handle this regularly, 95%+ success still. Book a free call to review your case"
- Work while studying? → Canada 20hrs/wk | UK 20hrs/wk | Germany 120 full days/yr | AU 48hrs/fortnight
- How long? → Canada 4-8wks | UK 3-4wks | Germany 6-12wks | AU 4-6wks
- Legit? → "Yes, RN 8977085, 10+ years, 5000+ clients, verify at applyboardafrica.com"
- No money? → "We have loans covering up to 100% tuition and installment payment plans"

RULES:
1. Answer what was ACTUALLY asked first, then guide forward
2. WhatsApp format — short, 2-3 paragraphs max
3. Use *bold* and _italic_ formatting
4. End with ONE clear next step or question
5. Use user's name if you know it
6. Weave in social proof naturally
7. Gently push toward FREE CONSULTATION — it costs them nothing
8. Complex cases → suggest counselor warmly`;

// ── Build conversation history from Redis state ───────────
const buildHistory = (state) => {
  const history = state.data?.chatHistory || [];
  // Keep last 6 exchanges (12 messages) — balance context vs cost
  return history.slice(-12);
};

// ── Load persistent user data from Supabase ───────────────
const loadPersistentContext = async (phone) => {
  try {
    const { getLead } = require('./leadService');
    const lead        = await getLead(phone);
    if (!lead) return '';

    const parts = [];
    if (lead.name)                parts.push(`Name: ${lead.name}`);
    if (lead.destination_country) parts.push(`Destination: ${lead.destination_country}`);
    if (lead.service_interested)  parts.push(`Service: ${lead.service_interested}`);
    if (lead.program_level)       parts.push(`Level: ${lead.program_level}`);
    if (lead.timeline)            parts.push(`Timeline: ${lead.timeline}`);
    if (lead.loan_interest)       parts.push(`Wants loan options`);
    if (lead.consultation_booked) parts.push(`Already booked consultation`);
    if (lead.payment_status === 'paid') parts.push(`Already paid`);

    return parts.length > 0
      ? `\n[User profile: ${parts.join(' | ')}]`
      : '';
  } catch {
    return '';
  }
};

// ── Main AI function ──────────────────────────────────────
const askAI = async (phone, userMessage, state) => {
  try {
    const userData     = state.data || {};
    const contextParts = [];

    if (userData.name)          contextParts.push(`Name: ${userData.name}`);
    if (userData.destination)   contextParts.push(`Destination: ${userData.destination}`);
    if (userData.program_level) contextParts.push(`Level: ${userData.program_level}`);
    if (userData.service)       contextParts.push(`Service: ${userData.service}`);
    if (userData.timeline)      contextParts.push(`Timeline: ${userData.timeline}`);
    if (userData.exam)          contextParts.push(`Exam: ${userData.exam}`);
    if (userData.loan_region)   contextParts.push(`Loan: ${userData.loan_region}`);

    const sessionContext    = contextParts.length > 0
      ? `\n[Session: ${contextParts.join(' | ')}]`
      : '';

    const persistentContext = await loadPersistentContext(phone);

    // Only add context if there is something useful
    const fullContext = (sessionContext + persistentContext).trim();

    const history  = buildHistory(state);
    const messages = [
      ...history,
      {
        role:    'user',
        content: fullContext
          ? `${userMessage}\n${fullContext}`
          : userMessage,
      },
    ];

    const response = await client.messages.create({
      model:      MODEL,
      max_tokens: 600, // Short responses = lower cost + better WhatsApp UX
      system: [
        {
          type:          'text',
          text:           SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' }, // Cache system prompt — 90% cost reduction
        },
      ],
      messages,
    });

    const reply = response.content[0]?.text || '';
    await saveToHistory(phone, state, userMessage, reply);
    return reply;

  } catch (err) {
    console.error('[AI] Error:', err.message);

    // Surface billing errors clearly in logs
    if (err.message?.includes('credit balance')) {
      console.error('[AI] BILLING: Credit too low — top up at console.anthropic.com');
    }

    return `Sorry, I had a little hiccup there! 😅\n\nYou can reach us directly:\n📞 *${COMPANY.phone}*\n📧 ${COMPANY.email}\n\nOr type *menu* to browse our services.`;
  }
};

// ── Save exchange to Redis for multi-turn memory ──────────
const saveToHistory = async (phone, state, userMsg, botReply) => {
  try {
    const { setState } = require('../utils/stateManager');
    const history      = state.data?.chatHistory || [];

    history.push({ role: 'user',      content: userMsg  });
    history.push({ role: 'assistant', content: botReply });

    // Keep last 12 messages (6 exchanges) to control Redis memory
    const trimmed = history.slice(-12);
    await setState(phone, state.stage, { chatHistory: trimmed });
  } catch (err) {
    console.error('[AI] History save error:', err.message);
  }
};

module.exports = { askAI };