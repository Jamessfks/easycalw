# EasyClaw — Railway Deployment Guide

## Required Environment Variables

### Backend (set in Railway service)

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes* | Claude API key for guide generation (primary model) |
| `GEMINI_API_KEY` | Yes | Google Gemini key — used for formatter, evaluator, embeddings, and fallback guide generation |
| `VAPI_PUBLIC_KEY` | Yes | VAPI public key for voice interview widget |
| `VAPI_ASSISTANT_ID` | Yes | VAPI assistant ID for the concierge agent |
| `VAPI_WEBHOOK_SECRET` | Yes | HMAC secret for verifying VAPI webhook signatures |
| `GUIDE_OUTPUT_DIR` | No | Path to store generated guides (default: `./guide_output`) |
| `GUIDE_STORE_PATH` | No | Path to guide persistence JSON (default: `/tmp/easyclaw_guide_store.json`) |
| `GUIDE_MODEL` | No | Claude model for guide generation (default: `claude-sonnet-4-6`) |

> *If `ANTHROPIC_API_KEY` is missing or empty, guide generation automatically falls back to Gemini 2.5 Pro. Both keys should be set for production reliability.

### Frontend (build-time)

| Variable | Description |
|----------|-------------|
| `VITE_VAPI_PUBLIC_KEY` | VAPI public key (same value as backend `VAPI_PUBLIC_KEY`) |
| `VITE_VAPI_ASSISTANT_ID` | VAPI assistant ID (same value as backend `VAPI_ASSISTANT_ID`) |
| `VITE_API_BASE` | Backend API URL (e.g., `https://easyclaw-production.up.railway.app`) |

## Railway Configuration

### Build Commands

```bash
# Backend (Python)
pip install -r requirements.txt    # or: pip install uv && uv sync

# Frontend (Node)
cd frontend && npm ci && npm run build
```

The `nixpacks.toml` handles this automatically on Railway:
- Python 3.11 + Node 20
- Installs pip deps + builds frontend in one phase

### Start Command

```bash
cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
```

Already configured in `Procfile` and `nixpacks.toml`.

### Health Check

Configure Railway health check to poll:

```
GET /health
```

Returns `{"status": "ok", ...}` with model info and in-memory guide count.

### Persistent Volume

Mount a Railway persistent volume at a stable path (e.g., `/data/guides`) and set:

```
GUIDE_OUTPUT_DIR=/data/guides
GUIDE_STORE_PATH=/data/easyclaw_guide_store.json
```

Without a persistent volume, generated guides are lost on redeploy. The backend persists guide state to `GUIDE_STORE_PATH` and reads it back on startup for crash recovery.

## SSE Heartbeat

The `/events/{guide_id}` SSE endpoint sends a `heartbeat` event every 25 seconds when no real events are queued. This exists because **Railway's reverse proxy drops idle connections after 60 seconds**. Without the heartbeat, long-running guide generations (30-90s) would get disconnected mid-stream, leaving the frontend hanging.

## Fallback Chain

The system has layered fallbacks for resilience:

- **Guide generation**: Claude (primary) → Gemini 2.5 Pro (fallback)
- **Transcript formatting**: Gemini Flash (primary) → Claude Haiku (fallback) → regex (last resort)
- **Guide evaluation**: Gemini Flash (always — cheap and fast)
- **KB embeddings**: Gemini embedding-001

## Post-Deploy Checklist

1. Verify `/health` returns `"status": "ok"`
2. Test voice interview via frontend (checks VAPI integration)
3. Test guide generation end-to-end (checks API keys + volume)
4. Confirm SSE stream connects and stays alive during generation
5. Check rate limits are appropriate for expected traffic
