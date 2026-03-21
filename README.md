# OpenClaw Concierge (backend)

FastAPI service that receives **Vapi** webhooks, extracts **use cases** from structured outputs (or test JSON), and maps them to **ClawHub** install commands via a skill lookup table.

## Quick start

```bash
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- **API:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) (Swagger)
- **Webhook:** `POST /webhook` — set this URL in Vapi’s server URL / forwarding (e.g. `https://<your-host>/webhook`).

## `POST /webhook`

Accepts JSON. Use cases are read from, in order:

- Top-level `use_cases` or `useCases` (handy for manual tests)
- `message.call.artifact.structuredOutputs[*].result` (and the same under `message.artifact` when present)
- Any nested object that contains `use_cases` / `useCases` if the paths above are empty

**Example (minimal test):**

```bash
curl -s -X POST http://127.0.0.1:8000/webhook \
  -H "Content-Type: application/json" \
  -d '{"use_cases": ["email automation", "calendar"]}'
```

**Response fields:** `message_type`, `use_cases`, `skill_mapping`, `unique_install_commands`, `unique_skill_slugs`.

## Repo layout

| Path | Role |
|------|------|
| `backend/main.py` | FastAPI app and `/webhook` |
| `backend/vapi_payload.py` | Extract `use_cases` from Vapi-shaped payloads |
| `backend/skill_lookup_table.py` | Maps use-case phrases → `clawhub install …` |
| `requirements.txt` | Python dependencies |

## Roadmap (from team plan)

- Wire **Gemini** (or another model) to generate `SOUL.md`, `USER.md`, and `setup.sh`, then return a zip for download.
- Frontend: Vapi Web SDK, transcript, download flow.

## Team notes

- **Vapi phone number:** +1 (209) 806-1023  
- **Pranav:** front-end “talking tom” 3D character for the OpenClaw assistant.
