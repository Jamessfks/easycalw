# OpenClaw Setup Guide — James Hartwell, Solo Real Estate Agent

**Prepared for:** James Hartwell | Austin, TX | Residential Real Estate
**Platform:** MacBook Pro (Existing Mac) | Telegram Channel | Claude Sonnet
**Use Cases:** Lead follow-up automation, property description drafting, CRM management via Telegram

---

> **PREPARED FOR JAMES HARTWELL** — This guide is personalized for your setup: MacBook Pro running most of the day, Follow Up Boss CRM, Google Workspace, Instagram/Facebook, and Telegram as your primary AI interface. Every command, cron schedule, and automation recipe below is tuned for your real estate workflow.

---

## Before You Start: What to Expect

OpenClaw will run as a background process on your MacBook Pro. When you're at your desk and the Mac is awake, it responds within seconds. When the Mac sleeps (overnight, or if you close the lid during a showing), Telegram queues your messages server-side and delivers them when the Mac wakes. For your use case — 10-12 hours active daily — this is entirely workable.

**What you will have after this setup:**
- A Telegram bot that responds to your messages within seconds, drafts lead replies, writes property descriptions, and manages your calendar
- Automated morning briefings with new leads, today's showings, and pending follow-ups delivered to your Telegram every morning at 7am
- An evening showing recap at 8pm drafted and waiting for your review
- CRM guardrails: the agent will NEVER change Follow Up Boss without your approval

---

## Phase 1: Installation (~20 minutes)

### Step 1.1 — Install Xcode Command Line Tools

Open **Terminal** (Cmd+Space → type "Terminal" → Enter) and run:

```bash
xcode-select --install
```

A dialog box will appear. Click **Install** and wait for it to finish (3-5 minutes).

### Step 1.2 — Install Homebrew (Package Manager)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After it finishes, follow any instructions it prints about adding Homebrew to your PATH (it will show you the exact commands to run for your Mac).

### Step 1.3 — Install Node.js

```bash
# Install nvm (Node Version Manager)
brew install nvm

# Add nvm to your shell — paste these lines into Terminal:
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"' >> ~/.zshrc
source ~/.zshrc

# Install Node 24
nvm install 24
nvm use 24
nvm alias default 24

# Verify (should show v24.x.x)
node --version
```

### Step 1.4 — Install OpenClaw

```bash
curl -fsSL https://get.openclaw.ai | bash
```

Verify it installed:

```bash
openclaw --version
```

### Step 1.5 — Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

The wizard will guide you through:
1. **Provider selection** — choose **Anthropic (Claude)**
2. **API key** — paste your Anthropic API key (get one at console.anthropic.com if you don't have one yet)
3. **Daemon install** — say yes; this makes OpenClaw start automatically when you log in

**Store your API key securely after setup:**

```bash
openclaw secret set anthropic_key "YOUR_ANTHROPIC_API_KEY"
openclaw secret set telegram_token "YOUR_TELEGRAM_BOT_TOKEN"
```

### Step 1.6 — Verify the Installation

```bash
openclaw gateway status
openclaw doctor
```

Both should show green. If `openclaw doctor` reports any issues, run:

```bash
openclaw doctor --fix
```

---

## Phase 2: Security Setup — MANDATORY (10 minutes)

> Security must be configured before installing any skills. Do not skip this phase.

### Step 2.1 — Install skill-vetter FIRST

`skill-vetter` is the pre-install scanner that checks every skill for red flags before it touches your machine. It must be the first skill you install.

```bash
clawhub install skill-vetter
```

### Step 2.2 — Install the Security Stack

Vet each skill before installing, then install:

```bash
skill-vetter prompt-guard
clawhub install prompt-guard

skill-vetter agentguard
clawhub install agentguard
```

- **`prompt-guard`** — protects against prompt injection attacks. Critical since you'll be reading lead emails and web inquiries through the agent.
- **`agentguard`** — runtime safety net that blocks dangerous actions before they execute. Essential guardrail for CRM operations.

### Step 2.3 — Enable macOS Keychain for Secrets

Secrets are already stored via `openclaw secret set` above. Reference them in your config (Step 3) using `${{ secret.key_name }}` — never paste raw API keys into config files.

### Step 2.4 — Enable FileVault (if not already on)

```bash
fdesetup status
```

If it says "FileVault is Off", go to: **System Settings → Privacy & Security → FileVault → Turn On**. This encrypts your disk in case your Mac is ever lost.

---

## Phase 3: Telegram Setup (~15 minutes)

### Step 3.1 — Create Your Telegram Bot

1. Open Telegram on your phone or desktop
2. Search for **@BotFather** (verify it has the blue checkmark)
3. Send: `/newbot`
4. Follow the prompts — name it something like "James RE Assistant" or "JH Claw"
5. BotFather will give you a token that looks like `123456789:ABCdef...` — **copy it**

### Step 3.2 — Find Your Telegram User ID

1. DM your new bot (send it any message like "hello")
2. In Terminal, run:

```bash
openclaw logs --follow
```

3. Look for `from.id` in the output — that number is your Telegram user ID. Write it down.

Press Ctrl+C to stop the log stream.

### Step 3.3 — Configure Telegram in OpenClaw

Open your config file:

```bash
nano ~/.openclaw/config.yaml
```

Add or update the channels section:

```yaml
channels:
  telegram:
    enabled: true
    botToken: ${{ secret.telegram_token }}
    dmPolicy: "allowlist"
    allowFrom:
      - "YOUR_TELEGRAM_USER_ID_HERE"
```

> Replace `YOUR_TELEGRAM_USER_ID_HERE` with the numeric ID you found in Step 3.2. This ensures only you can message your bot.

Save the file (Ctrl+X, then Y, then Enter).

### Step 3.4 — Restart and Test

```bash
openclaw gateway restart
openclaw channel test telegram
```

Send your bot a message in Telegram: "Hello, are you there?" — it should respond within a few seconds.

---

## Phase 4: Install Skills (~15 minutes)

Vet each skill before installing. The commands below follow that pattern.

### Step 4.1 — Core Skills

```bash
# Google Workspace (Gmail + Calendar + Drive)
skill-vetter gog
clawhub install gog

# Voice transcription (for Telegram voice notes)
skill-vetter openai-whisper
clawhub install openai-whisper

# Web search (for market research)
skill-vetter tavily-web-search
clawhub install tavily-web-search

# Weather (for showing day planning)
skill-vetter weather
clawhub install weather
```

### Step 4.2 — CRM and Marketing Skills

```bash
# Composio — bridges OpenClaw to Follow Up Boss and 860+ other tools
skill-vetter composio
clawhub install composio

# Instagram management (posting, DM monitoring)
skill-vetter instagram
clawhub install instagram

# Canva design integration (property marketing materials)
skill-vetter canva
clawhub install canva
```

### Step 4.3 — Connect Google Workspace

```bash
openclaw skill auth gog
```

This opens a browser window for Google OAuth. Sign in with your Google Workspace account (the one with your Gmail and Google Calendar). Grant all requested permissions.

### Step 4.4 — Connect Composio for Follow Up Boss

```bash
openclaw skill auth composio
```

Follow the prompts to connect your Follow Up Boss account. You will need your FUB API key from: **Follow Up Boss → Admin → API**.

Store it securely:

```bash
openclaw secret set fub_api_key "YOUR_FOLLOW_UP_BOSS_API_KEY"
```

---

## Phase 5: Configure Your Agent Identity

Open your config file and add the agent identity:

```bash
nano ~/.openclaw/config.yaml
```

Add this section:

```yaml
agents:
  defaults:
    model:
      primary: "anthropic/claude-sonnet-4-6"
    systemPrompt: |
      You are James Hartwell's real estate AI assistant. You help manage James's residential real estate business in Austin, Texas (properties in the $300K–$700K range).

      Your role:
      - Draft responses to lead inquiries from Zillow, website forms, and Instagram DMs
      - Write property descriptions and social media posts for listings
      - Manage CRM notes and follow-up reminders in Follow Up Boss
      - Track showing schedules and appointments via Google Calendar
      - Generate daily briefings, weekly pipeline reports, and market summaries
      - Transcribe voice notes and convert them into actionable CRM updates

      You are NOT a licensed agent. You do NOT:
      - Send any communication to clients without James's explicit approval (until James grants standing permission for specific templates)
      - Change Follow Up Boss records without James's confirmation
      - Make price recommendations, negotiate deals, or commit to anything on James's behalf
      - Share client information between different transactions
      - Discuss commission rates or make fee-related commitments
      - Describe neighborhoods in terms that could violate the Fair Housing Act

      ALWAYS escalate immediately (never respond autonomously) for:
      - Client complaints or legal threats
      - Commission disputes
      - Fair housing concerns
      - Requests involving dual agency situations
      - Document discrepancies in transaction files

      Autonomy levels:
      - Lead response drafts: DRAFT and show James for approval
      - Property descriptions and social posts: GENERATE fully (James reviews before posting)
      - Calendar management: EXECUTE autonomously (James has pre-approved scheduling)
      - CRM updates (logging notes, adding contacts): ASK James first every time
      - Any outbound message to a client: DRAFT + WAIT for approval

      Tone: Warm, professional, responsive. Sound like a knowledgeable Austin real estate expert.
      Hours: Available 7am–9pm CT. Transaction deadline monitoring: always on.
```

---

## Phase 6: Set Up Automations

These cron jobs run on your Mac and deliver briefings to your Telegram. Replace `YOUR_TELEGRAM_CHAT_ID` with your numeric Telegram user ID from Step 3.2.

### Morning Lead & Day Briefing (7:00 AM CT, Mon–Sat)

```bash
openclaw cron add \
  --name "morning-briefing" \
  --cron "0 7 * * 1-6" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Generate James's morning briefing: (1) New lead inquiries overnight from Zillow, website, or Instagram — for each lead: name, source, property interest, urgency level (hot/warm/cold), and a draft response for James to review. (2) Today's showing schedule with addresses and times from Google Calendar. (3) Any transaction deadlines in the next 72 hours. (4) Top 3 follow-ups due today from Follow Up Boss. (5) Austin weather forecast for today. Format as a scannable list James can read in 2 minutes." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

### Evening Showing Recap (8:00 PM CT, Daily)

```bash
openclaw cron add \
  --name "evening-showing-recap" \
  --cron "0 20 * * *" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Review today's showings from Google Calendar. For each showing: draft a follow-up message to the buyer/buyer's agent noting impressions and suggested next steps. For James's active listings with showings today: summarize any feedback. Show James all drafts — do NOT send anything. Label each draft clearly with the recipient." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

### Weekly Pipeline Review (5:00 PM CT, Fridays)

```bash
openclaw cron add \
  --name "weekly-pipeline" \
  --cron "0 17 * * 5" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Generate James's weekly pipeline report: (1) Active listings — for each: address, days on market, showings this week, price vs. comparable Austin sales, flag any with no showings in 7 days. (2) Pending transactions — for each: address, stage, next deadline, responsible party. (3) Lead pipeline by stage: hot (contacted within 48 hrs), warm (in nurture), cold (no contact in 2+ weeks). (4) Commission forecast for the month. Compare to last week where possible." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

### Open House Prep (7:00 AM CT, Saturdays)

```bash
openclaw cron add \
  --name "open-house-prep" \
  --cron "0 7 * * 6" \
  --tz "America/Chicago" \
  --session isolated \
  --message "For any open houses scheduled this weekend in Google Calendar: (1) Draft 3 Instagram posts and 2 Facebook posts with property highlights — show drafts, do NOT post. (2) Draft a neighborhood email subject line and intro paragraph. (3) Suggest 5 property features to highlight on the sign-in sheet. Compile everything for James's review." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

### Daily Gateway Restart (4:00 AM CT) — Memory Management

```bash
openclaw cron add \
  --name "daily-restart" \
  --cron "0 4 * * *" \
  --tz "America/Chicago" \
  --session main \
  --system-event "Gateway daily restart for memory health." \
  --wake next-heartbeat
```

Then add to crontab for actual restart:

```bash
crontab -e
# Add this line:
0 4 * * * /usr/local/bin/openclaw gateway restart >> /tmp/openclaw-restart.log 2>&1
```

---

## Phase 7: Keep Your Mac Awake During Working Hours

Since your MacBook Pro needs to be awake to respond to messages, use Amphetamine to prevent sleep while you're working:

1. Install [Amphetamine](https://apps.apple.com/us/app/amphetamine/id937984704) from the Mac App Store (free)
2. Open Amphetamine → Preferences → Triggers
3. Create trigger: **"While application is running"** → select **"node"**
4. Check **"Allow display to sleep"** (saves power — your screen doesn't need to be on)
5. Check **"Allow system to sleep on battery after: 30 minutes"** (safety net when unplugged)

This keeps OpenClaw running while you're at your desk and lets the Mac sleep normally when you unplug and leave.

---

## Phase 8: Voice Note Workflow (Optional but Highly Recommended)

The killer feature for real estate: send a voice note to your Telegram bot from the field, and it transcribes + executes the action.

The `openai-whisper` skill you installed in Phase 4 handles this automatically. You also need ffmpeg for audio processing:

```bash
brew install ffmpeg
```

**How to use it:**
- Record a voice note in Telegram (hold the microphone button)
- Your bot transcribes it and acts on the instruction
- Example: "Move Sarah Chen to the warm nurture sequence and set a follow-up call for next Thursday at 2pm" → agent parses and shows you the proposed CRM action for confirmation

---

## Phase 9: Final Configuration and Guardrails

Add these remaining settings to `~/.openclaw/config.yaml`:

```yaml
# Heartbeat — reconnects after sleep
heartbeat:
  enabled: true
  interval: 300s
  timeout: 15s
  on_failure: restart_channel

# Gateway config
gateway:
  port: 18789
  host: 127.0.0.1
  reload: auto
  log_level: info

# Session persistence
sessions:
  mode: per_sender
  ttl: 24h
  max_history: 100
  persistence: sqlite
  storage_path: ~/.openclaw/sessions.db
  summarize:
    enabled: true
    after: 50
    model: anthropic/claude-haiku-4-20250514

# Secrets backend
secrets:
  backend: keychain
  keychain:
    service: openclaw

# Sandbox — prevent agent from accessing files outside its workspace
sandbox:
  enabled: true
  mode: workspace
  workspace_root: ~/.openclaw/workspaces
  per_sender: true
```

Validate the full config:

```bash
openclaw config validate
```

Fix any errors it reports, then restart:

```bash
openclaw gateway restart
openclaw doctor
```

---

## Quick Reference

| Task | Command |
|---|---|
| Check gateway status | `openclaw gateway status` |
| View live logs | `openclaw logs --follow` |
| Restart gateway | `openclaw gateway restart` |
| Test Telegram connection | `openclaw channel test telegram` |
| List cron jobs | `openclaw cron list` |
| Run diagnostics | `openclaw doctor` |
| Open dashboard | `openclaw dashboard` (then visit http://127.0.0.1:18789) |
| Check model usage/costs | `openclaw model usage --period today` |
| Restart a channel after sleep | `openclaw channel restart telegram` |

---

## Troubleshooting

**Bot not responding after Mac wakes from sleep:**
```bash
openclaw channel restart telegram
```

**High memory usage (>1 GB):**
```bash
openclaw gateway restart
openclaw session prune --older-than 7d
```

**"openclaw command not found":**
```bash
export PATH="$PATH:$(npm root -g)/../bin"
source ~/.zshrc
```

**Config errors:**
```bash
openclaw config validate
openclaw doctor --fix
```

---

## Security Review Checklist

Before you start using the system with real client data, verify:

- [ ] `skill-vetter` installed and used to vet every other skill
- [ ] `prompt-guard` installed — protects against malicious content in lead emails
- [ ] `agentguard` installed — blocks unintended CRM or file system actions
- [ ] Telegram `dmPolicy` set to `allowlist` with your numeric user ID
- [ ] No raw API keys in config.yaml (all use `${{ secret.key_name }}`)
- [ ] FileVault enabled on your Mac
- [ ] Sandbox enabled in config
- [ ] Agent system prompt includes Fair Housing guardrail
- [ ] Agent system prompt requires James's approval before any client communication

---

## What's Next

Once everything is running, test these scenarios:

1. **Lead response test:** Send your bot "I just got a new Zillow lead from Mike Johnson asking about 123 Oak Street, $450K, wants to see it this weekend. Draft a response." — verify it drafts and waits for your approval.

2. **Property description test:** Send "Write a property description for a 3BR/2BA 1,800 sqft home in South Austin, built 2019, open floor plan, quartz countertops, walking distance to Barton Springs. Warm and inviting tone."

3. **Voice note test:** Record a Telegram voice note saying "Add a note to Mark Davis in FUB — showed him the Anderson property today, he liked it but wants something with a bigger yard. Follow up Monday." — verify transcription and proposed CRM action.

4. **Morning briefing test:** Run it manually: `openclaw cron run morning-briefing`

---

*For full documentation: https://docs.openclaw.ai*
*Community support: OpenClaw Discord / Telegram community*
