# OPENCLAW ENGINE SETUP GUIDE

**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Marco — small business owner, Scouts Coffee SF |
| **MISSION** | Staff scheduling assistance and supplier order drafting |
| **DATE** | 2026-03-28 |
| **DEPLOYMENT** | Mac Mini |
| **CHANNEL** | Telegram |
| **MODEL** | Anthropic (Claude) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

**This guide configures your OpenClaw agent to draft staff schedules and supplier orders for your approval — built around the daily rhythm of running an 8-person coffee shop in San Francisco.**

---

## Key Moments — What You Will Accomplish

By the end of this guide, you will have:

- **A running OpenClaw instance** on your Mac Mini, connected to Telegram and ready for daily use
- **2 tailored automations** that handle schedule briefings and supplier order drafting without ever acting without your sign-off
- **Industry-grade guardrails** ensuring your agent drafts things for your approval and never sends money or places orders autonomously

---

## Phase 1 | PRE-FLIGHT CHECKLIST

> **ACTION:** Complete every item below **before** running a single command. Missing prerequisites will cause you to backtrack.

### Accounts to Create
- [ ] **Anthropic account** — Create at console.anthropic.com. You need an API key. Set a monthly spending limit of **$20–$50** to start.
- [ ] **Telegram account** — Install the Telegram app on your phone if you haven't already.
- [ ] **Google account (dedicated)** — Create a separate Google account for OpenClaw. Share only the specific Sheets and Calendar it needs. Do not give it access to your personal Google account.

### API Keys to Obtain
- [ ] **Anthropic API Key** — In the Anthropic console: API Keys → Create Key. Copy and save it in a password manager.

### Hardware & Software
- [ ] Mac Mini powered on and connected to your network
- [ ] macOS fully updated: Apple menu > System Settings > General > Software Update
- [ ] An HDMI dummy plug inserted if running headless (prevents macOS permission breakage — costs $8–$10 on Amazon)
- [ ] Terminal access confirmed — press Cmd+Space, type "Terminal"

> **TIP:** Marco, gather your Anthropic API key and Telegram login before starting — context-switching mid-install is the #1 cause of setup mistakes.

---

## Phase 2 | PLATFORM SETUP

Marco, these steps prepare your Mac Mini to run OpenClaw reliably around the clock.

> **WARNING:** Your Mac Mini must never sleep — a sleeping machine will miss scheduled schedule briefings and Telegram messages from your team. Complete Steps 2A and 2B before proceeding.

### 2A — Create a Dedicated macOS User Account

Never run OpenClaw under your personal macOS account. A separate account gives it isolation — its own home directory, its own permissions, its own keychain.

1. Go to **System Settings > Users & Groups**
2. Click the **+** button to add a new user
3. Name it something like `openclaw` or `agent`
4. Log in as that user for all steps that follow

### 2B — Enable FileVault Disk Encryption

1. Go to **System Settings > Privacy & Security > FileVault**
2. Click **Turn On FileVault**
3. Save the recovery key somewhere secure (not on the Mac Mini itself)

This takes about 30 minutes. Do not skip it — if someone physically takes your Mac Mini, FileVault prevents access to your API keys and business data.

### 2C — Configure Always-On Settings

Go to **System Settings > Energy** and enable:
- "Prevent automatic sleeping when the display is off"
- "Wake for network access"
- "Start up automatically after a power failure"

Then install **Amphetamine** from the Mac App Store (free). Launch it, go to Preferences, and enable:
- "Launch Amphetamine at login"
- "Start session when Amphetamine launches" (duration: Indefinitely)
- "Start session after waking from sleep"

### 2D — Enable Remote Access

Go to **System Settings > General > Sharing** and enable:
- **Remote Login** (SSH) — your primary remote management method
- **Screen Sharing** (VNC) — for occasional graphical tasks

Set automatic login: **System Settings > Users & Groups > Login Options** — set the OpenClaw user to auto-login.

**Verify it worked:**
```
$ ssh <your-mac-mini-local-ip>
# Should connect without errors
```

---

## Phase 3 | INSTALL OPENCLAW

### 3A — Install Xcode Command Line Tools

```bash
xcode-select --install
```

A dialog will appear — click Install and wait a few minutes.

### 3B — Install Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After it finishes, add Homebrew to your PATH (Apple Silicon Macs):

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
source ~/.zprofile
```

**Verify it worked:**
```
$ brew --version
Homebrew 4.x.x
```

### 3C — Install Node.js

```bash
brew install node
```

**Verify it worked:**
```
$ node --version
v22.x.x   ← must be 22.16 or higher
```

If it shows an older version, run `brew upgrade node`.

### 3D — Run the OpenClaw Installer

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Wait until you see "Installation finished successfully!"

**Verify it worked:**
```
$ openclaw --version
openclaw v2026.x.x   ← must be 2026.1.29 or later
```

> **WARNING:** You need version **2026.1.29 or later**. Earlier versions had a security gap allowing unauthenticated gateway access. If you see a gateway auth error after updating, run `openclaw onboard` to reconfigure.

### 3E — Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag sets up a launchd service so OpenClaw starts automatically on boot and runs 24/7.

**At each wizard prompt, choose:**

| Prompt | Recommended Choice |
|---|---|
| Gateway mode | **Local** (not Remote) |
| AI provider | **Anthropic** — paste your API key |
| Model | **`claude-opus-4-5`** (best reasoning for drafting schedules and orders) |
| Messaging channels | **Telegram** — set up in Phase 4 |
| Hooks | Enable **session memory**, **boot hook**, and **command logger** |
| Skills | **Skip for now** — you'll install skills deliberately in Phase 5 |

> **ACTION:** When the wizard shows the security acknowledgment, select **"Yes"** to confirm you are the sole operator.

### 3F — Grant macOS Permissions

Go to **System Settings > Privacy & Security** and grant OpenClaw (and Terminal) all three:

- **Full Disk Access** — so it can read and write files across your system
- **Accessibility** — so it can click, type, and control apps
- **Screen Recording** — required for GUI automation

**Verify everything is running:**
```bash
openclaw gateway status
openclaw doctor
openclaw health
```

Open the dashboard:
```bash
openclaw dashboard
```

> **TIP:** Use `openclaw dashboard` — not the raw URL. It opens a tokenized link. Bookmark it.

---

## Phase 4 | CONNECT YOUR CHANNEL (TELEGRAM)

Marco, this connects your agent to Telegram so you can text it tasks from anywhere.

### 4A — Create Your Bot via BotFather

1. Open Telegram on your phone
2. Search for **@BotFather** — verify the blue checkmark
3. Tap Start and send `/newbot`
4. When asked for a display name, type something like: `Scouts Coffee Agent`
5. When asked for a username, it must end in "bot" and be globally unique (e.g., `ScoutsCoffeeBot`)
6. BotFather will reply with your **bot token** — copy it immediately

When OpenClaw asks for your Telegram bot token during channel setup, paste it.

Then run:
```bash
openclaw pairing list telegram
openclaw pairing approve telegram <code>
```

Pairing codes expire after 1 hour — complete this step promptly.

**Verify it worked:**
```
$ openclaw channels status
telegram   ✓ connected   user_id: YOUR_TELEGRAM_USER_ID
```

### 4B — Lock Down Access (Critical)

> **WARNING:** Without this step, anyone who discovers your bot can send it commands.

Set your Telegram DM policy to allowlist with only your numeric user ID:

Find your Telegram user ID:
1. DM your bot from your personal Telegram account
2. Run `openclaw logs --follow`
3. Look for `from.id` in the output — that number is your Telegram user ID

Then update your config:
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

Restart the gateway:
```bash
openclaw gateway stop && openclaw gateway start
```

> **TIP:** For one-owner bots like yours, `dmPolicy: "allowlist"` with your explicit numeric ID is the most durable and secure setting.

---

## Phase 5 | CONFIGURE YOUR MODEL PROVIDER (ANTHROPIC)

```bash
openclaw models status
```

**Verify it worked:**
```
Provider: anthropic   Status: ✓ active   Model: claude-opus-4-5
```

If not configured:
```bash
openclaw onboard --anthropic "YOUR_ANTHROPIC_API_KEY"
```

> **TIP:** Marco, set a monthly spending cap in the Anthropic console at console.anthropic.com. Typical usage for an 8-person coffee shop scheduling and ordering workflow is $15–$35/month.

---

## Phase 6 | INSTALL SKILLS

> **WARNING:** Always install `skill-vetter` first and use it to screen every subsequent skill. Approximately 17–20% of community skills contain suspicious code. Given your "never send money without asking" rule, the approval guardrail skills are non-negotiable.

### Security Stack (Install First — No Exceptions)

```bash
clawhub install skill-vetter
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
```

Now use skill-vetter to screen each skill before installing it:

```bash
skill-vetter prompt-guard
clawhub install prompt-guard

skill-vetter agentguard
clawhub install agentguard

skill-vetter agentgate
clawhub install agentgate
```

### Core Skills for Scouts Coffee

| Your Need | Skill | What It Does |
|---|---|---|
| Staff scheduling via Google Calendar | `gog` | Full Google Workspace integration — Calendar, Sheets, Drive, Docs, Gmail |
| Block high-risk agent actions at runtime | `agentguard` | Real-time behavioral monitoring — blocks unintended file deletions, message sends, purchases before they execute |
| Require your approval before any write operation | `agentgate` | Human-in-the-loop gate — agent can read freely, but any write or order draft requires your explicit sign-off |

```bash
skill-vetter gog
clawhub install gog
```

Follow the `gog` prompts to connect your dedicated Google account via OAuth. Share only the specific Google Calendar and Sheets you want the agent to access — do not share your personal Google account.

**Verify it worked:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
prompt-guard   v1.x.x   ✓ active
agentguard     v1.x.x   ✓ active
agentgate      v1.x.x   ✓ active
gog            v1.x.x   ✓ active
```

> **NOTE:** The `agentguard` + `agentgate` combination enforces your "draft things for my approval, never send money without asking" policy at the software level — not just as a spoken rule.

---

## Phase 7 | CONFIGURE AUTOMATIONS

> **TIP:** These two automations replace the manual coordination overhead you described — checking who's scheduled each day and figuring out what to order. Your agent does the legwork; you make the calls.

### Automation 1 — Daily Staff Schedule Briefing

**What it does:** Each morning, your agent reads the week's staff schedule from your Google Calendar or Sheets and sends you a plain-English summary of who is working that day, noting any gaps or conflicts it spots.

**Autonomy Tier: NOTIFY** — Agent reads and summarizes. Takes no action. You receive information only.

```bash
openclaw cron add \
  --name "daily-schedule-briefing" \
  --cron "0 7 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Read the Scouts Coffee staff schedule for today from Google Calendar. List who is working each shift, flag any gaps or conflicts you notice, and send me a plain-English summary. Do not make any changes. This is read-only." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                      Schedule    Timezone              Status
1    daily-schedule-briefing   0 7 * * *   America/Los_Angeles   ✓ active
```

> **Business Note:** This automation never modifies the schedule — it only reads and reports. If you want the agent to draft a proposed schedule change, send it a message directly and it will prepare a draft for your review.

---

### Automation 2 — Weekly Supplier Order Draft

**What it does:** Each Sunday evening, your agent prepares a draft supplier order based on a template or historical order in your Google Sheets. It sends the draft to you on Telegram for review. Nothing is sent to suppliers until you explicitly approve and instruct it to proceed.

**Autonomy Tier: DRAFT** — Agent composes a draft. Waits for your explicit approval before any further action.

```bash
openclaw cron add \
  --name "weekly-supplier-order-draft" \
  --cron "0 18 * * 0" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Read the Scouts Coffee supplier order template from Google Sheets. Prepare a draft order for this week based on the template quantities. Present the full draft to me on Telegram for review. Do not send, submit, or communicate anything to any supplier. Wait for my explicit approval before taking any further action." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                        Schedule      Timezone              Status
1    daily-schedule-briefing     0 7 * * *     America/Los_Angeles   ✓ active
2    weekly-supplier-order-draft 0 18 * * 0    America/Los_Angeles   ✓ active
```

> **Important:** Your agent will never contact suppliers, place orders, or make purchases without your explicit instruction. This is enforced both by the prompt and by `agentguard` + `agentgate` at the software level. When you review a draft and say "go ahead," the agent will prepare the outgoing communication for your final review before sending.

---

## Phase 8 | INJECT YOUR SOUL

> **ACTION:** Open `prompts_to_send.md` (in the same folder as this guide) and paste each prompt into the OpenClaw chat interface **one at a time**, in order. Wait for the agent to acknowledge each prompt before sending the next.

```bash
openclaw dashboard
```

**Prompt sequence:**
1. **Identity Prompt** — establishes who the agent is and how it operates at Scouts Coffee
2. **Scheduling Rules Prompt** — defines how the agent handles staff scheduling requests
3. **Supplier Order Rules Prompt** — defines the approval workflow for any order-related task
4. **Guardrail Confirmation Prompt** — the agent confirms its operational constraints out loud
5. **Communication Style Prompt** — sets tone and message format for Telegram updates
6. **Security Audit Prompt** — final verification before going live

> **TIP:** Wait for the agent to acknowledge each prompt before sending the next. This ensures each layer of configuration is properly absorbed.

---

## Phase 9 | SECURITY HARDENING

> **WARNING:** Marco, do not skip this section. Your Mac Mini will be running 24/7 with API keys and access to your business calendar and supplier information. A few minutes now prevents significant problems later.

### Mac Mini-Specific Hardening

Enable macOS Firewall:
- **System Settings > Network > Firewall** — turn it on

Verify gateway binds to loopback only (not exposed to your network):
```bash
openclaw doctor
```

Look for `gateway.bind: 127.0.0.1` in the output. If it shows `0.0.0.0`, run `openclaw onboard` to reconfigure.

For remote access from outside your cafe network, install **Tailscale** (free):
- Download from tailscale.com
- This gives you secure access to your Mac Mini without port forwarding

### Small Business Compliance Checklist

- [ ] Dedicated macOS user account created for OpenClaw (not your personal account)
- [ ] FileVault disk encryption enabled
- [ ] macOS Firewall turned on
- [ ] Gateway confirmed binding to loopback only (`127.0.0.1:18789`)
- [ ] Telegram bot set to `dmPolicy: "allowlist"` — only your numeric ID
- [ ] API spending limit set in Anthropic console ($20–$50/month to start)
- [ ] OpenClaw conversation logs retained — do not delete `~/.openclaw/logs/`
- [ ] API key stored only in OpenClaw config, not in plain text files
- [ ] `agentguard` and `agentgate` confirmed active: `openclaw skills list`
- [ ] API key rotated quarterly (calendar reminder set)

---

## Phase 10 | SECURITY AUDIT CHECKLIST

> **ACTION:** Run this audit before using OpenClaw for real Scouts Coffee operations.

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
- [ ] `openclaw cron list` shows exactly 2 jobs — daily-schedule-briefing and weekly-supplier-order-draft
- [ ] `openclaw skills list` shows exactly: skill-vetter, prompt-guard, agentguard, agentgate, gog
- [ ] Telegram bot only responds to your Telegram account
- [ ] No API keys stored in plain text — check `~/.openclaw/`
- [ ] Verify skill permissions: `openclaw skills list --verbose`
- [ ] Test automation manually: `openclaw cron run 1` (schedule briefing) — confirm it reads but takes no action

**Do NOT begin live Scouts Coffee operations until all checks pass.**

---

## Troubleshooting & Next Steps

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
- Confirm `dmPolicy: "allowlist"` includes your numeric Telegram ID

**Cron jobs not firing**
- Verify gateway: `openclaw gateway status`
- Check schedule: `openclaw cron list`
- Test manually: `openclaw cron run <job-id>`

**Agent tried to do something without asking**
- Check `agentguard` is active: `openclaw skills list`
- Review logs: `openclaw logs --follow`
- Re-send the Guardrail Confirmation Prompt from `prompts_to_send.md`

### Next Steps After Stable Setup

Once you've run the system for 1–2 weeks, Marco, consider:

1. **Connect a shared staff Telegram group** — add the bot to a group so staff can query the schedule directly, with you still as the only approver for changes
2. **Google Sheets order tracker** — have the agent maintain a running log of draft orders and approvals in a Sheets doc for your records
3. **Context hygiene** — after week 5, use separate conversation sessions for scheduling vs. ordering to prevent context pollution between the two workflows

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI URL** | `openclaw dashboard` (tokenized — don't type manually) |
| **Gateway Port** | 18789 |
| **Model Provider** | Anthropic (`claude-opus-4-5`) |
| **Channel** | Telegram |
| **Cron Timezone** | `America/Los_Angeles` |
| **OpenClaw Docs** | https://docs.openclaw.ai |
| **Security Audit** | `openclaw security audit --deep` |
| **Logs** | `openclaw logs --follow` |
| **Gateway Status** | `openclaw gateway status` |
| **Cron Jobs** | `openclaw cron list` |
| **Installed Skills** | `openclaw skills list` |

---

**OPENCLAW | Your Agent. Your Hardware. Your Soul.**
