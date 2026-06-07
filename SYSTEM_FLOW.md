# ApplyBoard Africa Bot — System Flow & Customer Journey

## What This System Is

ApplyBoard Africa Bot is an AI-powered WhatsApp and Telegram chatbot that acts as the front door for an education and travel consultancy based in Lagos, Nigeria (16 Abioye Plaza, Ikotun). It qualifies incoming leads, collects a ₦10,000 registration fee via Paystack, and hands off warm, profiled customers to the right human specialist to close and deliver the service.

The bot's persona is "Ade" — a Nigerian relocation strategist who texts like a real person, never a support agent, never a bot.

---

## Services Offered

| Service | Registration Fee | Notes |
|---|---|---|
| Study Abroad | ₦10,000 | Canada, UK, USA, Germany, Australia, Ireland, NZ, Brazil, 50+ countries |
| Visa Processing | ₦10,000 | Study, Tourist, Business, Work, Family — all destinations |
| Study Loans & Scholarships | ₦10,000 | Masters: Europe/UK/Canada. Undergrad: Canada only |
| Travel (Flights, Hotels) | ₦10,000 | Lagos to worldwide |
| Travel Insurance | ₦10,000 | From ₦15,000 |
| Hajj & Umrah | ₦10,000 | Hajj ₦2.5M–₦6M, Umrah from ₦2.5M |
| Proof of Funds Advisory | ₦10,000 | Country-specific PoF support |
| Free Consultation | ₦10,000 | Deep profile collection, then specialist match |
| Test Prep (IELTS, TOEFL, GRE etc.) | **No registration** | Clients pay class fee directly (₦45k–₦120k) |

---

## Tech Stack

- **Messaging:** WhatsApp Cloud API (Meta) + Telegram Bot API
- **AI:** Claude Haiku 4.5 (Anthropic SDK) as fallback; OpenAI GPT as primary when key is set
- **Payments:** Paystack (card, bank transfer, USSD)
- **Database:** Supabase (PostgreSQL) — persistent CRM, conversation logs, payments
- **Session state:** Redis — active conversation state, chat history (24hr TTL)
- **Server:** Node.js + Express, webhook-first architecture

---

## Entry Points

There are two message entry points into the system:

1. **WhatsApp:** `POST /webhook` — Meta sends a webhook to the server. The server responds 200 immediately, then processes async.
2. **Telegram:** `POST /telegram/webhook` — Telegram sends a webhook. Same pattern.

Both channels share the same state/lead backend. A Telegram user's phone number is prefixed `tg_` to keep them distinct.

---

## End-to-End Customer Journey

### Step 1 — Message Arrives

`src/handlers/messageHandler.js` is the entry point for every incoming message.

1. **Deduplication check** — Meta sometimes delivers the same webhook twice. If the message ID has been seen before (Redis, 5-min TTL), it is silently dropped.
2. **Rate limit check** — If the user sent 5+ messages in 30 seconds, they get a "give me a moment" reply and the message is dropped.
3. **Mark as read** — WhatsApp read receipt is sent in parallel.
4. **Lead upsert** — Supabase `leads` row is created or updated (runs in background, does not block reply).
5. **Message logged** — Every inbound message is written to Supabase `conversations` table.
6. **Route** — Based on `message.type`:
   - `interactive` → `buttonHandler.js`
   - `text` → `textHandler.js`
   - anything else (image, audio, document) → `mediaHandler.js`

---

### Step 2 — Text Message Routing (`src/handlers/textHandler.js`)

Text messages go through a layered decision tree, top to bottom:

**Layer 1 — Numeric reply**
If the user typed "1", "2", "3" and the session has a numbered menu saved (`state.data.lastMenu`), it maps the number to the matching button ID and re-routes through `buttonHandler`.

**Layer 2 — Name collection stage**
If the current stage is `CONSULT_NAME`, the text is captured as the user's name and passed to `consultation.js`.

**Layer 3 — Hard triggers (keyword intercepts)**
These bypass AI entirely:

- `menu / home / restart` → Send main menu
- `i have paid / payment done / just paid now` etc. → Send a hardcoded payment acknowledgment (reference number + callback)
- `speak to agent / real person / call me` → Trigger escalation flow
- `account number / bank account / gtbank / direct transfer` etc. → Send a hardcoded Paystack bank-transfer instruction. **This never touches the AI.** The AI once hallucinated a GTBank account number in production; this intercept exists to prevent recurrence.

**Layer 4 — First message / returning user detection**
If the stage is `GREETING` or empty, the system checks Supabase for an existing lead profile.
- If profile found (name, destination, service): restore fields to Redis, set stage to `FREE_TEXT_AI`, call AI with a "returning user" instruction — AI picks up naturally without re-introducing.
- If no profile: send greeting, set stage to `FREE_TEXT_AI`.

**Layer 5 — Payment awaiting stage**
If the stage is `PAYMENT_AWAITING`:
- If lead already paid (Supabase confirms): clear state, move to `FREE_TEXT_AI`, answer normally.
- If user sends explicit "send me the link now" phrases: regenerate/resend Paystack link immediately.
- Everything else: route to AI with a specific `systemNote` that explains what the ₦10,000 covers and how to detect/handle trust objections. AI may output `[[SEND_PAYMENT_LINK]]` tag to trigger the link.

**Layer 6 — Profile consultation stages**
If stage is `PROFILE_COLLECTING`, `PROFILE_SUMMARY`, or `PROFILE_ROADMAP`, route to the corresponding handler in `profileConsultation.js`.

**Layer 7 — Escalated stage**
If stage is `ESCALATED`, pass to AI with a `systemNote` that says "hold the space, do not trigger payment, a human is coming."

**Layer 8 — Default: AI handles it**
Acquire a per-user processing lock (prevents race conditions if messages arrive fast). Then run three things in parallel:
1. `detectAndSaveSignals()` — scan message for destination, service, exam, age, budget keywords and write to Supabase + Redis
2. `extractProfileSignals()` (from `profileExtractor.js`) — deeper profile signal extraction
3. `askAI()` — get reply from Claude/GPT

After AI responds:
- If reply contains `[[SEND_PAYMENT_LINK]]` tag, or if it matches a narration pattern ("sending you the link", "link is on its way"), trigger payment link generation
- Guardrails block payment if: no context collected, lead already paid, test_prep service with no confirmed exam
- If a link was already generated this session, resend the stored URL (no second Paystack charge)

---

### Step 3 — Button Press Routing (`src/handlers/buttonHandler.js`)

Every interactive button press maps to a specific handler via a static route map (47+ entries). Examples:

- `SVC_STUDY` → `handleStudyAbroad(from, 'START', state)`
- `SA_CANADA` → `handleStudyAbroad(from, 'SA_CANADA', state)`
- `TP_IELTS` → `handleTestPrep(from, 'TP_IELTS', state)`
- `PAY_NOW` → `handlePayment(from, 'PAY_NOW', state)`
- `ESCALATE` → `escalate(from, state)`

Unknown button IDs fall back to stage-prefix routing, then final fallback to main menu.

---

### Step 4 — Service Flows

Each service has its own flow file that manages a short qualification sequence, then hands off to AI.

#### Study Abroad (`src/flows/studyAbroad.js`)
1. Stage `STUDY_DESTINATION` — send list of 9 destinations (Canada, UK, USA, Germany, Australia, Ireland, NZ, Brazil, Other)
2. User selects → Stage `STUDY_LEVEL` — send level options (Undergraduate, Postgraduate, Diploma)
3. User selects → Stage `STUDY_TIMELINE` — send timeline options (0–3 months, 3–6 months, 6–12 months)
4. User selects → Set stage `FREE_TEXT_AI`, save destination/level/timeline, hand to AI
5. AI qualifies and eventually triggers ₦10,000 payment

#### Visa Processing (`src/flows/visaProcessing.js`)
1. Stage `VISA_TYPE` — send visa type options (Study, Tourist, Business, Work, Family)
2. User selects → Stage `VISA_DESTINATION` — send destination options (UK, Canada, USA, Schengen, Australia, UAE, Other)
3. User selects → Set stage `FREE_TEXT_AI`, hand to AI
4. AI qualifies and eventually triggers ₦10,000 payment

#### Test Prep (`src/flows/testPrep.js`)
1. Stage `TEST_EXAM_SELECT` — send list of 10 exams (IELTS, TOEFL, GRE, GMAT, SAT, PTE, Duolingo, German, French, Japanese)
2. User selects exam → Stage `TEST_BATCH_SELECT` — send batch options (Morning, Evening, Weekend, Intensive, Online) with duration and price
3. User selects batch → **Immediate payment ask** (skips AI). Payment is the exam class fee (e.g. ₦85,000 for IELTS), not the ₦10,000 registration fee.

#### Loans & Scholarships (`src/flows/loanScholarship.js`)
1. Stage `LOAN_COUNTRY` — send region options (Europe/UK Masters, Canada Masters, Scholarships)
2. User selects → Send loan details message, set stage `FREE_TEXT_AI`, hand to AI
3. AI qualifies (age check for Canada/USA restriction, program eligibility), then triggers ₦10,000 payment

#### Travel Services (`src/flows/travelServices.js`)
1. Stage `TRAVEL_TYPE` — send service options (Flights, Hotels, Insurance)
2. User selects → Send service details, then move to name collection → ₦10,000 payment

#### Pilgrimage (`src/flows/pilgrimage.js`)
1. Stage `PILGRIMAGE_TYPE` — send package options (Hajj, Umrah, Tours)
2. User selects → Send package details with pricing, move to name collection → ₦10,000 payment

#### Proof of Funds (`src/flows/proofOfFunds.js`)
1. Stage `POF_ADVISORY` — send PoF requirements by country (Canada CAD 10k+, UK £1,334/month, Germany €11,208, etc.)
2. Offer "Get Expert Help" button → triggers profile consultation

#### Free / Profile Consultation (`src/flows/profileConsultation.js`)
This is the deepest funnel path, with four sub-stages:

1. **`PROFILE_COLLECTING`** — AI asks open questions about the user's goals and collects: motivation, destination, program level, timeline, urgency, budget, work experience, passport status, English background, fears. AI works conversationally — no checklist. When it has a genuine picture (goal + destination/service + at least 2 of: program, timeline, budget, docs), it outputs `[[PROFILE_READY]]` to signal stage transition.

2. **`PROFILE_SUMMARY`** — AI reads back the collected profile in conversational prose. User confirms or corrects.

3. **`PROFILE_ROADMAP`** — AI gives one personalized insight (realistic route, key requirement, cost signal). Lead score is computed. Stage transitions toward payment.

4. **Payment trigger** — ₦10,000 registration fee.

---

### Step 5 — Payment Flow (`src/flows/payment.js`)

When `[[SEND_PAYMENT_LINK]]` is triggered (by AI or by an explicit button):

1. Call `initializePayment()` → Paystack API
2. Paystack returns `authorization_url` and a unique `reference`
3. Save reference + URL to Redis state, insert pending record to Supabase `payments` table, update lead `payment_status = 'pending'`
4. Send user: "Here is your secure payment link: [url]. Pay with card, bank transfer, USSD — whatever works for you."
5. Stage → `PAYMENT_AWAITING`

**Payment confirmation (Paystack webhook):**

1. `POST /payment/webhook` — Paystack sends event after successful payment
2. HMAC signature verified
3. `onPaymentConfirmed()` fires:
   - Update lead: `payment_status = 'paid'`, `conversation_stage = 'registered'`
   - Send client confirmation: "Payment confirmed. You are in. Book your session: [Calendly link]"
   - Notify owner on WhatsApp: "💰 Payment Confirmed — Name, Phone, Amount, Reference"
   - Notify the right staff member via `notificationService` with full lead profile
   - Clear Redis state → `FREE_TEXT_AI`

---

### Step 6 — Post-Payment

After payment, the customer receives a Calendly link to book a session with the specialist. The staff member (routed by service) receives a WhatsApp notification with the lead's name, phone, service, destination, program level, and notes.

Staff routing:
- Study Abroad / Loans / PoF → admissions@applyboardafrica.com
- Visa → visa@applyboardafrica.com
- Test Prep → support@applyboardafrica.com
- Travel / Insurance / Pilgrimage → info@applyboardafrica.com

---

### Escalation Path (`src/flows/escalation.js`)

Any time the user says "speak to agent", "real person", "call me":
1. Set stage → `ESCALATED`
2. Update lead: `is_escalated = true`
3. Notify the on-call agent with the user's phone, name, service, and current stage
4. Send user: "Flagging for a team member. Usually within 30 minutes during business hours."
5. Subsequent messages: AI holds the conversation warmly — no payment triggers, no pressure.

---

## AI System (`src/services/ai.js`)

**Model selection:**
- Primary: OpenAI GPT (if `OPENAI_API_KEY` is set and has credits)
- Fallback: Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) via Anthropic SDK
- On Claude 529 overload: retry up to 2 times with 2-second backoff

**Context sent to AI per message:**
- Session data from Redis: name, destination, program, service, timeline, exam, age, budget, fears, IELTS situation
- Persistent context from Supabase: name, destination, service, program, payment status, notes
- Chat history: last 16 messages from Redis; if Redis expired, seeds from Supabase `conversations`
- Today's date (Lagos timezone)
- Platform note: WhatsApp = plain text only, no markdown; Telegram = markdown OK
- Optional `systemNote` injected per-turn for special situations (returning user, payment awaiting, escalated, profile stages)

**Payment tag protocol:**
The AI outputs `[[SEND_PAYMENT_LINK]]` on its own line when the user confirms they want to pay. This tag is stripped from the visible message — the handler detects it and generates the Paystack link automatically. The AI never narrates "I'm sending you a link."

---

## Scheduled Jobs (`src/services/scheduler.js`)

Four automated jobs run on cron (all times WAT):

| Job | Schedule | What it does |
|---|---|---|
| Pending payment follow-ups | 10am, 6pm daily | Re-engages leads who received a payment link but haven't paid. Cadence: Day 1, Day 3, Day 7. Max 3 attempts per lead. Message gets shorter each follow-up. |
| Pre-payment re-engagement | 9am, 7pm daily | Re-engages leads who dropped off before even getting a payment link (12–72hr window). No payment mention — just a warm, specific question. |
| Daily morning message | 8am daily | AI-generated insight posted to Telegram group (900+ members). Topic rotated from 25+ Nigeria-specific categories. Ends with bot link. |
| Weekly poll | Monday 9am | AI-generated poll posted to Telegram group. Question is specific, slightly provocative, designed to spark comments. |

**WhatsApp 24h window enforcement:** WhatsApp blocks free-form outbound messages outside a 24-hour window from the user's last message. The scheduler checks for this before sending follow-ups on WhatsApp — if the window is closed, it stamps `last_interaction` and skips (the lead will re-queue when they message again).

The Telegram group scheduler also handles new member welcome messages — AI generates a personalised 3-sentence welcome for each person who joins.

---

## Data Model (Supabase)

**`leads` table** — one row per phone number, continuously updated:
- `phone_number`, `name`, `destination_country`, `service_interested`
- `program_level`, `timeline`, `exam`, `loan_interest`, `age`, `budget_range`
- `payment_status` (null / pending / paid), `payment_reference`, `payment_method`
- `conversation_stage` (qualified / registered / escalated)
- `lead_score`, `is_escalated`, `followup_count`
- `notes`, `last_interaction`

**`conversations` table** — every message, inbound and outbound:
- `lead_id`, `phone_number`, `direction` (inbound/outbound)
- `message_type` (text/button/image/audio), `content` (4096 char max)
- `sent_by` (null = user, 'bot' = system), `wa_message_id`, `created_at`

**`payments` table** — one row per Paystack transaction:
- `phone_number`, `reference`, `amount`, `method`, `service_desc`
- `status` (pending/success), `paystack_data` (full webhook JSON)
- `created_at`, `updated_at`

---

## State Machine

27 conversation stages managed in Redis (24hr TTL):

```
GREETING → FREE_TEXT_AI (default AI conversation mode)

MAIN_MENU (structured service selection)

Study path:   STUDY_DESTINATION → STUDY_LEVEL → STUDY_TIMELINE → FREE_TEXT_AI
Visa path:    VISA_TYPE → VISA_DESTINATION → FREE_TEXT_AI
Test path:    TEST_EXAM_SELECT → TEST_BATCH_SELECT → PAYMENT_AWAITING
Loan path:    LOAN_COUNTRY → FREE_TEXT_AI
Travel path:  TRAVEL_TYPE → CONSULT_NAME → FREE_TEXT_AI
Pilgrim path: PILGRIMAGE_TYPE → CONSULT_NAME → FREE_TEXT_AI
PoF path:     POF_ADVISORY → FREE_TEXT_AI

Profile path: PROFILE_COLLECTING → PROFILE_SUMMARY → PROFILE_ROADMAP → PAYMENT_INVOICE

Payment:      PAYMENT_AWAITING → PAYMENT_CONFIRMED → FREE_TEXT_AI

Special:      ESCALATED (human takeover — no payment triggers)
              CONSULT_NAME, CONSULT_TIME, CONSULT_CONFIRMED (legacy consultation)
```

---

## Guardrails & Safety Rules

| Rule | Why |
|---|---|
| Bank account intercept (hardcoded bypass of AI) | AI hallucinated a GTBank account number in production |
| Payment blocked if no context collected | Prevents charging users who haven't been qualified |
| Payment blocked if lead already paid | Prevents double-charging |
| Payment blocked for test_prep without confirmed exam | Test prep uses exam-specific fees, not the ₦10,000 registration |
| Duplicate Paystack link prevention | If a link was generated this session, resend stored URL — no new Paystack charge |
| Duplicate message deduplication | Meta delivers the same webhook twice — silently drop the second |
| Per-user processing lock | Prevents race conditions when messages arrive quickly |
| WhatsApp 24h window check | Respect Meta's messaging window rule for outbound scheduler messages |
| Markdown stripping for WhatsApp | AI sometimes outputs markdown symbols; these are stripped before sending |

---

## Conversion Logic (How the Bot Decides to Ask for Payment)

The AI is instructed to collect three signals before making the payment ask:
1. Destination or service interest (e.g. Canada, IELTS, loan)
2. Program or goal (e.g. Masters, tourist visa, coaching class)
3. At least one personal detail (timeline, budget, academic background, a past visa refusal)

Once all three are present, the AI makes one clear, natural ask: "Sounds like we have a real picture here. There's a ₦10,000 registration that gets your case properly matched and moving — want me to sort that now?"

If the user confirms → `[[SEND_PAYMENT_LINK]]` → Paystack link sent immediately.
If the user deflects or objects → AI answers the concern, waits for the next natural opening.
If the user says no → "No stress, I'll be here when you're ready." AI does not ask again that session.

The system also runs a parallel signal detection pass on every text message, saving destination, service, exam, age, and budget signals to Supabase and Redis without waiting for the AI.
