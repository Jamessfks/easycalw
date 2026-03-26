# OPENCLAW ENGINE SETUP GUIDE

**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Scouts Coffee — San Francisco, CA |
| **MISSION** | Automate staff scheduling coordination and supplier order management for an 8-person coffee shop |
| **DATE** | 2026-03-26 |
| **DEPLOYMENT** | Mac Mini (Dedicated Hardware) |
| **CHANNEL** | Telegram |
| **MODEL** | Anthropic Claude (`claude-sonnet-4-6`) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

**This guide configures your OpenClaw agent to eliminate the daily scheduling grind and supplier order chaos that eats into your time as a coffee shop owner — built around your food & beverage workflow and the tools you already use.**

---

## 🎯 Key Moments — What You Will Accomplish

By the end of this guide, you will have:

- **A running OpenClaw instance** on your Mac Mini, connected to Telegram and delivering you a morning briefing every day before the first shift
- **3 tailored automations** that handle daily staff schedule checks, weekly supplier reorder reviews, and end-of-week scheduling drafts — without you having to open a single spreadsheet
- **Food-service guardrails** ensuring your agent never autonomously contacts suppliers, modifies payroll data, or acts on orders without your explicit approval

---

## 00 | ✅ PRE-FLIGHT CHECKLIST

> ✅ **ACTION:** Complete every item below **before** running a single command. Missing prerequisites will cause you to backtrack and cost you time.

### Accounts to Create
- [ ] **Anthropic account** — Create at [console.anthropic.com](https://console.anthropic.com). You need an API key. Set a monthly spending limit of **$30–$50** to start — typical usage for a coffee shop operation is $10–$25/month.
- [ ] **Telegram account** — Install the Telegram app on your phone if you haven't already (free at telegram.org).
- [ ] **Google account for OpenClaw** — Create a *dedicated* Google account (e.g. `scouts-agent@gmail.com`) separate from your personal Gmail. This is important: only share specific calendars and Drive folders with it — not your whole account.
- [ ] **Tavily account** — Free tier at [tavily.com](https://tavily.com) for web search capability. You'll use this to look up supplier info and pricing.

### API Keys to Obtain
- [ ] **Anthropic API Key** — In your Anthropic Console: go to **API Keys → Create Key**. Name it "scouts-coffee-openclaw". Copy it somewhere safe (a password manager like 1Password or Bitwarden is ideal).
- [ ] **Tavily API Key** — After signing up, navigate to your dashboard and copy your API key.
- [ ] **Telegram Bot Token** — You'll create this during setup in Section 03. Leave this blank for now.

### Hardware & Software
- [ ] Mac Mini powered on and connected to your network
- [ ] A monitor, keyboard, and mouse connected *for initial setup only* — you can go headless afterwards
- [ ] macOS is up to date (Apple menu → System Settings → General → Software Update)
- [ ] You have the macOS admin password handy
- [ ] HDMI dummy plug ordered or available (critical if running headless — see Section 01)

> 💡 **TIP:** Gather all API keys in a password manager before starting. The setup wizard will ask for your Anthropic key at a key moment — having it ready prevents a frustrating context switch mid-install.

---

## 01 | 🖥️ PLATFORM SETUP

These steps prepare your Mac Mini to run OpenClaw reliably, 24/7 — even when the espresso machine is going full blast and the power flickers.

> 🍽️ **Food Service Note:** As a food-service business, you may store supplier contacts, staff schedules, and cost data on this machine. Enable FileVault disk encryption (Step 1A) before proceeding. If your Mac Mini were ever physically stolen from the back office, FileVault ensures no one can read your data without your password.

> ⚠️ **WARNING:** Never run OpenClaw under your personal macOS account. Create a dedicated account for it. This gives OpenClaw its own home directory, its own keychain, and its own file permissions — keeping it isolated from your personal data.

### 1A — Create a Dedicated User Account

In **System Settings → Users & Groups**, click **Add Account**. Create a standard user named something like `openclaw` or `scouts-agent`. Give it a strong password and write it down in your password manager.

Then log into that account for all remaining steps in this guide.

### 1B — Enable FileVault Disk Encryption

In **System Settings → Privacy & Security → FileVault**, click **Turn On FileVault**. Follow the prompts. Save your recovery key securely — this is your last resort if you forget the password.

```
Expected time: ~30 minutes for initial encryption
You can continue setup while it encrypts in the background.
```

**Verify it worked:**
```
System Settings → Privacy & Security → FileVault
Status: "FileVault is turned on"
```

### 1C — Configure Always-On Sleep Settings

> 💡 **TIP:** Why this matters for Scouts Coffee: a Mac Mini that sleeps will miss your 6:30am morning briefing automation, and your Telegram messages will go unanswered during peak hours. This is non-negotiable for a coffee shop that opens early.

Open **System Settings → Energy** and enable all of the following:
- ✅ Prevent automatic sleeping when the display is off
- ✅ Wake for network access
- ✅ Start up automatically after a power failure

Then install **Amphetamine** from the Mac App Store (free). After installing:
1. Launch Amphetamine — it appears as a pill icon in the menu bar
2. Go to **Preferences** → enable "Launch Amphetamine at login"
3. Enable "Start session when Amphetamine launches" → set duration to **Indefinitely**
4. Enable "Start session after waking from sleep"

### 1D — Enable Remote Access (SSH)

In **System Settings → General → Sharing**:
- Enable **Remote Login** (SSH) — this is how you'll manage the machine without a monitor
- Enable **Screen Sharing** (VNC) — for occasional graphical tasks

In **System Settings → Users & Groups → Login Options**: enable automatic login for your `openclaw` account.

### 1E — HDMI Dummy Plug (If Running Headless)

If you're running the Mac Mini without a monitor attached (recommended for the back office), plug an HDMI dummy plug into the HDMI port. Without it, macOS behaves strangely in headless mode — screen capture breaks, GUI apps won't render, and OpenClaw's browser automation can fail silently.

An HDMI dummy plug costs $8–10 on Amazon. Search "HDMI dummy plug 4K".

**Verify your setup is complete:**
```
$ ssh openclaw@<your-mac-mini-ip>
# You should connect successfully
Last login: [date]
```

---

## 02 | 📦 INSTALL OPENCLAW

![OpenClaw Web UI](templates/images/image6.png)

### 2A — Install Xcode Command Line Tools

Open **Terminal** (press Cmd+Space, type "Terminal") on your Mac Mini and run:

```bash
xcode-select --install
```

A dialog will appear — click **Install** and wait a few minutes. This gives you the compilers Homebrew needs.

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

Wait for "Installation finished successfully!" then verify:

**Verify it worked:**
```
$ openclaw --version
openclaw v2026.x.x   ← must be 2026.1.29 or later
```

> ⚠️ **WARNING:** You need version **2026.1.29 or later**. Earlier versions had a security gap allowing unauthenticated gateway access. If you ever see a "gateway auth error" after an update, run `openclaw onboard` to reconfigure.

### 2E — Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag is critical — it sets up a **launchd service** so OpenClaw starts automatically every time your Mac Mini boots, even after a power outage.

**At each wizard prompt, choose:**

| Prompt | Recommended Choice |
|---|---|
| Gateway mode | **Local** (not Remote) |
| AI provider | **Anthropic API key** — paste your key from the pre-flight checklist |
| Model | **`claude-sonnet-4-6`** — best balance of speed and cost for daily coffee shop ops |
| Messaging channels | **Telegram** — set up in Section 03 |
| Hooks | Enable **session memory**, **boot hook**, and **command logger** — all three |
| Skills | **Skip for now** — you'll install skills deliberately in Section 05 |

![Security Handshake](templates/images/image12.png)

> ✅ **ACTION:** When the wizard shows the security acknowledgment screen, select **"Yes"** to confirm you are the sole operator of this instance.

### 2F — Grant macOS Permissions

This is where most people get stuck. OpenClaw needs three permissions to function:

In **System Settings → Privacy & Security**, grant the `openclaw` process:
1. **Full Disk Access** — so it can read and write files
2. **Accessibility Access** — so it can control apps for you
3. **Screen Recording** (if you plan to use browser automation later)

**Verify everything is running:**
```bash
openclaw gateway status
openclaw doctor
openclaw health
```

**Expected output from `openclaw health`:**
```
Gateway: running
Auth: token (active)
Agent: ready
Hooks: session-memory ✓, boot-hook ✓, command-logger ✓
```

To open your control dashboard:
```bash
openclaw dashboard
```

> ⚠️ **WARNING:** Do NOT type `http://127.0.0.1:18789` manually in your browser — you'll get a "gateway token missing" error. Always use `openclaw dashboard` — it opens a tokenized URL. Bookmark that URL after it opens.

---

## 03 | 📱 CONNECT YOUR CHANNEL (TELEGRAM)

This connects your agent to Telegram so you can text it tasks from anywhere — from the front counter, your phone, or at home before the morning rush.

> ✅ **ACTION:** For detailed Telegram bot creation steps with screenshots, see [`reference_documents/telegram_bot_setup.md`](reference_documents/telegram_bot_setup.md).

### 3A — Create Your Bot via BotFather

Do this on your **phone** where Telegram is installed:

1. Open Telegram and search for **@BotFather** — confirm it has a blue verification checkmark
2. Tap **Start**, then type `/newbot` and send it
3. When asked for a display name, type something like: **Scouts Agent**
4. When asked for a username, type something that ends in `bot`, like: **ScoutsCoffeeBot** (must be globally unique — add numbers if taken)
5. BotFather will respond with your **bot token** — copy it immediately

### 3B — Connect Token to OpenClaw

Back on your Mac Mini terminal:

```bash
openclaw onboard --channel telegram
```

Paste your bot token when prompted.

Then start the gateway and approve your pairing:

```bash
openclaw gateway
openclaw pairing list telegram
openclaw pairing approve telegram <code>
```

> ⚠️ **WARNING:** Pairing codes expire after 1 hour. Run `openclaw pairing list telegram` to get a fresh code if yours expires.

### 3C — Lock Down Access (Critical)

Without this step, anyone who discovers your bot can send it commands.

In your OpenClaw config (located at `~/.openclaw/config.json5`), set your Telegram DM policy to allowlist mode:

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "YOUR_BOT_TOKEN_HERE",
      dmPolicy: "allowlist",
      allowFrom: ["YOUR_NUMERIC_TELEGRAM_ID"],
    },
  },
}
```

**To find your numeric Telegram user ID:**
1. Message your new bot from Telegram
2. On your Mac Mini, run: `openclaw logs --follow`
3. Look for `from.id:` in the output — that's your numeric ID

**Verify it worked:**
```
$ openclaw channels status
telegram   ✓ connected   dmPolicy: allowlist
```

![Channel Selection](templates/images/image3.png)

---

## 04 | 🧠 CONFIGURE YOUR MODEL PROVIDER (ANTHROPIC)

Verify your provider is connected from the onboarding wizard:

```bash
openclaw models status
```

**Verify it worked:**
```
Provider: anthropic   Status: ✓ active   Model: claude-sonnet-4-6
```

If it shows as unconfigured:
```bash
openclaw onboard --anthropic-api-key "YOUR_ANTHROPIC_API_KEY"
```

> 💡 **TIP:** Set a monthly spending cap in your [Anthropic Console](https://console.anthropic.com). Typical usage for a coffee shop running 3 daily automations is **$10–$25/month**. Start with a $30 cap so you have headroom without surprises.

![Model Provider Selection](templates/images/image11.png)

---

## 05 | 🔧 INSTALL SKILLS

> ⚠️ **WARNING:** Always install `skill-vetter` first and use it to screen every subsequent skill before installing it. Approximately 17–20% of community skills contain suspicious code. This is non-negotiable.

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
```

> 💡 **TIP:** `skill-vetter` + `prompt-guard` + `agentguard` is your minimum viable security stack. `prompt-guard` specifically protects you when the agent reads supplier emails or external websites — stopping malicious instructions embedded in outside content from hijacking your agent.

### Phase 2: Core Scouts Coffee Skills

| Your Need | Skill | What It Does |
|---|---|---|
| Staff scheduling via Google Calendar | `gog` | Full Google Workspace — Gmail, Calendar, Drive, Docs, Sheets |
| Supplier email tracking | `gog` | (included above — reads your Gmail inbox) |
| Supplier research & pricing | `tavily-web-search` | AI-optimized web search for current pricing and availability |
| Spreadsheet order analysis | `data-analyst` | SQL, spreadsheet analysis, chart generation for inventory data |
| Summarize supplier catalogs | `summarize` | Turns PDFs, long emails, or URLs into concise summaries |
| Weather for shift planning | `weather` | Real-time weather — useful for predicting slow vs. busy days |

```bash
skill-vetter gog
clawhub install gog

skill-vetter tavily-web-search
clawhub install tavily-web-search

skill-vetter data-analyst
clawhub install data-analyst

skill-vetter summarize
clawhub install summarize

skill-vetter weather
clawhub install weather
```

> ✅ **ACTION:** After installing `gog`, you'll be prompted to connect your dedicated Scouts Coffee Google account via OAuth. Follow the prompts — make sure you log in with the dedicated `scouts-agent@gmail.com` account, NOT your personal Gmail.

**Verify all skills are installed:**
```
$ openclaw skills list
skill-vetter      v1.x.x   ✓ active
prompt-guard      v1.x.x   ✓ active
agentguard        v1.x.x   ✓ active
gog               v1.x.x   ✓ active
tavily-web-search v1.x.x   ✓ active
data-analyst      v1.x.x   ✓ active
summarize         v1.x.x   ✓ active
weather           v1.x.x   ✓ active
```

### Phase 3: Consider Later (After 2 Weeks of Stable Operation)

| Skill | What It Does | When to Add |
|---|---|---|
| `bookkeeper` | Invoice OCR, payment tracking, Xero accounting entries | When you want to automate supplier invoice processing |
| `pdf-toolkit` | Merge, split, extract text from supplier PDFs | When you're regularly handling supplier catalogs as PDFs |

---

## 06 | ⚡ CONFIGURE AUTOMATIONS

> 💡 **TIP:** Why this matters for Scouts Coffee: these three automations replace the manual morning check-in across Gmail, your calendar, and your mental model of who's working when — saving you 20–30 minutes every single morning before you even pour your first shot.

You'll need your **Telegram chat ID** for these commands. To get it:
1. Message your bot once from Telegram
2. Run `openclaw logs --follow` and look for `chat.id:` — that's your chat ID

### Automation 1 — Morning Scouts Briefing

**What it does:** Every morning at 6:30am Pacific, delivers a concise briefing to your Telegram: key supplier emails from the past 12 hours, today's staff on the calendar, and SF weather for the day.

**Autonomy Tier: 🔔 NOTIFY** — Agent reads and summarizes. Takes no action. You stay in control.

```bash
openclaw cron add \
  --name "Morning Scouts Briefing" \
  --cron "30 6 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "You are the assistant for Scouts Coffee SF. Good morning — please prepare today's briefing: (1) Check Gmail for any urgent supplier emails received in the past 12 hours. Flag anything needing a reply today. (2) Check Google Calendar for today's staff schedule. List who is working and what time their shifts start. (3) Check SF weather for today. Note if it is likely to be a slow or busy day based on conditions. Deliver a concise ~150-word summary." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                      Schedule     Timezone              Status
1    Morning Scouts Briefing   30 6 * * *   America/Los_Angeles   ✓ active
```

To test it immediately without waiting:
```bash
openclaw cron run <job-id>
```

### Automation 2 — Weekly Supplier Reorder Review

**What it does:** Every Sunday at 10am Pacific, scans your Gmail for supplier emails from the past 7 days and drafts a reorder summary — what's been received, what's pending, and what you might need to order this week.

**Autonomy Tier: 📋 SUGGEST** — Agent drafts a reorder summary and flags items. You approve before any action.

```bash
openclaw cron add \
  --name "Weekly Supplier Reorder Review" \
  --cron "0 10 * * 0" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "You are the assistant for Scouts Coffee SF (8 staff, San Francisco coffee shop). Review the past 7 days of Gmail for any emails from suppliers, distributors, or vendors. Summarize: (1) Orders that were placed and confirmed. (2) Deliveries pending or overdue. (3) Any supplier issues or price changes. (4) Based on patterns, suggest what likely needs to be reordered this week. Present this as a clear weekly supplier status report. Do NOT place any orders — this is for review only." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                         Schedule      Timezone              Status
1    Morning Scouts Briefing      30 6 * * *    America/Los_Angeles   ✓ active
2    Weekly Supplier Reorder      0 10 * * 0    America/Los_Angeles   ✓ active
```

### Automation 3 — End-of-Week Schedule Check

**What it does:** Every Friday at 3pm Pacific, reviews next week's calendar for any scheduling gaps — missing shifts, potential coverage issues, or conflicts — and sends you a heads-up while you still have the weekend to fix it.

**Autonomy Tier: 📋 SUGGEST** — Agent flags gaps. Does not contact staff or modify the schedule.

```bash
openclaw cron add \
  --name "Friday Schedule Check" \
  --cron "0 15 * * 5" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "You are the assistant for Scouts Coffee SF. It is Friday — please check Google Calendar for next week's staff schedule (Monday through Sunday). Flag: (1) Any days that appear understaffed or have no shifts scheduled. (2) Any potential conflicts or double-bookings. (3) Days with unusually light coverage given typical coffee shop busy patterns. Present a brief scheduling health report for next week. Do NOT contact any staff or make any calendar changes." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify all three automations are active:**
```
$ openclaw cron list
ID   Name                         Schedule      Timezone              Status
1    Morning Scouts Briefing      30 6 * * *    America/Los_Angeles   ✓ active
2    Weekly Supplier Reorder      0 10 * * 0    America/Los_Angeles   ✓ active
3    Friday Schedule Check        0 15 * * 5    America/Los_Angeles   ✓ active
```

> 🍽️ **Food Safety Note:** None of these automations are configured to contact suppliers, place orders, or modify staff records automatically. They are all NOTIFY/SUGGEST tier — they deliver information to you, and you decide what action to take. This is intentional. Autonomous supplier orders could result in duplicate shipments, wrong quantities, or contract violations. Always keep a human in the loop for procurement.

---

## 07 | 💉 INJECT YOUR SOUL

This section brings your agent to life with Scouts Coffee's identity, context, and guardrails.

> ✅ **ACTION:** Open `prompts_to_send.md` (in the same folder as this guide) and paste each prompt into your OpenClaw chat interface **one at a time**, in the order listed. Wait for the agent to acknowledge each before sending the next.

To open the chat interface:
```bash
openclaw dashboard
```

Or message your Telegram bot directly — both work.

**Prompt sequence:**
1. **Identity & Role** → establishes who the agent is and what Scouts Coffee is
2. **Business Context** → gives the agent your staff, suppliers, and operational details
3. **Skills & Integrations** → installs and maps skills to your workflows
4. **Routines & Automations** → confirms the three scheduled automations
5. **Guardrails & Safety** → defines what the agent must never do
6. **Personality & Style** → defines how the agent communicates with you
7. **Security Audit** → final verification before going live

> 💡 **TIP:** Wait for the agent to acknowledge each prompt before sending the next. This ensures each configuration layer is properly absorbed before layering the next one on top.

![OpenClaw Web UI](templates/images/image6.png)

---

## 08 | 🔒 SECURITY HARDENING

> ⚠️ **WARNING:** Do not skip this section. Your Mac Mini sits in a business environment with staff coming and going. Physical security and network security both matter.

### Mac Mini–Specific Hardening

**1. Enable macOS Firewall**

Go to **System Settings → Network → Firewall** — turn it on. This is your first line of defense against network intrusion.

**2. Verify gateway.bind is loopback-only**

Your gateway should only accept connections from the Mac Mini itself — not from other machines on your network. Verify this:

```bash
openclaw gateway status --verbose
```

Look for: `bind: 127.0.0.1:18789` — this means it's loopback-only. If it shows `0.0.0.0` instead, run `openclaw onboard` and reconfigure.

**3. Set Up Tailscale for Remote Access**

Tailscale is free, secure, and requires no port forwarding. It lets you access your Mac Mini from anywhere (home, another location) without exposing it to the internet.

Install it:
```bash
brew install tailscale
```

Then sign up at [tailscale.com](https://tailscale.com) and follow the macOS setup guide. Once connected, you can SSH to your Mac Mini from any device on your Tailscale network.

**4. Rotate API Keys Quarterly**

Set a reminder every 3 months to rotate your Anthropic API key. Old keys that get leaked can run up charges without your knowledge.

### Business-Specific Security Checklist

- [ ] FileVault is enabled (completed in Section 01)
- [ ] Separate Google account created for OpenClaw — not your personal account
- [ ] Anthropic API monthly spending limit set ($30–$50)
- [ ] Telegram bot DM policy set to `allowlist` with your numeric user ID only
- [ ] Mac Mini is in a physically secure location (back office, not accessible to customers)
- [ ] Staff members do NOT have access to the `openclaw` macOS user account
- [ ] No API keys stored in plain text — they should be in `~/.openclaw/` encrypted storage only
- [ ] macOS Firewall is enabled
- [ ] Tailscale configured for remote access (no open ports on your router)
- [ ] API keys to be rotated quarterly (set calendar reminder)

---

## 09 | 🔍 SECURITY AUDIT CHECKLIST

> ✅ **ACTION:** Run this audit before using OpenClaw for real Scouts Coffee operations. Do not skip this step.

```bash
openclaw security audit --deep
```

**Verify it worked:**
```
Security Audit Complete
Critical warnings: 0
Recommendations: X (review below)
```

If you see critical warnings:
```bash
openclaw security audit --fix
openclaw doctor
openclaw health
```

**Manual verification — check every box before going live:**
- [ ] `openclaw security audit --deep` completes with **0 critical warnings**
- [ ] `openclaw gateway status` shows "running" with token authentication active
- [ ] `openclaw cron list` shows exactly **3 jobs** — Morning Briefing, Supplier Review, Schedule Check — nothing unexpected
- [ ] `openclaw skills list` shows exactly the 8 skills installed in Section 05 — no extras
- [ ] Your Telegram bot only responds to messages from your account (test by messaging from a different account — it should not reply)
- [ ] No API keys stored in plain text — verify: `cat ~/.openclaw/config.json5` should show `"sk-ant-..."` only if it's in the `env` block and not in a comment or log
- [ ] macOS Firewall is showing as ON in System Settings
- [ ] `openclaw skills list --verbose` — review which skills have file system, network, or exec access; confirm this matches your expectations

**Do NOT begin live Scouts Coffee operations until all checks pass.**

---

## 10 | 🚀 TROUBLESHOOTING & NEXT STEPS

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
# Confirm dmPolicy: allowlist and your numeric ID is in allowFrom
```

**Cron jobs not firing**
```bash
openclaw gateway status
openclaw cron list
openclaw cron run <job-id>   # test manually
```

**"gateway token missing" when opening dashboard**
```bash
# Always use this command — never type the URL manually:
openclaw dashboard
```

**High API costs**
- Check which jobs are consuming tokens: `openclaw cron runs --id <job-id> --limit 10`
- Consider using `--light-context` flag on cron jobs that don't need workspace context
- Verify no runaway loops in `openclaw logs --follow`

### Next Steps After Stable Setup (Weeks 2–4)

Once you've run the system for 1–2 weeks and the automations feel right:

1. **Add the `bookkeeper` skill** — start automating supplier invoice processing. It OCRs emailed invoices and creates accounting entries. Saves ~2 hours/week of manual bookkeeping.
2. **Create a staff-facing Telegram group** — you can add the bot to a private Scouts Coffee staff group so staff can text it for shift swaps or schedule questions (without seeing your personal messages). See the Telegram group config in `reference_documents/telegram_bot_setup.md`.
3. **Context hygiene** — after week 5, consider separate Telegram channels per major workflow (one for scheduling, one for supplier matters) to prevent context pollution as conversation history grows long.
4. **Upgrade to Opus** — if you find the agent's reasoning on complex scheduling situations isn't quite right, consider upgrading to `claude-opus-4-6`. Run `openclaw onboard` and select Opus during model selection. Expect costs to be ~3–5× higher.

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI** | `openclaw dashboard` (tokenized — always use this command) |
| **Gateway Port** | 18789 (loopback only: 127.0.0.1) |
| **Model Provider** | Anthropic (`claude-sonnet-4-6`) |
| **Channel** | Telegram (DM allowlist) |
| **Cron Timezone** | `America/Los_Angeles` |
| **Config File** | `~/.openclaw/config.json5` |
| **Cron Jobs** | `openclaw cron list` |
| **Installed Skills** | `openclaw skills list` |
| **Logs** | `openclaw logs --follow` |
| **Security Audit** | `openclaw security audit --deep` |
| **Gateway Status** | `openclaw gateway status` |
| **OpenClaw Docs** | https://docs.openclaw.ai |
| **Remote Access** | Tailscale (tailscale.com) |

---

**OPENCLAW | Your Agent. Your Hardware. Your Soul.**

*Scouts Coffee · San Francisco · Est. 2026*
