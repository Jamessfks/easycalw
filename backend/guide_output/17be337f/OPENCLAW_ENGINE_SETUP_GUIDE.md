# OPENCLAW ENGINE SETUP GUIDE

**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Marcus — food truck operator, Austin TX |
| **MISSION** | Tame the lunch rush: route orders, surface alerts, and keep your head clear when the line is out the door |
| **DATE** | 2026-03-26 |
| **DEPLOYMENT** | Existing MacBook (daily-driver Mac) |
| **CHANNEL** | iMessage |
| **MODEL** | Anthropic Claude (`anthropic/claude-sonnet-4-6`) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

**This guide configures your OpenClaw agent to act as your behind-the-scenes order coordinator and operations copilot — built around your food truck workflow and the iPhone + MacBook you already carry every day.**

---

## Key Moments — What You Will Accomplish

By the end of this guide, Marcus, you will have:

- **A running OpenClaw instance** on your MacBook, connected to iMessage and ready the moment you park the truck
- **3 tailored automations** that handle your pre-rush prep reminder, live order-queue summaries, and an end-of-day revenue snapshot — without you typing a single command mid-service
- **Industry-grade security guardrails** ensuring your agent operates within its lane and never acts without your approval

---

## 00 | ✅ PRE-FLIGHT CHECKLIST

> **ACTION:** Complete every item below **before** running a single command. Missing prerequisites will cause you to backtrack.

### Accounts to Create

- [ ] **Anthropic account** — Create at [console.anthropic.com](https://console.anthropic.com). You need an API key. Set a monthly spending limit of **$20** to start — more than enough for a food truck operation.
- [ ] **Apple ID for the bot** — Create a second Apple ID (e.g., `marcustruck-bot@icloud.com`) at [appleid.apple.com](https://appleid.apple.com). This keeps bot traffic separate from your personal Messages. One-time, 10 minutes.

### API Keys to Obtain

- [ ] **Anthropic API Key** — In the Anthropic Console: API Keys → Create Key. Copy it to your password manager right now, before you forget.

### Hardware & Software

- [ ] Your MacBook is running **macOS 13 Ventura or later** (check: Apple menu → About This Mac)
- [ ] Your MacBook has at least **2 GB of free disk space** (check: Apple menu → About This Mac → Storage)
- [ ] You have a **Terminal** open (Spotlight → type "Terminal" → Enter)
- [ ] Your MacBook is **plugged into power** for the entire setup

> **TIP:** Marcus, gather your Anthropic API key and have it in a password manager or notes app before starting — it is the one thing that stops most people mid-setup.

---

## 01 | ✅ PLATFORM SETUP

Marcus, these steps prepare your MacBook to run OpenClaw reliably during your operating hours.

> **WARNING:** Your MacBook is a laptop — when the lid closes, the gateway sleeps and stops processing iMessage commands. We will configure Amphetamine (a free Mac app) to keep it awake while the truck is running. Complete Step 1B before you move on. Skipping this means your agent goes silent the moment your Mac dims.

### 1A — Verify macOS Version and Enable FileVault

Run in Terminal:

```bash
sw_vers -productVersion
```

**Verify it worked:**
```
13.x.x   ← must be 13.0 or higher (Ventura, Sonoma, or Sequoia)
```

Then check that FileVault is on (it encrypts your disk, protecting your API keys if your MacBook is ever lost or stolen):

```bash
fdesetup status
```

**Verify it worked:**
```
FileVault is On.
```

If FileVault is Off, enable it: Apple menu → System Settings → Privacy & Security → FileVault → Turn On.

### 1B — Configure Always-On Settings (Critical for a Laptop)

Install **Amphetamine** — it is free on the Mac App Store and prevents your MacBook from sleeping while OpenClaw is running:

1. Open the Mac App Store and search **"Amphetamine"** — install it (free, by William Gustafson)
2. Open Amphetamine from your menu bar
3. Go to **Preferences → Triggers**
4. Create a new trigger:
   - Trigger type: **Application**
   - Condition: `node` **is running**
   - Effect: **Keep Mac awake** (allow display to sleep — saves power)
   - Battery safety: **Allow system sleep on battery after 30 minutes** (so you do not drain your battery overnight)

> **TIP:** With this setting, your MacBook stays awake while OpenClaw is running and you are plugged in — but reverts to normal sleep when you unplug and walk away. You get reliability during service and normal battery life otherwise.

---

## 02 | ✅ INSTALL OPENCLAW

### 2A — Install Prerequisites

Run each command and wait for it to finish before running the next:

```bash
# Install Xcode Command Line Tools (provides git, compilers)
xcode-select --install
```

Click **Install** in the dialog that appears. Wait for it to finish (~5 minutes).

```bash
# Install Homebrew (package manager)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the instructions Homebrew prints at the end — it will tell you to run 2 more commands to add it to your PATH. Run those.

```bash
# Install nvm (Node version manager), then Node 24
brew install nvm
nvm install 24
nvm use 24
nvm alias default 24
```

**Verify it worked:**
```
$ node --version
v24.x.x   ← must be v24 or v22.16 or higher
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

> **WARNING:** You need version **2026.1.29 or later**. Earlier versions had a security gap allowing unauthenticated gateway access. If you see a version older than that, run `npm install -g openclaw@latest` to update.

### 2C — Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag installs a macOS background service so OpenClaw starts automatically every time you log in.

**At each wizard prompt, choose:**

| Prompt | What to Choose |
|---|---|
| Gateway mode | **Local** |
| AI provider | **Anthropic API key** — paste your API key |
| Model | **`anthropic/claude-sonnet-4-6`** |
| Messaging channels | **iMessage** — we configure this in Section 03 |
| Session memory | **Enable** |
| Boot hook | **Enable** |
| Command logger | **Enable** |
| Skills | **Skip for now** — you will install skills deliberately in Section 05 |

> **ACTION:** When the wizard shows the security acknowledgment, select **"Yes"** to confirm you are the sole operator.

**Verify it worked:**
```
$ openclaw gateway status
gateway   ✓ running   port: 18789   uptime: 0m
```

```bash
openclaw doctor
```

```
$ openclaw doctor
All checks passed.
```

---

## 03 | ✅ CONNECT YOUR CHANNEL (iMESSAGE)

Marcus, this is the step that connects your agent to your iPhone via iMessage. When it is working, you can text your own bot from your iPhone and it will respond. During lunch rush, that means you can text "what orders are pending?" and get an instant answer without touching the MacBook.

> **ACTION:** Follow each step in order. The iMessage channel requires a few one-time macOS permission grants — do not skip them or the channel will silently fail.

### 3A — Sign In to Messages with Your Bot Apple ID

1. Open the **Messages** app on your MacBook
2. Sign out of your personal Apple ID: Messages → Settings → iMessage → Sign Out
3. Sign in with your new bot Apple ID (e.g., `marcustruck-bot@icloud.com`)

> **TIP:** You will use your personal Apple ID to text the bot Apple ID. The bot account receives the message on your MacBook, processes it, and replies. Think of it as texting a second phone that your MacBook answers.

### 3B — Install the `imsg` CLI

```bash
brew install steipete/tap/imsg
```

**Verify it worked:**
```
$ imsg rpc --help
Usage: imsg rpc [OPTIONS]
```

### 3C — Grant macOS Permissions (One-Time)

The `imsg` tool needs two macOS permissions: Full Disk Access (to read the Messages database) and Automation (to send messages through Messages.app). Trigger both prompts now:

```bash
# This triggers the Full Disk Access and Automation permission dialogs
imsg chats --limit 1
```

macOS will show permission dialogs. Click **OK** on each one.

If no dialogs appear:

1. Apple menu → System Settings → Privacy & Security → Full Disk Access
2. Click the `+` button and add **Terminal** (or the app you are running these commands in)
3. Repeat for: Privacy & Security → Automation → Terminal → check **Messages**

Then verify permissions are working:

```bash
imsg chats --limit 5
```

**Verify it worked:**
```
# You should see a list of recent iMessage conversations
chat_id: 1   chat_identifier: +15125550100   ...
```

### 3D — Configure iMessage in OpenClaw

Open your config file:

```bash
nano ~/.openclaw/config.yaml
```

Add or update the `channels` section:

```yaml
channels:
  imessage:
    enabled: true
    cliPath: "/usr/local/bin/imsg"
    dbPath: "/Users/YOUR_MAC_USERNAME/Library/Messages/chat.db"
    dmPolicy: pairing
    includeAttachments: false
```

Replace `YOUR_MAC_USERNAME` with your actual macOS username (run `whoami` in Terminal if unsure).

Save the file (in nano: Ctrl+O → Enter → Ctrl+X).

```bash
openclaw gateway restart
```

**Verify it worked:**
```
$ openclaw channels status --probe
imessage   ✓ connected   rpc: supported
```

### 3E — Approve the iMessage Pairing Request

From your **personal iPhone**, open Messages and text your bot Apple ID (`marcustruck-bot@icloud.com`) the word:

```
/pair
```

On your MacBook, approve the pairing request:

```bash
openclaw pairing list imessage
openclaw pairing approve imessage
```

**Verify it worked:**

Text your bot Apple ID from your iPhone:

```
Hello
```

You should get an automated reply within 5 seconds confirming the agent is live.

### 3F — Lock Down Access

> **WARNING:** Without this step, anyone who texts your bot Apple ID can send it commands. This is an iMessage account — protect it.

Update your config to allowlist only your personal phone number:

```yaml
channels:
  imessage:
    enabled: true
    cliPath: "/usr/local/bin/imsg"
    dbPath: "/Users/YOUR_MAC_USERNAME/Library/Messages/chat.db"
    dmPolicy: allowlist
    allowFrom:
      - "+1512YOUR_NUMBER"    # Your personal iPhone number
    groupPolicy: disabled
    configWrites: false
```

```bash
openclaw gateway restart
openclaw channels status --probe
```

---

## 04 | ✅ CONFIGURE YOUR MODEL PROVIDER (ANTHROPIC)

```bash
openclaw models status
```

**Verify it worked:**
```
Provider: anthropic   Status: ✓ active   Model: anthropic/claude-sonnet-4-6
```

If not configured:

```bash
openclaw onboard --anthropic-api-key "YOUR_ANTHROPIC_API_KEY"
```

Add a cost-saving fallback model for cron jobs and simple queries. Open `~/.openclaw/config.yaml` and add:

```yaml
agents:
  defaults:
    model:
      primary: "anthropic/claude-sonnet-4-6"
  list:
    - id: cron_worker
      model:
        primary: "anthropic/claude-haiku-4-6"
      description: "Handles scheduled automations — uses cheaper model"
```

> **TIP:** Marcus, typical usage for a food truck operation — a few dozen messages per service day plus 3 cron jobs — runs about **$5–$12/month** with Claude Sonnet as primary. Set your spending cap to **$20/month** in the Anthropic Console so there are never surprises.

---

## 05 | ✅ INSTALL SKILLS

> **WARNING:** Always install `skill-vetter` first and use it to screen every subsequent skill. Approximately 17–20% of community skills contain suspicious code. This is not optional.

### Phase 1 — Security Stack (Install First, No Exceptions)

```bash
clawhub install skill-vetter
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
```

Now vet and install `prompt-guard` (defends against hijacking attempts embedded in messages):

```bash
skill-vetter prompt-guard
clawhub install prompt-guard
```

Now vet and install `agentguard` (runtime behavioral monitor that blocks unintended actions before they execute):

```bash
skill-vetter agentguard
clawhub install agentguard
```

**Verify the full security stack:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
prompt-guard   v1.x.x   ✓ active
agentguard     v1.x.x   ✓ active
```

### Phase 2 — Core Food Truck Skills

| Your Need | Skill | What It Does |
|---|---|---|
| Reminders for prep tasks | `apple-reminders` | Creates and manages Apple Reminders from iMessage chat — syncs to your iPhone automatically |
| Voice readout for rush moments | `elevenlabs-agents` | Lets the agent speak aloud on your MacBook — hands-free status updates when you cannot look at your phone |
| Web lookups (supplier hours, weather) | `exa-web-search-free` | Free AI-powered web search — check supplier hours, rain forecasts, event traffic near your location |

```bash
skill-vetter apple-reminders
clawhub install apple-reminders

skill-vetter elevenlabs-agents
clawhub install elevenlabs-agents

skill-vetter exa-web-search-free
clawhub install exa-web-search-free
```

> **TIP:** `apple-reminders` requires macOS 14 or later. If your MacBook is on macOS 13 Ventura, skip this skill and use the cron-based reminder automations in Section 06 instead.

**Verify all skills:**
```
$ openclaw skills list
skill-vetter        v1.x.x   ✓ active
prompt-guard        v1.x.x   ✓ active
agentguard          v1.x.x   ✓ active
apple-reminders     v1.x.x   ✓ active
elevenlabs-agents   v1.x.x   ✓ active
exa-web-search-free v1.x.x   ✓ active
```

---

## 06 | ✅ CONFIGURE AUTOMATIONS

> **TIP:** Marcus, these three automations are the heart of why you are doing this setup. They replace the mental overhead of tracking "did I remind the crew about prep?", "how many orders came in?", and "what did we make today?" — all without you lifting a finger mid-service.

### Automation 1 — Pre-Rush Prep Reminder

**What it does:** At 10:45 AM every day, your agent texts you on iMessage with a prep checklist — proteins ready, condiment stations stocked, change in the till. You see it before the 11 AM rush hits.

**Autonomy Tier: NOTIFY** — Agent sends a reminder. Takes no action.

```bash
openclaw cron add \
  --name "pre_rush_prep" \
  --cron "45 10 * * 1-6" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Generate a concise pre-rush checklist for a food truck opening in 15 minutes. Cover: (1) protein/main item readiness, (2) condiment and topping stations, (3) cash/card payment readiness, (4) packaging supplies. Format as a short iMessage-friendly checklist. Sign off with 'You got this, Marcus.'" \
  --announce \
  --channel imessage \
  --to "YOUR_PERSONAL_IMESSAGE_HANDLE"
```

Replace `YOUR_PERSONAL_IMESSAGE_HANDLE` with your iPhone number in the format `+15125550100`.

**Verify it worked:**
```
$ openclaw cron list
ID   Name              Schedule        Timezone           Status
1    pre_rush_prep     45 10 * * 1-6   America/Chicago    ✓ active
```

Test it fires correctly right now:

```bash
openclaw cron run pre_rush_prep
```

You should receive an iMessage within 10 seconds.

### Automation 2 — Lunch Rush Order Queue Summary

**What it does:** At 12:30 PM (peak lunch), your agent sends you a mid-rush status check — prompting you to text back any order notes, and confirming the agent is live and ready to answer queue questions.

**Autonomy Tier: NOTIFY** — Agent pings you. You decide whether to respond.

```bash
openclaw cron add \
  --name "rush_checkin" \
  --cron "30 12 * * 1-6" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Send a brief mid-lunch-rush check-in to Marcus. Remind him he can text any of these commands: 'queue' (get order status), 'sold out [item]' (flag an item), 'pause' (pause new orders), 'how long' (wait time estimate). Keep it to 3 lines max — he is busy." \
  --announce \
  --channel imessage \
  --to "YOUR_PERSONAL_IMESSAGE_HANDLE"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name              Schedule        Timezone           Status
1    pre_rush_prep     45 10 * * 1-6   America/Chicago    ✓ active
2    rush_checkin      30 12 * * 1-6   America/Chicago    ✓ active
```

### Automation 3 — End-of-Day Revenue & Operations Summary

**What it does:** At 3:30 PM, after the lunch service winds down, your agent sends you a summary prompt. You reply with the day's rough numbers ("sold 47 tacos, $380 cash, $210 card") and it formats a clean daily log entry and flags anything unusual.

**Autonomy Tier: NOTIFY** — Agent prompts you. You provide the numbers. Agent formats and confirms.

```bash
openclaw cron add \
  --name "daily_wrap" \
  --cron "30 15 * * 1-6" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Send Marcus a friendly end-of-service prompt asking him to reply with today's numbers: items sold, cash total, card total, any items that sold out, and one thing that went well or went wrong. Explain you will format it into a daily log. Keep the prompt casual and under 4 lines." \
  --announce \
  --channel imessage \
  --to "YOUR_PERSONAL_IMESSAGE_HANDLE"
```

**Verify all three automations:**
```
$ openclaw cron list
ID   Name              Schedule         Timezone           Status
1    pre_rush_prep     45 10 * * 1-6    America/Chicago    ✓ active
2    rush_checkin      30 12 * * 1-6    America/Chicago    ✓ active
3    daily_wrap        30 15 * * 1-6    America/Chicago    ✓ active
```

---

## 07 | ✅ INJECT YOUR SOUL

> **ACTION:** Open `prompts_to_send.md` (in the same folder as this guide) and paste each prompt into the OpenClaw chat interface **one at a time**, in order. Wait for the agent to acknowledge each before sending the next.

```bash
openclaw dashboard
```

The dashboard opens at `http://127.0.0.1:18789/`. Use the chat interface there to paste each prompt from `prompts_to_send.md`.

**Prompt sequence:**
1. **Identity Prompt** — establishes who the agent is and how it operates
2. **Food Truck Operations Prompt** — loads your specific workflow, menu terminology, and order-handling style
3. **Rush Protocol Prompt** — sets the behavior for high-pressure service windows
4. **Security Audit Prompt** — final verification before going live (always last)

> **TIP:** Wait for the agent to acknowledge each prompt before sending the next. This ensures each layer of configuration is properly absorbed before you build on it.

---

## 08 | ✅ SECURITY HARDENING

> **WARNING:** Marcus, do not skip this section. Your MacBook runs OpenClaw on the same machine where you have your personal data, browser sessions, and Apple ID credentials. Proper scoping makes sure the agent only touches what it needs to.

### MacBook-Specific Hardening

**Use the macOS Keychain for secrets (not plain-text config):**

```bash
openclaw secret set anthropic_key "YOUR_ANTHROPIC_API_KEY"
```

Then update `~/.openclaw/config.yaml` to reference the secret:

```yaml
agents:
  defaults:
    model:
      primary: "anthropic/claude-sonnet-4-6"

# Remove any plain-text API key from the config and use:
# env: { ANTHROPIC_API_KEY: ${{ secret.anthropic_key }} }
```

**Enable sandboxing** (prevents the agent from reading your personal files):

```yaml
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

**Restrict tools** to only what the food truck agent actually needs:

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
    - file_write
```

**Configure scheduled gateway restart** (prevents memory accumulation on a long-running Mac):

```yaml
cron:
  - name: daily_restart
    schedule: "0 4 * * *"
    action: run_command
    command: "openclaw gateway restart"

  - name: weekly_prune
    schedule: "0 3 * * 0"
    action: run_command
    command: "openclaw session prune --older-than 14d"
```

After editing config:

```bash
openclaw config validate
openclaw gateway restart
```

**Verify it worked:**
```
$ openclaw config validate
Config is valid.

$ openclaw gateway status
gateway   ✓ running
```

### Security Hardening Checklist

- [ ] FileVault is enabled (verified in Step 1A)
- [ ] iMessage `dmPolicy` set to `allowlist` with only your personal number
- [ ] `configWrites: false` set on iMessage channel
- [ ] API key stored in macOS Keychain via `openclaw secret set`, not plain text
- [ ] Sandbox enabled with `workspace` mode
- [ ] `shell_exec` and `file_write` denied in tools config
- [ ] API key spending limit set to $20/month in Anthropic Console
- [ ] Daily gateway restart cron configured
- [ ] Gateway binding confirmed as `host: 127.0.0.1` (localhost only)

---

## 09 | ✅ SECURITY AUDIT CHECKLIST

> **ACTION:** Run this audit before using OpenClaw for real food truck operations.

```bash
openclaw security audit --deep
```

**Verify it worked:**
```
Security Audit Complete
Critical warnings: 0
Recommendations: X (review below)
```

```bash
openclaw security audit --fix
openclaw doctor
```

**Manual verification:**
- [ ] `openclaw security audit --deep` completes with zero critical warnings
- [ ] Gateway shows "running" with token authentication active
- [ ] `openclaw cron list` shows exactly 3 jobs (pre_rush_prep, rush_checkin, daily_wrap) plus the system restart jobs — no unexpected entries
- [ ] `openclaw skills list` matches exactly what you installed in Section 05
- [ ] iMessage bot only responds to your personal iPhone number
- [ ] No API keys stored in plain text — check `~/.openclaw/` with `cat ~/.openclaw/config.yaml` and confirm no `sk-ant-` strings
- [ ] FileVault confirmed on: `fdesetup status`
- [ ] Review skill permissions: `openclaw skills list --verbose`

**Do NOT begin live food truck operations until all checks pass.**

---

## 10 | ✅ TROUBLESHOOTING & NEXT STEPS

### Common Issues

**"command not found: openclaw" after installing**
```bash
source ~/.zshrc
# If that does not work:
export PATH="$PATH:$(npm root -g)/../bin"
source ~/.zshrc
```

**Gateway not responding**
```bash
openclaw doctor
openclaw gateway stop && openclaw gateway start
```

**iMessage bot not responding after Mac wakes from sleep**
```bash
openclaw channel list
openclaw channel restart imessage
openclaw channels status --probe
```

The heartbeat config handles this automatically once the channel reconnects — usually within 30 seconds of wake.

**Cron jobs not firing**
- Verify gateway is running: `openclaw gateway status`
- Check schedule: `openclaw cron list`
- Test manually: `openclaw cron run pre_rush_prep`
- Check logs: `openclaw gateway logs --level error`

**iMessage messages queuing up (Mac was asleep during service)**

This is the main trade-off of running on a laptop. Your options:
1. Keep the MacBook plugged in and Amphetamine running during service hours (recommended)
2. If messages are missed, they are lost — iMessage does not queue server-side the way Telegram does. This is why the pre-rush setup matters: do it before service starts.

**High memory usage after long sessions**
```bash
openclaw gateway restart
openclaw session prune --older-than 7d
```

The daily 4 AM restart cron handles this automatically going forward.

### Next Steps After Stable Setup (Weeks 2–4)

Once you have run the system for 1–2 weeks, Marcus, consider:

1. **Add a simple order tracking note** — text the agent "add order: 3 carnitas, 2 al pastor, 1 veggie" and have it keep a running tally. Ask "totals?" to get a count. No extra skill needed — just train it via the Identity Prompt.
2. **Weather-based prep adjustment** — use `exa-web-search-free` to have the agent check the Austin weather forecast each morning and mention whether to expect lighter or heavier traffic.
3. **Upgrade to dedicated hardware if you miss messages** — if your MacBook sleeps and you lose iMessage commands during rush, it is time for a Mac Mini setup (always-on, $500). See the migration path in the knowledge base.

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI URL** | `openclaw dashboard` (opens at http://127.0.0.1:18789) |
| **Gateway Port** | 18789 |
| **Model Provider** | Anthropic (`anthropic/claude-sonnet-4-6`) |
| **Channel** | iMessage (via `imsg` CLI) |
| **Cron Timezone** | `America/Chicago` (Austin, TX) |
| **Start gateway** | `openclaw gateway start` |
| **Stop gateway** | `openclaw gateway stop` |
| **Restart gateway** | `openclaw gateway restart` |
| **Check status** | `openclaw gateway status` |
| **Run diagnostics** | `openclaw doctor` |
| **View logs** | `openclaw gateway logs -f` |
| **Restart iMessage** | `openclaw channel restart imessage` |
| **Check cron jobs** | `openclaw cron list` |
| **Installed skills** | `openclaw skills list` |
| **Security audit** | `openclaw security audit --deep` |
| **OpenClaw Docs** | https://docs.openclaw.ai |

---

**OPENCLAW | Your Agent. Your Hardware. Your Soul.**
