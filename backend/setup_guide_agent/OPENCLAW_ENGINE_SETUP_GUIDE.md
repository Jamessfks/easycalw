# OPENCLAW ENGINE SETUP GUIDE

**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Eight — Personal Productivity |
| **MISSION** | Organize Gmail workflow, triage conversations, and reclaim your mornings from inbox noise |
| **DATE** | 2026-03-27 |
| **DEPLOYMENT** | Existing Mac |
| **CHANNEL** | Telegram |
| **MODEL** | Anthropic (claude-sonnet-4-6) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

**This guide configures your OpenClaw agent to automatically triage your Gmail inbox, categorize every incoming email into Urgent / FYI / Newsletter, draft replies in your voice, and deliver a clean daily digest to your Telegram — built around the personal Gmail workflow Eight described in the interview.**

---

## Key Moments — What You Will Accomplish

By the end of this guide, you will have:

- **A running OpenClaw instance** on your existing Mac, connected to Telegram and ready to manage your inbox from your phone throughout the day
- **3 tailored automations** that handle a morning Gmail digest, hourly urgent-email alerts, and nightly maintenance — all without opening a browser
- **Security-grade guardrails** keeping your Gmail OAuth credentials, conversation history, and email content private and locked to your account only

---

## 00 | PRE-FLIGHT CHECKLIST

> **ACTION:** Complete every item below **before** running a single command. Missing prerequisites will cause you to backtrack.

### Accounts to Create

- [ ] **Anthropic account** — Create at https://console.anthropic.com. You need an API key. Set a monthly spending limit of **$20–$30** to start. Gmail triage at a typical personal volume (50–100 emails/day) costs $3–8/month on Claude Sonnet.
- [ ] **Telegram account** — Install Telegram on your phone. Your agent will deliver Gmail digests and urgent alerts here.
- [ ] **Google account** — You likely have one already. You will authorize the `gog` skill with Google OAuth so the agent can read your Gmail. No manual API key is needed for this.

### API Keys to Obtain

- [ ] **Anthropic API Key** — In your Anthropic Console: API Keys → Create Key. Copy it immediately and store it in your password manager. You will not see it again.
- [ ] **Telegram Bot Token** — You will create this in Section 03 using @BotFather inside the Telegram app.

### Hardware and Software

- [ ] Mac running macOS 13 Ventura or later (check: Apple menu → About This Mac)
- [ ] At least 8 GB RAM and 2 GB free disk space
- [ ] Terminal.app accessible (Spotlight: press Cmd+Space, type "Terminal")
- [ ] Internet connection stable

> **TIP:** Eight, gather your Anthropic API key and have Telegram installed on your phone before starting Section 01. Having both ready eliminates the main cause of mid-setup backtracking.

---

## 01 | PLATFORM SETUP

Eight, these steps prepare your Mac to run OpenClaw reliably alongside your daily work.

> **WARNING:** Your Mac will sleep when idle, which pauses OpenClaw. For a personal inbox assistant that runs on your schedule — not 24/7 — this is acceptable and expected. Your 7 AM morning digest will still fire if your Mac is awake. Section 1C covers how to handle sleep gracefully, and Section 10 covers the upgrade path if you need always-on coverage later.

### 1A — Install Xcode Command Line Tools

OpenClaw requires native Node.js modules. These tools provide the compiler.

```bash
xcode-select --install
```

A dialog will appear — click "Install" (not "Get Xcode"). Wait for completion: 3–5 minutes.

**Verify it worked:**
```
$ xcode-select -p
/Library/Developer/CommandLineTools
```

### 1B — Install Homebrew

Homebrew manages Node.js and other dependencies cleanly on macOS.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After installation, follow the printed instructions to add Homebrew to your PATH (the installer shows you exactly which lines to paste into `~/.zshrc`).

**Verify it worked:**
```
$ brew --version
Homebrew 4.x.x
```

### 1C — Configure Sleep Settings for Your Mac

> **TIP:** Why this matters for Eight: your morning digest cron runs at 7 AM. If your Mac is still asleep, Telegram queues the message and delivers it the moment your Mac wakes up — so you still get the digest, just slightly delayed. For most personal workflows this is completely fine. The options below give you more control.

**Option A (Recommended for laptops) — Amphetamine app:**

Install [Amphetamine](https://apps.apple.com/us/app/amphetamine/id937984704) from the Mac App Store (free). Create a trigger:
1. Amphetamine → Preferences → Triggers
2. New trigger: "While OpenClaw is running"
3. Condition: Application "node" is running
4. Enable "Allow display to sleep" (screen sleeps — gateway does not)
5. "Allow system sleep on battery after 30 minutes" as a safety net for when unplugged

**Option B — Command line for desktop Macs (iMac, Mac Studio, Mac Mini):**

```bash
# Prevent sleep when on AC power, allow screen to sleep after 10 min
sudo pmset -c sleep 0 displaysleep 10
```

**Check current sleep configuration:**
```
$ pmset -g | grep "sleep"
```

---

## 02 | INSTALL OPENCLAW

### 2A — Install Node.js

```bash
# Install nvm (Node Version Manager)
brew install nvm

# Follow the nvm output instructions to add it to ~/.zshrc, then:
nvm install 24
nvm use 24
nvm alias default 24
```

**Verify it worked:**
```
$ node --version
v24.x.x   ← must be v22.16 or higher
```

### 2B — Run the OpenClaw Installer

```bash
curl -fsSL https://get.openclaw.ai | bash
```

**Verify it worked:**
```
$ openclaw --version
openclaw v2026.x.x   ← any version 2026.1.29 or later
```

> **WARNING:** You need version **2026.1.29 or later**. Earlier versions had a security gap allowing unauthenticated gateway access. If you see an older version, re-run the installer.

### 2C — Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag installs a macOS launchd background service that auto-starts OpenClaw when you log in and restarts it if it crashes.

**At each wizard prompt, choose:**

| Prompt | Recommended Choice |
|---|---|
| Gateway mode | **Local** (not Remote) |
| AI provider | **Anthropic** — paste your API key when asked |
| Model | **`claude-sonnet-4-6`** (best balance of quality and cost for inbox work) |
| Messaging channels | **Telegram** — set up fully in Section 03 |
| Hooks | Enable **session memory**, **boot hook**, and **command logger** |
| Skills | **Skip for now** — install deliberately in Section 05 |
| Install daemon? | **Yes** — starts OpenClaw automatically on login |

> **ACTION:** When the wizard shows the security acknowledgment, select **"Yes"** to confirm you are the sole operator.

**Verify everything is running:**
```
$ openclaw gateway status
Gateway: running   Port: 18789   Auth: enabled

$ openclaw doctor
All checks passed
```

Open the visual dashboard (optional):
```bash
openclaw dashboard
```

Dashboard loads at `http://127.0.0.1:18789/`

---

## 03 | CONNECT YOUR CHANNEL (TELEGRAM)

Eight, this connects your agent to Telegram so it can deliver your Gmail digests and urgent email alerts to your phone.

> **TIP:** Telegram is the best starting channel for a personal Mac setup because it queues messages server-side. If your Mac is asleep when the 7 AM digest fires, Telegram holds the message and delivers it the moment your Mac wakes. Zero messages lost.

### 3A — Create Your Telegram Bot

1. Open Telegram on your phone or desktop
2. Search for **@BotFather** and start a conversation
3. Send: `/newbot`
4. Choose a display name (e.g., "Eight's Inbox Agent")
5. Choose a username ending in `bot` (e.g., `eight_inbox_bot`)
6. BotFather sends you a **bot token** — it looks like `123456789:ABC-DEF1234...`

Store this token in your password manager immediately.

**Add the token to your Mac environment and to OpenClaw Keychain:**
```bash
# Set via OpenClaw's secure secret store (uses macOS Keychain)
openclaw secret set telegram_token "YOUR_TELEGRAM_BOT_TOKEN_HERE"
```

**Add to your OpenClaw config (`~/.openclaw/config.yaml`):**
```yaml
channels:
  telegram:
    enabled: true
    bot_token: ${{ secret.telegram_token }}
```

**Restart and test:**
```bash
openclaw gateway restart
openclaw channel test telegram
```

**Verify it worked:**
```
$ openclaw channel list
telegram   ✓ connected
```

### 3B — Find Your Telegram Chat ID

You need your chat ID for the cron automation targets in Section 06.

1. Message your bot (send any text — "hello" is fine)
2. Run:
```bash
openclaw channel info telegram
```

Your personal chat ID appears in the output. Copy it — you will use it in Section 06 cron commands.

### 3C — Lock Down Access

> **WARNING:** Without this step, anyone who finds your bot's @username on Telegram can send it commands. Since your agent has access to your Gmail via OAuth, this is a meaningful security exposure.

Add an allowlist in `~/.openclaw/config.yaml`:
```yaml
access:
  dm:
    mode: allowlist
    allowlist:
      - "yourusername@telegram"   # Replace with your actual Telegram @username
  groups:
    require_mention: true
    allowed_groups: []
```

Reload:
```bash
openclaw gateway reload
```

**Verify:** Send a message from your Telegram account — the bot should respond. Test from a different account — it should receive no response.

---

## 04 | CONFIGURE YOUR MODEL PROVIDER (ANTHROPIC)

Check that your model provider is active:

```bash
openclaw models status
```

**Verify it worked:**
```
Provider: anthropic   Status: ✓ active   Model: claude-sonnet-4-6
```

If not yet configured:
```bash
openclaw onboard --anthropic-api-key "YOUR_ANTHROPIC_API_KEY"
```

**Store the API key securely in macOS Keychain:**
```bash
openclaw secret set anthropic_key "YOUR_ANTHROPIC_API_KEY"
```

**Set up cost-efficient model routing in `~/.openclaw/config.yaml`:**
```yaml
models:
  # Primary: Sonnet for deep email analysis and reply drafting
  - provider: anthropic
    api_key: ${{ secret.anthropic_key }}
    model: claude-sonnet-4-6
    priority: 1
    timeout: 60s

  # Fallback: Haiku for simple triage and categorization at 1/10th the cost
  - provider: anthropic
    api_key: ${{ secret.anthropic_key }}
    model: claude-haiku-4-20250514
    priority: 2
    failover:
      max_retries: 2
```

**Configure session persistence for conversation memory:**
```yaml
sessions:
  mode: per_sender
  ttl: 24h
  max_history: 100
  persistence: sqlite
  storage_path: ~/.openclaw/sessions.db
  summarize:
    enabled: true
    after: 50
    model: claude-haiku-4-20250514
```

> **TIP:** Eight, set a monthly spending cap of **$25** in your Anthropic Console now under Billing → Usage Limits. Typical Gmail triage at personal email volumes runs $3–8/month on Sonnet. The Haiku fallback handles categorization at a fraction of the cost.

---

## 05 | INSTALL SKILLS

> **WARNING:** Always install `skill-vetter` first and run it before every other skill. The ClawHavoc attack in February 2026 put over 1,000 malicious skills in the ClawHub registry. `skill-vetter` is a non-negotiable first step — 86,800 downloads for good reason.

### Security Stack — Install First, No Exceptions

```bash
clawhub install skill-vetter
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
```

Vet and install the prompt injection defender:
```bash
skill-vetter prompt-guard
clawhub install prompt-guard
```

> **TIP:** `prompt-guard` is especially critical for Gmail integration. Every email Eight reads is external content — a malicious email body could contain adversarial instructions trying to hijack the agent's behavior. `prompt-guard` blocks this class of attack at the perimeter before content reaches the model.

Vet and install behavioral guardrails:
```bash
skill-vetter agentguard
clawhub install agentguard
```

**Verify the security stack:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
prompt-guard   v1.x.x   ✓ active
agentguard     v1.x.x   ✓ active
```

### Gmail and Email Workflow Skills

| Your Need | Skill | What It Does |
|---|---|---|
| Read and organize Gmail | `gog` | Full Google Workspace — Gmail, Calendar, Drive, Docs in one skill via secure OAuth |
| AI inbox triage and reply drafting | `agent-mail` | Dedicated email triage with automatic categorization and reply draft generation |
| Send automated follow-up notifications | `mailchannels` | Reliable transactional email delivery for reminders and notifications |

```bash
# Google Workspace (Gmail, Calendar, Drive)
skill-vetter gog
clawhub install gog

# AI-powered email triage
skill-vetter agent-mail
clawhub install agent-mail

# Transactional email sending
skill-vetter mailchannels
clawhub install mailchannels
```

> **ACTION:** After installing `gog`, authorize Google OAuth access:
```bash
openclaw skill auth gog
```

A browser window opens. Sign in with your Google account and grant the requested permissions (Gmail read, labels, draft creation). You will see a permissions screen — review the scopes and confirm.

**Verify all skills are active:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
prompt-guard   v1.x.x   ✓ active
agentguard     v1.x.x   ✓ active
gog            v1.x.x   ✓ active   (Google: authorized)
agent-mail     v1.x.x   ✓ active
mailchannels   v1.x.x   ✓ active
```

---

## 06 | CONFIGURE AUTOMATIONS

> **TIP:** Why this matters for Eight: these automations replace the manual inbox-opening ritual you described. Instead of logging into Gmail and sorting through noise, your agent does the reading and brings you only what matters — delivered to Telegram before you even open your laptop.

### Automation 1 — Morning Gmail Digest

**What it does:** Every morning at 7 AM, scans your Gmail inbox for emails received in the last 24 hours, categorizes each one as URGENT / FYI / NEWSLETTER, drafts suggested replies for URGENT emails in a professional but personal tone, and delivers a clean structured summary to your Telegram.

**Autonomy Tier: NOTIFY (Tier 2)** — Agent reads and summarizes. Drafts replies for your review only. Takes no send action without your explicit approval.

```bash
openclaw cron add \
  --name "morning-gmail-digest" \
  --cron "0 7 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Scan my Gmail inbox for all emails received in the last 24 hours. For each email, categorize it as: URGENT (requires a response today or affects something important), FYI (informational, no action needed), or NEWSLETTER (promotional, automated, or subscription content). For emails marked URGENT, draft a short suggested reply in a professional but personal tone — concise, not corporate. Deliver a digest with: (1) a count summary — X urgent, Y FYI, Z newsletters, (2) full details for URGENT emails only including sender, subject, your summary of what they need, and the draft reply. Keep the digest readable in under 2 minutes." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

> **ACTION:** Replace `YOUR_TELEGRAM_CHAT_ID` with the chat ID you found in Step 3B. Replace `America/Los_Angeles` with your actual local timezone (e.g., `America/New_York`, `Europe/London`, `Asia/Tokyo`). Find the full list at https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

**Verify it was created:**
```
$ openclaw cron list
ID   Name                    Schedule       Timezone               Status
1    morning-gmail-digest    0 7 * * *      America/Los_Angeles    ✓ active
```

**Test it immediately — do not wait until tomorrow morning:**
```bash
openclaw cron run <job-id-from-above>
```

Check Telegram — a digest message should arrive within 30–60 seconds.

### Automation 2 — Hourly Urgent Email Watch (Business Hours)

**What it does:** Every hour during business hours Monday through Friday (9 AM–6 PM), performs a quick scan for any new URGENT emails that arrived since the last check. Only pings you if something actionable is found — no noise on quiet hours.

**Autonomy Tier: NOTIFY (Tier 2)** — Alerts only. No actions taken.

```bash
openclaw cron add \
  --name "urgent-email-watch" \
  --cron "0 9-18 * * 1-5" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --light-context \
  --message "Quick scan: check my Gmail for any new emails received in the last 60 minutes that require urgent action today — client replies, time-sensitive requests, or anything that cannot wait. If none found, respond with only 'HEARTBEAT_OK — inbox clear' and do not send a Telegram message. If urgent emails found, list: sender, subject, and one-sentence summary of what is needed for each." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

> **TIP:** The `--light-context` flag keeps this hourly job lightweight — it skips the full workspace bootstrap since it only needs to check email, not maintain deep conversation context. This saves processing overhead on the nine hourly runs per weekday.

**Verify it was created:**
```
$ openclaw cron list
ID   Name                    Schedule          Timezone               Status
1    morning-gmail-digest    0 7 * * *         America/Los_Angeles    ✓ active
2    urgent-email-watch      0 9-18 * * 1-5    America/Los_Angeles    ✓ active
```

### Automation 3 — Daily Gateway Restart (Maintenance)

**What it does:** Restarts the OpenClaw gateway at 4 AM to clear memory accumulation. Silent — no Telegram message sent.

**Autonomy Tier: EXECUTE (Tier 4)** — This is the one automation that acts on its own, but its only action is restarting a process on your own Mac. No external services touched.

```bash
openclaw cron add \
  --name "daily-restart" \
  --cron "0 4 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --light-context \
  --message "Perform nightly maintenance: run 'openclaw gateway restart' and 'openclaw session prune --older-than 14d'. Report completion quietly with no Telegram delivery."
```

> **TIP:** This prevents the known memory accumulation issue where the gateway reaches 1.9 GB+ RAM after 13+ hours of continuous use. Firing at 4 AM means Eight will be asleep — no disruption to active sessions.

**Final verification — all 3 jobs active:**
```
$ openclaw cron list
ID   Name                    Schedule          Timezone               Status
1    morning-gmail-digest    0 7 * * *         America/Los_Angeles    ✓ active
2    urgent-email-watch      0 9-18 * * 1-5    America/Los_Angeles    ✓ active
3    daily-restart           0 4 * * *         America/Los_Angeles    ✓ active
```

---

## 07 | INJECT YOUR SOUL

> **ACTION:** Open `prompts_to_send.md` (in the same folder as this guide) and paste each prompt into your OpenClaw chat interface **one at a time, in order**. Wait for the agent to acknowledge each before sending the next.

```bash
openclaw dashboard
```

Dashboard opens at `http://127.0.0.1:18789/` — use the chat interface there to send each prompt.

**Prompt sequence:**
1. **Identity Prompt** — establishes who the agent is and how it relates to Eight's Gmail
2. **Email Triage Rules Prompt** — defines categorization logic, tone, and what "urgent" means to you personally
3. **Conversation Management Prompt** — sets up how the agent handles ongoing email threads and follow-ups
4. **Security Audit Prompt** — final verification before going live (always last)

> **TIP:** A short acknowledgment response like "Understood — I'll categorize emails as Urgent, FYI, or Newsletter and draft replies only for Urgent items" is sufficient confirmation before proceeding to the next prompt.

---

## 08 | SECURITY HARDENING

> **WARNING:** Eight, do not skip this section. Your Gmail OAuth credentials give this agent read access to your entire personal email history. The `gog` skill with Gmail access is one of the most sensitive integrations in the OpenClaw ecosystem — treat it accordingly.

### Mac-Specific Hardening

**Verify all secrets are in macOS Keychain, not plain text:**
```bash
# Verify — this should show ${{ secret.xxx }} references, NOT actual key values
grep -E "api_key|bot_token|token" ~/.openclaw/config.yaml
```

Expected output:
```
api_key: ${{ secret.anthropic_key }}
bot_token: ${{ secret.telegram_token }}
```

If you see an actual key value instead, store it properly:
```bash
openclaw secret set anthropic_key "YOUR_ACTUAL_KEY"
```

**Ensure the secrets backend is set to Keychain in `~/.openclaw/config.yaml`:**
```yaml
secrets:
  backend: keychain
  keychain:
    service: openclaw
```

**Verify FileVault is enabled (protects your disk if your Mac is lost):**
```bash
fdesetup status
```

If output is "FileVault is Off": System Settings → Privacy & Security → FileVault → Turn On FileVault.

**Enable sandbox mode to restrict agent file access:**
```yaml
# In ~/.openclaw/config.yaml
sandbox:
  enabled: true
  mode: workspace
  workspace_root: ~/.openclaw/workspaces
  per_sender: true
  denied_commands:
    - rm -rf
    - shutdown
    - reboot
```

**Restrict tools to only what the email workflow needs:**
```yaml
tools:
  allow:
    - file_read
    - web_search
    - calculator
    - datetime
    - memory_store
    - memory_recall
  deny:
    - shell_exec
    - file_delete
```

**Confirm gateway binds only to localhost:**
```yaml
gateway:
  host: 127.0.0.1    # Never change to 0.0.0.0
  port: 18789
  reload: auto
  log_level: info
```

**Set heartbeat for reliable channel reconnection after sleep:**
```yaml
heartbeat:
  enabled: true
  interval: 300s
  timeout: 15s
  on_failure: restart_channel
```

Reload after all config changes:
```bash
openclaw gateway reload
openclaw doctor
```

### Personal Email Security Checklist

- [ ] Gmail OAuth scope reviewed — confirm it is read + draft only, not send
- [ ] Telegram allowlist restricts access to your account only (Step 3C complete)
- [ ] All secrets stored in macOS Keychain (not plain text in config files)
- [ ] Anthropic API spending limit set ($25/month cap in Console)
- [ ] FileVault enabled on your Mac
- [ ] Sandbox mode enabled — agent cannot access personal files outside workspace
- [ ] `shell_exec` and `file_delete` tools disabled
- [ ] `agentguard` installed and active (blocks unintended autonomous actions)
- [ ] `prompt-guard` installed and active (blocks email-based prompt injection attacks)
- [ ] OpenClaw conversation logs retained for review (default location: `~/.openclaw/logs/`)
- [ ] API key rotation reminder set for 90 days from today

---

## 09 | SECURITY AUDIT CHECKLIST

> **ACTION:** Run this full audit before using OpenClaw with your real Gmail account.

```bash
openclaw security audit --deep
```

**Expected output:**
```
Security Audit Complete
Critical warnings: 0
Recommendations: X (review below)
```

Fix any issues:
```bash
openclaw security audit --fix
openclaw doctor
openclaw health
```

**Manual verification checklist — every item must pass:**

- [ ] `openclaw security audit --deep` completes with **zero** critical warnings
- [ ] Gateway shows "running" with token authentication active: `openclaw gateway status`
- [ ] `openclaw cron list` shows exactly 3 jobs: `morning-gmail-digest`, `urgent-email-watch`, `daily-restart` — no unexpected entries
- [ ] `openclaw skills list` shows exactly these 6 skills: `skill-vetter`, `prompt-guard`, `agentguard`, `gog`, `agent-mail`, `mailchannels`
- [ ] Telegram bot responds only to your account (test from a second account — it should get no response)
- [ ] No API keys in plain text: `grep -r "sk-ant" ~/.openclaw/` returns nothing
- [ ] FileVault enabled: `fdesetup status` shows "FileVault is On"
- [ ] Gmail OAuth active: `openclaw skill status gog` shows "authorized"
- [ ] Skill permissions reviewed: `openclaw skills list --verbose`

**Do NOT begin using OpenClaw with your real Gmail inbox until every item above is checked.**

---

## 10 | TROUBLESHOOTING AND NEXT STEPS

### Common Issues

**"command not found: openclaw" after installing**
```bash
source ~/.zshrc
# If still missing:
export PATH="$PATH:$(npm root -g)/../bin"
source ~/.zshrc
```

**Gateway not responding**
```bash
openclaw doctor
openclaw gateway stop && openclaw gateway start
```

**Telegram bot not responding**
```bash
# Check channel status
openclaw channel list

# Check logs for errors
openclaw gateway logs -f

# Restart the telegram channel specifically
openclaw channel restart telegram
openclaw channel test telegram
```

Confirm your Telegram @username is in the allowlist in `~/.openclaw/config.yaml`.

**Cron jobs not firing**
```bash
# Confirm gateway is running
openclaw gateway status

# Check all scheduled jobs
openclaw cron list

# Run a job manually to test
openclaw cron run <job-id>
```

If your Mac was asleep when a job was scheduled to run, it fires when your Mac wakes (Telegram queues the message). This is expected behavior for a non-dedicated machine.

**Gmail OAuth expired**
```bash
openclaw skill auth gog
```

Re-authorize in the browser window that opens. OAuth tokens can expire after extended periods or if you revoke access in your Google account settings.

**High memory usage (gateway over 1 GB RAM)**
```bash
openclaw gateway status
openclaw gateway restart
openclaw session prune --older-than 7d
```

The `daily-restart` cron from Section 06 prevents this from accumulating over time.

**Channel disconnects after Mac wakes from sleep**
```bash
openclaw channel restart telegram
openclaw channel test telegram
```

The heartbeat configuration (Section 08) handles this automatically, but you can run these manually if a reconnect is needed immediately.

**Morning digest arrives late or not at all**

Check whether your Mac was asleep at 7 AM:
- If asleep: Telegram queued the message. It arrives when your Mac wakes. Consider Amphetamine (Section 1C) to prevent sleep during scheduled hours.
- If awake: Check cron status with `openclaw cron list` and run `openclaw cron run <job-id>` to test manually.

### When to Upgrade to Dedicated Hardware

The existing Mac setup is excellent for personal inbox management during your working hours. Upgrade to a Mac Mini or VPS when:

| Signal | Why It Matters |
|---|---|
| You consistently miss morning digests because your Mac was asleep | Dedicated hardware runs 24/7 |
| You want true overnight coverage — emails flagged before you wake | Always-on machine never misses a window |
| You add more than 3 channels or 5 automations | Memory and reconnection overhead compounds |
| API costs exceed $50/month | A Mac Mini M4 ($500) pays for itself in reliability within a year |

**Migration is simple when the time comes:**
```bash
# On current Mac: backup config
cp ~/.openclaw/config.yaml ~/Desktop/openclaw-config-backup.yaml

# On new machine: install and restore
curl -fsSL https://get.openclaw.ai | bash
openclaw onboard --install-daemon
cp openclaw-config-backup.yaml ~/.openclaw/config.yaml
openclaw gateway restart
openclaw doctor
```

### Next Steps After a Stable Week

Once the system has been running cleanly for 1–2 weeks, Eight, consider:

1. **Add Google Calendar to your morning digest** — the `gog` skill already includes Calendar access. Ask the agent to include today's schedule in the 7 AM digest for a complete daily briefing: what matters in your inbox + what is on your calendar.
2. **Tune your triage categories** — After two weeks of real data, you will know which senders always get URGENT, which domains are always NEWSLETTER, and which subjects are always FYI. Update the cron message prompt to encode these patterns explicitly. This reduces false categorizations significantly.
3. **Add a reply-approval window** — Once you trust the agent's drafts, configure it to hold approved replies for 15 minutes before sending — a safety window to pull back anything you change your mind on.
4. **Context hygiene at week 5** — Consider separate Telegram topics for digest messages vs. on-demand questions to prevent conversation context pollution.

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI URL** | `openclaw dashboard` → `http://127.0.0.1:18789` |
| **Gateway Port** | 18789 |
| **Model Provider** | Anthropic (`claude-sonnet-4-6`) |
| **Channel** | Telegram |
| **Config File** | `~/.openclaw/config.yaml` |
| **Data Directory** | `~/.openclaw/` |
| **Daemon Plist** | `~/Library/LaunchAgents/ai.openclaw.gateway.plist` |
| **Cron Timezone** | `America/Los_Angeles` — update to your actual timezone |
| **OpenClaw Docs** | https://docs.openclaw.ai |
| **Security Audit** | `openclaw security audit --deep` |
| **Gateway Status** | `openclaw gateway status` |
| **Logs** | `openclaw gateway logs -f` |
| **Cron Jobs** | `openclaw cron list` |
| **Installed Skills** | `openclaw skills list` |
| **Channel Status** | `openclaw channel list` |
| **Re-auth Gmail** | `openclaw skill auth gog` |
| **Restart Gateway** | `openclaw gateway restart` |

---

**OPENCLAW | Your Agent. Your Hardware. Your Soul.**
