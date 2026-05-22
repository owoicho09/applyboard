# ApplyBoard Africa Bot — Complete System Map

**Last updated:** May 2026  
**Codebase root:** `src/`  
**Runtime:** Node.js on Railway  

This document traces every path a message can take through the system — from the moment it hits the server to the moment a reply is sent. It also covers the scheduler, the payment flow, admin access, and all external services.

---

## Table of Contents

1. [Infrastructure and Startup](#1-infrastructure-and-startup)
2. [External Services](#2-external-services)
3. [Database Schema Overview](#3-database-schema-overview)
4. [Conversation State Machine](#4-conversation-state-machine)
5. [WhatsApp Message Flow](#5-whatsapp-message-flow)
6. [Telegram Message Flow](#6-telegram-message-flow)
7. [The Text Handler — Decision Chain](#7-the-text-handler--decision-chain)
8. [The AI Layer](#8-the-ai-layer)
9. [Button Flows — Structured Menu Paths](#9-button-flows--structured-menu-paths)
10. [The Payment Flow](#10-the-payment-flow)
11. [The Paystack Webhook — Payment Confirmation](#11-the-paystack-webhook--payment-confirmation)
12. [Notifications](#12-notifications)
13. [The Scheduler — Automated Follow-ups](#13-the-scheduler--automated-follow-ups)
14. [Admin Dashboard](#14-admin-dashboard)
15. [Error Paths and Fallbacks](#15-error-paths-and-fallbacks)
16. [Complete File Index](#16-complete-file-index)

---

## 1. Infrastructure and Startup

**File:** `src/index.js`

When the server starts, it does the following in order:

**Step 1 — Environment check.** The server reads fourteen required environment variables and exits immediately if any are missing. Missing variables are printed to the console before exit. This prevents silent failures at runtime.

**Step 2 — Middleware stack.** Express is configured with Helmet for security headers, CORS for cross-origin access, Morgan for HTTP request logging, cookie-parser, and body parsers. The `/webhook` and `/payment/webhook` routes receive raw buffers (not parsed JSON) because they require signature verification on the raw bytes. All other routes receive parsed JSON.

**Step 3 — Admin CSP override.** The `/admin` path gets a permissive Content Security Policy to allow the dashboard's inline scripts and styles to run. All other routes use Helmet's defaults.

**Step 4 — Database connections.** Supabase and Redis connect on startup. Supabase runs a test query against the leads table and exits the process if it fails. Redis connects with TLS (required for Upstash) and logs connection status.

**Step 5 — Routes mounted.** Health check at `/health`, test trigger routes at `/test/*`, WhatsApp webhook at `/webhook`, Telegram webhook at `/telegram/webhook`, Paystack callback page at `/payment/callback`, Paystack webhook at `/payment/webhook`, and admin dashboard at `/admin`.

**Step 6 — Server starts listening.** Once the HTTP server is live, two things fire: Telegram's webhook URL is registered with Telegram's API (using the `BASE_URL` environment variable), and the scheduler starts all cron jobs.

---

## 2. External Services

The bot touches six external services. Here is what each one does and when.

**Meta WhatsApp Cloud API**  
Endpoint: `https://graph.facebook.com/v25.0/{PHONE_NUMBER_ID}/messages`  
Used for: sending text, interactive buttons, lists, documents, and images to WhatsApp users. Also used to mark messages as read (blue ticks). Authenticated with a bearer token (`WHATSAPP_TOKEN`). Called from `src/services/whatsapp.js` on every outbound WhatsApp message.

**Telegram Bot API**  
Endpoint: `https://api.telegram.org/bot{TOKEN}/{method}`  
Used for: sending messages to Telegram users and groups, sending inline buttons, answering callback queries (removes loading spinner on button tap), sending typing indicators, and registering the webhook URL on startup. Called from `src/services/telegram.js`.

**Anthropic Claude API**  
Model: `claude-haiku-4-5-20251001`  
Used for: generating all conversational responses in free-text mode, generating follow-up messages in the scheduler, generating morning group messages, generating weekly polls, and generating welcome messages for new group members. The system prompt is cached ephemerally per request to reduce token costs. Called from `src/services/ai.js`. Has a GPT-4o-mini fallback via OpenAI's API if Claude returns a 529 overloaded error after two retries.

**OpenAI API (fallback only)**  
Endpoint: `https://api.openai.com/v1/chat/completions`  
Model: `gpt-4o-mini`  
Used only when Claude fails after two retries. Uses a shorter system prompt covering Ade's identity and core services. Called from `src/services/ai.js` inside the catch block. Only activates if `OPENAI_API_KEY` is set in environment variables.

**Paystack**  
Endpoints: `https://api.paystack.co/transaction/initialize` and `https://api.paystack.co/transaction/verify/{reference}`  
Used for: generating payment checkout URLs (`initializePayment`) and verifying individual transactions when a user claims to have paid (`verifyPayment`). The incoming Paystack webhook is verified with HMAC-SHA512 signature before any processing. Called from `src/services/paystack.js`.

**Supabase (PostgreSQL)**  
Used for: persistent storage of leads, conversations, payments, and admin users. The Supabase JS client uses the service key for full database access. All database reads and writes go through `src/config/database.js` which exports the configured Supabase client.

**Upstash Redis**  
Used for: conversation state storage (per-phone, 24-hour TTL), rate limiting (30 messages per minute per phone, 60-second window), and message deduplication (60-second window per message ID). Connected via ioredis with TLS. Configured in `src/config/redis.js`.

---

## 3. Database Schema Overview

The system uses four main tables in Supabase.

**leads** — One row per unique phone number. Stores the user's name, phone number, destination country, service interested in, program level, timeline, age, payment status, payment method, payment reference, loan interest flag, notes from conversation, conversation stage, last interaction timestamp, escalation flag, agent assigned, and follow-up count. This table is the CRM.

**conversations** — One row per message (both inbound and outbound). Stores lead ID (foreign key), phone number, direction (inbound or outbound), message type, content (truncated at 4096 characters), WhatsApp message ID, and created timestamp. Used by the follow-up scheduler to read actual conversation history before generating follow-up messages.

**payments** — One row per payment attempt. Stores phone number, Paystack reference, amount in naira, payment method, service description, status (pending or success), and the full Paystack webhook payload. Created when a link is generated, updated to success when the webhook confirms payment.

**admin_users** — Stores admin user credentials for the dashboard. Emails, hashed passwords, roles, and department assignments. Used by the dashboard authentication layer.

---

## 4. Conversation State Machine

**File:** `src/utils/stateManager.js`  
**Storage:** Redis key `state:{phone}`, 24-hour TTL  
**Structure:** `{ stage: "STAGE_NAME", data: { ... }, ts: "ISO timestamp" }`

State is a JSON object stored in Redis. Every message loads the current state for that phone number at the start of handling. State is never automatically reset — it persists for 24 hours from the last write. If Redis has no key for a phone number, the default state is `{ stage: "GREETING", data: {} }`.

**The stages and what they mean:**

`GREETING` — Default state. User has never messaged before, or their 24-hour Redis state expired. The first message from this state checks Supabase for an existing lead record. If the lead has a name, service interest, or destination country, they are treated as a returning user — their profile is restored to Redis and the AI picks up the conversation with context. If no meaningful lead data exists, the standard greeting fires and the stage transitions to `FREE_TEXT_AI`.

`FREE_TEXT_AI` — The main conversational state. The AI handles everything. This is where 90% of conversations live. Users enter this state after the greeting, after completing any button flow, and after a confirmed payment.

`MAIN_MENU` — Set when the main service list is shown. Transitional — the next button tap moves to a specific service stage.

`STUDY_DESTINATION` — User is selecting a study destination from the list. Set by the study abroad flow.

`STUDY_LEVEL` — User has picked a country and is selecting their program level (undergrad, postgrad, diploma).

`STUDY_TIMELINE` — User has picked level and is selecting their intended start timeline.

`VISA_TYPE` — User is selecting their visa type (study, tourist, business, work, family).

`VISA_DESTINATION` — User has picked a visa type and is selecting the destination country.

`TEST_EXAM_SELECT` — User is selecting which exam they want to prepare for.

`TEST_BATCH_SELECT` — User has picked an exam and is selecting a batch schedule.

`LOAN_COUNTRY` — User is selecting the loan or scholarship type.

`TRAVEL_TYPE` — User is selecting a travel service (flights, hotels, insurance).

`PILGRIMAGE_TYPE` — User is selecting a pilgrimage package (Hajj, Umrah, tours).

`POF_ADVISORY` — User is in the proof of funds advisory flow.

`CONSULT_NAME` — The bot is waiting for the user to type their name as part of a consultation request. This is the only stage where a text message is caught before reaching the AI.

`CONSULT_TIME` — User is selecting a consultation time slot.

`CONSULT_CONFIRMED` — Consultation has been booked. Transitional.

`PAYMENT_AWAITING` — A Paystack link has been generated and sent. The bot is waiting for payment confirmation. This stage has its own handling branch in the text handler that is distinct from the AI catch-all.

`PAYMENT_CONFIRMED` — Payment has been confirmed. Transitional — immediately cleared and reset to `FREE_TEXT_AI`.

`ESCALATED` — User requested to speak to a human. The AI continues to hold the conversation warmly but does not push for payment or registration.

**State transitions summary:**

Message from `GREETING` with existing Supabase lead → profile restored to Redis → `FREE_TEXT_AI` (AI resumes with context)  
Message from `GREETING` with no lead record → `sendGreeting` → `FREE_TEXT_AI`  
Button tap on service → service-specific stages (`STUDY_DESTINATION`, `VISA_TYPE`, etc.)  
Completing a button flow → `FREE_TEXT_AI`  
AI includes `[[SEND_PAYMENT_LINK]]` → `PAYMENT_AWAITING` (set by `payment.js` after generating link)  
Paystack webhook fires with `charge.success` → clear state → `FREE_TEXT_AI`  
User triggers escalation → `ESCALATED`  
User types "menu", "home", "restart" → `sendMainMenu` (sets `MAIN_MENU`)  
User types "i have paid", "i paid", "transfer done" → bot acknowledges, no state change  
User types "speak to agent", "real person", "call me" → `ESCALATED`

---

## 5. WhatsApp Message Flow

**Entry point:** POST `/webhook` in `src/index.js`

**Step 1 — Webhook receives message.**  
Meta sends a POST request to `/webhook`. The server immediately responds with HTTP 200 before doing any processing. This is required by Meta — they retry if they don't get a 200 within a few seconds. Processing happens after the response is sent.

**Step 2 — Parse and validate.**  
The raw body (a Buffer) is parsed as JSON. The code checks that `body.object === "whatsapp_business_account"` and that `entry[0].changes[0].value.messages[0]` exists. If either check fails, processing stops silently.

**Step 3 — Route to message handler.**  
`src/handlers/messageHandler.js` receives the parsed entry. It extracts: the sender's phone number (`from`), the message ID (`msgId`), the message type (`text`, `interactive`, `image`, `document`, `audio`, `video`, `sticker`), and the message content.

**Step 4 — Deduplication check.**  
The message ID is checked against Redis using a SET NX operation (atomic set-if-not-exists with 60-second TTL). If the key already exists, this is a duplicate delivery from Meta and processing stops immediately. Meta occasionally delivers the same webhook twice.

**Step 5 — Parallel pre-processing.**  
Three operations run simultaneously: rate limit check, state fetch from Redis, and mark-as-read (blue ticks) sent to WhatsApp. The rate limit check uses Redis INCR — if the phone number has sent more than 30 messages in the last 60 seconds, they receive a rate limit message and processing stops.

**Step 6 — Background logging.**  
Lead upsert (create or update the lead record in Supabase) and inbound message logging (write to conversations table) run in the background without awaiting. They do not block the response. If they fail, an error is logged but the message is still handled.

**Step 7 — Type-based routing.**  
- If `msgType === "interactive"`: extract the button ID or list item ID and route to `buttonHandler.js`
- If `msgType === "text"`: route to `textHandler.js`
- Any other type (image, document, audio, video, sticker): route to `mediaHandler.js`

**Step 8 — Reply sent.**  
The handler calls one of the `sendText`, `sendButtons`, `sendList`, `sendDocument`, or `sendImage` functions from `src/services/messenger.js`. Messenger checks the phone number: if it starts with `tg_`, it routes to the Telegram API; otherwise it routes to the WhatsApp API. After sending, outbound logging fires in the background.

---

## 6. Telegram Message Flow

**Entry point:** POST `/telegram/webhook` in `src/index.js`

Telegram uses a different model from WhatsApp. The server registers its own webhook URL with Telegram on startup. Telegram then sends updates to that URL. Updates come in two forms: regular messages and callback queries (button taps).

**Step 1 — Webhook receives update.**  
Server responds 200 immediately, then processes.

**Step 2 — Determine update type.**  
`src/handlers/telegramHandler.js` checks whether `update.callback_query` exists (button tap) or `update.message` exists (text message).

**Step 3a — Callback query (button tap).**  
Extract the chat ID, user ID, button ID (`query.data`), and user's first name. Answer the callback query (this removes the loading spinner on the button). If the button ID is `SECTION_HEADER` (the non-tappable section label rows in lists), stop processing. Otherwise, upsert the lead, get state, and route to `buttonHandler.js`. If the button was tapped in a group chat, set the reply override so the bot replies to the group channel instead of the user's DM.

**Step 3b — Regular message.**  
Check for `new_chat_members` — if a new user joined the group, send a personalised AI-generated welcome message and upsert them as a lead. Then stop.

If it's a regular text message, determine whether it came from a group chat or a private DM.

**Group chat path:** Check if the bot was @mentioned. If not, ignore the message entirely (the bot does not respond to every group message, only when tagged). Strip the @mention from the text. Run rate limit check, state fetch, and typing indicator in parallel. If rate limited, send rate limit message to the group. Otherwise, set the reply override to the group chat ID and route to `textHandler.js`.

**Private DM path:** No mention check needed. Run rate limit check, state fetch, and typing indicator in parallel. Route to `textHandler.js`.

The phone number used as the state and lead identifier is `tg_{user_id}` — prefixed with `tg_` so the system can distinguish Telegram users from WhatsApp users everywhere.

---

## 7. The Text Handler — Decision Chain

**File:** `src/handlers/textHandler.js`

This is the central routing brain for all text input. Every text message — from both WhatsApp and Telegram — passes through this chain. Each step is checked in order. The first match wins and the function returns. Nothing below a matched step runs.

**Before the chain — signal detection.** The text is sanitized and lowercased for matching. In the AI catch-all path (step 7), `detectAndSaveSignals` runs in parallel with the AI call. This function scans the message for country names, service keywords, exam names, ages, and budget signals, then writes detected values to both Supabase (leads table) and Redis (conversation state data).

---

**Step 1 — Numeric input aliasing.**  
If the message is a plain number (e.g., "1", "2", "3") and the state has a `lastMenu` array stored (set when a numbered text menu was previously shown), the bot looks up which menu item that number corresponds to and routes to `buttonHandler.js` with that item's ID. This allows users to reply with numbers instead of tapping buttons — useful for WhatsApp where list menus can be clunky on older phones.

**Step 2 — Consultation name capture.**  
If `state.stage === "CONSULT_NAME"`, the text is treated as the user's name. The consultation flow takes over. This is the only stage where text is intercepted before the AI. It ensures the bot captures a typed name reliably without passing it through the AI.

**Step 3 — Hard trigger keywords.**  
Three sets of keywords are checked regardless of stage:

Menu triggers ("menu", "main menu", "home", "restart", "start over") → `sendMainMenu` is called and the stage is set to `MAIN_MENU`.

Payment acknowledgement triggers ("i have paid", "i paid", "payment done", "transfer done", "i sent the money", "i made payment") → The bot sends a confirmation acknowledgment citing the stored payment reference. No new link is generated. No state change.

Escalation triggers ("speak to agent", "talk to human", "real person", "speak to someone", "call me", "i want to call") → `escalate` is called. Sets stage to `ESCALATED`, updates the lead record, and notifies the agent WhatsApp number.

**Step 4 — First message / returning user.**  
If `state.stage === "GREETING"` or the stage is null/undefined, the handler first calls `getLead(from)` to check Supabase for an existing lead record. If the lead has a name, service interest, or destination country, this is a returning user whose Redis session expired. Their profile fields (name, destination, service, program level, timeline, loan interest, notes) are restored into Redis via `setState(from, FREE_TEXT_AI, restored)`, then `askAI` is called with a system note instructing it not to re-introduce itself — one warm sentence acknowledging the user, then one question that continues where the conversation left off. If no meaningful lead data exists, `sendGreeting` fires normally (genuine new user).

**Step 5 — Payment awaiting.**  
If `state.stage === "PAYMENT_AWAITING"`, the user has already received a payment link. First, the lead is fetched from Supabase to check if they actually paid (their webhook may have fired but state wasn't cleared). If `payment_status === "paid"`, the state is cleared and they're moved to `FREE_TEXT_AI` as a post-payment conversation.

If they haven't paid, the message is checked against a short list of unambiguous send-link-now phrases ("send the link", "pay now", "generate link", etc.). If matched, `handlePayment` is called directly with the `PAY_NOW` action, which generates a fresh Paystack URL.

For everything else, the AI is called with a specific system note covering: what the ₦10,000 registration includes, how to detect and handle payment-specific trust objections, and the `[[SEND_PAYMENT_LINK]]` trigger rules. After the AI responds, two checks fire: the tag check (did the AI include the literal text `[[SEND_PAYMENT_LINK]]`?), and the narration fallback check (did the AI describe sending a link without using the tag?). If either fires, the deduplication guard checks for a stored `payment_url` in state. If one exists, that URL is resent as text. If not, a new Paystack link is generated.

**Step 6 — Escalated hold.**  
If `state.stage === "ESCALATED"`, the AI is called with a system note instructing it to acknowledge that a human is on the way, answer any question warmly, and never trigger payment or registration. This holds the space until a human team member takes over.

**Step 7 — AI catch-all (FREE_TEXT_AI).**  
Everything else lands here. `detectAndSaveSignals` and `askAI` run in parallel. After both complete, three guardrails run before anything reaches the user.

**Markdown strip (WhatsApp only).** For non-`tg_` phones, `stripWhatsAppMarkdown` strips any `*bold*`, `_italic_`, `# headers`, and `- bullet` formatting that the AI leaked into its response. WhatsApp renders these as literal characters; this runs unconditionally on every reply regardless of whether the AI used formatting.

**Payment tag — three-gate check.** If `[[SEND_PAYMENT_LINK]]` is present in the reply, fresh state is fetched and the following checks fire in order: (1) If no qualification data has been collected yet (no name, destination, `service_interested`, or `destination_country` in state), the tag is silently blocked — logged as `[GUARDRAIL] Payment tag blocked — no context collected` — and no link is sent. (2) If a `payment_url` already exists in state, the stored URL is resent as plain text rather than calling Paystack again — this is the FREE_TEXT_AI dedup guard, mirroring the one already present in step 5. (3) If both checks pass, a new Paystack link is generated normally via `handlePayment`.

The clean reply (tag stripped, markdown cleaned for WhatsApp) is sent to the user first. The payment link follows only if all gates pass.

---

## 8. The AI Layer

**File:** `src/services/ai.js`

**Context assembly.** Before calling the API, the function builds full context from two sources. Session context comes from `state.data` — name, destination, program level, service, timeline, exam type, loan region, age, concerns, budget, English background, IELTS score, IELTS fear flag. Persistent context is loaded from Supabase by fetching the lead record — this catches data that was saved to the database but not yet in the current Redis state (e.g., data from a previous session). Both are assembled into a context string injected into the user's message content.

**Chat history.** The last 16 message turns are stored in `state.data.chatHistory` as an array of `{role, content}` objects. These are passed to the API as the `messages` array, giving the AI conversational memory. History is capped at 16 turns to control token costs.

When Redis expires and `state.data.chatHistory` is empty, `buildHistory` falls back to the Supabase `conversations` table. It queries the 10 most recent rows for that phone number ordered by `created_at` descending, reverses them to chronological order, and maps `direction: "inbound"` → `role: "user"` and `direction: "outbound"` → `role: "assistant"`. The result is returned as the history array so the AI retains conversational memory across session gaps rather than starting blank after every 24-hour Redis expiry. The Supabase fallback is capped at 10 messages (vs 16 from Redis) to keep cold-loaded context lean.

**Platform detection.** The phone number prefix determines platform. If it starts with `tg_`, the user is on Telegram and the AI is told to use Markdown formatting. WhatsApp users get a note prohibiting all Markdown symbols — plain text only.

**API call with retry.** The Anthropic API call is wrapped in a retry loop that catches 529 overloaded errors. It retries up to twice with a 2-second delay between attempts, logging each retry. If all retries fail, the error is rethrown to the catch block.

**GPT fallback.** If Claude fails completely (any error after retries), the catch block checks for `OPENAI_API_KEY`. If set, and if the `messages` array was built before the error, the same messages array is sent to GPT-4o-mini via the OpenAI API using axios. The GPT response goes through the same `[[SEND_PAYMENT_LINK]]` stripping and history saving as a normal Claude response.

**History saving.** After the AI responds, `saveToHistory` re-fetches the current state (which may have changed stage during the flow) and appends the user message and bot reply to the chat history. The `[[SEND_PAYMENT_LINK]]` tag is stripped from the bot reply before saving to history, so the AI never sees its own internal control tags in subsequent turns.

**The system prompt.** One constant, never changes per request. Covers Ade's persona, strict formatting rules (no bullets, no lists, no hyphens, 2–3 sentence default), four Wrong vs Right examples, emotional intelligence patterns for different user states, the micro-commitment sequence, the `[[SEND_PAYMENT_LINK]]` trigger instructions, IELTS and MOI intelligence, profiling questions to gather over time, common fears and responses, and all services with prices. Company details are interpolated from the `COMPANY` constants object so they stay in sync with `constants.js`.

---

## 9. Button Flows — Structured Menu Paths

**File:** `src/handlers/buttonHandler.js`

Every button ID in the entire system is registered in a flat route map — a JavaScript object with button ID strings as keys and handler functions as values. When a button is tapped, the ID is looked up in this map and the corresponding function is called. There is no stage-based switch logic for known button IDs. If the ID is not in the map (unknown or malformed), a fallback routes by the current stage prefix.

**Study Abroad flow** (`src/flows/studyAbroad.js`)  
Three steps, each a button selection:  
Step 1 (START): Shows the country list. Sets stage to `STUDY_DESTINATION`. Records `service_interested = study_abroad` in Supabase.  
Step 2 (country selected): Records destination in state and Supabase. Shows program level buttons. Sets stage to `STUDY_LEVEL`.  
Step 3 (level selected): Records program level. Shows timeline buttons. Sets stage to `STUDY_TIMELINE`.  
Step 4 (timeline selected): Records timeline. Sets stage to `FREE_TEXT_AI`. Calls the AI with the full collected profile and a system note telling it to pick one sharp insight specific to this person's profile (not ask for any of the data already collected). Returns the AI reply as the first free-text message.

**Visa Processing flow** (`src/flows/visaProcessing.js`)  
Similar three-step structure: visa type selection → destination selection → AI handoff with a visa-specific insight and a move toward registration.

**Loan and Scholarship flow** (`src/flows/loanScholarship.js`)  
Shows loan type options (Europe/UK Masters, Canada Masters, Undergrad Canada, Scholarships). Each branch provides relevant loan information and then hands off to the AI with a qualifying question.

**Test Preparation flow** (`src/flows/testPrep.js`)  
Exam selection → batch schedule selection → confirmation with price and enrollment instructions. Test prep does not require the ₦10,000 registration fee.

**Travel Services flow** (`src/flows/travelServices.js`)  
Covers flights, hotels, and insurance. Each option presents relevant information and contact instructions.

**Pilgrimage flow** (`src/flows/pilgrimage.js`)  
Hajj, Umrah, and tour package options with pricing.

**Proof of Funds flow** (`src/flows/proofOfFunds.js`)  
Country-specific proof of funds requirements.

**Consultation flow** (`src/flows/consultation.js`)  
Time slot selection → sets stage to `CONSULT_NAME` → waits for typed name → confirms booking. The `CONSULT_NAME` stage is caught in step 2 of the text handler chain.

**Payment buttons** — `PAY_NOW` and `PAY_BANK` route directly to `handlePayment` in `payment.js`.

**Escalation button** — Routes to `escalate` in `escalation.js`.

---

## 10. The Payment Flow

**File:** `src/flows/payment.js`

`handlePayment` is called from three places: the text handler's `SEND_LINK_NOW` keyword match, the text handler's AI tag detection in `FREE_TEXT_AI`, and the button handler when the PAY_NOW button is tapped.

**What happens when a payment link is generated:**

1. The amount is determined. For REGISTRATION and START actions, it uses the `REGISTRATION_FEE` constant (₦10,000). For PAY_NOW it reads from `state.data.payment_amount` (which was set by `getPaymentAmount` in the text handler, which checks exam type and service type to pick the right amount).

2. An email address is constructed. If the user provided their email, that's used. Otherwise, a synthetic email is generated from their phone number in the format `user{phonenumber}@applyboardafrica.com`.

3. `initializePayment` is called on the Paystack API. This generates a unique reference and returns a checkout URL.

4. The stage is set to `PAYMENT_AWAITING` and both `payment_ref` and `payment_url` are saved to Redis state.

5. A payment record is inserted into the Supabase `payments` table with status `pending`.

6. The lead record in Supabase is updated to `payment_status: pending`.

7. The checkout URL is sent to the user as a text message with instructions.

The `payment_url` stored in Redis state is the deduplication guard. When the AI subsequently triggers `[[SEND_PAYMENT_LINK]]` again (e.g., after answering a trust objection), the text handler checks for the existing URL first and resends it as text rather than calling Paystack again.

---

## 11. The Paystack Webhook — Payment Confirmation

**Entry point:** POST `/payment/webhook` in `src/index.js`  
**File:** `src/services/paystack.js`

**Step 1 — Signature verification.**  
The raw request body (a Buffer, preserved by the body parser configuration) is hashed with HMAC-SHA512 using `PAYSTACK_SECRET_KEY`. The result is compared to the `x-paystack-signature` header. If they don't match, the request is rejected with HTTP 400. This prevents fake payment confirmations.

**Step 2 — Respond 200 immediately.**  
Paystack requires a 200 before processing. If the response is delayed, Paystack retries.

**Step 3 — Parse and check event type.**  
Only `charge.success` events are processed. All others are ignored.

**Step 4 — Update payment record.**  
The payments table row matching the reference is updated to `status: success` and the full Paystack event payload is stored in `paystack_data`.

**Step 5 — Confirm payment.**  
`onPaymentConfirmed` in `payment.js` is called with the phone number (extracted from the payment metadata), amount, and reference.

**Inside onPaymentConfirmed:**

1. The lead record is updated: `payment_status: paid`, `payment_reference`, `conversation_stage: registered`.

2. A confirmation message is sent to the user with the Calendly booking link so they can schedule their first session with the team.

3. The owner is notified via a personal Telegram message with the lead's name, phone, amount, and reference.

4. The correct staff member is notified via WhatsApp. The service type stored in state determines which staff number receives the message. The notification includes a full brief: name, contact, service, destination, program level, timeline, age, loan interest, budget, concerns, and a clear action prompt.

5. State is cleared (Redis key deleted) and reset to `FREE_TEXT_AI` so the user can continue the conversation normally after paying.

---

## 12. Notifications

Three types of notifications go out through the system.

**New lead notification** (fires on first contact)  
When `upsertLead` creates a new row in the leads table, it sends a Telegram message to the owner's personal chat ID (`MY_PERSONAL_TELEGRAM_ID`). The message includes the lead's name, phone number, source platform, and time.

**Payment confirmed notification** (fires on Paystack webhook)  
Two notifications fire: one Telegram message to the owner via `notifyOwner`, and one WhatsApp message to the responsible staff member via `notifyStaff`. The staff notification includes the full client brief with all collected data.

**Escalation notification** (fires when user requests human)  
A WhatsApp message is sent to `AGENT_WHATSAPP` with the phone number, name, service, and stage of the escalated conversation. The agent receives this immediately and is expected to take over the conversation directly.

---

## 13. The Scheduler — Automated Follow-ups

**File:** `src/services/scheduler.js`  
**Timezone:** All cron jobs run in Africa/Lagos timezone.

The scheduler starts when the server starts. It runs five types of automated jobs.

**Pending payment follow-ups** (runs at 10am and 6pm WAT daily)  
Targets leads with `payment_status = pending` whose `last_interaction` was at least 22 hours ago. Per-lead JavaScript logic enforces a day-1 / day-3 / day-7 cadence: first follow-up after 22 hours, second after 48 hours from the first, third after 96 hours from the second. Maximum 3 follow-ups total per lead, tracked by a `followup_count` integer column on the leads table. After each send, `last_interaction` is stamped and `followup_count` is incremented. The message generator reads the last 4 actual conversation messages from the Supabase conversations table and feeds them to Claude, which produces a message referencing specific details from the conversation — a program name, country, concern, or question that was raised — rather than generic check-in text. Each follow-up is shorter than the last: 170 tokens max for the first, 120 for the second, 80 for the third.

**Pre-payment re-engagement** (runs at 10am and 7pm WAT daily)  
Targets leads with `payment_status` null (never received a link) whose `last_interaction` was between 12 and 72 hours ago and who have at least one engagement signal (a service, destination, or name recorded). Excludes escalated and registered leads. Fetches the last 6 conversation messages and generates a message that references the specific conversation thread, answers any unanswered question, and ends with one open question to pull them back — without mentioning payment, registration, or next steps.

**Morning group message** (runs at 8am WAT daily, requires TELEGRAM_GROUP_ID)  
Generates a fresh, specific piece of information useful to Nigerians planning to study or relocate abroad. The prompt rotates across 25+ topic categories. The message must open with something unexpected (not "good morning"), use real numbers and specifics, stay under 5 sentences, and end with a bot link. Sent to the Telegram group.

**Weekly poll** (runs Monday 9am WAT, requires TELEGRAM_GROUP_ID)  
Generates a poll question and 4 options relevant to the Nigerian study-abroad audience. The response is parsed as JSON. Telegram's `sendPoll` API is used so group members can vote anonymously.

**New member welcome** (event-driven, fires on join)  
When Telegram sends a `new_chat_members` event, the bot generates a personalised 3-sentence welcome message for each new member (excluding bots and itself) and posts it to the group. The new member is also upserted into the leads table.

---

## 14. Admin Dashboard

**Entry point:** GET `/admin` serves `src/admin/dashboard.html`  
**API routes:** `src/admin/dashboardRoutes.js`  
**Auth:** `src/admin/dashboardAuth.js`

The dashboard provides a web interface for managing leads and conversations. Access is controlled by JWT tokens with a 12-hour expiry.

**Authentication paths:**  
Super admin: HTTP Basic Auth with `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables.  
Staff users: Email and password login against the `admin_users` Supabase table, passwords hashed with bcrypt.

After login, a JWT is issued containing the user's email, role, and department. All `/admin/api/*` routes require a valid JWT.

**Department filtering.** Staff users see only leads relevant to their department. For example, a user in the admissions department sees only study abroad and loan leads. A super admin sees everything.

**API capabilities.** The dashboard API supports reading leads with pagination and search, reading conversation history for a specific lead, sending manual messages to any lead (WhatsApp or Telegram), triggering broadcast messages, and managing basic CRM data.

**Broadcast.** `src/services/broadcast.js` handles bulk outbound messaging to filtered lead segments. Uses the same `sendText` function from `messenger.js` with delays between sends to avoid rate limiting.

---

## 15. Error Paths and Fallbacks

**Redis failure.** If Redis is down, `getState` returns the default `GREETING` state. Rate limiting is skipped (returns false, allowing the message through). Deduplication is skipped (returns false, allowing through). The conversation still works but without state persistence.

**Supabase failure.** Lead upsert and message logging are fire-and-forget — failures are logged but do not stop message handling. If `getLead` fails, it returns null and the AI continues without persistent context. If `updateLead` fails, state data is still in Redis but Supabase won't reflect it.

**Claude API failure.** Two retries on 529 overloaded errors with 2-second delays. After retries, falls back to GPT-4o-mini if `OPENAI_API_KEY` is set. If GPT also fails, the user receives a fallback message with the business phone number.

**Paystack link generation failure.** The user is sent a message with the business phone number to contact directly. No state change occurs — the user stays in their current stage.

**Paystack webhook signature mismatch.** Request is rejected with 400. No processing occurs. This protects against fake payment events.

**Unknown button ID.** If a button ID is not in the route map, the fallback checks the current stage prefix (`STUDY_`, `VISA_`, `LOAN_`, etc.) and routes to the corresponding flow. If even that doesn't match, `sendMainMenu` is called.

**Media messages.** Images, documents, audio, video, and stickers all route to `mediaHandler.js`. The AI is called with a note explaining that it cannot access the file, and it responds asking what the user was trying to share. The stage is set to `FREE_TEXT_AI` if it wasn't already.

**WhatsApp GET /webhook.** Meta sends a GET request to verify the webhook URL during initial setup. The `verifyWebhook` middleware checks the `hub.mode` and `hub.verify_token` query parameters against `WEBHOOK_VERIFY_TOKEN`. If they match, it echoes back the `hub.challenge`. This is a one-time setup step, not part of the live message flow.

---

## 16. Complete File Index

```
src/
├── index.js                    Server entry — middleware, routes, startup
├── config/
│   ├── constants.js            All content, prices, company info, stage names, button IDs
│   ├── database.js             Supabase client, connection verification
│   ├── redis.js                ioredis client with TLS and retry logic
│   └── logger.js               Morgan HTTP request logger
├── middleware/
│   ├── webhookVerify.js        Meta webhook GET verification
│   └── rateLimiter.js          Redis-backed 30msg/min rate limiter
├── handlers/
│   ├── messageHandler.js       WhatsApp entry — dedup, rate limit, type routing
│   ├── telegramHandler.js      Telegram entry — group vs DM, mention detection
│   ├── textHandler.js          7-step decision chain for all text input
│   ├── buttonHandler.js        Flat button ID → handler route map
│   └── mediaHandler.js         Media messages → AI acknowledgment
├── flows/
│   ├── greeting.js             First message greeting, stage → FREE_TEXT_AI
│   ├── mainMenu.js             Service list menu
│   ├── studyAbroad.js          3-step country/level/timeline → AI handoff
│   ├── visaProcessing.js       2-step type/destination → AI handoff
│   ├── loanScholarship.js      Loan type selection → info + AI handoff
│   ├── testPrep.js             Exam + batch selection → enrollment info
│   ├── travelServices.js       Travel service options
│   ├── pilgrimage.js           Hajj/Umrah/tour packages
│   ├── proofOfFunds.js         Country-specific PoF requirements
│   ├── consultation.js         Time slot + name capture → booking confirmation
│   ├── payment.js              Paystack link generation, payment confirmation handler
│   └── escalation.js           Human handoff — stage, lead update, agent notify
├── services/
│   ├── messenger.js            Unified send layer — routes by tg_ prefix
│   ├── whatsapp.js             Meta Graph API calls (text, buttons, list, doc, image, read)
│   ├── telegram.js             Telegram Bot API calls + webhook registration
│   ├── ai.js                   Claude/GPT calls, context assembly, history management
│   ├── paystack.js             Paystack init, verify, webhook handler
│   ├── leadService.js          Supabase CRUD for leads and conversations
│   ├── notifyOwner.js          Telegram message to owner personal chat
│   ├── notificationService.js  Staff WhatsApp routing and brief generation
│   ├── scheduler.js            All cron jobs — follow-ups, morning msg, poll, welcome
│   └── broadcast.js            Bulk outbound messaging for admin dashboard
├── utils/
│   ├── stateManager.js         Redis get/set/update/clear for conversation state
│   ├── validators.js           Text sanitization
│   └── helpers.js              formatCurrency, generateReference, delay, getFirstName
└── admin/
    ├── dashboard.html          Single-page admin UI
    ├── dashboardRoutes.js      Admin API routes — leads, conversations, messaging
    └── dashboardAuth.js        JWT auth, bcrypt password check, department filtering
```

---

## Key Design Decisions

**Respond 200 before processing.** Both Meta and Telegram require a fast 200 or they retry. The server sends 200 immediately and processes asynchronously. This means if the handler throws after 200 has been sent, the user gets no message — but the webhook doesn't retry unnecessarily.

**Fire-and-forget logging.** Lead upsert, inbound log, and outbound log are all non-blocking. They use `.catch(() => {})` or `.catch(err => console.error(...))` and do not hold up the reply. Logging failures are silent from the user's perspective.

**Single AI call per message.** The AI is called once per incoming text message. Context, history, and system notes are all assembled before that single call. The only exception is the PAYMENT_AWAITING paid-already check, which may call the AI a second time after clearing state.

**`[[SEND_PAYMENT_LINK]]` as a machine signal.** The AI cannot directly call functions. The tag pattern is the mechanism by which the AI signals intent to the code layer, which then decides whether to generate a new link or resend an existing one.

**`tg_` prefix as the platform discriminator.** Every piece of code that needs to know the platform (messenger routing, AI platform note, staff brief, admin display) reads the phone number prefix. This single convention propagates platform awareness through the entire system without any additional fields.

**Button flows as data collection, AI as closer.** Structured button menus efficiently collect destination, program level, timeline, and exam type. Once collected, the AI takes over with that context pre-loaded, allowing it to skip qualification and go straight to consultative engagement.
