# Consultation Flow Implementation Plan

> Written: June 2026. Agree this plan before touching any code.
> This is the new profile-collection consultation flow described in prompt1.txt.

---

## What we are building

A natural, AI-driven consultation flow that takes a user from their first message
to a pre-qualified profile and a ₦10,000 registration payment — all in one conversation.
The bot acts as a consultant giving a free consultation, not a form collector.

---

## 1. New stages

```
PROFILE_COLLECTING  — discovery + data collection (motivation → docs)
PROFILE_SUMMARY     — AI reads back the profile, user confirms
PROFILE_ROADMAP     — AI gives the personalized pathway insight
PROFILE_PAYMENT     — registration pitch → hands off to existing PAYMENT_AWAITING
```

The existing `PAYMENT_AWAITING`, `PAYMENT_CONFIRMED`, `CONSULT_NAME`, button flows,
and `FREE_TEXT_AI` are all untouched. The new stages slot in between the consultation
entry and payment.

**How the flow starts:** `BTN.SVC_CONSULT` and `BTN.MENU_CONSULT` currently go straight
to `startConsultation` (name → payment). They will instead route to the new
`startProfileConsultation` which enters `PROFILE_COLLECTING`.
The greeting → `FREE_TEXT_AI` path stays completely as-is.

---

## 2. New DB columns

```sql
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS motivation              TEXT,
  ADD COLUMN IF NOT EXISTS urgency                 TEXT,
  ADD COLUMN IF NOT EXISTS passport_status         TEXT,
  ADD COLUMN IF NOT EXISTS work_experience         TEXT,
  ADD COLUMN IF NOT EXISTS documents_checklist     JSONB
    DEFAULT '{"passport":false,"degree":false,"transcript":false,"cv":false}',
  ADD COLUMN IF NOT EXISTS profile_completion_score INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lead_score              TEXT DEFAULT 'cold';
```

All nullable with safe defaults — zero risk to existing rows.

---

## 3. New admin profile view

A new "Profile" card inside the existing lead detail view (no new page, no breaking changes).

Sections:
- **Completion bar** — `[██████░░░░] 62%` derived from filled profile fields
- **Lead score tag** — `🔥 HOT` / `🌡️ WARM` / `❄️ COLD` with scoring logic applied
- **Document status row** — `Passport ✅ | Degree ⏳ | Transcript ❌ | CV ✅`
- **Key fields** — Motivation, Urgency, Passport status, Work experience
- **Consultant brief** — AI-generated from collected profile via a new
  `GET /api/leads/:id/brief` endpoint (calls Claude Haiku once, formatted for
  the specialist to read before the strategy session)

---

## 4. Lead scoring logic

```
HOT  — urgency ≤ 30 days AND passport_status = 'has' AND budget ≥ ₦2,000,000
WARM — any profile data collected AND at least one document confirmed
COLD — no urgency signal, no documents, exploring only
```

Score is recalculated and saved to `lead_score` whenever the signal extractor runs.

---

## 5. Profile completion score

Fields tracked (each worth ~11 points):
- motivation, urgency, name, age, program_level, destination_country,
  passport_status, work_experience, budget_range

Documents tracked (each worth ~2.75 points):
- passport, degree, transcript, cv

Score = (filled_profile_fields / 9) * 89 + (confirmed_docs / 4) * 11
Rounded to nearest integer. Saved to `profile_completion_score` on each update.

---

## 6. How we keep it natural

The AI drives 100% of the conversation. No rigid prompts like "Please provide your age."

- A **profile signal extractor** (new sidecar function, runs parallel to the existing
  `detectAndSaveSignals`) watches every message for structured answers and saves them
  silently to Redis + Supabase
- The AI receives a system note each turn that lists what has been collected and what
  is still missing — it works these into the conversation naturally when the moment is right
- Stage transitions happen when **enough data is collected**, not on a rigid turn count
- User can type SKIP at any time — extractor records it, AI moves on
- Documents: `mediaHandler.js` gets a new branch — when stage is `PROFILE_COLLECTING`,
  an image/document upload is treated as a profile document and logged to
  `documents_checklist`

### Profile steps (internal, not rigid):
1. motivation — why do you want to make the move
2. destination + intent — study / work / relocate
3. name, age, qualification level
4. passport status, work experience, budget range
5. documents — passport photo, degree cert, transcript, CV (one at a time naturally)
6. → transition to PROFILE_SUMMARY
7. AI reads back the profile naturally, user confirms or corrects
8. → transition to PROFILE_ROADMAP
9. AI gives one personalised insight — destinations, pathways, rough cost
10. → transition to PROFILE_PAYMENT
11. Registration introduced naturally — ₦10,000, connect with specialist
12. → existing handlePayment('REGISTRATION', ...) takes over

---

## 7. How it layers safely on top of the existing architecture

| Risk area | Mitigation |
|---|---|
| Breaking existing button flows | New flow only touches BTN.SVC_CONSULT + BTN.MENU_CONSULT — all other buttons unchanged |
| Breaking FREE_TEXT_AI | Not touched — new stages are separate |
| Breaking payment | New flow hands off to existing handlePayment('REGISTRATION') — no payment code changes |
| Breaking greeting | greeting.js unchanged |
| DB migration risk | All columns nullable with defaults — existing rows unaffected |
| Admin dashboard | Profile card added as a new section inside existing lead detail panel — nothing removed |
| Telegram | All messenger calls go through messenger.js as before — platform routing unchanged |

---

## 8. Implementation order

1. DB migration — add new columns to leads table (run in Supabase SQL editor)
2. `src/config/stages.js` — add PROFILE_COLLECTING, PROFILE_SUMMARY, PROFILE_ROADMAP, PROFILE_PAYMENT
3. `src/flows/profileConsultation.js` — new flow handler (entry, stage transitions, summary/roadmap/payment)
4. `src/utils/profileExtractor.js` — signal sidecar that parses messages for profile fields
5. `src/utils/leadScorer.js` — calculates lead_score and profile_completion_score
6. `src/handlers/textHandler.js` — add routing for the four new stages
7. `src/handlers/mediaHandler.js` — add document upload branch for PROFILE_COLLECTING stage
8. `src/handlers/buttonHandler.js` — redirect BTN.SVC_CONSULT + BTN.MENU_CONSULT to new flow
9. `src/config/prompts.js` — add profile-collection system note guidance for the AI
10. `src/admin/dashboardRoutes.js` — add GET /api/leads/:id/brief endpoint, expose new fields
11. `src/admin/dashboard.html` — add Profile card, completion bar, doc status, lead score tag

---

## 9. What must never change during this work

| What | Where | Why |
|---|---|---|
| Retry loop in askAI() | ai.js | Handles Anthropic 529 overload gracefully |
| [[SEND_PAYMENT_LINK]] stripping from history | stateManager.js saveToHistory | AI must never see its own internal machine tag |
| The 7-step waterfall order | textHandler.js | Order is load-bearing — bank trigger must precede AI |
| Payment guardrail conditions | textHandler.js lines ~283-310 | Prevents charging unqualified users |
| verifySignature in paystack.js | HMAC-SHA512 | Security boundary — rejects forged webhooks |
| isMessageSeen NX dedup | stateManager.js | Prevents double-processing when WhatsApp resends webhooks |
| Bank account hard trigger | textHandler.js HARD_TRIGGERS.bank | AI hallucinated a GTBank account in production |
| Ade's personality and writing rules | prompts.js SYSTEM_PROMPT | Core identity — must not be diluted or overridden |
