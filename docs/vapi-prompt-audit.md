# VAPI System Prompt Audit — What to Fix, What to Add

## Issues Found (Confusing or Broken)

### 1. Closing Protocol appears THREE times
The same closing protocol is written at:
- End of Section 5 (Step 10: Handoff)
- After Section 7 (Determination Logic)
- At the very end of the prompt

The model doesn't know which one is authoritative. The last one even has a loose note: "But this would need to be after all checklist is done" — this reads like a dev comment, not an instruction. **Fix: Keep ONE closing protocol, delete the other two.**

### 2. "Solutions team" / "Agent 2" / "Model 2" / "Build agent" — pick one
The prompt uses 4+ different names for the downstream agent:
- "Agent 2" (intro)
- "Model 2" (intro)
- "our solutions team" (Step 10)
- "our build agent" (Closing Protocol)
- "our solutions agent" (Section 5.5)
- "our next agent" (technical follow-ups handler)

This confuses the model AND the user. **Fix: Pick "build agent" — it's the most descriptive. Use it everywhere.**

### 3. Section 5.5 has no placement in the flow
It says "naturally during the conversation (not at the start)" but doesn't say WHEN. The conversation flow (Section 5) goes Steps 1-10 with no mention of environment discovery. The model has to guess where to insert it. **Fix: Place it explicitly between Step 6 (Desired Outcome) and Step 7 (Scale), or make it Step 6.5.**

### 4. Environment isn't in the required checklist
Section 5.5 asks about Mac mini vs VPS, but Section 7's checklist doesn't include it. The agent could hand off without ever asking about deployment. **Fix: Add Environment to the checklist — it's critical for the guide the build agent generates.**

### 5. Written language in a voice prompt
This is a VOICE agent but the prompt uses:
- Markdown formatting (headers, checkboxes, tables) — the model can't "speak" these
- Formal phrasing that sounds stiff when spoken: "Can you describe your daily workflow in detail?"
- Heavy em dash usage (`—`) — some TTS engines read these as pauses or ignore them awkwardly

Not a critical issue (Gemini handles it), but worth noting.

### 6. British/American English inconsistency
- British: "£0-5", "standardises", "colour", "humour", "favourite"
- American: "$600" (Mac mini pricing)
- The VAPI voice is "Elliot" — check if that's a British or American voice and match the examples

### 7. No time/length guidance
The prompt never says how long the conversation should be. "Should only take a few minutes" in the intro, but no actual target. Without this, the model might go 3 minutes or 20 minutes. **Fix: Add guidance like "Target: 5-8 minutes for a standard interview."**

### 8. Section 8 (Use Cases) is very heavy
10 detailed use case examples at ~50 words each = 500 words of context the model carries at all times. Most calls will only need 1-2 relevant examples. **Consider: Move these to a VAPI knowledge base so the model retrieves them dynamically instead of loading all 10 every time.**

### 9. No handling for returning users
Every example assumes a brand new user. What if someone calls who already has OpenClaw running and wants to add a new skill or change their setup? **Fix: Add a scenario handler for "User is already an OpenClaw user."**

### 10. No handling for personal (non-business) use cases
The first message says "whether that's for your business or just a personal assistant use case" but:
- All 8 required fields are business-focused (Industry, Role, Scale)
- All 10 examples are business-focused
- A personal user ("I just want a morning briefing") would be asked "What industry are you in?" — awkward

**Fix: Add a fork: if personal use case, adapt the required fields (skip Industry/Role/Scale, ask about daily routines, devices, channels instead).**

---

## What to Add

### A. Section 5.6: Autonomy Discovery (already drafted)
See `vapi-prompt-updates.md` — adds comfort-level probing as a 9th required field.

### B. Personal Use Case Fork
After Step 3 (Open-Ended Discovery), if the user describes a personal use case:

```
**If personal use case detected:**
Adapt your questions. Skip Industry/Role/Scale. Instead ask:
- "What does a typical day look like for you?"
- "What apps or tools do you already use?" (calendar, email, messaging)
- "What's the one thing you wish happened automatically?"
- "How do you prefer getting info — text, voice, email?"

Required fields for personal use cases:
- [ ] Name
- [ ] Main goal (what they want automated)
- [ ] Current tools/apps
- [ ] Desired channel (Telegram, WhatsApp, iMessage, etc.)
- [ ] Device/environment (Mac, iPhone, etc.)
- [ ] Comfort level (from Section 5.6)
- [ ] Boundaries
```

### C. Environment as Required Field
Add to Section 7 checklist:
```
- [ ] **Environment** — Do I know if they want Mac mini, VPS, or cloud?
```

### D. Conversation Length Target
Add to Section 1 or top of Section 5:
```
**Target conversation length:** 5-8 minutes for a standard interview.
If the user is in a hurry, you can compress to 3-4 minutes.
Never exceed 12 minutes — if you're still missing fields at that point,
note what's missing and hand off anyway.
```

### E. Returning User Handler
Add to Section 6 (Handling Common Scenarios):
```
**User already has OpenClaw running:**
"Oh nice — so you're already set up! What are you looking to add or change?
Are we talking a new skill, a new channel, or tweaking what you've already got?"

Adjust your questions:
- Skip environment discovery (they already have hardware)
- Focus on: what's new, what's not working, what they want to add
- Still capture comfort level and boundaries for the new capability
```

### F. Structured Output Schema
VAPI has `structuredOutputIds` configured. Define what the structured output should contain so our backend gets clean JSON alongside the transcript:

```json
{
  "name": "string",
  "role": "string",
  "industry": "string | null",
  "company_name": "string | null",
  "problem": "string",
  "current_process": "string",
  "desired_outcome": "string",
  "scale": "string",
  "urgency": "string",
  "environment": "mac_mini | vps | cloud | undecided",
  "comfort_level": "notify | suggest | execute | undecided",
  "boundaries": ["string"],
  "use_case_type": "business | personal",
  "is_returning_user": "boolean"
}
```

---

## Structure Cleanup

### Current structure (messy):
```
Intro paragraph
"What This Agent Does" section
Section 1: Identity
Section 2: Purpose (overlaps with intro)
Section 3: Voice & Persona
Section 4: Personality Traits (overlaps with Section 3)
Section 5: Conversation Flow (Steps 1-10)
  Step 10 includes closing protocol (duplicate #1)
Section 5.5: Environment Discovery (orphaned)
Section 6: Handling Common Scenarios
Section 7: Determination Logic
  Closing Protocol after checklist (duplicate #2)
Section 8: Example Use Cases
Closing Protocol again (duplicate #3) with dev comment
```

### Recommended structure (clean):
```
Section 1: Identity & Role
Section 2: What You Extract (required fields + personal fork)
Section 3: Voice & Personality (merge current 3+4)
Section 4: Conversation Flow (Steps 1-10, including environment + autonomy inline)
Section 5: Handling Common Scenarios (add returning user + personal use case)
Section 6: Determination Logic (expanded checklist with environment + comfort)
Section 7: Closing Protocol (ONE copy, with end call function)
Section 8: Example Use Cases (or move to VAPI knowledge base)
```

This removes duplication, fixes the orphaned Section 5.5, and creates a clear linear flow.

---

## Priority of Changes

| Priority | Change | Impact | Risk |
|----------|--------|--------|------|
| **Critical** | Remove duplicate closing protocols | Prevents model confusion on when to exit | Zero |
| **Critical** | Consistent naming (pick "build agent") | Prevents user confusion about next steps | Zero |
| **High** | Add autonomy discovery (Section 5.6) | Captures comfort data for downstream | Zero |
| **High** | Add environment to required checklist | Prevents handoff without deployment info | Zero |
| **High** | Add personal use case fork | Stops awkward "what industry?" for personal users | Zero |
| **Medium** | Add returning user handler | Covers a real scenario currently unhandled | Zero |
| **Medium** | Add conversation length target | Prevents overly long or short interviews | Zero |
| **Medium** | Move use cases to VAPI knowledge base | Reduces prompt size, improves relevance | Low |
| **Low** | Merge Voice & Personality sections | Cleaner structure | Zero |
| **Low** | Fix British/American consistency | Polish | Zero |
