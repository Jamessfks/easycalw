# OPENCLAW ENGINE SETUP GUIDE
**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Sarah |
| **MISSION** | Never miss a real estate lead again — instant email monitoring and response drafting delivered to your Telegram |
| **DATE** | March 26, 2026 |
| **DEPLOYMENT** | Existing Mac (Laptop) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

> **A note before you begin:** This guide is written step-by-step — you do not need to be technical to follow it. Each step tells you exactly what to type and what to expect. If something doesn't match what you see, there's a troubleshooting section at the end. Take it one section at a time.

---

## 00 | PRE-FLIGHT CHECKLIST

Complete these before you start. Check each box as you go.

- [ ] **Mac is running macOS 13 Ventura or newer.** (To check: click the Apple  menu → About This Mac → look at the macOS version)
- [ ] **Your Mac has at least 2 GB of free disk space.** (To check: Apple  → About This Mac → Storage)
- [ ] **You have a Telegram account.** (Download the Telegram app from the App Store if you haven't already — it's free)
- [ ] **You have an Anthropic account and API key.** Create one at https://console.anthropic.com — you'll need a credit card. Start with a $5 credit top-up.
- [ ] **You have your Anthropic API key copied.** It starts with `sk-ant-`. Keep it ready in a notes file.
- [ ] **You have a Tavily account and API key.** Sign up free at https://app.tavily.com. Your key starts with `tvly-`.
- [ ] **You have a Gmail account.** (You already use this — just have your Google login ready)
- [ ] **30 minutes of uninterrupted time.** Setup takes about 20-30 minutes total.

> **What you do NOT need:** Coding experience, a new computer, or any special software purchased in advance.

---

## 01 | PLATFORM SETUP

### What We're Setting Up

OpenClaw runs as a background program on your Mac. Think of it like a smart assistant that lives on your laptop, stays connected to your Telegram, and handles your emails while you're out showing homes.

**The trade-off with a laptop:** When your Mac goes to sleep (lid closed), OpenClaw pauses. When you open it again, it wakes back up within seconds and catches any messages that arrived while you were away. Telegram helpfully holds messages for you — no messages are lost. For most real estate agents working at a desk for 8+ hours a day, this works perfectly.

### Step 1.1 — Open Terminal

Terminal is how you'll type commands to set up OpenClaw. Don't worry — you only need to use it for setup, not daily use.

1. Press **⌘ + Space** (Command + Spacebar) to open Spotlight Search
2. Type `Terminal`
3. Press **Enter**
4. A window with a black or white background and a blinking cursor appears — this is Terminal

> **You'll be typing commands that look like:** `some-command --option "value"`
> Just type or paste them exactly as shown and press Enter after each one.

### Step 1.2 — Install Xcode Command Line Tools

This gives your Mac the tools it needs to run developer software. Type this command and press Enter:

```bash
xcode-select --install
```

A popup will appear asking you to install. Click **Install** (not "Get Xcode" — that's a large download you don't need). This takes 2-5 minutes.

If you see `"xcode-select: error: command line tools are already installed"` — great, skip to Step 1.3.

### Step 1.3 — Install Homebrew

Homebrew is a tool that makes installing software much easier. Paste this entire line into Terminal and press Enter:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

- It will ask for your Mac password (the one you use to log in) — type it and press Enter. You won't see the characters as you type — that's normal.
- Follow any on-screen instructions it gives at the end about adding Homebrew to your PATH.

If you see `"homebrew is already installed"` — skip to Step 1.4.

### Step 1.4 — Install Node.js

Node.js is the engine that runs OpenClaw. Install it by running these commands one at a time:

```bash
brew install nvm
```

After it finishes, **close Terminal completely and reopen it** (this is important — it applies the changes). Then run:

```bash
nvm install 24
nvm use 24
nvm alias default 24
```

Verify it worked:
```bash
node --version
```
You should see something like `v24.x.x`. If you do, Node.js is ready.

### Step 1.5 — Keep Your Mac Awake While Working (Laptop Tip)

Install the free Amphetamine app from the Mac App Store to prevent your Mac from sleeping while OpenClaw is running:

1. Open the App Store and search for **Amphetamine** (it's free)
2. Install it
3. Once installed, click the Amphetamine icon in your menu bar
4. Go to **Preferences → Triggers**
5. Create a new trigger: "While Node is running"
   - Condition: Application → "node" is running
   - Allow display to sleep: ✓ (saves power)
   - Allow sleep on battery after: 30 minutes

This keeps OpenClaw alive while your Mac is plugged in at your desk, and allows normal sleep when you unplug.

---

## 02 | INSTALL OPENCLAW

### Step 2.1 — Install OpenClaw

In Terminal, paste this command and press Enter:

```bash
curl -fsSL https://get.openclaw.ai | bash
```

This downloads and installs OpenClaw. It takes about 1-2 minutes.

### Step 2.2 — Verify the Installation

```bash
openclaw --version
```

You should see a version number like `OpenClaw v2026.x.x`.

### Step 2.3 — Store Your API Keys Securely

OpenClaw uses your Mac's built-in Keychain (your password manager) to store API keys safely. Run these commands one at a time, replacing the placeholder values with your actual keys (keep the quotes):

```bash
openclaw secret set anthropic_key "sk-ant-YOUR_KEY_HERE"
openclaw secret set tavily_key "tvly-YOUR_KEY_HERE"
```

You should see `✓ Secret stored: anthropic_key` and `✓ Secret stored: tavily_key` for each.

### Step 2.4 — Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

This interactive wizard walks you through setup. Here's what to do at each screen:

![Security Handshake](templates/images/image12.png)

**ACTION:** When asked about the security manifesto, select **"Yes"** to acknowledge. You are the sole operator.

![Model Provider Selection](templates/images/image11.png)

**ACTION:** Select **"Anthropic"** from the list of providers.

**ACTION:** When asked for your API key, type: `${{ secret.anthropic_key }}` — OpenClaw will read it from your Keychain.

![Model Selection](templates/images/image9.png)

**ACTION:** When asked to choose a model, select **`claude-sonnet-4-20250514`** — this is the best balance of quality and cost for real estate work.

**ACTION:** When asked about channels, select **"Skip"** — we'll set up Telegram in the next section.

**ACTION:** When asked about skills, select **"Skip"** — we'll install skills in Section 05.

![Hatching Agent](templates/images/image1.png)

**ACTION:** When the wizard finishes, select **"Open the Web UI"**.

### Step 2.5 — Verify Everything Works

Your browser should open to `http://127.0.0.1:18789` — this is your OpenClaw control panel.

![OpenClaw Web UI](templates/images/image6.png)

If the browser didn't open automatically:
```bash
openclaw dashboard
```

Also run a health check:
```bash
openclaw doctor
```

Everything should show green checkmarks. If something is red, see Section 10 (Troubleshooting).

### Step 2.6 — Configure the Gateway Restart Schedule

This configures an automatic 4 AM daily restart to keep OpenClaw running smoothly. Open your config file:

```bash
open ~/.openclaw/config.yaml
```

Add or update the `cron:` section at the bottom of the file:

```yaml
cron:
  - name: daily_restart
    schedule: "0 4 * * *"
    action: run_command
    command: "openclaw gateway restart"
```

Save the file (⌘S) and close TextEdit. Then restart the gateway:

```bash
openclaw gateway restart
```

---

## 03 | CONNECT YOUR CHANNEL (TELEGRAM)

You'll receive all of OpenClaw's updates — lead alerts, morning briefings, calendar summaries — directly in Telegram on your phone.

![Channel Selection](templates/images/image3.png)

**This section has its own detailed walkthrough:** Follow **[reference_documents/telegram_bot_setup.md](reference_documents/telegram_bot_setup.md)** to:
1. Create your Telegram bot with BotFather
2. Store the bot token securely
3. Find your Telegram user ID
4. Set up the security allowlist
5. Approve the pairing

**Come back here once Telegram says "Hello!" back to you.**

---

## 04 | CONFIGURE YOUR MODEL PROVIDER

If you used the onboarding wizard in Step 2.4, Anthropic is already configured. Let's verify and optimize the settings.

Open your config file:
```bash
open ~/.openclaw/config.yaml
```

Make sure your `models:` section looks like this (add or update as needed):

```yaml
models:
  - provider: anthropic
    api_key: ${{ secret.anthropic_key }}
    model: claude-sonnet-4-20250514
    priority: 1
    timeout: 60s
```

Save the file. Then restart the gateway to apply the change:
```bash
openclaw gateway restart
```

**About costs:** At typical real estate usage (50-100 messages per day, plus daily briefings), expect approximately **$15-30/month** in AI API costs. This is a fraction of the cost of a virtual assistant.

---

## 05 | INSTALL SKILLS

Skills are add-on tools that give OpenClaw new abilities — like reading your Gmail, checking your Google Calendar, or searching the web. We install security skills first, always.

### Step 5.1 — Install Security Skills First (Mandatory)

**ACTION:** Open your OpenClaw chat via the Web UI at `http://127.0.0.1:18789` (click the **Chat** tab). Paste each command below and wait for the confirmation before sending the next:

First, install and run the security scanner on each skill before installing it:

```
clawhub install skill-vetter
```

Wait for confirmation. Now use it to vet the next skills before installing them:

```
skill-vetter prompt-guard
```
```
skill-vetter agentguard
```

After vetting passes, install the security skills:
```
clawhub install prompt-guard
```
```
clawhub install agentguard
```

> **Why these first:** `skill-vetter` scans every skill before it touches your system. `prompt-guard` protects against malicious instructions hiding in emails or web pages your agent reads. `agentguard` is a circuit breaker that blocks dangerous actions before they run. Together, they form your minimum security stack.

### Step 5.2 — Install Core Skills for Real Estate

Now install the skills that power your day-to-day real estate work:

**Google Workspace (Gmail + Calendar + Drive):**
```
skill-vetter gog
```
```
clawhub install gog
```
When prompted, authorize with your Google account. This is what lets OpenClaw read your Gmail, check your calendar, and organize your Google Drive files.

**Web Search:**
```
skill-vetter tavily-web-search
```
```
clawhub install tavily-web-search
```
When prompted for a Tavily API key, run in Terminal:
```bash
openclaw secret set tavily_key "tvly-YOUR_KEY_HERE"
```

**Weather (for showing scheduling and open house planning):**
```
skill-vetter weather
```
```
clawhub install weather
```
No API key needed — ready to use immediately.

### Skills Installed Summary

| Skill | Slug | What It Does for You |
|---|---|---|
| Skill Vetter | `skill-vetter` | Security scanner — protects every future install |
| Prompt Guard | `prompt-guard` | Blocks malicious content in emails/web pages |
| Agent Guard | `agentguard` | Prevents dangerous actions before they happen |
| Google Workspace | `gog` | Reads Gmail leads, checks your calendar, accesses Drive |
| Web Search | `tavily-web-search` | Researches properties, neighborhoods, market data |
| Weather | `weather` | Checks conditions for showing days and open houses |

---

## 06 | CONFIGURE AUTOMATIONS

These cron jobs are scheduled tasks that run automatically and send updates to your Telegram. This is where the magic happens — OpenClaw will monitor your leads without you having to ask.

> **Important:** Before adding cron jobs, you need your Telegram Chat ID. Find it by:
> 1. Sending any message to your bot in Telegram
> 2. Running: `openclaw logs --follow` in Terminal
> 3. Looking for `chat.id` in the output — copy that number
> 4. Press Ctrl+C to stop
>
> Replace `<YOUR_TELEGRAM_CHAT_ID>` in the commands below with your actual chat ID number (it will be a long number like `123456789`).

### Automation 1 — Morning Lead Review (Weekdays, 7:00 AM)
**Tier 2 — NOTIFY:** Reviews overnight email leads and sends you a summary. You decide the next action.

```bash
openclaw cron add \
  --name "Morning Lead Review" \
  --cron "0 7 * * 1-6" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Check Gmail for any new lead inquiries received since yesterday evening. For each lead: summarize their name/contact info, what they're looking for, and rate urgency (hot = wants to move within 30 days, warm = 30-90 days, cold = browsing). Draft a warm, personalized response for each hot lead. Present everything as a clean bullet list I can scan in under 2 minutes." \
  --announce \
  --channel telegram \
  --to "<YOUR_TELEGRAM_CHAT_ID>"
```

### Automation 2 — Evening Email Catch-Up (Weekdays, 6:00 PM)
**Tier 2 — NOTIFY:** Catches any leads or important emails you may have missed during a busy showing day.

```bash
openclaw cron add \
  --name "Evening Email Catch-Up" \
  --cron "0 18 * * 1-5" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Review today's Gmail for any unanswered lead inquiries or time-sensitive messages. Flag anything that needs a response today vs. can wait until tomorrow. For urgent items, draft a brief reply. Show me a summary." \
  --announce \
  --channel telegram \
  --to "<YOUR_TELEGRAM_CHAT_ID>"
```

### Automation 3 — Weekly Pipeline Summary (Fridays, 5:00 PM)
**Tier 2 — NOTIFY:** A weekly wrap-up to help you plan the weekend and the following week.

```bash
openclaw cron add \
  --name "Weekly Pipeline Summary" \
  --cron "0 17 * * 5" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Generate a weekly summary: (1) New leads this week by source, (2) Follow-ups that are overdue, (3) Showings scheduled for next week from Google Calendar, (4) Any open house prep needed. Keep it concise — 1 page max." \
  --announce \
  --channel telegram \
  --to "<YOUR_TELEGRAM_CHAT_ID>"
```

### Verify Your Automations

```bash
openclaw cron list
```

You should see 3 jobs listed with their schedules. The daily gateway restart is managed separately in your config file (Step 2.6).

---

## 07 | INJECT YOUR SOUL

This is where your OpenClaw agent becomes *your* assistant — not a generic AI. You'll paste a series of initialization prompts into your OpenClaw chat.

**How to access the chat:**
- Open your browser to `http://127.0.0.1:18789`
- Click the **Chat** tab

Or simply send the prompts via your Telegram bot — whichever is easier.

**Instructions:** Paste each prompt from **`prompts_to_send.md`** into the chat, one at a time, in order. Wait for the agent to acknowledge each one before sending the next.

The prompts file contains 8 prompts in this order:
1. **Identity** — who your agent is and what it does
2. **Business Context** — your agency details
3. **Skills Installation** — confirms skill configuration
4. **Routines & Automations** — explains the scheduled tasks
5. **Guardrails & Safety** — what the agent must never do
6. **Personality & Style** — how the agent communicates with you
7. **Domain Workflows** — real estate-specific knowledge
8. **Security Audit** — final verification (send this last)

---

## 08 | SECURITY HARDENING

These steps protect your business data. Each takes under 2 minutes.

### 8.1 — Verify FileVault Is Enabled

FileVault encrypts your entire hard drive, protecting your client data and API keys if your Mac is ever lost or stolen.

```bash
fdesetup status
```

If it says **"FileVault is Off"**: Go to **System Settings → Privacy & Security → FileVault → Turn On FileVault**. Follow the prompts and save your recovery key somewhere safe.

If it says **"FileVault is On"** — you're good. ✓

### 8.2 — Verify Gateway Is Localhost-Only

Your OpenClaw gateway should only be accessible from your own Mac — never from the internet.

```bash
openclaw config validate
```

Confirm the output shows: `host: 127.0.0.1` (not `0.0.0.0`). If it shows `0.0.0.0`, open `~/.openclaw/config.yaml` and set `gateway.host: 127.0.0.1`.

### 8.3 — Confirm Allowlist Is Active

Only you should be able to message your bot. Verify:

```bash
openclaw gateway status
```

Look for `access.dm.mode: allowlist` — this means only your Telegram ID can interact with the agent.

### 8.4 — Restrict Tool Permissions

Paste this into your OpenClaw chat:

```
Review your current tool permissions and confirm that shell_exec is disabled. List all tools that are currently enabled.
```

If `shell_exec` appears as enabled, open `~/.openclaw/config.yaml` and add it to the deny list:

```yaml
tools:
  deny:
    - shell_exec
```

Then restart: `openclaw gateway restart`

### 8.5 — Enable Sandbox Mode

Open `~/.openclaw/config.yaml` and verify (or add) this section:

```yaml
sandbox:
  enabled: true
  mode: workspace
  workspace_root: ~/.openclaw/workspaces
  per_sender: true
```

Save and restart:
```bash
openclaw gateway restart
```

---

## 09 | SECURITY AUDIT CHECKLIST

Run this after completing all setup. Send this prompt to your OpenClaw agent via Telegram or the Web UI:

```
Please run the following security checks and report the results:
1. What tools do you currently have enabled? Is shell_exec disabled?
2. What skills are currently installed?
3. Is sandbox mode enabled?
4. Is my Telegram access restricted to allowlist mode?
Report any issues you find.
```

Also run from Terminal:
```bash
openclaw security audit --deep
```

Verify all of the following before using OpenClaw for real client work:

- [ ] `openclaw security audit --deep` completes with no critical warnings
- [ ] FileVault is enabled (`fdesetup status` → "FileVault is On")
- [ ] Gateway binds to `127.0.0.1` only (not exposed to the internet)
- [ ] Telegram dmPolicy is `allowlist` — only your chat ID can access the agent
- [ ] Skills installed: `skill-vetter`, `prompt-guard`, `agentguard`, `gog`, `tavily-web-search`, `weather`
- [ ] Cron jobs verified: `openclaw cron list` shows all 3 automations
- [ ] Daily gateway restart entry present in `~/.openclaw/config.yaml` under `cron:`
- [ ] No API keys stored in plain text (all stored via `openclaw secret set`)
- [ ] `shell_exec` is not in the enabled tools list

**Do not use OpenClaw for real client work until all boxes are checked.**

---

## 10 | TROUBLESHOOTING & NEXT STEPS

### Common Issues

| Symptom | What to Try |
|---|---|
| Gateway won't start | Run `openclaw doctor --fix` |
| Port 18789 already in use | Run `lsof -i :18789` to see what's using it |
| Telegram bot doesn't respond | Run `openclaw channel restart telegram` |
| "openclaw: command not found" | Close Terminal, reopen it, and try again. Or run `source ~/.zshrc` |
| Gmail not reading emails | Re-run the install: type `clawhub install gog` in your OpenClaw chat to re-authorize with Google |
| High memory usage | Run `openclaw gateway restart` |
| Mac wakes and bot is disconnected | Run `openclaw channel restart telegram` |
| Node.js version wrong | Run `nvm use 24` in Terminal |

### When Something Goes Wrong

```bash
# Run diagnostics
openclaw doctor --fix

# Check the logs for errors
openclaw gateway logs --level error -n 50

# Validate your config file
openclaw config validate
```

### Next Steps (Phase 2 Recommendations)

Once you're comfortable with your setup after 2-3 weeks, consider:

1. **Voice notes:** Install whisper + ffmpeg on your Mac to send voice notes to your agent while driving between showings. Your agent will transcribe and act on them — screenless CRM management from your car.

2. **Dedicated hardware:** If you find your Mac sleeping too often and missing leads, a Mac Mini (~$500 one-time) provides 24/7 uptime. Your entire config copies over in 5 minutes.

3. **Context separation:** After 4-5 weeks, create separate Telegram topics for: Leads, Active Listings, and Transactions. This prevents context pollution as your agent accumulates history.

4. **CRM integration:** If you use a CRM with a web interface (Follow Up Boss, kvCORE), ask about `playwright-mcp` for browser automation — it can update your CRM directly from voice commands.

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI URL** | `http://127.0.0.1:18789` |
| **Gateway Port** | 18789 |
| **Config File** | `~/.openclaw/config.yaml` |
| **Model Provider** | Anthropic (Claude Sonnet — `claude-sonnet-4-20250514`) |
| **Telegram Channel** | Configured in Section 03 |
| **Start Gateway** | `openclaw gateway start` |
| **Stop Gateway** | `openclaw gateway stop` |
| **Check Status** | `openclaw gateway status` |
| **Run Diagnostics** | `openclaw doctor` |
| **View Logs** | `openclaw gateway logs -f` |
| **List Cron Jobs** | `openclaw cron list` |
| **Update OpenClaw** | `npm update -g openclaw` |
| **Documentation** | https://docs.openclaw.ai |
| **Security Audit** | `openclaw security audit --deep` |

---

*OPENCLAW | Your Agent. Your Hardware. Your Soul.*
*Guide generated March 26, 2026 for Sarah's real estate agency, Austin, Texas.*
