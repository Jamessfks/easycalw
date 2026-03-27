# OPENCLAW ENGINE SETUP GUIDE

**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Your Coffee Shop |
| **MISSION** | Automate daily operations — inventory, orders, and morning readiness — so you can focus on your customers |
| **DATE** | 2026-03-26 |
| **DEPLOYMENT** | Mac Mini (Dedicated) |
| **CHANNEL** | Telegram |
| **MODEL** | Anthropic Claude (claude-sonnet-4-6) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

> ⚠️ **WARNING — Assumption Notice:** Your interview did not specify a messaging channel or AI model provider. This guide defaults to **Telegram** (most reliable for beginners) and **Anthropic Claude** (best balance of cost and capability). If you prefer a different channel (e.g. WhatsApp or iMessage), let your setup guide agent know before starting.

---

**This guide configures your OpenClaw agent to handle the daily grind of running your coffee shop — from tracking inventory like coffee bags, mugs, and gift cards, to giving you a morning briefing before the first customer walks in.**

---

## 🎯 Key Moments — What You Will Accomplish

By the end of this guide, you will have:

- **A running OpenClaw instance** on your Mac Mini, connected to Telegram and ready to receive your shop management requests any time of day
- **Automated daily inventory check-ins and a morning briefing** so you always know what needs restocking before your doors open
- **Business guardrails** ensuring your agent never makes purchases, contacts suppliers, or takes action without your explicit approval

---

## 00 | ✅ PRE-FLIGHT CHECKLIST

> ✅ **ACTION:** Complete every item in this checklist **before** running a single command. Missing prerequisites cause backtracking, and backtracking wastes your time.

### Accounts to Create
- [ ] **Anthropic account** — Sign up at [console.anthropic.com](https://console.anthropic.com). You need an API key. Set a monthly spending limit of **$20–$30** to start — that comfortably covers a small business agent.
- [ ] **Telegram account** — Install the Telegram app on your phone if you haven't already. It's free and available on iPhone and Android.

### API Keys to Obtain
- [ ] **Anthropic API Key** — In the Anthropic Console: go to **API Keys → Create Key**. Name it "OpenClaw Coffee Shop". Copy it and save it in a password manager or a notes app you keep private.

### Hardware & Software
- [ ] Mac Mini is plugged in and powered on
- [ ] Mac Mini is connected to the internet (Wi-Fi or ethernet)
- [ ] You have access to the Terminal app on your Mac Mini (press **Cmd+Space**, type "Terminal", press Enter)
- [ ] macOS is up to date — **Apple menu → System Settings → General → Software Update**

> 💡 **TIP:** Gather your Anthropic API key before you start the steps below. There is a moment during setup where it will be requested, and having it ready saves you from stopping mid-install.

---

## 01 | 🖥️ PLATFORM SETUP

These steps prepare your Mac Mini to run OpenClaw reliably — 24 hours a day, even when you're at home.

> 🍽️ **Food & Beverage Business Note:** Your coffee shop agent will handle business information — inventory counts, supplier names, pricing. Keep this Mac Mini dedicated to OpenClaw and avoid syncing it with personal iCloud accounts or personal files. If the machine is compromised, business data is all that's exposed — not your personal life.

> ⚠️ **WARNING:** OpenClaw runs with broad system permissions. Do **not** install it on a Mac Mini that has your personal photos, iCloud passwords, or banking apps signed in. Dedicate this machine to OpenClaw only.

### 1A — Update macOS

Go to **Apple menu → System Settings → General → Software Update** and install all available updates. Restart if prompted. This is not optional — outdated macOS causes mysterious install failures.

### 1B — Enable FileVault Disk Encryption

Go to **System Settings → Privacy & Security → FileVault** and turn it on. This encrypts your entire disk. If someone physically takes your Mac Mini, they cannot read your business data, API keys, or agent memory.

> ✅ **ACTION:** Click **Turn On FileVault** and follow the prompts. Save the recovery key somewhere safe (not on this machine). Encryption takes about 20–30 minutes in the background — you can keep working.

### 1C — Configure Always-On Settings

Your Mac Mini must never fall asleep or it will miss your scheduled morning briefings and stop responding to your Telegram messages.

Go to **System Settings → Energy** and enable:
- ✅ Prevent automatic sleeping when the display is off
- ✅ Wake for network access
- ✅ Start up automatically after a power failure

**Also install Amphetamine** from the Mac App Store (free). This is the sleep-prevention tool the OpenClaw community recommends over macOS's built-in settings alone.

Once installed, launch it — it appears as a pill icon in your menu bar. Go to **Preferences** and:
- ✅ Enable "Launch Amphetamine at login"
- ✅ Enable "Start session when Amphetamine launches" — set duration to **Indefinitely**
- ✅ Enable "Start session after waking from sleep"

> 💡 **TIP:** Why this matters for your coffee shop: your morning briefing cron job fires at a set time each day. If your Mac Mini is asleep, the job is silently missed and you won't know until you show up to find you're out of oat milk.

### 1D — Enable Remote Access (So You Can Manage It From Anywhere)

Go to **System Settings → General → Sharing** and enable:
- ✅ **Remote Login** (SSH) — so you can control the Mac Mini from a terminal on another computer
- ✅ **Screen Sharing** — for the occasional visual task

Go to **System Settings → Users & Groups → Login Options** and set the Mac Mini to automatically log in to your OpenClaw user account. This ensures the agent restarts automatically after a power cut.

**Verify it worked:**
```
$ ssh your-username@your-mac-mini-local-ip
Last login: ...   ← you're in
```

---

## 02 | 📦 INSTALL OPENCLAW

### 2A — Install Xcode Command Line Tools

Open Terminal and run:

```bash
xcode-select --install
```

A dialog box will appear on screen. Click **Install** and wait a few minutes. This gives your Mac Mini the compilers that Homebrew (the next step) needs to work.

**Verify it worked:**
```
$ xcode-select -p
/Library/Developer/CommandLineTools   ← success
```

### 2B — Install Homebrew

Homebrew is the standard Mac package manager. Think of it like an app store for developer tools — OpenClaw needs it to install Node.js.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the prompts. When it finishes, if you're on Apple Silicon (M1/M2/M3/M4 Mac Mini), run this extra step to add Homebrew to your PATH:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
source ~/.zprofile
```

**Verify it worked:**
```
$ brew --version
Homebrew 4.x.x   ← any recent version is fine
```

### 2C — Install Node.js

OpenClaw runs on Node.js. Install it through Homebrew:

```bash
brew install node
```

**Verify it worked:**
```
$ node --version
v22.16.0   ← must be v22 or higher
```

If it shows a lower version, run `brew upgrade node`.

### 2D — Run the OpenClaw Installer

This single command checks your Node version, installs the OpenClaw CLI globally, and sets up the foundation:

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Wait until you see: **"Installation finished successfully!"**

**Verify it worked:**
```
$ openclaw --version
openclaw v2026.x.x   ← any version 2026.1.29 or later
```

> ⚠️ **WARNING:** You must be on version **2026.1.29 or later**. Earlier versions had a security vulnerability allowing unauthenticated gateway access. If you see an error about "auth mode none" after updating, run `openclaw onboard` to reconfigure — the guide covers this in the next step.

### 2E — Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag is critical — it sets up a background service so OpenClaw automatically starts when your Mac Mini boots up, even after a restart.

**At each wizard prompt, choose:**

| Prompt | Your Choice |
|---|---|
| Gateway mode | **Local** (not Remote) |
| AI provider | **Anthropic** — paste your API key when prompted |
| Model | **`claude-sonnet-4-6`** (best balance for small business operations) |
| Messaging channels | **Telegram** — you'll finish this setup in Section 03 |
| Hooks | Enable **all three**: session memory, boot hook, and command logger |
| Skills | **Skip for now** — you'll install skills deliberately in Section 05 |

![Security Handshake](templates/images/image12.png)

> ✅ **ACTION:** When the wizard shows the security acknowledgment screen, select **"Yes"** to confirm you are the sole operator of this agent.

**Verify it worked:**
```
$ openclaw gateway status
Gateway: running   Auth: token   Port: 18789
```

---

## 03 | 📱 CONNECT YOUR CHANNEL (TELEGRAM)

Telegram is your "phone line" to your agent. Once this is set up, you can text your OpenClaw agent just like texting a person — and it will respond.

> 💡 **TIP:** For the detailed, step-by-step Telegram bot creation walkthrough (with screenshots), see [`reference_documents/telegram_bot_setup.md`](reference_documents/telegram_bot_setup.md) in the same folder as this guide.

### 3A — Create Your Telegram Bot

Do this on your phone:

1. Open Telegram and search for **@BotFather** — confirm the handle is exactly `@BotFather` with a blue checkmark
2. Tap **Start**
3. Type `/newbot` and send it
4. BotFather asks for a display name — type something like **Coffee Shop Bot** or your own shop name
5. BotFather asks for a username — it must end in `bot` (e.g. `mycoffeeshopbot`). It must be globally unique — try adding your shop name.
6. BotFather responds with a message containing your **bot token** — a long string like `123456789:AAFxxxxxxxxxxxxx`

**Copy that token. You'll need it in the next step.**

### 3B — Connect the Bot to OpenClaw

In Terminal on your Mac Mini:

```bash
openclaw channels add telegram
```

Paste your bot token when prompted.

Then start the gateway:

```bash
openclaw gateway restart
```

Now pair your phone:

```bash
openclaw pairing list telegram
openclaw pairing approve telegram <code>
```

> ✅ **ACTION:** Open the Telegram bot on your phone and send it a message (anything — just "hello"). Run `openclaw logs --follow` in Terminal to confirm the message is received.

**Verify it worked:**
```
$ openclaw channels status
telegram   ✓ connected   bot: @yourcoffeeshopbot
```

### 3C — Lock Down Access (Important)

By default, your bot uses pairing mode — only your approved phone can talk to it. For a single-operator coffee shop, upgrade to allowlist mode for durability.

First, find your Telegram numeric user ID:

1. Send a DM to your bot from your phone
2. In Terminal, run: `openclaw logs --follow`
3. Look for `from.id` in the log output — that number is your Telegram user ID

Then update your OpenClaw config to use allowlist mode with your ID. Open your config file:

```bash
openclaw config edit
```

Add (or update) the Telegram channel block:

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "YOUR_TELEGRAM_BOT_TOKEN",
      dmPolicy: "allowlist",
      allowFrom: ["YOUR_NUMERIC_TELEGRAM_USER_ID"],
    },
  },
}
```

Replace `YOUR_TELEGRAM_BOT_TOKEN` and `YOUR_NUMERIC_TELEGRAM_USER_ID` with your actual values. Then:

```bash
openclaw gateway restart
```

> ⚠️ **WARNING:** Without the allowlist, anyone who discovers your bot's username could send it commands. For a business owner, this is a real risk — a bad actor could command your agent to read business files.

![Channel Selection](templates/images/image3.png)

---

## 04 | 🧠 CONFIGURE YOUR MODEL PROVIDER (ANTHROPIC)

Check that your model provider is connected:

```bash
openclaw models status
```

**Verify it worked:**
```
Provider: anthropic   Status: ✓ active   Model: claude-sonnet-4-6
```

If it shows an error or "not configured":

```bash
openclaw onboard --anthropic "YOUR_ANTHROPIC_API_KEY"
```

> 💡 **TIP:** Set a monthly spending cap in your Anthropic Console. Go to [console.anthropic.com](https://console.anthropic.com) → **Billing → Usage Limits** → set a hard limit of **$25–$30/month** to start. For a small coffee shop workload (morning briefings, inventory queries, occasional supplier email drafts), expect $5–$15/month in API costs.

![Model Provider Selection](templates/images/image11.png)

---

## 05 | 🔧 INSTALL SKILLS

Skills are add-ons that give your agent new capabilities — email, calendars, web search, and more. Think of them like apps for your agent.

> ⚠️ **WARNING:** Always install `skill-vetter` FIRST and use it to scan every other skill before installing it. Approximately 17–20% of community skills contain suspicious or malicious code. This is non-negotiable.

### Phase 1: Security Stack (Install First — No Exceptions)

```bash
clawhub install skill-vetter
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
```

### Phase 2: Core Coffee Shop Skills

| Your Need | Skill | What It Does |
|---|---|---|
| Email, Calendar, Sheets (inventory tracking) | `gog` | Full Google Workspace — Gmail, Google Calendar, Drive, Docs, and Sheets |
| Morning weather for opening decisions | `weather` | Real-time weather and forecasts for your location |
| Invoice and expense tracking | `bookkeeper` | Email invoice intake, OCR receipt extraction, and expense logging |
| Connect to other business tools | `composio` | 860+ external integrations (Square, Stripe, and more) via a single setup |

Install in this order — vet each one before installing:

```bash
# Google Workspace (email, calendar, inventory sheets)
skill-vetter gog
clawhub install gog

# Weather
skill-vetter weather
clawhub install weather

# Invoice and bookkeeping
skill-vetter bookkeeper
clawhub install bookkeeper

# Business tool integrations
skill-vetter composio
clawhub install composio
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
gog            v1.x.x   ✓ active
weather        v1.x.x   ✓ active
bookkeeper     v1.x.x   ✓ active
composio       v1.x.x   ✓ active
```

> 💡 **TIP:** The `gog` skill (Google Workspace) requires a one-time OAuth authorization through your browser. After installing, run `openclaw skills auth gog` and follow the link it generates. Use your **business Google account** — not your personal one.

---

## 06 | ⚡ CONFIGURE AUTOMATIONS

> 💡 **TIP:** Why this matters: these automations replace the mental overhead of starting each day wondering what's running low in the shop. Your agent checks in for you automatically — you just wake up to a briefing.

### Automation 1 — Morning Shop Briefing

**What it does:** Every morning before you open, your agent sends a summary to your Telegram — weather for the day, your calendar, and a reminder to check your inventory tracking sheet.

**Autonomy Tier: 🔔 NOTIFY** — The agent compiles and sends information. It takes no action, makes no orders, contacts no suppliers.

```bash
openclaw cron add \
  --name "morning-briefing" \
  --cron "0 7 * * *" \
  --tz "America/New_York" \
  --session isolated \
  --message "Good morning! Please send me a quick briefing: (1) today's weather for my coffee shop location, (2) anything on my Google Calendar today, (3) a reminder for me to check the inventory sheet for coffee bags, mugs, and gift cards. Keep it brief — under 150 words." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

> ✅ **ACTION:** Replace `America/New_York` with your actual timezone (e.g. `America/Los_Angeles`, `America/Chicago`). Replace `YOUR_TELEGRAM_CHAT_ID` with your numeric Telegram user ID from Step 3C. Adjust `0 7 * * *` to your preferred time (format: `minute hour * * *` — so `0 6 * * *` = 6:00 AM).

**Verify it worked:**
```
$ openclaw cron list
ID   Name                Schedule      Timezone           Status
1    morning-briefing    0 7 * * *     America/New_York   ✓ active
```

> 🍽️ **Food & Beverage Business Note:** This automation is NOTIFY-tier — your agent never contacts suppliers, places orders, or modifies any data automatically. You remain in full control. This is the right setting for a small business owner who wants visibility without surprises.

---

## 07 | 💉 INJECT YOUR SOUL

This is where your OpenClaw agent becomes yours — not a generic AI assistant, but a coffee shop operations assistant that knows your business.

> ✅ **ACTION:** Open the OpenClaw Web UI:

```bash
openclaw dashboard
```

This opens a tokenized URL in your browser at `http://127.0.0.1:18789/`. If it loads, your gateway is working. **Bookmark this link.**

Do NOT type `http://127.0.0.1:18789` manually — you'll get a "gateway token missing" error. Always use `openclaw dashboard`.

![OpenClaw Web UI](templates/images/image6.png)

Now open `prompts_to_send.md` (in the same folder as this guide) and paste each prompt into the chat interface **one at a time, in order**:

**Prompt sequence:**
1. **Identity Prompt** → tells the agent who it is and what business it serves
2. **Business Context Prompt** → gives the agent your shop's specifics
3. **Skills Installation Prompt** → installs and maps the tools above
4. **Guardrails & Safety Prompt** → defines what the agent must never do
5. **Security Audit Prompt** → final verification before going live

> 💡 **TIP:** Wait for the agent to acknowledge each prompt before sending the next. Each one builds on the last — sending them all at once causes context confusion.

---

## 08 | 🔒 SECURITY HARDENING

> ⚠️ **WARNING:** Do not skip this section. Your agent has access to your business email, calendar, and inventory data. A single misconfiguration can expose that to the public internet.

### Mac Mini-Specific Hardening

**Enable the macOS Firewall:**
Go to **System Settings → Network → Firewall** → turn it on.

**Verify gateway is loopback-only:**
Your OpenClaw gateway should only accept connections from your own machine — not from the internet. Verify your config contains:

```bash
openclaw config show | grep gateway
```

You should see `bind: 127.0.0.1` or similar. If you see `0.0.0.0`, run `openclaw onboard` and reconfigure.

**Set up Tailscale for secure remote access:**
Tailscale is free and lets you access your Mac Mini securely from anywhere — no port forwarding required. Download at [tailscale.com](https://tailscale.com). This is how you manage your agent when you're not physically at the Mac Mini.

**Run the automated security fix:**
```bash
openclaw security audit --fix
```

**Verify it worked:**
```
$ openclaw security audit --fix
Security hardening applied.
Gateway: loopback-only ✓
Auth: token ✓
DM policy: allowlist ✓
```

### Coffee Shop Business Compliance Checklist

- [ ] Mac Mini is not signed in to any personal iCloud, Apple ID, or personal email
- [ ] FileVault disk encryption is ON (verified in Step 1B)
- [ ] macOS Firewall is ON (enabled above)
- [ ] Anthropic API spending limit set to $25–$30/month in the console
- [ ] Telegram bot is locked to allowlist mode (only your ID can message it)
- [ ] OpenClaw workspace is sandboxed to `~/ai-workspace/` and `~/.openclaw/`
- [ ] API keys are stored only by OpenClaw's config — not in any notes app or document
- [ ] API keys rotated quarterly (add a reminder to your calendar)

> 🔒 **Data Handling Note:** Your agent will have access to business information like inventory counts, supplier names, and pricing. Do not connect it to systems containing customer payment data (credit card numbers, POS transaction records) unless you fully understand PCI DSS requirements. For a small coffee shop, keep OpenClaw focused on operational management and communication — not payment processing.

---

## 09 | 🔍 SECURITY AUDIT CHECKLIST

> ✅ **ACTION:** Run this audit before using OpenClaw for real business operations.

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

**Manual verification — check every box:**
- [ ] `openclaw security audit --deep` completes with **zero** critical warnings
- [ ] Gateway shows "running" with token authentication active
- [ ] `openclaw cron list` shows exactly the jobs you configured — no unexpected entries
- [ ] `openclaw skills list` matches exactly what you installed in Section 05 (5 skills)
- [ ] Telegram bot only responds to your Telegram account
- [ ] No API keys stored in plain text — check `~/.openclaw/` with `ls -la ~/.openclaw/`
- [ ] macOS Firewall is enabled: **System Settings → Network → Firewall**
- [ ] FileVault is enabled: **System Settings → Privacy & Security → FileVault**
- [ ] Review skill permissions: `openclaw skills list --verbose`

**Do NOT begin live business operations until all boxes are checked.**

---

## 10 | 🚀 TROUBLESHOOTING & NEXT STEPS

### Common Issues

**"command not found: openclaw" after installing**
```bash
source ~/.zshrc
# or open a new Terminal window — the PATH update needs a fresh session
```

**Gateway not responding**
```bash
openclaw doctor
openclaw gateway stop && openclaw gateway start
```

**Telegram bot not responding**
- Verify bot token: `openclaw channels status`
- Check logs: `openclaw logs --follow`
- Confirm allowlist from Step 3C is correct
- Make sure `openclaw gateway restart` was run after config changes

**Morning briefing cron job not firing**
- Verify gateway is running: `openclaw gateway status`
- Check the cron schedule: `openclaw cron list`
- Test it manually right now: `openclaw cron run 1`
- Confirm Mac Mini is not sleeping (check Amphetamine is running in menu bar)

**"sharp" errors during install**
```bash
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g openclaw@latest
```

**Old tutorial / "auth: none" error after updating**
```bash
openclaw onboard
# or manually:
openclaw doctor --generate-gateway-token
```

### Next Steps After 1–2 Weeks of Stable Operation

Once your agent is running smoothly, consider these additions:

1. **Add an inventory tracking Google Sheet** — Ask your agent to create a simple inventory template in Google Sheets (via the `gog` skill). Text your agent "update inventory: used 2 bags of House Blend" and it logs it automatically.
2. **Add a supplier email draft workflow** — When inventory hits a threshold you define, the agent drafts a reorder email to your supplier for your review and approval before sending.
3. **Context hygiene** — After week 5, create a separate Telegram channel for inventory management to avoid context pollution between your general requests and your inventory logs. The community strongly recommends this.

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI** | `openclaw dashboard` (always use this command — not the raw URL) |
| **Gateway Port** | 18789 |
| **Model Provider** | Anthropic (`claude-sonnet-4-6`) |
| **Channel** | Telegram |
| **Cron Timezone** | Set yours during Automation 1 setup |
| **OpenClaw Docs** | https://docs.openclaw.ai |
| **Security Audit** | `openclaw security audit --deep` |
| **Logs** | `openclaw logs --follow` |
| **Gateway Status** | `openclaw gateway status` |
| **Cron Jobs** | `openclaw cron list` |
| **Installed Skills** | `openclaw skills list` |
| **Anthropic Console** | https://console.anthropic.com |
| **Tailscale (remote access)** | https://tailscale.com |

---

**OPENCLAW | Your Agent. Your Hardware. Your Soul.**
