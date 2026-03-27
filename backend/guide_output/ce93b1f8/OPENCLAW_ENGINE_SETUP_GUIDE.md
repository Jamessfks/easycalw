# OpenClaw Engine Setup Guide

| Field | Detail |
|---|---|
| **PREPARED FOR** | Kai Nakamura, Founder & CTO — SynthLabs |
| **MISSION** | Autonomous coordination brain for a seed-stage AI startup: GitHub monitoring, Slack digests, investor comms, burn-rate tracking, and PR code review — so Kai can stay in deep engineering mode |
| **DATE** | 2026-03-26 |
| **DEPLOYMENT** | Mac Mini M4 Pro, 48 GB RAM — local, always-on |
| **CHANNEL** | Telegram (primary) → Slack (team rollout, Phase 2) |
| **MODEL** | Claude claude-sonnet-4-6 (Sonnet) by default; Opus for complex multi-step reasoning tasks |
| **STATUS** | Ready to deploy |

---

**You're about to stop being the coordination layer for SynthLabs — OpenClaw will monitor your GitHub repos, digest overnight Slack threads, track burn rate in Google Sheets, draft investor updates, and review PRs autonomously, so every hour you reclaim goes back into building the product that just closed your seed round.**

---

## 🎯 Key Moments

- **Running instance in ~20 minutes:** Your Mac Mini is already running Postgres, a local LLM inference server, and cron jobs — OpenClaw slots right in alongside them with a single `npm install -g openclaw` and a five-minute `openclaw onboard` wizard.
- **Tailored automations live on Day 1:** A morning briefing cron hitting GitHub, Slack, and Google Sheets lands in your Telegram at 07:00 every morning; a separate heartbeat cron watches open PRs and tags you only when CI fails or a review comment is added.
- **Guardrails exactly where you want them:** Full autonomy for internal ops, summaries, and calendar — hard approval gate for anything that sends external email to investors or clients, or that touches spend. The agent acts and logs; you audit at your convenience.

---

## 00 | ✅ Pre-Flight Checklist

Before writing a single command, confirm these are true on the Mac Mini:

- [ ] macOS 14 Sonoma or later (`sw_vers`)
- [ ] Xcode Command Line Tools installed (`xcode-select --version`)
- [ ] Node.js 20 LTS or later (`node --version`)
- [ ] npm 10+ (`npm --version`)
- [ ] Homebrew available (`brew --version`)
- [ ] Existing services (Postgres, inference server, cron) are not binding ports 3000 or 4000 (OpenClaw defaults)
- [ ] Anthropic API key ready (you already use the API for internal SynthLabs tools — same key is fine)
- [ ] Telegram account active and able to receive BotFather messages

> 💡 **TIP — Why check ports first?**
> OpenClaw's gateway defaults to port 3000 and its MCP server to port 4000. Your existing services might already own one of those. Run `lsof -i :3000 -i :4000` before you start — a port conflict produces a silent startup failure that can waste 30 minutes of debugging.

---

## 01 | ✅ Install OpenClaw

```bash
npm install -g openclaw
```

**Verify it worked:**
```
$ openclaw --version
openclaw/2.17.0 darwin-arm64 node-v20.x.x
```

If you see a version string with `darwin-arm64`, you're on native Apple Silicon — no Rosetta translation layer, full M4 Pro performance.

> ⚠️ **WARNING — nvm users**
> If Node.js is managed by nvm, the global `openclaw` binary lives inside your nvm shim directory, not `/usr/local/bin`. Run `which openclaw` after install to confirm the path resolves. Add `nvm use --lts` to your shell startup file if you switch Node versions.

---

## 02 | ✅ Run the Setup Wizard

```bash
openclaw onboard
```

When the wizard prompts you, make these selections:

| Prompt | Recommended Choice for Kai |
|---|---|
| Gateway type | **Local** (your Mac Mini is always on — no VPS needed) |
| Model provider | **Anthropic** (you already have an API key and use Claude in your stack) |
| Primary channel | **Telegram** |
| Workspace name | `synthlabs` |

The wizard generates these files in `~/.openclaw/`:

| File | Purpose |
|---|---|
| `SOUL.md` | Agent personality and operating values |
| `USER.md` | Your profile — name, role, preferences |
| `AGENTS.md` | Sub-agent definitions |
| `TOOLS.md` | Configured repo paths, API pointers |
| `MEMORY.md` | Persistent long-term learnings |

**Verify it worked:**
```
$ openclaw status
Gateway:   running  (localhost:3000)
Channel:   telegram (connected)
Model:     claude-sonnet-4-6 (Anthropic)
Workspace: synthlabs
```

![OpenClaw onboard wizard completing successfully](templates/images/image1.png)

---

## 03 | ✅ Configure Your Anthropic API Key

OpenClaw needs your Anthropic key in its environment, not hard-coded in any file.

```bash
openclaw config set ANTHROPIC_API_KEY YOUR_ANTHROPIC_API_KEY
```

> ⚠️ **WARNING — Never put real API keys in SOUL.md, USER.md, or any config file you might commit or back up.**
> You already use 1Password for SynthLabs secrets — use it here too. The pattern that works well: store the key in 1Password, export it into your shell session with `export ANTHROPIC_API_KEY=$(op item get "OpenClaw Anthropic" --fields password)`, and let OpenClaw pick it up from the environment.

**Verify it worked:**
```
$ openclaw chat --once "What model are you using?"
I'm running on claude-sonnet-4-6 via Anthropic's API.
```

---

## 04 | 🛡️ Security First — Install skill-vetter Before Anything Else

> ⚠️ **WARNING — The ClawHavoc incident (February 2026) injected 1,184 malicious skills into the ClawHub registry.** Every skill you install after this point must be scanned. `skill-vetter` is not optional — it is your first install, every time, on every machine.

```bash
clawhub install skill-vetter
```

**Verify it worked:**
```
$ openclaw chat --once "Run skill-vetter self-check"
skill-vetter v1.x.x active. No suspicious patterns detected in installed skills (0 skills installed).
```

> 💡 **TIP — What skill-vetter actually does**
> It statically analyses a skill's code before granting it filesystem or network access. It checks for undeclared outbound connections, credential exfiltration patterns, and known malware signatures. Think of it as `npm audit` but for OpenClaw skills — and far more important, because skills run with agent-level trust on your machine.

---

## 05 | ✅ Connect Telegram

```bash
openclaw channels add telegram
```

The CLI will prompt you through the BotFather flow: create a new bot, copy the token, paste it in.

```bash
# Paste your token when prompted:
# Bot token: YOUR_TELEGRAM_BOT_TOKEN
```

**Verify it worked:**
Open Telegram, find your new bot, send `/start`. You should receive:

```
Hi Kai! I'm your OpenClaw agent for SynthLabs. I'm online and ready.
```

![Telegram bot responding to /start message](templates/images/image2.png)

---

## 06 | ✅ Install and Configure the Core Skill Stack

Now install skills — scanning each one with skill-vetter first.

### 6.1 Google Workspace (Gmail + Calendar + Sheets + Drive)

```bash
clawhub install skill-vetter  # already installed — re-run scan on new skills
clawhub install gog
```

This single skill covers Gmail, Google Calendar, Drive, Docs, and Sheets — the entire Google Workspace surface Kai needs for investor emails, burn-rate Sheets, and calendar management.

**Required:** Google OAuth (the wizard will open a browser tab)

**Verify it worked:**
```
$ openclaw chat --once "How many unread emails do I have?"
You have 14 unread emails. The 3 most recent are from: ...
```

> 💡 **TIP — Why gog covers everything**
> Rather than installing five separate skills for Gmail, Calendar, Sheets, Drive, and Docs, `gog` (Google) is the official first-party skill that wraps all of them under one OAuth grant. Fewer permissions surfaces = smaller attack surface.

### 6.2 GitHub

```bash
clawhub install github
```

This wraps the `gh` CLI to manage repos, issues, PRs, and branches through natural language. Essential for Kai's PR monitoring and code review workflow.

**Required:** GitHub Personal Access Token (scope: `repo`, `read:org`)

```bash
# Set via 1Password:
export GITHUB_TOKEN=$(op item get "SynthLabs GitHub PAT" --fields password)
openclaw config set GITHUB_TOKEN YOUR_GITHUB_API_KEY
```

**Verify it worked:**
```
$ openclaw chat --once "List open PRs in the synthlabs repo"
Found 3 open PRs: #42 (feat/data-augmentation), #39 (fix/pipeline-timeout), #37 (chore/deps-update)
```

### 6.3 Slack

```bash
clawhub install slack
```

Read, summarize, and post to Slack channels. This is what powers the overnight Slack digest that lands in Kai's Telegram each morning.

**Required:** Slack Bot Token (OAuth, scopes: `channels:history`, `channels:read`, `chat:write`)

```bash
openclaw config set SLACK_BOT_TOKEN YOUR_SLACK_BOT_TOKEN
```

**Verify it worked:**
```
$ openclaw chat --once "Summarize the last 20 messages in #general"
Here's what happened in #general while you were away: ...
```

### 6.4 Linear

```bash
clawhub install linear
```

Create, update, and query Linear issues and cycles through conversation.

**Required:** Linear API Key (from Linear → Settings → API)

```bash
openclaw config set LINEAR_API_KEY YOUR_LINEAR_API_KEY
```

**Verify it worked:**
```
$ openclaw chat --once "What's in the current sprint?"
Current sprint has 8 issues: 3 In Progress, 2 In Review, 3 Backlog...
```

### 6.5 Notion

```bash
clawhub install notion
```

Read and write your internal wiki — useful for automatically logging agent actions, decisions, and meeting notes.

**Required:** Notion Integration Token

```bash
openclaw config set NOTION_TOKEN YOUR_NOTION_API_KEY
```

**Verify it worked:**
```
$ openclaw chat --once "Find the SynthLabs onboarding page"
Found: "Engineering Onboarding" in SynthLabs workspace. Last edited 3 days ago.
```

### 6.6 Vercel

```bash
clawhub install vercel
```

Deploy, rollback, and debug Vercel projects through conversational commands — no terminal gymnastics needed mid-context-switch.

**Required:** Vercel account + Vercel CLI (`npm install -g vercel` if not already installed)

**Verify it worked:**
```
$ openclaw chat --once "What's the status of the last Vercel deployment?"
Latest deployment: synthlabs-app (prod) — Ready. Deployed 2h ago from main branch.
```

### 6.7 Developer Workflow Skills

```bash
clawhub install coding-agent
clawhub install github
clawhub install debug-pro
clawhub install test-runner
```

`coding-agent` orchestrates Claude Code and other coding models. `debug-pro` provides a structured debugging methodology. `test-runner` automates the full test-write-run-interpret cycle. These three work together to make the PR review workflow fully autonomous.

**Verify it worked:**
```
$ openclaw chat --once "Review the latest PR on the synthlabs-core repo"
PR #42 feat/data-augmentation: Code looks clean. 2 suggestions: (1) missing null check in augment_pipeline.py:147, (2) test coverage for edge case when input_size=0. No blocking issues.
```

### 6.8 Multi-Agent Orchestration

```bash
clawhub install agent-team-orchestration
clawhub install cc-godmode
```

These enable the Speedy-style orchestrator pattern — the main agent coordinates, sub-agents do the implementation. Critical for keeping Kai's agent context clean when handling complex multi-step tasks.

> 💡 **TIP — Why orchestration matters for a 10/10 engineer**
> The temptation is to let the main agent do everything. But when it ingests full PR diffs, Slack history, and email threads simultaneously, context window pollution degrades quality fast. The orchestrator pattern keeps the main agent as a project manager — it delegates, reviews, and reports — while sub-agents handle the deep work. This is exactly how the Speedy autonomous dev agent architecture works at production scale.

### 6.9 Self-Improvement and Memory

```bash
clawhub install self-improving-agent
clawhub install capability-evolver
clawhub install memory-hygiene
```

These three skills make the agent measurably better over time without manual configuration. `self-improving-agent` logs errors and preferences. `capability-evolver` reviews session logs and updates behavior. `memory-hygiene` prunes stale context that would otherwise make the agent less accurate after months of use.

---

## 07 | ✅ Configure SOUL.md for Kai's Specific Workflow

Edit `~/.openclaw/SOUL.md` to establish Kai's autonomy model — full authority for internal ops, human-in-the-loop for external comms and spend:

```markdown
## Identity
You are Kai's autonomous operations brain at SynthLabs. You act decisively, log everything, and report summaries. You do not ask for permission on internal tasks.

## Autonomy Rules
FULL AUTONOMY (act and report):
- GitHub monitoring, PR summaries, code review comments (internal)
- Slack thread digests
- Calendar management
- Google Sheets updates (burn rate, metrics)
- Linear issue creation and updates
- Notion wiki updates
- Vercel deployment status checks

REQUIRES KAI'S APPROVAL BEFORE ACTING:
- Any email to investors, clients, or external parties
- Any financial transaction or service charge
- Deleting data from any system
- Any action affecting production infrastructure

## Commit/Comment Identification
All git commits, PR comments, and Slack messages authored by this agent MUST be prefixed with [OpenClaw] to distinguish AI-generated content from human contributions.

## Reporting
After every autonomous action, send a one-line Telegram summary to Kai: what you did, what the outcome was.
```

**Verify it worked:**
```
$ openclaw chat --once "What are your autonomy rules?"
I have full autonomy for internal ops tasks including GitHub, Slack, Calendar, Sheets, Linear, and Notion. I require your approval before sending external communications to investors or clients, and before any spending action.
```

![SOUL.md autonomy configuration](templates/images/image3.png)

---

## 08 | ✅ Set Up the Morning Briefing Cron

This cron fires at 07:00 every day, compiles a digest from GitHub, Slack, Google Sheets (burn rate), and Linear, and sends it to Kai's Telegram.

```bash
crontab -e
```

Add this line:

```
0 7 * * * /usr/local/bin/openclaw chat --once "Morning briefing: summarize overnight GitHub activity across all SynthLabs repos, digest the last 12 hours of Slack in #engineering and #general, check the burn-rate Google Sheet for any anomalies, and list today's calendar events. Send the result to Telegram." >> /tmp/openclaw-morning.log 2>&1
```

**Verify it worked** (run the command manually to test before relying on cron):

```bash
openclaw chat --once "Morning briefing: summarize overnight GitHub activity across all SynthLabs repos, digest the last 12 hours of Slack in #engineering and #general, check the burn-rate Google Sheet for any anomalies, and list today's calendar events. Send the result to Telegram."
```

Expected output in Telegram:
```
☀️ SynthLabs Morning Brief — 2026-03-26

GitHub: 3 commits to main (pipeline work), PR #42 waiting on review, CI green.
Slack: Team discussed the augmentation bottleneck in #engineering. No blockers surfaced.
Burn Rate: $47,200 spent this month vs $51,000 budget — on track.
Today: Investor call 2pm (Sequoia), team standup 10am, no conflicts.
```

> ⚠️ **WARNING — Cron jobs can fail silently**
> If the Mac Mini goes to sleep, loses network, or OpenClaw's gateway restarts, the morning cron will fail without any notification. Add a heartbeat monitor (see Section 09) to catch this. Also add `openclaw gateway restart` as a launchd agent at system boot — see the note below.

**Set OpenClaw to auto-start on boot:**
```bash
# Add to /Library/LaunchDaemons/com.openclaw.gateway.plist
# Or use the built-in boot helper:
openclaw gateway enable-autostart
```

**Verify autostart is set:**
```
$ openclaw gateway status
Gateway: running (auto-start: enabled, uptime: 4h 23m)
```

---

## 09 | ✅ Set Up the PR Heartbeat Monitor

This cron runs every 30 minutes and checks open PRs. It only pings Kai in Telegram if: CI has newly failed, a review comment was added, or a PR has been open without review for more than 24 hours.

```bash
crontab -e
```

Add this line:

```
*/30 * * * * /usr/local/bin/openclaw chat --once "PR heartbeat: check all open PRs in SynthLabs GitHub repos. Notify me on Telegram only if: (1) CI status has changed to failed since last check, (2) a new review comment was added in the last 30 minutes, or (3) a PR has been open with no review for more than 24 hours. Otherwise stay silent." >> /tmp/openclaw-pr-heartbeat.log 2>&1
```

> 💡 **TIP — The heartbeat is the most underrated feature of autonomous setups**
> In production autonomous dev agent deployments (like the Speedy architecture), the heartbeat cron is what separates "it works in a demo" from "it works at 2am when no one is watching." It catches stalled CI runs, unanswered review comments, and broken workflows before they become blockers at standup.

**Verify it worked:**
```
$ openclaw chat --once "PR heartbeat check — test mode"
Checking 3 open PRs... PR #42: CI green, 0 new comments. PR #39: CI green, 0 new comments. PR #37: CI green, 0 new comments. No notifications needed.
```

---

## 10 | ✅ Burn Rate Tracker in Google Sheets

SynthLabs is post-seed and burn rate visibility matters. This workflow lets Kai message the bot "log $3,200 AWS bill" from Telegram and have it automatically categorized and entered into the burn-rate Google Sheet.

```bash
# gog (Google Workspace) is already installed — no additional skills needed.
# Configure the Sheet ID:
openclaw config set BURN_RATE_SHEET_ID YOUR_GOOGLE_SHEET_ID
```

Edit `~/.openclaw/TOOLS.md` to add:

```markdown
## Burn Rate Sheet
Sheet name: SynthLabs Burn Rate Tracker
Sheet ID: (set via BURN_RATE_SHEET_ID env variable)
Categories: Infrastructure (AWS/GCP/Vercel), Tooling (SaaS), Payroll, Legal, Other
Always add: date, amount, category, vendor, entered-by: OpenClaw
```

**Verify it worked:**
```
$ openclaw chat --once "Log $450 Anthropic API bill for March"
Logged: $450 | Tooling | Anthropic API | 2026-03-26 | Entered by: OpenClaw. Row added to SynthLabs Burn Rate Tracker.
```

---

## 11 | ✅ Investor Update Email Workflow (Human-in-the-Loop)

This is one of the two areas where Kai wants explicit approval before the agent acts. The workflow: OpenClaw drafts the update, sends it to Kai on Telegram for review, Kai replies "send" or edits inline, then the agent sends via Gmail.

No additional skills needed beyond `gog`. Configure the workflow in `~/.openclaw/AGENTS.md`:

```markdown
## Investor Update Agent
Trigger: Kai asks "draft investor update"
Steps:
1. Pull data: GitHub activity summary (last 2 weeks), burn rate from Sheet, Linear sprint velocity
2. Draft a concise investor update email in the standard format (see MEMORY.md for past examples)
3. Send draft to Kai on Telegram with: "REVIEW REQUIRED: Investor update draft. Reply 'send' to dispatch or paste your edits."
4. WAIT for explicit "send" confirmation before dispatching.
5. On confirmation: send via Gmail to investors@synthlabs.com distribution list.
6. Log sent status to Notion (Investor Relations page).
NEVER send the email without step 4 confirmation.
```

> ⚠️ **WARNING — External communications require explicit approval**
> This is non-negotiable. An autonomous agent sending an inaccurate investor update, even once, creates reputational damage that takes months to repair. The approval gate in AGENTS.md is enforced by your SOUL.md autonomy rules. Do not modify the SOUL.md to grant autonomy over investor or client emails.

---

## 12 | ✅ Writing Custom Skills (Power-User Path)

Kai mentioned wanting to write custom skills if built-ins don't cover his needs. Here's the pattern:

```bash
# Create a new skill workspace:
mkdir ~/.openclaw/skills/synthlabs-pipeline-monitor
cd ~/.openclaw/skills/synthlabs-pipeline-monitor

# Scaffold the skill:
openclaw skill create synthlabs-pipeline-monitor
```

The scaffold generates:
- `SKILL.md` — skill description, triggers, and permissions declaration
- `skill.js` (or `skill.py`) — implementation
- `README.md` — documentation

> 💡 **TIP — Custom skill architecture for ML pipeline monitoring**
> For monitoring SynthLabs' synthetic data pipelines, a custom skill that polls your internal pipeline API (or reads logs from Postgres) and surfaces anomalies to Telegram is a natural first custom skill. The key design rule from production autonomous agent experience: **the main agent should orchestrate, not implement**. Your custom skill should expose a clean `check_pipeline_health()` function that returns structured JSON — let the main agent interpret and report.

**Required scan before activating any custom skill:**
```bash
# Even your own skills should be vetted:
openclaw chat --once "Run skill-vetter on ~/.openclaw/skills/synthlabs-pipeline-monitor"
```

---

## 13 | ✅ Advanced Security Layer

Kai's setup involves GitHub, Slack, email, and financial data — a broad attack surface. Install the full security stack:

```bash
clawhub install clawscan
clawhub install prompt-guard
clawhub install agentguard
clawhub install agent-audit-trail
clawhub install agent-access-control
```

| Skill | What it protects |
|---|---|
| `clawscan` | Scans skill bundles for malicious code patterns and undeclared network calls |
| `prompt-guard` | Defends against prompt injection in emails, web pages, and Slack messages the agent reads |
| `agentguard` | Real-time behavioral guardrails — blocks unintended high-risk actions before execution |
| `agent-audit-trail` | Hash-chained tamper-evident log of every action the agent ever takes |
| `agent-access-control` | Tiered trust — when team members eventually message the Slack-integrated agent, they get scoped access |

**Verify the full security stack:**
```
$ openclaw chat --once "Run a full security audit"
Security posture: STRONG
Skills installed: 14 | All scanned: ✓ | Prompt injection guard: active | Audit trail: active
Behavioral guardrails: active | Access control: configured (owner tier: Kai)
Recommendations: none
```

> 💡 **TIP — Why agent-access-control matters before the Slack rollout**
> When Kai rolls out Slack integration so the whole team can use the agent, `agent-access-control` ensures engineers can ask for PR summaries and code help, but cannot invoke the investor email workflow, modify SOUL.md, or access the burn-rate Sheet. Set up the tier config now, before the team has access.

---

## 14 | ✅ Phase 2 — Slack Team Rollout

When Kai is ready to extend access to the two engineers:

```bash
openclaw channels add slack
```

```bash
openclaw config set SLACK_BOT_TOKEN YOUR_SLACK_BOT_TOKEN
openclaw config set SLACK_SIGNING_SECRET YOUR_SLACK_SIGNING_SECRET
```

**Verify it worked:**
```
$ openclaw chat --once "Post 'OpenClaw is now live in Slack' to #engineering"
Posted to #engineering: "OpenClaw is now live in Slack ✓"
```

Configure team access tiers in `~/.openclaw/AGENTS.md`:

```markdown
## Slack Access Tiers
Owner (Kai): full autonomy per SOUL.md
Engineers (team): can request PR summaries, code review, Linear updates, Slack digests
Engineers: CANNOT invoke investor email workflow, modify configuration, or access financial sheets
```

---

> 💡 **TIP — The "act and tell me" principle**
> You told us you want an agent that acts and tells you what it did, not one that asks permission. The SOUL.md configuration in Section 07 operationalises this exactly. Every autonomous action triggers a one-line Telegram notification. The `agent-audit-trail` skill maintains the complete tamper-evident log for when you want to audit at depth. You stay informed without being interrupted.

---

## 🏭 Startup Founder Perspective

> "The hardest part of running an early-stage startup isn't the engineering — it's the coordination tax. Every hour spent triaging Slack, chasing PR reviews, and formatting investor updates is an hour not spent on the product. An autonomous agent that acts on internal ops and routes exceptions to you for approval doesn't just save time — it changes the quality of your attention. Deep work becomes the default, not the exception."
>
> — Pattern observed across multiple solo-CTO + autonomous agent deployments (source: SynthLabs setup context + Speedy architecture, Speedscale Engineering Blog, 2026-02-18)

---

## Quick Reference: All Installed Skills

| Skill | Category | What It Does for Kai |
|---|---|---|
| `skill-vetter` | Security | Scans all skills before install — always first |
| `gog` | Productivity | Gmail, Calendar, Sheets, Drive, Docs |
| `github` | Developer | PR monitoring, code review, issue management |
| `slack` | Communication | Slack digest, team coordination |
| `linear` | Project Mgmt | Sprint tracking, issue management |
| `notion` | Knowledge | Internal wiki read/write |
| `vercel` | DevOps | Deployment status and management |
| `coding-agent` | Developer | Orchestrates Claude Code for complex coding tasks |
| `debug-pro` | Developer | Structured multi-language debugging |
| `test-runner` | Developer | Automated test-write-run-interpret cycle |
| `agent-team-orchestration` | Orchestration | Multi-agent coordination with defined roles |
| `cc-godmode` | Orchestration | Complex multi-agent software project management |
| `self-improving-agent` | Intelligence | Logs errors and preferences for continuous improvement |
| `capability-evolver` | Intelligence | Autonomously improves behavior from session logs |
| `memory-hygiene` | Intelligence | Prunes stale context to maintain accuracy |
| `clawscan` | Security | Scans skill bundles for malicious code |
| `prompt-guard` | Security | Defends against prompt injection |
| `agentguard` | Security | Real-time behavioral guardrails |
| `agent-audit-trail` | Security | Tamper-evident action log |
| `agent-access-control` | Security | Tiered trust for team Slack rollout |

---

## Emergency Reference

```bash
openclaw status                    # Is the gateway running?
openclaw gateway restart           # Fix 90% of issues
openclaw logs --follow             # Live debug stream
openclaw chat --once "help"        # Test agent responsiveness
openclaw gateway enable-autostart  # Ensure it survives reboots
crontab -l                         # Verify your crons are registered
```
