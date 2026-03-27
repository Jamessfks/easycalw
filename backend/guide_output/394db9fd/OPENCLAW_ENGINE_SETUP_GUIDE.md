# OPENCLAW ENGINE SETUP GUIDE

**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Diana Chen — small business owner, Scouts Coffee (Mission District, SF) |
| **MISSION** | Eliminate the hours spent texting staff about shift swaps and manual schedule coordination |
| **DATE** | 2026-03-26 |
| **DEPLOYMENT** | Existing Mac (Mac Mini — always-on, behind the counter) |
| **CHANNEL** | Telegram (team group chat + DMs) |
| **MODEL** | Anthropic Claude (claude-sonnet-4-20250514) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

**This guide configures your OpenClaw agent to handle staff scheduling coordination, shift swap notifications, and Square POS analytics — built around your coffee shop workflow and the Google Workspace tools your team already lives in.**

---

## Key Moments — What You Will Accomplish

By the end of this guide, you will have:

- **A running OpenClaw instance** on your Mac Mini, connected to your team's Telegram and ready for daily use — answering staff questions and coordinating schedules while you're pulling shots
- **3 tailored automations** that send morning shift reminders, compile your weekly Square sales summary, and alert you to low-inventory flags in your Google Sheet — all without manual intervention
- **Smart guardrails** ensuring your agent confirms with you before any customer-facing message goes out or any money-related action is taken, while handling routine internal coordination on its own

---

## 00 | PRE-FLIGHT CHECKLIST

> ✅ **ACTION:** Complete every item below **before** running a single command. Missing prerequisites will cause you to backtrack.

### Accounts to Create

- [ ] **Anthropic account** — Create at https://console.anthropic.com. You need an API key. Set a monthly spending limit of **$20** to start — Scouts Coffee's usage (staff notifications + daily summaries) will likely run **$5–$15/month**.
- [ ] **Telegram account** — You already have Telegram. You'll need to create a bot via @BotFather (instructions in Section 03).

### API Keys to Obtain

- [ ] **Anthropic API Key** — In the Anthropic Console: API Keys → Create Key. Copy and save it to your password manager (1Password, Keychain, or similar) right now.
- [ ] **Google OAuth** — The `gog` skill will walk you through Google OAuth during setup. No manual API key needed — just your Google account login.

### Hardware & Software

- [ ] Mac Mini is powered on and connected to the internet
- [ ] You have logged into the Mac Mini (either in person or via Screen Sharing from your personal Mac)
- [ ] Terminal app is accessible — find it in Applications → Utilities → Terminal

> 💡 **TIP:** Diana, gather your Anthropic API key in a password manager before starting — this prevents context-switching mid-setup. The entire install takes about 20–30 minutes.

---

## 01 | PLATFORM SETUP

Diana, these steps prepare your Mac Mini to run OpenClaw reliably — 24/7, even when you're not behind the counter.

> ⚠️ **WARNING:** Your Mac Mini should be set to **never sleep**. A sleeping machine won't receive Telegram messages from your staff and will miss scheduled shift reminders. We'll configure this in Step 1B.

### 1A — Verify Your Mac Mini Specs

Open Terminal and run:

```bash
sw_vers
system_profiler SPHardwareDataType | grep -E "Chip|Memory"
```

**Verify it worked:**
```
ProductName:    macOS
ProductVersion: 14.x.x (or higher)
```

> 💡 **TIP:** OpenClaw needs macOS 13 Ventura or later. If your Mac Mini is running an older version, update via System Settings → General → Software Update before continuing.

### 1B — Configure Always-On Settings

Your Mac Mini is a desktop — unlike a laptop, you can safely prevent it from sleeping entirely while plugged in.

```bash
# Prevent system sleep when on AC power (Mac Mini is always plugged in)
sudo pmset -c sleep 0 displaysleep 10

# Enable wake-on-network (wakes the Mac if it somehow sleeps)
sudo pmset -c womp 1

# Disable Power Nap (prevents background update noise)
sudo pmset -c powernap 0
```

**Verify it worked:**
```bash
pmset -g | grep -E "sleep|womp"
```

Expected output:
```
 sleep                0  (powerd preventativesleep)
 womp                 1
```

> ✅ **ACTION:** Also go to System Settings → Lock Screen and set "Turn display off on power adapter when inactive" to **Never**. The display can sleep — the machine must not.

---

## 02 | INSTALL OPENCLAW

### 2A — Install Prerequisites

First, install Xcode Command Line Tools (needed for native modules):

```bash
xcode-select --install
```

A dialog will appear — click "Install" and wait for it to finish (5–10 minutes). Then install Homebrew and Node.js:

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Follow the post-install output to add Homebrew to your PATH, then:
brew install nvm
```

Add nvm to your shell (copy-paste exactly):

```bash
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"' >> ~/.zshrc
source ~/.zshrc

# Install Node.js
nvm install 24
nvm use 24
nvm alias default 24
```

**Verify it worked:**
```
$ node --version
v24.x.x   ← must be 22.16 or higher
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

> ⚠️ **WARNING:** You need version **2026.1.29 or later**. Earlier versions had a security gap allowing unauthenticated gateway access. If you see a gateway auth error after updates, run `openclaw onboard` to reconfigure.

### 2C — Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag installs a macOS launchd service so OpenClaw starts automatically when the Mac Mini boots — this is what makes it truly always-on.

**At each wizard prompt, choose:**

| Prompt | Recommended Choice |
|---|---|
| Gateway mode | **Local** (not Remote) |
| AI provider | **Anthropic** — paste your API key when prompted |
| Model | **`claude-sonnet-4-20250514`** (best balance for daily coffee shop operations) |
| Messaging channels | **Telegram** — set up in Section 03 |
| Hooks | Enable **session memory**, **boot hook**, and **command logger** |
| Skills | **Skip for now** — you'll install skills deliberately in Section 05 |

![Security Handshake](templates/images/image12.png)

> ✅ **ACTION:** When the wizard shows the security acknowledgment, select **"Yes"** to confirm you are the sole operator.

**Verify the daemon installed:**
```bash
openclaw daemon status
openclaw gateway status
```

Expected output:
```
daemon: running   pid: XXXXX
gateway: ✓ healthy   uptime: Xm
```

---

## 03 | CONNECT YOUR CHANNEL (TELEGRAM)

Diana, this connects your agent to Telegram so your staff can reach it in your existing group chat — and you can DM it directly from your iPhone.

> ✅ **ACTION:** Follow the reference document at `reference_documents/telegram_bot_setup.md` for the full step-by-step bot creation process. The key steps are summarized below.

### 3A — Create Your Bot via @BotFather

1. Open Telegram on your phone
2. Search for **@BotFather** (the official Telegram bot — blue checkmark)
3. Send `/newbot`
4. When asked for a name, enter: `Scouts Coffee Assistant`
5. When asked for a username, enter something like: `ScoutsCoffeeBot` (must end in `bot`)
6. **Copy the token** BotFather gives you — it looks like `123456789:ABCdef...`

### 3B — Configure the Bot Token (Secure Method)

Store your bot token in macOS Keychain — never in plain text:

```bash
# Set up keychain secret storage
openclaw secret set telegram_token "YOUR_TELEGRAM_BOT_TOKEN_HERE"
```

Then configure OpenClaw to use it:

```bash
# Open the config file
nano ~/.openclaw/config.yaml
```

Add or update the channels section:

```yaml
channels:
  telegram:
    enabled: true
    bot_token: ${{ secret.telegram_token }}
    dmPolicy: "allowlist"
    allowFrom:
      - "YOUR_NUMERIC_TELEGRAM_USER_ID"
    groups:
      "YOUR_TEAM_GROUP_CHAT_ID":
        groupPolicy: "open"
        requireMention: true
```

> 💡 **TIP:** To find your numeric Telegram user ID: DM your bot from your personal Telegram account, then run `openclaw logs --follow` — look for `from.id` in the output. To find your group chat ID, add the bot to your team group, then check the logs the same way.

Restart the gateway to apply changes:

```bash
openclaw gateway restart
openclaw channel test telegram
```

**Verify it worked:**
```
$ openclaw channels status
telegram   ✓ connected
```

### 3C — Add Bot to Your Team Group Chat

1. In Telegram, open your staff group chat
2. Tap the group name → Add Members → search for your bot username
3. Add it to the group
4. Configure BotFather privacy mode: message @BotFather, send `/setprivacy`, select your bot, choose **Disable** — this lets the bot see all group messages (needed for shift coordination)
5. Remove and re-add the bot to the group after changing privacy mode

### 3D — Lock Down Access

> ⚠️ **WARNING:** Without this step, anyone who finds your bot can send it commands. The `allowlist` DM policy above locks your personal DMs to your user ID only. The `open` group policy for your specific group ID allows all team members to use it in that group.

```bash
openclaw config validate
```

**Verify it worked — no validation errors should appear.**

![Channel Selection](templates/images/image3.png)

---

## 04 | CONFIGURE YOUR MODEL PROVIDER (ANTHROPIC)

```bash
openclaw models status
```

**Verify it worked:**
```
Provider: anthropic   Status: ✓ active   Model: claude-sonnet-4-20250514
```

If not configured:
```bash
openclaw onboard --anthropic-api-key "YOUR_ANTHROPIC_API_KEY"
```

> 💡 **TIP:** Diana, set a monthly spending cap in the Anthropic Console (https://console.anthropic.com → Settings → Limits). For Scouts Coffee's usage — shift reminders, daily sales summaries, staff Q&A — expect **$8–$15/month** with Claude Sonnet. Set your cap at **$25** to give yourself headroom.

![Model Provider Selection](templates/images/image11.png)

---

## 05 | INSTALL SKILLS

> ⚠️ **WARNING:** Always install `skill-vetter` first and use it to screen every subsequent skill. Approximately 17–20% of community skills contain suspicious code.

### Phase 1: Security Stack (Install First — No Exceptions)

```bash
clawhub install skill-vetter
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
```

```bash
skill-vetter prompt-guard
clawhub install prompt-guard

skill-vetter agentguard
clawhub install agentguard
```

> ✅ **ACTION:** `agentguard` is especially important for your setup, Diana — it acts as a circuit breaker that blocks the agent from sending messages or taking actions you didn't intend. Since your agent will be in your staff group chat with 8 employees, this prevents any accidental mass messages.

### Phase 2: Core Skills for Scouts Coffee

| Your Need | Skill | What It Does |
|---|---|---|
| Google Calendar, Gmail, Sheets | `gog` | Full Google Workspace integration — read your calendar, send Gmail drafts, and update your inventory spreadsheet, all from Telegram |
| Read/write Notion SOPs | `notion` | Access and update your Scouts Coffee recipe and SOP pages in Notion via chat |
| Web search for market info | `brave-search` | Privacy-first web search — useful when you ask the agent about coffee market prices or local events that affect foot traffic |

```bash
skill-vetter gog
clawhub install gog

skill-vetter notion
clawhub install notion

skill-vetter brave-search
clawhub install brave-search
```

**After installing `gog`, connect your Google account:**
```bash
openclaw skills configure gog
```

This opens a browser for Google OAuth. Sign in with your Google Workspace account (the one you use for Gmail and Sheets).

**Verify all skills installed:**
```
$ openclaw skills list
skill-vetter     v1.x.x   ✓ active
prompt-guard     v1.x.x   ✓ active
agentguard       v1.x.x   ✓ active
gog              v1.x.x   ✓ active
notion           v1.x.x   ✓ active
brave-search     v1.x.x   ✓ active
```

---

## 06 | CONFIGURE AUTOMATIONS

> 💡 **TIP:** These three automations are the core of what you described, Diana — they replace the manual texting and spreadsheet-checking that's eating your mornings.

### Automation 1 — Daily Shift Reminder

**What it does:** Every morning at 6:30 AM, the agent checks your Google Calendar for the day's shifts and sends a reminder to your team Telegram group listing who's on and when.

**Autonomy Tier: EXECUTE (internal)** — This sends to your team's group chat automatically. Your agent is allowed to do this because it's internal-only and routine. No customer-facing messages, no financial actions.

First, get your team group chat ID from Telegram (check `openclaw logs --follow` after someone messages the group). Then run:

```bash
openclaw cron add \
  --name "Daily Shift Reminder" \
  --cron "30 6 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Check the Google Calendar for today's Scouts Coffee shifts. Format as a brief shift roster: who starts when, any notes. Post it to the team as a morning heads-up. Keep it under 5 lines." \
  --announce \
  --channel telegram \
  --to "YOUR_TEAM_GROUP_CHAT_ID"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                    Schedule        Timezone              Status
1    Daily Shift Reminder    30 6 * * *      America/Los_Angeles   ✓ active
```

### Automation 2 — Weekly Square Sales Summary

**What it does:** Every Monday at 8:00 AM, the agent pulls your weekly Square data (via your Google Sheet that you export to, or direct summary from your records) and sends you a private summary DM.

**Autonomy Tier: NOTIFY** — Agent reads and summarizes. Sends to your personal DM only, not the group.

```bash
openclaw cron add \
  --name "Weekly Sales Summary" \
  --cron "0 8 * * 1" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Check the Scouts Coffee Google Sheet for last week's sales data. Summarize: total revenue, busiest day, top items, and one observation worth acting on. Keep it concise — 5 bullet points max." \
  --announce \
  --channel telegram \
  --to "YOUR_PERSONAL_TELEGRAM_CHAT_ID"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                    Schedule        Timezone              Status
1    Daily Shift Reminder    30 6 * * *      America/Los_Angeles   ✓ active
2    Weekly Sales Summary    0 8 * * 1       America/Los_Angeles   ✓ active
```

### Automation 3 — Low Inventory Alert Check

**What it does:** Every Friday at 4:00 PM, the agent scans your inventory Google Sheet and messages you if any item is below a threshold you define.

**Autonomy Tier: NOTIFY** — Agent reads and alerts. Never updates the sheet or places orders without your approval.

```bash
openclaw cron add \
  --name "Inventory Alert Check" \
  --cron "0 16 * * 5" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Check the Scouts Coffee inventory Google Sheet. List any items where the quantity is below the minimum threshold. If nothing is low, just say 'Inventory looks good for the weekend.' Keep it brief." \
  --announce \
  --channel telegram \
  --to "YOUR_PERSONAL_TELEGRAM_CHAT_ID"
```

**Verify all 3 automations are active:**
```
$ openclaw cron list
ID   Name                    Schedule        Timezone              Status
1    Daily Shift Reminder    30 6 * * *      America/Los_Angeles   ✓ active
2    Weekly Sales Summary    0 8 * * 1       America/Los_Angeles   ✓ active
3    Inventory Alert Check   0 16 * * 5      America/Los_Angeles   ✓ active
```

> ☕ **SMALL BUSINESS NOTE:** Your agent is set to Tier 2 (NOTIFY) for all financial and customer-facing actions. It will always ask your approval before sending anything to customers, drafting external emails, or modifying your Square data. Internal staff communications (like shift reminders to your team group) run on Tier 3 (EXECUTE) because you explicitly said routine internal tasks can run automatically.

---

## 07 | INJECT YOUR SOUL

> ✅ **ACTION:** Open `prompts_to_send.md` (in the same folder as this guide) and paste each prompt into the OpenClaw chat interface **one at a time**, in order.

```bash
openclaw dashboard
```

This opens the web dashboard at `http://127.0.0.1:18789/`. Find the chat interface and paste prompts from `prompts_to_send.md` one at a time.

**Prompt sequence:**
1. **Identity Prompt** → establishes the agent as your Scouts Coffee operations assistant
2. **Business Context** → teaches the agent your shop layout, team, and current tools
3. **Skills Installation** → configures Google Workspace and Notion connections
4. **Routines & Automations** → sets expectations for scheduled tasks
5. **Guardrails & Safety** → defines what requires your approval vs. runs automatically
6. **Security Audit Prompt** → final verification before going live

> 💡 **TIP:** Wait for the agent to acknowledge each prompt before sending the next. This ensures each layer of configuration is properly absorbed.

![OpenClaw Web UI](templates/images/image6.png)

---

## 08 | SECURITY HARDENING

> ⚠️ **WARNING:** Diana, don't skip this section. Your Mac Mini holds Square POS data, Google Workspace credentials, and staff information. Proper hardening protects your business data.

### Mac Mini-Specific Hardening

**Step 1: Verify FileVault disk encryption is on**

```bash
fdesetup status
```

**Verify it worked:**
```
FileVault is On.
```

If it reports "FileVault is Off", enable it in System Settings → Privacy & Security → FileVault. This encrypts your entire disk — protecting OpenClaw session data, API keys, and your business records.

**Step 2: Store all API keys in macOS Keychain (not plain text)**

```bash
# Store your Anthropic key securely
openclaw secret set anthropic_key "YOUR_ANTHROPIC_API_KEY"

# Verify no plain-text keys remain in config
grep -r "sk-ant" ~/.openclaw/
```

Expected output: no results (keys should only be in Keychain).

**Step 3: Lock down gateway to localhost only**

Verify your config has:
```yaml
gateway:
  host: 127.0.0.1
  port: 18789
```

**Step 4: Enable sandboxing**

Add to `~/.openclaw/config.yaml`:

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

**Step 5: Restrict tools to what you actually need**

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
```

### Small Business Security Checklist

- [ ] FileVault enabled on Mac Mini
- [ ] All API keys stored in macOS Keychain via `openclaw secret set`, not in plain text
- [ ] Gateway bound to `127.0.0.1` only (no external network exposure)
- [ ] Telegram bot locked to your user ID for DMs + your team group only
- [ ] Sandbox mode enabled
- [ ] Anthropic API spending limit set to $25/month in Anthropic Console
- [ ] OpenClaw conversation logs retained for 30 days (audit trail in `~/.openclaw/logs/`)
- [ ] API keys rotation reminder set (quarterly — add a Google Calendar reminder)
- [ ] `agentguard` active and in `openclaw skills list`

---

## 09 | SECURITY AUDIT CHECKLIST

> ✅ **ACTION:** Run this audit before using OpenClaw for real Scouts Coffee operations.

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
openclaw health
```

**Manual verification:**
- [ ] `openclaw security audit --deep` completes with no critical warnings
- [ ] Gateway shows "running" with token authentication active
- [ ] `openclaw cron list` shows exactly the 3 jobs you configured — no unexpected entries
- [ ] `openclaw skills list` shows exactly: `skill-vetter`, `prompt-guard`, `agentguard`, `gog`, `notion`, `brave-search`
- [ ] Telegram bot only responds to your account (DM) and your team group
- [ ] No API keys stored in plain text — verify: `grep -r "sk-ant\|TELEGRAM_BOT_TOKEN" ~/.openclaw/`
- [ ] FileVault is on: `fdesetup status`
- [ ] Review skill permissions: `openclaw skills list --verbose`
- [ ] Test a manual cron run: `openclaw cron run 1 --due` (should queue the shift reminder job)

**Do NOT begin live Scouts Coffee operations until all checks pass.**

---

## 10 | TROUBLESHOOTING & NEXT STEPS

### Common Issues

**"command not found: openclaw" after installing**
```bash
source ~/.zshrc
```

**Gateway not responding**
```bash
openclaw doctor
openclaw gateway stop && openclaw gateway start
```

**Telegram bot not responding in group chat**
- Verify privacy mode is disabled in BotFather (`/setprivacy` → your bot → Disable)
- Remove and re-add the bot to the group after changing privacy mode
- Check logs: `openclaw logs --follow`
- Verify status: `openclaw channels status`

**Cron jobs not firing (shift reminders not sending)**
- Verify gateway: `openclaw gateway status`
- Check schedule: `openclaw cron list`
- Test manually: `openclaw cron run <job-id>`
- Check Mac isn't sleeping: `pmset -g | grep sleep`

**Memory creeping up after long uptime**
```bash
openclaw gateway restart
openclaw session prune --older-than 7d
```

A daily 4 AM restart is configured in your setup to prevent this automatically.

**Bot responds to wrong people in the group**
```bash
openclaw config validate
openclaw channels status
```
Verify `groupAllowFrom` settings in `~/.openclaw/config.yaml`.

### Next Steps After Stable Setup

Once you've run the system for 1–2 weeks, Diana, consider:

1. **Connect Square POS directly** — The `composio` skill (59 in the registry) can bridge Square's API for real-time sales data instead of relying on exported Google Sheets. Run `skill-vetter composio` before installing.
2. **Staff shift swap workflow** — Teach the agent a structured prompt for handling swap requests: a staff member messages the bot, it checks who's available via Calendar, proposes a swap, and pings you for approval before confirming.
3. **Context hygiene** — After week 5, consider adding a `#inventory` and `#scheduling` topic to your Telegram group, each routing to the agent's different contexts to prevent confusion between operational topics.

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI URL** | `openclaw dashboard` (tokenized — don't type manually) |
| **Gateway Port** | 18789 |
| **Model Provider** | Anthropic (`claude-sonnet-4-20250514`) |
| **Channel** | Telegram |
| **Cron Timezone** | `America/Los_Angeles` |
| **Config File** | `~/.openclaw/config.yaml` |
| **Secrets** | `openclaw secret set <name> <value>` |
| **OpenClaw Docs** | https://docs.openclaw.ai |
| **Security Audit** | `openclaw security audit --deep` |
| **Logs** | `openclaw logs --follow` |
| **Gateway Status** | `openclaw gateway status` |
| **Cron Jobs** | `openclaw cron list` |
| **Installed Skills** | `openclaw skills list` |
| **Restart Channel** | `openclaw channel restart telegram` |
| **Daemon Status** | `openclaw daemon status` |
| **Update OpenClaw** | `npm update -g openclaw` |

---

**OPENCLAW | Your Agent. Your Hardware. Your Soul.**
