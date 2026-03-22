# OpenClaw Concierge

A two-phase AI system that interviews users via voice and generates a personalized OpenClaw engine setup guide. Uses [Vapi](https://vapi.ai/) for voice infrastructure and a backend agent for guide generation.

---

## How it works

```
User (voice) ↔ Vapi Cloud (ASR + LLM + TTS) → transcript → Formatter → Setup Guide Agent → Output
```

1. **Interview Phase** — The user has a voice conversation with a Vapi-powered AI agent. Vapi handles all audio streaming, speech recognition, text-to-speech, interruption handling, and turn-taking. Our frontend displays a two-panel UI (agent avatar + live transcript).
2. **Formatter** — A single LLM call cleans up the raw transcript into structured Markdown.
3. **Setup Guide Creation Phase** — A backend agent reads the formatted transcript and generates a personalized setup guide, reference documents, and initialization prompts.

**Output:**
- `OPENCLAW_ENGINE_SETUP_GUIDE.md` — the main setup guide
- `reference_documents/` — sub-setup docs for conditional steps
- `prompts_to_send.md` — messages to initialize the user's OpenClaw agent

---

## Documentation

| # | Document | Purpose |
|---|----------|---------|
| 1 | **This README** | Project overview |
| 2 | [`docs/architecture.md`](docs/architecture.md) | Technical architecture, Vapi integration, project structure, data flow |
| 3 | [`docs/design-considerations.md`](docs/design-considerations.md) | Engineering decisions, UI specs, debates, open questions |
| 4 | [`docs/AGENTS.md`](docs/AGENTS.md) | Instructions for AI coding agents (invariants, build order, do-not rules) |

---

## Project structure

```
backend/
├── main.py                    # FastAPI: Vapi webhook + formatter + guide generation endpoints
├── setup_guide_agent/         # Phase 2: backend-only guide generation
├── formatter.py               # Transcript cleanup LLM call
└── vapi_config.py             # Vapi assistant ID, keys, webhook handling

frontend/
├── src/
│   ├── InterviewView.jsx      # Two-panel: agent avatar + live transcript
│   ├── SetupGuideView.jsx     # Loading → output display
│   └── useVapi.js             # Vapi SDK hook (replaces all WebSocket/audio code)
└── public/
    ├── agent-listening.png    # Avatar (listening state)
    └── agent-talking.png      # Avatar (talking state)

system_knowledge_base/          # Provided by another team
way-back-home/level_4/         # Reference implementation (UI layout patterns only)
```

---

## Build order

1. **Interview Phase** — Connect Vapi SDK to frontend, build two-panel UI
2. **Formatter** — Single LLM endpoint for transcript cleanup
3. **Setup Guide Creation** — Backend agent + output display UI

See [`docs/AGENTS.md`](docs/AGENTS.md) for detailed build instructions.

---

## Developer setup

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Python | >= 3.11 | Backend |
| `uv` | any recent | Python package manager |
| Node.js | 20+ | Frontend |
| Docker | any recent | Redis (for Way Back Home reference) |
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

**No `.env` file is needed for Google Cloud auth.** The Way Back Home reference (`way-back-home/level_4/`) has `load_dotenv()` calls but no `.env` file — it relies entirely on gcloud CLI config. Its `scripts/init.sh` stores the project ID in `~/project_id.txt` and runs `gcloud config set project`.

App-level env vars (PORT, REDIS_HOST, MODEL_ID, etc.) have sensible defaults and only need overriding for non-standard setups.

---

*OpenClaw Concierge v4.0 — 2026-03-22*
