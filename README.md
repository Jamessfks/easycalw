# OpenClaw Concierge

A two-phase AI system that interviews users via voice and generates a personalized OpenClaw engine setup guide. Uses [Vapi](https://vapi.ai/) for voice infrastructure.

---

## How it works

```
User (voice) ↔ Vapi Cloud (ASR + LLM + TTS) → transcript → Formatter → Guide Pipeline → Output
```

1. **Interview Phase** — The user has a voice conversation with a Vapi-powered AI agent. Vapi handles all audio streaming, speech recognition, text-to-speech, interruption handling, and turn-taking. Our frontend displays a two-panel UI (agent avatar + live transcript).
2. **Formatter** — A single LLM call (Anthropic Claude) cleans up the raw transcript into structured Markdown.
3. **Setup Guide Creation Phase** — Three sequential LLM calls generate the setup guide, reference documents, and initialization prompts.

**Output:**
- `OPENCLAW_ENGINE_SETUP_GUIDE.md` — the main setup guide
- `reference_documents/` — sub-setup docs for conditional steps
- `prompts_to_send.md` — messages to initialize the user's OpenClaw agent

---

## Documentation

| # | Document | Purpose |
|---|----------|---------|
| 1 | **This README** | Project overview |
| 2 | [`docs/architecture.md`](docs/architecture.md) | Technical architecture, Vapi integration, data flow |
| 3 | [`docs/design-considerations.md`](docs/design-considerations.md) | Engineering decisions, UI specs, debates, open questions |
| 4 | [`AGENTS.md`](AGENTS.md) | Instructions for AI coding agents (invariants, build order, do-not rules) |

---

## Project structure

```
backend/
├── main.py                    # FastAPI: Vapi webhook + pipeline endpoints
├── setup_guide_agent/         # Phase 2: 3-step guide pipeline
│   ├── agent.py               # Pipeline orchestration
│   ├── system_prompt.md       # Placeholder (other team delivers)
│   └── setup_references.md    # Placeholder (other team delivers)
├── formatter.py               # Interview transcript formatter
└── vapi_config.py             # Vapi assistant ID, keys, webhook handling

frontend/
├── src/
│   ├── InterviewView.jsx      # Two-panel: agent avatar + live transcript
│   ├── SetupGuideView.jsx     # Loading → output display
│   └── useVapi.js             # Vapi SDK hook (replaces all WebSocket/audio code)
└── public/
    ├── agent-listening.png    # Avatar (listening state)
    └── agent-talking.png      # Avatar (talking state)

docs/                           # Architecture & design docs
AGENTS.md                       # AI coding agent instructions
```

---

## Build order

1. **Interview Phase** — Connect Vapi SDK to frontend, build two-panel UI
2. **Formatter** — LLM call for transcript cleanup
3. **Setup Guide Creation** — 3-step LLM pipeline + output display UI

See [`AGENTS.md`](AGENTS.md) for detailed build instructions.

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

The Google ADK and Gemini SDKs resolve credentials automatically via [Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials). ADC checks, in order:
1. `GOOGLE_APPLICATION_CREDENTIALS` env var (if set)
2. User credentials from `gcloud auth application-default login`
3. Service account credentials (if running on GCP)

**No `.env` file is needed for Google Cloud auth.**

App-level env vars (PORT, REDIS_HOST, MODEL_ID, etc.) have sensible defaults and only need overriding for non-standard setups.

---

*OpenClaw Concierge v4.1 — 2026-03-22*
