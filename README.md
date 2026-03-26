# OpenClaw Concierge

EasyClaw interviews users via voice about their needs, then generates a fully personalized OpenClaw engine setup guide — complete with install commands, configuration, initialization prompts, and security hardening steps.

Uses [Vapi](https://vapi.ai/) for voice infrastructure and Claude Agent SDK for guide generation.

---

## How it works

```
User (voice) ↔ Vapi Cloud (ASR + LLM + TTS) → transcript → Formatter → Guide Pipeline → Output
```

1. **Interview Phase** — The user has a voice conversation with a Vapi-powered AI agent. Vapi handles all audio streaming, speech recognition, text-to-speech, interruption handling, and turn-taking. Our frontend displays a two-panel UI (agent avatar + live transcript).
2. **Formatter** — A single LLM call (Gemini Flash primary, Claude Haiku fallback) cleans up the raw transcript into structured Markdown.
3. **Setup Guide Creation Phase** — Three sequential LLM calls generate the setup guide, reference documents, and initialization prompts.

**Output:**
- `OPENCLAW_ENGINE_SETUP_GUIDE.md` — the main setup guide
- `reference_documents/` — sub-setup docs for conditional steps
- `prompts_to_send.md` — messages to initialize the user's OpenClaw agent

---

## Quick Start

### Backend

```bash
# Install dependencies
uv sync

# Set up environment variables (copy template and fill in API keys)
cp backend/.env.template backend/.env

# Google Cloud auth (for Gemini formatter)
gcloud auth login
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID

# Run the backend
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default (Vite dev server).

### Production (Railway / Nixpacks)

The app is configured for Railway deployment via `nixpacks.toml` and `Procfile`. The build installs Python + Node dependencies and serves the backend with uvicorn.

---

## Documentation

| # | Document | Purpose |
|---|----------|---------|
| 1 | **This README** | Project overview and quick start |
| 2 | [`docs/architecture.md`](docs/architecture.md) | Technical architecture, Vapi integration, data flow |
| 3 | [`docs/design-considerations.md`](docs/design-considerations.md) | Engineering decisions, UI specs, debates, open questions |
| 4 | [`AGENTS.md`](AGENTS.md) | Instructions for AI coding agents (invariants, build order, do-not rules) |

---

## Project structure

```
backend/
├── main.py                    # FastAPI: Vapi webhook + pipeline endpoints
├── formatter.py               # Interview transcript formatter (Gemini → Haiku → regex)
├── mock_data.py               # Mock data for demo/testing
├── vapi_config.py             # Vapi assistant ID, keys, webhook handling
├── .env.template              # Environment variable template
└── setup_guide_agent/
    ├── __init__.py
    ├── agent.py               # Claude Agent SDK orchestration
    ├── system_prompt.md       # Setup Guide Creation Agent system prompt
    └── context/               # Knowledge base (domain knowledge, openclaw-docs, templates)

frontend/
├── src/
│   ├── App.jsx                # Route between views
│   ├── main.jsx               # App entry point
│   ├── EasyClawLanding.jsx    # Landing page
│   ├── StartScreen.jsx        # Interview start screen
│   ├── InterviewView.jsx      # Two-panel: agent avatar + live transcript
│   ├── SetupGuideView.jsx     # Loading → output display
│   ├── GuidePageView.jsx      # Guide page view
│   ├── useVapi.js             # Vapi SDK hook (start/stop, event listeners)
│   ├── useGuideStream.js      # SSE streaming hook for guide generation
│   ├── index.css              # Global styles
│   ├── lib/                   # Utility modules
│   └── components/
│       ├── AgentPresence.jsx  # 3 avatar PNGs + animated mic circle
│       ├── Transcript.jsx     # Live transcript fed by Vapi message events
│       ├── LoadingScreen.jsx  # Phase 2 waiting state
│       ├── OutputDisplay.jsx  # Rendered Markdown + copy + download
│       ├── DemoNavigator.jsx  # Demo mode navigation
│       ├── ErrorBoundary.jsx  # React error boundary
│       └── Scorecard.jsx      # Interview scorecard display
├── public/
│   ├── agent_listening_avatar.png
│   ├── agent_thinking_avatar.png
│   └── agent_talking_avatar.png
├── package.json
└── vite.config.js

docs/                           # Architecture & design docs
AGENTS.md                       # AI coding agent instructions
pyproject.toml                  # Python project config (uv/pip)
nixpacks.toml                   # Railway deployment config
Procfile                        # Process definition for deployment
```

---

## Developer setup

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Python | >= 3.11 | Backend |
| `uv` | any recent | Python package manager |
| Node.js | 20+ | Frontend |
| Docker | any recent | Optional (containerized deployment) |
| `gcloud` CLI | any recent | Google Cloud authentication |

### Google Cloud authentication

This project uses **gcloud CLI project configuration** for all Google Cloud auth — **not `.env` files with API keys or project IDs**.

```bash
# One-time setup
gcloud auth login
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

Google Cloud SDKs resolve credentials automatically via [Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials). ADC checks, in order:
1. `GOOGLE_APPLICATION_CREDENTIALS` env var (if set)
2. User credentials from `gcloud auth application-default login`
3. Service account credentials (if running on GCP)

**No `.env` file is needed for Google Cloud auth.**

App-level env vars (PORT, REDIS_HOST, MODEL_ID, etc.) have sensible defaults and only need overriding for non-standard setups.

---

*OpenClaw Concierge v4.3 — 2026-03-25*
