"""
Mock data for EasyClaw demo guides and scorecard computation.

Contains pre-built demo guides for 5 verticals and a compute_scorecard()
function used for real (non-demo) guide generation.
"""

import os
import re

# ---------------------------------------------------------------------------
# Helper: load guide content from guide_output directory
# ---------------------------------------------------------------------------
_GUIDE_OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "guide_output")


def _load_guide_file(guide_id, filename):
    """Read a file from guide_output/<guide_id>/<filename>, return '' on failure."""
    path = os.path.join(_GUIDE_OUTPUT_DIR, guide_id, filename)
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return ""


def _load_guide_refs(guide_id, ref_dir="reference_documents"):
    """Load all .md files from guide_output/<guide_id>/reference_documents/."""
    refs = []
    dirpath = os.path.join(_GUIDE_OUTPUT_DIR, guide_id, ref_dir)
    if not os.path.isdir(dirpath):
        return refs
    for fname in sorted(os.listdir(dirpath)):
        if fname.endswith(".md"):
            fpath = os.path.join(dirpath, fname)
            with open(fpath, "r", encoding="utf-8") as f:
                refs.append({"name": fname, "content": f.read()})
    return refs

# ---------------------------------------------------------------------------
# SCOUTS COFFEE — Real Claude-generated guide (guide_id: a3a20c66)
# ---------------------------------------------------------------------------

_SCOUTS_GUIDE_ID = "a3a20c66"
RESTAURANT_GUIDE = _load_guide_file(_SCOUTS_GUIDE_ID, "OPENCLAW_ENGINE_SETUP_GUIDE.md")
RESTAURANT_REFS = _load_guide_refs(_SCOUTS_GUIDE_ID)
RESTAURANT_PROMPTS = _load_guide_file(_SCOUTS_GUIDE_ID, "prompts_to_send.md")

_OLD_RESTAURANT_GUIDE = r"""# OPENCLAW ONBOARDING GUIDE

**Your Agent. Your Hardware. Your Soul.**

---

**PREPARED FOR:** Alex Chen
**MISSION:** Automate restaurant operations across 3 locations — scheduling, suppliers, and daily briefings
**DATE:** March 22, 2026
**STATUS:** [ INITIALIZING DEPLOYMENT ]

---

## KEY MOMENTS IN THIS GUIDE

| Step | What Happens | Why It Matters |
|------|-------------|----------------|
| Security Handshake | You establish the single-operator boundary | Your restaurant data (sales, staff, suppliers) stays on YOUR machine |
| Model Provider | Connect to OpenAI Codex via OAuth | Best reasoning engine for multi-location ops — no API key needed |
| Telegram Channel | Create your bot via BotFather | Your 7 AM briefings and urgent alerts land in your pocket |
| Search Config | Connect Gemini for web search | Real-time supplier pricing, health code updates, food trend monitoring |
| Agent Hatching | Launch the Web UI | Your control panel — where RestaurantConcierge comes alive |
| Agent 2 Handoff | Inject SOUL.md + config | Personalizes the agent to YOUR 3 locations, YOUR suppliers, YOUR pain points |

---

## 00 | PRE-FLIGHT CHECKLIST

Before you begin, ensure you have the following ready:

| | Requirement |
|---|---|
| [ ] | OpenAI Account (for Codex OAuth) |
| [ ] | Telegram Account (for channel) |
| [ ] | Google Gemini API Key (for web search) |
| [ ] | Terminal access on your machine |

> 💡 **TIP:** If you don't have a Gemini API key yet, grab one free from [Google AI Studio](https://aistudio.google.com) — takes 30 seconds. The free tier covers all search needs for a restaurant operation this size.

---

## 01 | THE SECURITY HANDSHAKE

When you launch `openclaw-onboard` in your terminal, OpenClaw greets you with its security manifesto. This establishes the "Personal-by-Default" boundary.

OpenClaw is designed for a single trusted operator. Read the security recommendations carefully.

![Security Handshake](templates/images/image12.png)

> ✅ **ACTION:** Select "Yes" to acknowledge and continue. You are now the sole operator of this boundary.

> ⚠️ **WARNING:** Once you acknowledge the security boundary, your agent can access local files and connected APIs. Never share your terminal session or leave it unattended with the agent running — especially during busy service hours when staff might have physical access to your office machine.

---

## 02 | SELECTING YOUR MODEL PROVIDER

OpenClaw supports multiple AI providers. Based on your interview, we recommend **OpenAI Codex** for the most reliable reasoning capabilities for restaurant operations.

![Select Model Provider](templates/images/image11.png)

> ✅ **ACTION:** Select "OpenAI" from the list of providers.

### Authentication Method

Choose how to authenticate with OpenAI. The Codex (ChatGPT OAuth) option is the fastest QuickStart method.

![Authentication Method](templates/images/image10.png)

> ✅ **ACTION:** Select "OpenAI Codex (ChatGPT OAuth)" for the fastest setup.

> 💡 **TIP:** Codex OAuth means you sign in with your existing ChatGPT account — no separate API key or billing setup required. This is the fastest path from zero to a running agent.

### OpenAI Login

A browser window will open for you to authenticate with your OpenAI/ChatGPT account.

![OpenAI Login](templates/images/image7.png)

> ✅ **ACTION:** Sign in with your OpenAI account credentials (email, Google, Apple, or Microsoft).

### Model Selection

After authentication, select your preferred model. We recommend `gpt-5.2-codex` for the best balance of speed and capability.

![Model Selection](templates/images/image9.png)

> ✅ **ACTION:** Select `openai-codex/gpt-5.2-codex` or your preferred model.

> ⚠️ **WARNING:** Avoid selecting models with "mini" or "lite" in the name for restaurant operations. Multi-location scheduling and supplier analysis require the full reasoning capability of the standard model.

---

## 03 | CONNECTING YOUR CHANNEL

Your agent needs a place to communicate with you. Based on your interview, we recommend **Telegram** for its stability, ease of use, and excellent bot API.

![Channel Selection](templates/images/image3.png)

> ✅ **ACTION:** Select "Telegram (Bot API)" from the channel list.

### Telegram BotFather Protocol

Follow these steps to create your Telegram bot:

1. Open Telegram and search for **@BotFather**
2. Send the command `/newbot`
3. Follow the prompts to name your bot (e.g., "RestaurantConcierge")
4. Copy the API Token provided by BotFather
5. Paste the token back into your terminal when prompted

Your Telegram Bot Token: ____________________

> 💡 **TIP:** Name your bot something you'll recognize at 6 AM when the morning briefing lands — "RestaurantConcierge" or "AlexOps" works. Avoid generic names like "MyBot" that get lost in your chat list.

> ⚠️ **WARNING:** Your Telegram bot token is a secret. Never share it in group chats, commit it to Git, or paste it into any website. If compromised, anyone can send messages as your bot. Regenerate immediately via BotFather if you suspect a leak.

---

## 04 | SEARCH CONFIGURATION

To allow your agent to search the web for supplier pricing, health code updates, and food trends, we configure a search provider. We recommend **Gemini (Google Search)** for reliable, AI-synthesized results.

![Search Provider](templates/images/image4.png)

> ✅ **ACTION:** Select "Gemini (Google Search)" from the search provider list.

### API Key Entry

Enter your Gemini API key. You can get one from [Google AI Studio](https://aistudio.google.com).

![API Key Entry](templates/images/image5.png)

> ✅ **ACTION:** Paste your Gemini API key and press Enter.

> 💡 **TIP:** The Gemini free tier allows 60 requests/minute — more than enough for daily supplier checks and food trend monitoring. You won't need to upgrade unless you add multiple agents.

---

## 05 | SKILLS & HOOKS CONFIGURATION

OpenClaw supports optional skills and hooks that extend your agent's capabilities. For your restaurant business, we recommend installing these after initial setup.

### Skill Dependencies

Skills tailored to your needs (install later via Web UI):

![Skill Dependencies](templates/images/image2.png)

| Skill | Purpose |
|-------|---------|
| `gog` | Google Workspace — Gmail, Calendar, Drive |
| `summarize` | Summarize supplier emails, reviews, reports |
| `tavily-web-search` | AI-optimized web search |
| `todoist` | Task management for daily ops |
| `notion` | Menu planning and SOPs |
| `openai-whisper` | Transcribe supplier calls |

> ✅ **ACTION:** Select "Skip for now" to continue. Skills can be configured later via the Web UI.

> 💡 **TIP:** Start with zero skills and add them one at a time after your agent is running. The `gog` (Google Workspace) skill is the highest-ROI first install — it unlocks Gmail scanning for supplier invoices and Calendar integration for shift schedules.

### Enable Hooks

Hooks allow your agent to perform actions on boot, log commands, and maintain session memory.

![Enable Hooks](templates/images/image8.png)

> ✅ **ACTION:** Select "Skip for now" or enable specific hooks based on your needs.

---

## 06 | HATCHING YOUR AGENT

This is the final terminal step. We're now moving from the command line to the OpenClaw Web UI.

![Hatching Your Agent](templates/images/image1.png)

> ✅ **ACTION:** Select "Open the Web UI" to launch your agent's control panel.

> ⚠️ **WARNING:** The Web UI binds to `127.0.0.1` (localhost only) by default. If you need to access it from another device on your network, you'll need to change the bind address — but be aware this exposes the UI to your local network. Only do this on a trusted network.

---

## 07 | THE OPENCLAW WEB UI

Your browser will open to `http://127.0.0.1:18789` where your OpenClaw control panel lives.

![OpenClaw Web UI](templates/images/image6.png)

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

![Agent 2 Handoff](templates/images/image6.png)

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

_OLD_RESTAURANT_REFS = [
    {
        "name": "SOUL.md",
        "content": r"""# SOUL.md — RestaurantConcierge

## Identity
You are **RestaurantConcierge**, the personal operations assistant for Alex Chen's restaurant group.

## Business Context
- **Operator:** Alex Chen — Owner/operator of 3 restaurant locations
- **Locations:** Downtown (flagship, 120 seats), Midtown (80 seats), Airport (quick-service, 60 seats)
- **Staff:** 45 total across all locations (15 per location avg.)
- **Key Suppliers:** Sysco (produce), US Foods (proteins), local bakery (breads)
- **Daily Tools:** Square POS, 7shifts Scheduling, Google Workspace, QuickBooks

## Personality Traits
- Efficient, direct, no fluff
- Thinks in checklists and action items
- Proactively flags anomalies (staffing gaps, price spikes, expiring inventory)
- Uses restaurant industry terminology naturally

## Communication Rules
- Morning briefings by 7:00 AM local time
- Urgent alerts (no-shows, supplier issues) immediately
- Weekly summary every Sunday at 8:00 PM
- Always include location name when referencing data

## Boundaries
- Never place orders without explicit approval
- Never modify schedules without confirmation
- Flag but don't resolve interpersonal staff issues
- Escalate anything involving health/safety immediately
""",
    },
    {
        "name": "openclaw_config.md",
        "content": r"""# OpenClaw Configuration Reference

```json
{
  "agent": {
    "name": "RestaurantConcierge",
    "version": "1.0.0"
  },
  "provider": {
    "name": "openai",
    "auth": "codex-oauth",
    "model": "gpt-5.2-codex"
  },
  "channel": {
    "type": "telegram",
    "bot_name": "RestaurantConcierge"
  },
  "search": {
    "provider": "gemini",
    "mode": "google-search"
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
    "on_boot": "daily_briefing_check",
    "on_message": "log_and_classify",
    "session_memory": true
  },
  "automations": [
    {
      "name": "morning_briefing",
      "cron": "0 7 * * *",
      "action": "generate_daily_briefing"
    },
    {
      "name": "weekly_summary",
      "cron": "0 20 * * 0",
      "action": "generate_weekly_summary"
    }
  ]
}
```

### Key Configuration Notes
- **Provider:** OpenAI Codex via OAuth — no API key needed
- **Channel:** Telegram bot — requires BotFather token
- **Skills:** Install via Web UI after initial setup
- **Automations:** Cron-based scheduling for recurring tasks
""",
    },
    {
        "name": "skill_installation_guide.md",
        "content": r"""# Skill Installation Guide

## Tier 1 — Core (Install First)
| Skill | Command | Purpose |
|-------|---------|---------|
| `gog` | `openclaw skill install gog` | Google Workspace integration |
| `summarize` | `openclaw skill install summarize` | Text summarization |

## Tier 2 — Productivity
| Skill | Command | Purpose |
|-------|---------|---------|
| `tavily-web-search` | `openclaw skill install tavily-web-search` | AI web search |
| `todoist` | `openclaw skill install todoist` | Task management |
| `notion` | `openclaw skill install notion` | Knowledge base |

## Tier 3 — Advanced
| Skill | Command | Purpose |
|-------|---------|---------|
| `openai-whisper` | `openclaw skill install openai-whisper` | Audio transcription |

## Permission Levels
- **read** — Skill can read data only
- **write** — Skill can create/modify data
- **execute** — Skill can trigger external actions

## Verification
```bash
# List installed skills
openclaw skill list

# Test a specific skill
openclaw skill test <skill-name>

# Check skill permissions
openclaw skill permissions <skill-name>
```
""",
    },
]

_OLD_RESTAURANT_PROMPTS = r"""# PROMPTS TO SEND — RestaurantConcierge

Paste these prompts into your OpenClaw chat (Web UI) in order. Each one layers context and capability onto your agent.

---

## Prompt 1 — Initialize Agent Identity

```
You are RestaurantConcierge. Your personality traits:
- Efficient and direct — no fluff, always actionable
- Think in checklists and structured formats
- Proactively flag anomalies before they become problems
- Use restaurant industry terminology naturally

Communication style:
- Morning briefings: concise bullet points with metrics
- Urgent alerts: bold header + immediate action required
- Weekly summaries: structured tables with trends

Always sign off with a one-line status: "All [X] locations green" or flag specific issues.
```

---

## Prompt 2 — Business Context Injection

```
Here is my business context. Internalize this completely:

LOCATIONS:
1. Downtown (flagship) — 120 seats, full-service, open 11am-11pm
2. Midtown — 80 seats, casual dining, open 11am-10pm
3. Airport — 60 seats, quick-service, open 5am-9pm

STAFF: 45 total (avg 15/location)
SUPPLIERS: Sysco (produce), US Foods (proteins), Local Bakery (breads)
POS: Square | Scheduling: 7shifts | Accounting: QuickBooks
COMMUNICATION: Google Workspace (Gmail, Calendar, Drive)

My biggest pain points:
- Morning prep coordination across locations
- Supplier price tracking and reorder timing
- Staff no-show coverage
- Food cost margin monitoring
```

---

## Prompt 3 — Daily Briefing Automation

```
Set up my daily morning briefing. Deliver it every day at 7:00 AM via Telegram.

Format:
1. **Weather & Foot Traffic** — Today's forecast + expected impact on covers
2. **Staff Status** — Who's on shift, any call-outs, coverage gaps
3. **Prep Checklist** — Location-specific prep priorities
4. **Supplier Alerts** — Pending deliveries, price changes, low stock warnings
5. **Yesterday's Numbers** — Revenue, covers, avg ticket by location
6. **Action Items** — Top 3 things that need my attention today

Keep it under 500 words. Use tables where it makes data clearer.
```

---

## Prompt 4 — Margin & Menu Intelligence

```
Monitor my food cost margins continuously:

TRACKING:
- Pull daily COGS estimates from supplier invoices
- Compare against menu pricing for each location
- Flag any item where food cost exceeds 32%
- Track week-over-week price changes for top 20 ingredients

ALERTS:
- Immediate alert if any supplier raises prices >5% on a single item
- Weekly alert if overall food cost trends above 30%
- Monthly report comparing margins across all 3 locations

WEEKLY SUMMARY (Sunday 8pm):
- Top 5 most profitable menu items
- Top 5 least profitable menu items
- Recommended menu adjustments
- Supplier negotiation opportunities
```
"""

# ---------------------------------------------------------------------------
# DEVOPS — Autonomous Dev Agent
# ---------------------------------------------------------------------------

DEVOPS_GUIDE = r"""# OPENCLAW ONBOARDING GUIDE

**Your Agent. Your Hardware. Your Soul.**

---

**PREPARED FOR:** Jordan Kim
**MISSION:** CI/CD monitoring, PR reviews, and deployment automation for a solo developer workflow
**DATE:** March 22, 2026
**STATUS:** [ INITIALIZING DEPLOYMENT ]

---

## KEY MOMENTS IN THIS GUIDE

| Step | What Happens | Why It Matters |
|------|-------------|----------------|
| Security Handshake | Establish single-operator boundary | Your agent sees code, secrets, and deploy credentials — lock it down |
| Model Provider | Connect Anthropic Claude via API key | Best code reasoning engine for reviewing diffs and parsing logs |
| Discord Channel | Create a bot in your dev server | CI/CD alerts, PR summaries, and deploy notifications in one place |
| Skills | Configure browser + summarize + search | Your agent can research errors, condense logs, and find solutions |
| Agent Hatching | Launch the Web UI control panel | Where DevOpsAgent comes alive and starts watching your repos |
| Agent 2 Handoff | Inject SOUL.md + config | Personalizes the agent to YOUR stack, YOUR repos, YOUR workflow |

---

## 00 | PRE-FLIGHT CHECKLIST

Before you begin, ensure you have the following ready:

| | Requirement |
|---|---|
| [ ] | Anthropic API Key (for Claude) |
| [ ] | Discord Account (for bot channel) |
| [ ] | GitHub personal access token |
| [ ] | Terminal access on your machine |

> 💡 **TIP:** Generate a GitHub fine-grained personal access token scoped to just your 3 repos with `read` permissions on code, PRs, and actions. This follows the principle of least privilege — your agent only needs to observe, not write.

---

## 01 | THE SECURITY HANDSHAKE

When you launch `openclaw-onboard` in your terminal, OpenClaw presents its security manifesto. As a developer handling code and deployment credentials, this boundary is critical.

> ✅ **ACTION:** Select "Yes" to acknowledge the single-operator boundary. Your agent will never push code or merge PRs without explicit approval.

> ⚠️ **WARNING:** Your agent will have access to your Anthropic API key, GitHub token, and Discord bot token. These credentials are stored locally in `~/.openclaw/openclaw.json`. Never commit this file to version control or share your OpenClaw directory. Run `openclaw security audit --deep` after setup to verify your boundary.

---

## 02 | MODEL PROVIDER & CHANNEL SETUP

### Model Provider — Anthropic Claude

Based on your interview, we recommend **Anthropic Claude** for its strong code reasoning and large context window, ideal for reviewing diffs and logs.

> ✅ **ACTION:** Select "Anthropic" from the provider list.

### API Key Authentication

Enter your Anthropic API key. You can generate one from [console.anthropic.com](https://console.anthropic.com).

> ✅ **ACTION:** Paste your Anthropic API key and press Enter.

> ⚠️ **WARNING:** Set a monthly spend limit on your Anthropic account before connecting. PR review summaries and CI/CD log analysis can generate significant token usage across 20 workflows — cap it to avoid surprise bills.

### Model Selection

Select `claude-sonnet-4-20250514` for the best balance of speed and depth for code tasks.

> ✅ **ACTION:** Select `anthropic/claude-sonnet-4-20250514` or your preferred model.

> 💡 **TIP:** Sonnet is the sweet spot for DevOps: fast enough for real-time CI alerts (responds in <3s), smart enough to parse complex stack traces. Use Opus only if you need deep architectural analysis — it's 5x the cost.

### Channel — Discord Bot

Your agent will communicate via a dedicated Discord channel in your development server.

> ✅ **ACTION:** Select "Discord (Bot)" from the channel list.

### Discord Bot Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application (e.g., "DevOpsAgent")
3. Navigate to the Bot tab and create a bot
4. Copy the Bot Token
5. Invite the bot to your server with `Send Messages` and `Read Message History` permissions
6. Paste the token into your terminal

> 💡 **TIP:** Create separate Discord channels for different alert types: `#ci-alerts` for build failures, `#code-reviews` for PR summaries, `#deploys` for deployment status. This keeps your signal clean and lets you mute non-urgent channels during focus time.

---

## 03 | SKILLS CONFIGURATION

Skills tailored to your solo-dev workflow:

| Skill | Purpose |
|-------|---------|
| `agent-browser` | Browse docs, Stack Overflow, GitHub issues |
| `summarize` | Condense PR diffs, log files, error traces |
| `tavily-web-search` | Search for solutions and library updates |

> ✅ **ACTION:** Select "Skip for now" — install via Web UI after setup.

> 💡 **TIP:** Install `summarize` first — it's the highest-ROI skill for a solo dev. It condenses 500-line CI logs into the 5 lines that actually matter, saving you from scrolling through noise at 2 AM when a deploy fails.

---

## 04 | HATCHING & WEB UI

This is the final terminal step. Your agent is ready to hatch.

> ✅ **ACTION:** Select "Open the Web UI" to launch your control panel at `http://127.0.0.1:18789`.

> ⚠️ **WARNING:** The Web UI runs on localhost only. If you're SSH'd into a remote server, you'll need to set up port forwarding (`ssh -L 18789:localhost:18789 your-server`) to access the UI from your local browser.

### Web UI — Ready for Injection

With the Web UI running, **Agent 2 now takes over** to inject your personalized configuration.

| Field | Value |
|-------|-------|
| SOUL.md Location | `~/.openclaw/SOUL.md` |
| openclaw.json Location | `~/.openclaw/openclaw.json` |
| Primary Pain Point | CI/CD pipeline failures going unnoticed |
| First Automation Target | PR review summaries + deployment status alerts |

---

## QUICK REFERENCE

| Item | Details |
|------|---------|
| Web UI URL | `http://127.0.0.1:18789` |
| Model Provider | Anthropic Claude (API Key) |
| Channel | Discord Bot |
| Documentation | https://docs.openclaw.ai |
| Security Audit | `openclaw security audit --deep` |

---

**OPENCLAW** | Your Agent. Your Hardware. Your Soul.

*Guide generated by EasyClaw AI Concierge*
"""

DEVOPS_REFS = [
    {
        "name": "SOUL.md",
        "content": r"""# SOUL.md — DevOpsAgent

## Identity
You are **DevOpsAgent**, the autonomous development assistant for Jordan Kim.

## Context
- **Operator:** Jordan Kim — Solo full-stack developer
- **Stack:** TypeScript / Next.js / PostgreSQL / Docker
- **CI/CD:** GitHub Actions (3 repos, ~20 workflows)
- **Hosting:** Vercel (frontend), Railway (backend), Supabase (DB)
- **Workflow:** Feature branches → PR → Review → Merge → Auto-deploy

## Personality Traits
- Terse and technical — speak in code terminology
- Default to showing diffs, logs, and terminal output
- Never sugar-coat failures; always include the error trace
- Think like a senior SRE: uptime first, features second

## Communication Rules
- CI/CD failure alerts: immediately via Discord with error context
- PR opened: auto-summarize the diff within 2 minutes
- Deployment success: brief confirmation with deploy URL
- Weekly: Monday 9 AM summary of repo health, open PRs, flaky tests

## Boundaries
- Never merge PRs without explicit "LGTM, merge" confirmation
- Never run destructive database migrations without approval
- Never push to main/production branches directly
- Escalate security vulnerabilities immediately
""",
    },
]

DEVOPS_PROMPTS = r"""# PROMPTS TO SEND — DevOpsAgent

Paste these prompts into your OpenClaw chat in order.

---

## Prompt 1 — Initialize Agent Identity

```
You are DevOpsAgent. Your personality:
- Terse, technical, no fluff
- Always include relevant error traces and log snippets
- Think like a senior SRE: uptime and reliability first
- Use terminal/code formatting for all technical output

When reporting issues, always structure as:
**Service** → **Error** → **Impact** → **Suggested Fix**
```

---

## Prompt 2 — Repository & Infrastructure Context

```
Here is my infrastructure context:

REPOS:
1. frontend-app — Next.js 15, deployed on Vercel
2. backend-api — Express + TypeScript, deployed on Railway
3. shared-utils — NPM package, published to GitHub Packages

CI/CD: GitHub Actions
- frontend: lint → test → build → deploy (Vercel)
- backend: lint → test → build → deploy (Railway)
- shared: lint → test → publish

MONITORING PRIORITIES:
- Build failures on any branch
- Test flakiness (>2 failures in 7 days = flag)
- Deploy rollbacks
- Dependency security alerts (Dependabot)
```

---

## Prompt 3 — PR Review Automation

```
When a PR is opened on any of my repos:

1. Summarize the diff in 3-5 bullet points
2. Flag potential issues: breaking changes, missing tests, large files
3. Check if CI passes before I review
4. Rate the PR: 🟢 Clean / 🟡 Needs Discussion / 🔴 Risky

Post the summary to my Discord #code-reviews channel.
Never approve or merge — only summarize and flag.
```
"""

# ---------------------------------------------------------------------------
# FINANCE — Expense Tracking
# ---------------------------------------------------------------------------

FINANCE_GUIDE = r"""# OPENCLAW ONBOARDING GUIDE

**Your Agent. Your Hardware. Your Soul.**

---

**PREPARED FOR:** Sarah Martinez
**MISSION:** Automate expense categorization, invoice reminders, and quarterly tax prep for a freelance consulting practice
**DATE:** March 22, 2026
**STATUS:** [ INITIALIZING DEPLOYMENT ]

---

## KEY MOMENTS IN THIS GUIDE

| Step | What Happens | Why It Matters |
|------|-------------|----------------|
| Security Handshake | Establish single-operator boundary | Financial data (invoices, expenses, tax docs) never leaves your machine |
| Model Provider | Connect OpenAI Codex via OAuth | Best structured-output engine for categorization and report generation |
| Telegram Channel | Create your ExpenseTracker bot | Log expenses on the go — snap a receipt photo, get instant categorization |
| Skills | Configure Gmail scanning + CSV export | Auto-detect invoices in your inbox, export clean data for your accountant |
| Agent Hatching | Launch the Web UI control panel | Your financial command center — dashboards, categories, and tax prep |
| Agent 2 Handoff | Inject SOUL.md + config | Personalizes the agent to YOUR categories, YOUR clients, YOUR tax structure |

---

## 00 | PRE-FLIGHT CHECKLIST

Before you begin, ensure you have the following ready:

| | Requirement |
|---|---|
| [ ] | OpenAI Account (for Codex OAuth) |
| [ ] | Telegram Account (for channel) |
| [ ] | Google Workspace access (Gmail, Drive) |
| [ ] | Terminal access on your machine |

> 💡 **TIP:** Have your accountant's email handy — you'll configure automated CSV exports that go directly to them each quarter. This replaces the "zip folder of receipts" routine.

---

## 01 | THE SECURITY HANDSHAKE

When you launch `openclaw-onboard`, OpenClaw presents its security manifesto. Financial data requires strict boundaries — your agent will never share data externally or initiate payments.

> ✅ **ACTION:** Select "Yes" to acknowledge the single-operator boundary.

> ⚠️ **WARNING:** Your agent will scan Gmail for invoices and receipts. It processes this data locally — nothing is sent to external servers. However, ensure your machine's disk is encrypted (FileVault on Mac, BitLocker on Windows) since financial documents will be cached locally in `~/.openclaw/data/`.

---

## 02 | MODEL PROVIDER & CHANNEL SETUP

### Model Provider — OpenAI Codex

We recommend **OpenAI Codex (OAuth)** for structured data tasks like categorization and report generation.

> ✅ **ACTION:** Select "OpenAI" → "Codex (ChatGPT OAuth)" and sign in with your OpenAI account.

> 💡 **TIP:** Codex OAuth means no separate API billing — it uses your existing ChatGPT subscription. For a freelance practice processing ~50-100 expenses/month, this is the most cost-effective option.

### Model Selection

> ✅ **ACTION:** Select `openai-codex/gpt-5.2-codex` for reliable structured output.

### Channel — Telegram

Telegram provides quick access to expense logging on the go.

> ✅ **ACTION:** Select "Telegram (Bot API)" and follow the BotFather protocol:
> 1. Message **@BotFather** → `/newbot` → name it "ExpenseTracker"
> 2. Copy the API token and paste it into your terminal

> 💡 **TIP:** Pin your ExpenseTracker bot chat in Telegram. When you get a receipt, forward it to the bot — it'll auto-categorize and log it. No more shoebox of receipts at tax time.

---

## 03 | SKILLS CONFIGURATION

Skills tailored for freelance finance management:

| Skill | Purpose |
|-------|---------|
| `gog` | Gmail scanning for invoices & receipts |
| `summarize` | Condense bank statements & expense reports |
| `csv-tools` | Parse and generate CSV exports for accountant |

> ✅ **ACTION:** Select "Skip for now" — install via Web UI after initial setup.

> ⚠️ **WARNING:** When you install the `gog` skill later, it will request read access to your Gmail. Grant access only to your business email, not personal accounts. Use Gmail filters to label business invoices with "OpenClaw" so the agent scans only relevant emails.

---

## 04 | HATCHING & WEB UI

Your agent is ready to launch.

> ✅ **ACTION:** Select "Open the Web UI" to access your control panel at `http://127.0.0.1:18789`.

### Agent 2 Handoff

With the Web UI running, **Agent 2 injects your personalized configuration**.

| Field | Value |
|-------|-------|
| SOUL.md Location | `~/.openclaw/SOUL.md` |
| openclaw.json Location | `~/.openclaw/openclaw.json` |
| Primary Pain Point | Expense categorization & tax prep chaos |
| First Automation Target | Auto-categorize expenses from Gmail receipts |

> ⚠️ **WARNING:** Review the expense categories in your SOUL.md before going live. Miscategorized expenses can cause tax issues. Run a test week where you manually verify every categorization before trusting the automation.

---

## QUICK REFERENCE

| Item | Details |
|------|---------|
| Web UI URL | `http://127.0.0.1:18789` |
| Model Provider | OpenAI (Codex OAuth) |
| Channel | Telegram Bot |
| Tax Deadlines | Q1: Apr 15, Q2: Jun 15, Q3: Sep 15, Q4: Jan 15 |
| Documentation | https://docs.openclaw.ai |
| Security Audit | `openclaw security audit --deep` |

---

**OPENCLAW** | Your Agent. Your Hardware. Your Soul.

*Guide generated by EasyClaw AI Concierge*
"""

FINANCE_REFS = [
    {
        "name": "SOUL.md",
        "content": r"""# SOUL.md — ExpenseTracker

## Identity
You are **ExpenseTracker**, the personal finance assistant for Sarah Martinez's freelance consulting practice.

## Context
- **Operator:** Sarah Martinez — Independent management consultant
- **Revenue:** ~$180K/year across 4-6 active clients
- **Expense Categories:** Travel (35%), Software/SaaS (20%), Meals & Entertainment (15%), Office (10%), Professional Development (10%), Miscellaneous (10%)
- **Tax Structure:** Sole proprietor, quarterly estimated payments (US)
- **Tools:** Gmail, Google Drive, Google Sheets, Mint (personal), Wave (invoicing)

## Personality Traits
- Organized and detail-oriented — every dollar gets categorized
- Proactively reminds about upcoming deadlines (invoices, tax payments)
- Speaks in clear financial terms but avoids jargon overload
- Always includes running totals and category breakdowns

## Communication Rules
- Invoice reminders: 3 days before due, day of, 1 day overdue
- Expense logging: confirm categorization within 1 hour
- Monthly: expense summary by category on the 1st
- Quarterly: tax prep package 2 weeks before estimated payment due

## Boundaries
- Never initiate payments or transfers
- Never share financial data outside the operator boundary
- Flag unusual expenses (>$500 single transaction) for review
- Always confirm category before finalizing
""",
    },
]

FINANCE_PROMPTS = r"""# PROMPTS TO SEND — ExpenseTracker

Paste these prompts into your OpenClaw chat in order.

---

## Prompt 1 — Initialize Agent Identity

```
You are ExpenseTracker. Your personality:
- Precise and organized — every expense gets categorized immediately
- Proactive about deadlines — remind before things are overdue
- Clear financial language without unnecessary jargon
- Always show running totals and breakdowns

Format financial data in tables. Use currency formatting ($X,XXX.XX).
End weekly summaries with: "Q[N] estimated tax liability: $X,XXX"
```

---

## Prompt 2 — Expense Categories & Rules

```
Here are my expense categories and rules:

CATEGORIES:
1. Travel — flights, hotels, rideshare, parking, mileage
2. Software/SaaS — subscriptions, tools, cloud services
3. Meals & Entertainment — client meals (note attendee), solo working meals
4. Office — supplies, furniture, coworking space
5. Professional Development — courses, conferences, books
6. Miscellaneous — anything that doesn't fit above

RULES:
- Auto-categorize known vendors (e.g., Uber → Travel, AWS → Software)
- Flag anything >$500 for manual review
- Track mileage separately at $0.67/mile (2026 IRS rate)
- Separate personal vs. business on shared subscriptions
```

---

## Prompt 3 — Invoice & Tax Automation

```
Manage my invoicing and tax prep:

INVOICES:
- Scan Gmail for payment confirmations daily
- Track outstanding invoices: remind me 3 days before due
- If payment is 1 day overdue, draft a polite follow-up email for my review
- Monthly: list of all paid/unpaid invoices with totals

TAX PREP (Quarterly):
- 2 weeks before Q1 (Apr 15), Q2 (Jun 15), Q3 (Sep 15), Q4 (Jan 15):
  - Generate expense summary by category
  - Calculate estimated tax liability (30% effective rate)
  - List any missing receipts or uncategorized expenses
  - Export CSV for my accountant
```
"""

# ---------------------------------------------------------------------------
# CONTENT CREATION — Content Repurposing Pipeline
# ---------------------------------------------------------------------------

CONTENT_GUIDE = r"""# OPENCLAW ONBOARDING GUIDE

**Your Agent. Your Hardware. Your Soul.**

---

**PREPARED FOR:** Marcus Lee
**MISSION:** Auto-repurpose long-form content (YouTube videos, blog posts) into social posts, newsletters, and Twitter/X threads
**DATE:** March 22, 2026
**STATUS:** [ INITIALIZING DEPLOYMENT ]

---

## KEY MOMENTS IN THIS GUIDE

| Step | What Happens | Why It Matters |
|------|-------------|----------------|
| Security Handshake | Establish single-operator boundary | Your unpublished drafts and content strategy stay private |
| Model Provider | Connect Anthropic Claude via API key | Best writing model — matches your voice across Twitter, newsletter, LinkedIn |
| Slack Channel | Create ContentAgent bot in your workspace | All repurposed drafts land in #content-pipeline for your review |
| Skills | Configure summarize + search + Notion | Auto-distill videos, research trends, sync with your content calendar |
| Agent Hatching | Launch the Web UI control panel | Your content command center — feed it a video, get 5 platform-ready drafts |
| Agent 2 Handoff | Inject SOUL.md + config | Teaches the agent YOUR voice, YOUR platforms, YOUR content pillars |

---

## 00 | PRE-FLIGHT CHECKLIST

Before you begin, ensure you have the following ready:

| | Requirement |
|---|---|
| [ ] | Anthropic API Key (for Claude) |
| [ ] | Slack Workspace (for bot channel) |
| [ ] | Notion workspace with content calendar |
| [ ] | Terminal access on your machine |

> 💡 **TIP:** Have 2-3 of your best-performing tweets and one newsletter issue ready to paste as voice examples during the prompt injection phase. The more samples your agent has, the better it mirrors your tone.

---

## 01 | THE SECURITY HANDSHAKE

When you launch `openclaw-onboard`, OpenClaw presents its security manifesto. As a content creator, this ensures your drafts and unpublished content stay within your boundary.

> ✅ **ACTION:** Select "Yes" to acknowledge the single-operator boundary.

> ⚠️ **WARNING:** Your agent will process your unpublished content — video scripts, draft threads, newsletter ideas. All of this stays local. However, if you share your machine or use a shared workspace, ensure no one else has access to `~/.openclaw/data/` where drafts are cached.

---

## 02 | MODEL PROVIDER & CHANNEL SETUP

### Model Provider — Anthropic Claude

We recommend **Anthropic Claude** for its strong writing capabilities and ability to match your voice across formats.

> ✅ **ACTION:** Select "Anthropic" from the provider list.

### API Key Authentication

> ✅ **ACTION:** Paste your Anthropic API key from [console.anthropic.com](https://console.anthropic.com) and press Enter.

> 💡 **TIP:** Set a monthly spend limit on your Anthropic account. Content repurposing generates a lot of tokens — a 20-minute video transcript plus 5 output formats can use 10-15K tokens per run. At 4 videos/month, budget accordingly.

### Model Selection

> ✅ **ACTION:** Select `anthropic/claude-sonnet-4-20250514` for fast, high-quality content generation.

> 💡 **TIP:** Sonnet is the sweet spot for content work: fast enough to generate all 5 formats in under 30 seconds, creative enough to write engaging hooks. Use Opus only for long-form newsletter deep-dives.

### Channel — Slack Workspace

Slack integrates naturally with your existing content workflow and team collaboration.

> ✅ **ACTION:** Select "Slack (Workspace Bot)" from the channel list.

### Slack App Setup

1. Go to [api.slack.com/apps](https://api.slack.com/apps) → "Create New App"
2. Choose "From scratch" → name it "ContentAgent" → select your workspace
3. Under OAuth & Permissions, add scopes: `chat:write`, `channels:read`, `files:write`
4. Install the app to your workspace
5. Copy the Bot User OAuth Token and paste it into your terminal

> ⚠️ **WARNING:** The `files:write` scope allows your agent to upload draft documents to Slack. This is needed for sharing newsletter drafts and thread previews. If your Slack workspace has external guests, create a private `#content-pipeline` channel that only you can see.

---

## 03 | SKILLS CONFIGURATION

Skills tailored to content repurposing:

| Skill | Purpose |
|-------|---------|
| `summarize` | Distill long-form content into key points |
| `tavily-web-search` | Research trending topics & competitor content |
| `notion` | Sync with content calendar & idea backlog |

> ✅ **ACTION:** Select "Skip for now" — install via Web UI after setup.

> 💡 **TIP:** Install `notion` first — it syncs your content calendar so the agent knows your publishing schedule and can time repurposed content to match. No more manually checking "did I already tweet about that video?"

---

## 04 | HATCHING & WEB UI

Your content agent is ready to launch.

> ✅ **ACTION:** Select "Open the Web UI" to access your control panel at `http://127.0.0.1:18789`.

### Agent 2 Handoff

With the Web UI running, **Agent 2 injects your personalized configuration**.

| Field | Value |
|-------|-------|
| SOUL.md Location | `~/.openclaw/SOUL.md` |
| openclaw.json Location | `~/.openclaw/openclaw.json` |
| Primary Pain Point | Hours spent manually repurposing each video |
| First Automation Target | YouTube → Twitter thread + newsletter draft pipeline |

> ⚠️ **WARNING:** Review every generated draft before publishing. AI-generated content can occasionally produce claims you didn't make in the original video, or miss nuance that's obvious in video format. Your agent drafts — you publish.

---

## QUICK REFERENCE

| Item | Details |
|------|---------|
| Web UI URL | `http://127.0.0.1:18789` |
| Model Provider | Anthropic Claude (API Key) |
| Channel | Slack Bot |
| Content Cadence | 1 video/week → 3 threads + 1 newsletter + 1 LinkedIn |
| Documentation | https://docs.openclaw.ai |
| Security Audit | `openclaw security audit --deep` |

---

**OPENCLAW** | Your Agent. Your Hardware. Your Soul.

*Guide generated by EasyClaw AI Concierge*
"""

CONTENT_REFS = [
    {
        "name": "SOUL.md",
        "content": r"""# SOUL.md — ContentAgent

## Identity
You are **ContentAgent**, the content repurposing assistant for Marcus Lee.

## Context
- **Operator:** Marcus Lee — Content creator (tech/productivity niche)
- **Platforms:** YouTube (45K subs), Twitter/X (12K followers), Substack newsletter (8K subscribers)
- **Cadence:** 1 YouTube video/week, 3 Twitter threads/week, 1 newsletter/week
- **Content Pillars:** Productivity systems, developer tools, AI workflows
- **Tools:** Notion (content calendar), Descript (video editing), Buffer (social scheduling)

## Personality Traits
- Captures Marcus's voice: conversational, slightly nerdy, uses analogies
- Thinks in content atoms — every long-form piece has 5-10 smaller pieces inside
- Prioritizes hooks and engagement over completeness
- Understands platform-specific formatting (Twitter thread ≠ LinkedIn post ≠ newsletter)

## Communication Rules
- New video published: generate repurposing package within 1 hour
- Post to #content-pipeline Slack channel with all drafts
- Weekly: content performance summary every Monday 10 AM
- Always include suggested publish times based on historical engagement

## Boundaries
- Never publish directly — all content goes to drafts for Marcus's review
- Never fabricate stats or quotes — use only source material
- Flag if a repurposed piece diverges too far from the original
- Maintain consistent voice across all platforms
""",
    },
]

CONTENT_PROMPTS = r"""# PROMPTS TO SEND — ContentAgent

Paste these prompts into your OpenClaw chat in order.

---

## Prompt 1 — Initialize Agent Identity

```
You are ContentAgent. Your personality:
- Match Marcus's voice: conversational, slightly nerdy, uses real-world analogies
- Think in "content atoms" — every long-form piece contains multiple smaller pieces
- Prioritize hooks and engagement in every format
- Know the difference between platforms: Twitter is punchy, newsletter is deeper, LinkedIn is professional

Always format output as ready-to-publish drafts with platform labels.
```

---

## Prompt 2 — Content Pipeline Rules

```
Here is my content repurposing pipeline:

SOURCE CONTENT: YouTube video (transcript + title + description)

OUTPUT PACKAGE (generate all at once):
1. **Twitter/X Thread** (5-8 tweets) — hook first tweet, end with CTA to video
2. **Newsletter Section** (300-500 words) — deeper insight, personal angle, link to video
3. **LinkedIn Post** (150-250 words) — professional framing, key takeaway
4. **YouTube Community Post** — short teaser with question to drive comments
5. **Notion Entry** — title, publish date, all platform links (to be filled), performance notes (blank)

VOICE RULES:
- Use "I" not "we"
- Short paragraphs (2-3 sentences max)
- Include 1 analogy or metaphor per piece
- Twitter: use line breaks aggressively, no hashtags
- Newsletter: can be more reflective and detailed
```

---

## Prompt 3 — Weekly Performance & Ideas

```
Every Monday at 10 AM, post to #content-pipeline:

PERFORMANCE RECAP:
- Last week's video: views, watch time, CTR (I'll paste the data)
- Best-performing tweet thread: impressions, engagement rate
- Newsletter: open rate, click rate

IDEA GENERATION:
- Scan trending topics in tech/productivity via web search
- Cross-reference with my content pillars
- Suggest 3 video ideas with working titles and hook angles
- Flag any competitor content worth responding to
```
"""

# ---------------------------------------------------------------------------
# HEALTHCARE — Dental Appointment Reminders
# ---------------------------------------------------------------------------

HEALTHCARE_GUIDE = r"""# OPENCLAW ONBOARDING GUIDE

**Your Agent. Your Hardware. Your Soul.**

---

**PREPARED FOR:** Dr. Lisa Park
**MISSION:** Automate patient appointment reminders, follow-ups, and insurance verification for a dental practice
**DATE:** March 22, 2026
**STATUS:** [ INITIALIZING DEPLOYMENT ]

---

## KEY MOMENTS IN THIS GUIDE

| Step | What Happens | Why It Matters |
|------|-------------|----------------|
| Security Handshake | Establish single-operator boundary | Patient data (names, appointments, procedures) NEVER leaves your machine |
| Compliance Check | Review HIPAA considerations | Your practice handles PHI — this boundary must be airtight |
| Model Provider | Connect Google Gemini via API key | Native Google Workspace integration for Calendar and Gmail |
| WhatsApp Channel | Connect Twilio for patient messaging | 48h + 2h reminders via the channel your patients already use daily |
| Skills | Configure Calendar sync + summarizer | Auto-read tomorrow's schedule, condense insurance docs for front desk |
| Agent Hatching | Launch the Web UI control panel | Your practice communication hub — reminders, follow-ups, staff briefings |

---

## 00 | PRE-FLIGHT CHECKLIST

Before you begin, ensure you have the following ready:

| | Requirement |
|---|---|
| [ ] | Google Gemini API Key |
| [ ] | Twilio Account (for WhatsApp Business) |
| [ ] | Google Workspace (Calendar + Gmail) |
| [ ] | Terminal access on your machine |

> 💡 **TIP:** Use your practice's Google Workspace account (not personal Gmail) for the Calendar integration. This ensures the agent reads the correct appointment calendar and staff schedule — especially important if you have multiple providers sharing the same calendar system.

---

## 01 | SECURITY & COMPLIANCE NOTE

When you launch `openclaw-onboard`, OpenClaw presents its security manifesto. For a healthcare context, this boundary is especially critical — patient data never leaves your local environment.

> ✅ **ACTION:** Select "Yes" to acknowledge the single-operator boundary.

> ⚠️ **WARNING:** This agent will process patient names, appointment details, and procedure types. ALL data stays on your local machine — nothing is sent to external AI servers for training. However, you MUST have your HIPAA compliance officer review this setup before processing real patient information. OpenClaw provides the technical boundary; your practice provides the policy boundary.

> ⚠️ **WARNING:** WhatsApp messages to patients travel through Twilio's infrastructure. Ensure your Twilio account has a signed Business Associate Agreement (BAA) before sending any messages that contain Protected Health Information (PHI). Generic reminders ("Your appointment is tomorrow at 2 PM") are safe; specific procedure names in messages are not.

---

## 02 | MODEL PROVIDER & CHANNEL SETUP

### Model Provider — Google Gemini

We recommend **Google Gemini** for its integration with Google Workspace, which your practice already uses for scheduling.

> ✅ **ACTION:** Select "Google Gemini" from the provider list.

### API Key Authentication

> ✅ **ACTION:** Paste your Gemini API key from [Google AI Studio](https://aistudio.google.com) and press Enter.

> 💡 **TIP:** The Gemini free tier handles appointment reminders easily — at 40 appointments/day, you'll use ~200 API calls/day for reminders + follow-ups, well within free limits. Only upgrade if you add insurance document summarization.

### Channel — WhatsApp via Twilio

WhatsApp is the most accessible channel for patient communication across all age groups.

> ✅ **ACTION:** Select "WhatsApp (Twilio)" from the channel list.

### Twilio Setup

1. Sign up at [twilio.com](https://www.twilio.com) if you haven't already
2. Activate the WhatsApp sandbox or connect your WhatsApp Business number
3. Copy your Account SID, Auth Token, and WhatsApp number
4. Paste each value into the terminal when prompted

> 💡 **TIP:** Use a dedicated WhatsApp Business number — not your personal or front-desk number. This keeps patient automated messages separate from manual conversations. Patients can still reply to reschedule, and those replies route to your agent.

> ⚠️ **WARNING:** Twilio charges per WhatsApp message (~$0.005-0.05 depending on region). At 40 appointments/day with 2 reminders each, budget ~$120-150/month for messaging costs. The ROI from reduced no-shows (18% → <8%) far exceeds this — but set up Twilio spending alerts to avoid surprises.

---

## 03 | SKILLS & HATCHING

### Skills for Dental Practice

| Skill | Purpose |
|-------|---------|
| `gog` | Google Calendar sync for appointments |
| `summarize` | Condense patient notes and insurance docs |
| `google-calendar` | Direct calendar read/write for scheduling |

> ✅ **ACTION:** Select "Skip for now" — install via Web UI after setup.

> 💡 **TIP:** Install `google-calendar` first — it's the backbone of the reminder system. Once connected, the agent automatically reads tomorrow's schedule each evening and queues the 48h reminders. No manual intervention needed.

### Launch

> ✅ **ACTION:** Select "Open the Web UI" to access `http://127.0.0.1:18789`.

### Agent 2 Handoff

With the Web UI running, **Agent 2 injects your personalized configuration**.

| Field | Value |
|-------|-------|
| SOUL.md Location | `~/.openclaw/SOUL.md` |
| openclaw.json Location | `~/.openclaw/openclaw.json` |
| Primary Pain Point | No-shows and last-minute cancellations (18% rate) |
| First Automation Target | 48h + 2h appointment reminders via WhatsApp |
| Target No-Show Rate | < 8% within 30 days of activation |

> ⚠️ **WARNING:** Run the agent in "shadow mode" for the first week — let it generate reminders but have front desk send them manually after review. This catches any template issues before they reach patients. Disable shadow mode via the Web UI once you're confident in the output.

---

## QUICK REFERENCE

| Item | Details |
|------|---------|
| Web UI URL | `http://127.0.0.1:18789` |
| Model Provider | Google Gemini (API Key) |
| Channel | WhatsApp (Twilio) |
| Reminder Schedule | 48h before + 2h before each appointment |
| Quiet Hours | No messages before 8 AM or after 7 PM |
| Documentation | https://docs.openclaw.ai |
| Security Audit | `openclaw security audit --deep` |

---

**OPENCLAW** | Your Agent. Your Hardware. Your Soul.

*Guide generated by EasyClaw AI Concierge*
"""

HEALTHCARE_REFS = [
    {
        "name": "SOUL.md",
        "content": r"""# SOUL.md — DentalAssistant

## Identity
You are **DentalAssistant**, the patient communication and scheduling assistant for Dr. Lisa Park's dental practice.

## Context
- **Operator:** Dr. Lisa Park — Owner of Park Family Dentistry
- **Practice Size:** 2 dentists, 3 hygienists, 2 front-desk staff
- **Patients:** ~1,200 active patients
- **Appointments:** ~40/day across all providers
- **Tools:** Google Calendar (scheduling), Gmail, Dentrix (practice management)
- **No-show Rate:** Currently 18% — target is <8%

## Personality Traits
- Warm and professional — patients should feel cared for, not spammed
- Uses simple, non-clinical language in patient messages
- Efficient with staff communications — direct and actionable
- Mindful of patient anxiety — never uses alarming language

## Communication Rules
- Appointment reminders: 48 hours before + 2 hours before via WhatsApp
- No-show follow-up: same-day message offering reschedule
- Post-procedure check-in: 24 hours after major procedures
- Staff briefing: daily at 7:30 AM with day's schedule overview

## Boundaries
- NEVER share patient information between patients
- NEVER provide medical advice or diagnoses
- NEVER confirm insurance coverage — only flag items for staff to verify
- All patient-facing messages require template approval before first use
- Comply with HIPAA: no PHI in unencrypted channels
""",
    },
]

HEALTHCARE_PROMPTS = r"""# PROMPTS TO SEND — DentalAssistant

Paste these prompts into your OpenClaw chat in order.

---

## Prompt 1 — Initialize Agent Identity

```
You are DentalAssistant. Your personality:
- Warm and professional — patients feel cared for, not nagged
- Use simple, friendly language — no clinical jargon in patient messages
- Efficient with staff — direct, actionable, no fluff
- Sensitive to dental anxiety — reassuring tone always

Patient messages should feel personal, not automated.
Staff messages should be concise with clear action items.
```

---

## Prompt 2 — Appointment Reminder Protocol

```
Manage appointment reminders with this protocol:

REMINDER SCHEDULE:
1. **48 hours before**: WhatsApp message with date, time, provider, and "Reply YES to confirm"
2. **2 hours before**: "Quick reminder — your appointment is at [TIME] today with [PROVIDER]"
3. **No confirmation by 24h mark**: Flag for front desk to call manually

NO-SHOW PROTOCOL:
- If patient misses appointment: send same-day message
  "Hi [Name], we missed you today! Would you like to reschedule? Reply with a preferred day and we'll find a time."
- Log no-show in daily report for Dr. Park

POST-PROCEDURE (for extractions, root canals, implants):
- 24h after: "Hi [Name], how are you feeling after yesterday's [procedure]? Any concerns? Don't hesitate to reach out."

MESSAGE RULES:
- Always use patient's first name
- Never mention costs or insurance in automated messages
- Include practice phone number in every message
- Respect quiet hours: no messages before 8 AM or after 7 PM
```
"""

# ---------------------------------------------------------------------------
# DEMO_GUIDES dictionary — all 5 demos
# ---------------------------------------------------------------------------

DEMO_GUIDES = {
    "demo-restaurant": {
        "guide_id": "demo-restaurant",
        "title": "Scouts Coffee",
        "subtitle": "Staff scheduling & supplier automation for a growing SF café",
        "category": "Small Business",
        "icon": "coffee",
        "color": "amber",
        "status": "complete",
        "message": "Demo guide generated successfully.",
        "scorecard": {
            "context_depth": 0.96,
            "sections_covered": 11,
            "sections_total": 11,
            "follow_ups": [],
        },
        "outputs": {
            "setup_guide": RESTAURANT_GUIDE,
            "reference_documents": RESTAURANT_REFS,
            "prompts_to_send": RESTAURANT_PROMPTS,
        },
    },
    "demo-devops": {
        "guide_id": "demo-devops",
        "title": "Autonomous Dev Agent",
        "subtitle": "CI/CD monitoring, PR reviews & deployment automation",
        "category": "Developer Tools",
        "icon": "terminal",
        "color": "emerald",
        "status": "complete",
        "message": "Demo guide generated successfully.",
        "scorecard": {
            "context_depth": 0.85,
            "sections_covered": 7,
            "sections_total": 8,
            "follow_ups": ["Preferred CI/CD platform?"],
        },
        "outputs": {
            "setup_guide": DEVOPS_GUIDE,
            "reference_documents": DEVOPS_REFS,
            "prompts_to_send": DEVOPS_PROMPTS,
        },
    },
    "demo-finance": {
        "guide_id": "demo-finance",
        "title": "Expense Tracking",
        "subtitle": "Expense categorization, invoice reminders & tax prep",
        "category": "Finance",
        "icon": "receipt",
        "color": "blue",
        "status": "complete",
        "message": "Demo guide generated successfully.",
        "scorecard": {
            "context_depth": 0.75,
            "sections_covered": 6,
            "sections_total": 8,
            "follow_ups": ["Preferred currency?", "Tax jurisdiction?"],
        },
        "outputs": {
            "setup_guide": FINANCE_GUIDE,
            "reference_documents": FINANCE_REFS,
            "prompts_to_send": FINANCE_PROMPTS,
        },
    },
    "demo-content": {
        "guide_id": "demo-content",
        "title": "Content Repurposing Pipeline",
        "subtitle": "Auto-repurpose videos into social posts, newsletters & threads",
        "category": "Content Creation",
        "icon": "pen-tool",
        "color": "purple",
        "status": "complete",
        "message": "Demo guide generated successfully.",
        "scorecard": {
            "context_depth": 0.88,
            "sections_covered": 7,
            "sections_total": 8,
            "follow_ups": [],
        },
        "outputs": {
            "setup_guide": CONTENT_GUIDE,
            "reference_documents": CONTENT_REFS,
            "prompts_to_send": CONTENT_PROMPTS,
        },
    },
    "demo-healthcare": {
        "guide_id": "demo-healthcare",
        "title": "Dental Appointment Reminders",
        "subtitle": "Patient reminders, follow-ups & insurance verification",
        "category": "Healthcare",
        "icon": "heart-pulse",
        "color": "rose",
        "status": "complete",
        "message": "Demo guide generated successfully.",
        "scorecard": {
            "context_depth": 0.68,
            "sections_covered": 5,
            "sections_total": 8,
            "follow_ups": [
                "HIPAA compliance officer contact?",
                "SMS provider preference?",
                "After-hours protocol?",
            ],
        },
        "outputs": {
            "setup_guide": HEALTHCARE_GUIDE,
            "reference_documents": HEALTHCARE_REFS,
            "prompts_to_send": HEALTHCARE_PROMPTS,
        },
    },
}


# ---------------------------------------------------------------------------
# Scorecard computation for real (non-demo) guides
# ---------------------------------------------------------------------------


def compute_scorecard(outputs: dict) -> dict:
    """Compute a lightweight scorecard from generated guide outputs."""
    guide = outputs.get("setup_guide", "") or ""
    sections_found = len(re.findall(r"^## \d+", guide, re.MULTILINE))
    sections_total = 8
    ref_docs = len(outputs.get("reference_documents", []))
    has_prompts = bool((outputs.get("prompts_to_send", "") or "").strip())

    guide_len = len(guide)
    context_depth = min(1.0, guide_len / 15000)

    follow_ups = []
    if sections_found < sections_total:
        follow_ups.append(
            f"{sections_total - sections_found} guide sections may need expansion"
        )
    if ref_docs < 2:
        follow_ups.append("Consider adding more reference documents")
    if not has_prompts:
        follow_ups.append("Prompts file is empty")

    return {
        "context_depth": round(context_depth, 2),
        "sections_covered": sections_found,
        "sections_total": sections_total,
        "follow_ups": follow_ups,
    }
