# ApplyBoard Africa Bot — System Map

Complete end-to-end reference for the WhatsApp + Telegram conversational bot.
Last rebuilt: June 2026.

---

## 1. Infrastructure

```
Express (Node.js)
├── Middleware: helmet, CORS, morgan, cookie-parser
├── Body parsing: raw for /webhook + /payment/webhook; json elsewhere
├── Port: $PORT (default 3000)
└── Starts on boot:
    ├── Config database (Supabase)
    ├── Config redis (ioredis)
    ├── Registers Telegram webhook (if TELEGRAM_BOT_TOKEN + BASE_URL set)
    └── startScheduler()
```

**Required env on startup** (process exits if any missing):
`WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WEBHOOK_VERIFY_TOKEN`,
`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `REDIS_URL`, `ANTHROPIC_API_KEY`,
`PAYSTACK_SECRET_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`

**Optional env** (features degrade gracefully):
`OPENAI_API_KEY` (GPT fallback), `TELEGRAM_BOT_TOKEN`, `TELEGRAM_GROUP_ID`,
`TELEGRAM_BOT_LINK`, `MY_PERSONAL_TELEGRAM_ID`, `BASE_URL`,
`BUSINESS_PHONE`, `AGENT_WHATSAPP`,
`STAFF_ADMISSIONS`, `STAFF_VISA`, `STAFF_SUPPORT`, `STAFF_FINANCE`,
`STAFF_INFO`, `STAFF_PARTNERSHIPS`, `STAFF_COMPLAINTS`

---

## 2. HTTP Routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Status check |
| GET | `/webhook` | WhatsApp webhook verification (hub.challenge) |
| POST | `/webhook` | Incoming WhatsApp messages |
| POST | `/telegram/webhook` | Incoming Telegram updates |
| GET | `/payment/callback` | Browser redirect after Paystack checkout |
| POST | `/payment/webhook` | Paystack charge.success webhook |
| GET | `/admin` | Admin dashboard SPA |
| POST | `/admin/auth/token` | Login (email/password) |
| GET | `/admin/api/*` | CRM data (JWT-gated) |
| GET | `/test/morning` | Manual trigger: morning message |
| GET | `/test/poll` | Manual trigger: weekly poll |
| GET | `/test/followup-pending` | Manual trigger: pending follow-ups |
| GET | `/test/followup-prepayment` | Manual trigger: pre-payment re-engagement |

---

## 3. Inbound Message Flow

### 3a. WhatsApp

```
POST /webhook
  → res.sendStatus(200) immediately (WhatsApp requires ack < 5s)
  → JSON.parse(req.body)
  → body.entry[0].changes[0].value  →  handleIncoming(entry)
```

**`handleIncoming` (messageHandler.js)**

1. Extract `from` (phone), `msgId`, `msgType` from entry
2. `isMessageSeen(msgId)` — Redis NX dedup; abort if already processed
3. In parallel:
   - `isRateLimited(from)` → Redis INCR/EXPIRE, 30 msg/min limit
   - `getState(from)` → Redis state (TTL 24h)
   - `markRead(msgId)` → fire-and-forget WhatsApp read receipt
4. If rate-limited → send rate-limit message, return
5. Background (non-blocking): `upsertLead(from, name)` → `logMessage(inbound)`
6. Route by `msgType`:
   - `interactive` → `handleButton(from, btnId, state, message)`
   - `text` → `handleText(from, text, state, message)`
   - anything else → `handleMedia(from, msgType, message, state)`

### 3b. Telegram

```
POST /telegram/webhook
  → handleTelegram(req.body)
```

**`handleTelegram` (telegramHandler.js)**

| Update type | Handling |
|-------------|---------|
| `callback_query` | Answer callback, resolve button ID, route to buttonHandler |
| `new_chat_members` | `sendWelcomeMessage()` per new member (scheduler.js) |
| Group message with @mention | Strip mention, run rate limit, AI response |
| Group message without @mention | Ignore |
| Private DM | Rate limit, route same as WhatsApp text/button |

Phone ID prefix `tg_<chat_id>` distinguishes Telegram users throughout the system.

---

## 4. State Machine

State stored in Redis as `{ stage, data }` with 24h TTL. Key: `state:<phone>`.

### Stages

| Stage | Description |
|-------|-------------|
| `GREETING` | Default / session expired — first contact |
| `FREE_TEXT_AI` | Open AI conversation (main operating stage) |
| `MAIN_MENU` | User is browsing the menu |
| `STUDY_DEST` | Study abroad: selecting destination |
| `STUDY_LEVEL` | Study abroad: selecting program level |
| `STUDY_TIMELINE` | Study abroad: selecting timeline |
| `VISA_TYPE` | Visa: selecting visa type |
| `VISA_DEST` | Visa: selecting destination |
| `TEST_EXAM` | Test prep: selecting exam |
| `TEST_BATCH` | Test prep: selecting batch |
| `LOAN_REGION` | Loan: selecting region |
| `TRAVEL_SERVICE` | Travel: selecting service |
| `CONSULT_NAME` | Collecting user name before consultation |
| `PAYMENT_AWAITING` | Payment link sent, waiting for payment |
| `ESCALATED` | Flagged for human takeover |

### State Data Fields (accumulated across flows)

`name`, `destination`, `destination_country`, `service_interested`,
`program_level`, `timeline`, `exam`, `loan_region`, `loan_interest`,
`age`, `fears`, `budget`, `english_medium`, `waec_english`, `ielts_score`,
`ielts_fear`, `payment_amount`, `payment_ref`, `payment_url`,
`chatHistory` (last 16 messages), `lastMenu` (numeric-reply map)

---

## 5. Text Handler Priority Chain

**`handleText` (textHandler.js)** — 7-step waterfall, first match wins:

```
1. Numeric reply
   └── /^\d+$/ AND state.data.lastMenu exists
       → translate number to button ID → handleButton()

2. Name collection
   └── state.stage === CONSULT_NAME
       → startConsultation(from, state, name)

3. Hard triggers (keyword intercepts — AI never sees these)
   ├── "menu" / "home" / "restart"        → sendMainMenu()
   ├── "i paid" / "payment done" / etc    → fixed payment acknowledgement
   ├── "speak to agent" / "call me" / etc → escalate()
   └── "account number" / "gtbank" / etc  → fixed Paystack response (NEVER touches AI)
       ↑ Bank intercept exists because AI hallucinated a GTBank account in production

4. New / returning user
   ├── state.stage === GREETING (or no stage)
   ├── If Supabase has profile → restore context → FREE_TEXT_AI → AI with returning-user note
   └── If genuinely new → sendGreeting() → FREE_TEXT_AI

5. Payment awaiting  (state.stage === PAYMENT_AWAITING)
   ├── If already paid (Supabase) → clear state → FREE_TEXT_AI → AI
   ├── If "send the link" / "pay now" exact phrases → handlePayment(PAY_NOW)
   └── Everything else → AI with payment-objection context + [[SEND_PAYMENT_LINK]] detection
       ├── Tag present → resend existing URL OR generate new link
       └── Narration fallback pattern: /send(ing)? you the link|link is on its way/i

6. Escalated  (state.stage === ESCALATED)
   └── AI with instruction: hold warmly, no payment triggers, await human

7. Default AI path  (FREE_TEXT_AI or any unmatched stage)
   ├── tryLock(from) — per-user mutex prevents concurrent AI calls
   ├── In parallel: detectAndSaveSignals() + askAI()
   ├── stripWhatsAppMarkdown() for WhatsApp (not Telegram)
   ├── [[SEND_PAYMENT_LINK]] tag detection
   │   ├── No qualifying context → GUARDRAIL: block, log
   │   ├── payment_url exists → resend stored URL (dedup)
   │   └── No URL → getPaymentAmount(state) → handlePayment(REGISTRATION)
   └── releaseLock(from)
```

### Signal Detection (`detectAndSaveSignals`)

Runs in parallel with every AI call (stage 7). Passively extracts from free text:

| Signal | How detected | Saved to |
|--------|-------------|---------|
| Destination country | 25 keyword map (canada, uk, germany, usa, …) | `leads.destination_country` + state |
| Service interest | Study/uni/masters/visa/embassy/loan/ielts keywords | `leads.service_interested` + state |
| Exam type | IELTS/TOEFL/GRE/GMAT/SAT/PTE/Duolingo/German/French/Japanese | `leads.exam` + state |
| Age | Requires age context word ("I am", "years old", "born in") + 18–60 range | `leads.age` + state note if >32 |
| Budget sensitivity | "no money", "can't afford", "expensive" | `leads.budget_range = budget_sensitive` |

Negation guard: phrases like "no loan", "don't need a visa" suppress matching service signals.

### Payment Amount Resolution (`getPaymentAmount`)

1. Check `state.data.exam` → exam fee map
2. Check `state.data.service` → exam fee map
3. Scan chatHistory for exam mentions
4. Default: ₦10,000 (registration fee)

Exam fee map: IELTS ₦85k | TOEFL ₦75k | GRE ₦90k | GMAT ₦95k | SAT ₦80k | PTE ₦70k | Duolingo ₦45k | German ₦120k | French ₦100k | Japanese ₦110k

---

## 6. Button Handler

**`handleButton` (buttonHandler.js)**

Master ROUTE_MAP maps ~120 button IDs to handler functions:

| Button group | IDs | Handler |
|-------------|-----|---------|
| Navigation | MENU_MAIN, MENU_EXPLORE, MENU_CONSULT, BACK | sendMainMenu / startConsultation |
| Services | SVC_STUDY, SVC_VISA, SVC_LOAN, SVC_TEST, SVC_TRAVEL, SVC_INSURE, SVC_HAJJ, SVC_POF, SVC_CONSULT | Each flow's START |
| Study destinations | SA_CANADA … SA_OTHER | handleStudyAbroad(btnId) |
| Study program levels | SL_UG, SL_PG, SL_DIPLOMA | handleStudyAbroad(btnId) |
| Study timelines | ST_NOW, ST_MID, ST_LATER | handleStudyAbroad(btnId) |
| Visa types | VT_STUDY, VT_TOURIST, VT_BUSINESS, VT_WORK, VT_FAMILY | handleVisa(btnId) |
| Visa destinations | UK_VISA, CA_VISA, US_VISA, SCH_VISA, AU_VISA, UAE_VISA, OTH_VISA | handleVisa(btnId) |
| Test prep exams | TP_IELTS … TP_JAPANESE (10 exams) | handleTestPrep(btnId) |
| Test batches | BATCH_MORNING, _EVENING, _WEEKEND, _INTENSIVE, _ONLINE | handleTestPrep(btnId) |
| Loans | LOAN_EUR, LOAN_UK, LOAN_CA, LOAN_SCH | handleLoan(btnId) |
| Travel | TV_FLIGHTS, TV_HOTELS, TV_INSURANCE | handleTravel(btnId) |
| Pilgrimage | PG_HAJJ, PG_UMRAH, PG_TOURS, TOUR_DUBAI, TOUR_TURKEY, TOUR_EUROPE | handlePilgrimage(btnId) |
| Consultation times | CT_MORNING, CT_AFTERNOON, CT_EVENING | startConsultation(btnId) |
| Payment | PAY_NOW, PAY_BANK, PAY_INSTALL, PAY_CONSULT | handlePayment / startConsultation |
| Escalation | ESCALATE | escalate() |

**Fallback**: unknown button ID → route by stage prefix (STUDY_, VISA_, TEST_, etc.) → final fallback: sendMainMenu.

---

## 7. Service Flows

All flows follow the pattern: receive `(from, action, state)` → read state.data → send WhatsApp/Telegram message → `setState(stage, data)`.

### Study Abroad (4 steps)
1. `START` → destination list (8 countries + other) → stage `STUDY_DEST`
2. Country selected → program level list (UG/PG/Diploma) → `STUDY_LEVEL`
3. Level selected → timeline list (0–3m / 3–6m / 6–12m) → `STUDY_TIMELINE`
4. Timeline selected → AI engagement with destination/level/timeline context → `FREE_TEXT_AI`

### Visa Processing (3 steps)
1. `START` → visa type list (Study/Tourist/Business/Work/Family) → `VISA_TYPE`
2. Type selected → destination list (7 options) → `VISA_DEST`
3. Destination selected → AI engagement with visa context → `FREE_TEXT_AI`

### Test Prep (3 steps)
1. `START` → exam list (10 options in 3 sections) → `TEST_EXAM`
2. Exam selected → batch options (morning/evening/weekend/intensive/online with times + fees) → `TEST_BATCH`
3. Batch selected → handlePayment with exam fee → `PAYMENT_AWAITING`

### Loan / Scholarship (button-driven)
- `START` → 4 buttons: Europe/UK Loan, Canada Loan, Scholarship, Back
- Each option → AI engagement with loan-specific context → `FREE_TEXT_AI`
- `LOAN_CA` → two sub-options (vocational vs. standard masters)

### Travel Services
- `START` → 3 options: flights, hotels, insurance
- Each → brief info + `startConsultation()`

### Pilgrimage (Hajj/Umrah/Tours)
- `START` → 3 options: Hajj, Umrah, Tours
- Hajj: ₦2.5M–₦6M packages → consultation
- Umrah: from ₦2.5M → consultation
- Tours sub-options: Dubai, Turkey, Europe → consultation

### Proof of Funds
- `START` → PoF requirements by country (Canada CAD10k, UK £1,334/mo, Germany €11,208, Schengen €50–100/day, Australia AUD20k)
- Offers expert guidance → consultation

### Consultation
- `startConsultation()` → check if name known → if not: ask name (CONSULT_NAME)
- Name received → confirm booking → `notifyStaff()` → `FREE_TEXT_AI`

### Escalation
- `escalate()` → setState ESCALATED → `notifyAgent()` with full client brief
- Subsequent messages handled by AI in "hold warmly" mode until human takes over

---

## 8. Payment Flow

```
Trigger sources:
  A. Button: PAY_NOW / PAY_BANK / PAY_INSTALL from test prep or payment menu
  B. AI tag: [[SEND_PAYMENT_LINK]] in textHandler (stages 5 and 7)
  C. Text trigger: "send the link" exact phrases in PAYMENT_AWAITING

handlePayment(from, action, state)  [payment.js]
  ├── PAY_BANK     → send Paystack bank-transfer instructions
  ├── PAY_INSTALL  → send installment plan info → startConsultation
  └── PAY_NOW / REGISTRATION
        → initializePayment(from, amount, email, description)
              ├── Paystack /transaction/initialize
              ├── Save reference to state.data.payment_ref + payment_url
              ├── Update lead: payment_status=pending, payment_reference
              └── Return {url, reference}
        → sendText(from, link message with card/bank/USSD note)
        → setState(PAYMENT_AWAITING)
```

**Payment confirmation (two paths):**

1. **Paystack webhook** (`POST /payment/webhook`)
   - `verifySignature()` — HMAC-SHA512 with PAYSTACK_SECRET_KEY
   - Event `charge.success` → `onPaymentConfirmed(phone, reference, amount, channel)`

2. **User self-reports** ("i paid") → textHandler hard trigger → manual acknowledgement
   - `verifyPayment(reference)` is available as a fallback check

**`onPaymentConfirmed()`:**
- Update `leads`: payment_status=paid, payment_method, conversation_stage=registered
- Update `payments` table: status=success, paystack_data
- `clearState(from)` → `setState(FREE_TEXT_AI)`
- Send WhatsApp confirmation to client
- `notifyStaff(from, 'payment', amount, reference)` → staff routed by service
- `notifyOwner()` → personal Telegram message to MY_PERSONAL_TELEGRAM_ID

---

## 9. AI Layer

**Primary model:** `claude-haiku-4-5-20251001` via `@anthropic-ai/sdk`
**Fallback model:** `gpt-4o-mini` via OpenAI API (only if `OPENAI_API_KEY` set and Claude fails)
**Max tokens:** 800 (raised from 500 to prevent truncation on complex answers)
**Retry:** up to 3 attempts on HTTP 529 overloaded, 2s delay between retries

### System Prompt — "Ade"

Identity: Nigerian relocation strategist, warm friend, not a bot.

Key behavioral rules (non-negotiable):
- 2–3 sentences default, never more than 4
- No lists, no bullets, no asterisks, no markdown (WhatsApp is plain text only)
- No filler phrases ("That's great!", "Absolutely!", "Great question!")
- Max 1 emoji per message
- Never ask two questions at once
- Never admit being AI
- Bank accounts: absolute ban — never invent, never provide, always redirect to Paystack bank transfer
- Payment tag `[[SEND_PAYMENT_LINK]]`: only when user genuinely confirms intent to pay, not when asking about price

IELTS intelligence: Never say "you need IELTS." Always explore MOI waiver alternatives first. Profile academic background before presenting IELTS as required.

Micro-commitment strategy: collect small yeses (destination → level → timeline → budget → fear) before asking for ₦10,000 registration. Link comes only after affirmative answer to the bigger ask.

Fee negotiation: ₦10,000 is fixed. Acknowledge warmly, hold the price, offer to "hold their spot."

June 2026 campaign context: Facebook ad campaign running (low tuition, loans/scholarships, IELTS/PTE coaching). Warm leads. Coaching class schedule for June 2026 embedded in prompt.

Price block: all prices pulled from `constants.js` at server start — test prep fees, official exam fees, membership card, coaching classes, work route packages, loan fees. AI never invents prices.

Prompt caching: system prompt passed with `cache_control: { type: 'ephemeral' }`.

### Context Assembly (`askAI`)

1. Session context from `state.data` (name, destination, program_level, service, timeline, exam, loan_region, age, fears, budget, english_medium, waec_english, ielts_score, ielts_fear)
2. Persistent context from `loadPersistentContext()` → Supabase lead record
3. Conversation history from `buildHistory()`:
   - Primary: `state.data.chatHistory` (last 16 messages, Redis)
   - Fallback: last 10 messages from Supabase `conversations` table (if Redis expired)
4. Platform note appended: WhatsApp = "plain text only", Telegram = "markdown renders"
5. Today's date in WAT timezone
6. Optional `systemNote` per call site (e.g. payment-objection context, returning-user instruction)

### History Management (`saveToHistory`)

- After every AI reply: re-fetch fresh state (captures stage changes from the flow this turn)
- Append user + assistant messages; trim to last 16
- Strip `[[SEND_PAYMENT_LINK]]` tag before saving (AI must never see its own internal tag in history)

---

## 10. Unified Messenger

**`messenger.js`** abstracts WhatsApp vs Telegram:

```
sendText(phone, text)
sendButtons(phone, body, buttons)
sendList(phone, header, body, sections)
sendDocument(phone, url, filename, caption)
sendImage(phone, url, caption)
sendTextAs(phone, text, sender)  ← used by scheduler (avoids dedup)
```

Routing:
- `phone.startsWith('tg_')` → `telegram.js` client
- Otherwise → `whatsapp.js` client

Telegram group override: `setReplyChat(chatId)` — for group @mentions, responses go to the group, not the bot's DM.

All outbound sends call `logMessage(phone, 'outbound', ...)` for conversation history.

---

## 11. Scheduler (Cron Jobs)

All cron jobs run in WAT (Africa/Lagos timezone) via `node-cron`.

| Job | Schedule | Description |
|-----|----------|-------------|
| Pending follow-ups | 10am + 6pm daily | Re-engage leads with `payment_status=pending` (day 1/3/7 per lead) |
| Pre-payment re-engagement | 9am + 7pm daily | Re-engage leads who dropped off before getting a payment link (12–72h window) |
| Morning message | 8am daily | AI-generated fact/insight posted to Telegram group |
| Weekly poll | Monday 9am | AI-generated poll posted to Telegram group (non-anonymous, single answer) |
| Welcome new member | On join event | AI-generated welcome with bot link (triggered from telegramHandler) |

Group jobs disabled if `TELEGRAM_GROUP_ID` not set.

### Follow-up Cadence (`sendFollowUps`)

- Target: `payment_status = pending` AND `last_interaction >= 22h ago`
- Per-lead gate: followup_count 0 → 22h gap | 1 → 48h gap | 2 → 96h gap | max 3
- AI generates each message from lead profile + last 4 conversation messages
- Progressive brevity: follow-up 1 = 2–3 sentences | 2 = 1–2 sentences | 3 = 1 sentence
- After send: increment `followup_count`, stamp `last_interaction` (creates gap before next)

### Pre-payment Re-engagement (`sendPrePaymentFollowUps`)

- Target: `payment_status IS NULL` AND `last_interaction` between 12–72h ago
- Exclude: `conversation_stage = registered/escalated` AND leads with no engagement signal
- Max 25 per run, 1.5s delay between sends
- AI reads last 6 conversation messages; does NOT mention payment, registration, or fees
- After send: stamp `last_interaction` only (12h grace before re-selection)

### Content Generation

Morning message: Claude generates a specific, conversion-focused fact relevant to Nigerian study-abroad aspirants. One of 25 topic categories, randomly selected. Under 5 sentences. Ends with bot link.

Weekly poll: Claude generates JSON `{ question, options[4] }`. Validated against Telegram 255-char/100-char limits. Fallback hardcoded if parse fails.

Welcome message: Claude generates a personalized 3-sentence welcome for the new member by name. Not "Welcome to the group" — more original opener required.

---

## 12. CRM and Lead Service

### Lead Upsert (`upsertLead`)

Called in background on every inbound message.
- If phone not in `leads` table → INSERT + `notifyOwner()` (new lead alert)
- If exists → UPDATE `name`, `last_interaction`

### Lead Updates (`updateLead`)

Called by:
- `detectAndSaveSignals()` (destination, service, exam, age, budget)
- `onPaymentConfirmed()` (payment_status, payment_method)
- `startConsultation()` (name, consultation_booked)
- `escalate()` (is_escalated)
- `sendFollowUps()` (followup_count, last_interaction)

### Conversation Logging (`logMessage`)

Every inbound and outbound message → `conversations` table.
Used for:
- AI history fallback when Redis expires
- Follow-up generation context
- Admin dashboard

---

## 13. Notification Service

### `notifyStaff(from, event, ...args)` (notificationService.js)

Builds a formatted brief (client name, phone, service, destination, amount) and routes to the correct staff WhatsApp number based on `event`:

| Event | Routed to |
|-------|----------|
| `study` / `admission` | STAFF_ADMISSIONS |
| `visa` | STAFF_VISA |
| `support` | STAFF_SUPPORT |
| `payment` | STAFF_FINANCE |
| `info` | STAFF_INFO |
| `partnerships` | STAFF_PARTNERSHIPS |
| `complaints` | STAFF_COMPLAINTS |

### `notifyAgent(from, reason)` (notificationService.js)

Sends escalation alert to `AGENT_WHATSAPP` with full client context.

### `notifyOwner(message)` (notifyOwner.js)

Personal Telegram message to `MY_PERSONAL_TELEGRAM_ID`. Used for new lead alerts and payment confirmations.

---

## 14. Admin Dashboard

Single-page app served at `/admin`. Login via JWT (12h expiry) or HTTP Basic Auth.

### Authentication (`dashboardAuth.js`)

- `POST /admin/auth/token`: validates email + bcrypt password against `admin_users` table
- `verifyToken`: JWT middleware on all `/admin/api/*` routes
- Department-based access: email prefix maps to department → filters data by service type
- Superadmin: sees everything

Department map:
`admissions` → study_abroad | `visa` → visa | `support` → test_prep |
`finance` → all paid | `info` → travel/pilgrimage | `partnerships` → loans

### API Endpoints (`dashboardRoutes.js`)

All require JWT. Department filter applied unless role = superadmin.

- `GET /admin/api/stats` — lead counts, payment totals, service breakdown
- `GET /admin/api/leads` — paginated lead list with filters
- `GET /admin/api/conversations/:phone` — full conversation history
- `POST /admin/api/broadcast` — trigger broadcast to filtered segment
- `PATCH /admin/api/leads/:phone` — update lead fields

---

## 15. Broadcast Service

**`sendBroadcast(broadcastId, filters, messageTemplate)`** (broadcast.js)

- Query `leads` filtered by: service, country, payment status, consultation status
- Send personalized message with 1.1s delay between each (WhatsApp rate limit compliance)
- Update `broadcasts` record with sent_count, failed_count, total_targets, status

---

## 16. Database Schema

### `leads`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| phone_number | text | Unique, includes `tg_` prefix for Telegram |
| name | text | |
| source | text | e.g. "whatsapp", "telegram" |
| service_interested | text | study_abroad, visa, test_prep, loan, travel, pilgrimage |
| destination_country | text | |
| program_level | text | undergrad, postgraduate, diploma |
| timeline | text | |
| loan_interest | boolean | |
| is_escalated | boolean | |
| consultation_booked | boolean | |
| payment_status | text | null, pending, paid |
| payment_reference | text | APB-{timestamp}-{random} |
| payment_method | text | card, bank_transfer, ussd |
| conversation_stage | text | mirrors STAGES constant |
| agent_assigned | text | |
| followup_count | integer | 0–3, used by pending follow-up scheduler |
| notes | text | age warning, flags |
| last_interaction | timestamptz | stamped on every message + follow-up send |
| created_at | timestamptz | |

### `conversations`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| lead_id | uuid | FK → leads |
| phone_number | text | Denormalized for fast query |
| direction | text | inbound / outbound |
| message_type | text | text, interactive, image, audio, etc. |
| content | text | Message body |
| sent_by | text | user / bot / scheduler |
| wa_message_id | text | WhatsApp message ID (dedup) |
| created_at | timestamptz | |

### `payments`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| phone_number | text | |
| reference | text | Unique Paystack reference |
| amount | integer | In kobo (Paystack) or naira |
| method | text | card, bank_transfer, ussd |
| service_desc | text | |
| status | text | pending, success, failed |
| paystack_data | jsonb | Full Paystack event payload |
| created_at | timestamptz | |

### `broadcasts`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| sent_count | integer | |
| failed_count | integer | |
| total_targets | integer | |
| status | text | pending, running, complete, failed |
| sent_at | timestamptz | |

### `admin_users`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| email | text | Used as login username |
| password | text | bcrypt hash |
| name | text | |
| role | text | admin, superadmin |
| department | text | admissions, visa, support, finance, info, partnerships, complaints |
| is_active | boolean | |
| last_login | timestamptz | |

---

## 17. Rate Limiting and Deduplication

### Rate Limiter (Redis)

Key: `rl:<phone>` — INCR + EXPIRE 60s (atomic). Max 30 messages per minute. Returns fixed message if exceeded.

### Message Deduplication (Redis)

Key: `seen:<msgId>` — SET NX EX 86400. Returns true if already seen. Prevents double-processing when WhatsApp resends the same webhook.

### Payment Link Deduplication

`state.data.payment_url` is persisted in Redis and Supabase. Before generating a new Paystack link, both textHandler paths (FREE_TEXT_AI and PAYMENT_AWAITING) check for an existing URL. If present, resend the stored URL instead of calling Paystack again.

### AI Concurrency Lock (Redis)

Key: `lock:<phone>` — SET NX EX 30. Prevents two simultaneous AI calls for the same user (e.g. rapid double-send). Returns "still working on your last message" if lock held.

---

## 18. Key Guardrails and Safety Rules

| Rule | Where enforced | Why |
|------|---------------|-----|
| Bank account hardcode | textHandler hard trigger (before AI) | AI hallucinated a GTBank account number in production |
| Payment link only after qualifying context | textHandler stage 7 GUARDRAIL | Prevents charging users before any needs assessment |
| Bank account ban in system prompt | SYSTEM_PROMPT absolute rule | Belt-and-suspenders: even if hard trigger misses, AI must refuse |
| `[[SEND_PAYMENT_LINK]]` stripped from history | `saveToHistory()` | AI must never see its own internal machine tags as conversation content |
| Stage re-fetched before saving history | `saveToHistory()` | Prevents stale stage snapshot overwriting the stage the flow just set |
| Paystack signature verification | `handlePaystackWebhook()` | HMAC-SHA512 — rejects forged payment confirmations |
| WhatsApp markdown stripped | `stripWhatsAppMarkdown()` | AI sometimes outputs `*bold*` / `_italic_` which render as literal chars on WhatsApp |
| `res.sendStatus(200)` before processing | Both webhook handlers | WhatsApp and Telegram require ack < 5s or they retry |

---

## 19. File Structure

```
src/
├── index.js                    Entry point, Express server, route registration
├── config/
│   ├── constants.js            All config: company info, prices, BTN IDs, STAGES, TTL
│   ├── database.js             Supabase client init
│   ├── logger.js               Morgan logger (skips /health)
│   └── redis.js                ioredis client init
├── data/
│   ├── batches.js              Test prep batch schedules and fees
│   ├── countries.js            Study destination metadata
│   ├── loanPackages.js         Loan terms by region + formatLoanMessage()
│   ├── pricingGuide.js         Price ranges by service
│   ├── services.js             Service descriptions
│   └── testimonials.js         Client success stories (6 testimonials)
├── flows/
│   ├── consultation.js         Name collection + consultation confirmation
│   ├── escalation.js           Human handoff flag
│   ├── greeting.js             New user welcome (5 rotating templates)
│   ├── loanScholarship.js      Loan flow (Europe/UK/Canada/Scholarship)
│   ├── mainMenu.js             9-item WhatsApp list menu
│   ├── payment.js              Paystack initialization + onPaymentConfirmed
│   ├── pilgrimage.js           Hajj/Umrah/Tours flow
│   ├── proofOfFunds.js         PoF requirements by country
│   ├── studyAbroad.js          4-step study destination flow
│   ├── testPrep.js             3-step exam + batch + payment flow
│   ├── travelServices.js       Flights/hotels/insurance flow
│   └── visaProcessing.js       3-step visa type + destination flow
├── handlers/
│   ├── buttonHandler.js        Master ROUTE_MAP + fallback routing
│   ├── mediaHandler.js         Image/audio/video acknowledgement
│   ├── messageHandler.js       Inbound dispatcher (dedup, rate limit, route)
│   ├── telegramHandler.js      Telegram-specific update routing
│   └── textHandler.js          7-step text waterfall + signal detection
├── middleware/
│   ├── authMiddleware.js       HTTP Basic auth for admin
│   ├── errorHandler.js         Global Express error handler
│   ├── rateLimiter.js          Redis INCR/EXPIRE rate limiter
│   └── webhookVerify.js        WhatsApp hub.challenge verification
├── services/
│   ├── ai.js                   Claude Haiku + GPT-4o-mini fallback, history, context
│   ├── broadcast.js            Bulk message sender
│   ├── leadService.js          Supabase lead CRUD + conversation logging
│   ├── messenger.js            Unified WhatsApp + Telegram send layer
│   ├── notificationService.js  Staff routing and escalation alerts
│   ├── notifyOwner.js          Personal Telegram alerts to owner
│   ├── paystack.js             Payment init, verify, webhook handler
│   ├── scheduler.js            Cron jobs: follow-ups, morning msg, poll, welcome
│   ├── telegram.js             Telegram Bot API client
│   └── whatsapp.js             WhatsApp Cloud API client (Meta Graph v25.0)
├── utils/
│   ├── helpers.js              formatCurrency, generateReference, delay, etc.
│   ├── stateManager.js         Redis state + dedup + lock primitives
│   └── validators.js           sanitizeText, isValidPhone, sanitizeName, etc.
└── admin/
    ├── dashboardAuth.js        JWT + bcrypt login, department filtering
    ├── dashboardRoutes.js      REST API for CRM + stats + broadcast
    └── dashboard.html          SPA admin interface (~93KB)
```
