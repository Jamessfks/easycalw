# OpenClaw Concierge + Way Back Home Level 4 stack

End-to-end **OpenClaw Concierge**: consultative **Gemini Live** (ADK) session → validated **`ConciergePayload`** → **`build_zip_bytes`** setup ZIP. Includes an **Architect** agent on **A2A** (registry tools) and a **React** UI.

Reference: [Way Back Home — Level 4](https://codelabs.developers.google.com/way-back-home-level-4/instructions#0).

---

## What runs where

| Service | Port | Role |
|--------|------|------|
| **Architect** (FastAPI + A2A REST) | `8081` | ADK agent + tools over `rulebook/registry.json` (optional Redis mirror) |
| **Hub** (FastAPI) | `8080` | `POST /generate-config`, `GET /health`, static SPA, `WebSocket /ws/live` |
| **Redis** (optional) | `6379` | Seed `openclaw:registry_json` for Architect |

---

## Prerequisites

- Python **3.11+**, [uv](https://github.com/astral-sh/uv), Node **20+** (for the UI build)
- **Google Cloud** project with **Vertex AI** enabled
- **Application Default Credentials**: `gcloud auth application-default login`

---

## One-time setup

```bash
uv sync
cp env.example .env
# Edit .env: set GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, PUBLIC_ARCHITECT_URL, ARCHITECT_URL
```

Optional Redis:

```bash
docker compose up -d
REDIS_HOST=127.0.0.1 ./scripts/seed_redis.sh
```

Build the SPA (required for `http://127.0.0.1:8080/` UI):

```bash
cd frontend && npm install && npm run build && cd ..
```

---

## Run (two terminals)

**Terminal A — Architect**

```bash
PYTHONPATH=. uv run uvicorn backend.architect_agent.server:app --host 0.0.0.0 --port 8081
```

Verify agent card:

```bash
curl -sS http://127.0.0.1:8081/.well-known/agent.json | head
```

**Terminal B — Hub**

```bash
PYTHONPATH=. uv run uvicorn backend.main:app --host 0.0.0.0 --port 8080
```

Open **http://127.0.0.1:8080/** → **Start live session** → speak or use **Send text**. When the model calls `submit_concierge_payload` successfully, a **Download setup ZIP** link appears.

---

## Dev UI (Vite proxy)

```bash
cd frontend && npm run dev
```

Open **http://127.0.0.1:5173** — WebSocket and API calls proxy to the hub on `8080`.

---

## REST-only ZIP (no ADK)

```bash
curl -sS -X POST http://127.0.0.1:8080/generate-config \
  -H "Content-Type: application/json" \
  -d @fixtures/concierge_beginner.json \
  -o /tmp/openclaw-setup.zip
unzip -l /tmp/openclaw-setup.zip
```

---

## Layout

| Path | Role |
|------|------|
| `backend/main.py` | Hub: REST + WebSocket + static `frontend/dist` |
| `backend/hub/live_session.py` | `runner.run_live` bridge |
| `backend/dispatch_agent/` | Gemini Live + `RemoteA2aAgent` + `submit_concierge_payload` |
| `backend/architect_agent/` | Registry tools + A2A REST (`A2ARESTFastAPIApplication`) |
| `backend/generator/` | Jinja2 templates + `build_zip_bytes` |
| `rulebook/schema.json` | Payload JSON Schema |
| `rulebook/registry.json` | Allow-listed `clawhub` slugs |
| `Documentations/prompt.md` | Dispatch system instruction |
| `docker-compose.yml` | Redis |
| `demo.sh` | Copy-paste command summary |

---

## Troubleshooting

- **403 / permission errors on Vertex** — confirm `GOOGLE_CLOUD_PROJECT`, billing, and `aiplatform.googleapis.com` enabled; retry ADC.
- **Architect card 404** — use `/.well-known/agent.json` (see curl above); set `PUBLIC_ARCHITECT_URL` to the URL clients use.
- **`DISPATCH_LIVE_MODEL` not found** — pick a current **live / native audio** model ID for Vertex in your region; update `.env`.
- **WebSocket closes immediately** — hub checks `GOOGLE_CLOUD_PROJECT`; empty project returns an error frame on connect.
- **CORS** — adjust `CORS_ORIGINS` in `.env` for non-local frontends.

---

## Optional: container build

Multi-stage image (install uv + Node, build `frontend/dist`, run hub) is left as a follow-up; mirror [Level 4 section 6](https://codelabs.developers.google.com/way-back-home-level-4/instructions#0) for Cloud Run, set **`ARCHITECT_URL`** on the dispatch/hub service to the deployed Architect URL.

---

## Security

- Do **not** commit `.env`. Never ask users to paste API keys in the voice UI; generated markdown only references `~/.openclaw/openclaw.json` and env vars ([`Documentations/openclaw_ref.md`](Documentations/openclaw_ref.md)).
