# OPENCLAW ENGINE SETUP GUIDE
**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Dental Practice Owner — Chicago, IL |
| **MISSION** | Appointment reminders, patient Q&A, and daily schedule summaries across 2 locations |
| **DATE** | 2026-03-26 |
| **DEPLOYMENT** | Dedicated Mac Mini |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

## 00 | PRE-FLIGHT CHECKLIST

Complete these before you sit down at your Mac Mini. Nothing in the guide below will work until these are in place.

- [ ] **Anthropic account** — Create at [console.anthropic.com](https://console.anthropic.com). You will need an API key OR a Claude subscription to generate a setup-token.
- [ ] **Spending limit set** — In the Anthropic Console, set a monthly cap of $20–$50 before you do anything else. A misconfigured automation can burn through credits fast.
- [ ] **Telegram account** — Telegram must be installed on your phone. You will create a bot in a later step.
- [ ] **Google account for the Mac Mini** — Set up a dedicated Gmail address for OpenClaw (e.g., `chicago-dental-agent@gmail.com`). Do NOT use your personal Gmail. Share only the calendars and Drive files you want the agent to access.
- [ ] **HDMI dummy plug** — If the Mac Mini will run headless (no monitor), purchase an HDMI dummy plug (~$8–10 on Amazon). Without it, macOS permissions break in headless mode.
- [ ] **Apple ID for the Mac Mini** — Create a dedicated Apple ID for this machine. OpenClaw should not have access to your personal iCloud, photos, or keychain.
- [ ] **Dentrix credentials ready** — Have your Dentrix web portal login handy. The agent will use browser automation to check Dentrix when needed.

> ⚠️ **HIPAA Notice:** Your dental practice handles Protected Health Information (PHI). Before putting patient data through any AI system, consult your practice's compliance officer or attorney. This guide includes HIPAA-aware defaults, but it is not a substitute for professional compliance advice.

---

## 01 | PLATFORM SETUP (Mac Mini)

### Step 1 — Prepare macOS

Update your system first:
**Apple menu → System Settings → General → Software Update**
Install all available updates. Restart if prompted.

### Step 2 — Configure 24/7 Uptime

Your Mac Mini is dedicated to OpenClaw and must stay on around the clock.

Go to **System Settings → Energy** and enable:
- "Prevent automatic sleeping when the display is off"
- "Wake for network access"
- "Start up automatically after a power failure"

**Install Amphetamine** (free, Mac App Store) for extra reliability. After installing:
1. Launch it — a pill icon appears in your menu bar
2. Go to Preferences
3. Enable "Launch Amphetamine at login"
4. Enable "Start session when Amphetamine launches" → Duration: **Indefinitely**
5. Enable "Start session after waking from sleep"

### Step 3 — Create a Dedicated User Account

**Never run OpenClaw under your personal macOS account.**

Go to **System Settings → Users & Groups** and create a new Standard user (e.g., `openclaw-agent`). Run all OpenClaw operations under this account. This gives it an isolated home directory, its own keychain, and its own file permissions — separate from your personal data.

### Step 4 — Enable Remote Access

You will manage the Mac Mini remotely from your desk or phone.

In **System Settings → General → Sharing**, enable:
- **Remote Login** (SSH) — your primary remote management tool
- **Screen Sharing** (VNC) — for occasional graphical tasks

In **System Settings → Users & Groups → Login Options**, enable automatic login for the `openclaw-agent` account so the agent restarts automatically after a power cycle.

**Optional but recommended:** Install [Tailscale](https://tailscale.com) (free) for secure remote access without port-forwarding. You can then SSH to your Mac Mini from anywhere.

### Step 5 — Enable FileVault Disk Encryption

This is mandatory for a healthcare practice. If the Mac Mini is ever stolen, FileVault ensures no one can read your data.

Go to **System Settings → Privacy & Security → FileVault** and click **Turn On**. Encryption takes about 30 minutes on first run. **Do not skip this.**

### Step 6 — Install Xcode Command Line Tools

Open **Terminal** (Cmd+Space → type "Terminal") and run:

```bash
xcode-select --install
```

A dialog will appear — click Install and wait a few minutes.

### Step 7 — Install Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After it finishes, add Homebrew to your PATH (required on Apple Silicon):

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
source ~/.zprofile
```

Verify: `brew --version`

### Step 8 — Install Node.js

```bash
brew install node
```

Verify: `node --version` — you need **v22.16 or higher**. If older: `brew upgrade node`

---

## 02 | INSTALL OPENCLAW

**ACTION:** In Terminal, run the OpenClaw installer:

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Wait for "Installation finished successfully!" then verify:

```bash
openclaw --version
```

> ⚠️ You must be on version **2026.1.29 or later**. As of that version, gateway auth mode "none" has been permanently removed — authentication is now required. If you see errors about auth, run `openclaw onboard` to reconfigure.

---

## 03 | RUN THE ONBOARDING WIZARD

**ACTION:** Run the wizard with the daemon flag so OpenClaw starts automatically on every boot:

```bash
openclaw onboard --install-daemon
```

The wizard will ask you several questions. Here is what to select at each step:

| Wizard Step | What to Choose |
|---|---|
| **Gateway mode** | **Local** — you are running on the Mac Mini itself |
| **AI provider** | **Anthropic** — enter your API key or setup-token (see below) |
| **Model** | `anthropic/claude-sonnet-4-6` — excellent balance of quality and cost |
| **Messaging channels** | **Telegram** — set this up in the next section |
| **Hooks** | Enable all three: **boot hook**, **command logger**, **session memory** |
| **Skills** | **Skip for now** — you will install skills deliberately in Section 05 |

### Anthropic Authentication

You have two options:

**Option A — API Key (recommended for practices):**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Navigate to API Keys → Create Key
3. Paste the key when the wizard asks for it

**Option B — Claude Subscription (setup-token):**
```bash
# Run this on any machine where you have Claude Code installed:
claude setup-token
# Then paste the token into the wizard
```

![Model Provider Selection](templates/images/image11.png)

---

## 04 | CONNECT YOUR TELEGRAM CHANNEL

See the detailed walkthrough in [`reference_documents/telegram_bot_setup.md`](reference_documents/telegram_bot_setup.md).

**Quick summary of the steps:**

1. Open Telegram on your phone → search **@BotFather** (look for the blue checkmark)
2. Tap Start → send `/newbot`
3. Name your bot (e.g., "Chicago Dental Assistant") and create a username ending in `bot`
4. Copy the bot token BotFather gives you
5. Paste the token when the OpenClaw wizard asks for it
6. Run the pairing commands in Terminal:

```bash
openclaw pairing list telegram
openclaw pairing approve telegram <code>
```

![Channel Selection](templates/images/image3.png)

**After setup, lock down your bot's access policy.** For a single-owner bot, set `dmPolicy` to `allowlist` with your own Telegram user ID — this prevents anyone else from messaging your agent. Find your numeric Telegram ID by messaging your bot and running `openclaw logs --follow` to read the `from.id` field.

---

## 05 | INSTALL SKILLS

> ⚠️ **Security rule:** `skill-vetter` must be installed FIRST before any other skill. It scans skills for malicious code before granting them access to your machine.

**ACTION:** Install skills in this exact order in your Telegram chat (or the Web UI):

### Phase 1 — Security (install first, no exceptions)

```
clawhub install skill-vetter
```
After it installs, use it to vet each subsequent skill before installing:

```
skill-vetter prompt-guard
clawhub install prompt-guard

skill-vetter agentguard
clawhub install agentguard
```

### Phase 2 — Core Productivity

```
skill-vetter gog
clawhub install gog

skill-vetter weather
clawhub install weather

skill-vetter tavily-web-search
clawhub install tavily-web-search
```

### Phase 3 — Dental Practice Specific

```
skill-vetter agent-browser
clawhub install agent-browser

skill-vetter apple-reminders
clawhub install apple-reminders

skill-vetter mailchannels
clawhub install mailchannels
```

### Skill Summary

| Skill Slug | What It Does for Your Practice |
|---|---|
| `skill-vetter` | Scans all future skill installs for malicious code — your first line of defense |
| `prompt-guard` | Protects against prompt injection attacks hidden in patient emails or web pages |
| `agentguard` | Blocks the agent from taking dangerous actions you never authorized |
| `gog` | Full Gmail + Google Calendar + Drive integration — read schedules, draft messages, access docs |
| `weather` | Provides weather context useful for patient advisories and appointment planning |
| `tavily-web-search` | Researches patient questions about procedures, insurance, and care — from trusted sources |
| `agent-browser` | Browser automation to interact with Dentrix and other web-based portals |
| `apple-reminders` | Create and manage reminders natively on macOS — syncs to all your Apple devices |
| `mailchannels` | Send reliable transactional emails for appointment confirmations and reminders |

### Required API Keys

| Skill | Key Needed | Where to Get It |
|---|---|---|
| `gog` | Google OAuth (prompted on first use) | accounts.google.com |
| `tavily-web-search` | `YOUR_TAVILY_API_KEY` | [tavily.com](https://tavily.com) |
| `mailchannels` | `YOUR_MAILCHANNELS_API_KEY` | [mailchannels.com](https://mailchannels.com) |

---

## 06 | CONFIGURE AUTOMATIONS

After completing Step 07 (Inject Your Soul), come back and set up these automations. You need your Telegram chat ID first — get it by running `openclaw logs --follow` while messaging your bot, and reading the `chat.id` field.

Replace `YOUR_TELEGRAM_CHAT_ID` in all commands below with your actual chat ID.

### Automation 1 — Morning Practice Briefing
**Schedule:** Every weekday at 7:00 AM Chicago time
**Tier:** 2 — NOTIFY (summarizes and sends to you, takes no action)

```bash
openclaw cron add \
  --name "Morning Practice Briefing" \
  --cron "0 7 * * 1-5" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Generate today's dental practice briefing for both Chicago locations: list all appointments scheduled for today with patient names and appointment types, flag any patients who haven't confirmed, list any cancellations received overnight, note any pending intake requests, and highlight any insurance verification issues. Format as a clear checklist. Do not take any actions — summarize and report only." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

### Automation 2 — Appointment Reminder Check
**Schedule:** Every day at 8:30 AM Chicago time (including weekends for next-day prep)
**Tier:** 2 — NOTIFY (drafts reminders for your review, does not send them)

```bash
openclaw cron add \
  --name "Appointment Reminder Check" \
  --cron "30 8 * * *" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Check today's and tomorrow's appointments across both locations. For any patients who have not confirmed, draft a brief, friendly appointment reminder message. Show me the full list of drafted reminders before any are sent — do not send them automatically. Flag any patients with appointments in the next 2 hours who have not confirmed." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

### Automation 3 — End-of-Day Summary
**Schedule:** Every weekday at 5:30 PM Chicago time
**Tier:** 2 — NOTIFY (reports on the day, takes no action)

```bash
openclaw cron add \
  --name "End-of-Day Practice Summary" \
  --cron "30 17 * * 1-5" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Generate an end-of-day summary for the dental practice: appointments completed today, any no-shows, cancellations, new patient inquiries received, and any outstanding follow-up items for tomorrow. Note anything that requires my attention. Do not take any actions — report only." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

### Automation 4 — Weekly Practice Report
**Schedule:** Every Monday at 9:00 AM Chicago time
**Tier:** 2 — NOTIFY

```bash
openclaw cron add \
  --name "Weekly Practice Report" \
  --cron "0 9 * * 1" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Generate a weekly practice report for both locations: total appointments last week, no-show count, new patient inquiries, confirmed vs. unconfirmed appointment rates, and any notable patterns. Compare to the prior week if data is available. Report only — do not send anything to patients." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify your cron jobs were created:**
```bash
openclaw cron list
```

---

## 07 | INJECT YOUR SOUL

Your OpenClaw instance needs to know who it is, what practice it serves, and what the rules are. These prompts are the "soul" of your agent — paste each one into your Telegram bot (or the Web UI) one at a time, in order.

**Full prompt text is in [`prompts_to_send.md`](prompts_to_send.md).**

![Hatching Agent](templates/images/image1.png)

**ACTION:** Open the OpenClaw Web UI to send the initialization prompts:

```bash
openclaw dashboard
```

This opens a tokenized URL at `http://127.0.0.1:18789/` in your browser. Do NOT type the URL manually — use the command above.

![OpenClaw Web UI](templates/images/image6.png)

Paste prompts in this order:
1. **Prompt 1: Identity** — Who the agent is and what it does
2. **Prompt 2: Business Context** — Your practice details
3. **Prompt 3: Skills Installation** — Skill install commands (if not already done)
4. **Prompt 4: Routines & Automations** — Automation setup instructions
5. **Prompt 5: Guardrails & Safety** — HIPAA-aware behavior rules
6. **Prompt 6: Personality & Style** — Communication style
7. **Prompt 7: Domain Workflows** — Dental-specific procedures
8. **Prompt 8: Security Audit** — Final verification (always last)

Wait for the agent to acknowledge each prompt before sending the next.

---

## 08 | SECURITY HARDENING

### macOS Firewall

Go to **System Settings → Network → Firewall** and turn it on.

Verify your gateway is bound to loopback only (not exposed to the network):
```bash
openclaw config get gateway.bind
# Should return: 127.0.0.1
```

If not: `openclaw config set gateway.bind 127.0.0.1`

### Authentication

As of v2026.1.29, auth mode "none" has been permanently removed. Verify token auth is active:

```bash
openclaw gateway status
```

### Run the Security Audit

```bash
openclaw security audit --deep
openclaw security audit --fix
```

The `--fix` flag auto-tightens common misconfigurations.

### Healthcare-Specific Hardening

| Action | Why It Matters |
|---|---|
| FileVault enabled (Step 1.5) | Encrypts PHI stored on the Mac Mini — required for HIPAA compliance |
| Dedicated Apple ID and Gmail | Prevents agent from accessing your personal accounts |
| Separate OpenClaw user account | Isolates agent permissions from your personal data |
| `dmPolicy: "allowlist"` on Telegram | Prevents unauthorized parties from messaging your agent |
| All API keys in environment variables, not hardcoded | Prevents key exposure if config files are shared |
| Monthly API spending limits set | Prevents runaway costs from misconfigured automations |

### Remote Access Security

Use **Tailscale** for all remote access. Never expose SSH or VNC directly to the internet.

```bash
brew install tailscale
```

Follow [tailscale.com](https://tailscale.com) to connect your Mac Mini to your Tailscale network.

---

## 09 | SECURITY AUDIT CHECKLIST

Run these checks after completing setup and before using the agent for real practice operations.

```bash
# Step 1: Full security audit
openclaw security audit --deep

# Step 2: Verify gateway is running and authenticated
openclaw gateway status

# Step 3: Check installed skills match your expected list
openclaw skills list

# Step 4: Review all cron jobs and their schedules
openclaw cron list

# Step 5: Run doctor to catch misconfigurations
openclaw doctor
```

Manual checklist:

- [ ] `openclaw security audit --deep` shows no critical issues
- [ ] Gateway status shows "running" with authentication enabled
- [ ] Installed skills list matches exactly: `skill-vetter`, `prompt-guard`, `agentguard`, `gog`, `weather`, `tavily-web-search`, `agent-browser`, `apple-reminders`, `mailchannels`
- [ ] Cron list shows 4 jobs: Morning Briefing, Appointment Reminder Check, End-of-Day Summary, Weekly Report
- [ ] All 4 cron jobs are in timezone `America/Chicago`
- [ ] No API keys or tokens are visible in plain text in any config file
- [ ] FileVault is enabled and showing as "On" in System Settings
- [ ] macOS Firewall is enabled
- [ ] Telegram `dmPolicy` is set to `allowlist` with only your numeric user ID
- [ ] Monthly API spending cap is set in the Anthropic Console

> **Do NOT use the agent for real patient data until all checklist items are checked off.**

---

## 10 | TROUBLESHOOTING & NEXT STEPS

### Common Issues

| Problem | Fix |
|---|---|
| `command not found: openclaw` | Run `source ~/.zshrc` or open a new Terminal window |
| Gateway dies after restart | Run `openclaw doctor` — it catches and fixes common issues automatically |
| High API costs | Check which agents are consuming the most tokens; use cheaper models for sub-tasks |
| Telegram bot not responding | Run `openclaw gateway status`; if stopped, run `openclaw gateway start` |
| `auth: none` error | Run `openclaw onboard` to reconfigure gateway auth |
| Cron jobs not running | Verify `cron.enabled` is not false; check the Gateway is running continuously |
| `gog` Calendar not finding appointments | Verify the agent Gmail account has been shared access to your practice calendars |

### Next Steps (After You're Comfortable)

1. **Connect your actual Dentrix schedule to Google Calendar** — Export Dentrix appointments to a shared Google Calendar the `gog` skill can read. Check Dentrix documentation for calendar sync options.
2. **Add a second location channel** — You can create separate Telegram bots or group topics for each location to keep communications separate.
3. **Increase automation autonomy** — Once you trust the agent's behavior, you can upgrade automations from Tier 2 (NOTIFY) to Tier 3 (SUGGEST) for appointment confirmation workflows.
4. **Context management** — After about 5 weeks of heavy use, your agent's context can get cluttered. Create separate Telegram channels for different workflows (e.g., one for scheduling, one for patient Q&A).

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI URL** | `openclaw dashboard` (do not type URL manually) |
| **Gateway Port** | 18789 |
| **Model Provider** | Anthropic Claude (`anthropic/claude-sonnet-4-6`) |
| **Channel** | Telegram (Bot API) |
| **Timezone** | `America/Chicago` (all cron jobs) |
| **Security Audit** | `openclaw security audit --deep` |
| **Gateway Status** | `openclaw gateway status` |
| **Cron Jobs** | `openclaw cron list` |
| **Documentation** | [https://docs.openclaw.ai](https://docs.openclaw.ai) |
| **Anthropic Console** | [https://console.anthropic.com](https://console.anthropic.com) |
| **Homebrew** | [https://brew.sh](https://brew.sh) |
| **Tailscale** | [https://tailscale.com](https://tailscale.com) |

---

**OPENCLAW | Your Agent. Your Hardware. Your Soul.**
