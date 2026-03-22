# RocketRide Integration Reference

**Version:** 1.0 (2026-03-22)
**Role in project:** Pipeline orchestration engine for all LLM calls (formatter + guide creation)
**GitHub:** [rocketride-org/rocketride-server](https://github.com/rocketride-org/rocketride-server)
**Docs:** [docs.rocketride.org](https://docs.rocketride.org/)
**Discord:** [discord.gg/9hr3tdZmEG](https://discord.gg/9hr3tdZmEG)

---

## What RocketRide Is

RocketRide is a high-performance data processing engine built on a C++ core with a Python-extensible node system. It provides 68 pipeline nodes across 14 categories, native AI/ML support, and SDKs for TypeScript, Python, and MCP.

We use it as the **pipeline orchestration layer** for all LLM calls in the OpenClaw Concierge — replacing direct API calls with declarative pipelines that can be visually edited, monitored, and extended.

---

## Why We Use It

| Factor | Direct API calls | RocketRide |
|--------|-----------------|------------|
| LLM provider swap | Code change | Config change (swap node) |
| Pipeline visibility | Logs only | Visual canvas + analytics |
| Multi-step orchestration | Manual async chaining | Declarative node graph |
| Monitoring | Custom logging | Built-in call trees, token usage, memory |
| Hackathon requirement | N/A | Required sponsor tool |

---

## Installation

### Engine (Docker)

```bash
docker pull ghcr.io/rocketride-org/rocketride-engine:latest
docker run -d --name rocketride-engine -p 5565:5565 \
  ghcr.io/rocketride-org/rocketride-engine:latest
```

The engine runs on port 5565 (WebSocket).

### Python SDK

```bash
pip install rocketride
```

Or in `pyproject.toml`:
```toml
dependencies = [
    "rocketride>=0.1.0",
]
```

### Environment Variables

```bash
ROCKETRIDE_URI=ws://localhost:5565
ROCKETRIDE_APIKEY=                        # Engine auth (if configured)
ROCKETRIDE_APIKEY_ANTHROPIC=<your-key>    # For llm_anthropic nodes
```

---

## How We Use It

### Pipeline 1: Formatter (single LLM call)

```
webhook → llm_anthropic (Claude) → response
```

Takes raw interview transcript, runs it through Claude with a formatting system prompt, returns clean Markdown.

**File:** `backend/formatter.py`

### Pipeline 2: Setup Guide Creation (3 sequential LLM calls)

```
Step 1: webhook → llm_anthropic → response  (main guide)
Step 2: webhook → llm_anthropic → response  (reference docs)
Step 3: webhook → llm_anthropic → response  (prompts_to_send)
```

Each step feeds the output of the previous step as context. A Python function assembles all outputs into the final result.

**File:** `backend/setup_guide_agent/agent.py`

---

## Pipeline Architecture (JSON Config)

Pipelines are JSON dicts with three keys: `components` (nodes), `source` (entry point), and `project_id`.

Each component has:
- `id` — unique identifier
- `provider` — node type (e.g., `webhook`, `llm_anthropic`, `response`)
- `config` — node-specific settings
- `input` — array of lane connections from other nodes

Example (formatter pipeline):
```python
{
    "components": [
        {
            "id": "webhook_1",
            "provider": "webhook",
            "config": {"hideForm": True, "mode": "Source", "type": "webhook"},
        },
        {
            "id": "llm_anthropic_1",
            "provider": "llm_anthropic",
            "config": {
                "profile": "claude-sonnet-4-6",
                "claude-sonnet-4-6": {"apikey": "<key>"},
                "system_prompt": "<formatting instructions>",
            },
            "input": [{"lane": "text", "from": "webhook_1"}],
        },
        {
            "id": "response_1",
            "provider": "response",
            "config": {"lanes": []},
            "input": [{"lane": "answers", "from": "llm_anthropic_1"}],
        },
    ],
    "source": "webhook_1",
    "project_id": "openclaw-formatter",
}
```

---

## Python SDK Usage

```python
from rocketride import RocketRideClient

async with RocketRideClient(uri="ws://localhost:5565", auth="key") as client:
    # Load a pipeline (dict or file path)
    token = await client.use(pipeline_config)

    # Send data through the pipeline
    result = await client.send(token, "input text",
                                objinfo={"name": "file.md"},
                                mimetype="text/plain")

    # Terminate the pipeline run
    await client.terminate(token)
```

---

## Available Node Types (relevant to our project)

| Category | Nodes we use | Purpose |
|----------|-------------|---------|
| **Source** | `webhook` | Entry point — receives data from SDK |
| **LLM** | `llm_anthropic` | Claude API calls with system prompts |
| **Infrastructure** | `response` | Returns pipeline output to SDK caller |

Other available nodes (for future use):
- `llm_openai`, `llm_gemini`, `llm_ollama` — swap LLM providers
- `tool_python` — run Python code inside pipeline
- `tool_http_request` — make HTTP calls from pipeline
- `prompt` — template variables into prompts
- `mcp_client` — expose pipelines as MCP tools
- `preprocessor_langchain` — chunk documents
- Vector stores: `pinecone`, `qdrant`, `chroma`, `weaviate`

---

## Data Flow: RocketRide in the Architecture

```
VAPI call-end
    |
    v
Frontend POSTs transcript to /format
    |
    v
FastAPI /format --> RocketRide Formatter Pipeline
    |                   (webhook -> llm_anthropic -> response)
    v
Formatted transcript returned
    |
    v
FastAPI /generate-guide --> RocketRide Guide Pipeline (x3 sequential calls)
    |                         Step 1: Main guide
    |                         Step 2: Reference docs
    |                         Step 3: Prompts to send
    v
In-memory store --> Frontend polls /guide/{id}
```

---

## Monitoring & Debugging

The RocketRide engine provides built-in analytics:
- **Call trees** — trace data flow through pipeline nodes
- **Token usage** — track LLM token consumption per node
- **Memory consumption** — monitor pipeline resource usage

Access via the VS Code extension canvas or the engine's API.

---

## Links

- **GitHub:** https://github.com/rocketride-org/rocketride-server
- **Docs:** https://docs.rocketride.org/
- **Discord:** https://discord.gg/9hr3tdZmEG
- **Python SDK source:** `packages/client-python/` in the monorepo
- **Node source:** `nodes/src/nodes/` in the monorepo
- **License:** MIT
