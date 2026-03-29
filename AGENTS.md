# Instructions for AI Coding Agents — OpenClaw Concierge

**STOP. Read this entire file before touching any code.**

---

## 1. Source of truth (two tiers)

This project has two knowledge tiers. Which ones you read depends on what you're doing.

### Engineering context — how the system works

| Priority | Document | What you take from it |
|----------|----------|----------------------|
| 1 | `docs/architecture.md` | System architecture, Vapi integration, data flow, endpoints |
| 2 | `docs/design-considerations.md` | Engineering decisions, UI specs, what's deferred |
| 3 | This file (`AGENTS.md`) | Invariants, file paths, do-not rules |
| Ref | `docs/vapi-system-prompt-v3.md` | How the interview agent talks to users (current prompt) |
| Ref | `docs/vapi-kb-capabilities-overview.md` | What the interview agent knows about OpenClaw |
| Ref | `docs/vapi-prompt-audit.md` | Known issues and improvement backlog for interview prompt |

### Business context — why we're building what, where we are

| Priority | Document | What you take from it |
|----------|----------|----------------------|
| 1 | `knowledge/state.md` | Current snapshot — read this for ANY non-trivial task |
| 2 | `knowledge/decisions.md` | Past decisions with reasoning and who agreed |
| 3 | `knowledge/debates.md` | Open disagreements — check before picking a side |
| As needed | `knowledge/vision.md`, `team.md`, `customers.md`, `roadmap.md` | Product direction, team perspectives, customer insights, timeline |
| As needed | `knowledge/competitive/*` | Market positioning, competitor analysis, defensibility |

### When to read which tier

| Task type | What to load |
|-----------|-------------|
| Bug fix / refactor | Engineering tier only |
| New feature | **Both tiers** — engineering for feasibility, business for alignment |
| UI/UX change | **Both** — `docs/design-considerations.md` + `knowledge/debates.md` + `knowledge/vision.md` |
| Business decision | Business tier primarily, `docs/architecture.md` for feasibility |
| Prompt engineering | `docs/vapi-*` files + `knowledge/customers.md` + `knowledge/vision.md` |

---

## 2. System overview

```
User (voice) ↔ Vapi Cloud (ASR + LLM + TTS) → transcript
    → Formatter (Gemini Flash primary / Claude Haiku fallback / regex last resort)
    → Setup Guide Creation Agent (Claude Agent SDK — reads knowledge base, writes 3 output files)
    → Frontend displays: Setup Guide + Reference Docs + Prompts to Send
```

**Stack:**
- Backend: FastAPI + Python 3.11+ (`uv` for package management)
- Frontend: React + Vite + Tailwind CSS
- Voice: Vapi (@vapi-ai/web SDK)
- Guide agent: claude-agent-sdk
- Deploy: Railway (nixpacks.toml, Procfile)

---

## 3. Current state (as of 2026-03-25)

### What's working
- Full voice interview via Vapi SDK
- Formatter: Gemini Flash → Haiku fallback → regex fallback (all async-safe with asyncio.to_thread)
- Setup Guide Creation Agent: 7-step reasoning chain with budget pressure protocol, pre-write anchoring, and quality bar
- Stack awareness section moved to top of system prompt for early agent visibility
- Planning turn budget tightened to 5-6 turns (8 max edge cases)
- 435-skill registry, 11 industry domains, 4 deployment guides
- KNOWLEDGE_INDEX.md for efficient KB navigation (no blind Glob)
- SSE streaming progress to frontend with turn count, time estimate, and live indicator
- Guide store with disk persistence + crash recovery
- /retry-guide endpoint for failed guides — now surfaced in frontend error state
- Frontend: full dark-mode UI, live transcript, loading with progress + time estimate, output display with copy/download, scorecard
- Error state: categorized errors (timeout/format/server/ratelimit) with retry button
- Interview minimum: 800 chars + 100 words from user before guide generation proceeds
- Domain knowledge enriched: healthcare (300+ lines), real estate (300+ lines), entrepreneur (300+ lines) with concrete automation recipes, cron syntax, compliance notes, and sample identity prompts

### What needs work (priority order)
1. **End-to-end guide testing** — run real transcripts through the full pipeline and evaluate output quality against the quality bar criteria
2. **Vapi interview agent quality** — the interview system prompt (in Vapi dashboard) determines what data flows into the guide. Poor interview = poor guide.
3. **Mobile responsiveness** — frontend hasn't been audited for mobile
4. **Guide sharing** — share link exists but needs testing and potential short-URL support

---

## 4. Non-negotiable invariants

1. **All `clawhub install <slug>` lines** come from `context/skill_registry.md` via Grep — never invent slugs
2. **Zero API key storage** in any output file. Placeholders only: `YOUR_<SERVICE>_API_KEY`
3. **Markdown everywhere** — all inter-agent data and outputs use Markdown, not JSON schemas
4. **No validation layer** between phases — interview → formatter → guide agent, no checkpoint
5. **Interview Agent lives in Vapi** — don't try to replicate its logic in our codebase
6. **No WebSocket or audio code** — Vapi SDK handles all voice infrastructure
7. **Formatter must be async-safe** — all LLM calls use `asyncio.to_thread()` or async client
8. **No breaking changes to `/webhook` endpoint** — Vapi is configured to hit it

---

## 5. File map (exact paths)

```
backend/
├── main.py                         # FastAPI: all endpoints
├── formatter.py                    # Transcript cleanup (Gemini → Haiku → regex)
├── vapi_config.py                  # VAPI env var loading
├── mock_data.py                    # Demo guides for UI testing
├── setup_guide_agent/
│   ├── agent.py                    # Claude Agent SDK orchestration
│   ├── system_prompt.md            # 7-step reasoning chain (458 lines) — CRITICAL
│   └── context/                    # Knowledge base — READ ONLY by agent
│       ├── KNOWLEDGE_INDEX.md      # Master index — read this first, not Glob
│       ├── skill_registry.md       # 435 skills — Grep only, never read whole file
│       ├── setup_guides/           # Mac Mini, existing Mac, Docker, VPS guides
│       ├── openclaw-docs/          # Full OpenClaw docs (~347 pages)
│       ├── openclaw_skill/         # OpenClaw skill overview
│       ├── domain_knowledge_final/ # 11 industry domains (summaries + references)
│       └── templates/              # onboarding_guide.md style reference

frontend/
├── src/
│   ├── App.jsx                     # Route: landing → interview → guide
│   ├── EasyClawLanding.jsx         # Landing/start screen
│   ├── InterviewView.jsx           # Two-panel: agent presence + transcript
│   ├── SetupGuideView.jsx          # Loading → output display
│   ├── useVapi.js                  # Vapi SDK hook
│   ├── useGuideStream.js           # SSE + polling for guide progress
│   └── components/
│       ├── AgentPresence.jsx       # Avatar + animated mic circle
│       ├── Transcript.jsx          # Live scrolling transcript
│       ├── LoadingScreen.jsx       # Phase 2 waiting state with progress
│       ├── OutputDisplay.jsx       # 3-tab output: Guide / Refs / Prompts
│       ├── Scorecard.jsx           # Quality scorecard
│       ├── DemoNavigator.jsx       # Demo guide browser
│       └── ErrorBoundary.jsx       # Error fallback

docs/                                   # Engineering context — MUST READ before coding
├── architecture.md                     # System architecture, data flow, endpoints
├── design-considerations.md            # Engineering decisions, UI specs, deferred items
├── vapi-system-prompt-v3.md            # Interview agent prompt (current version)
├── vapi-kb-capabilities-overview.md    # What interview agent knows about OpenClaw capabilities
├── vapi-prompt-audit.md                # Interview prompt improvement backlog (10 issues)
└── diagrams/                           # System flow diagrams (Mermaid + PNG)

knowledge/                             # Team knowledge base — update after every significant decision
├── state.md                           # MUST READ for business context — current state of everything
├── team.md                            # Roles, perspectives, who thinks what
├── customers.md                       # Customer interaction insights (append after every conversation)
├── decisions.md                       # Decision log with context (append-only)
├── debates.md                         # Open disagreements to resolve
├── vision.md                          # Product vision (evolving)
├── roadmap.md                         # Timeline and priorities
└── competitive/                       # Market research (3-layer analysis)
    ├── setup-layer.md                 # 24 OpenClaw hosting providers
    ├── upgrade-layer.md               # 34 companies across consulting/platforms
    ├── observability-layer.md         # Layer 3 analysis (24 tools)
    ├── positioning-matrix.md          # Cross-layer positioning + market map
    └── differentiation.md             # What's defensible vs. reproducible
```

---

## 6. Environment variables

```bash
# Backend (backend/.env)
ANTHROPIC_API_KEY=          # Required — for formatter fallback + guide agent
GEMINI_API_KEY=             # Required — for formatter primary (Gemini Flash)
VAPI_ASSISTANT_ID=          # Required — interview agent ID
VAPI_PUBLIC_KEY=            # Required — frontend SDK key
VAPI_WEBHOOK_SECRET=        # Recommended — HMAC webhook verification
GUIDE_OUTPUT_DIR=./guide_output
GUIDE_STORE_PATH=/tmp/easyclaw_guide_store.json

# Frontend (.env)
VITE_VAPI_PUBLIC_KEY=       # Same as backend VAPI_PUBLIC_KEY
VITE_VAPI_ASSISTANT_ID=     # Same as backend VAPI_ASSISTANT_ID
VITE_API_BASE=              # Backend URL (empty = same origin)
```

---

## 7. Running locally

```bash
# Backend
cd backend && uv sync && uv run uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend && npm install && npm run dev

# Full stack (Railway uses Procfile)
```

---

## 8. Do not

- Write WebSocket or audio capture code (Vapi handles this)
- Invent skill slugs — always Grep `context/skill_registry.md`
- Store API keys or tokens in any output file
- Add a validation layer between phases
- Use JSON schemas for inter-agent data (Markdown only)
- Modify files in `backend/setup_guide_agent/context/` without explicit instruction
- Add pause/resume (deferred to post-MVP)
- Use sync LLM calls inside async FastAPI handlers (use asyncio.to_thread)
- Break the `/webhook` endpoint signature or response format
- Make product/business decisions without checking `knowledge/state.md` and `knowledge/debates.md` first
- Modify knowledge base files without understanding the current team state

---

## 9. Key patterns

### Async LLM calls (correct pattern)
```python
# Always wrap sync SDK calls in asyncio.to_thread()
response = await asyncio.to_thread(
    client.messages.create,
    model=MODEL,
    max_tokens=MAX_TOKENS,
    messages=[...]
)
```

### Skill slug verification (before recommending any skill)
```python
# In system prompt, agent must Grep before recommending:
# Grep("skill-name", "path/to/skill_registry.md")
# Never invent slugs from LLM memory
```

### Guide agent tool usage (efficiency rule)
```
1. Read KNOWLEDGE_INDEX.md FIRST (not Glob)
2. Use index to identify exactly which files to read
3. Glob ONLY if index doesn't cover the scenario
4. Never read skill_registry.md in full — always Grep
```

---

---

## 10. Project context awareness

### Classify your task first

Before starting work, determine what context you need (see Section 1 for the full tier table):

| Task type | Context to load |
|-----------|----------------|
| Bug fix / refactor | Engineering tier: `docs/architecture.md`, `docs/design-considerations.md` |
| New feature | **Both tiers** — use a sub-agent to gather from docs/ and knowledge/ |
| UI/UX change | **Both** — `docs/design-considerations.md` + `knowledge/debates.md` + `knowledge/vision.md` |
| Business decision | Business tier primarily, `docs/architecture.md` for feasibility check |
| Prompt engineering | `docs/vapi-*` + `knowledge/customers.md` + `knowledge/vision.md` |

### Context gathering steps

**Step 1: Always read `knowledge/state.md`.** This is the 40-line snapshot. Read it directly for any non-trivial task — it's small enough to always fit.

**Step 2: For anything beyond a pure bug fix, use a sub-agent.** Launch an Explore sub-agent to read the specific files from BOTH `docs/` and `knowledge/` relevant to your task. The sub-agent returns a summary so the main context stays focused on implementation.

Examples of cross-tier context gathering:

- **Adding a text input feature?** → Sub-agent reads `knowledge/debates.md` (voice vs text debate), `docs/architecture.md` (how voice currently flows through Vapi → formatter → agent), `knowledge/decisions.md` (voice-first decision), `docs/design-considerations.md` (what's deferred)

- **Changing the output format?** → Sub-agent reads `knowledge/debates.md` (output format debate), `knowledge/vision.md` (what we're selling), `knowledge/decisions.md` (copy-paste prompts decision), `docs/architecture.md` (how guide agent produces output)

- **Adding a new API endpoint?** → Sub-agent reads `docs/architecture.md` (existing endpoints, webhook contract), `AGENTS.md` section 4 (invariants — don't break /webhook), `knowledge/state.md` (current priorities)

- **Improving the interview agent?** → Sub-agent reads `docs/vapi-system-prompt-v3.md` (current prompt), `docs/vapi-prompt-audit.md` (known issues), `docs/vapi-kb-capabilities-overview.md` (what it knows), `knowledge/customers.md` (what real users said)

- **Making a pricing or GTM decision?** → Sub-agent reads `knowledge/debates.md` (pricing debate), `knowledge/customers.md` (Michael's $5K reference), `knowledge/competitive/positioning-matrix.md` (market gaps), `docs/architecture.md` (what's technically feasible today)

**Step 3: Check for open debates.** If your task touches an area where the team has an unresolved disagreement in `knowledge/debates.md`, surface it to the user before implementing. Don't silently pick a side.

### Full routing guide

| You need to know about... | Read these files |
|---------------------------|-----------------|
| System architecture / feasibility | `docs/architecture.md` |
| Engineering decisions / deferred work | `docs/design-considerations.md` |
| How the interview agent works | `docs/vapi-system-prompt-v3.md` |
| Interview agent capabilities | `docs/vapi-kb-capabilities-overview.md` |
| Interview prompt improvement areas | `docs/vapi-prompt-audit.md` |
| Current state / priorities | `knowledge/state.md` |
| Who thinks what | `knowledge/team.md` |
| Past decisions and why | `knowledge/decisions.md` |
| Open disagreements | `knowledge/debates.md` |
| Customer insights | `knowledge/customers.md` |
| Product direction | `knowledge/vision.md` |
| What's next / timeline | `knowledge/roadmap.md` |
| Market positioning | `knowledge/competitive/positioning-matrix.md` |
| Competitor details | `knowledge/competitive/setup-layer.md`, `upgrade-layer.md`, `observability-layer.md` |
| Defensibility | `knowledge/competitive/differentiation.md` |

---

## 11. Knowledge base write-back

When working on this codebase, keep the knowledge base in sync:

- **Decision made?** → Append to `knowledge/decisions.md` with date, decision, why, who agreed
- **Disagreement surfaced?** → Update `knowledge/debates.md` with each person's position
- **Customer interaction?** → Append to `knowledge/customers.md` with insights extracted
- **Overall state changed?** → Update `knowledge/state.md` snapshot
- **New business context?** → Read `knowledge/state.md` first before proceeding

### Prompting the user

**When you detect that a conversation has produced a new decision, insight, or shift in thinking, explicitly ask the user:**

> "This looks like a [decision / new customer insight / resolved debate / vision change]. Should I update `knowledge/[file]` to capture this?"

Do not silently update knowledge files. Do not silently skip updating them either. Always surface it. The knowledge base grows as the team grows — it should reflect the current state of thinking at all times.

Examples of when to prompt:
- User says "let's go with X approach" → "Should I log this as a decision in decisions.md?"
- User shares feedback from a customer call → "Should I add these insights to customers.md?"
- User changes their mind on an open debate → "Should I update debates.md to reflect this?"
- A feature ships that changes the project state → "Should I update state.md and roadmap.md?"

The knowledge base is the team's shared brain. Any chat should be able to read `state.md` and know exactly where things stand.

---

*AGENTS.md updated 2026-03-28. Added two-tier context routing (docs/ + knowledge/).*
