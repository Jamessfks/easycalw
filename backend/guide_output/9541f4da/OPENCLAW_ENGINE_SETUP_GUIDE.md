# OPENCLAW ENGINE SETUP GUIDE
**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Jordan — Coffee Shop Owner |
| **MISSION** | End the scheduling chaos. Put Jordan back behind the espresso machine, not buried in WhatsApp group threads. |
| **DATE** | 2026-03-26 |
| **DEPLOYMENT** | Existing Mac |
| **CHANNEL** | WhatsApp |
| **MODEL** | Anthropic Claude (claude-sonnet-4-20250514) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

**This guide configures your OpenClaw agent to take ownership of staff scheduling at your coffee shop — automatically sending shift reminders, fielding swap requests, and keeping Jordan's WhatsApp out of the chaos loop, all running on your existing Mac.**

---

## 🎯 Key Moments — What You Will Accomplish

By the end of this guide, you will have:

- **A running OpenClaw instance** on your Mac, connected to WhatsApp and fielding scheduling messages the moment Jordan opens shop
- **3 tailored automations** that send morning shift briefings, weekly schedule summaries, and end-of-day closing checklists without a single manual message
- **Industry-grade guardrails** ensuring your agent only responds to approved contacts and never exposes staff information outside your WhatsApp access list

---

## 00 | ✅ PRE-FLIGHT CHECKLIST

> ✅ **ACTION:** Complete every item below **before** running a single command. Missing prerequisites will cause you to backtrack.

### Accounts to Create

- [ ] **Anthropic account** — Create at https://console.anthropic.com. You need an API key. Set a monthly spending limit of **$20–$40** to start. For a coffee shop handling scheduling messages, expect **$5–$15/month** in real usage.
- [ ] **WhatsApp** — Already installed on your phone. You will link it to OpenClaw during setup.
- [ ] **Google account** — Needed for `gog` skill (Google Calendar integration for shift scheduling). You likely already have one.

### API Keys to Obtain

- [ ] **Anthropic API Key** — In your Anthropic console: API Keys → Create New Key. Copy and store it in your Mac's Notes app temporarily until you paste it into the setup wizard.
- [ ] *(Optional)* **Todoist API Token** — If you use Todoist for task tracking. Can be skipped on first pass.

### Hardware & Software

- [ ] Mac running macOS 13 Ventura or newer (M1, M2, M3, or M4 chip recommended)
- [ ] At least 8 GB of RAM and 2 GB free disk space
- [ ] Terminal app — found in Applications > Utilities > Terminal
- [ ] Internet connection

> 💡 **TIP:** Jordan, gather your Anthropic API key before starting. The setup wizard will ask for it mid-flow, and hunting for it mid-install is the #1 reason people restart from scratch.

---

## 01 | 🖥️ PLATFORM SETUP

Jordan, these steps prepare your Mac to run OpenClaw reliably alongside your daily work.

> ⚠️ **WARNING:** Your Mac will sleep when idle, which means your scheduling bot stops responding. This is fine for a coffee shop — you are open during set hours and closed at night. Configure Section 1B carefully so your Mac stays awake during your operating hours (e.g., 5 AM–10 PM) and can sleep overnight.

### 1A — Install Xcode Command Line Tools

Open Terminal (Applications > Utilities > Terminal) and run:

```bash
xcode-select --install
```

A dialog box will appear. Click **Install** and wait for it to finish (about 5 minutes).

**Verify it worked:**
```
$ xcode-select -p
/Library/Developer/CommandLineTools
```

### 1B — Configure Mac to Stay Awake During Shop Hours

> 💡 **TIP:** Why this matters for Jordan: if your Mac sleeps at 9 AM while you're on the floor pulling shots, your staff's WhatsApp scheduling messages go unanswered. Set your Mac to stay awake during business hours and sleep overnight when the shop is closed.

**For a Mac desktop (iMac or Mac Mini — most common for a coffee shop back office):**

```bash
# Prevent sleep when plugged in (AC power), allow display to sleep after 10 min
sudo pmset -c sleep 0 displaysleep 10

# Enable wake-on-network so it can recover after a power blip
sudo pmset -c womp 1
```

**Verify it worked:**
```
$ pmset -g | grep " sleep"
 sleep                1 (sleep prevented by power assertion)
```

**For a MacBook (laptop):**

Install [Amphetamine](https://apps.apple.com/us/app/amphetamine/id937984704) — free from the Mac App Store. Configure it to keep your Mac awake while plugged in at the shop, and allow normal sleep when you unplug and go home.

---

## 02 | 📦 INSTALL OPENCLAW

### 2A — Install Homebrew and Node.js

```bash
# Install Homebrew (Mac package manager)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Follow Homebrew's post-install instructions to add it to your PATH, then:
brew install nvm

# Install Node.js (the engine OpenClaw runs on)
nvm install 24
nvm use 24
nvm alias default 24
```

**Verify it worked:**
```
$ node --version
v24.x.x   ← must be 24.x or 22.16+
```

> ⚠️ **WARNING:** If `node --version` shows nothing or a version below 22.16, do not continue. Run `nvm install 24` again and check that `nvm use 24` completed without errors.

### 2B — Install OpenClaw

```bash
curl -fsSL https://get.openclaw.ai | bash
```

**Verify it worked:**
```
$ openclaw --version
openclaw v2026.x.x   ← any version 2026.1.29 or later
```

> ⚠️ **WARNING:** You need version **2026.1.29 or later**. Earlier versions had a security gap allowing unauthenticated gateway access. If you see a version earlier than this, re-run the installer.

### 2C — Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag installs a background service so OpenClaw starts automatically every time your Mac boots. For a coffee shop, this is essential — you don't want to SSH in every morning before you open.

**At each wizard prompt, choose:**

| Prompt | Recommended Choice |
|---|---|
| Gateway mode | **Local** (not Remote) |
| AI provider | **Anthropic** — paste your API key when asked |
| Model | **`claude-sonnet-4-20250514`** (reliable, cost-effective for scheduling tasks) |
| Messaging channels | **WhatsApp** — set up fully in Section 03 |
| Hooks | Enable **session memory**, **boot hook**, and **command logger** |
| Skills | **Skip for now** — you'll install skills deliberately in Section 05 |

> ✅ **ACTION:** When the wizard shows the security acknowledgment screen, select **"Yes"** to confirm you are the sole operator of this instance.

**Verify it worked:**
```
$ openclaw gateway status
Gateway: running   Port: 18789   Uptime: 0m
```

---

## 03 | 📱 CONNECT YOUR CHANNEL (WHATSAPP)

Jordan, this section links your WhatsApp to OpenClaw so your scheduling agent can send and receive messages directly.

> 💡 **TIP:** OpenClaw uses WhatsApp Web (via the open-source Baileys library) — the same technology as WhatsApp Web on your browser. It links to your existing WhatsApp account via QR code. You do **not** need a WhatsApp Business API account or any paid tier to start.

### 3A — Add the WhatsApp Plugin

```bash
openclaw channels add --channel whatsapp
```

This will prompt you to install the WhatsApp plugin (`@openclaw/whatsapp`) automatically. Confirm the install.

**Verify plugin installed:**
```
$ openclaw plugins list
@openclaw/whatsapp   v1.x.x   ✓ installed
```

### 3B — Link Your WhatsApp Account

```bash
openclaw channels login --channel whatsapp
```

A QR code will appear in your terminal. Open WhatsApp on your phone:

1. Tap the three dots (Android) or Settings (iPhone)
2. Tap **Linked Devices**
3. Tap **Link a Device**
4. Scan the QR code in your terminal

**Verify it worked:**
```
$ openclaw channels status
whatsapp   ✓ connected   linked: +YOUR_PHONE_NUMBER
```

### 3C — Lock Down Access (Critical)

> ⚠️ **WARNING:** Without this step, anyone who discovers your bot's number can send it commands. For a coffee shop, you want to lock this to your phone number and your staff's numbers only.

Edit your OpenClaw config to restrict who can message the bot:

```bash
# Open config in a simple text editor
open ~/.openclaw/config.yaml
```

Add or edit the WhatsApp access section:

```yaml
channels:
  whatsapp:
    dmPolicy: "allowlist"
    allowFrom:
      - "+1YOUR_PHONE_NUMBER"        # Jordan's number (E.164 format, e.g., +12125551234)
      - "+1STAFF_MEMBER_1_NUMBER"    # Add each staff member's number here
      - "+1STAFF_MEMBER_2_NUMBER"
    groupPolicy: "disabled"          # Disable group chats for now — add them later if needed
```

Save the file, then reload:

```bash
openclaw gateway reload
```

**Verify it worked:**
```
$ openclaw channels status
whatsapp   ✓ connected   dmPolicy: allowlist   allowFrom: 3 numbers
```

> ✅ **ACTION:** Test immediately — send a WhatsApp message from your phone to your linked number. You should get a response from the agent. Then try from a number NOT on your allowlist — it should receive no response.

---

## 04 | 🧠 CONFIGURE YOUR MODEL PROVIDER (ANTHROPIC)

```bash
openclaw models status
```

**Verify it worked:**
```
Provider: anthropic   Status: ✓ active   Model: claude-sonnet-4-20250514
```

If not showing as active, configure it:

```bash
openclaw onboard --anthropic "YOUR_ANTHROPIC_API_KEY"
```

> 💡 **TIP:** Jordan, set a monthly spending cap in your Anthropic console (https://console.anthropic.com → Settings → Limits). For a coffee shop scheduling assistant handling 50–100 messages per day, expect **$5–$15/month**. A $40 hard cap gives you plenty of headroom with an automatic stop as a safety net.

Store your API key securely in macOS Keychain (not as a plain-text environment variable):

```bash
openclaw secret set anthropic_key "YOUR_ANTHROPIC_API_KEY"
```

Then update your config to reference it:

```yaml
# In ~/.openclaw/config.yaml
models:
  - provider: anthropic
    api_key: ${{ secret.anthropic_key }}
    model: claude-sonnet-4-20250514
    priority: 1
```

**Reload to apply:**
```bash
openclaw gateway reload
```

---

## 05 | 🛠️ INSTALL SKILLS

> ⚠️ **WARNING:** Always install `skill-vetter` first and use it to screen every subsequent skill before installing it. Approximately 17–20% of community skills on ClawHub contain suspicious code. This is non-negotiable.

### Phase 1: Security Stack (Install First — No Exceptions)

```bash
clawhub install skill-vetter
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
```

Now use `skill-vetter` to screen the next security skill before installing:

```bash
skill-vetter prompt-guard
clawhub install prompt-guard

skill-vetter agentguard
clawhub install agentguard
```

**Verify all three security skills are active:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
prompt-guard   v1.x.x   ✓ active
agentguard     v1.x.x   ✓ active
```

> 💡 **TIP:** `prompt-guard` protects against malicious instructions embedded in messages your agent reads. `agentguard` is a runtime circuit-breaker that blocks dangerous actions (like deleting files or sending bulk messages you never authorized) before they execute. Both matter for a coffee shop — you don't want an unexpected message from a staff member triggering unintended behavior.

### Phase 2: Core Scheduling Skills

| Your Need | Skill | What It Does |
|---|---|---|
| Shift calendar & scheduling | `gog` | Full Google Calendar integration — reads and updates your shift schedule from WhatsApp |
| Task lists & closing checklists | `todoist` | Manage daily opening/closing task lists, track what got done |

```bash
# Screen before installing — always
skill-vetter gog
clawhub install gog

skill-vetter todoist
clawhub install todoist
```

**Verify all skills active:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
prompt-guard   v1.x.x   ✓ active
agentguard     v1.x.x   ✓ active
gog            v1.x.x   ✓ active
todoist        v1.x.x   ✓ active
```

> ✅ **ACTION:** After installing `gog`, connect it to your Google account by following the OAuth prompt it displays. This gives the agent permission to read and write your Google Calendar where you track staff shifts.

> ☕ **COFFEE SHOP OPERATOR NOTE:** Every skill you install is a new capability your agent has — and a new attack surface. For a coffee shop, five skills (the three security skills + `gog` + `todoist`) is the right scope for a first deployment. Add more only when you have a concrete need for them.

---

## 06 | ⏰ CONFIGURE AUTOMATIONS

> 💡 **TIP:** Why this matters for Jordan: you described scheduling as chaos — staff asking "who's in today?", shift swap requests piling up in a group chat, and reminders falling through the cracks. These three automations replace that manual back-and-forth with proactive, consistent messages every single day.

### Automation 1 — Morning Shift Briefing

**What it does:** Every morning at 6 AM, the agent checks your Google Calendar and sends you a WhatsApp summary of who is scheduled for today — shifts, start times, any gaps.

**Autonomy Tier: 🔔 NOTIFY** — Agent reads the calendar and summarizes. It does not modify anything.

```bash
openclaw cron add \
  --name "morning-shift-briefing" \
  --cron "0 6 * * *" \
  --tz "America/New_York" \
  --session isolated \
  --message "Check Google Calendar for today's staff shifts. Summarize who is working, their start times, and any gaps or uncovered shifts. Keep it brief — this is a quick morning briefing." \
  --announce \
  --channel whatsapp \
  --to "YOUR_WHATSAPP_NUMBER_E164"
```

Replace `YOUR_WHATSAPP_NUMBER_E164` with your number in E.164 format (e.g., `+12125551234`). Replace `America/New_York` with your timezone (see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

**Verify it worked:**
```
$ openclaw cron list
ID   Name                      Schedule     Timezone           Status
1    morning-shift-briefing    0 6 * * *    America/New_York   ✓ active
```

**Test it manually without waiting until 6 AM:**
```bash
openclaw cron run <job-id>
```

### Automation 2 — Weekly Schedule Reminder (Sunday Night)

**What it does:** Every Sunday at 7 PM, the agent pulls next week's shift schedule from Google Calendar and sends you a summary so you can spot and fix gaps before the week starts.

**Autonomy Tier: 🔔 NOTIFY** — Reads and summarizes only.

```bash
openclaw cron add \
  --name "weekly-schedule-review" \
  --cron "0 19 * * 0" \
  --tz "America/New_York" \
  --session isolated \
  --message "Check Google Calendar for next week's staff schedule (Monday through Sunday). List each day's scheduled staff and flag any days with fewer than the typical number of staff or any uncovered shifts. Send the summary so I can review before the week starts." \
  --announce \
  --channel whatsapp \
  --to "YOUR_WHATSAPP_NUMBER_E164"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                      Schedule      Timezone           Status
1    morning-shift-briefing    0 6 * * *     America/New_York   ✓ active
2    weekly-schedule-review    0 19 * * 0    America/New_York   ✓ active
```

### Automation 3 — End-of-Day Closing Checklist (9 PM)

**What it does:** Every night at 9 PM, the agent sends you and your closing staff a short checklist of standard closing tasks. No more forgotten steps.

**Autonomy Tier: 🔔 NOTIFY** — Sends a message only, takes no action.

```bash
openclaw cron add \
  --name "closing-checklist" \
  --cron "0 21 * * *" \
  --tz "America/New_York" \
  --session isolated \
  --message "Send the nightly coffee shop closing checklist. Include: cash drawer count completed, equipment cleaned (espresso machine, grinders), refrigeration checked, front door locked, alarm set. Keep it as a numbered list." \
  --announce \
  --channel whatsapp \
  --to "YOUR_WHATSAPP_NUMBER_E164"
```

**Verify all three automations are active:**
```
$ openclaw cron list
ID   Name                      Schedule      Timezone           Status
1    morning-shift-briefing    0 6 * * *     America/New_York   ✓ active
2    weekly-schedule-review    0 19 * * 0    America/New_York   ✓ active
3    closing-checklist         0 21 * * *    America/New_York   ✓ active
```

> ☕ **COFFEE SHOP OPERATOR NOTE:** These automations run inside the Gateway on your Mac. If your Mac is asleep at 6 AM, the 6 AM job will run as soon as your Mac wakes up. For a coffee shop that opens at 6–7 AM, your Mac should already be waking up with you. If you need guaranteed 6 AM delivery, consider upgrading to a Mac Mini that runs 24/7 (see Section 10).

---

## 07 | 💉 INJECT YOUR SOUL

> ✅ **ACTION:** Open `prompts_to_send.md` (in the same folder as this guide) and paste each prompt into the OpenClaw chat interface **one at a time**, in order. Wait for the agent to acknowledge each prompt before sending the next.

```bash
openclaw dashboard
```

This opens the OpenClaw web dashboard at `http://127.0.0.1:18789`. Find the chat interface and paste each prompt from `prompts_to_send.md` in sequence.

**Prompt sequence:**
1. **Identity Prompt** — establishes who the agent is (Jordan's scheduling assistant at the coffee shop)
2. **Scheduling Knowledge Prompt** — teaches the agent your specific shift patterns and staff names
3. **Tone & Communication Style Prompt** — calibrates how the agent talks to you and your staff
4. **Security Audit Prompt** — final verification before going live

> 💡 **TIP:** After pasting Prompt 1, wait for the agent to reply with an acknowledgment before sending Prompt 2. Each prompt builds on the last — sending them out of order or too quickly can result in incomplete configuration.

---

## 08 | 🔒 SECURITY HARDENING

> ⚠️ **WARNING:** Jordan, do not skip this section. Your WhatsApp is linked to a live phone number, and your Mac has API keys that cost real money if abused. A few minutes here prevents a bad day.

### Mac-Specific Hardening

**Verify FileVault (disk encryption) is on:**

```bash
fdesetup status
```

**Verify it worked:**
```
FileVault is On.
```

If it shows "FileVault is Off", enable it: System Settings > Privacy & Security > FileVault > Turn On. This protects your API keys and session data if your Mac is ever stolen from the shop.

**Store all secrets in macOS Keychain (not plain text):**

```bash
# You already did this for Anthropic in Section 04
# Do the same for WhatsApp credentials (handled automatically by the WhatsApp plugin)
# Verify no plain-text keys in your config
grep -r "sk-ant" ~/.openclaw/config.yaml && echo "WARNING: plain text key found" || echo "OK: no plain text keys"
```

**Sandbox configuration — add to `~/.openclaw/config.yaml`:**

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

tools:
  allow:
    - web_search
    - calculator
    - datetime
    - memory_store
    - memory_recall
  deny:
    - shell_exec
    - file_write
```

**Reload to apply:**
```bash
openclaw gateway reload
```

### Coffee Shop Security Checklist

- [ ] WhatsApp `allowFrom` list contains only Jordan's number and current staff numbers — no wildcards (`*`)
- [ ] `groupPolicy: "disabled"` in config (re-enable groups deliberately only if you add a staff group chat)
- [ ] Anthropic API spending limit set at https://console.anthropic.com
- [ ] FileVault enabled on Mac
- [ ] API key stored via `openclaw secret set`, not in plain text in config file
- [ ] OpenClaw conversation logs retained (audit trail) — default location: `~/.openclaw/logs/`
- [ ] Rotate API key every 90 days in Anthropic console

---

## 09 | 🔍 SECURITY AUDIT CHECKLIST

> ✅ **ACTION:** Run this audit before using OpenClaw for real coffee shop operations.

```bash
openclaw security audit --deep
```

**Verify it worked:**
```
Security Audit Complete
Critical warnings: 0
Recommendations: X (review below)
```

Fix any critical warnings:

```bash
openclaw security audit --fix
openclaw doctor
openclaw health
```

**Manual verification checklist:**

- [ ] `openclaw security audit --deep` completes with 0 critical warnings
- [ ] Gateway shows "running" with token authentication active
- [ ] `openclaw cron list` shows exactly 3 jobs — morning briefing, weekly review, closing checklist — no unexpected entries
- [ ] `openclaw skills list` shows exactly: `skill-vetter`, `prompt-guard`, `agentguard`, `gog`, `todoist`
- [ ] WhatsApp bot only responds to numbers on your allowlist (test with an unlisted number)
- [ ] No API keys in plain text: `grep -r "sk-ant" ~/.openclaw/` should return nothing
- [ ] FileVault enabled: `fdesetup status` shows "FileVault is On"
- [ ] Review skill permissions: `openclaw skills list --verbose`

**Do NOT begin live coffee shop operations until all checks pass.**

---

## 10 | 🚀 TROUBLESHOOTING & NEXT STEPS

### Common Issues

**"command not found: openclaw" after installing:**
```bash
source ~/.zshrc
# If still not found:
export PATH="$PATH:$(npm root -g)/../bin"
source ~/.zshrc
```

**Gateway not responding:**
```bash
openclaw doctor
openclaw gateway stop && openclaw gateway start
```

**WhatsApp bot not responding:**
```bash
# Check channel connection
openclaw channels status
# Check logs in real time
openclaw logs --follow
# Re-link if disconnected
openclaw channels login --channel whatsapp
```

**WhatsApp session dropped (this happens occasionally with the Baileys implementation):**
```bash
openclaw doctor
openclaw logs --follow
# If needed, re-link:
openclaw channels login --channel whatsapp
```

**Cron jobs not firing:**
```bash
openclaw gateway status
openclaw cron list
# Test a job manually
openclaw cron run <job-id>
```

**Mac was asleep when a cron job was scheduled:**

This is expected on a non-dedicated Mac. The job will fire when the Mac wakes. For a coffee shop open 6 AM–10 PM, this is rarely an issue if your Mac wakes before opening. See upgrade path below if you need guaranteed delivery.

### Memory Cleanup (Run Weekly)

```bash
# Prune old conversation sessions to keep memory usage low
openclaw session prune --older-than 7d
```

The daily restart cron job (configured automatically during onboard) handles this at 4 AM.

### Next Steps After 2 Stable Weeks

Once Jordan's scheduling bot has been running reliably for 2 weeks, consider:

1. **Add staff to the WhatsApp allowlist** — your baristas and shift leads can message the bot directly to check their schedule, request swaps, or flag coverage gaps without routing everything through Jordan
2. **Expand to a staff WhatsApp group** — set `groupPolicy: "allowlist"` and add a dedicated staff scheduling group so the bot can broadcast updates to the whole team
3. **Upgrade to a Mac Mini** — if you find yourself missing cron jobs because your laptop sleeps, a $500 Mac Mini running 24/7 pays for itself in operational reliability within months; see https://docs.openclaw.ai for the migration path

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI URL** | `openclaw dashboard` (opens `http://127.0.0.1:18789`) |
| **Gateway Port** | 18789 |
| **Model Provider** | Anthropic (`claude-sonnet-4-20250514`) |
| **Channel** | WhatsApp |
| **Cron Timezone** | Set to your local timezone (e.g., `America/New_York`) |
| **Config File** | `~/.openclaw/config.yaml` |
| **OpenClaw Docs** | https://docs.openclaw.ai |
| **Security Audit** | `openclaw security audit --deep` |
| **Logs** | `openclaw logs --follow` |
| **Gateway Status** | `openclaw gateway status` |
| **Cron Jobs** | `openclaw cron list` |
| **Installed Skills** | `openclaw skills list` |
| **Channel Status** | `openclaw channels status` |
| **Re-link WhatsApp** | `openclaw channels login --channel whatsapp` |
| **Restart Gateway** | `openclaw gateway restart` |

---

**OPENCLAW | Your Agent. Your Hardware. Your Soul.**
