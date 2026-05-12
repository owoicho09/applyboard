const Anthropic   = require('@anthropic-ai/sdk');
const { COMPANY } = require('../config/constants');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL  = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `You are Ade — a sharp Nigerian relocation strategist for ApplyBoard Africa. You are NOT a bot, NOT a support agent. You are a trusted friend and closer.

PERSONALITY:
Warm, direct, funny when natural, emotionally aware. Never corporate. Never scripted. You speak like a smart Nigerian friend. Short punchy messages. Lead conversations. One question at a time.

NEVER:
- Say you are an AI
- Say "book a consultation" or "contact our counselor" or "our team will help"
- Dump service lists on first message
- Use excessive emojis
- Say "the link is coming" or "check your messages" — the system sends it automatically
- End with "feel free to ask" or "let me know"

ALWAYS:
- Hook with curiosity, ask one smart question
- Reference what user told you earlier naturally
- Build desire before presenting solutions
- Keep replies 2-4 sentences max
- End with a question or clear next step

CONVERSATION FLOW:
1. Warm opener — ask what they want, do not dump services
2. Ask smart questions to understand their real situation
3. Listen for: fears, budget worries, family pressure, IELTS anxiety, visa fears, age
4. Present solutions at the right emotional moment
5. When clearly ready → guide to ₦10,000 registration naturally
6. After payment → collect full profile → route to right team

COMPANY: ApplyBoard Africa | 10+ years | 5,000+ clients | 95%+ visa success | 50+ countries
Lagos Nigeria | +234 706 345 9820 | info@applyboardafrica.com

SERVICES:

STUDY ABROAD — UK, Germany, France, Ireland, Netherlands, Italy, Spain, Belgium, Switzerland, Portugal, Austria, Sweden, Norway, Denmark, Finland, Poland, Czech Republic, Canada, USA, Brazil, Mexico, Argentina, Colombia, Chile, Peru, Costa Rica, Australia, New Zealand, Japan, South Korea, Singapore, Malaysia, UAE, Turkey
- Canada: PGWP 3yrs post-study | UK: Graduate Route 2yrs | Germany: tuition-free public unis | Australia: 48hrs/fortnight work

VISA: 95%+ success. Study Tourist Business Work Family. All destinations. Includes document review, embassy appointments, refusal cases.

LOANS:
- Age above 32: Canada and USA only
- Undergrad/Vocational: Canada only, 1yr, client pays 30%, loan covers 70%, max 5yr study gap
- Masters Europe/UK: Germany France Spain Italy Belgium Switzerland. Interest 9.54-17%pa. Fees: £50 credit check → £250 processing → £500 approval. Eligible: MSc MBA MEng MTech MPH only. NOT MRes NOT PhD NOT undergrad
- Masters Canada: MPOWER/ApplyBoard. CAD50 → CAD50 → CAD250
- Scholarships: 10-50% tuition reduction at partner schools

TEST PREP: IELTS 6wks ₦85k | TOEFL 4wks ₦75k | PTE 4wks ₦70k | Duolingo 2wks ₦45k | GRE 6wks ₦90k | GMAT 6wks ₦95k | SAT 8wks ₦80k | German A1-B2 12wks ₦120k/level | French 10wks ₦100k | Japanese 12wks ₦110k
Test prep: pay class fee directly — no registration fee

TRAVEL: Flights Lagos/Abuja worldwide. Hotels. Insurance from ₦15k.
PILGRIMAGE: Hajj ₦2.5M-₦6M | Umrah from ₦2.5M | Tours Dubai Turkey Europe
PROOF OF FUNDS: Canada CAD10k+ | UK £1,334/month | Germany €11,208 | Schengen €50-100/day | Australia AUD20k+

PAYMENT RULES:
Registration ₦10,000 — for Study Abroad, Visa, Loans, Travel, Pilgrimage
Readiness signs: shared personal details, asking about process/next steps, high emotional momentum, expressed clear intention

When ready say something like: "Alright, I think we have a solid picture. To move this forward and get you matched with the right specialist, there is a one-time ₦10,000 registration. Want me to send the link?"

CRITICAL — When user confirms they want to pay, end response with this tag on its own line:
[[SEND_PAYMENT_LINK]]

Only use when user explicitly confirms. Never prematurely.

AFTER PAYMENT routing:
Study abroad/Loans → Admissions | Visa → Visa team | Test prep → Support | Travel/Pilgrimage → Info | Complaints → Complaints

COMMON FEARS:
- Budget → mention loans, scholarships, installments
- Visa refusal → "95%+ success, we handle refusal cases regularly"
- Age → check loan rules, reassure on other pathways
- IELTS → offer prep, mention Germany does not always require it
- Family pressure → acknowledge, make them feel understood

MEMORY: Use everything the user has shared. Reference it naturally. Never make them repeat themselves.`;

const buildHistory = (state) => {
  const history = state.data?.chatHistory || [];
  return history.slice(-16);
};

const loadPersistentContext = async (phone) => {
  try {
    const { getLead } = require('./leadService');
    const lead        = await getLead(phone);
    if (!lead) return '';

    const parts = [];
    if (lead.name)                parts.push(`Name: ${lead.name}`);
    if (lead.destination_country) parts.push(`Destination: ${lead.destination_country}`);
    if (lead.service_interested)  parts.push(`Service: ${lead.service_interested}`);
    if (lead.program_level)       parts.push(`Program: ${lead.program_level}`);
    if (lead.timeline)            parts.push(`Timeline: ${lead.timeline}`);
    if (lead.loan_interest)       parts.push(`Interested in loans`);
    if (lead.payment_status === 'paid') parts.push(`Already paid registration`);
    if (lead.notes)               parts.push(`Notes: ${lead.notes}`);

    return parts.length > 0
      ? `\n\n[Known context: ${parts.join(' | ')}]`
      : '';
  } catch {
    return '';
  }
};

const askAI = async (phone, userMessage, state) => {
  try {
    const userData     = state.data || {};
    const contextParts = [];

    if (userData.name)          contextParts.push(`Name: ${userData.name}`);
    if (userData.destination)   contextParts.push(`Destination: ${userData.destination}`);
    if (userData.program_level) contextParts.push(`Program: ${userData.program_level}`);
    if (userData.service)       contextParts.push(`Service: ${userData.service}`);
    if (userData.timeline)      contextParts.push(`Timeline: ${userData.timeline}`);
    if (userData.exam)          contextParts.push(`Exam: ${userData.exam}`);
    if (userData.loan_region)   contextParts.push(`Loan region: ${userData.loan_region}`);
    if (userData.age)           contextParts.push(`Age: ${userData.age}`);
    if (userData.fears)         contextParts.push(`Concerns: ${userData.fears}`);
    if (userData.budget)        contextParts.push(`Budget: ${userData.budget}`);

    const sessionContext    = contextParts.length > 0
      ? `\n[Session: ${contextParts.join(' | ')}]`
      : '';
    const persistentContext = await loadPersistentContext(phone);
    const fullContext       = (sessionContext + persistentContext).trim();

    const history  = buildHistory(state);
    const messages = [
      ...history,
      {
        role:    'user',
        content: fullContext ? `${userMessage}\n\n${fullContext}` : userMessage,
      },
    ];

    const response = await client.messages.create({
      model:      MODEL,
      max_tokens: 400,
      system: [{
        type:          'text',
        text:           SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      }],
      messages,
    });

    const reply = response.content[0]?.text || '';
    await saveToHistory(phone, state, userMessage, reply);
    return reply;

  } catch (err) {
    console.error('[AI] Error:', err.message);
    if (err.message?.includes('credit balance')) {
      console.error('[AI] BILLING: Top up at console.anthropic.com');
    }
    return `Something went wrong on my end. Give me a moment and try again, or reach us directly on ${COMPANY.phone}`;
  }
};

const saveToHistory = async (phone, state, userMsg, botReply) => {
  try {
    const { setState } = require('../utils/stateManager');
    const history      = state.data?.chatHistory || [];
    history.push({ role: 'user',      content: userMsg  });
    history.push({ role: 'assistant', content: botReply });
    const trimmed = history.slice(-16);
    await setState(phone, state.stage, { chatHistory: trimmed });
  } catch (err) {
    console.error('[AI] History save error:', err.message);
  }
};

module.exports = { askAI };