# Way Back Home Level 4 + OpenClaw extras

This repo follows **[Way Back Home — Level 4](https://codelabs.developers.google.com/way-back-home-level-4/instructions#0)** end-to-end:

- **Dispatch** — Google ADK **Gemini Live** (bidi audio/video), **`monitor_for_hazard`** streaming tool, **`execute_architect`** via **A2A**
- **Architect** — **Redis** schematic vault, **`lookup_schematic_tool`**, A2A **Agent Card** on **:8081**
- **FastAPI + WebSocket** — `backend/main.py` bridges the React UI to `Runner.run_live`
- **React** — `frontend/` Volatile Workbench (screen + mic → backend)

Team planning for **OpenClaw Concierge** lives in [`memory.md`](memory.md). A stub **`POST /generate-config`** (minimal zip) remains for that track; the **default demo path** is the Level 4 mission.

---

## Quick demo (5 steps)

1. **Install Python deps** (repo root):

   ```bash
   uv sync
   # or: pip install -r requirements.txt
   ```

2. **GCP + Vertex** — `cp backend/.env.example backend/.env`, set `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, run `gcloud auth application-default login`.

3. **Redis + seed** (one command):

   ```bash
   ./demo.sh
   ```

   This runs `docker compose up -d` and `./scripts/seed_redis_schematics.sh`.

4. **Two terminals**

   ```bash
   # Terminal A — Architect
   cd backend/architect_agent && ../../.venv/bin/python server.py

   # Terminal B — build UI once, then dispatch
   cd frontend && npm install && npm run build
   cd ../backend && ../.venv/bin/python main.py
   ```

5. **Browser** — [http://127.0.0.1:8000](http://127.0.0.1:8000) → **INITIATE UPLINK** → allow **screen + mic** → note **TARGET: &lt;DRIVE&gt;** → say **“start to assemble”** (see [codelab §5–Mission Execution](https://codelabs.developers.google.com/way-back-home-level-4/instructions#0)).

Optional: `curl -s http://localhost:8081/.well-known/agent.json | head` to verify the Architect card.

---

## Layout

| Path | Role |
|------|------|
| [`docker-compose.yml`](docker-compose.yml) | Local Redis `ozymandias-vault` (:6379) |
| [`demo.sh`](demo.sh) | Starts Redis + seeds schematics |
| [`backend/main.py`](backend/main.py) | WebSocket `/ws/{user_id}/{session_id}`, static `frontend/dist`, `POST /generate-config` |
| [`backend/dispatch_agent/`](backend/dispatch_agent/) | Live dispatch + hazard monitor + A2A client |
| [`backend/architect_agent/`](backend/architect_agent/) | Redis tool + `to_a2a` server |
| [`scripts/seed_redis_schematics.sh`](scripts/seed_redis_schematics.sh) | Codelab `RPUSH` ship lists |
| [`rulebook/`](rulebook/) | OpenClaw concierge stubs (optional) |

---

## Production

Memorystore + VPC + **Cloud Run** for Architect and Dispatch: **section 6** of the [Level 4 codelab](https://codelabs.developers.google.com/way-back-home-level-4/instructions#0). Set `ARCHITECT_URL` on the Dispatch service to the deployed Architect URL.

---

## OpenClaw stub

```bash
curl -sS -X POST http://127.0.0.1:8000/generate-config \
  -H "Content-Type: application/json" \
  -d '{"user_intent":"demo","selected_skills":"clawhub install demo","hardware_preference":"mac_mini_home","channel_preference":"telegram"}' \
  -o openclaw-setup.zip
```
