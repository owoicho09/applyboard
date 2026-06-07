# Architectural Audit — ApplyBoard Africa Bot

> Generated: June 2026. Do not touch anything until this plan is agreed.
> No behaviour changes. No new functionality. Pure restructuring only.

---

## 1. What currently lives in `ai.js` that should live elsewhere

`src/services/ai.js` has 714 lines across five distinct responsibilities.

### `SYSTEM_PROMPT` (lines 26–296) → `src/config/prompts.js`
Business configuration, not service logic. Defines Ade's identity, rules, pricing context, scheduling, and campaign copy. When a business rule changes — fee negotiation language, a new campaign context, the IELTS policy — the person making that change has to navigate into a service file. 270 lines of prompt copy has no place there.

### `GPT_SYSTEM_PROMPT` (lines 354–559) → `src/config/prompts.js` (same file)
A second, slightly trimmed version of SYSTEM_PROMPT written for the GPT fallback. Both prompts live in ai.js and are independently maintained. **The risk: someone updates Claude's prompt and forgets to mirror the change to GPT.** This has already happened — the GPT version drops several paragraphs the Claude version has (the detailed wrong-vs-right examples, some IELTS guidance). If the fallback ever fires at scale, users see a subtly different Ade.

### `PRICE_BLOCK` (lines 9–24) → `src/config/prompts.js`
Assembled at module load using `PRICES` from constants, then injected into both prompts. It belongs with the prompts, not in the service.

### `MODEL` constant (line 5) → `src/config/constants.js` or a new `src/config/ai.js`
A model ID hard-coded in a service file is invisible to anyone scanning configuration.

### `buildHistory()` (lines 298–322) → `src/services/leadService.js`
Queries the Supabase `conversations` table as a Redis fallback. It is a data-access function, not an AI function. Lives in the wrong file.

### `loadPersistentContext()` (lines 325–352) → `src/services/leadService.js`
Wraps `getLead()` and reformats the result into an AI context string. The DB call belongs in leadService; the formatting string can stay near the prompt assembly.

### `saveToHistory()` (lines 695–712) → `src/utils/stateManager.js`
Re-fetches fresh Redis state, appends user/assistant messages, calls `setState`. This is a state mutation operation. It belongs in stateManager alongside `setState`, `updateData`, `clearState`.

### `askGPT()` (lines 561–580) → `src/services/gpt.js`
A complete second AI provider integration (axios, OpenAI API, its own model), currently hidden inside ai.js's catch block. Should be a separate file so the provider boundary is visible and the fallback can be independently tested or swapped.

> The `_n` number formatter at line 7 is a one-liner used only to build `PRICE_BLOCK`. Keep it inline wherever `PRICE_BLOCK` ends up.

---

## 2. What should be split from `constants.js`

`src/config/constants.js` has 379 lines across 14 conceptual sections. They are not equally stable or equally owned.

### Extract: `MESSAGES` → `src/config/messages.js`
User-facing copy: greeting variants, fallback, rate limit, paystackTransfer, paymentConfirmed, escalation, sessionExpired, registrationPrompt. These change at a different cadence than infrastructure constants. A copywriter or non-developer touching the bot's language should not be opening a file that also contains `REDIS_KEYS` and `STAGES`.

### Extract: `BTN` → `src/config/buttons.js`
120 button ID strings. UI routing constants imported by virtually every flow and handler. Stable once set but conceptually belong to the UI/routing layer, not alongside pricing data.

### Extract: `STAGES` → `src/config/stages.js`
20 conversation state machine constants. Currently someone modifying the state machine has to navigate past COMPANY, PRICES, LOAN_RULES, MESSAGES, and BTN to find STAGES.

### Extract: `REDIS_KEYS`, `TTL`, `RATE` → `src/config/redis.js`
Infrastructure config that belongs with the Redis client initialization. `redis.js` currently has only the ioredis client. Adding these there puts all Redis configuration in one place.

### What stays in `constants.js`
`COMPANY`, `REGISTRATION_FEE`, `CONVERSION_RATES`, `PRICES`, `STAFF_MEMBERS`, `STAFF_ROUTING`, `LOAN_RULES`, `SERVICE_LABELS`. All business domain data that changes together.

### Existing duplication to resolve before splitting

**`COUNTRIES` in constants.js is dead.** It is a simple arrays-by-region object that is never imported anywhere in the codebase. `src/data/countries.js` has the same countries with richer metadata and is the one actually used. The constants version can be deleted outright.

**`EXAM_AMOUNTS` in textHandler.js (lines 45–56) duplicates `PRICES.testPrep` from constants.** It is a hand-typed `{ 'ielts': 85000, ... }` map. If you change a coaching price in constants, you must also update this map manually. This is the most likely source of a future silent billing bug.

---

## 3. Flow-by-flow assessment

### Clean and untouched

| File | Lines | Status |
|------|-------|--------|
| `flows/greeting.js` | 15 | Clean. Single responsibility. |
| `flows/escalation.js` | 27 | Clean. |
| `flows/mainMenu.js` | 41 | Clean. |
| `flows/proofOfFunds.js` | 43 | Clean. Only handles START. |
| `utils/stateManager.js` | 100 | Clean primitives, consistent error handling. |
| `services/messenger.js` | 111 | Clean abstraction. `setReplyChat`/`getReplyChat` is documented and contained. |
| `middleware/rateLimiter.js` | 20 | Clean. |
| `utils/validators.js` | 60 | Clean. Prompt injection stripping is present and correct. |
| `services/leadService.js` | 88 | Clean. Inline `require('./notifyOwner')` is intentional circular-dep avoidance. |
| `services/paystack.js` | 97 | Clean. Verify, init, webhook each in their own function. |
| `handlers/buttonHandler.js` | 147 | Clean. ROUTE_MAP pattern is correct. Stage-prefix fallback is a reasonable safety net. |

### Flows with technical debt

---

#### `src/services/ai.js` — CRITICAL

The duplicated `SYSTEM_PROMPT` / `GPT_SYSTEM_PROMPT` have silently diverged. Claude's version has detailed wrong-vs-right examples, richer IELTS guidance, and more campaign specifics. GPT's version omits several sections. If Claude fails over to GPT at scale, the bot behaves differently and there is no test for it.

---

#### `src/handlers/textHandler.js` — THREE ISSUES

**Issue 1 — `EXAM_AMOUNTS` drift risk (lines 45–56)**
Hand-typed duplicate of `PRICES.testPrep`. Will drift silently when prices change.

**Issue 2 — Duplicated `narrationPattern` regex**
The fallback detection regex is defined verbatim twice: once at line 228–229 for the `PAYMENT_AWAITING` branch, once at line 284–285 for the default AI path. When one is updated, the other will be forgotten.

**Issue 3 — Inline payment guardrail logic**
The payment tag guardrail (lines 295–320) is complex, correct, and completely inline in the handler. Any future change to payment triggering rules requires editing in the middle of a 334-line waterfall. Should be extracted to a named function.

---

#### `src/flows/testPrep.js` — TWO ISSUES

**Issue 1 — `BATCH_LABELS` inside function body (lines 98–104)**
Defined inside `handleTestPrep` instead of at module top like `EXAM_MAP`. Structurally inconsistent with every other map in the flows.

**Issue 2 — Currency string parsing (line 115)**
```js
parseInt(batch.fee.replace(/[^0-9]/g, ''))
```
Parses `"₦85,000"` to recover the integer. The integer already exists in `PRICES.testPrep.IELTS.naira` in constants. This string parse exists because `batches.js` stores fees as display strings rather than as numbers. This is a data-layer leak into a flow.

---

#### `src/flows/loanScholarship.js` — BROKEN SILENT PATH

`BTN.LOAN_UK` exists in constants, appears in `buttonHandler.js` ROUTE_MAP (line 92), and calls `handleLoan(f, BTN.LOAN_UK, s)`. But `handleLoan` has no branch for `BTN.LOAN_UK`. Any user who triggers that button gets a silent no-response. This is either dead code from an earlier refactor or an incomplete feature.

---

#### `src/flows/travelServices.js` — MAGIC STRING

Line 24:
```js
if (action === BTN.TV_FLIGHTS || action === 'INSURANCE')
```
The string `'INSURANCE'` is passed by `buttonHandler.js` for the `SVC_INSURE` button. It is not a BTN constant. Every other flow uses only BTN values. This works but is inconsistent and will trip up anyone reading the code.

---

#### `src/flows/consultation.js` — DEAD EXPORT

`completeRegistration` (lines 42–60) is defined and exported but is never imported anywhere in the codebase. It calls `notifyStaff` and sends a confirmation message. `onPaymentConfirmed` in payment.js handles the equivalent through a different path. This is dead code.

---

#### `src/config/constants.js` — DEAD `BANK` CONSTANT

`BANK` (lines 21–25) is defined as `{ accountNo: 'XXXXXXXXXX' }` with a "UPDATE before going live" comment. It is never imported or used anywhere. Its existence is also a minor risk: having any bank account field in a constants file contradicts the absolute "never show bank details" rule enforced everywhere else in the system.

---

#### `src/services/scheduler.js` — COMPLEXITY CONCENTRATION

614 lines doing five unrelated things: morning message generation, weekly poll generation, welcome messages, pending-payment follow-ups, pre-payment re-engagement. Each is a complete job with its own AI call, Supabase query, and cadence logic. Grouped by mechanism ("scheduler"), not domain. Low immediate risk but the right candidate for splitting in a future phase after everything else is done.

---

## 4. Safest order of operations

The primary constraint: `askAI`, `constants.js`, and `textHandler.js` are in the critical path of every single message. Start with changes that are invisible to the runtime.

---

### Phase 0 — Dead code removal (zero runtime risk)
These changes cannot break anything because the code is already unreachable or unused.

- [ ] Delete `BANK` from constants.js — never imported, contradicts the bank-intercept rule
- [ ] Delete `completeRegistration` from consultation.js — never imported anywhere
- [ ] Delete `COUNTRIES` from constants.js — superseded by `src/data/countries.js`, never used
- [ ] Hoist `BATCH_LABELS` in testPrep.js to module top alongside `EXAM_MAP`

---

### Phase 1 — Fix the broken `LOAN_UK` path (one-line fix, isolated)
Either add a `BTN.LOAN_UK` handler in loanScholarship.js (matching the LOAN_EUR pattern) or remove LOAN_UK from the ROUTE_MAP and BTN constants. This is a silent bug with direct user impact. Should be the first real code change.

---

### Phase 2 — Extract prompts from ai.js (new file, one import change)
1. Create `src/config/prompts.js`
2. Move `PRICE_BLOCK`, `SYSTEM_PROMPT`, `GPT_SYSTEM_PROMPT` there
3. In ai.js: `const { SYSTEM_PROMPT, GPT_SYSTEM_PROMPT } = require('../config/prompts')`
4. Reconcile the two prompts — either make `GPT_SYSTEM_PROMPT` explicitly derive from `SYSTEM_PROMPT` with documented omissions, or merge into one with a parameter

No behaviour change. One new import in one file. Highest value-to-risk ratio of any change in this audit.

---

### Phase 3 — Consolidate `EXAM_AMOUNTS` (fix silent price drift)
1. Add `EXAM_AMOUNTS` as a derived export in constants.js, generated from `PRICES.testPrep`:
   ```js
   const EXAM_AMOUNTS = Object.fromEntries(
     Object.entries(PRICES.testPrep).map(([k, v]) => [k.toLowerCase(), v.naira])
   );
   ```
2. Export it from constants.js
3. Replace the hand-typed map in textHandler.js with the import
4. Update batches.js to store fees as integers alongside the formatted string, so testPrep.js reads the number directly instead of parsing `"₦85,000"`

Touches three files. Eliminates the price-drift risk entirely.

---

### Phase 4 — Split constants.js (many import updates, no logic changes)
Extract in this order. Each is independently safe.

1. `MESSAGES` → `src/config/messages.js`
   - Update imports in: textHandler, messageHandler, telegramHandler, greeting, escalation, proofOfFunds, pilgrimage, travelServices, payment

2. `STAGES` → `src/config/stages.js`
   - Update imports in: all handlers and all flows

3. `BTN` → `src/config/buttons.js`
   - Update imports in: buttonHandler and all flows

4. `REDIS_KEYS`, `TTL`, `RATE` → move into `src/config/redis.js`
   - Update imports in: stateManager, rateLimiter

Pure refactor. No logic changes, only import paths. Risk mitigation: grep every export name before and after to confirm no missed importer.

---

### Phase 5 — Extract data functions from ai.js (requires circular dep audit)
1. Move `buildHistory()` to leadService.js
2. Move `loadPersistentContext()` to leadService.js
3. Move `saveToHistory()` to stateManager.js
4. Move `askGPT()` to `src/services/gpt.js`

**This phase requires resolving circular dependencies.** ai.js currently uses inline `require()` calls specifically to avoid circles — those are the functions being moved. After extraction, the requires become top-level which forces the circular dep problem to be explicitly solved. Do this last.

---

### Phase 6 — Fix `'INSURANCE'` magic string (cosmetic, two files)
Replace `'INSURANCE'` in buttonHandler.js with a BTN constant. Update travelServices.js to match. Two-line change.

---

### Phase 7 — scheduler.js split (optional, do last)
Split into `src/services/contentScheduler.js` (morning message, poll, welcome) and `src/services/followupScheduler.js` (pending + pre-payment). Only do this if the file becomes hard to navigate. The current structure works correctly.

---

## What must never change during restructuring

These are production safety rules and load-bearing logic. Restructuring must not touch their behaviour.

| What | Where | Why |
|------|-------|-----|
| Retry loop in `askAI()` | ai.js lines 647–660 | Handles Anthropic 529 overload gracefully |
| `[[SEND_PAYMENT_LINK]]` stripping from history | `saveToHistory()` | AI must never see its own internal machine tag |
| Stage re-fetch in `saveToHistory()` | ai.js lines 700–701 | Prevents stale stage overwriting the stage the flow just set |
| The 7-step waterfall order | textHandler.js | The order is load-bearing — e.g. bank trigger must precede AI |
| Payment guardrail conditions | textHandler.js lines 295–320 | Prevents charging unqualified users |
| `verifySignature` in paystack.js | HMAC-SHA512 | Security boundary — rejects forged payment webhooks |
| `isMessageSeen` NX dedup | stateManager.js | Prevents double-processing when WhatsApp resends webhooks |
| Bank account hard trigger | textHandler.js HARD_TRIGGERS.bank | AI hallucinated a GTBank account in production; this intercept prevents recurrence |
