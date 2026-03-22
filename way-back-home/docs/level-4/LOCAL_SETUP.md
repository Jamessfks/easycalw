# Level 4 — Local Setup Guide

Local equivalents for all Cloud Shell / GCloud commands in the Level 4 tutorial.

## Prerequisites

```bash
# Python 3.11+ with uv
python3 --version
uv --version

# Docker (for local Redis)
docker --version

# redis-cli (for data verification)
redis-cli --version

# Node.js 20+ (for frontend)
node --version

# gcloud CLI (for Vertex AI auth only)
gcloud --version
```

## 1. Authenticate for Vertex AI

Instead of Cloud Shell's built-in auth, use Application Default Credentials:

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

## 2. Install Python Dependencies

```bash
cd way-back-home/level_4
uv sync
```

## 3. Start Local Redis (replaces Cloud Memorystore)

The `check_redis.sh` script handles everything — starts a Docker Redis container (`ozymandias-vault`) and seeds it with schematic data:

```bash
cd way-back-home/level_4
. scripts/check_redis.sh
```

This replaces all of the following cloud commands:
- `gcloud redis instances create ozymandias-vault-prod ...`
- `gcloud compute networks subnets create ...` (VPC subnet)
- `gcloud compute networks vpc-access connectors create ...` (VPC connector)
- `gcloud compute instances create redis-seeder-...` (seeder VM)

To manually verify Redis data:

```bash
redis-cli -p 6379 LRANGE "HYPERION-X" 0 -1
# Should return: Warp Core, Flux Pipe, Ion Thruster
```

## 4. Configure Environment

```bash
cd way-back-home/level_4/backend/architect_agent

# Create .env if it doesn't exist
cat <<'EOF' > .env
GOOGLE_GENAI_USE_VERTEXAI=1
GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
GOOGLE_CLOUD_LOCATION=us-central1
EOF
```

Copy to backend root for the dispatch agent:

```bash
cp way-back-home/level_4/backend/architect_agent/.env way-back-home/level_4/backend/.env
```

## 5. Verification — Run Both Agents Locally

### Terminal A — Architect Agent

```bash
cd way-back-home/level_4/
. scripts/check_redis.sh
cd backend/architect_agent
uv run server.py
```

The Architect Agent runs on `http://localhost:8081`. Verify the A2A agent card:

```bash
curl -s http://localhost:8081/.well-known/agent.json | jq
```

This replaces:
- `gcloud builds submit . --tag gcr.io/$PROJECT_ID/architect-agent`
- `gcloud run deploy architect-agent ...`
- `curl -s ${ARCHITECT_AGENT_URL}/.well-known/agent.json | jq`

### Terminal B — Dispatch Agent (adk web)

```bash
cd way-back-home/level_4/backend/
cp architect_agent/.env .env
uv run adk web
```

Open `http://localhost:8000` in your browser. Select `dispatch_agent`, upload the blueprint image, and follow the verification steps from the tutorial.

This replaces:
- `gcloud builds submit . --tag gcr.io/$PROJECT_ID/mission-bravo`
- `gcloud run deploy mission-bravo ...`

## 6. Run Full App Locally (replaces Cloud Run deployment)

Instead of deploying to Cloud Run, run the full stack locally:

### Terminal A — Architect Agent

```bash
cd way-back-home/level_4/
. scripts/check_redis.sh
cd backend/architect_agent
uv run server.py
# Runs on http://localhost:8081
```

### Terminal B — Frontend Dev Server

```bash
cd way-back-home/level_4/frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Terminal C — Backend (Dispatch Hub)

```bash
cd way-back-home/level_4/backend
cp architect_agent/.env .env
uv run python main.py
# Runs on http://localhost:8000
```

Environment variables are loaded from `.env` via `python-dotenv`. No `--set-env-vars` flags needed.

The backend serves the frontend build from `frontend/dist/` if it exists. For development, use the Vite dev server (Terminal B) instead.

## Command Mapping Reference

| Cloud Shell Command | Local Equivalent |
|---|---|
| `gcloud auth list` | `gcloud auth application-default login` |
| `gcloud config set project $(cat ~/project_id.txt)` | `gcloud config set project YOUR_PROJECT_ID` |
| `gcloud services enable ...` | Not needed locally |
| `gcloud redis instances create ...` | `. scripts/check_redis.sh` (Docker) |
| `gcloud compute networks subnets create ...` | Not needed locally |
| `gcloud compute networks vpc-access connectors create ...` | Not needed locally |
| `gcloud compute instances create redis-seeder-...` | `. scripts/check_redis.sh` (auto-seeds) |
| `cd $HOME/way-back-home/level_4/` | `cd way-back-home/level_4/` |
| `uv run server.py` | `uv run server.py` (same) |
| `uv run adk web` | `uv run adk web` (same) |
| `gcloud builds submit . --tag ...` | Not needed (run directly) |
| `gcloud run deploy architect-agent ...` | `uv run server.py` |
| `gcloud run deploy mission-bravo ...` | `uv run python main.py` |
| `curl ${ARCHITECT_AGENT_URL}/.well-known/agent.json` | `curl http://localhost:8081/.well-known/agent.json` |
