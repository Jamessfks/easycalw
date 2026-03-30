# OPENCLAW ENGINE SETUP GUIDE

**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Coffee Shop Owner — Portland, OR |
| **MISSION** | Manage inventory and orders for your coffee shop with a 24/7 AI assistant |
| **DATE** | 2026-03-27 |
| **DEPLOYMENT** | Mac Mini (Dedicated Hardware) |
| **CHANNEL** | Telegram |
| **MODEL** | Anthropic Claude (Opus) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

**This guide configures your OpenClaw agent to track inventory levels, flag low-stock items, and keep your Portland coffee shop's ordering workflow organized — built around a small business workflow that runs even when you're pulling shots behind the bar.**

---

## 🎯 Key Moments — What You Will Accomplish

By the end of this guide, you will have:

- **A running OpenClaw instance** on your Mac Mini, connected to Telegram and ready for daily use
- **3 tailored automations** that handle morning inventory checks, daily order reminders, and end-of-day summaries without manual intervention
- **Small-business guardrails** ensuring your agent operates safely as a single-owner shop assistant

---

## 00 | ✅ PRE-FLIGHT CHECKLIST

> ✅ **ACTION:** Complete every item below **before** running a single command. Missing prerequisites will cause you to backtrack and cost you time.

### Accounts to Create
- [ ] **Anthropic account** — Create at [console.anthropic.com](https://console.anthropic.com). You need an API key. Set a monthly spending limit of **$20–$50** to start.
- [ ] **Telegram account** — Install the Telegram app on your phone if you haven't already. It's free.
- [ ] **Google account (dedicated)** — Create a separate Gmail/Google account for your agent. This keeps your personal Google account separate from your shop's AI assistant.

### API Keys to Obtain
- [ ] **Anthropic API Key** — In the Anthropic console: API Keys → Create Key. Copy it and save it somewhere secure (a password manager like 1Password or even a sticky note locked in your office drawer).
- [ ] **Google OAuth** — Required later for inventory tracking via Google Sheets. Set up during skill installation in Section 05.

### Hardware & Software
- [ ] Mac Mini is powered on and connected to the internet
- [ ] You can open the **Terminal** app on the Mac Mini (press Cmd+Space, type "Terminal", press Enter)
- [ ] You have your Telegram app open on your phone
- [ ] HDMI dummy plug inserted if running headless (no monitor connected) — available for $8–10 on Amazon

> 💡 **TIP:** Gather all your API keys in a notes app or password manager before starting. Switching between browser tabs mid-setup is the #1 cause of copy-paste errors.

---

## 01 | 🖥️ PLATFORM SETUP

These steps prepare your Mac Mini to run OpenClaw reliably — 24 hours a day, 7 days a week, even when you're not there.

> ⚠️ **WARNING:** OpenClaw runs with broad system permissions on your Mac Mini. **Do not install it on your personal Mac** if that machine has your iCloud photos, personal passwords, or banking apps synced. Use only the dedicated Mac Mini for your shop.

### 1A — Update macOS

Open **Apple menu → System Settings → General → Software Update** and install everything. Restart if prompted. This prevents known security gaps and ensures Homebrew installs cleanly.

**Verify it worked:** Your Mac Mini shows "macOS is up to date" in Software Update.

### 1B — Create a Dedicated User Account

**Apple menu → System Settings → Users & Groups → Add Account**

Create a user named something like `shopagent`. Never run OpenClaw under your personal macOS account. A separate account gives it its own home directory and file permissions — so even if something goes wrong with the agent, your personal files are untouched.

### 1C — Enable FileVault Disk Encryption

**System Settings → Privacy & Security → FileVault → Turn On FileVault**

This encrypts your entire Mac Mini disk. If someone physically takes the machine (from your shop or a break-in), they cannot read your API keys, inventory files, or agent data. It takes about 30 minutes to encrypt the first time — start it before bed.

> ⚠️ **WARNING:** Save your FileVault recovery key somewhere safe and offline. If you lose it and forget your password, the disk cannot be recovered.

### 1D — Configure Always-On Settings

Your Mac Mini needs to stay awake around the clock to receive Telegram messages and run automations. Open **System Settings → Energy** and enable:

- "Prevent automatic sleeping when the display is off"
- "Wake for network access"
- "Start up automatically after a power failure"

Then install **Amphetamine** from the Mac App Store (it's free). Launch it — it appears as a pill icon in the menu bar. Go to Preferences and enable:
- "Launch Amphetamine at login"
- "Start session when Amphetamine launches" — set duration to **Indefinitely**
- "Start session after waking from sleep"

> 💡 **TIP:** Between the Energy settings and Amphetamine, your Mac Mini will stay awake through anything short of a power outage. This matters because your Telegram messages and cron automations won't fire if the machine is asleep.

**Verify it worked:** The Amphetamine pill icon appears in your menu bar with a green indicator.

### 1E — Enable Remote Access

**System Settings → General → Sharing → Remote Login** — Turn on. This enables SSH so you can manage the machine remotely from another computer if needed. Also enable **Screen Sharing** for occasional graphical tasks.

**System Settings → Users & Groups → Login Options** — Set automatic login to your `shopagent` account so the machine boots into the right user automatically after a power outage.

---

## 02 | 📦 INSTALL OPENCLAW

### 2A — Install Xcode Command Line Tools

Open **Terminal** and run:

```bash
xcode-select --install
```

A dialog box will appear on screen — click **Install** and wait a few minutes. This gives your Mac the compilers that everything else needs.

**Verify it worked:**
```
$ xcode-select -p
/Library/Developer/CommandLineTools
```

### 2B — Install Homebrew

Homebrew is a package manager — it makes installing Node.js and other tools simple.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the on-screen prompts. After it finishes, add Homebrew to your PATH (required on Apple Silicon M1/M2/M3/M4):

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

If the version is lower, run `brew upgrade node`.

### 2D — Run the OpenClaw Installer

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Wait until you see **"Installation finished successfully!"** — this can take 2–5 minutes.

**Verify it worked:**
```
$ openclaw --version
openclaw v2026.x.x   ← any version 2026.1.29 or later
```

> ⚠️ **WARNING:** You need version **2026.1.29 or later**. Earlier versions allowed unauthenticated gateway access — a serious security gap. If the installer gives you an older version, run `brew upgrade openclaw` or re-run the installer.

### 2E — Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag is critical. It sets up a background service so OpenClaw starts automatically every time your Mac Mini boots — even after power outages.

**At each wizard prompt, choose:**

| Prompt | Recommended Choice |
|---|---|
| Gateway mode | **Local** (not Remote) |
| AI provider | **Anthropic** — paste your API key when asked |
| Model | **Claude Opus** — the smartest, most conversational model |
| Messaging channels | **Telegram** — set up fully in Section 03 |
| Hooks | Enable **session memory**, **boot hook**, and **command logger** — all three |
| Skills | **Skip for now** — install deliberately in Section 05 |

> ✅ **ACTION:** When the wizard shows the security acknowledgment screen, select **"Yes"** to confirm you are the sole operator of this agent.

**Verify it worked:**
```
$ openclaw gateway status
Gateway: running   Auth: token   Port: 18789
```

---

## 03 | 📱 CONNECT YOUR CHANNEL (TELEGRAM)

Telegram is where you'll send tasks to your agent and receive its replies — from anywhere, on your phone.

### 3A — Create Your Telegram Bot

Do this on your phone with Telegram installed:

1. Open Telegram and search for **@BotFather** — look for the blue checkmark to confirm it's the real one
2. Tap **Start**
3. Type `/newbot` and send it
4. When BotFather asks for a **display name**, type something memorable like `Shop Assistant` or `BrewBot`
5. When it asks for a **username**, it must end in "bot" — something like `MyShopBrewbot` (must be globally unique)
6. BotFather will reply with a success message containing your **bot token** — it looks like `1234567890:ABCdef...`

Copy that token — you'll need it in the next step.

### 3B — Add the Bot Token to OpenClaw

Back on your Mac Mini's Terminal:

```bash
openclaw onboard --channel telegram
```

Paste your bot token when prompted.

Then start the gateway and check for pairing:

```bash
openclaw gateway restart
openclaw pairing list telegram
openclaw pairing approve telegram <code>
```

> 💡 **TIP:** Pairing codes expire after 1 hour. If yours expires, run `openclaw pairing list telegram` again to get a fresh one.

**Verify it worked:**
```
$ openclaw channels status
telegram   ✓ connected
```

### 3C — Lock Down Access (IMPORTANT)

> ⚠️ **WARNING:** Without this step, anyone who discovers your bot's username can send it commands. A stranger could theoretically instruct your agent to do things on your Mac Mini.

Set your DM policy to allowlist mode so only your account can talk to the bot:

First, find your Telegram user ID. Send any message to your bot, then run:

```bash
openclaw logs --follow
```

Look for `from.id` in the log output — that number is your Telegram user ID. Note it down.

Then edit your OpenClaw config (`~/.openclaw/config.json5`) and add:

```json5
{
  channels: {
    telegram: {
      dmPolicy: "allowlist",
      allowFrom: ["YOUR_TELEGRAM_USER_ID_HERE"],
    },
  },
}
```

Restart the gateway:

```bash
openclaw gateway restart
```

Now message your bot in Telegram — it should respond. Messages from any other account will be silently blocked.

---

## 04 | 🧠 CONFIGURE YOUR MODEL PROVIDER (ANTHROPIC)

```bash
openclaw models status
```

**Verify it worked:**
```
Provider: anthropic   Status: ✓ active   Model: claude-opus-4-20250514
```

If not configured, run:

```bash
openclaw onboard --anthropic "YOUR_ANTHROPIC_API_KEY"
```

> 💡 **TIP:** Set a monthly spending cap in your [Anthropic console](https://console.anthropic.com) under **Billing → Usage Limits**. For a coffee shop inventory and order assistant, typical usage is **$10–$30/month**. Start with a $30 cap and adjust after your first month.

---

## 05 | 🔧 INSTALL SKILLS

> ⚠️ **WARNING:** Always install `skill-vetter` first and use it to screen every subsequent skill before installing it. Approximately 17–20% of community skills have been found to contain suspicious or malicious code (the ClawHavoc attack in Feb 2026 injected 1,184 malicious skills into the registry). Scan first, install second — no exceptions.

### Phase 1: Security Stack (Install First — No Exceptions)

```bash
clawhub install skill-vetter
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
```

Now vet and install your prompt injection defense:

```bash
skill-vetter prompt-guard
clawhub install prompt-guard
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
prompt-guard   v1.x.x   ✓ active
```

### Phase 2: Core Skills for Your Coffee Shop

| Your Need | Skill | What It Does |
|---|---|---|
| Inventory tracking via spreadsheet | `gog` | Google Workspace integration — manage a Google Sheet as your inventory tracker |
| Order reminders | `apple-reminders` | Create and manage reminders directly from Telegram chat |
| Weather awareness (Portland foot traffic) | `weather` | Daily Portland weather so you can anticipate busy/slow days |
| Multi-step automations | `automation-workflows` | Build "if inventory low → send reminder" workflows without coding |

Install each one — vetting first:

```bash
skill-vetter gog
clawhub install gog

skill-vetter apple-reminders
clawhub install apple-reminders

skill-vetter weather
clawhub install weather

skill-vetter automation-workflows
clawhub install automation-workflows
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter         v1.x.x   ✓ active
prompt-guard         v1.x.x   ✓ active
gog                  v1.x.x   ✓ active
apple-reminders      v1.x.x   ✓ active
weather              v1.x.x   ✓ active
automation-workflows v1.x.x   ✓ active
```

> 💡 **TIP:** The `gog` skill requires Google OAuth authorization. When you first use it, your agent will send you a Google authorization link via Telegram. Open it and authorize using your dedicated shop Google account (not your personal one).

---

## 06 | ⚡ CONFIGURE AUTOMATIONS

> 💡 **TIP:** These automations replace the mental overhead of remembering to check your stock every morning and confirming orders every day. Once set up, your agent does this for you — even on the mornings you're running late.

> ☕ **SMALL BUSINESS NOTE:** As a single-owner coffee shop, your agent is in **NOTIFY** tier for all automations below — it will always message you with information and wait for your confirmation before any ordering action. You stay in full control.

### Automation 1 — Morning Inventory Check

**What it does:** Every morning at 7:00 AM, your agent checks your inventory Google Sheet, identifies any items below your defined minimum stock level, and sends you a Telegram summary before the shop opens.

**Autonomy Tier: 🔔 NOTIFY** — Agent reads your sheet and reports. It does not order anything.

```bash
openclaw cron add \
  --name "Morning Inventory Check" \
  --cron "0 7 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Check the inventory Google Sheet. List any items that are below minimum stock levels. Format as a short Telegram message: item name, current stock, minimum needed. End with: 'Do you want me to draft a supply order?'" \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                      Schedule    Timezone              Status
1    Morning Inventory Check   0 7 * * *   America/Los_Angeles   ✓ active
```

### Automation 2 — Weekly Order Reminder

**What it does:** Every Monday at 9:00 AM, your agent sends a reminder to place your weekly supplier order so you're never caught short mid-week.

**Autonomy Tier: 🔔 NOTIFY** — Agent sends a reminder message only.

```bash
openclaw cron add \
  --name "Weekly Order Reminder" \
  --cron "0 9 * * 1" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Send a friendly reminder that today is Monday and it's time to review and place the weekly supplier order. Check the inventory sheet for items that need restocking this week." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                      Schedule    Timezone              Status
1    Morning Inventory Check   0 7 * * *   America/Los_Angeles   ✓ active
2    Weekly Order Reminder     0 9 * * 1   America/Los_Angeles   ✓ active
```

### Automation 3 — End-of-Day Summary

**What it does:** Every day at 6:00 PM, your agent sends you a brief summary of what happened today and any items that need attention before tomorrow.

**Autonomy Tier: 🔔 NOTIFY** — Agent summarizes and notifies only.

```bash
openclaw cron add \
  --name "End-of-Day Summary" \
  --cron "0 18 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Send an end-of-day summary for the coffee shop. Check the inventory sheet for anything that ran low today. Check the weather for Portland tomorrow. Keep the message brief and actionable — 3 to 5 bullet points maximum." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

> 💡 **TIP:** To find your Telegram Chat ID, send any message to your bot, then run `openclaw logs --follow` and look for `chat.id` in the output. That number (it could be negative for groups) is your Chat ID.

**Verify all automations are active:**
```
$ openclaw cron list
ID   Name                      Schedule     Timezone              Status
1    Morning Inventory Check   0 7 * * *    America/Los_Angeles   ✓ active
2    Weekly Order Reminder     0 9 * * 1    America/Los_Angeles   ✓ active
3    End-of-Day Summary        0 18 * * *   America/Los_Angeles   ✓ active
```

---

## 07 | 💉 INJECT YOUR SOUL

This section sends prompts to your agent through the OpenClaw dashboard to give it its identity and configure its behavior for your coffee shop.

> ✅ **ACTION:** Open `prompts_to_send.md` (in the same folder as this guide) and paste each prompt into the OpenClaw chat interface **one at a time, in order**. Wait for the agent to acknowledge each prompt before sending the next.

```bash
openclaw dashboard
```

This opens a tokenized URL in your browser at `http://127.0.0.1:18789/`. **Do not type this URL manually** — always use `openclaw dashboard`. Bookmark the URL it opens for you.

**Prompt sequence:**
1. **Identity Prompt** → establishes who the agent is and its role in your shop
2. **Inventory Knowledge Prompt** → teaches the agent how your inventory is organized
3. **Communication Style Prompt** → sets the tone for how it messages you
4. **Security Audit Prompt** → final verification before going live

> 💡 **TIP:** Wait for the agent to say something like "Understood" or "Got it" after each prompt before sending the next. This confirms each layer of configuration has been absorbed into the session context.

---

## 08 | 🔒 SECURITY HARDENING

> ⚠️ **WARNING:** Do not skip this section. Your Mac Mini is running a server (the OpenClaw gateway) that can execute commands, access files, and send messages on your behalf. A misconfigured gateway is a real security risk.

### macOS Firewall

**System Settings → Network → Firewall** — Turn it on.

Your gateway should only accept connections from your own machine (loopback). Verify this in your config:

```bash
cat ~/.openclaw/config.json5 | grep bind
```

The `gateway.bind` value should be `127.0.0.1` — not `0.0.0.0`.

### Verify Token Authentication

As of v2026.1.29, auth mode "none" has been permanently removed. Verify your gateway requires authentication:

```bash
openclaw gateway status
```

You should see `Auth: token` — not `Auth: none`.

### Remote Access via Tailscale (Recommended)

If you ever want to manage your Mac Mini remotely (from home, or while traveling for a coffee conference), install **Tailscale** (free at tailscale.com). It creates a secure private network between your devices without any port forwarding.

### Small Business Security Checklist

- [ ] FileVault disk encryption enabled (Section 01C)
- [ ] Dedicated user account created for the agent (Section 01B)
- [ ] Telegram DM policy set to `allowlist` with only your user ID (Section 03C)
- [ ] macOS Firewall enabled
- [ ] Gateway bind set to `127.0.0.1` (loopback only)
- [ ] Gateway auth mode is `token` (not `none`)
- [ ] Anthropic API spending limit set in the console
- [ ] API keys stored only in `~/.openclaw/` — not in plain text files on the Desktop
- [ ] API keys rotated every 90 days (set a reminder)

---

## 09 | 🔍 SECURITY AUDIT CHECKLIST

> ✅ **ACTION:** Run this full audit before using OpenClaw for real shop operations.

```bash
openclaw security audit --deep
```

**Verify it worked:**
```
Security Audit Complete
Critical warnings: 0
Recommendations: X (review below)
```

Then run auto-fix and verify system health:

```bash
openclaw security audit --fix
openclaw doctor
openclaw health
```

**Manual verification — check each item:**
- [ ] `openclaw security audit --deep` completes with **zero critical warnings**
- [ ] Gateway shows `Auth: token` — not `none`
- [ ] `openclaw cron list` shows exactly 3 jobs — no unexpected entries
- [ ] `openclaw skills list` shows exactly: `skill-vetter`, `prompt-guard`, `gog`, `apple-reminders`, `weather`, `automation-workflows`
- [ ] Telegram bot only responds to your account (test by asking a friend to message it — it should not reply)
- [ ] No API keys stored in plain text — check `~/.openclaw/` with `ls -la ~/.openclaw/`
- [ ] FileVault status: `fdesetup status` shows "FileVault is On"
- [ ] Review skill permissions: `openclaw skills list --verbose`

**Do NOT begin using this for real shop operations until all checks pass.**

---

## 10 | 🚀 TROUBLESHOOTING & NEXT STEPS

### Common Issues

**"command not found: openclaw" after installing**
```bash
source ~/.zshrc
```
Or open a new Terminal window.

**"sharp" errors during install**
```bash
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g openclaw@latest
```
Also make sure Xcode Command Line Tools are installed: `xcode-select --install`

**Gateway not responding**
```bash
openclaw doctor
openclaw gateway stop && openclaw gateway start
```

**Telegram bot not responding**
- Verify bot token: `openclaw channels status`
- Check logs: `openclaw logs --follow`
- Confirm your Telegram user ID is in the allowlist (Section 03C)

**Cron jobs not firing**
- Verify gateway is running: `openclaw gateway status`
- Check schedule: `openclaw cron list`
- Test a job manually: `openclaw cron run <job-id>`
- Make sure the Mac Mini is not sleeping (check Amphetamine — is the icon green?)

**Old tutorial isn't working**
If you followed an older guide that configured `auth: "none"`, run:
```bash
openclaw onboard
```
Or manually set `gateway.auth_mode` to `"token"` in your config and run `openclaw doctor --generate-gateway-token`.

### Next Steps After a Stable First Week

Once you've run the system for 1–2 weeks:

1. **Set up your inventory Google Sheet** — Create a sheet with columns: Item Name, Category, Current Stock, Minimum Stock, Supplier, Notes. Share it with your dedicated shop Google account. Tell the agent "Here is the Google Sheet URL for my inventory: [URL]."
2. **Add supplier contacts** — Tell the agent your supplier names and what you order from each. It will use this context when drafting order summaries.
3. **Try voice notes** — Telegram supports voice messages. You can send your agent a voice note saying "We're getting low on oat milk" and it will update your inventory sheet.

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI URL** | `openclaw dashboard` (tokenized — never type the URL manually) |
| **Gateway Port** | 18789 |
| **Model Provider** | Anthropic (`claude-opus-4-20250514`) |
| **Channel** | Telegram |
| **Cron Timezone** | `America/Los_Angeles` |
| **OpenClaw Docs** | https://docs.openclaw.ai |
| **Security Audit** | `openclaw security audit --deep` |
| **Logs** | `openclaw logs --follow` |
| **Gateway Status** | `openclaw gateway status` |
| **Cron Jobs** | `openclaw cron list` |
| **Installed Skills** | `openclaw skills list` |
| **Anthropic Console** | https://console.anthropic.com |
| **Telegram BotFather** | @BotFather in Telegram |

---

**OPENCLAW | Your Agent. Your Hardware. Your Soul.**
