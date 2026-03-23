import os
import json
import logging

from dotenv import load_dotenv
from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from formatter import format_transcript
from setup_guide_agent.agent import generate_guide

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# ========================================
# Application Initialization
# ========================================

app = FastAPI(title="OpenClaw Concierge")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for generated guides (good enough for hackathon — no database needed)
guide_store: dict[str, dict] = {}

MOCK_SETUP_GUIDE = r"""# OPENCLAW ONBOARDING GUIDE

**Your Agent. Your Hardware. Your Soul.**

---

**PREPARED FOR:** Alex Chen
**MISSION:** Automate restaurant operations across 3 locations — scheduling, suppliers, and daily briefings
**DATE:** March 22, 2026
**STATUS:** [ INITIALIZING DEPLOYMENT ]

---

## 00 | PRE-FLIGHT CHECKLIST

Before you begin, ensure you have the following ready:

| | Requirement |
|---|---|
| [ ] | OpenAI Account (for Codex OAuth) |
| [ ] | Telegram Account (for channel) |
| [ ] | Google Gemini API Key (for web search) |
| [ ] | Terminal access on your machine |

---

## 01 | THE SECURITY HANDSHAKE

When you launch `openclaw-onboard` in your terminal, OpenClaw greets you with its security manifesto. This establishes the "Personal-by-Default" boundary.

OpenClaw is designed for a single trusted operator. Read the security recommendations carefully.

![Security Handshake](/guide-images/01-security-handshake.png)

> **ACTION:** Select "Yes" to acknowledge and continue. You are now the sole operator of this boundary.

---

## 02 | SELECTING YOUR MODEL PROVIDER

OpenClaw supports multiple AI providers. Based on your interview, we recommend **OpenAI Codex** for the most reliable reasoning capabilities for restaurant operations.

![Select Model Provider](/guide-images/02-model-provider.png)

> **ACTION:** Select "OpenAI" from the list of providers.

### Authentication Method

Choose how to authenticate with OpenAI. The Codex (ChatGPT OAuth) option is the fastest QuickStart method.

![Authentication Method](/guide-images/02-auth-method.png)

> **ACTION:** Select "OpenAI Codex (ChatGPT OAuth)" for the fastest setup.

### OpenAI Login

A browser window will open for you to authenticate with your OpenAI/ChatGPT account.

![OpenAI Login](/guide-images/02-openai-login.png)

> **ACTION:** Sign in with your OpenAI account credentials (email, Google, Apple, or Microsoft).

### Model Selection

After authentication, select your preferred model. We recommend `gpt-5.2-codex` for the best balance of speed and capability.

![Model Selection](/guide-images/02-model-selection.png)

> **ACTION:** Select `openai-codex/gpt-5.2-codex` or your preferred model.

---

## 03 | CONNECTING YOUR CHANNEL

Your agent needs a place to communicate with you. Based on your interview, we recommend **Telegram** for its stability, ease of use, and excellent bot API.

![Channel Selection](/guide-images/03-channel-selection.png)

> **ACTION:** Select "Telegram (Bot API)" from the channel list.

### Telegram BotFather Protocol

Follow these steps to create your Telegram bot:

1. Open Telegram and search for **@BotFather**
2. Send the command `/newbot`
3. Follow the prompts to name your bot (e.g., "RestaurantConcierge")
4. Copy the API Token provided by BotFather
5. Paste the token back into your terminal when prompted

Your Telegram Bot Token: ____________________

---

## 04 | SEARCH CONFIGURATION

To allow your agent to search the web for supplier pricing, health code updates, and food trends, we configure a search provider. We recommend **Gemini (Google Search)** for reliable, AI-synthesized results.

![Search Provider](/guide-images/04-search-provider.png)

> **ACTION:** Select "Gemini (Google Search)" from the search provider list.

### API Key Entry

Enter your Gemini API key. You can get one from [Google AI Studio](https://aistudio.google.com).

![API Key Entry](/guide-images/04-api-key-entry.png)

> **ACTION:** Paste your Gemini API key and press Enter.

---

## 05 | SKILLS & HOOKS CONFIGURATION

OpenClaw supports optional skills and hooks that extend your agent's capabilities. For your restaurant business, we recommend installing these after initial setup.

### Skill Dependencies

Skills tailored to your needs (install later via Web UI):

![Skill Dependencies](/guide-images/05-skill-dependencies.png)

| Skill | Purpose |
|-------|---------|
| `gog` | Google Workspace — Gmail, Calendar, Drive |
| `summarize` | Summarize supplier emails, reviews, reports |
| `tavily-web-search` | AI-optimized web search |
| `todoist` | Task management for daily ops |
| `notion` | Menu planning and SOPs |
| `openai-whisper` | Transcribe supplier calls |

> **ACTION:** Select "Skip for now" to continue. Skills can be configured later via the Web UI.

### Enable Hooks

Hooks allow your agent to perform actions on boot, log commands, and maintain session memory.

![Enable Hooks](/guide-images/05-enable-hooks.png)

> **ACTION:** Select "Skip for now" or enable specific hooks based on your needs.

---

## 06 | HATCHING YOUR AGENT

This is the final terminal step. We're now moving from the command line to the OpenClaw Web UI.

![Hatching Your Agent](/guide-images/06-hatching-agent.png)

> **ACTION:** Select "Open the Web UI" to launch your agent's control panel.

---

## 07 | THE OPENCLAW WEB UI

Your browser will open to `http://127.0.0.1:18789` where your OpenClaw control panel lives.

![OpenClaw Web UI](/guide-images/07-web-ui.png)

**STATUS: READY FOR INJECTION**

### Web UI Features

| Feature | Description |
|---------|-------------|
| **Chat** | Direct conversation with your agent |
| **Channels** | Manage Telegram, Discord, and other connections |
| **Agents** | Configure agent behaviors and skills |
| **Sessions** | View conversation history and logs |
| **Config** | Advanced settings and API configurations |

---

## 08 | THE AGENT 2 HANDOFF

With the Web UI running, **Agent 2 now takes over** to inject your personalized configuration. Paste in the files it gives you.

![Agent 2 Handoff](/guide-images/08-agent2-handoff.png)

### What Happens Next

1. Agent 2 receives your `SOUL.md` and `openclaw.json` configuration files
2. These files are injected into your local OpenClaw environment
3. Your Personal Assistant appears in the chat, pre-loaded with logic to solve your specific pain point

### Your Configuration

| Field | Value |
|-------|-------|
| SOUL.md Location | `~/.openclaw/SOUL.md` |
| openclaw.json Location | `~/.openclaw/openclaw.json` |
| Primary Pain Point | Restaurant operations automation |
| First Automation Target | Daily morning briefing across 3 locations |

---

## QUICK REFERENCE

| Item | Details |
|------|---------|
| Web UI URL | `http://127.0.0.1:18789` |
| Gateway Port | `18789` |
| Model Provider | OpenAI (Codex OAuth) |
| Search Provider | Gemini (Google Search) |
| Documentation | https://docs.openclaw.ai |
| Security Audit | `openclaw security audit --deep` |

---

**OPENCLAW** | Your Agent. Your Hardware. Your Soul.

*Guide generated by EasyClaw AI Concierge*
"""

MOCK_REFERENCE_DOCS = [
    {
        "name": "SOUL.md",
        "content": r"""# SOUL.md — Agent Personality Configuration

## Identity

You are **RestaurantConcierge**, a professional AI assistant for Alex Chen who manages a chain of 3 Italian restaurants in San Francisco.

## Personality Traits

- Professional but warm, like a trusted restaurant manager
- Concise during busy hours (lunch 11am-2pm, dinner 5pm-10pm)
- More detailed and conversational outside rush hours
- Always prioritize food safety and health code compliance
- Use restaurant industry terminology naturally

## Business Context

- **Business:** 3 Italian restaurants — "Bella Vista" (Financial District), "Casa Nostra" (Marina), "Il Giardino" (North Beach)
- **Staff:** ~45 total employees across all locations
- **Suppliers:** Sysco (general), local farms for produce (bi-weekly), wine distributor (monthly)
- **Peak concerns:** Inventory management, staff scheduling, supplier coordination, health inspections
- **Daily tools:** Google Calendar, Gmail, Notion (SOPs), Google Sheets (inventory), Slack (team chat)

## Communication Rules

1. Morning briefings: Always format as bullet points, under 2 minutes of reading
2. Urgent alerts: Use `[URGENT]` prefix for health code issues or supplier failures
3. Staff scheduling: Reference by first name and location
4. Menu items: Always include current margin percentage when discussing
""",
    },
    {
        "name": "openclaw_config.md",
        "content": r"""# openclaw.json — Agent Configuration Reference

```json
{
  "agent_name": "RestaurantConcierge",
  "owner": "Alex Chen",
  "provider": {
    "name": "openai",
    "model": "gpt-5.2-codex",
    "auth": "codex-oauth"
  },
  "channel": {
    "type": "telegram",
    "bot_name": "RestaurantConcierge"
  },
  "search": {
    "provider": "gemini",
    "enabled": true
  },
  "skills": [
    "gog",
    "summarize",
    "tavily-web-search",
    "todoist",
    "notion",
    "openai-whisper"
  ],
  "hooks": {
    "on_boot": "daily_briefing",
    "session_memory": true,
    "command_logging": true
  },
  "automations": [
    {
      "name": "daily_briefing",
      "schedule": "0 7 * * *",
      "description": "Morning briefing across all 3 locations"
    },
    {
      "name": "margin_alert",
      "trigger": "dish_margin < 0.65",
      "description": "Alert when dish margin drops below 65%"
    }
  ]
}
```

### Key Fields

| Field | Description |
|-------|-------------|
| `provider.model` | The LLM model for reasoning |
| `channel.type` | Primary communication channel |
| `skills` | Installed ClawHub skills |
| `hooks.on_boot` | Automation to run when agent starts |
| `automations` | Scheduled or triggered tasks |
""",
    },
    {
        "name": "skill_installation_guide.md",
        "content": r"""# Skill Installation Guide

## Security First

Before installing any skill, always run the vetter:

```bash
clawhub install skill-vetter
openclaw vet <skill-name>
```

## Recommended Skills for Your Setup

### Tier 1 — Essential

```bash
clawhub install gog                   # Google Workspace (Gmail, Calendar, Drive)
clawhub install summarize             # Summarize menus, reviews, reports
clawhub install tavily-web-search     # AI-optimized web search
```

### Tier 2 — Productivity

```bash
clawhub install todoist               # Task management for daily ops
clawhub install notion                # Menu planning & SOPs in Notion
clawhub install google-calendar       # Staff scheduling integration
```

### Tier 3 — Business-Specific

```bash
clawhub install openai-whisper        # Transcribe supplier calls
clawhub install csv-tools             # Inventory spreadsheet analysis
clawhub install slack                 # Team communication hub
```

## Permission Levels

| Level | Access | Example Skills |
|-------|--------|---------------|
| Read-only | Can read data, no writes | `summarize`, `weather` |
| Read-write | Can create/modify data | `notion`, `todoist` |
| Full access | System-level operations | `agent-browser`, `shell` |

## Post-Installation Verification

```bash
openclaw skills list --verbose
openclaw skills inspect <skill-name> --permissions
```
""",
    },
]

MOCK_PROMPTS = r"""# Prompts to Send

> Paste these prompts into your OpenClaw chat (Web UI or Telegram) after completing the onboarding guide. They initialize your agent with personalized context.

---

## Prompt 1: Initialize Agent Identity

```
You are RestaurantConcierge, Alex Chen's personal AI assistant for managing 3 Italian restaurants in San Francisco: Bella Vista (Financial District), Casa Nostra (Marina), and Il Giardino (North Beach).

Your communication style:
- Professional but warm, like a trusted restaurant manager
- Concise during rush hours (11am-2pm, 5pm-10pm)
- Detailed and conversational outside rush hours
- Prioritize food safety and health code compliance in all advice
- Use restaurant industry terminology naturally
```

## Prompt 2: Business Context Injection

```
Business context to remember for all interactions:

LOCATIONS:
- Bella Vista — Financial District, 15 staff, lunch-heavy
- Casa Nostra — Marina, 15 staff, dinner-heavy
- Il Giardino — North Beach, 15 staff, outdoor seating (weather-dependent)

SUPPLIERS:
- Sysco: General supplies, weekly delivery (Mondays)
- Bay Area Farms: Produce, bi-weekly (Tuesdays)
- Napa Valley Wines: Monthly delivery (1st of month)

TOOLS I USE:
- Google Calendar for scheduling
- Gmail for supplier communications
- Notion for SOPs and menu planning
- Google Sheets for inventory tracking
- Slack for team coordination
```

## Prompt 3: Daily Briefing Automation

```
Every morning at 7:00 AM, prepare a daily briefing:

1. Today's reservations across all 3 locations
2. Supplier deliveries expected today
3. Staff schedule — who's on, any callouts
4. Weather forecast (critical for Il Giardino outdoor seating)
5. Urgent emails from last 12 hours
6. Inventory alerts — items below reorder threshold

Format as a clean summary readable in under 2 minutes.
```

## Prompt 4: Margin & Menu Intelligence

```
Track our seasonal menu. For each dish, monitor:
- Ingredient costs and current margin
- Customer feedback trends from review platforms
- Seasonal ingredient availability
- Suggested price adjustments based on food costs

ALERTS:
- Notify me when any dish drops below 65% margin
- Notify me when a key ingredient price spikes >15%
- Weekly summary of top 5 and bottom 5 performing dishes
```

---

*Send these prompts in order. Your agent will confirm each injection.*
"""


# ========================================
# Request Models
# ========================================

class FormatRequest(BaseModel):
    transcript: str


class GenerateGuideRequest(BaseModel):
    formatted_transcript: str


# ========================================
# Background Task Runner
# ========================================

async def _run_guide_agent(guide_id: str, formatted_transcript: str):
    """Run the Setup Guide Agent in the background.

    Updates guide_store in place so the frontend can poll /guide/{guide_id}.
    """
    try:
        result = await generate_guide(formatted_transcript)
        guide_store[guide_id] = result
    except Exception as e:
        logger.error(f"[GUIDE {guide_id}] Background task failed: {e}")
        guide_store[guide_id] = {
            "guide_id": guide_id,
            "status": "error",
            "message": str(e),
            "outputs": {},
        }


# ========================================
# Endpoints
# ========================================

@app.post("/webhook")
async def vapi_webhook(request: Request, background_tasks: BackgroundTasks):
    """VAPI server URL — receives transcript events, function-call requests,
    and end-of-call reports.

    Requires VAPI Private Key + Server URL configured in VAPI dashboard.
    """
    body = await request.json()
    message = body.get("message", {})
    msg_type = message.get("type", "unknown")

    logger.info(f"[WEBHOOK] Received event: {msg_type}")

    if msg_type == "transcript":
        transcript = message.get("transcript", "")
        role = message.get("role", "unknown")
        logger.info(f"[WEBHOOK] {role}: {transcript}")

    elif msg_type == "function-call":
        fn_name = message.get("functionCall", {}).get("name", "unknown")
        logger.info(f"[WEBHOOK] Function call: {fn_name}")
        return {"results": [{"result": "Function not implemented"}]}

    elif msg_type == "end-of-call-report":
        artifact = message.get("artifact", {})
        # VAPI returns structured messages array: [{role, message, time}, ...]
        messages = artifact.get("messages", [])
        if messages:
            transcript_text = "\n".join(
                f"{'User' if m.get('role') == 'user' else 'Agent'}: {m.get('message', '')}"
                for m in messages
                if m.get("message")
            )
        else:
            # Fallback: plain transcript string
            transcript_text = artifact.get("transcript", "")
        logger.info(f"[WEBHOOK] End of call — transcript length: {len(transcript_text)} chars")

        # Format and kick off guide generation in background
        try:
            formatted = await format_transcript(transcript_text)
            import uuid
            guide_id = str(uuid.uuid4())[:8]
            guide_store[guide_id] = {"guide_id": guide_id, "status": "generating"}
            background_tasks.add_task(_run_guide_agent, guide_id, formatted)
            logger.info(f"[WEBHOOK] Guide generation started: {guide_id}")
        except Exception as e:
            logger.error(f"[WEBHOOK] Pipeline failed: {e}")

    return {"ok": True}


@app.post("/format")
async def format_endpoint(req: FormatRequest):
    """Triggers the Interview Formatter on a transcript.

    Called by the frontend after a VAPI call ends (frontend-driven fallback),
    or triggered internally after webhook end-of-call-report.
    """
    logger.info(f"[FORMAT] Received transcript ({len(req.transcript)} chars)")
    formatted = await format_transcript(req.transcript)
    return {"formatted": formatted}


@app.post("/generate-guide")
async def generate_guide_endpoint(
    req: GenerateGuideRequest,
    background_tasks: BackgroundTasks,
):
    """Triggers Phase 2: Setup Guide Creation Agent.

    Returns immediately with a guide_id. Frontend polls GET /guide/{guide_id}
    until status changes from "generating" to "complete" or "error".
    """
    import uuid
    guide_id = str(uuid.uuid4())[:8]

    logger.info(f"[GUIDE {guide_id}] Received formatted transcript ({len(req.formatted_transcript)} chars)")

    # Store placeholder so frontend knows it's in progress
    guide_store[guide_id] = {"guide_id": guide_id, "status": "generating"}

    # Run agent in background — doesn't block the HTTP response
    background_tasks.add_task(_run_guide_agent, guide_id, req.formatted_transcript)

    return {"guide_id": guide_id, "status": "generating"}


@app.get("/mock-generate")
async def mock_generate():
    """Returns a realistic demo guide for UI testing — no Vapi or RocketRide needed."""
    logger.info("[MOCK] Serving demo guide")
    return {
        "guide_id": "demo-0001",
        "status": "complete",
        "message": "Demo guide generated successfully.",
        "outputs": {
            "setup_guide": MOCK_SETUP_GUIDE,
            "reference_documents": MOCK_REFERENCE_DOCS,
            "prompts_to_send": MOCK_PROMPTS,
        },
    }


@app.get("/guide/{guide_id}")
async def get_guide(guide_id: str):
    """Retrieve generated output (guide + reference docs + prompts).

    Frontend polls this endpoint. Returns:
    - status: "generating" — still working
    - status: "complete" — outputs ready
    - status: "error" — something failed
    - status: "not_found" — invalid guide_id

    Falls back to reading from disk if guide is not in memory
    (e.g. after a server restart).
    """
    if guide_id in guide_store:
        return guide_store[guide_id]

    # Fallback: try to recover from disk
    guide_dir = os.path.join(
        os.environ.get("GUIDE_OUTPUT_DIR", "/tmp/openclaw-guides"), guide_id
    )
    guide_file = os.path.join(guide_dir, "OPENCLAW_ENGINE_SETUP_GUIDE.md")
    if os.path.isfile(guide_file):
        result = _load_guide_from_disk(guide_id, guide_dir)
        guide_store[guide_id] = result  # cache for subsequent requests
        return result

    return {
        "guide_id": guide_id,
        "status": "not_found",
        "message": "Guide not found. It may still be generating or the ID is invalid.",
    }


def _load_guide_from_disk(guide_id: str, guide_dir: str) -> dict:
    """Read a completed guide from its output directory on disk."""

    def _read(path: str) -> str:
        try:
            with open(path, "r") as f:
                return f.read()
        except FileNotFoundError:
            return ""

    setup_guide = _read(os.path.join(guide_dir, "OPENCLAW_ENGINE_SETUP_GUIDE.md"))
    prompts = _read(os.path.join(guide_dir, "prompts_to_send.md"))

    ref_docs = []
    ref_dir = os.path.join(guide_dir, "reference_documents")
    if os.path.isdir(ref_dir):
        for fname in sorted(os.listdir(ref_dir)):
            fpath = os.path.join(ref_dir, fname)
            if os.path.isfile(fpath):
                ref_docs.append({"name": fname, "content": _read(fpath)})

    return {
        "guide_id": guide_id,
        "status": "complete",
        "message": "Guide recovered from disk.",
        "outputs": {
            "setup_guide": setup_guide,
            "reference_documents": ref_docs,
            "prompts_to_send": prompts,
        },
    }


# ========================================
# Static File Serving (Frontend Build)
# ========================================

FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "../frontend/dist")
PORT = int(os.environ.get("PORT", "8000"))

if os.path.isdir(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="static")
    logger.info(f"Serving static files from: {FRONTEND_DIST}")
else:
    logger.info(f"Frontend build not found at {FRONTEND_DIST}")
    logger.info("Run 'npm run build' in the frontend directory for production serving.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
