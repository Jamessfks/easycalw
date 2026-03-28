# CLAUDE.md — EasyClaw (OpenClaw Concierge)

**Read AGENTS.md and docs/architecture.md before coding.** This file adds Claude Code-specific rules on top of those.

---

## Project Identity

EasyClaw is a two-phase AI system: voice interview (Vapi) → personalized OpenClaw setup guide (Claude Agent SDK). A 2-minute conversation produces a 28K-character, production-ready guide with install commands, channel setup, security defaults, and copy-paste prompts.

## Tech Stack

- **Backend:** FastAPI, Python 3.11+, `uv` package manager
- **Frontend:** React 18 + Vite + Tailwind CSS (dark mode)
- **Voice:** Vapi SDK (`@vapi-ai/web`) — no WebSocket/audio code in our repo
- **Agent:** `claude-agent-sdk` with 40-turn / $3.00 budget
- **DB:** Supabase (async client) with in-memory fallback
- **Embeddings:** FAISS + Gemini embeddings for KB semantic search
- **Deploy:** Railway (backend) + Vercel (frontend option)

## Critical Rules

### Never Do
- Invent skill slugs — always Grep `backend/setup_guide_agent/context/skill_registry.md`
- Store real API keys in any output file — use `YOUR_<SERVICE>_API_KEY` placeholders
- Use sync LLM calls inside async handlers — always `asyncio.to_thread()` or async client
- Write WebSocket or audio code — Vapi handles all voice infrastructure
- Modify files in `backend/setup_guide_agent/context/` without explicit user instruction
- Break the `/webhook` endpoint contract — Vapi is configured to hit it
- Read `skill_registry.md` in full — always Grep by keyword
- Add JSON schemas between phases — Markdown only for inter-agent data

### Always Do
- Read `KNOWLEDGE_INDEX.md` before Globbing the knowledge base
- Wrap sync SDK calls: `await asyncio.to_thread(client.messages.create, ...)`
- Use the existing `GuideStore` for persistence (not raw dicts or new stores)
- Validate Supabase column names against `backend/SUPABASE_SETUP.md` schema
- Test formatter changes with all 3 tiers: Gemini Flash → Claude Haiku → regex fallback
- Use SSE events for any long-running operation the frontend needs to track

## Architecture Quick Reference

```
Voice (Vapi) → /webhook → Formatter (Gemini Flash / Haiku / regex)
                               ↓
                    Setup Guide Agent (Claude Agent SDK)
                    ├── Reads: context/ (KB, 499 docs, FAISS-indexed)
                    └── Writes: guide_output/<id>/
                         ├── EASYCLAW_SETUP.md
                         ├── reference_documents/*.md
                         └── prompts_to_send.md
                               ↓
                    Frontend (SSE stream → OutputDisplay)
```

## Key File Paths

| File | Purpose |
|------|---------|
| `backend/main.py` | FastAPI entry, CORS, rate limiting, startup |
| `backend/routes/guides.py` | Guide CRUD, generation trigger, SSE streaming |
| `backend/routes/webhook.py` | Vapi webhook receiver |
| `backend/formatter.py` | Transcript cleanup (3-tier fallback) |
| `backend/setup_guide_agent/agent.py` | Claude Agent SDK orchestration |
| `backend/setup_guide_agent/system_prompt.md` | 545-line reasoning chain (CRITICAL) |
| `backend/setup_guide_agent/context/KNOWLEDGE_INDEX.md` | KB routing table — read FIRST |
| `backend/setup_guide_agent/context/skill_registry.md` | 435 skills — Grep only |
| `backend/supabase_store.py` | Async Supabase + in-memory fallback |
| `backend/guide_evaluator.py` | LLM-as-Judge quality scoring |
| `backend/mock_data.py` | Demo guides + scorecard computation |
| `frontend/src/App.jsx` | Route orchestration |
| `frontend/src/useGuideStream.js` | SSE + polling for guide progress |
| `frontend/src/components/OutputDisplay.jsx` | Guide rendering (3 tabs) |

## Environment Variables

Backend requires: `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `VAPI_ASSISTANT_ID`, `VAPI_PUBLIC_KEY`
Optional: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VAPI_WEBHOOK_SECRET`, `GUIDE_MODEL`

## Running Locally

```bash
cd backend && uv sync && uv run uvicorn main:app --reload --port 8000
cd frontend && npm install && npm run dev
```

## Testing

```bash
cd backend && uv run pytest                    # unit tests
cd frontend && npx playwright test             # e2e tests
```

## Code Style

- Python: no type stubs needed, f-strings preferred, async-first
- JS/JSX: functional components, hooks, no TypeScript, no Zustand/Redux
- Markdown: all agent output and inter-phase data
- Dark mode: all frontend components must support Tailwind dark theme
- No docstrings on obvious functions, no trailing summaries in responses

## Known Issues (as of 2026-03-28)

1. `GET /guide/{id}` uses sync-only memory lookup — never queries Supabase after restart
2. `list_guides` queries nonexistent `metadata` column in Supabase
3. `_cleanup_old_guides` uses `pop_sync` — never deletes from Supabase
4. `created_at` never set in in-memory store — sorting broken in fallback mode
5. Gemini formatter disabled (free tier quota) — Claude Haiku is current primary
