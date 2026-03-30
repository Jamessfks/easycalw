# EasyClaw v5.0 — Major Architecture Overhaul

**Date:** 2026-03-28
**Authors:** James Zhao + Claude Code

---

## Summary

Two major changes shipped in v5.0:

1. **Frontend redesign** — Complete UI overhaul with warm orange theme, 3D interactive mascot, Framer Motion transitions
2. **Backend rewrite** — Guide generation rewritten from 20-turn agent loop to single-pass API call (10x faster, 10x cheaper)

---

## 1. Frontend Redesign

### What changed

The entire frontend was redesigned from a cold cyber-blue dark theme to a warm, premium orange-accented design following the 60-30-10 color rule (science-backed).

### Color system

| Role | Old | New |
|------|-----|-----|
| Background (60%) | Cold blue-black `#0a0e17` | Warm stone `#0C0A09` |
| Surface (30%) | Blue-gray `#0f1420` | Stone `#1C1917` |
| Accent (10%) | Cyan `#22d3ee` | Orange `#F97316` |
| Secondary | Blue `#3b82f6` | Violet `#8B5CF6` |

### Typography

- **Before:** Space Grotesk
- **After:** Plus Jakarta Sans (warmer, rounder, better at small sizes)
- Monospace unchanged: JetBrains Mono

### New components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| `ClawScene.jsx` | React Three Fiber + drei | 3D interactive crab mascot with mouse tracking, hover/click animations |
| Page transitions | Framer Motion `AnimatePresence` | Smooth fade/slide between all app phases |

### 3D Claw mascot (`ClawScene.jsx`)

Built with React Three Fiber (no external 3D assets needed):
- **Geometry:** Procedural — spheres, cylinders, tori composing a cartoon crab
- **Interactions:** Mouse-tracking parallax, hover opens pincers, click snaps them shut
- **States:** `idle` (landing page, floating), `building` (loading screen, spinning)
- **Performance:** Lazy-loaded via `React.lazy()`, separate chunk (~243KB gzipped)
- **Lighting:** Sunset environment + warm directional + contact shadows

### Design principles

- **One CTA per screen** — large orange pill button with glow shadow
- **Single-viewport hero** — no scrolling needed to start an interview
- **Centered interview layout** — avatar + transcript stacked vertically, not side-by-side
- **Pill-shaped buttons** everywhere (`rounded-full`)

### Files modified (15)

- `tailwind.config.js` — new color palette, claw animations
- `index.html` — Plus Jakarta Sans font, lobster emoji favicon
- `index.css` — warm glass effects, orange prose accents
- `EasyClawLanding.jsx` — single-viewport hero with 3D claw
- `InterviewView.jsx` — centered single-column layout
- `DemoInterviewView.jsx` — matching centered layout
- `OutputSelector.jsx` — orange checkboxes/CTAs
- `App.jsx` — Framer Motion page transitions
- `AgentPresence.jsx` — compact avatar with orange states
- `Transcript.jsx` — orange agent badges
- `LoadingScreen.jsx` — 3D claw building state, orange progress
- `OutputDisplay.jsx` — orange tabs, warm hero card
- `DemoNavigator.jsx` — tighter cards
- `GuideActions.jsx` — pill action buttons
- `ReferenceDocCard.jsx` — orange icon accent

### New dependencies

```
framer-motion
three @react-three/fiber @react-three/drei
```

`lottie-react` was installed but not yet used (reserved for future micro-celebrations).

---

## 2. Backend: Single-Pass Guide Generation

### The problem

The old architecture used the **Claude Agent SDK**, which spawned the Claude CLI as a subprocess. The agent ran a multi-turn loop of 20-25 API calls, each re-sending the entire conversation history + 8,500-token system prompt.

| Metric | Old (multi-turn) | New (single-pass) |
|--------|-------------------|-------------------|
| API calls per guide | 20-25 | 1 |
| Time | 5-10 minutes | 30-60 seconds |
| Cost | $1.50-2.00 | $0.10-0.15 |
| Guide length | ~20K chars | ~21K chars |
| Personalization | Weak (generic) | Strong (user-specific) |
| External deps | Claude CLI binary | None (standard `anthropic` SDK) |

### Root causes of old slowness

1. **System prompt (8,500 tokens) re-sent on every turn** — 20 turns = 170K wasted tokens
2. **Agent wasted turns re-reading files** already injected in the prompt
3. **Quality evaluator + patch** added 2 more API calls after generation
4. **Formatter used Claude Haiku** — unnecessary API call for simple ASR cleanup
5. **Sequential pipeline** — no parallelization

### New architecture

```
Transcript
    ↓
[Regex formatter] ← no API call needed
    ↓
[Python context gatherer] ← reads KB files directly
    ├── Detects: deployment, channel, industry, tools
    ├── Loads: setup guide, channel docs, industry knowledge
    ├── Greps: skill registry for relevant skills
    ├── Loads: cron docs, security docs, template
    └── Optional: KB semantic search (keyword fallback if Gemini unavailable)
    ↓
[ONE Claude API call] ← all context in the prompt
    ↓
[Parse <file> tags from response]
    ↓
Write files to disk → Return to frontend
```

### What was removed

| Component | Why removed |
|-----------|-------------|
| `claude_agent_sdk` dependency | Spawned CLI subprocess, required binary install on server |
| Claude CLI (`claude` binary) | No longer needed — direct API |
| Quality evaluator (`guide_evaluator.py`) | Band-aid for weak generation; invest tokens in better prompt instead |
| Patch mechanism | Rewrote guide blind (no KB access); removing it saves an API call |
| Haiku formatter | Regex does the same job for ASR cleanup, saves API call + latency |
| Tool definitions (Read/Write/Glob/Grep) | Context now gathered in Python, not by the LLM |
| Multi-turn message history | Single call = no history accumulation |

### Context gathering (`_gather_context`)

Instead of the LLM discovering files over 20 turns, Python pre-gathers everything:

1. **Deployment guide** — matched via keyword detection (Mac/Docker/VPS)
2. **Channel docs** — matched to user's stated channel
3. **Industry knowledge** — matched to industry keywords
4. **Skill registry** — grep'd for relevant skills (not sent in full)
5. **Cron/automation docs** — always included (almost always needed)
6. **Security docs** — always included
7. **Template** — formatting reference
8. **Semantic KB results** — top 3 supplementary docs (if available)

Total context: ~25K chars, well under the 30K token/minute rate limit.

### System prompt

Reduced from **5,097 words (8,500 tokens)** to **~800 words (~1,200 tokens)**.

Removed:
- Tool usage strategy (no tools anymore)
- Turn/budget management (single call)
- 7-step reasoning chain (LLM gets all context upfront)
- Quality rubric (removed eval loop)
- Edge case handling (handled by Python context gatherer)

Kept:
- 6-phase output structure
- Style rules (callout boxes, personal touches, verification blocks)
- No-hallucination rule
- Skill grounding rule

### Rate limiting

Built-in retry with backoff (20s/40s/60s) for Anthropic 429 errors. The prompt is sized to stay under 30K input tokens per minute.

### KB search fallback

If Gemini embeddings are unavailable (quota exhausted), KB search falls back to keyword matching. This was added in `kb_search.py` and works with zero API calls.

---

## 3. Infrastructure Changes

### Railway deployment

- **Removed:** `npm install -g @anthropic-ai/claude-code` from `nixpacks.toml`
- **Removed:** `claude_agent_sdk` dependency (still in `requirements.txt` but no longer imported)
- **Note:** `ANTHROPIC_API_KEY` should be set as a Railway environment variable, not in the committed `.env` file

### Security note

`backend/.env` is still tracked in git (historical). It should be removed from tracking:
```bash
git rm --cached backend/.env
```
All secrets should be set as Railway environment variables instead.

---

## 4. Migration notes

### For developers

- `claude_agent_sdk` import is gone from `agent.py`. Can be removed from `requirements.txt`.
- `guide_evaluator.py` still exists but is no longer called. Can be deleted.
- `formatter.py` still has Gemini/Haiku code but defaults to regex. The LLM paths can be removed.
- The `CLAUDE_CLI_PATH` env var is no longer used.

### For deployment

- No Claude CLI needed on the server
- Only required env vars: `ANTHROPIC_API_KEY`
- Optional: `GEMINI_API_KEY` (for KB semantic search — keyword fallback works without it)
