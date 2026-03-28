# Decisions

Chronological log. Append-only — never delete, only add context if revisited.

---

### 2026-03-22 — Vapi for voice layer

**Decision:** Use Vapi over ADK BIDI streaming for the voice interview.
**Why:** Vapi handles all voice infrastructure (ASR, TTS, LLM routing). No custom WebSocket or audio code needed. Assistant already built in Vapi dashboard.
**Who agreed:** Team consensus
**Revisit when:** Vapi pricing becomes prohibitive or quality degrades

---

### 2026-03-22 — No validation layer between phases

**Decision:** Interview → formatter → guide agent runs as a direct pipeline with no checkpoint/validation step between phases.
**Why:** Simplicity. Adding validation adds latency and complexity without clear benefit at MVP stage.
**Who agreed:** Travis, Zicheng
**Revisit when:** Guide quality issues traced to bad formatter output

---

### 2026-03-27 — System prompt engineering over fine-tuning

**Decision:** Improve guide quality through system prompt iteration, not model fine-tuning.
**Why:** Fine-tuning requires training data, model management, and is slower to iterate. System prompts can be updated and tested in minutes. Evals determine if quality is good enough.
**Who agreed:** Zicheng (initially proposed fine-tuning, then agreed), Travis
**Context:** Zicheng raised fine-tuning as option. Travis explained the overhead. Both agreed system prompt is the right approach for now. "At the end of the day, we're trying to meet the evals."
**Revisit when:** System prompt hits quality ceiling that can't be improved without fine-tuning

---

### 2026-03-27 — Customer manages own infrastructure

**Decision:** EasyClaw provides configuration intelligence (prompts, guides). Customer self-hosts on their preferred provider (Hostinger, etc.) or manages their own Mac Mini/VPS.
**Why:** We don't want to be a hosting company. The hosting market is commoditized ($4-15/mo, 24+ providers). Our value is in the knowledge, not the infrastructure.
**Who agreed:** Travis (proposed), team agreed
**Context:** "We don't want to handle the actual hosting. The customer manages their own instance. We tell them to go to Hostinger or whatever partner and just download OpenClaw themselves."
**Revisit when:** Customers consistently fail at self-hosting and need managed option

---

### 2026-03-27 — Output = copy-pasteable prompts, not terminal commands

**Decision:** The setup guide output should be prompts customers can copy-paste, not terminal commands or technical instructions.
**Why:** "What we did at Hackathon is too much — telling them all the terminal commands is too much. That already is blowing the customer off." Customers want to feel the prompts are good and just use them.
**Who agreed:** Travis (proposed), team agreed
**Revisit when:** Technical customers request deeper output

---

### 2026-03-27 — Translation feature deprioritized

**Decision:** Don't build translation features right now.
**Why:** Need to get to customers first and iterate on what they actually need. "Pick a segment that we actually build our features on because the first customers are always the most important."
**Who agreed:** Kaan (proposed), team agreed
**Revisit when:** Non-English-speaking customers show up as a significant segment

---

### 2026-03-27 — Voice first, text later

**Decision:** Start with voice interview as the primary input method. Add text input as a follow-up feature.
**Why:** Voice is more natural for non-technical business owners. Text can be added later for customers who prefer precision.
**Who agreed:** Pranav (suggested text option), team agreed on voice-first + text later
**Revisit when:** Test users consistently prefer typing over talking

---

### 2026-03-27 — MVP before polish, get test users

**Decision:** Ship the MVP and get it in front of test users rather than continuing to plan and polish.
**Why:** "Planning doesn't scale. Great founders just do." — Kaan. Need real feedback to know what to build next.
**Who agreed:** Kaan (drove this), team aligned
**Revisit when:** N/A — this is an ongoing principle
