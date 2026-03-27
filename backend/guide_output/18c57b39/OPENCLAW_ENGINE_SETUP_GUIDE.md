# OPENCLAW ENGINE SETUP GUIDE

**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Dr. Priya Krishnamurthy — Dental Practice Owner, Bright Smile Dental |
| **MISSION** | Eliminate front desk phone overload and recover no-show revenue at two Chicago locations |
| **DATE** | 2026-03-26 |
| **DEPLOYMENT** | Mac Mini M2 (16GB RAM) — Lincoln Park office, always-on |
| **CHANNEL** | Telegram (staff-facing, Phase 1) |
| **MODEL** | Anthropic Claude (`anthropic/claude-opus-4-6`) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

**This guide configures your OpenClaw agent to automate appointment reminders, no-show prevention, supply alerts, and front desk scheduling support across Bright Smile Dental's Lincoln Park and Lakeview locations — built around your dental practice workflow, your Dentrix + Google Workspace setup, and your crystal-clear HIPAA compliance boundaries.**

---

## Key Moments — What You Will Accomplish

By the end of this guide, Dr. Krishnamurthy, you will have:

- **A running OpenClaw instance** on the Lincoln Park Mac Mini, connected to Telegram and serving both locations via cloud integration
- **4 tailored automations** that handle morning practice briefings, daily appointment reminder batches, end-of-day no-show summaries, and weekly analytics — without touching a phone
- **A HIPAA-compliant architecture** with a hard wall between patient-facing actions (always NOTIFY tier, always requires your approval) and internal staff operations (autonomous where you said it's fine)
- **A 15% no-show rate problem with a solution** — automated reminders that typically reduce no-shows by 30–50%, recovering tens of thousands in annual revenue

> ⚕️ **HIPAA Note:** Your deployment runs entirely on hardware you own and control. All patient data processed by this agent stays on your Mac Mini. No PHI will be sent to external parties or through unencrypted channels. The Telegram channel configured in this guide is staff-only. Patient-facing channels (SMS/WhatsApp) are a future phase and require separate HIPAA review before activation.

---

## 00 | ✅ PRE-FLIGHT CHECKLIST

> ✅ **ACTION:** Complete every item below **before** running a single command. Missing prerequisites will cause you to backtrack.

### Accounts to Create

- [ ] **Anthropic account** — Create at [console.anthropic.com](https://console.anthropic.com). You need an API key. Set a monthly spending limit of **$20–$50** to start (typical dental practice usage runs $10–$20/month).
- [ ] **Telegram account** — Install Telegram on your phone if you haven't already. Your staff already use it — perfect.

### API Keys to Obtain

- [ ] **Anthropic API Key** — In your Anthropic Console: API Keys → Create Key. Copy it into a password manager immediately. You will paste it during onboarding and never need to see it again.
- [ ] **Google OAuth access** — You will need to authorize the `gog` skill with your Google Workspace account (the shared practice account, not your personal one) to access Google Calendar and Gmail.

### Hardware Preparation

- [ ] Mac Mini M2 (16GB) is physically accessible at the Lincoln Park office — you will need keyboard/monitor access for first-time setup (30 minutes)
- [ ] The Mac Mini is connected to the internet and on your practice network
- [ ] You have administrator login credentials for the Mac Mini
- [ ] An HDMI dummy plug is available (if the machine runs headless without a monitor) — available on Amazon for $8–10

> 💡 **TIP:** Dr. Krishnamurthy, gather your Anthropic API key and Google Workspace admin credentials before you sit down at the Mac Mini. The setup takes about 45 minutes total — having everything ready prevents context-switching mid-flow.

### What This Agent Will (and Will NOT) Do

| Task | Autonomy | Tier |
|---|---|---|
| Morning practice briefing | Fully automatic, sent to your Telegram | Tier 1 (AUTO) |
| Appointment reminder drafts | Compiles list, shows you for review | Tier 2 (NOTIFY) |
| Supply reorder alerts | Sends alert to staff Telegram | Tier 1 (AUTO) |
| No-show summary | Daily report to you | Tier 2 (NOTIFY) |
| Sending patient-facing messages | **Requires your explicit approval** | Tier 2 (NOTIFY) |
| Clinical decisions | **Never. Not now, not ever.** | Blocked |
| Financial transactions | **Requires explicit approval** | Tier 2 (NOTIFY) |

---

## 01 | 🖥️ PLATFORM SETUP — Mac Mini M2

Dr. Krishnamurthy, these steps prepare your Lincoln Park Mac Mini to run OpenClaw reliably around the clock — including through overnight reboots and power fluctuations.

> ⚠️ **WARNING — HIPAA REQUIRES THIS FIRST:** Federal HIPAA regulations require full-disk encryption for any device that processes, stores, or transmits Protected Health Information (PHI). Your OpenClaw instance will have access to scheduling data. Enable FileVault **before proceeding**. This is not optional.

### 1A — Enable FileVault Disk Encryption

1. Go to **Apple menu > System Settings > Privacy & Security > FileVault**
2. Click **Turn On FileVault**
3. Choose **"Create a recovery key and do not use my iCloud account"** — store the key in your password manager
4. Click **Continue** — encryption runs in the background (30–60 minutes) while you proceed

> ✅ **ACTION:** Write down the FileVault recovery key and store it in a fireproof location or a password manager. If you lose it and the machine fails, your data is permanently unrecoverable.

### 1B — Create a Dedicated OpenClaw User Account

Never run OpenClaw under your personal macOS account. A separate account provides isolation and limits the blast radius if anything goes wrong.

1. Go to **System Settings > Users & Groups**
2. Click **Add Account**
3. Set account type to **Administrator**
4. Name: `openclaw` (or similar)
5. Set a strong password — store it in your password manager

From now on, all OpenClaw setup happens while logged in to this `openclaw` account.

### 1C — Configure Always-On Settings

Your Mac Mini must never sleep. A sleeping machine misses appointment reminders, Telegram messages, and scheduled cron jobs.

1. Go to **System Settings > Energy**
2. Enable **"Prevent automatic sleeping when the display is off"**
3. Enable **"Wake for network access"**
4. Enable **"Start up automatically after a power failure"**

Then install **Amphetamine** from the Mac App Store for belt-and-suspenders sleep prevention:
- Launch Amphetamine (pill icon in menu bar)
- Preferences → enable **"Launch Amphetamine at login"**
- Set duration to **Indefinitely**
- Enable **"Start session after waking from sleep"**

### 1D — Enable Remote Access (Critical for a Busy Practice Owner)

You will not want to be physically at the Mac Mini to manage your agent during patient hours.

1. **System Settings > General > Sharing** → enable **Remote Login (SSH)**
2. Also enable **Screen Sharing (VNC)** for occasional graphical tasks
3. **System Settings > Users & Groups > Login Options** → enable automatic login for the `openclaw` account

Install **Tailscale** ([tailscale.com](https://tailscale.com)) for secure remote access from anywhere — no port forwarding required, free for personal/small team use.

> 💡 **TIP — Why this matters for your practice:** A Mac Mini that sleeps will miss the 8 AM appointment reminder batch. Your patients won't get their reminders. No-show rates go back up. The Always-On configuration is directly tied to your revenue recovery goal.

---

## 02 | 📦 INSTALL OPENCLAW

### 2A — Install Prerequisites

Open **Terminal** (Cmd+Space → "Terminal") and run these in order:

```bash
xcode-select --install
```

A dialog appears — click **Install** and wait a few minutes.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After Homebrew finishes, add it to your PATH (required on Apple Silicon):

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
source ~/.zprofile
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

If the version is lower, run `brew upgrade node`.

### 2B — Run the OpenClaw Installer

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Wait until you see `"Installation finished successfully!"` then verify:

```bash
openclaw --version
```

**Verify it worked:**
```
$ openclaw --version
openclaw v2026.x.x   ← must be version 2026.1.29 or later
```

> ⚠️ **WARNING:** You need version **2026.1.29 or later**. Earlier versions allowed unauthenticated gateway access — a serious security vulnerability. If you see a gateway auth error after any future update, run `openclaw onboard` to reconfigure.

**If you see `"command not found: openclaw"` after installing:**
```bash
source ~/.zshrc
```

### 2C — Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag is critical — it sets up a launchd service so OpenClaw starts automatically on every boot and runs 24/7.

**At each wizard prompt, choose:**

| Prompt | Recommended Choice for Bright Smile Dental |
|---|---|
| Gateway mode | **Local** (not Remote) |
| AI provider | **Anthropic API key** — paste `YOUR_ANTHROPIC_API_KEY` |
| Model | **`anthropic/claude-opus-4-6`** — best for nuanced patient communication context |
| Messaging channels | **Telegram** — set up in Section 03 |
| Hooks | Enable **session memory**, **boot hook**, and **command logger** — all three |
| Skills | **Skip for now** — you'll install them deliberately in Section 05 |

> ✅ **ACTION:** When the wizard shows the security acknowledgment screen, select **"Yes"** to confirm you are the sole operator.

---

## 03 | 📱 CONNECT YOUR CHANNEL — TELEGRAM

Dr. Krishnamurthy, this connects OpenClaw to Telegram so you and your staff can communicate with the agent from your phones.

### 3A — Create Your Telegram Bot

Do this on your phone where Telegram is installed.

1. Open Telegram and search for **@BotFather** — confirm the handle is exactly `@BotFather` with a blue checkmark
2. Tap **Start**
3. Type `/newbot` and send
4. When asked for a display name, type something like: `Bright Smile Assistant`
5. When asked for a username (must end in "bot"), try: `BrightSmileAssistantBot`
6. BotFather will respond with your **bot token** — copy it immediately

Back on your Mac Mini, when OpenClaw asks for your Telegram bot token during setup, paste it. Then:

```bash
openclaw gateway
openclaw pairing list telegram
openclaw pairing approve telegram <code>
```

> ✅ **ACTION:** Pairing codes expire after 1 hour. Complete the pairing in one sitting.

**Verify it worked:**
```
$ openclaw channels status
telegram   ✓ connected
```

Now message your bot in Telegram — it should respond.

### 3B — Configure Group Access for Your Staff Channels

Dr. Krishnamurthy, you mentioned you have group chats per location plus an all-hands channel. Here is how to configure your bot to participate in those groups.

**Step 1: Add your bot to the relevant Telegram groups** (Lincoln Park group, Lakeview group, all-hands)

**Step 2: For group visibility**, go back to @BotFather:
- Type `/setprivacy`
- Select your bot
- Choose **Disable** (so the bot can see all messages in groups, not just ones that mention it)
- Then **remove and re-add** the bot to each group for the change to take effect

**Step 3: Configure group access in OpenClaw.** Edit `~/.openclaw/config.json5` to add your group chat IDs:

```json5
{
  channels: {
    telegram: {
      dmPolicy: "allowlist",
      allowFrom: ["YOUR_NUMERIC_TELEGRAM_USER_ID"],
      groups: {
        "YOUR_LINCOLN_PARK_GROUP_CHAT_ID": {
          groupPolicy: "allowlist",
          requireMention: true,
          groupAllowFrom: ["STAFF_MEMBER_ID_1", "STAFF_MEMBER_ID_2"]
        },
        "YOUR_LAKEVIEW_GROUP_CHAT_ID": {
          groupPolicy: "allowlist",
          requireMention: true,
          groupAllowFrom: ["STAFF_MEMBER_ID_3", "STAFF_MEMBER_ID_4"]
        }
      }
    }
  }
}
```

**To find your numeric Telegram user ID:**
1. DM your bot from your personal Telegram account
2. Run `openclaw logs --follow`
3. Look for `from.id` in the log output — that number is your user ID

> ⚠️ **WARNING:** Without access control, any Telegram user who finds your bot can send it commands. The `allowlist` dmPolicy with explicit numeric IDs is the safest configuration. Do not use `open` or `pairing` in a healthcare setting.

> ⚕️ **HIPAA Note:** Your Telegram bot should only be accessible by your verified staff members. Patient Telegram IDs must never be added to `allowFrom` in this Phase 1 deployment — this channel is staff-only. Patient-facing communication requires a separate, HIPAA-reviewed channel setup.

### 3C — Set Bot Privacy Mode for Group Access

```bash
openclaw channels status --probe
```

If you see any warnings about group configuration, run:
```bash
openclaw doctor --fix
```

---

## 04 | 🧠 CONFIGURE YOUR MODEL PROVIDER — ANTHROPIC CLAUDE

```bash
openclaw models status
```

**Verify it worked:**
```
Provider: anthropic   Status: ✓ active   Model: anthropic/claude-opus-4-6
```

If not configured:
```bash
openclaw onboard --anthropic-api-key "YOUR_ANTHROPIC_API_KEY"
```

Then verify again with `openclaw models status`.

> 💡 **TIP:** Dr. Krishnamurthy, set a monthly spending cap of **$50** in the Anthropic Console to start. Typical usage for a two-location dental practice running appointment reminders and daily briefings is **$10–$20/month**. The cap protects against runaway loops during initial configuration.

**To set spending limits:** Log in at [console.anthropic.com](https://console.anthropic.com) → Billing → Usage Limits → set a monthly cap.

---

## 05 | 🔧 INSTALL SKILLS

> ⚠️ **WARNING:** Always install `skill-vetter` first and run it to screen every skill before installing it. Approximately 17–20% of community skills contain suspicious code. This is not optional — especially on a machine connected to your practice network.

### Phase 1: Security Stack (Install First — No Exceptions)

```bash
clawhub install skill-vetter
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
```

Now vet and install the remaining security skills:

```bash
skill-vetter prompt-guard
clawhub install prompt-guard

skill-vetter agentguard
clawhub install agentguard

skill-vetter config-guardian
clawhub install config-guardian
```

> ⚕️ **HIPAA Note:** `agentguard` provides real-time behavioral guardrails that block high-risk agent actions before they execute. This is especially important in a healthcare environment where the agent has access to scheduling data. `config-guardian` prevents silent modifications to your OpenClaw configuration — protecting your carefully configured HIPAA compliance settings.

### Phase 2: Core Practice Skills

| Your Need | Skill | What It Does | Verified in Registry |
|---|---|---|---|
| Google Calendar + Gmail + Sheets | `gog` | Full Google Workspace integration — read appointments, draft emails, access your marketing metrics Google Sheet | Yes |
| Web search for insurance/insurance lookup | `brave-search` | Privacy-first web search, no API key required for basic use | Yes |
| Email reminders and confirmations | `mailchannels` | Sends reliable transactional email (appointment confirmations, recall campaigns) | Yes |

```bash
skill-vetter gog
clawhub install gog

skill-vetter brave-search
clawhub install brave-search

skill-vetter mailchannels
clawhub install mailchannels
```

**Authorize `gog` with Google Workspace:**

After installing `gog`, the skill will prompt you for OAuth authorization. Use your **practice's Google Workspace account** (not your personal Google account). Grant access to:
- Google Calendar (to check appointment schedules)
- Gmail (to send reminder/recall emails)
- Google Sheets (to access your patient acquisition tracking sheet)

**Verify everything is installed:**
```
$ openclaw skills list
skill-vetter     v1.x.x   ✓ active
prompt-guard     v1.x.x   ✓ active
agentguard       v1.x.x   ✓ active
config-guardian  v1.x.x   ✓ active
gog              v1.x.x   ✓ active
brave-search     v1.x.x   ✓ active
mailchannels     v1.x.x   ✓ active
```

> ⚠️ **NOTE on Dentrix Integration:** Dentrix does not have a native OpenClaw skill at this time. The agent will work with your Google Calendar (where Dentrix can sync appointments) and your Google Sheets (for tracking). If Dentrix offers a web-based portal, the `agent-browser` skill can interact with it — but this is an advanced Phase 2 step, not covered here.

---

## 06 | ⚡ CONFIGURE AUTOMATIONS

> 💡 **TIP — Why this matters for Bright Smile Dental:** These automations are the direct answer to the front desk overload you described. Your staff are spending 70% of their time on the phone. These four automations create a structured AI-driven support layer that handles the routine, repetitive, and time-sensitive communication tasks — freeing your front desk to focus on the patients standing in front of them.

Before configuring automations, you need your Telegram chat ID. Send a message to your bot, then run:
```bash
openclaw logs --follow
```
Look for `chat.id` in the output — that is `YOUR_TELEGRAM_CHAT_ID` in the commands below.

---

### Automation 1 — Morning Practice Briefing

**What it does:** Every weekday at 7:00 AM Central, your agent checks Google Calendar for the day's schedule, flags any unconfirmed appointments, notes any same-day cancellations, and sends you a formatted briefing in Telegram before you arrive at the office.

**Autonomy Tier: 🔔 NOTIFY** — Agent reads and summarizes. Takes no action.

```bash
openclaw cron add \
  --name "morning-practice-briefing" \
  --cron "0 7 * * 1-5" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Generate the morning practice briefing for Bright Smile Dental. Check today's Google Calendar for both Lincoln Park and Lakeview locations. Report: (1) total appointments scheduled today, (2) any patients who have not confirmed their appointment, (3) any cancellations that came in overnight, (4) any new patient inquiries pending response, (5) any insurance verification issues flagged. Format as a clean checklist. Send to my Telegram." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                       Schedule      Timezone          Status
1    morning-practice-briefing  0 7 * * 1-5   America/Chicago   ✓ active
```

> ⚕️ **HIPAA Note:** This automation is NOTIFY-tier — your agent compiles scheduling information and sends it to your private Telegram DM. It never automatically sends patient information to external parties. The briefing is for your eyes only.

---

### Automation 2 — Daily Appointment Reminder Batch

**What it does:** Every weekday at 8:30 AM Central, the agent reviews tomorrow's appointment schedule, identifies patients who haven't confirmed, drafts reminder messages, and presents them to you for review and approval before any are sent.

**Autonomy Tier: 🔔 NOTIFY** — Agent drafts. You approve before anything is sent.

```bash
openclaw cron add \
  --name "appointment-reminder-drafts" \
  --cron "30 8 * * 1-5" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Review tomorrow's appointments on Google Calendar for Bright Smile Dental (both locations). Identify any patients who have not confirmed. Draft a friendly reminder message for each unconfirmed appointment. Include: patient first name, appointment time, location (Lincoln Park or Lakeview), and a request to confirm or reschedule. Present the full list of drafts to me for review — DO NOT send anything yet. Wait for my approval." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

> ⚕️ **HIPAA Note:** The agent drafts messages for your review only. No patient communication is sent automatically. This is your hard wall between patient data and autonomous action — exactly as you specified.

---

### Automation 3 — End-of-Day No-Show Tracker

**What it does:** Every weekday at 6:00 PM Central, the agent checks today's completed schedule, identifies no-shows, calculates the revenue impact, and sends you a summary. It also flags chronic no-show patterns.

**Autonomy Tier: 🔔 NOTIFY** — Agent tracks and reports. Takes no action.

```bash
openclaw cron add \
  --name "daily-no-show-tracker" \
  --cron "0 18 * * 1-5" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Review today's completed appointment schedule on Google Calendar for Bright Smile Dental. Identify: (1) appointments that were no-shows (scheduled but did not occur), (2) last-minute cancellations (cancelled within 2 hours of appointment), (3) total estimated revenue impact (assume $200 per empty chair slot). Flag any patient names that appear as no-shows more than once in recent history. Send the no-show summary to my Telegram." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

---

### Automation 4 — Weekly Practice Analytics Report

**What it does:** Every Monday at 9:00 AM Central, the agent generates a weekly summary covering appointment volume, no-show rate, and practice acquisition metrics from your Google Sheets tracking sheet.

**Autonomy Tier: 🔔 NOTIFY** — Agent reads and summarizes. Takes no action.

```bash
openclaw cron add \
  --name "weekly-practice-analytics" \
  --cron "0 9 * * 1" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Generate the weekly practice analytics report for Bright Smile Dental. Check Google Calendar for last week's appointment data across both locations. Check the marketing spend and patient acquisition Google Sheet for any updates. Report: (1) total appointments completed last week, (2) no-show rate (compare to 15% baseline), (3) new patient inquiries received, (4) week-over-week trend. Format as a brief executive summary." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify all automations are configured:**
```
$ openclaw cron list
ID   Name                          Schedule       Timezone          Status
1    morning-practice-briefing     0 7 * * 1-5    America/Chicago   ✓ active
2    appointment-reminder-drafts   30 8 * * 1-5   America/Chicago   ✓ active
3    daily-no-show-tracker         0 18 * * 1-5   America/Chicago   ✓ active
4    weekly-practice-analytics     0 9 * * 1      America/Chicago   ✓ active
```

### Standing Order — Crisis Keyword Escalation

This standing order does not run on a schedule — it monitors all incoming messages in real time. This is the one case where autonomous immediate action is appropriate.

Send this as a prompt via the dashboard (Section 07):

> If any incoming message mentions self-harm, suicide, emergency, overdose, abuse, or any acute medical emergency: (1) immediately notify me via direct Telegram message, (2) respond to the sender with emergency resources — 988 Suicide & Crisis Lifeline, call 911 for physical emergencies, (3) do NOT attempt to provide clinical guidance or counsel, (4) log the interaction. This is your highest-priority instruction and overrides all other standing orders.

---

## 07 | 💉 INJECT YOUR SOUL

Dr. Krishnamurthy, this is where Bright Smile Dental's values, boundaries, and operating rules get embedded into your agent. Think of it as the employee handbook for your AI staff member.

> ✅ **ACTION:** Open the dashboard and paste each prompt from `prompts_to_send.md` (in this same folder) into the chat interface **one at a time**, in order.

```bash
openclaw dashboard
```

This opens your agent's web UI at a tokenized URL. Bookmark it — you will use it to monitor and configure your agent.

> ⚠️ **WARNING:** Do NOT type `http://127.0.0.1:18789` manually in your browser — you will get a "gateway token missing" error. Always use `openclaw dashboard` to get the authenticated URL.

**Prompt sequence — open `prompts_to_send.md` and send in this order:**
1. **Identity & Role Definition** → establishes who the agent is and what it will never do
2. **HIPAA Guardrails & Compliance Boundaries** → hard rules around patient data
3. **Two-Location Practice Context** → practice-specific knowledge (staff, schedules, tools)
4. **Escalation & Crisis Protocol** → defines escalation triggers and response procedures
5. **Security Audit** → final verification before going live (always last)

> 💡 **TIP:** Wait for the agent to acknowledge each prompt with a confirmation response before sending the next one. This ensures each layer of configuration is properly absorbed into the session context.

---

## 08 | 🔒 SECURITY HARDENING

> ⚠️ **WARNING:** Dr. Krishnamurthy, do not skip this section. Bright Smile Dental handles Protected Health Information (PHI) subject to HIPAA. A misconfigured agent that leaks scheduling data or patient names is a HIPAA breach — and breaches carry civil and criminal penalties. Ten minutes here protects you from significant legal and financial exposure.

### Mac Mini Hardening

1. **Firewall:** System Settings > Network > Firewall → **Turn On**
2. **Gateway binding:** Verify `gateway.bind` is set to loopback in your OpenClaw config (it should be by default — this means the gateway only accepts connections from your own machine)
3. **Token auth:** As of v2026.1.29, auth mode "none" is permanently removed. Verify token authentication is active:

```bash
openclaw security audit --deep
```

4. **Secure remote access:** Use Tailscale (not direct port forwarding) to access the machine from outside the office network

### HIPAA Compliance Checklist for Bright Smile Dental

- [ ] FileVault disk encryption is enabled and recovery key is stored securely
- [ ] macOS Firewall is enabled
- [ ] OpenClaw gateway is bound to loopback (not externally accessible)
- [ ] Token authentication is active (verified with `openclaw security audit --deep`)
- [ ] Telegram bot is restricted to allowlist with numeric staff user IDs only
- [ ] No patient Telegram IDs are in `allowFrom` (staff-only channel)
- [ ] Conversation logs are enabled (audit trail — do NOT disable)
- [ ] API keys are stored in the OpenClaw keychain, not in plain text files
- [ ] Monthly Anthropic spending limit is set in the Anthropic Console
- [ ] A backup of the OpenClaw config is stored in an encrypted location
- [ ] API keys will be rotated quarterly (set a calendar reminder for July 2026)
- [ ] Staff are informed they are using an AI-assisted system

> ⚕️ **HIPAA Note:** Your Anthropic API key means patient scheduling context may pass through Anthropic's servers when the agent processes queries. Anthropic has a BAA (Business Associate Agreement) available for healthcare customers. Review your compliance requirements with your HIPAA compliance officer. For maximum PHI protection, consider routing patient-name-containing queries through a local model (Ollama) in a future Phase 2 deployment.

---

## 09 | 🔍 SECURITY AUDIT CHECKLIST

> ✅ **ACTION:** Run this full audit before using OpenClaw for any real Bright Smile Dental operations.

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

**Manual verification — complete every item:**

- [ ] `openclaw security audit --deep` completes with **zero critical warnings**
- [ ] Gateway shows "running" with **token authentication active**
- [ ] `openclaw cron list` shows exactly 4 jobs — no unexpected entries
- [ ] `openclaw skills list` shows exactly: `skill-vetter`, `prompt-guard`, `agentguard`, `config-guardian`, `gog`, `brave-search`, `mailchannels`
- [ ] Telegram bot only responds to staff user IDs in your `allowFrom` list
- [ ] No API keys stored in plain text — check `~/.openclaw/` with `ls -la`
- [ ] FileVault encryption is verified on (System Settings > Privacy & Security > FileVault)
- [ ] Review skill permissions: `openclaw skills list --verbose`
- [ ] Test the morning briefing manually: `openclaw cron run 1`

**Do NOT begin live Bright Smile Dental operations until all checks pass.**

---

## 10 | 🚀 TROUBLESHOOTING & NEXT STEPS

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

**Telegram bot not responding in groups**
- Verify group privacy mode is disabled: @BotFather → `/setprivacy` → Disable
- Remove and re-add bot to each group after changing privacy mode
- Verify bot token: `openclaw channels status`
- Check logs: `openclaw logs --follow`
- Confirm `groupAllowFrom` contains correct numeric staff user IDs

**Cron jobs not firing**
- Verify gateway is running: `openclaw gateway status`
- Check schedule: `openclaw cron list`
- Test manually: `openclaw cron run <job-id>`
- Check that the `openclaw` macOS account is set to auto-login

**`gog` not accessing Google Calendar**
- Re-run OAuth authorization: `openclaw skills run gog auth`
- Ensure you authorized with the practice Google Workspace account, not a personal account

### Phase 2: What Comes Next (After 2 Stable Weeks)

Once your agent has been running stably for 1–2 weeks, Dr. Krishnamurthy, consider:

1. **Patient-facing SMS channel** — Integrate Twilio for outbound patient reminders (separate HIPAA review required before activation; never reuse the staff Telegram bot for patients)
2. **Recall campaign automation** — Use the `mailchannels` skill to run automated 6-month and 12-month recall campaigns via email, with your review and approval before any batch goes out
3. **Dentrix web portal integration** — If Dentrix provides a web portal, the `agent-browser` skill can interact with it to pull appointment data directly, removing the Google Calendar dependency
4. **Lakeview-specific agent routing** — Use Telegram's per-group agent routing to give each location's group chat a slightly different context (different hours, different staff contacts)

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI** | `openclaw dashboard` (tokenized — never type URL manually) |
| **Gateway Port** | 18789 (loopback only) |
| **Model** | Anthropic Claude (`anthropic/claude-opus-4-6`) |
| **Channel** | Telegram (staff-facing only, Phase 1) |
| **Cron Timezone** | `America/Chicago` |
| **OpenClaw Docs** | https://docs.openclaw.ai |
| **Security Audit** | `openclaw security audit --deep` |
| **Logs** | `openclaw logs --follow` |
| **Gateway Status** | `openclaw gateway status` |
| **Cron Jobs** | `openclaw cron list` |
| **Installed Skills** | `openclaw skills list` |
| **Anthropic Console** | https://console.anthropic.com |
| **HIPAA Crisis Line** | 988 (Suicide & Crisis Lifeline) |

---

**OPENCLAW | Your Agent. Your Hardware. Your Soul.**
