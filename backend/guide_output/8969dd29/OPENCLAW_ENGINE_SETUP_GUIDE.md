# OPENCLAW ENGINE SETUP GUIDE
**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Dental Practice Owner, Chicago IL |
| **MISSION** | Automate appointment reminders & daily schedule summaries across two locations |
| **DATE** | 2026-03-26 |
| **DEPLOYMENT** | Dedicated Mac Mini (24/7) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

> **⚕️ HEALTHCARE NOTICE:** This guide configures OpenClaw for a dental practice environment. Appointment data and patient names that pass through the agent may constitute Protected Health Information (PHI) under HIPAA. This guide includes HIPAA-relevant configuration steps. Read Section 08 before going live.

---

## 00 | PRE-FLIGHT CHECKLIST

Complete every item on this list **before** running a single command. Missing prerequisites will cause you to backtrack.

### Accounts to Create
- [ ] **Anthropic account** — Create at [console.anthropic.com](https://console.anthropic.com). You need an API key (`sk-ant-...`). Set a monthly spending limit of **$20–$50** to start.
- [ ] **Telegram account** — Install the Telegram app on your phone if you haven't already.

### API Keys to Obtain
- [ ] **Anthropic API Key** — In the Anthropic Console: API Keys → Create Key. Copy and save it somewhere secure.

### Hardware & Software
- [ ] Dedicated Mac Mini is powered on and connected to your network
- [ ] Mac Mini is running macOS Sequoia (15.x) or later — check via **Apple menu > About This Mac**
- [ ] You have physical or remote (SSH) access to the Mac Mini's Terminal
- [ ] If running headless (no monitor): you have an **HDMI dummy plug** ($8–10 on Amazon) plugged into the HDMI port — without it, macOS Screen Recording permissions break in headless mode

### Before You Start — Create a Dedicated User Account
> **Important:** Do not run OpenClaw under your personal macOS account. Create a separate account for it.

1. Go to **System Settings > Users & Groups**
2. Click the **+** button to add a new user
3. Set Account Type to **Administrator**, name it something like `openclaw` or `agentuser`
4. Log into that new account before proceeding with Steps 01–10 below

---

## 01 | PLATFORM SETUP

These steps prepare your Mac Mini to run OpenClaw reliably around the clock.

### 1A — Enable FileVault Disk Encryption
> **HIPAA requirement:** Full-disk encryption protects patient appointment data if the machine is ever physically stolen.

1. Open **System Settings > Privacy & Security > FileVault**
2. Click **Turn On FileVault**
3. Choose "Allow my iCloud account to unlock my disk" or save the recovery key in a secure password manager
4. Click **Continue** — encryption runs in the background and takes ~30 minutes

### 1B — Configure Always-On Power Settings
1. Go to **System Settings > Energy**
2. Enable **"Prevent automatic sleeping when the display is off"**
3. Enable **"Wake for network access"**
4. Enable **"Start up automatically after a power failure"**
5. *(Recommended)* Install **Amphetamine** from the Mac App Store for bulletproof sleep prevention:
   - After install, click the pill icon in the menu bar → Preferences
   - Enable "Launch Amphetamine at login"
   - Set duration to **Indefinitely**
   - Enable "Start session after waking from sleep"

### 1C — Enable Remote Access (SSH)
Since this is a dedicated machine, you'll manage it remotely.

1. Go to **System Settings > General > Sharing**
2. Enable **Remote Login (SSH)** — this is your primary management method
3. Enable **Screen Sharing** — for occasional graphical tasks
4. Go to **System Settings > Users & Groups** and enable **automatic login** for your `openclaw` user

### 1D — Grant OpenClaw Its Own Credentials
- Set up the Mac Mini with its **own Apple ID** (not your personal one)
- Create a **dedicated Gmail account** for OpenClaw operations (e.g., `yourpractice-agent@gmail.com`)
- Share only specific Google Calendars and Gmail labels with this account — do not give it access to your main personal Google account

---

## 02 | INSTALL OPENCLAW

### 2A — Install Xcode Command Line Tools
Open **Terminal** (Cmd+Space → "Terminal") and run:

```bash
xcode-select --install
```

A dialog will appear — click **Install** and wait 2–3 minutes.

### 2B — Install Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After it finishes, add Homebrew to your PATH (required on Apple Silicon M1/M2/M3/M4):
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
source ~/.zprofile
```

Verify: `brew --version`

### 2C — Install Node.js
```bash
brew install node
```

Verify you have v22.16 or higher:
```bash
node --version
```

If the version is lower than 22.16, run: `brew upgrade node`

### 2D — Run the OpenClaw Installer
```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Wait for "Installation finished successfully!" then verify:
```bash
openclaw --version
```

> **Critical:** You need version **2026.1.29 or later**. Earlier versions allowed `auth: "none"` — this has been permanently removed. If you see a gateway auth error after updates, run `openclaw onboard` to reconfigure.

### 2E — Run the Onboarding Wizard
```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag installs a launchd service so OpenClaw starts **automatically on every boot** — essential for a 24/7 dedicated machine.

**At each wizard prompt, choose:**

| Prompt | Recommended Choice |
|---|---|
| Gateway mode | **Local** (not Remote) |
| AI provider | **Anthropic** — paste your API key (`sk-ant-...`) |
| Model | **`anthropic/claude-sonnet-4-6`** (best balance of quality and cost for practice operations) |
| Messaging channels | **Telegram** — set up in Section 03 |
| Hooks | Enable **session memory** (saves context before context window fills), enable **boot hook** and **command logger** |
| Skills | **Skip for now** — you'll install skills deliberately in Section 05 |

![Security Handshake](templates/images/image12.png)

**ACTION:** When the wizard shows the security acknowledgment, select **"Yes"** to confirm you are the sole operator.

---

## 03 | CONNECT YOUR CHANNEL (TELEGRAM)

### 3A — Create Your Telegram Bot
Do this on your phone where Telegram is installed:

1. Open Telegram and search for **@BotFather** (look for the blue verified checkmark — there are fakes)
2. Tap **Start**, then type `/newbot` and send it
3. BotFather asks for a **display name** — choose something like "ChicagoDental Agent" or "Practice Scheduler"
4. BotFather asks for a **username** — must end in `bot` and be globally unique (e.g., `chicagodental_bot`)
5. BotFather replies with your **bot token** — a long string like `1234567890:ABCdef...`

> **Save your bot token.** You will paste it into OpenClaw next.

### 3B — Connect the Bot to OpenClaw
In your Mac Mini Terminal:

```bash
openclaw gateway
openclaw pairing list telegram
openclaw pairing approve telegram <code>
```

> Pairing codes expire after **1 hour** — complete this promptly after creating your bot.

### 3C — Find Your Telegram Chat ID (for Cron Jobs)
You'll need your numeric Telegram user ID to configure cron job delivery in Section 06:

1. Open Telegram and send any message to your new bot
2. Run on the Mac Mini: `openclaw logs --follow`
3. Look for `from.id` in the log output — that number is your Telegram user ID
4. **Save this number** — you'll use it in Section 06

### 3D — Lock Down DM Access (Recommended)
Since this is a single-operator setup, configure the bot to only accept messages from you:

Edit your OpenClaw config (`~/.openclaw/config.json5`) and add your numeric Telegram ID:
```json5
{
  channels: {
    telegram: {
      dmPolicy: "allowlist",
      allowFrom: ["YOUR_NUMERIC_TELEGRAM_ID"],
    },
  },
}
```

Replace `YOUR_NUMERIC_TELEGRAM_ID` with the number you found in step 3C.

![Channel Selection](templates/images/image3.png)

---

## 04 | CONFIGURE YOUR MODEL PROVIDER (ANTHROPIC)

If you entered your Anthropic API key during the onboarding wizard in Step 2E, your provider is already configured. Verify it:

```bash
openclaw models status
```

You should see your Anthropic API key listed as active. If not:

```bash
openclaw onboard --anthropic-api-key "YOUR_ANTHROPIC_API_KEY"
```

**Confirm your model is set to `claude-sonnet-4-6`:**
```bash
openclaw models list
```

To explicitly set the model in your config:
```json5
{
  agents: {
    defaults: {
      model: { primary: "anthropic/claude-sonnet-4-6" },
    },
  },
}
```

![Model Provider Selection](templates/images/image11.png)

> **Cost note:** Set a monthly spending cap in the [Anthropic Console](https://console.anthropic.com) → Billing → Usage Limits. Start at **$20/month** — typical usage for appointment reminders and daily briefings is $5–15/month.

---

## 05 | INSTALL SKILLS

> **Security rule:** Always install `skill-vetter` first and use it to screen every subsequent skill. Approximately 17–20% of community skills have been found to contain suspicious or malicious code.

### Phase 1: Security Stack (Install First — No Exceptions)

```bash
# Step 1: Install the vetter itself
clawhub install skill-vetter

# Step 2: Use it to vet the next two security skills before installing them
skill-vetter prompt-guard
clawhub install prompt-guard

skill-vetter agentguard
clawhub install agentguard
```

| Skill | What It Does | Why You Need It |
|---|---|---|
| `skill-vetter` | Pre-install scanner — checks any skill for malicious code before you grant it machine access | **Mandatory first install.** Screens every other skill before it touches your system. |
| `prompt-guard` | Defends against prompt injection — malicious instructions embedded in emails or documents trying to hijack the agent | Critical when your agent reads appointment emails and external content |
| `agentguard` | Real-time behavioral guardrails — blocks unintended high-risk actions before they execute | Prevents the agent from taking destructive actions you never intended |

### Phase 2: Core Practice Skills

```bash
# Vet each skill before installing
skill-vetter gog
clawhub install gog

skill-vetter apple-reminders
clawhub install apple-reminders
```

| Skill | What It Does | Why You Need It |
|---|---|---|
| `gog` | Full Google Workspace integration — Gmail, Google Calendar, Drive | Read your schedule, check for new appointments, process email — all from one skill |
| `apple-reminders` | Manage Apple Reminders via chat | Syncs with iCloud — reminders you create via the agent appear on all your Apple devices |

### Phase 3: Optional (Add When Ready)

Consider these after the core setup is stable:

| Skill | Slug | Use Case |
|---|---|---|
| Transactional email for appointment reminders | `mailchannels` | Send professional confirmation emails to patients directly |

> **Before installing any Phase 3 skill:** run `skill-vetter <slug>` first, always.

---

## 06 | CONFIGURE AUTOMATIONS

These two cron jobs are the core of your automated practice workflow. Replace `<YOUR_TELEGRAM_CHAT_ID>` with the numeric ID you found in Step 3C.

### Automation 1 — Morning Schedule Briefing
**What it does:** Every weekday at 7:00 AM Chicago time, the agent pulls your Google Calendar and Gmail, then sends you a formatted daily briefing via Telegram.

**Autonomy Tier: 🔔 NOTIFY** — Agent reads and summarizes. Takes no action.

```bash
openclaw cron add \
  --name "Morning Schedule Briefing" \
  --cron "0 7 * * 1-5" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Pull today's Google Calendar appointments across both practice locations. Generate a formatted morning briefing including: (1) all appointments for today listed chronologically by time and location, (2) any gaps or cancellations, (3) urgent emails in Gmail requiring same-day response, (4) tomorrow's first appointment. Format clearly with sections and emoji for easy reading on mobile." \
  --announce \
  --channel telegram \
  --to "<YOUR_TELEGRAM_CHAT_ID>"
```

### Automation 2 — Appointment Reminder Checker
**What it does:** Every day at 8:00 AM, the agent checks for upcoming appointments in the next 24–48 hours and notifies you which patients haven't confirmed, so you can follow up.

**Autonomy Tier: 🔔 NOTIFY** — Agent identifies who needs reminders. You decide who to contact.

```bash
openclaw cron add \
  --name "Appointment Reminder Check" \
  --cron "0 8 * * *" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Check Google Calendar for appointments in the next 48 hours across both practice locations. Identify appointments where no confirmation has been noted. Generate a reminder checklist: patient name (first name only for privacy), appointment time, location, and a suggested reminder message I can send. Do NOT send any messages automatically — show me the list and drafts only." \
  --announce \
  --channel telegram \
  --to "<YOUR_TELEGRAM_CHAT_ID>"
```

> **HIPAA Note:** Both automations are set to NOTIFY tier — the agent compiles and shows you the information but does not send patient-facing messages automatically. This keeps a human in the loop for all patient communication, which is the appropriate posture for a healthcare practice.

### Verify Your Cron Jobs
After running both commands above:

```bash
openclaw cron list
```

You should see both jobs listed with their schedules. Test one immediately:

```bash
openclaw cron run <job-id>
```

---

## 07 | INJECT YOUR SOUL

With your OpenClaw instance running, open the Web UI:

```bash
openclaw dashboard
```

This opens `http://127.0.0.1:18789/` with your authentication token pre-loaded. **Bookmark this URL** — do not type the address manually (you'll get a token error).

![OpenClaw Web UI](templates/images/image6.png)

Now open `prompts_to_send.md` (in the same folder as this guide) and paste each prompt into the OpenClaw chat interface **one at a time**, in order. Wait for the agent to acknowledge each prompt before sending the next.

**Prompt sequence:**
1. Identity Prompt → establishes who the agent is
2. Business Context Prompt → tells the agent about your two locations
3. Skills Installation Prompt → installs and configures skills
4. Routines & Automations Prompt → sets up the daily schedule and reminder workflows
5. Guardrails & Safety Prompt → HIPAA-aware boundaries
6. Domain Workflows Prompt → dental-specific operating procedures
7. Security Audit Prompt → final verification before going live

---

## 08 | SECURITY HARDENING

### macOS Firewall
1. Go to **System Settings > Network > Firewall**
2. **Turn it on**
3. Verify in your OpenClaw config that `gateway.bind` is set to loopback (`127.0.0.1`) — this means the gateway only accepts connections from the local machine

### Gateway Authentication
As of OpenClaw v2026.1.29, `auth: "none"` is permanently removed. Verify token auth is active:
```bash
openclaw gateway status
```

If you see "no auth configured," run:
```bash
openclaw onboard
```

### Remote Access via Tailscale (Recommended)
Instead of exposing SSH to the open internet, use **Tailscale** for secure remote access:
- Install at [tailscale.com](https://tailscale.com) — free for personal use
- No port forwarding required; you can access your Mac Mini from anywhere securely

### HIPAA-Specific Hardening

> ⚕️ **HIPAA Checklist for This Deployment:**
> - [x] FileVault enabled (Step 1A) — protects data at rest
> - [ ] Screensaver lock enabled with password — **System Settings > Lock Screen > Require password after screensaver begins**
> - [ ] Machine physically secured in your office (locked cabinet or secured to desk)
> - [ ] API key spending limit set on Anthropic Console
> - [ ] Dedicated Gmail account (not your personal account) used for agent operations
> - [ ] OpenClaw conversation logs retained (do NOT disable logging — serves as audit trail)
> - [ ] Review and rotate your Anthropic API key quarterly

> **Important consideration:** Patient appointment details sent to Claude (Anthropic's API) are processed on Anthropic's servers. For most dental practices, appointment metadata (names, times) falls in a gray area. If your workflow involves detailed clinical notes or diagnoses, consider using a local model (Ollama) for those specific tasks. See [tailored HIPAA guidance from your healthcare compliance advisor].

---

## 09 | SECURITY AUDIT CHECKLIST

Run this audit before using OpenClaw for real practice operations:

```bash
# Step 1: Deep security scan
openclaw security audit --deep

# Step 2: Auto-fix common misconfigurations
openclaw security audit --fix

# Step 3: Verify gateway is healthy
openclaw doctor
openclaw health
```

**Manual verification checklist:**
- [ ] `openclaw security audit --deep` completes with no critical warnings
- [ ] Gateway status shows "running" with token authentication active
- [ ] `openclaw cron list` shows exactly the 2 jobs you configured (Morning Briefing + Reminder Check) — no unexpected jobs
- [ ] Skills list matches exactly what you installed in Section 05 — run `openclaw skills list`
- [ ] Telegram bot only responds to your Telegram account (test by having someone else try to message it)
- [ ] No API keys or tokens visible in plain text files — check `~/.openclaw/` directory
- [ ] macOS Firewall is on and gateway is bound to loopback
- [ ] FileVault encryption is active (shown in System Settings > Privacy & Security > FileVault)
- [ ] Review skill permissions: which skills have file system or network access — run `openclaw skills list --verbose`

**Do NOT begin live practice operations until all checks pass.**

---

## 10 | TROUBLESHOOTING & NEXT STEPS

### Common Issues

**"command not found: openclaw" after installing**
```bash
source ~/.zshrc
# or open a new Terminal window
```

**Gateway dies after a config change**
```bash
openclaw doctor
# If that doesn't fix it, restart manually:
openclaw gateway stop
openclaw gateway start
```

**Telegram bot not responding**
- Verify the bot token is correct in your config
- Check: `openclaw channels status`
- Check logs: `openclaw logs --follow`
- Confirm your Telegram user ID is in `allowFrom` (Step 3D)

**Cron jobs not running**
- Verify gateway is running: `openclaw gateway status`
- Check cron is enabled: `openclaw cron list`
- Confirm timezone in the cron job matches your expectation: `America/Chicago`
- Test a manual run: `openclaw cron run <job-id>`

**High API costs**
- Check which sessions are consuming tokens: `openclaw models status`
- Your two cron jobs (Morning Briefing + Reminder Check) should cost $0.10–$0.30/day combined at Sonnet pricing
- If costs spike, run `openclaw security audit` — a misconfigured loop could be the cause

**gog skill not connecting to Google Calendar**
- The `gog` skill requires Google OAuth — run the skill's auth flow: `clawhub run gog auth`
- Make sure you're authenticating the **agent's dedicated Gmail account**, not your personal account

### Next Steps After Stable Setup

Once you've run the system for 1–2 weeks and it's stable, consider:

1. **Add appointment confirmation replies** — upgrade the Reminder Check automation to Tier 3 (SUGGEST) so the agent drafts confirmation messages for your review before sending
2. **End-of-day summary** — add a 6 PM cron job that summarizes today's completed appointments and tomorrow's schedule
3. **Weekly analytics** — add a Monday morning cron job summarizing weekly appointment volume, cancellations, and no-show patterns
4. **Context hygiene** — after week 5, context in long-running sessions can become polluted; use separate Telegram channels for different workflows (patient ops vs. personal assistant tasks)

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI URL** | `openclaw dashboard` (tokenized — don't type manually) |
| **Gateway Port** | 18789 |
| **Model Provider** | Anthropic Claude (`claude-sonnet-4-6`) |
| **Channel** | Telegram |
| **Cron Timezone** | `America/Chicago` |
| **OpenClaw Docs** | https://docs.openclaw.ai |
| **Security Audit** | `openclaw security audit --deep` |
| **Logs** | `openclaw logs --follow` |
| **Gateway Status** | `openclaw gateway status` |
| **Cron Jobs** | `openclaw cron list` |
| **Installed Skills** | `openclaw skills list` |

---

**OPENCLAW | Your Agent. Your Hardware. Your Soul.**
