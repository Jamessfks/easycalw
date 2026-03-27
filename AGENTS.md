# Instructions for AI Coding Agents — OpenClaw Concierge

**STOP. Read this entire file before touching any code.**

---

## 1. Source of truth (read order)

| Priority | Document | What you take from it |
|----------|----------|----------------------|
| 1 | `docs/architecture.md` | System architecture, Vapi integration, project structure, data flow |
| 2 | `docs/design-considerations.md` | Engineering decisions, UI specs, open questions, what's deferred |
| 3 | This file (`AGENTS.md`) | Invariants, file paths, build order, do-not rules |

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

docs/
├── architecture.md                 # MUST READ before coding
└── design-considerations.md        # MUST READ before coding
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

*AGENTS.md updated 2026-03-26. Previous version was stale.*
