# OpenClaw Voice Concierge — Level 4 prototype

This folder reuses the **Way Back Home Level 4** React shell and replaces the backend with a **two-agent Google ADK** flow:

1. **Interview agent (live, BIDI)** — WebSocket + microphone; tools load `openclaw_knowledge/setup_requirements.md` and search `openclaw_knowledge/domain/*.md`.
2. **Output agent (batch)** — `POST /api/v1/generate-guide` with the on-screen transcript; returns `OPENCLAW_ENGINE_SETUP_GUIDE.md` content.

There is **no** JSON-schema or contract validation in the orchestration path (prototype only).

## Prerequisites

- Python 3.11+ and [uv](https://docs.astral.sh/uv/) (or use your own venv with `pyproject.toml` deps).
- Node.js 20+ for the frontend.
- Google credentials configured for **google-genai** / ADK (API key and/or Vertex with ADC), same as other Way Back Home labs.

## Run (development)

Terminal A — API + WebSocket (from repo root paths are illustrative):

```bash
cd way-back-home/level_4
cp .env.example .env
# Edit .env with your Google settings.

cd backend
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Terminal B — Vite dev server (proxies `/api` and `/ws` to port 8000):

```bash
cd way-back-home/level_4/frontend
npm install
npm run dev
```

Open the URL Vite prints — the dev server uses **HTTPS** (via `@vitejs/plugin-basic-ssl`) so **microphone access works on a LAN IP**, not only `localhost`. Use **`https://localhost:5173`** or **`https://<your-LAN-IP>:5173`** and accept the self-signed certificate warning in the browser. Click **Start voice interview**, speak, then **Generate setup guide**.

## Run (single port — built UI)

```bash
cd way-back-home/level_4/frontend && npm run build
cd ../backend && uv run uvicorn main:app --host 0.0.0.0 --port 8000
```

Open `http://localhost:8000`.

## Customize knowledge

- Edit `backend/openclaw_knowledge/setup_requirements.md` (interview checklist).
- Add or change `backend/openclaw_knowledge/domain/*.md` (domain tool search).
- Edit `backend/openclaw_knowledge/registry_hints.md` (example `clawhub` lines for the output agent).

## Original Mission Bravo UI

The previous dispatch / workbench demo remains in `frontend/src/VolatileWorkbench.jsx`; `App.jsx` now mounts `OpenClawVoiceConcierge.jsx` instead.
