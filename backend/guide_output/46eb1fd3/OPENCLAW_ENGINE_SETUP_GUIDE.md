# OPENCLAW ENGINE SETUP GUIDE
**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Freelance Designer — Austin, TX |
| **MISSION** | Automate invoice tracking and client project management so you can focus on design work, not admin |
| **DATE** | 2026-03-26 |
| **DEPLOYMENT** | Mac Mini (dedicated hardware, 24/7) |
| **CHANNEL** | Telegram |
| **MODEL** | Anthropic Claude Opus (`anthropic/claude-opus-4-6`) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

**This guide configures your OpenClaw agent to track invoices, manage client projects in Notion, and triage your inbox automatically — built around your freelance design workflow and the tools you already use.**

---

## 🎯 Key Moments — What You Will Accomplish

By the end of this guide, you will have:

- A running OpenClaw instance on your Mac Mini, connected to Telegram and ready to receive tasks from your phone or desktop 24/7
- Three tailored automations that handle your daily client status briefings, weekly invoice follow-up checks, and end-of-day Notion project digests without manual work
- Industry-grade guardrails ensuring your agent never sends client-facing messages, modifies invoices, or deletes Notion records without your explicit approval

---

## 00 | ✅ PRE-FLIGHT CHECKLIST

> **ACTION:** Complete every item below **before** running a single command. Missing prerequisites will cause you to backtrack mid-setup.

### Accounts to Create or Verify

- [ ] **Anthropic account** — Create at [console.anthropic.com](https://console.anthropic.com). You need an API key. Set a monthly spending limit of **$20–$50** to start — a misconfigured agent can burn through credits fast.
- [ ] **Telegram account** — Install Telegram on your phone if you haven't already. This is your primary interface.
- [ ] **Dedicated macOS user account** — Create a separate macOS user called `openclaw` (or similar). Never run OpenClaw under your personal account. This gives it its own home directory and file permissions, away from your iCloud, design files, and personal photos.

### API Keys to Obtain

- [ ] **Anthropic API Key** — In the Anthropic Console: API Keys → Create Key. Copy it and store it in your password manager.
- [ ] **Notion Integration Token** — Go to [notion.so/my-integrations](https://www.notion.so/my-integrations), create a new integration, and copy the Internal Integration Token. Share only the specific Notion databases you want the agent to access.
- [ ] **Google OAuth** — Required for the `gog` skill (Gmail + Google Workspace). You will authorize this inside OpenClaw after install.

### Hardware & Software

- [ ] Mac Mini is powered on and connected to the internet
- [ ] If running headless (no monitor): plug in an HDMI dummy plug ($8–10 on Amazon) — without it, macOS screen-recording permissions can silently break
- [ ] Terminal access confirmed: press Cmd+Space, type "Terminal", hit Enter

> 💡 **TIP:** Gather all your API keys in a password manager (1Password, Bitwarden, etc.) before starting — this prevents context-switching mid-setup and reduces the chance of pasting keys into the wrong place.

---

## 01 | 🖥️ PLATFORM SETUP

These steps prepare your Mac Mini to run OpenClaw reliably around the clock.

> 💼 **Freelance Business Note:** Your Mac Mini will hold API keys for your Gmail, Notion, and Anthropic accounts. Enable FileVault disk encryption before proceeding — if your Mac Mini is ever physically accessed without your permission, FileVault ensures none of your client data, invoice drafts, or API credentials are readable.

### 1A — Update macOS and Enable FileVault

Go to **Apple menu > System Settings > General > Software Update** and install all pending updates. Restart when prompted.

Then enable full-disk encryption: **System Settings > Privacy & Security > FileVault** → Turn On FileVault. Save your recovery key somewhere secure (your password manager, not on this machine).

**Verify it worked:**
```
System Settings > Privacy & Security > FileVault
Shows: "FileVault is turned on"
```

### 1B — Create a Dedicated User Account

Open **System Settings > Users & Groups** → Add Account. Create a standard user named `openclaw` (or `agent`). Log in as that user for all OpenClaw setup steps. Set it to auto-login: **System Settings > Users & Groups > Login Options** → Automatic login → select this account.

**Verify it worked:**
```
You are logged into the dedicated agent account, not your personal account.
whoami   → shows "openclaw" (or whatever name you chose)
```

### 1C — Configure Always-On Settings

> 💡 **TIP:** A Mac Mini that sleeps will miss your scheduled morning briefings and leave your Telegram messages unanswered. These settings ensure it stays awake through everything short of a power outage.

Open **System Settings > Energy**, then:
- Enable **"Prevent automatic sleeping when the display is off"**
- Enable **"Wake for network access"**
- Enable **"Start up automatically after a power failure"**

Then install **Amphetamine** from the Mac App Store for belt-and-suspenders sleep prevention. Launch it (pill icon in menu bar) → Preferences → enable "Launch Amphetamine at login" → enable "Start session when Amphetamine launches" → Duration: Indefinitely.

### 1D — Enable Remote Access

Enable SSH for remote management: **System Settings > General > Sharing → Remote Login** → Turn On.
Enable Screen Sharing for occasional graphical access: **System Settings > General > Sharing → Screen Sharing** → Turn On.

For secure remote access from anywhere without port-forwarding, install **Tailscale** (free): [tailscale.com](https://tailscale.com).

---

## 02 | 📦 INSTALL OPENCLAW

### 2A — Install Xcode Command Line Tools

```bash
xcode-select --install
```

A dialog will appear — click Install and wait a few minutes.

**Verify it worked:**
```
xcode-select --version
xcode-select version 2409  ← any version is fine
```

### 2B — Install Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After it finishes, add Homebrew to your PATH (Apple Silicon):

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
source ~/.zprofile
```

**Verify it worked:**
```
brew --version
Homebrew 4.x.x   ← any recent version
```

### 2C — Install Node.js

```bash
brew install node
```

**Verify it worked:**
```
node --version
v22.16.0   ← must be v22.16 or higher. If older, run: brew upgrade node
```

### 2D — Run the OpenClaw Installer

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Wait until you see `Installation finished successfully!`

**Verify it worked:**
```
openclaw --version
openclaw v2026.x.x   ← must be 2026.1.29 or later
```

> ⚠️ **WARNING:** You need version **2026.1.29 or later**. Earlier versions had a security gap allowing unauthenticated gateway access (auth mode "none"). If you see a gateway auth error after updates, run `openclaw onboard` to reconfigure authentication.

If you get `command not found: openclaw` after installing, run:
```bash
source ~/.zshrc
```

### 2E — Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag is critical — it sets up a launchd service so OpenClaw starts automatically on boot and runs 24/7.

**At each wizard prompt, choose:**

| Prompt | Recommended Choice |
|---|---|
| Gateway mode | **Local** (not Remote) |
| AI provider | **Anthropic** — paste your API key |
| Model | **`anthropic/claude-opus-4-6`** — best reasoning for complex design briefs |
| Messaging channels | **Telegram** — set up in Section 03 |
| Hooks | Enable **session memory**, **boot hook**, and **command logger** — all three |
| Skills | **Skip for now** — you will install skills deliberately in Section 05 |

> **ACTION:** When the wizard shows the security acknowledgment, select **"Yes"** to confirm you are the sole operator.

**Verify it worked:**
```
openclaw gateway status
openclaw doctor
openclaw health
```

All three should return green / no errors. If `health` shows "no auth configured", go back and set your Anthropic API key.

To open the dashboard:
```bash
openclaw dashboard
```

This opens a tokenized URL at `http://127.0.0.1:18789/` in your browser. **Do not** type the URL manually — you will get a "gateway token missing" error. Bookmark the URL that `openclaw dashboard` opens.

---

## 03 | 💬 CONNECT YOUR CHANNEL (TELEGRAM)

> 💡 **TIP:** Telegram is the ideal first channel for a freelance designer — you can message your agent from your phone while at a client meeting, from your iPad in a coffee shop, or from your desktop Mac. One bot handles all of it.

### 3A — Create Your Telegram Bot

Do this on your phone where Telegram is already installed.

1. Open Telegram and search for **@BotFather** — look for the blue checkmark to confirm it is the real one.
2. Tap **Start**.
3. Type `/newbot` and send it.
4. BotFather asks for a **display name** — type something memorable, e.g. `Studio Agent` or `Friday`.
5. BotFather asks for a **username** — must end in `bot` and be globally unique, e.g. `yourname_studio_bot`.
6. BotFather responds with a success message containing your **bot token** (looks like `1234567890:ABCdef...`). Copy it.

Now configure the token in OpenClaw:

```bash
openclaw onboard
```

Choose "Add channel" → Telegram → paste the bot token when prompted.

Then run:
```bash
openclaw pairing list telegram
openclaw pairing approve telegram <code>
```

Now send your bot a message in Telegram. It will respond.

**Verify it worked:**
```
openclaw channels status
telegram   ✓ connected
```

### 3B — Lock Down DM Access

> ⚠️ **WARNING:** Without this step, anyone who discovers your bot's username can send it commands and potentially access your Notion workspace or trigger automations.

Use `allowlist` mode with your own numeric Telegram user ID:

1. DM your bot from your Telegram account.
2. Run `openclaw logs --follow` and find `from.id` in the log output — this is your numeric user ID.
3. Add it to your config:

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

This ensures only you can command the bot — even if someone finds the bot username.

**Verify it worked:**
```
openclaw channels status
telegram   ✓ connected   dmPolicy: allowlist
```

---

## 04 | 🧠 CONFIGURE YOUR MODEL PROVIDER (ANTHROPIC)

```bash
openclaw models status
```

**Verify it worked:**
```
Provider: anthropic   Status: ✓ active   Model: anthropic/claude-opus-4-6
```

If not configured, run:
```bash
openclaw onboard --anthropic-api-key "YOUR_ANTHROPIC_API_KEY"
```

> 💡 **TIP:** Set a monthly spending cap in the Anthropic Console right now. Typical usage for a freelance designer running invoice tracking, Notion sync, and inbox triage is **$15–$35/month** with Claude Opus. Start with a $50 cap — enough to run the full stack without risk of surprise charges. Adjust after your first week.

**Important:** Go to [console.anthropic.com](https://console.anthropic.com) → Billing → Set a monthly usage limit before proceeding.

---

## 05 | 🛠️ INSTALL SKILLS

> ⚠️ **WARNING:** Always install `skill-vetter` first and use it to screen every subsequent skill before installing it. Approximately 17–20% of community skills contain suspicious code — including undeclared network calls, hidden environment variable reads, and obfuscated shell commands. `skill-vetter` is your pre-install scanner and has 86,800+ downloads for a reason.

### Phase 1: Security Stack (Install First — No Exceptions)

**Step 1: skill-vetter**
```bash
clawhub install skill-vetter
```

**Verify it worked:**
```
openclaw skills list
skill-vetter   v1.x.x   ✓ active
```

**Step 2: prompt-guard**

Scan it first with the vetter you just installed, then install:
```bash
skill-vetter prompt-guard
clawhub install prompt-guard
```

`prompt-guard` defends against prompt injection — malicious content in emails, web pages, or documents trying to hijack your agent. Since your agent will be reading client emails and Notion pages, this is not optional.

**Step 3: agentguard**
```bash
skill-vetter agentguard
clawhub install agentguard
```

`agentguard` monitors agent behavior at runtime and blocks unintended high-risk actions before they execute — a runtime safety net between your agent and your files.

**Verify Phase 1:**
```
openclaw skills list
skill-vetter   v1.x.x   ✓ active
prompt-guard   v1.x.x   ✓ active
agentguard     v1.x.x   ✓ active
```

---

### Phase 2: Core Skills for Your Freelance Design Workflow

> 💼 **Freelance Business Note:** Each skill you install gets access to your agent's execution environment. The skills below are verified in the ClawHub registry and matched to your specific needs: Gmail for inbox triage, Notion for project tracking, and bookkeeper for invoice workflows. Notion Integration Token scoping is critical — share only the specific Notion databases you want the agent to read and write. Do NOT share your entire Notion workspace.

| Your Need | Skill | What It Does | Required Credentials |
|---|---|---|---|
| Gmail + Google Workspace | `gog` | Full Google Workspace integration — Gmail, Calendar, Drive, Docs, and Sheets in one skill | Google Account (OAuth) |
| Notion project tracking | `notion` | Read and write Notion pages and databases via natural language | Notion Integration Token |
| Invoice intake and pre-accounting | `bookkeeper` | Email invoice intake, OCR extraction, payment verification, and accounting entry creation | `MATON_API_KEY` + `DEEPREAD_API_KEY` |
| Email inbox triage | `agent-mail` | Dedicated AI agent inbox with automatic triage, prioritization, and reply drafting | SMTP/IMAP credentials |

**Install in order, vetting each one first:**

```bash
skill-vetter gog
clawhub install gog

skill-vetter notion
clawhub install notion

skill-vetter bookkeeper
clawhub install bookkeeper

skill-vetter agent-mail
clawhub install agent-mail
```

**Verify all skills installed:**
```
openclaw skills list
skill-vetter   v1.x.x   ✓ active
prompt-guard   v1.x.x   ✓ active
agentguard     v1.x.x   ✓ active
gog            v1.x.x   ✓ active
notion         v1.x.x   ✓ active
bookkeeper     v1.x.x   ✓ active
agent-mail     v1.x.x   ✓ active
```

---

## 06 | ⏰ CONFIGURE AUTOMATIONS

> 💡 **TIP:** These three automations are the core of your freelance workflow. They replace the morning ritual of opening five tabs to check on client status, the end-of-week scramble to find unpaid invoices, and the afternoon context-switch to catch up on Notion. Once running, your agent handles all three automatically — you just receive the digest on Telegram and act on what matters.

All automations default to **Tier 2 — NOTIFY**: your agent reads, analyzes, and sends you a summary. It takes no autonomous action. This is the right default for a freelance business where your professional reputation depends on every client communication being reviewed by you first.

---

### Automation 1 — Morning Client Status Briefing

**What it does:** Every weekday morning at 9 AM Austin time, your agent checks your Notion project databases and Gmail for overnight client messages, flags anything urgent, and sends you a structured daily briefing on Telegram.

**Autonomy Tier: 🔔 NOTIFY** — Agent reads and summarizes. Never sends client-facing messages or modifies records.

```bash
openclaw cron add \
  --name "Morning Client Briefing" \
  --cron "0 9 * * 1-5" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Check my Notion project databases and Gmail inbox for overnight updates. For each active client project: note any new messages, flag anything marked urgent, check if any deadlines fall within the next 48 hours. Summarize in a clean briefing. Do not send any emails. Do not modify any Notion records. Report only." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify it worked:**
```
openclaw cron list
ID   Name                       Schedule        Timezone          Status
1    Morning Client Briefing    0 9 * * 1-5     America/Chicago   ✓ active
```

Test it immediately (does not wait for 9 AM):
```bash
openclaw cron run <job-id>
```

> 💼 **Freelance Business Note:** This automation is NOTIFY-tier — your agent never sends client-facing messages automatically. Every response to a client still goes through you. This keeps your professional relationships intact and gives you full control over tone and timing.

---

### Automation 2 — Weekly Invoice Follow-Up Check

**What it does:** Every Monday at 8 AM Austin time, your agent checks your Gmail and Notion for any outstanding invoices that are 15+ days overdue. It drafts follow-up messages for your review and sends you the list on Telegram.

**Autonomy Tier: 🔔 NOTIFY** — Agent drafts messages and presents them for your approval. Never sends follow-ups autonomously.

> ⚠️ **IMPORTANT:** The agent will NEVER send a follow-up email to a client without your explicit approval. This is enforced in the guardrails prompt in Section 07. Sending an automated follow-up to a client who already paid is a fast way to damage a professional relationship.

```bash
openclaw cron add \
  --name "Invoice Follow-Up Check" \
  --cron "0 8 * * 1" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Check my Gmail and Notion for outstanding invoices. Find any invoices that are 15 or more days past their due date and have not received payment. For each overdue invoice: note the client name, invoice number, amount, and days overdue. Draft a polite professional follow-up message for each. Present the full list to me for review. Do NOT send any emails. Do NOT contact any clients. Present drafts only and wait for my approval before taking any action." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify it worked:**
```
openclaw cron list
ID   Name                       Schedule        Timezone          Status
1    Morning Client Briefing    0 9 * * 1-5     America/Chicago   ✓ active
2    Invoice Follow-Up Check    0 8 * * 1       America/Chicago   ✓ active
```

---

### Automation 3 — End-of-Day Notion Project Digest

**What it does:** Every weekday at 6 PM Austin time, your agent reviews all active client projects in Notion, summarizes what moved forward today, flags any blocked items, and lists anything due tomorrow.

**Autonomy Tier: 🔔 NOTIFY** — Agent reads and summarizes only. Never modifies Notion records.

```bash
openclaw cron add \
  --name "Notion EOD Project Digest" \
  --cron "0 18 * * 1-5" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Review all active client project pages in my Notion workspace. For each project: summarize today's status, flag any items that are blocked or overdue, and list anything due in the next 24 hours. Keep it brief — one paragraph per project maximum. Do not modify any Notion pages. Report only." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify it worked:**
```
openclaw cron list
ID   Name                       Schedule        Timezone          Status
1    Morning Client Briefing    0 9 * * 1-5     America/Chicago   ✓ active
2    Invoice Follow-Up Check    0 8 * * 1       America/Chicago   ✓ active
3    Notion EOD Project Digest  0 18 * * 1-5    America/Chicago   ✓ active
```

**Finding your Telegram Chat ID** (needed for the `--to` flag above):

1. Send a message to your bot from your Telegram account.
2. Run `openclaw logs --follow` and look for `chat.id` in the output.
3. Substitute that number for `YOUR_TELEGRAM_CHAT_ID` in all three cron commands above.

---

## 07 | 💉 INJECT YOUR SOUL

> **ACTION:** Open `prompts_to_send.md` (in the same folder as this guide) and paste each prompt into the OpenClaw chat interface **one at a time, in order**. Wait for the agent to fully acknowledge each prompt before sending the next.

```bash
openclaw dashboard
```

This opens the web UI where you can chat directly with your agent. Work through the prompts in `prompts_to_send.md` in sequence:

1. **Identity Prompt** — establishes who the agent is and its primary mission
2. **Business Context Prompt** — loads your client workflow, Notion structure, and invoice process
3. **Skills Installation Prompt** — confirms installed skills and authorizes Notion/Gmail access
4. **Routines & Automations Prompt** — registers the three cron-driven workflows
5. **Guardrails & Safety Prompt** — sets hard limits on autonomous client communications
6. **Personality & Communication Style Prompt** — sets your preferred tone for briefings
7. **Security Audit Prompt** — final verification before going live

> 💡 **TIP:** Waiting for full acknowledgment between prompts matters. Each layer of configuration builds on the one before — rushing through them means the agent may not have absorbed the guardrails before you start using it for real client work.

---

## 08 | 🔒 SECURITY HARDENING

> ⚠️ **WARNING:** As a freelance designer, your OpenClaw instance will have access to client project data, invoice records, and professional email. Skipping this section means your agent could be accessed by anyone who discovers your Telegram bot username or finds your Mac Mini on your local network. Take 10 minutes and complete this section before using OpenClaw for real work.

### macOS-Specific Hardening

**Enable the macOS Firewall:**
```
System Settings > Network > Firewall → Turn On
```

**Verify gateway is bound to loopback only:**

Check your OpenClaw config and confirm `gateway.bind` is set to `127.0.0.1` (the default). This means the gateway only accepts connections from your own machine — not from other devices on your local network.

**Verify token authentication is active:**

As of v2026.1.29, auth mode "none" has been permanently removed. Run:
```bash
openclaw health
```
If you see "no auth configured", run `openclaw onboard` to reconfigure auth.

**Run the security audit:**
```bash
openclaw security audit --deep
openclaw security audit --fix
```

The `--fix` flag auto-tightens common misconfigurations — open DM policies, weak permissions, exposed gateway settings.

**Verify it worked:**
```
openclaw security audit --deep
Security Audit Complete
Critical warnings: 0
```

### Freelance-Specific Security Checklist

- [ ] FileVault is enabled (verified in Section 01)
- [ ] OpenClaw runs under its own dedicated macOS user account, not your personal account
- [ ] Telegram bot is `dmPolicy: allowlist` with only your numeric user ID in `allowFrom`
- [ ] Notion Integration Token is scoped only to the specific databases you authorized — not your entire workspace
- [ ] Google OAuth (`gog` skill) is authorized with the agent's own Google account, not your personal Google account
- [ ] Anthropic API spending limit is set in the console: $50/month max to start
- [ ] API keys are NOT stored in plain text in shell scripts, `.bashrc`, or any synced folder (iCloud Drive, Dropbox, etc.)
- [ ] API keys rotated quarterly (set a calendar reminder now)
- [ ] OpenClaw conversation logs retained in `~/.openclaw/` as your audit trail

---

## 09 | 🛡️ SECURITY AUDIT CHECKLIST

> **ACTION:** Run this audit before using OpenClaw for any real client work or live invoice operations.

```bash
openclaw security audit --deep
```

**Verify it worked:**
```
Security Audit Complete
Critical warnings: 0
Recommendations: X (review and address below)
```

```bash
openclaw security audit --fix
openclaw doctor
openclaw health
```

**Manual verification — check every item:**

- [ ] `openclaw security audit --deep` completes with **zero critical warnings**
- [ ] Gateway shows "running" with token authentication active
- [ ] `openclaw cron list` shows exactly 3 jobs: Morning Client Briefing, Invoice Follow-Up Check, Notion EOD Project Digest — and no unexpected entries
- [ ] `openclaw skills list` shows exactly: `skill-vetter`, `prompt-guard`, `agentguard`, `gog`, `notion`, `bookkeeper`, `agent-mail` — nothing else
- [ ] Telegram bot responds only to your Telegram account (test by asking someone to message your bot — they should get no response)
- [ ] No API keys stored in plain text — check `~/.openclaw/` and your shell config files (`~/.zshrc`, `~/.zprofile`)
- [ ] `openclaw skills list --verbose` — review permissions for each skill, flag anything unexpected
- [ ] macOS Firewall is enabled
- [ ] FileVault is enabled and showing "on"

**Do NOT begin using OpenClaw for live client work until all checks pass.**

---

## 10 | 🔧 TROUBLESHOOTING & NEXT STEPS

### Common Issues

**"command not found: openclaw" after installing**
```bash
source ~/.zshrc
# or open a new terminal window
```

**Gateway not responding**
```bash
openclaw doctor
openclaw gateway stop && openclaw gateway start
```

**Telegram bot not responding**
```bash
openclaw channels status
openclaw logs --follow
```
- Verify bot token is correct
- Confirm `dmPolicy: allowlist` has your numeric user ID (not your @username — usernames are not supported; it must be a number)
- Run `openclaw doctor --fix` to resolve any legacy `@username` entries in `allowFrom`

**Cron jobs not firing**
```bash
openclaw gateway status
openclaw cron list
openclaw cron run <job-id>   # manual test trigger
```
- Verify gateway is running
- Confirm timezone is `America/Chicago` (Austin, Texas)
- Check that your Telegram chat ID is correctly set in each job

**"Gateway dies after config-change restart"**
```bash
openclaw doctor
```
`openclaw doctor` often catches and fixes this automatically. If not, edit `~/Library/LaunchAgents/ai.openclaw.gateway.plist` to add the restart environment variable.

**High API costs / runaway agent**
- Check which sessions are consuming the most tokens
- For sub-tasks that do not need Opus-level reasoning, use Sonnet: add `--model "anthropic/claude-sonnet-4-6"` to your cron job flags
- Disable verbose logging if it was accidentally enabled

### Next Steps After Stable Setup

Once you have run the system for 1–2 weeks:

1. **Upgrade Invoice Follow-Up to Tier 3 (SUGGEST)** — After you have seen the Monday morning invoice digests for a few weeks and the drafts are consistently good, consider updating the automation to present drafts with inline Telegram approval buttons. You still approve every send; the friction is just lower.
2. **Add Notion project creation** — Ask your agent to create a new Notion project page every time you close a new client deal. Send it a message: "New client: [Name], project: [Brief], deadline: [Date]" and let it set up the full Notion structure.
3. **Context hygiene** — After week 5, use separate Telegram topics per major client so project context stays clean and does not bleed across client sessions.

---

## QUICK REFERENCE TABLE

| Item | Details |
|---|---|
| **Web UI** | `openclaw dashboard` (tokenized — do not type manually) |
| **Gateway Port** | 18789 |
| **Model** | `anthropic/claude-opus-4-6` |
| **Channel** | Telegram (dmPolicy: allowlist) |
| **Cron Timezone** | `America/Chicago` (Austin, TX) |
| **Installed Skills** | `skill-vetter`, `prompt-guard`, `agentguard`, `gog`, `notion`, `bookkeeper`, `agent-mail` |
| **Cron Jobs** | Morning Client Briefing (9 AM M–F), Invoice Follow-Up (8 AM Mon), Notion EOD Digest (6 PM M–F) |
| **OpenClaw Docs** | https://docs.openclaw.ai |
| **Security Audit** | `openclaw security audit --deep` |
| **Logs** | `openclaw logs --follow` |
| **Gateway Status** | `openclaw gateway status` |
| **Cron Jobs** | `openclaw cron list` |
| **Skills** | `openclaw skills list` |
| **Anthropic Console** | https://console.anthropic.com |
| **Tailscale (remote access)** | https://tailscale.com |
| **Security Issues** | security@openclaw.ai |

---

**OPENCLAW | Your Agent. Your Hardware. Your Soul.**
