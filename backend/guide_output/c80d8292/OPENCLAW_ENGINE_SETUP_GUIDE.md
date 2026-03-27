# OPENCLAW ENGINE SETUP GUIDE
**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Sarah — Solo Real Estate Agent, Austin TX |
| **MISSION** | Automate showing follow-ups, weekly market reports, and double-booking-proof scheduling |
| **DATE** | 2026-03-26 |
| **DEPLOYMENT** | Mac Mini (dedicated, always-on) |
| **CHANNEL** | Telegram |
| **MODEL** | Anthropic (Claude Sonnet) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

**You're juggling 15 active listings, dozens of follow-ups, and a showing schedule that keeps colliding — this guide wires up an AI agent on your Mac Mini that handles the admin so you can stay in the field closing deals.**

---

## 🎯 Key Moments — What You Will Accomplish

By the end of this guide, you will have:

- **A 24/7 running OpenClaw instance** on your Mac Mini, reachable from Telegram wherever you are — post-showing notes, CRM updates, and schedule checks from your phone while driving between properties
- **3 tailored automations** that fire every morning (daily briefing), every evening after showings (follow-up draft review), and every Friday afternoon (weekly pipeline + market report) — all without manual intervention
- **Real-estate-grade guardrails** ensuring your agent never sends a client email without your approval, never discusses commission, and escalates any Fair Housing concern immediately to you

---

## 00 | ✅ PRE-FLIGHT CHECKLIST

> ✅ **ACTION:** Complete every item below **before** running a single command. Missing prerequisites will cause you to backtrack.

### Accounts to Create / Confirm

- [ ] **Anthropic account** — Create at [console.anthropic.com](https://console.anthropic.com). You need an API key. Set a monthly spending limit of **$30–$50** to start (typical real estate usage runs $15–$30/month).
- [ ] **Telegram account** — Already installed on your phone. Good.
- [ ] **Google account for OpenClaw** — Create a **dedicated** Gmail/Google account (e.g. `yourname-agent@gmail.com`). This is the account OpenClaw will use for Gmail, Calendar, and Drive. Do **not** use your personal Google account.

### API Keys to Obtain

- [ ] **Anthropic API Key** — In the Anthropic Console: API Keys → Create Key. Copy and save it in 1Password or your preferred password manager.
- [ ] **Brave Search API Key** (optional but recommended) — Free basic tier at [brave.com/search/api](https://brave.com/search/api). Used for market research automation.

### Hardware & Software

- [ ] Mac Mini is plugged in and powered on
- [ ] You have a keyboard and display attached (or have Remote Login configured via SSH from another Mac)
- [ ] macOS is updated: Apple menu → System Settings → General → Software Update → install all pending updates
- [ ] Terminal app confirmed working: press Cmd+Space, type "Terminal", press Enter

> 💡 **TIP:** Sarah, gather all API keys in your password manager before starting. The setup wizard will ask for them one by one — having them ready prevents context-switching mid-install.

---

## 01 | 🖥️ PLATFORM SETUP

Sarah, these steps turn your Mac Mini into a reliable, always-on host for OpenClaw — the kind of machine that keeps answering your Telegram messages even when you're in the middle of a closing.

> ⚠️ **WARNING:** The Fair Housing Act prohibits filtering, prioritizing, or describing properties or leads based on protected class characteristics (race, religion, national origin, sex, familial status, disability). Your OpenClaw agent will be configured with explicit guardrails against this, but you remain legally responsible for all client communications sent through or drafted by the agent. Never skip the guardrails prompt in Section 07.

### 1A — Enable FileVault Disk Encryption

This encrypts your entire Mac Mini disk. If the machine is ever stolen, no one can read your client data, API keys, or agent memory files.

```bash
# Navigate to: Apple menu → System Settings → Privacy & Security → FileVault
# Click "Turn On…" and follow the prompts
# Save the recovery key to your password manager — do NOT lose it
```

**Verify it worked:** Go to System Settings → Privacy & Security → FileVault. It should show "FileVault is turned on."

> ⚠️ **WARNING:** FileVault takes 30–60 minutes to encrypt on first enable. Run this step first, then proceed while encryption runs in the background. Do not skip — your Follow Up Boss CRM data and client information live on this disk.

### 1B — Create a Dedicated OpenClaw User Account

Never run OpenClaw under your personal macOS account. A separate account gives it isolation — its own home directory, its own keychain, its own file permissions.

```bash
# Navigate to: System Settings → Users & Groups → Add Account
# Account type: Standard
# Full name: OpenClaw Agent
# Account name: openclaw
# Set a strong password and save it in your password manager
```

**Then log in as the `openclaw` user for all remaining steps in this guide.**

### 1C — Configure Always-On Settings

> 💡 **TIP:** Why this matters for you: a Mac Mini that sleeps will miss your 7am morning briefing cron job, and your Telegram messages will go unanswered while you're with clients. These settings prevent that.

Open **System Settings → Energy** and enable all three:
- "Prevent automatic sleeping when the display is off" → **ON**
- "Wake for network access" → **ON**
- "Start up automatically after a power failure" → **ON**

Then install **Amphetamine** from the Mac App Store for bulletproof sleep prevention:
1. Download Amphetamine (free) from the Mac App Store
2. Launch it — look for the pill icon in the menu bar
3. Preferences → "Launch Amphetamine at login" → **ON**
4. "Start session when Amphetamine launches" → **ON** (duration: Indefinitely)
5. "Start session after waking from sleep" → **ON**

### 1D — Enable Remote Login (SSH)

```bash
# System Settings → General → Sharing → Remote Login → Turn On
# This lets you manage the Mac Mini from your laptop or phone via SSH
```

Also enable **Screen Sharing** for occasional graphical tasks.

Enable **Auto Login** for your openclaw user: System Settings → Users & Groups → Login Options → Automatic login → select the `openclaw` account.

### 1E — Get an HDMI Dummy Plug (If Running Headless)

If you plan to disconnect the monitor after setup, buy an HDMI dummy plug ($8–10 on Amazon). Plug it into the HDMI port before removing the display. Without it, macOS behaves erratically in headless mode and screen capture breaks.

![Mac Mini Setup](templates/images/image1.png)

---

## 02 | 📦 INSTALL OPENCLAW

### 2A — Install Xcode Command Line Tools

Open Terminal and run:

```bash
xcode-select --install
```

A dialog will appear — click **Install** and wait a few minutes. This provides the compilers Homebrew needs.

**Verify it worked:**
```
$ xcode-select -p
/Library/Developer/CommandLineTools
```

### 2B — Install Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After it finishes, add Homebrew to your PATH (required on Apple Silicon M1/M2/M3/M4):

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
source ~/.zprofile
```

**Verify it worked:**
```
$ brew --version
Homebrew 4.x.x
```

### 2C — Install Node.js

```bash
brew install node
```

**Verify it worked:**
```
$ node --version
v22.16.0   ← must be 22.16 or higher
```

If you see an older version, run `brew upgrade node`.

### 2D — Run the OpenClaw Installer

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Wait until you see "Installation finished successfully!"

**Verify it worked:**
```
$ openclaw --version
openclaw v2026.x.x   ← any version 2026.1.29 or later
```

> ⚠️ **WARNING:** You need version **2026.1.29 or later**. Earlier versions had a security gap allowing unauthenticated gateway access. If you see a gateway auth error, run `openclaw onboard` to reconfigure. If you get a `sharp` install error, run: `SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g openclaw@latest`

### 2E — Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag is critical — it sets up a launchd service so OpenClaw starts automatically on boot and runs 24/7.

**At each wizard prompt, choose:**

| Prompt | Recommended Choice |
|---|---|
| Gateway mode | **Local** (not Remote) |
| AI provider | **Anthropic API key** — paste your key from the Anthropic Console |
| Model | **`anthropic/claude-sonnet-4-6`** (best balance of quality and cost for real estate operations) |
| Messaging channels | **Telegram** — you'll complete setup in Section 03 |
| Hooks | Enable **session memory**, **boot hook**, and **command logger** — all three |
| Skills | **Skip for now** — install deliberately in Section 05 |

![Security Handshake](templates/images/image12.png)

> ✅ **ACTION:** When the wizard shows the security acknowledgment, select **"Yes"** to confirm you are the sole operator.

### 2F — Grant macOS Permissions

OpenClaw needs three permissions. All are in **System Settings → Privacy & Security**:

1. **Full Disk Access** — Find Terminal (or the openclaw process) and enable it
2. **Accessibility** — Same location, enable for openclaw/Terminal
3. **Screen Recording** — Enable for openclaw/Terminal

> ✅ **ACTION:** After granting permissions, restart the gateway: `openclaw gateway stop && openclaw gateway start`

### 2G — Verify Everything Is Running

```bash
openclaw gateway status
openclaw doctor
openclaw health
```

**Verify it worked:**
```
Gateway: running   Auth: token   Port: 18789
Health: OK
```

Open the web dashboard:

```bash
openclaw dashboard
```

This opens `http://127.0.0.1:18789/` with a tokenized URL in your browser. Bookmark it. **Do not** type the URL manually — you'll get a "gateway token missing" error.

---

## 03 | 💬 CONNECT YOUR CHANNEL (TELEGRAM)

Sarah, this connects your agent to Telegram so you can message it from your phone while you're out showing properties — voice notes, quick CRM updates, schedule checks, all from the same app you already use.

### 3A — Create Your Telegram Bot

Do this on your phone where Telegram is already installed.

1. Open Telegram and search for **@BotFather** — look for the blue checkmark
2. Tap **Start**
3. Type `/newbot` and send
4. When asked for a display name, type something memorable — e.g. `Atlas RE` or `Friday`
5. When asked for a username, it must end in `bot` and be globally unique — e.g. `sarah_realestate_bot`
6. BotFather responds with a success message containing your **bot token** — copy it

> ✅ **ACTION:** Save the bot token in your password manager immediately. You will need it in the next step.

### 3B — Configure the Bot Token

On your Mac Mini, edit the OpenClaw config to add your bot token:

```bash
openclaw config set channels.telegram.botToken "YOUR_TELEGRAM_BOT_TOKEN"
openclaw config set channels.telegram.dmPolicy "pairing"
openclaw gateway restart
```

**Verify it worked:**
```
$ openclaw channels status
telegram   ✓ connected   bot: @sarah_realestate_bot
```

### 3C — Pair Your Phone

```bash
openclaw pairing list telegram
```

Now open Telegram on your phone, find your new bot, and send it any message (e.g. "hi"). Then back on the Mac Mini, approve the pairing:

```bash
openclaw pairing approve telegram <code>
```

The pairing code comes from the `openclaw pairing list telegram` output. Pairing codes expire after 1 hour.

**Verify it worked:** Send a message to your bot in Telegram and it should respond.

### 3D — Lock Down Access (Critical)

For a solo agent setup, switch from pairing mode to allowlist mode to make your access policy permanent and durable:

First, find your numeric Telegram user ID:
```bash
# Send a message to your bot, then:
openclaw logs --follow
# Look for "from.id" in the log output — that number is your Telegram user ID
```

Then lock it down:
```bash
openclaw config set channels.telegram.dmPolicy "allowlist"
openclaw config set channels.telegram.allowFrom '["YOUR_NUMERIC_TELEGRAM_USER_ID"]'
openclaw gateway restart
```

> ⚠️ **WARNING:** Without this step, anyone who discovers your bot's username can send it commands. Since your bot handles CRM data and can draft client emails, this lockdown is essential.

![Channel Selection](templates/images/image3.png)

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

> 💡 **TIP:** Sarah, set a monthly spending cap in the [Anthropic Console](https://console.anthropic.com) under Billing → Usage Limits. Typical usage for your workload (follow-up drafts, market reports, CRM updates) is **$15–$30/month** on Claude Sonnet. Setting a hard cap of $50 gives you headroom while protecting against runaway loops.

![Model Provider Selection](templates/images/image11.png)

---

## 05 | 🛠️ INSTALL SKILLS

> ⚠️ **WARNING:** Always install `skill-vetter` first and use it to screen every subsequent skill. Approximately 17–20% of community skills contain suspicious code — this is not theoretical, the ClawHavoc incident hit 99 of the top 100 most-downloaded skills. No exceptions to this order.

### Phase 1: Security Stack (Install First — No Exceptions)

```bash
clawhub install skill-vetter
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
```

Now vet and install the rest of your security stack:

```bash
skill-vetter prompt-guard
clawhub install prompt-guard

skill-vetter agentguard
clawhub install agentguard
```

> 💡 **TIP:** `skill-vetter` + `prompt-guard` + `agentguard` is your minimum viable security stack. `prompt-guard` specifically blocks prompt injection attacks — important because your agent will be reading emails and web content where malicious instructions could be embedded.

### Phase 2: Core Real Estate Skills

| Your Need | Skill | What It Does |
|---|---|---|
| Gmail + Google Calendar + Drive | `gog` | Reads/sends emails, checks/creates calendar events, manages Drive files — essential for showing scheduling and client communications |
| Web search for market data | `brave-search` | Privacy-first web search — pull neighborhood stats, comparable sales info, market news without Google tracking |
| Browser automation for Follow Up Boss | `agent-browser` | Navigates web interfaces — useful for CRMs and portals that don't have API access |
| Real-time weather for showings | `weather` | Instant weather checks — plan outdoor showings and open houses around Austin weather |

```bash
skill-vetter gog
clawhub install gog

skill-vetter brave-search
clawhub install brave-search

skill-vetter agent-browser
clawhub install agent-browser

skill-vetter weather
clawhub install weather
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter    v1.x.x   ✓ active
prompt-guard    v1.x.x   ✓ active
agentguard      v1.x.x   ✓ active
gog             v1.x.x   ✓ active
brave-search    v1.x.x   ✓ active
agent-browser   v1.x.x   ✓ active
weather         v1.x.x   ✓ active
```

### Post-Install: Authorize Google Workspace (gog)

```bash
openclaw skills run gog auth
```

Follow the OAuth flow — sign in with your **dedicated OpenClaw Google account** (not your personal one). Grant access to Gmail, Calendar, and Drive.

> 🏠 **Real Estate Note:** Use your dedicated OpenClaw Google account for all gog integrations. Never authorize it with your personal Google account — if the agent account is ever compromised, your personal data stays isolated.

---

## 06 | ⏰ CONFIGURE AUTOMATIONS

> 💡 **TIP:** Why this matters: these three automations replace the manual follow-up emails, market report pulls, and schedule reviews you described in your interview. Once set, they fire automatically whether you're at a showing, in a closing, or asleep.

All automations below are **Tier 2 (NOTIFY)** — your agent drafts, compiles, and shows you everything before taking any action. No emails are sent without your explicit review.

### Automation 1 — Morning Agent Briefing (Daily, 7am)

**What it does:** Every morning at 7am Austin time, your agent reviews your day: showing schedule, overnight Zillow/Realtor.com lead inquiries, transaction deadlines in the next 72 hours, pending follow-ups, and Austin weather. Delivered directly to your Telegram.

**Autonomy Tier: 🔔 NOTIFY** — Agent reads and summarizes. Takes no action without your instruction.

```bash
openclaw cron add \
  --name "Morning RE Briefing" \
  --cron "0 7 * * 1-6" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Generate today's real estate briefing for Sarah: (1) Showings scheduled today with property addresses and times, (2) New lead inquiries received since yesterday — rate each hot/warm/cold, (3) Transaction deadlines in the next 72 hours with property address and deadline type, (4) Pending follow-ups overdue or due today, (5) Austin TX weather forecast. Format as a quick-scan bulleted list. Do NOT send anything to clients." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                    Schedule        Timezone          Status
1    Morning RE Briefing     0 7 * * 1-6     America/Chicago   ✓ active
```

> 🏠 **Fair Housing Note:** This briefing automation reviews leads — ensure no lead categorization or prioritization in the prompt references protected class characteristics. The prompt above does not; keep it that way if you customize it.

### Automation 2 — Post-Showing Follow-Up Review (Daily, 8pm)

**What it does:** Every evening at 8pm, your agent reviews that day's showings and drafts follow-up messages to buyers/buyer agents. Shows you all drafts before sending anything.

**Autonomy Tier: 🔔 NOTIFY** — All drafts require your review and explicit send approval.

```bash
openclaw cron add \
  --name "Post-Showing Follow-Up Drafts" \
  --cron "0 20 * * *" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Review today's showings. For each showing: draft a professional follow-up message to the buyer or buyer's agent. Include: thank them for their time, note any feedback they shared, suggest logical next steps (second showing, offer timeline, questions answered). For my listings: compile any showing feedback received today. Present ALL drafts for my review — do NOT send anything. Wait for my approval." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                          Schedule    Timezone          Status
2    Post-Showing Follow-Up Drafts 0 20 * * *  America/Chicago   ✓ active
```

### Automation 3 — Weekly Pipeline & Market Report (Friday, 5pm)

**What it does:** Every Friday at 5pm, your agent generates a complete weekly summary: active listings with days-on-market and showing counts, pending transactions with next deadlines, leads by stage, and an Austin TX market snapshot. Delivered to Telegram for your weekend review.

**Autonomy Tier: 🔔 NOTIFY** — Report only. No actions taken.

```bash
openclaw cron add \
  --name "Weekly Pipeline & Market Report" \
  --cron "0 17 * * 5" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Generate Sarah's weekly real estate pipeline report: (1) Active listings — for each: address, list price, days on market, showings this week, any price reduction candidates, (2) Pending transactions — for each: address, current milestone, next deadline and date, responsible party, (3) Lead pipeline — counts by stage (hot/warm/cold/nurture), any leads that went cold this week, (4) Austin TX market snapshot — median price trend, inventory levels, notable sales this week. Compare key metrics to last week where possible. Format as an executive summary." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                           Schedule     Timezone          Status
3    Weekly Pipeline & Market Report 0 17 * * 5  America/Chicago   ✓ active
```

> ✅ **ACTION:** To find your Telegram Chat ID: send a message to your bot, then run `openclaw logs --follow` and look for `chat.id` in the output. Replace `YOUR_TELEGRAM_CHAT_ID` in all three cron commands above with that number.

---

## 07 | 🪄 INJECT YOUR SOUL

> ✅ **ACTION:** Open `prompts_to_send.md` (in the same folder as this guide) and paste each prompt into the OpenClaw chat interface **one at a time**, in order. Wait for the agent to acknowledge each prompt before sending the next.

```bash
openclaw dashboard
```

This opens your agent's web UI. You can also use Telegram directly — paste each prompt as a Telegram message to your bot.

**Prompt sequence:**
1. **Identity & Role** → establishes who the agent is and how it operates
2. **Business Context** → gives the agent your specific Austin TX market knowledge
3. **Skills & Integrations** → teaches the agent what tools it has and how to use them
4. **Automations & Routines** → explains the cron schedule and expected behaviors
5. **Guardrails & Safety** → sets hard limits and escalation triggers (Fair Housing, client communications)
6. **Personality & Style** → calibrates tone for your clients and workflow
7. **Security Audit** → final verification before going live

> 💡 **TIP:** Wait for the agent to acknowledge each prompt before sending the next. Responses like "Understood," "Got it," or "Configuration received" confirm the layer was absorbed.

![OpenClaw Web UI](templates/images/image6.png)

---

## 08 | 🔒 SECURITY HARDENING

> ⚠️ **WARNING:** Sarah, do not skip this section. Your real estate business handles confidential client data, transaction details, and communications subject to Fair Housing Act and Texas real estate licensing regulations. A misconfigured agent that leaks client information between transactions, or sends unauthorized communications, creates serious legal exposure.

### Mac Mini–Specific Hardening

**Enable the macOS Firewall:**
```bash
# System Settings → Network → Firewall → Turn On
```

**Verify gateway binds to loopback only (no external exposure):**
```bash
openclaw config get gateway.bind
# Should return: 127.0.0.1
# If not: openclaw config set gateway.bind "127.0.0.1"
```

**Verify token authentication is active:**
```bash
openclaw config get gateway.auth_mode
# Should return: token
# If it shows "none": openclaw onboard to reconfigure — auth_mode "none" was removed in v2026.1.29
```

**Set up Tailscale for secure remote access:**
```bash
# Install from: tailscale.com (free)
# Enables you to access your Mac Mini from anywhere without exposing ports
```

Run the security audit:
```bash
openclaw security audit --deep
openclaw security audit --fix
```

### Real Estate–Specific Compliance Checklist

- [ ] Dedicated OpenClaw Google account in use (not personal account)
- [ ] `gog` skill authorized only to the dedicated Google account
- [ ] Bot locked to your Telegram user ID (allowlist mode, Section 3D)
- [ ] No client information shared between separate buyer/seller conversations
- [ ] All client-facing email drafts require explicit approval before sending
- [ ] Follow Up Boss CRM access: agent uses read/write only for logging — no deleting contacts
- [ ] Anthropic API spending limit set in console ($50/month cap recommended)
- [ ] OpenClaw conversation logs retained (audit trail): `~/.openclaw/logs/`
- [ ] API keys stored only in OpenClaw config — never in plain text files
- [ ] API keys rotated quarterly (calendar reminder set)
- [ ] FileVault encryption confirmed active (Section 1A)

> 🏠 **Fair Housing Note:** Texas REALTORS and NAR Code of Ethics require equal professional service to all clients. Your agent's guardrail prompts (Section 07) explicitly prohibit filtering leads or describing properties using any protected class characteristic. Review the guardrails prompt in `prompts_to_send.md` before going live.

---

## 09 | 🔍 SECURITY AUDIT CHECKLIST

> ✅ **ACTION:** Run this audit before using OpenClaw for real client operations.

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
- [ ] `openclaw security audit --deep` completes with **0 critical warnings**
- [ ] Gateway shows "running" with token authentication active
- [ ] `openclaw cron list` shows exactly 3 jobs (Morning Briefing, Follow-Up Drafts, Weekly Report) — no unexpected entries
- [ ] `openclaw skills list` shows exactly: `skill-vetter`, `prompt-guard`, `agentguard`, `gog`, `brave-search`, `agent-browser`, `weather` — nothing else
- [ ] Telegram bot only responds to your account (test: have a friend try to message your bot — it should be ignored)
- [ ] No API keys in plain text: `grep -r "sk-ant" ~/.openclaw/` should return nothing
- [ ] `gateway.bind` is set to `127.0.0.1` (not `0.0.0.0`)
- [ ] `gateway.auth_mode` is `token` (not `none`)
- [ ] `openclaw skills list --verbose` — review permissions for each skill, no unexpected file system access
- [ ] macOS Firewall is ON (System Settings → Network → Firewall)
- [ ] FileVault is ON and encryption is complete (System Settings → Privacy & Security → FileVault)

**Do NOT begin live client operations until all checks pass.**

---

## 10 | 🚀 TROUBLESHOOTING & NEXT STEPS

### Common Issues

**"command not found: openclaw" after installing**
```bash
source ~/.zshrc
# Or open a new terminal window
```

**Gateway not responding**
```bash
openclaw doctor
openclaw gateway stop && openclaw gateway start
```

**Gateway dies after a config-change restart**
```bash
# Run doctor first — it often catches and fixes this automatically
openclaw doctor

# If that doesn't work, edit the plist:
# ~/Library/LaunchAgents/ai.openclaw.gateway.plist
# Then: openclaw gateway start
```

**Telegram bot not responding**
```bash
openclaw channels status
openclaw logs --follow
# Confirm allowFrom includes your Telegram user ID
# Confirm dmPolicy is "allowlist" or "pairing"
```

**Cron jobs not firing**
```bash
openclaw gateway status
openclaw cron list
openclaw cron run <job-id>  # manual test
```

**High API costs (runaway agent)**
```bash
# Check which sessions are consuming tokens
openclaw logs --follow
# Consider switching sub-tasks to Haiku: openclaw cron edit <job-id> --model "haiku"
```

**gog / Google auth issues**
```bash
openclaw skills run gog auth
# Re-authorize with the dedicated OpenClaw Google account
```

### Next Steps After Stable Setup

Once you've run the system for 1–2 weeks, Sarah, consider:

1. **Voice note workflow** — Install `whisper` + `ffmpeg` on your Mac Mini for transcription. Then voice-note instructions to OpenClaw from the car: "Move John Smith to nurture B, schedule follow-up Thursday 2pm." Your agent transcribes, parses, and confirms — screenless CRM management from the road.

2. **Monthly past-client touch-base** — Add a 4th cron job (`0 9 1 * *`, monthly) that generates personalized check-in messages for past clients with their neighborhood market update. Keeps you top-of-mind without manual effort.

3. **Context hygiene after week 5** — Real estate accumulates context fast. After 5 weeks, set up separate Telegram topics for: active listings, buyer pipeline, transactions, and marketing. This prevents information from one client's negotiation bleeding into another's context.

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI URL** | `openclaw dashboard` (tokenized — don't type manually) |
| **Gateway Port** | 18789 |
| **Model Provider** | Anthropic (`anthropic/claude-sonnet-4-6`) |
| **Channel** | Telegram |
| **Cron Timezone** | `America/Chicago` (Austin TX = Central Time) |
| **OpenClaw Docs** | https://docs.openclaw.ai |
| **Security Audit** | `openclaw security audit --deep` |
| **Logs** | `openclaw logs --follow` |
| **Gateway Status** | `openclaw gateway status` |
| **Cron Jobs** | `openclaw cron list` |
| **Installed Skills** | `openclaw skills list` |
| **Anthropic Console** | https://console.anthropic.com |
| **Tailscale (remote access)** | https://tailscale.com |
| **Amphetamine (sleep prevention)** | Mac App Store |

---

**OPENCLAW | Your Agent. Your Hardware. Your Soul.**
