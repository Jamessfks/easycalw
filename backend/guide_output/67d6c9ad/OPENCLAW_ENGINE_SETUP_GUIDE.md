# OPENCLAW ENGINE SETUP GUIDE

**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Solo Real Estate Agent — Austin, Texas |
| **MISSION** | Automate showing follow-ups, weekly market reports, and showing schedule management |
| **DATE** | 2026-03-26 |
| **DEPLOYMENT** | Mac Mini (dedicated, always-on) |
| **CHANNEL** | Telegram |
| **MODEL** | Anthropic Claude (claude-sonnet-4-6) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

**This guide configures your OpenClaw agent to handle showing follow-ups, generate weekly market reports for all 15 active clients, and manage your showing calendar — so you stop losing deals to missed follow-ups and double-bookings while driving between appointments in Austin.**

---

## 🎯 Key Moments — What You Will Accomplish

By the end of this guide, you will have:

- **A running OpenClaw instance** on your Mac Mini, connected to Telegram and ready for daily use — reachable from anywhere in Austin while you're in the field
- **3 tailored automations** that handle post-showing follow-ups, weekly market reports, and morning pipeline briefings without manual intervention
- **Industry-grade guardrails** ensuring your agent operates within Fair Housing Act and real estate compliance boundaries, never filtering leads by protected class characteristics

---

## 00 | ✅ PRE-FLIGHT CHECKLIST

> ✅ **ACTION:** Complete every item below **before** running a single command. Missing prerequisites will cause you to backtrack.

### Accounts to Create
- [ ] **Anthropic account** — Create at [console.anthropic.com](https://console.anthropic.com). You need an API key. Set a monthly spending limit of **$30–$50** to start (typical real estate agent usage is $15–$30/month).
- [ ] **Telegram account** — Install the Telegram app on your phone if you haven't already. You already have this.

### API Keys to Obtain
- [ ] **Anthropic API Key** — In the Anthropic Console: API Keys → Create Key. Copy and save it in your password manager.
- [ ] **Google OAuth credentials** — You'll need this for the `gog` skill to connect Gmail, Google Calendar, and Google Drive.

### Hardware & Software
- [ ] Mac Mini powered on and connected to the internet
- [ ] HDMI dummy plug inserted if running headless (no monitor) — prevents macOS display rendering issues
- [ ] Terminal access confirmed: press Cmd+Space on the Mac Mini, type "Terminal", press Enter
- [ ] Mac Mini has a **dedicated user account** for OpenClaw (separate from your personal account)

> 💡 **TIP:** Before starting, gather your Anthropic API key and store it in a password manager (1Password, Bitwarden, etc.). This prevents context-switching mid-setup when you're deep in a terminal session.

---

## 01 | 🖥️ PLATFORM SETUP

These steps prepare your Mac Mini to run OpenClaw reliably 24/7 — essential for catching showing requests and sending follow-ups even when you're in the field.

> ⚠️ **WARNING — Fair Housing Act:** Your OpenClaw agent must never filter, rank, or prioritize leads based on protected class characteristics (race, color, religion, national origin, sex, familial status, disability). Before going live, you will configure explicit guardrails in Section 07. Do not skip the guardrail injection prompts.

### 1A — Update macOS

Go to **Apple menu > System Settings > General > Software Update** and install all pending updates. Restart if prompted before continuing.

### 1B — Create a Dedicated OpenClaw User Account

In **System Settings > Users & Groups**, create a new Standard user account (e.g., "openclaw"). Run OpenClaw under this account, not your personal account. This gives it an isolated home directory and separate keychain.

### 1C — Configure Always-On Settings

> 💡 **TIP — Why this matters for you:** A Mac Mini that sleeps will miss your scheduled market report cron job and your Telegram messages will go unanswered while you're between showings. Configure these settings now.

Open **System Settings > Energy** and enable:
- "Prevent automatic sleeping when the display is off"
- "Wake for network access"
- "Start up automatically after a power failure"

Then install **Amphetamine** from the Mac App Store for more reliable sleep prevention:
1. Launch Amphetamine — it appears as a pill icon in the menu bar
2. Go to Preferences → enable "Launch Amphetamine at login"
3. Enable "Start session when Amphetamine launches" with duration set to **Indefinitely**
4. Enable "Start session after waking from sleep"

### 1D — Enable Remote Access

In **System Settings > General > Sharing**, enable:
- **Remote Login (SSH)** — your primary way to manage the machine remotely
- **Screen Sharing (VNC)** — for occasional graphical tasks

In **System Settings > Users & Groups > Login Options**, set the machine to automatically log in to your OpenClaw user account.

### 1E — Enable FileVault Disk Encryption

In **System Settings > Privacy & Security > FileVault**, turn on FileVault. This encrypts your entire disk — critical if anyone could physically access your Mac Mini at your office.

**Verify it worked:**
```
System Settings > Privacy & Security > FileVault
Status: FileVault is turned on   ✓
```

---

## 02 | 📦 INSTALL OPENCLAW

### 2A — Install Prerequisites

Open Terminal (switch to your OpenClaw user account first) and run:

```bash
xcode-select --install
```

A dialog will appear — click Install and wait a few minutes.

Then install Homebrew:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After Homebrew installs, add it to your PATH (required on Apple Silicon):

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Then install Node.js:

```bash
brew install node
```

**Verify it worked:**
```
$ node --version
v22.16.0   ← must be 22.16 or higher
```

If you see an older version, run `brew upgrade node`.

### 2B — Run the OpenClaw Installer

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Wait until you see "Installation finished successfully!"

**Verify it worked:**
```
$ openclaw --version
openclaw v2026.x.x   ← any version 2026.1.29 or later
```

> ⚠️ **WARNING:** You need version **2026.1.29 or later**. Earlier versions had gateway auth mode "none" which has been permanently removed — a real security gap. If you see a gateway auth error after an update, run `openclaw onboard` to reconfigure. If you followed an older YouTube tutorial that configured `auth: "none"`, your gateway will not start.

### 2C — Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag is critical — it sets up a launchd service so OpenClaw starts automatically on boot and runs 24/7. This is what keeps your market reports and follow-up automations firing even after a power outage.

**At each wizard prompt, choose:**

| Prompt | Recommended Choice |
|---|---|
| Gateway mode | **Local** (not Remote) |
| AI provider | **Anthropic API key** — paste your API key |
| Model | **`anthropic/claude-sonnet-4-6`** (best balance of quality and cost for real estate operations) |
| Messaging channels | **Telegram** — set up in Section 03 |
| Hooks | Enable **session memory**, **boot hook**, and **command logger** |
| Skills | **Skip for now** — you'll install skills deliberately in Section 05 |

> ✅ **ACTION:** When the wizard shows the security acknowledgment, select **"Yes"** to confirm you are the sole operator.

### 2D — Grant macOS Permissions

Go to **System Settings > Privacy & Security** and grant OpenClaw all three:
- **Full Disk Access** — so it can read and write files
- **Accessibility access** — so it can control apps
- **Screen Recording** — for browser automation tasks

**Verify everything is running:**
```bash
openclaw gateway status
openclaw doctor
openclaw health
```

**Verify it worked:**
```
$ openclaw gateway status
Gateway: running   auth: token   port: 18789   ✓
```

---

## 03 | 📱 CONNECT YOUR CHANNEL (TELEGRAM)

These steps connect your agent to Telegram so you can text it tasks from the field — between showings, from your car, at listing appointments.

### 3A — Create Your Telegram Bot

Do this on your phone where Telegram is already installed:

1. Open Telegram and search for **@BotFather** — look for the blue checkmark
2. Tap Start, then type `/newbot` and send it
3. When asked for a display name, choose something like "**AustinAgent**" or your preferred agent name
4. When asked for a username, it must end in "bot" — e.g., `austinagent_bot`
5. BotFather responds with your **bot token** — copy it now

Then configure the token in OpenClaw:

```bash
openclaw onboard --install-daemon
```

When prompted for channels, select **Telegram** and paste your bot token.

**Verify it worked:**
```
$ openclaw channels status
telegram   ✓ connected   bot: @austinagent_bot
```

### 3B — Pair Your Phone

```bash
openclaw pairing list telegram
openclaw pairing approve telegram <code>
```

Message your bot in Telegram — it should respond. Pairing codes expire after 1 hour.

### 3C — Lock Down Access (Critical)

> ⚠️ **WARNING:** Without this step, anyone who discovers your bot username can send it commands and potentially trigger automations or access your business data.

Switch from the default `pairing` policy to `allowlist` using your numeric Telegram user ID:

**Find your Telegram user ID:**
1. DM your bot in Telegram
2. Run `openclaw logs --follow` on the Mac Mini
3. Look for `from.id` in the log — that's your numeric user ID

Then update your config at `~/.openclaw/config.json5`:

```json5
{
  channels: {
    telegram: {
      dmPolicy: "allowlist",
      allowFrom: ["YOUR_NUMERIC_TELEGRAM_USER_ID"],
    },
  },
}
```

Restart the gateway to apply:

```bash
openclaw gateway stop && openclaw gateway start
```

**Verify it worked:**
```
$ openclaw channels status
telegram   ✓ connected   dmPolicy: allowlist
```

---

## 04 | 🧠 CONFIGURE YOUR MODEL PROVIDER (ANTHROPIC)

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

> 💡 **TIP:** Set a monthly spending cap in your Anthropic Console. Typical usage for a real estate agent running showing follow-ups + market reports + morning briefings is **$15–$30/month** with Claude Sonnet. Set your cap at **$50** to start — well above typical usage, but protected against runaway loops.

To set a cap: log into [console.anthropic.com](https://console.anthropic.com) → Billing → Usage limits → Set monthly cap.

---

## 05 | 🛠️ INSTALL SKILLS

> ⚠️ **WARNING:** Always install `skill-vetter` first and use it to screen every subsequent skill. Approximately 17–20% of community skills contain suspicious code — one ClawHavoc attack hit 99 of the top 100 most-downloaded skills via fake "update service" commands in skill page comments.

### Phase 1: Security Stack (Install First — No Exceptions)

```bash
clawhub install skill-vetter
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
```

Now vet and install prompt-guard:

```bash
skill-vetter prompt-guard
clawhub install prompt-guard
```

`prompt-guard` defends against prompt injection — the risk that a malicious listing description, email, or web page tries to hijack your agent. Critical when your agent is reading emails and market data.

### Phase 2: Core Real Estate Skills

| Your Need | Skill | What It Does |
|---|---|---|
| Gmail follow-ups, Google Calendar scheduling, Google Drive documents | `gog` | Full Google Workspace integration — Gmail, Calendar, Drive, Docs, Sheets in one skill |
| Weather for showing scheduling and open house planning | `weather` | Real-time weather and forecasts for any location — useful for Austin summer heat planning |
| Market data and listing research from the web | `web-scraper-as-a-service` | Structured web scraping for listing data, Zillow monitoring, market trends |

```bash
skill-vetter gog
clawhub install gog

skill-vetter weather
clawhub install weather

skill-vetter web-scraper-as-a-service
clawhub install web-scraper-as-a-service
```

After installing `gog`, you'll need to authorize it with your Google account:

```bash
openclaw skills run gog --auth
```

Follow the OAuth flow to connect Gmail, Google Calendar, and Google Drive.

**Verify it worked:**
```
$ openclaw skills list
skill-vetter              v1.x.x   ✓ active
prompt-guard              v1.x.x   ✓ active
gog                       v1.x.x   ✓ active
weather                   v1.x.x   ✓ active
web-scraper-as-a-service  v1.x.x   ✓ active
```

---

## 06 | ⏰ CONFIGURE AUTOMATIONS

> 💡 **TIP — Why this matters:** These three automations are the core of your new workflow. They replace the manual follow-up emails, market report pulling, and calendar juggling you described — the work that's currently consuming your evenings after a day of showings.

### Automation 1 — Morning Pipeline Briefing

**What it does:** Every weekday morning at 7:00 AM CT, your agent compiles a quick-scan briefing: today's showings with addresses and times, new leads from overnight, transaction deadlines this week, and Austin weather for outdoor showing conditions.

**Autonomy Tier: 🔔 NOTIFY** — Agent compiles and sends you a summary. Takes no autonomous action.

```bash
openclaw cron add \
  --name "morning-pipeline-briefing" \
  --cron "0 7 * * 1-6" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Generate today's briefing for a solo real estate agent in Austin, TX: (1) scheduled showings today with addresses and times from Google Calendar, (2) new leads received overnight, (3) transaction deadlines in the next 72 hours, (4) pending follow-ups due today, (5) Austin weather forecast. Format as a quick-scan list. Flag anything urgent." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                        Schedule        Timezone          Status
1    morning-pipeline-briefing   0 7 * * 1-6    America/Chicago   ✓ active
```

> 🏠 **Fair Housing Note:** This automation pulls your calendar and pipeline data. Ensure no leads are filtered, ranked, or prioritized by neighborhood, school district, or other proxy terms that could encode protected class characteristics. Your agent is configured in Section 07 to escalate any Fair Housing concerns immediately.

### Automation 2 — Post-Showing Follow-Up Drafter

**What it does:** Every evening at 8:00 PM CT, your agent reviews the day's showings from your Google Calendar, drafts personalized follow-up emails for each showing (buyer/buyer's agent), and sends you a batch for review before anything is sent.

**Autonomy Tier: 🔔 NOTIFY + DRAFT** — Agent drafts all emails and presents them to you. You approve before sending. Nothing goes to clients without your review.

```bash
openclaw cron add \
  --name "post-showing-followup-drafter" \
  --cron "0 20 * * *" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Review today's showings from Google Calendar. For each showing: (1) draft a personalized follow-up email to the buyer or buyer's agent — warm, professional tone, mention specific property details if available, include next steps, (2) for my listings that were shown today, draft a feedback request to the showing agent. Present ALL drafts to me for review. Do NOT send anything. Show me the drafts with a subject line and message body for each." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                          Schedule     Timezone          Status
2    post-showing-followup-drafter  0 20 * * *  America/Chicago   ✓ active
```

### Automation 3 — Weekly Market Reports for Active Clients

**What it does:** Every Monday morning at 9:00 AM CT, your agent generates personalized weekly market updates for your active clients — new listings, price trends, comparable sales in their target areas.

**Autonomy Tier: 🔔 NOTIFY + DRAFT** — Agent drafts all client reports and sends them to you for review. You decide what to forward.

```bash
openclaw cron add \
  --name "weekly-market-reports" \
  --cron "0 9 * * 1" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Generate weekly market update reports for active real estate clients in Austin, TX. For each active buyer client: summarize new listings from the past 7 days matching their criteria, price trends in their target neighborhoods, and any notable sales. For each active seller: days on market vs neighborhood average, showing count this week, price vs recent comparable sales. Draft personalized update emails for each. Show me ALL drafts before I send anything. Flag any listings that need price adjustment or urgent attention." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                     Schedule     Timezone          Status
3    weekly-market-reports    0 9 * * 1   America/Chicago   ✓ active
```

> 🏠 **Fair Housing Note:** Market reports must never describe neighborhoods using language that references race, religion, national origin, school district demographics, or other protected class proxies. If you see any such language in a draft, reject it and report the issue.

**Find Your Telegram Chat ID:**

To populate `YOUR_TELEGRAM_CHAT_ID` in the commands above:
1. Message your bot in Telegram
2. Run `openclaw logs --follow` on your Mac Mini
3. Look for `chat.id` in the log output — that's your chat ID (a long number)

Then update each cron job with `openclaw cron edit <job-id> --to "YOUR_ACTUAL_CHAT_ID"`.

---

## 07 | 💉 INJECT YOUR SOUL

> ✅ **ACTION:** Open `prompts_to_send.md` (in the same folder as this guide) and paste each prompt into the OpenClaw chat interface **one at a time**, in order. Wait for the agent to acknowledge each prompt before sending the next.

```bash
openclaw dashboard
```

This opens the web UI at `http://127.0.0.1:18789/` with your gateway token included. Bookmark it. Do not type the URL manually — you'll get a "gateway token missing" error.

**Prompt sequence:**
1. **Identity & Role Prompt** → establishes who the agent is, your business, Austin market focus
2. **Real Estate Guardrails Prompt** → Fair Housing compliance, CRM rules, client confidentiality
3. **Workflow & Tools Prompt** → how to handle showings, Follow Up Boss CRM, Google Calendar integration
4. **Security Audit Prompt** → final verification before going live

> 💡 **TIP:** Wait for the agent to acknowledge each prompt before sending the next. This ensures each layer of configuration is properly absorbed — particularly the Fair Housing guardrails, which must be active before your agent processes any client data.

---

## 08 | 🔒 SECURITY HARDENING

> ⚠️ **WARNING:** Do not skip this section. Your real estate business handles confidential client data, transaction details, and financial information. The Mac Mini sitting on your desk is an always-on server — it needs proper hardening.

### Mac Mini-Specific Hardening

**Enable macOS Firewall:**
Go to **System Settings > Network > Firewall** — turn it on.

**Verify gateway is loopback-bound:**
```bash
openclaw doctor
```

Confirm that `gateway.bind` is set to loopback (127.0.0.1) — this means the gateway only accepts local connections. Your Telegram bot is the external interface; the gateway itself should not be exposed.

**Install Tailscale for secure remote access:**
Tailscale ([tailscale.com](https://tailscale.com)) is free, secure, and requires no port forwarding. Install it to access your Mac Mini from anywhere in Austin without exposing it to the internet.

**Run the security audit:**
```bash
openclaw security audit --deep
openclaw security audit --fix
```

### Real Estate-Specific Compliance Checklist

- [ ] Telegram bot restricted to `allowlist` with only your numeric user ID (Section 03C)
- [ ] No client transaction details stored in plain text — check `~/.openclaw/`
- [ ] Agent configured with Fair Housing guardrails (Section 07, Prompt 2)
- [ ] Follow Up Boss / CRM credentials stored only in OpenClaw config, not in chat history
- [ ] Post-showing follow-up automation set to DRAFT mode — no emails sent without your review
- [ ] Weekly market reports set to DRAFT mode — no client emails sent without your review
- [ ] API key spending limit set in Anthropic console ($50/month cap)
- [ ] OpenClaw conversation logs retained for audit trail (default: enabled)
- [ ] API keys rotated quarterly (set a calendar reminder)
- [ ] FileVault disk encryption confirmed active (Section 01E)

---

## 09 | 🔍 SECURITY AUDIT CHECKLIST

> ✅ **ACTION:** Run this audit before using OpenClaw for real real estate operations — before it touches client data, CRM, or sends any communications.

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

**Manual verification — do not skip:**
- [ ] `openclaw security audit --deep` completes with **zero critical warnings**
- [ ] Gateway shows "running" with **token authentication active**
- [ ] `openclaw cron list` shows exactly 3 jobs — morning briefing, post-showing drafter, weekly market reports — and no unexpected entries
- [ ] `openclaw skills list` shows exactly: skill-vetter, prompt-guard, gog, weather, web-scraper-as-a-service
- [ ] Telegram bot responds **only to your account** — test by asking a friend to DM your bot (it should not respond)
- [ ] No API keys stored in plain text — run: `grep -r "sk-ant" ~/.openclaw/` (should return nothing)
- [ ] Fair Housing guardrails active — send a test message asking the agent to rank neighborhoods by demographics (it must refuse)
- [ ] Review skill permissions: `openclaw skills list --verbose`
- [ ] Post-showing drafter: confirm it presents drafts for review, does NOT auto-send

**Do NOT begin live real estate operations — processing real client data or CRM updates — until all checks pass.**

---

## 10 | 🆘 TROUBLESHOOTING & NEXT STEPS

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

**Telegram bot not responding**
- Verify bot token: `openclaw channels status`
- Check logs: `openclaw logs --follow`
- Confirm allowlist settings from Step 3C
- Pairing codes expire after 1 hour — re-pair if needed

**Cron jobs not firing**
- Verify gateway: `openclaw gateway status`
- Check schedule: `openclaw cron list`
- Test manually: `openclaw cron run <job-id>`
- Confirm Mac Mini is not sleeping (check Amphetamine is active)

**`gog` not connecting to Gmail/Calendar**
```bash
openclaw skills run gog --auth
```
Re-authorize the Google OAuth flow. Make sure you're authorizing with a Google account that has access to your business Gmail and Calendar.

**Gateway dies after config changes**
Edit `~/Library/LaunchAgents/ai.openclaw.gateway.plist` or run `openclaw doctor` — it often catches and fixes config-change restart issues automatically.

**High API costs**
- Check which cron jobs are consuming the most tokens: `openclaw cron runs --id <job-id>`
- Disable verbose logging
- Claude Sonnet is already the right cost-quality balance for your use case

### Next Steps After Stable Setup (Weeks 2–4)

Once you've run the system for 1–2 weeks:

1. **Add Follow Up Boss direct integration** — Check clawhub.ai for a FUB skill, or use the `composio` skill (860+ integrations) to connect Follow Up Boss via its REST API. This enables your agent to log showing notes and move leads between stages by text command.

2. **Voice notes workflow** — Install `whisper` + `ffmpeg` on your Mac Mini for voice-to-text. Send voice notes to your Telegram bot while driving between showings — your agent transcribes, parses the instruction, and executes (CRM update, draft email, schedule showing). This "screenless CRM management" is the killer feature for field agents.

3. **Context hygiene after Week 5** — After 5+ weeks, use separate Telegram channels per major workflow (active listings, buyer pipeline, transactions) to prevent context pollution across your 15 simultaneous listings.

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI URL** | `openclaw dashboard` (tokenized — don't type manually) |
| **Gateway Port** | 18789 |
| **Model Provider** | Anthropic (`anthropic/claude-sonnet-4-6`) |
| **Channel** | Telegram |
| **Cron Timezone** | `America/Chicago` (Austin, TX) |
| **OpenClaw Docs** | https://docs.openclaw.ai |
| **Security Audit** | `openclaw security audit --deep` |
| **Logs** | `openclaw logs --follow` |
| **Gateway Status** | `openclaw gateway status` |
| **Cron Jobs** | `openclaw cron list` |
| **Installed Skills** | `openclaw skills list` |
| **Manual Cron Test** | `openclaw cron run <job-id>` |
| **Find Chat ID** | `openclaw logs --follow` → look for `chat.id` |
| **Remote Access** | Install Tailscale for secure field access |

---

**OPENCLAW | Your Agent. Your Hardware. Your Soul.**
