# OpenClaw Engine Setup Guide
### Prepared for: Kaan — AI Startup Founder, San Francisco
### Generated: 2026-03-26

---

## Your Configuration at a Glance

| Parameter | Value |
|---|---|
| Hardware | Mac Mini (dedicated) |
| Channel | Telegram |
| AI Provider | Anthropic (Claude) |
| Primary use cases | Gmail email triage, GitHub dev tasks, Notion, morning briefing |
| Technical level | Very technical |
| Autonomy tier | Tier 2 (NOTIFY) default |

---

## PHASE 1 — Prepare Your Mac Mini

### 1.1 macOS System Settings

Update macOS first: **Apple menu > System Settings > General > Software Update**. Install everything and restart if prompted.

Configure the Mac Mini to stay awake 24/7 — since this is dedicated hardware, set:

- **System Settings > Energy**: enable "Prevent automatic sleeping when the display is off", enable "Wake for network access", enable "Start up automatically after a power failure"
- Install **Amphetamine** from the Mac App Store for more reliable sleep prevention. Launch it, go to Preferences, enable "Launch Amphetamine at login", set session duration to Indefinitely, enable "Start session after waking from sleep"

If running headless (no monitor): get an **HDMI dummy plug** (~$10). Without it, macOS behaves unpredictably in headless mode — Screen Recording permissions can break and screen capture can fail silently.

Enable remote access:
- **System Settings > General > Sharing**: enable Remote Login (SSH) and Screen Sharing (VNC)
- **System Settings > Users & Groups > Login Options**: set auto-login for the agent user

### 1.2 Create a Dedicated User Account

Never run OpenClaw under your personal macOS account. Create a separate account — it gets its own home directory, its own keychain, and its own file permissions. Also enable **FileVault disk encryption** (Apple menu > System Settings > Privacy & Security > FileVault). This protects all agent data, API keys, and memory files if the hardware is ever stolen.

**Important:** Give OpenClaw its own credentials where possible. Set up a dedicated Apple ID, Gmail account, and Google identity for the agent. Share only specific Google Docs, Sheets, and Drive folders rather than linking your personal accounts.

---

## PHASE 2 — Install Dependencies

### 2.1 Xcode Command Line Tools

```bash
xcode-select --install
```

Click Install in the dialog that appears and wait for it to finish.

### 2.2 Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After installation, add Homebrew to your PATH (Apple Silicon):

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
source ~/.zprofile
```

Verify: `brew --version`

### 2.3 Node.js

```bash
brew install node
```

Verify with `node --version` — you need v22.16 or higher. Add the correct path to avoid version conflicts:

```bash
echo 'export PATH="/opt/homebrew/opt/node@22/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile
```

---

## PHASE 3 — Install OpenClaw

### 3.1 Run the Installer

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Wait for "Installation finished successfully!" then verify:

```bash
openclaw --version
```

**Critical:** Confirm you are on version **2026.1.29 or later**. As of that release, `auth: "none"` has been permanently removed. The gateway now requires token or password authentication. If you see "gateway token missing" errors, run `openclaw onboard` to reconfigure.

### 3.2 Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag is required — it registers a launchd service so OpenClaw starts automatically on boot and runs continuously.

**At each wizard prompt:**

- **Gateway mode:** Choose **Local**
- **AI provider:** Enter your Anthropic API key (from console.anthropic.com). Claude Opus is recommended — it is the most capable model and worth the cost for a demanding startup workload. The model ID is `anthropic/claude-opus-4-6`
- **Messaging channels:** Start with **Telegram only** — get comfortable with the workflow before adding more channels
- **Hooks:** Enable all three — boot hook, command logger, and **session memory** (most important — saves context before the window fills)
- **Skills:** Skip for now — you will install them deliberately in Phase 5

### 3.3 Set API Spending Limits

Before going further: go to **console.anthropic.com > Billing** and set a monthly cap. Start at $50/month. A misconfigured agent or runaway loop can burn through credits quickly. You can raise the limit once you understand your usage patterns.

---

## PHASE 4 — Configure Telegram

### 4.1 Create Your Bot

On your phone, open Telegram and search for **@BotFather** (blue checkmark). Tap Start, then:

```
/newbot
```

- Display name: choose something you'll recognize (e.g., "Kaan's Ops Bot", "Atlas")
- Username: must end in "bot" and be globally unique (e.g., `kaan_ops_bot`)

BotFather will reply with your **bot token**. Copy it.

### 4.2 Configure the Token

Add the token to your OpenClaw config:

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "YOUR_BOT_TOKEN_HERE",
      dmPolicy: "allowlist",
      allowFrom: ["YOUR_NUMERIC_TELEGRAM_USER_ID"],
    },
  },
}
```

Use `dmPolicy: "allowlist"` with your explicit numeric user ID — this is more durable than the default pairing flow and keeps your access policy locked in config.

**To find your numeric Telegram user ID:**

1. DM your bot from Telegram
2. Run `openclaw logs --follow`
3. Look for `from.id` in the log output — that is your numeric ID

### 4.3 Approve the Pairing

```bash
openclaw pairing list telegram
openclaw pairing approve telegram <code>
```

Pairing codes expire after 1 hour. Once approved, message your bot and it will respond.

### 4.4 Enable Exec Approvals via Telegram

Since you are the sole operator, configure Telegram as your approval channel for higher-autonomy actions:

```json5
{
  channels: {
    telegram: {
      execApprovals: {
        enabled: true,
        approvers: ["YOUR_NUMERIC_TELEGRAM_USER_ID"],
        target: "dm",
      },
    },
  },
}
```

---

## PHASE 5 — Grant macOS Permissions

OpenClaw needs all three of these permissions to function correctly. Go to **System Settings > Privacy & Security** and grant access to the OpenClaw process for:

1. **Full Disk Access** — required to read and write files across the system
2. **Accessibility** — required to click, type, and control applications
3. **Screen Recording** — required for browser automation and screen capture

All three are required. Skipping any one will cause silent failures.

---

## PHASE 6 — Verify the Installation

```bash
openclaw gateway status
openclaw doctor
openclaw health
```

If health shows "no auth configured", go back and verify your API key is set.

Open the dashboard:

```bash
openclaw dashboard
```

This opens `http://127.0.0.1:18789/` with your gateway token pre-injected in the URL. **Do not** navigate to that address manually — you will get a "gateway token missing" error. Use `openclaw dashboard` to open it, then bookmark the tokenized URL.

---

## PHASE 7 — Install Skills

Skills expand agent permissions. Install them one at a time, in this exact order.

### 7.1 Install skill-vetter First (Mandatory)

```bash
clawhub install skill-vetter
```

`skill-vetter` scans any skill before you grant it machine access. Roughly 17–20% of community skills have been found to contain malicious or suspicious code. This is non-negotiable — run it before every subsequent install.

### 7.2 Vet and Install Each Skill

For every skill below, run the vetter first:

```bash
skill-vetter <skill-name>
# only proceed if vetter gives a clean result
clawhub install <skill-name>
```

**Install in this order:**

| # | Slug | Purpose | Credentials Required |
|---|---|---|---|
| 1 | `skill-vetter` | Security scanner — already installed | None |
| 2 | `prompt-guard` | Blocks prompt injection from emails, web pages, and docs | None |
| 3 | `agentguard` | Runtime behavioral guardrails — blocks unintended high-risk actions | None |
| 4 | `gog` | Gmail + Google Calendar + Drive + Docs + Sheets | Google Account (OAuth) |
| 5 | `notion` | Read/write Notion pages and databases | Notion Integration Token |
| 6 | `github` | GitHub CLI wrapper — issues, PRs, branches | GitHub Personal Access Token |
| 7 | `coding-agent` | Orchestrates Claude Code for delegated coding tasks | Claude API Key (re-use existing) |

**Why prompt-guard matters for your setup:** The moment your agent starts reading Gmail, GitHub notifications, or Notion pages, it is consuming external content that could contain adversarial instructions. `prompt-guard` is what stops that content from hijacking the agent.

### 7.3 Credential Setup for Each Skill

**gog (Gmail/Google):**
- Go to Google Cloud Console and create an OAuth 2.0 credential for your dedicated agent Google account
- Scope: Gmail (read/modify), Calendar (read), Drive (read/write)
- Run `clawhub configure gog` and follow the OAuth flow

**notion:**
- Go to notion.so/my-integrations and create a new integration
- Copy the Internal Integration Token
- Share the specific Notion databases/pages you want the agent to access (do not share your entire workspace)
- Run `clawhub configure notion` and paste the token

**github:**
- Go to github.com/settings/tokens (classic) or fine-grained tokens
- Scopes needed: `repo`, `read:org`, `read:user`
- Run `clawhub configure github` and paste the token

---

## PHASE 8 — Set Up Cron Jobs (Automation)

All cron jobs use your Telegram chat ID as the delivery target. Replace `YOUR_TELEGRAM_CHAT_ID` with your numeric Telegram user ID.

### 8.1 Morning Briefing (Daily, 7:00 AM PT)

```bash
openclaw cron add \
  --name "Morning Briefing" \
  --cron "0 7 * * 1-5" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Execute morning briefing per standing orders. Check Gmail for urgent emails from the last 12 hours. Check GitHub for open PRs needing review and any CI failures on main branches. Check Notion for tasks due today or overdue. Check today's calendar for meetings and prep needed. Generate a concise briefing: top 3 priorities, urgent items, blockers. Keep it under 20 lines." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

### 8.2 Email Triage (Weekday mornings, 8:00 AM PT)

```bash
openclaw cron add \
  --name "Email Triage" \
  --cron "0 8 * * 1-5" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Execute email triage per standing orders. Scan Gmail inbox for new messages since yesterday 8 AM. Categorize each: URGENT (respond today), ACTION (respond this week), FYI (read-only), ARCHIVE (newsletters/promos). For URGENT items: draft a response and present it for review. Report summary only — do not send any emails autonomously." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

### 8.3 GitHub Dev Pulse (Weekdays, 9:00 AM PT)

```bash
openclaw cron add \
  --name "GitHub Dev Pulse" \
  --cron "0 9 * * 1-5" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Execute GitHub dev pulse per standing orders. Check all repos I own or am a member of: open PRs waiting for my review, PRs I've authored that need attention, recent CI failures on default branches, issues assigned to me, and any new issues with 'urgent' or 'bug' labels created in the last 24 hours. Report a concise summary with direct links. Flag anything blocking a merge." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

### 8.4 End-of-Day Notion Task Sync (Weekdays, 6:00 PM PT)

```bash
openclaw cron add \
  --name "Notion Task Sync" \
  --cron "0 18 * * 1-5" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Execute end-of-day task review per standing orders. Review my Notion task database: mark any tasks I mentioned completing today as done (based on our conversations today), flag any tasks due tomorrow, and list the top 3 priorities for tomorrow morning. Report the update summary — do not modify any task status without confirmation unless the task was explicitly marked done in today's session." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

### 8.5 Verify All Cron Jobs Are Registered

```bash
openclaw cron list
```

You should see all four jobs listed and enabled.

---

## PHASE 9 — Configure Standing Orders

Standing orders give the agent permanent operating authority within defined boundaries. They live in your agent workspace at `~/openclaw-workspace/AGENTS.md` (or equivalent). See the reference document at `reference_documents/STANDING_ORDERS_TEMPLATE.md` for a complete template pre-configured for your use cases.

The key principle: standing orders define **what** the agent is authorized to do; cron jobs define **when** it executes. They work together.

---

## PHASE 10 — Security Hardening

### 10.1 Enable macOS Firewall

**System Settings > Network > Firewall** — turn it on.

Verify your gateway is bound to loopback only (not exposed to the network):

```bash
grep -i "gateway.bind\|bind" ~/.openclaw/config.json5
```

It should show `127.0.0.1` or `localhost`. If it shows `0.0.0.0`, fix it immediately.

### 10.2 Remote Access via Tailscale

For secure remote access to your Mac Mini without port forwarding, install Tailscale (tailscale.com — free). This lets you SSH into your Mac Mini from anywhere on a private network. Do not expose the OpenClaw gateway port to the public internet.

### 10.3 Run the Security Audit

```bash
openclaw security audit --deep
openclaw security audit --fix
```

The audit catches common misconfigurations — open DM policies, exposed gateway, weak auth. The `--fix` flag auto-tightens what it can. Review the output carefully.

---

## PHASE 11 — Verify Everything End-to-End

```bash
openclaw gateway status       # Gateway running?
openclaw doctor                # Config and auth issues?
openclaw health                # All systems healthy?
openclaw channels status       # Telegram connected?
openclaw cron list             # All 4 cron jobs registered?
openclaw models status         # Anthropic auth active?
```

Send your bot a test message in Telegram: "Hello, are you there?" — it should respond within a few seconds.

Manually trigger the morning briefing to confirm it works:

```bash
openclaw cron run <morning-briefing-job-id>
```

---

## Troubleshooting Reference

| Symptom | Fix |
|---|---|
| `command not found: openclaw` | Run `source ~/.zshrc` or open a new terminal |
| "gateway token missing" in browser | Use `openclaw dashboard` not the raw URL |
| Gateway dies after restart | Run `openclaw doctor` — it usually fixes launchd config issues |
| `auth: "none"` error | Run `openclaw onboard` to reconfigure; this mode was removed in v2026.1.29 |
| High API costs | Check which agents are consuming tokens; switch sub-tasks to `anthropic/claude-sonnet-4-6` |
| Telegram bot not responding | Run `openclaw channels status`, check `openclaw logs --follow` |
| `sharp` errors during install | Run `SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g openclaw@latest` |
| Old YouTube tutorial not working | Auth mode `none` was removed — run `openclaw onboard` to reconfigure |

---

## Useful Links

- GitHub: github.com/openclaw/openclaw
- Anthropic Console: console.anthropic.com
- ClawHub Skills: clawhub.ai
- Homebrew: brew.sh
- Tailscale: tailscale.com
- Amphetamine: Mac App Store
- Telegram BotFather: @BotFather in Telegram
- Node.js: nodejs.org
