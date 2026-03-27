# OpenClaw Engine Setup Guide

| Field | Details |
|---|---|
| **PREPARED FOR** | Jordan |
| **MISSION** | Eliminate coffee-shop scheduling chaos with a WhatsApp AI assistant |
| **DATE** | 2026-03-26 |
| **DEPLOYMENT** | Existing Mac |
| **CHANNEL** | WhatsApp (Web / Baileys) |
| **MODEL** | Anthropic Claude (claude-sonnet-4-6) |
| **STATUS** | Ready to build |

**By the end of this guide, Jordan will have a WhatsApp AI assistant that handles staff scheduling, sends shift reminders automatically, and answers routine questions — saving 10-15 hours of chaos every single week.**

---

## Key Moments

- **The "scheduling chaos" ends the moment your first cron job fires** — your assistant will WhatsApp your team their weekly roster every Sunday evening without you lifting a finger.
- **You won't need a new computer** — OpenClaw runs quietly on the Mac you already own, using less power than a Chrome tab while it's idle.
- **skill-vetter is installed before anything else** — one free scan protects you from the ClawHavoc-style attacks that hit 1,184 malicious skills in February 2026.

---

## 00 | Before You Start 🗺️

Hey Jordan — let's keep this simple. You don't need to be technical to follow these steps. Everything is copy-paste commands, and every single one has a "Verify it worked" check so you always know you're on track.

> 💡 **TIP:** Think of OpenClaw as a small phone exchange running on your Mac. Messages from your WhatsApp arrive, the AI thinks about them, then replies or fires off reminders. Your Mac is the switchboard — the actual AI thinking happens on Anthropic's servers, so your Mac barely breaks a sweat.

> ☕ **COFFEE SHOP INDUSTRY NOTE:**
> Staff scheduling is the #1 time-sink for independent coffee shop owners. A missed shift notification or a last-minute "who's covering Saturday?" WhatsApp chain can derail your entire morning prep. OpenClaw's scheduler will send your weekly roster, chase confirmations, and handle the "what time do I start?" questions — all through the WhatsApp your team already uses.

### What you'll need before starting

- [ ] A Mac (any Apple Silicon M1 or newer — your MacBook, iMac, or Mac Mini)
- [ ] macOS 13 Ventura or newer (check: Apple menu > About This Mac)
- [ ] A phone number for WhatsApp (recommend a dedicated business number if you have one)
- [ ] An Anthropic account with API key — sign up free at [console.anthropic.com](https://console.anthropic.com)
- [ ] 30–45 minutes of uninterrupted time

---

## 01 | Install the Foundation 🛠️

Jordan, let's get the core software on your Mac. Open the **Terminal** app (press Cmd+Space, type "Terminal", press Enter).

### Step 1.1 — Install Xcode Command Line Tools

These are free Apple tools that OpenClaw needs to compile certain parts of itself.

```bash
xcode-select --install
```

A dialog will appear asking you to install. Click **Install** and wait for it to finish (~5 minutes).

**Verify it worked:**
```bash
xcode-select -p
```
You should see a path like `/Library/Developer/CommandLineTools`. If you do, you're good.

---

### Step 1.2 — Install Homebrew (Mac's package manager)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow any on-screen instructions — it will ask for your Mac password. After it finishes, it may print instructions to add Homebrew to your PATH. **Run those commands if shown** (they look like `echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc`).

**Verify it worked:**
```bash
brew --version
```
You should see `Homebrew 4.x.x` or similar.

---

### Step 1.3 — Install Node.js (version 24)

```bash
brew install nvm
```

After it installs, follow the output instructions to add nvm to your shell. Then:

```bash
nvm install 24
nvm use 24
nvm alias default 24
```

**Verify it worked:**
```bash
node --version
```
You should see `v24.x.x`.

> ⚠️ **WARNING:** OpenClaw requires Node 22 or 24. Do **not** use an older version. If you see v18 or v20, run `nvm use 24` to switch.

---

### Step 1.4 — Install OpenClaw

```bash
curl -fsSL https://get.openclaw.ai | bash
```

**Verify it worked:**
```bash
openclaw --version
```
You should see a version number like `openclaw/x.x.x`.

---

## 02 | Run the Setup Wizard 🧙

> 💡 **TIP:** The onboarding wizard does the heavy lifting — it creates your config file, connects to Anthropic, installs a background service so OpenClaw starts automatically when your Mac wakes up, and starts the gateway. This is the most important single command in this guide.

```bash
openclaw onboard --install-daemon
```

When the wizard asks:
- **Provider:** Choose **Anthropic API key**
- **API key:** Paste your key from [console.anthropic.com](https://console.anthropic.com) — it starts with `sk-ant-`
- **Model:** Accept the default (Claude Sonnet) or type `anthropic/claude-sonnet-4-6`
- **Channel:** You can skip for now — we'll add WhatsApp in the next section

**Verify it worked:**
```bash
openclaw gateway status
openclaw doctor
```

The gateway status should say **running**. The doctor should show all green checks. If anything is yellow or red, run:
```bash
openclaw doctor --fix
```

Open the dashboard to confirm:
```bash
openclaw dashboard
```
This opens `http://127.0.0.1:18789/` in your browser. You should see a green "Gateway: Healthy" indicator.

---

## 03 | Connect WhatsApp 📱

> ☕ **COFFEE SHOP INDUSTRY NOTE:**
> OpenClaw recommends using a **separate WhatsApp number** for your business assistant — a cheap SIM or a WhatsApp Business number. This keeps your personal chats completely separate from the AI assistant and avoids any accidental message loops.

### Step 3.1 — Install the WhatsApp plugin

```bash
openclaw plugins install @openclaw/whatsapp
```

**Verify it worked:**
```bash
openclaw channels status
```
WhatsApp should appear in the list (possibly showing "not linked" — that's fine for now).

---

### Step 3.2 — Configure WhatsApp access

Open your OpenClaw config file:
```bash
open ~/.openclaw/
```

In Finder, open `config.yaml` with TextEdit. Find (or add) the `channels` section and paste this — replacing the phone numbers with your actual numbers:

```yaml
channels:
  whatsapp:
    dmPolicy: "allowlist"
    allowFrom:
      - "+15551234567"   # YOUR personal number (E.164 format, e.g. +44... or +1...)
      - "+15559876543"   # Your business number if different
    groupPolicy: "allowlist"
    groupAllowFrom:
      - "+15551234567"   # Your number (can manage the assistant from groups)
    ackReaction:
      emoji: "👀"
      direct: true
      group: "mentions"
```

> ⚠️ **WARNING:** Phone numbers must be in **E.164 format** — that means country code + number with no spaces, e.g. `+447911123456` (UK) or `+12025551234` (US). OpenClaw will silently ignore incorrectly formatted numbers.

Save the file.

---

### Step 3.3 — Link your WhatsApp account (scan QR code)

```bash
openclaw channels login --channel whatsapp
```

A QR code will appear in your terminal. On your phone:
1. Open WhatsApp > Settings > Linked Devices
2. Tap "Link a Device"
3. Scan the QR code on your screen

**Verify it worked:**
```bash
openclaw channels status
```
WhatsApp should now show **linked** with your phone number.

---

### Step 3.4 — Start the gateway with WhatsApp

```bash
openclaw gateway restart
openclaw channels status
```

Both WhatsApp and the gateway should show active/linked. Send yourself a test message on WhatsApp — you should get a reply within a few seconds.

> ⚠️ **WARNING:** OpenClaw's WhatsApp channel uses Baileys (WhatsApp Web). **Use Node.js, not Bun**, as the runtime — Bun is flagged as incompatible for stable WhatsApp operation. The installer script handles this for you, but if you ever reinstall manually, use `node` commands only.

---

## 04 | Store Your API Key Safely 🔐

> 💡 **TIP (WHY THIS MATTERS):** Your Anthropic API key is like a credit card — anyone who has it can spend your money. Storing it in the macOS Keychain means it's encrypted by Apple's security chip and never sits in a plain-text file. This is worth doing before you forget.

```bash
openclaw secret set anthropic_key "sk-ant-YOUR_ANTHROPIC_API_KEY"
```

Now update your config to reference the secret instead of the raw key. In `~/.openclaw/config.yaml`, find the models section and change `api_key` to:

```yaml
models:
  - provider: anthropic
    api_key: ${{ secret.anthropic_key }}
    model: claude-sonnet-4-6
    priority: 1
    timeout: 60s
```

**Verify it worked:**
```bash
openclaw config validate
```
Should return: `config is valid`.

> ✅ **ACTION:** While you're here, enable FileVault disk encryption if it isn't already on — it protects all your credentials if your Mac is ever lost. Check: Apple menu > System Settings > Privacy & Security > FileVault.

---

## 05 | Install Skills — Safety First 🛡️

> ⚠️ **WARNING:** The ClawHavoc attack in February 2026 injected 1,184 malicious skills into the ClawHub registry. Always install `skill-vetter` **first** and run it before installing anything else. This is non-negotiable — it's free and takes 10 seconds per scan.

### Step 5.1 — Install skill-vetter FIRST

```bash
clawhub install skill-vetter
```

**Verify it worked:**
```bash
skill-vetter skill-vetter
```
Should return: `Benign` (yes, you can vet the vetter with itself).

---

### Step 5.2 — Install scheduling & WhatsApp skills

For each skill below, vet it first, then install:

#### Google Calendar + Gmail (`gog`)
This is your scheduling backbone — it reads and writes your Google Calendar so Jordan's assistant can check who's rostered, spot gaps, and create shift entries.

```bash
skill-vetter gog
clawhub install gog
```

**Verify it worked:**
```bash
openclaw skills list | grep gog
```

You'll need to authorise your Google Account (OAuth) when prompted. Have your Google account ready.

---

#### Apple Reminders (`apple-reminders`)
Creates reminders that sync to your iPhone automatically — great for "remind me to order oat milk at 4pm".

```bash
skill-vetter apple-reminders
clawhub install apple-reminders
```

**Verify it worked:**
```bash
openclaw skills list | grep apple-reminders
```

> 💡 **TIP:** `apple-reminders` requires macOS 14 Sonoma or newer. If you're on macOS 13 Ventura, skip this skill — you can use Google Tasks via `gog` instead.

---

#### WhatsApp Styling Guide (`whatsapp-styling-guide`)
Enforces clean, professional formatting on all messages the assistant sends to your team. No more walls of unformatted text.

```bash
skill-vetter whatsapp-styling-guide
clawhub install whatsapp-styling-guide
```

**Verify it worked:**
```bash
openclaw skills list | grep whatsapp-styling-guide
```

---

#### WhatsApp CLI (`whatsapp-cli`)
Lets the assistant draft and send WhatsApp messages hands-free — e.g., "Send the Monday roster to the staff group".

```bash
skill-vetter whatsapp-cli
clawhub install whatsapp-cli
```

**Verify it worked:**
```bash
openclaw skills list | grep whatsapp-cli
```

> ✅ **ACTION:** After installing all skills, run a full security scan:
> ```bash
> clawhub inspect gog
> clawhub inspect apple-reminders
> clawhub inspect whatsapp-styling-guide
> clawhub inspect whatsapp-cli
> ```
> Each should show no undeclared network calls or suspicious binaries.

---

## 06 | Set Up Automated Scheduling 📅

This is where the magic happens for your coffee shop, Jordan. We're going to set up three automated jobs that run while you're busy behind the counter.

> 💡 **TIP (WHY THIS MATTERS):** OpenClaw's built-in cron scheduler persists your jobs even across restarts. Jobs run inside the gateway — so as long as your Mac is awake and plugged in at the office, your roster reminders will fire on time, every time.

### Step 6.1 — Weekly roster reminder (Sunday evenings)

This sends a WhatsApp message to your team every Sunday at 6 PM with the week's schedule:

```bash
openclaw cron add \
  --name "Weekly Roster Reminder" \
  --cron "0 18 * * 0" \
  --tz "YOUR_TIMEZONE" \
  --session isolated \
  --message "Check the Google Calendar for this week's coffee shop roster. List each staff member and their shifts Mon-Sun in a clear, friendly WhatsApp message. End with: 'Reply with your name to confirm you've seen your shifts.'" \
  --announce \
  --channel whatsapp \
  --to "+15551234567"
```

Replace `YOUR_TIMEZONE` with your timezone (e.g. `Europe/London`, `America/New_York`, `Australia/Sydney`) and `+15551234567` with your WhatsApp number or staff group ID.

**Verify it worked:**
```bash
openclaw cron list
```
You should see "Weekly Roster Reminder" in the list with status `enabled`.

---

### Step 6.2 — Daily opening checklist (weekday mornings)

Sends you a quick checklist message at 6:30 AM on weekdays:

```bash
openclaw cron add \
  --name "Morning Opening Checklist" \
  --cron "30 6 * * 1-5" \
  --tz "YOUR_TIMEZONE" \
  --session isolated \
  --message "Generate today's coffee shop opening checklist: today's staff on shift (check calendar), any time-off requests, upcoming restocking reminders. Keep it short — 5 bullet points max. Format for WhatsApp." \
  --announce \
  --channel whatsapp \
  --to "+15551234567"
```

**Verify it worked:**
```bash
openclaw cron list
openclaw cron run <job-id-from-list>
```

Run it immediately to test — replace `<job-id-from-list>` with the ID shown in `cron list`. You should receive a WhatsApp message within 30 seconds.

---

### Step 6.3 — Gateway maintenance (daily 4 AM restart)

This prevents memory buildup on your Mac over long sessions:

```bash
openclaw cron add \
  --name "Daily Gateway Restart" \
  --cron "0 4 * * *" \
  --tz "YOUR_TIMEZONE" \
  --session main \
  --system-event "Gateway maintenance restart" \
  --wake next-heartbeat \
  --delete-after-run
```

Wait — this one should **not** delete after run since it's recurring. Edit it:

```bash
openclaw cron list
openclaw cron edit <job-id> --delete-after-run false
```

**Verify it worked:**
```bash
openclaw cron list
```
All three jobs should show as `enabled`.

---

## 07 | Write Your Assistant's Personality (SOUL.md) 🧠

SOUL.md is the file that tells your assistant who it is and how to behave. This is where you make it sound like *your* business, Jordan.

Create the file:

```bash
nano ~/.openclaw/SOUL.md
```

Paste this template (edit it to match your shop):

```markdown
# Coffee Shop Assistant — Identity & Rules

## Who I am
I am the AI assistant for [YOUR COFFEE SHOP NAME]. I help the owner and staff with scheduling, shift reminders, and answering routine questions. I am friendly, efficient, and keep messages short — staff are usually checking their phones between rushes.

## My priorities
1. Scheduling and roster management — always check Google Calendar before answering shift questions
2. Shift reminders — always format shifts clearly: Name | Day | Start–End time
3. Covering FAQs — opening times, Wi-Fi password, parking, allergen menu

## Tone
Warm, professional, brief. No jargon. Use WhatsApp-friendly formatting (bold for names, bullet points for lists). Never use ALL CAPS. Sign off messages with a coffee emoji ☕

## What I do NOT do
- I do not handle payroll or payment information
- I do not make scheduling changes without confirming with the owner first
- I do not share one staff member's personal details with another
```

Save with Ctrl+O, Enter, Ctrl+X.

**Verify it worked:**
```bash
openclaw config validate
openclaw gateway restart
```

Send yourself a WhatsApp message: "Who's working tomorrow?" — the assistant should check the calendar and reply.

---

## 08 | Sleep Management for Your Mac 💤

> ⚠️ **WARNING:** When your Mac goes to sleep, the gateway pauses and WhatsApp messages may be missed. For a coffee shop this matters most during morning rush hours — you want the assistant awake when your team is messaging about shift swaps.

**Best approach — keep your Mac awake during business hours using `caffeinate`:**

Add this to your login items or run it each morning:

```bash
# Keep Mac awake while OpenClaw gateway is running (stops when gateway stops)
caffeinate -i -w $(pgrep -f "openclaw") &
```

For a permanent fix, install [Amphetamine](https://apps.apple.com/us/app/amphetamine/id937984704) (free, Mac App Store) and set it to keep your Mac awake while Node is running.

**Configure heartbeat reconnection** (add to `~/.openclaw/config.yaml`):

```yaml
heartbeat:
  enabled: true
  interval: 300s
  timeout: 15s
  on_failure: restart_channel
```

**Verify it worked:**
```bash
openclaw gateway status
openclaw channels status
```
Both should show healthy/linked.

---

## 09 | Security Hardening 🔒

> ✅ **ACTION:** Complete all four of these security steps before telling anyone about your new WhatsApp assistant. An open assistant is a target.

### 9.1 — Enable sandbox mode

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

### 9.2 — Restrict tools to only what's needed

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

### 9.3 — Set autonomy to Tier 2 (NOTIFY)

Jordan, since you prefer to stay in the loop on decisions, we're keeping your assistant at **Tier 2 — NOTIFY**. This means it will tell you what it's about to do and wait for your confirmation before making any changes (like updating the calendar or sending a group message).

Add to `~/.openclaw/config.yaml`:

```yaml
autonomy:
  tier: 2          # NOTIFY — agent proposes, you approve
  notify_channel: whatsapp
  notify_to: "+15551234567"   # Your number
```

> ⚠️ **WARNING:** Do **not** set autonomy to Tier 4 (EXECUTE) for anything involving outbound messages to your staff, calendar modifications, or any financial operations. Tier 2 means you stay in control while still saving hours every week.

### 9.4 — Validate final config

```bash
openclaw config validate
openclaw doctor
```

All checks should pass. Fix any warnings with `openclaw doctor --fix`.

---

## 10 | Quick Reference Card 📋

| Task | Command |
|---|---|
| Check gateway is running | `openclaw gateway status` |
| View recent logs | `openclaw gateway logs -f` |
| Restart gateway | `openclaw gateway restart` |
| Run diagnostics | `openclaw doctor` |
| List cron jobs | `openclaw cron list` |
| Manually trigger a cron job | `openclaw cron run <job-id>` |
| Check WhatsApp link | `openclaw channels status` |
| Re-link WhatsApp | `openclaw channels login --channel whatsapp` |
| List installed skills | `openclaw skills list` |
| Update OpenClaw | `npm update -g openclaw` |
| Open dashboard | `openclaw dashboard` |
| Config file location | `~/.openclaw/config.yaml` |
| Dashboard URL | `http://127.0.0.1:18789/` |

---

## 11 | When You're Ready to Grow ⬆️

> ☕ **COFFEE SHOP INDUSTRY NOTE:**
> The coffee shop use case described in this guide costs approximately **$10–20/month** in Anthropic API fees at typical message volumes (50–150 messages/day). That's well under the 10–15 hours/week saved in scheduling admin. When you hit multiple locations, a Mac Mini (~$500) makes sense as a dedicated always-on server — see the Mac Mini setup guide at https://docs.openclaw.ai.

Signals it's time to upgrade:
- You're missing WhatsApp messages because your Mac is asleep overnight
- You open a second coffee shop location
- You want the assistant available 24/7, not just "when your Mac is on"

---

*Guide generated by the OpenClaw Setup Guide Creation Agent | 2026-03-26 | https://docs.openclaw.ai*
