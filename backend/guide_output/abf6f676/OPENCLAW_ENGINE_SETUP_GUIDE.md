# OPENCLAW ENGINE SETUP GUIDE

**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Owner — Portland Coffee Shop |
| **MISSION** | Track inventory and manage orders hands-free from your Mac Mini |
| **DATE** | 2026-03-27 |
| **DEPLOYMENT** | Mac Mini (dedicated hardware) |
| **CHANNEL** | Telegram |
| **MODEL** | Anthropic Claude (claude-opus-4-6) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

**This guide configures your OpenClaw agent to track coffee shop inventory, surface low-stock alerts, and compile daily order summaries — all from a simple Telegram chat on your phone, running 24/7 on your Mac Mini in Portland.**

---

## Key Moments — What You Will Accomplish

By the end of this guide, you will have:

- **A running OpenClaw agent on your Mac Mini**, connected to Telegram and ready to answer inventory questions from your phone the moment you open the shop
- **2 automated daily routines** that deliver a morning inventory check at 7:00 AM and an end-of-day order summary at 8:00 PM — without you lifting a finger
- **A fully hardened local AI setup** that keeps your shop data on your own hardware, costs $10–$40/month in AI fees, and saves you hours of manual stock-counting each week

---

## 00 | PRE-FLIGHT CHECKLIST

> ✅ **ACTION:** Complete every item below **before** running a single command. Missing prerequisites will cause you to backtrack.

### Accounts to Create

- [ ] **Anthropic account** — Go to [console.anthropic.com](https://console.anthropic.com) and create a free account. You need an API key.
- [ ] **Telegram account** — Download the Telegram app on your phone if you haven't already (free on iOS and Android).

### API Keys to Obtain

- [ ] **Anthropic API Key** — In the Anthropic Console: click **API Keys** → **Create Key**. Name it "OpenClaw Coffee Shop". Copy it and save it in a notes app or password manager.
- [ ] **Set a spending limit** — Still in the Anthropic Console: go to **Billing → Usage Limits** and set a monthly cap of **$30**. A misconfigured agent can accidentally loop and burn credits fast.

### Hardware Checklist

- [ ] Your Mac Mini is plugged in and powered on
- [ ] Your Mac Mini is connected to your shop Wi-Fi (or home network where you'll run it)
- [ ] You can open **Terminal** on the Mac Mini (press Cmd+Space, type "Terminal", press Enter)
- [ ] You have your Anthropic API key copied and ready to paste

> 💡 **TIP:** Gather your API key and have the Telegram app installed on your phone **before** you sit down at the Mac Mini. Jumping between phone and computer mid-setup is where most beginners lose their place.

---

## 01 | PLATFORM SETUP — Prepare Your Mac Mini

These steps prepare your Mac Mini to run OpenClaw reliably around the clock.

> ⚠️ **WARNING:** Your Mac Mini must **never go to sleep** or your automations will miss their schedules and your Telegram messages will go unanswered. This section makes sure that doesn't happen.

### 1A — Update macOS First

Before anything else, update your system. Go to:
**Apple menu () → System Settings → General → Software Update**

Install all available updates. Restart if prompted. Come back here after the restart.

**Why this matters:** OpenClaw requires Node.js 22+, which installs cleanly on updated macOS. Old system versions cause confusing errors.

### 1B — Create a Dedicated User Account

> 💡 **TIP:** Running OpenClaw under your personal macOS account is like giving a new employee the keys to your entire house instead of just the shop. A dedicated account keeps things isolated and safe.

1. Go to **System Settings → Users & Groups**
2. Click the **+** button to add a new user
3. Set account type to **Standard**, name it something like **openclaw** or **shopagent**
4. Set a strong password and note it down
5. Log into that new account before continuing (you can switch via the Apple menu → Log Out)

> ✅ **ACTION:** All remaining commands in this guide should be run while logged into your dedicated **openclaw** user account.

### 1C — Configure Always-On Settings

On the dedicated openclaw account, go to **System Settings → Energy** and enable all three:

- ✅ **Prevent automatic sleeping when the display is off**
- ✅ **Wake for network access**
- ✅ **Start up automatically after a power failure**

Then install **Amphetamine** from the Mac App Store (free). Once installed:

1. Launch Amphetamine — a pill icon appears in the menu bar
2. Open Preferences → enable **"Launch Amphetamine at login"**
3. Enable **"Start session when Amphetamine launches"** → set duration to **Indefinitely**
4. Enable **"Start session after waking from sleep"**

**Verify it worked:**
```
Menu bar: Amphetamine pill icon is visible and shows a coffee cup or "On" state
```

### 1D — Enable Remote Access (Optional but Recommended)

If you want to manage the Mac Mini from a different room or from home:

Go to **System Settings → General → Sharing** and enable:
- **Remote Login** (SSH) — lets you connect via terminal from another Mac
- **Screen Sharing** — lets you see the screen remotely

Also enable auto-login: **System Settings → Users & Groups → Login Options → Automatic login → openclaw account**

This means if the Mac Mini restarts after a power outage, OpenClaw starts back up automatically without you needing to be there.

### 1E — Get an HDMI Dummy Plug (If Running Headless)

If the Mac Mini won't have a monitor attached, purchase an **HDMI dummy plug** (available on Amazon for $8–10). Plug it into the Mac Mini's HDMI port. Without it, macOS behaves oddly in headless mode and some OpenClaw features may fail.

---

## 02 | INSTALL OPENCLAW

### 2A — Install Xcode Command Line Tools

Open **Terminal** (Cmd+Space → type "Terminal" → Enter) and run:

```bash
xcode-select --install
```

A dialog window will pop up — click **Install** and wait a few minutes.

**Verify it worked:**
```
$ xcode-select --version
xcode-select version 2409   ← any version number is fine
```

### 2B — Install Homebrew

Homebrew is the tool that installs all other software on Mac. Run:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the prompts. After it finishes, run the command it tells you to add Homebrew to your PATH. It will look like:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

**Verify it worked:**
```
$ brew --version
Homebrew 4.x.x   ← any version is fine
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

If the version shown is lower than 22.16, run `brew upgrade node`.

### 2D — Run the OpenClaw Installer

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Wait until you see **"Installation finished successfully!"**

**Verify it worked:**
```
$ openclaw --version
openclaw v2026.x.x   ← must be 2026.1.29 or later
```

> ⚠️ **WARNING:** You must be on version **2026.1.29 or later**. Earlier versions had a security gap that allowed unauthenticated access to your agent. If you see an older version, run `brew upgrade` and try the installer again.

If Terminal says "command not found: openclaw" after installing, run:

```bash
source ~/.zshrc
```

Then try `openclaw --version` again.

### 2E — Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag is critical — it makes OpenClaw start automatically every time the Mac Mini boots, so your shop assistant is always available.

**At each wizard prompt, choose:**

| Prompt | What to Choose |
|---|---|
| Gateway mode | **Local** |
| AI provider | **Anthropic API key** — paste the key you copied earlier |
| Model | **claude-opus-4-6** (best for small business reasoning) |
| Messaging channels | **Telegram** — you'll configure the details in Section 03 |
| Hooks | Enable **session memory**, **boot hook**, and **command logger** |
| Skills | **Skip for now** — you'll install skills deliberately in Section 05 |

> ✅ **ACTION:** When the wizard shows the security acknowledgment screen, select **"Yes"** to confirm you are the sole operator.

**Verify it worked:**
```
$ openclaw gateway status
Gateway: running   Auth: token   Port: 18789
```

---

## 03 | CONNECT YOUR CHANNEL — TELEGRAM

This connects your agent to Telegram so you can text it questions from your phone while you're behind the counter, taking a delivery, or at home after hours.

### 3A — Create Your Bot via BotFather

Do this on your **phone** where Telegram is already installed:

1. Open Telegram and search for **@BotFather** — look for the blue checkmark to confirm it's the real one
2. Tap **Start**
3. Type `/newbot` and send it
4. BotFather asks for a **display name** — type something like: `Portland Coffee Shop Agent`
5. BotFather asks for a **username** — it must end in "bot" and be unique, e.g. `portlandcoffeeshop_bot`
6. BotFather replies with your **bot token** — it looks like: `123456789:ABCdefGHIjklMNOpqrSTUvwxYZ`

**Copy that token** — you'll need it in the next step.

### 3B — Connect the Bot to OpenClaw

Back on your Mac Mini, in Terminal:

```bash
openclaw gateway
```

Then add your bot token to the OpenClaw config. Open the config file:

```bash
openclaw config edit
```

Add your Telegram bot token into the config. It should look like this (replace the token value):

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "YOUR_TELEGRAM_BOT_TOKEN_HERE",
      dmPolicy: "pairing",
    },
  },
}
```

Save the file, then restart the gateway:

```bash
openclaw gateway stop && openclaw gateway start
```

### 3C — Pair Your Phone

On your Mac Mini, run:

```bash
openclaw pairing list telegram
```

Then on your phone, open Telegram and send any message to your new bot. The bot will generate a pairing code. On your Mac Mini, approve it:

```bash
openclaw pairing approve telegram <CODE>
```

**Verify it worked:**
```
$ openclaw channels status
telegram   ✓ connected
```

Now send a test message to your bot in Telegram — it should respond.

### 3D — Lock Down Access (Important)

> ⚠️ **WARNING:** Without this step, anyone who discovers your bot's username can send it commands. Lock it down to your account only.

Find your Telegram numeric user ID:
1. Send a message to your bot in Telegram
2. On the Mac Mini run: `openclaw logs --follow`
3. Look for a line containing `from.id:` — that number is your Telegram user ID
4. Note it down (it looks like: `123456789`)

Then update your config to use allowlist mode:

```bash
openclaw config edit
```

Change `dmPolicy` to `"allowlist"` and add your user ID:

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "YOUR_TELEGRAM_BOT_TOKEN_HERE",
      dmPolicy: "allowlist",
      allowFrom: ["YOUR_NUMERIC_TELEGRAM_USER_ID"],
    },
  },
}
```

Restart the gateway:

```bash
openclaw gateway stop && openclaw gateway start
```

> ✅ **ACTION:** Send a test message from your phone. The bot should still respond. If it does not, double-check that the `allowFrom` number matches what appeared in the logs.

---

## 04 | CONFIGURE YOUR MODEL PROVIDER — ANTHROPIC

Verify your AI provider is connected:

```bash
openclaw models status
```

**Verify it worked:**
```
Provider: anthropic   Status: ✓ active   Model: anthropic/claude-opus-4-6
```

If the status shows "not configured" or "no API key":

```bash
openclaw onboard --anthropic-api-key "YOUR_ANTHROPIC_API_KEY"
```

> 💡 **TIP:** For a coffee shop running inventory checks and order summaries twice a day, typical AI costs run **$10–$25/month** with Claude. The spending cap you set in Section 00 protects you if anything goes unexpectedly. You can always raise it later once you know your usage pattern.

---

## 05 | INSTALL SKILLS

> ⚠️ **WARNING:** Always install `skill-vetter` first and use it to screen every subsequent skill before installing it. Approximately 17–20% of community skills on ClawHub contain suspicious code — the vetter catches that before it touches your machine.

### Phase 1: Security Stack (Install First — No Exceptions)

**Step 1: Install the vetter**

```bash
clawhub install skill-vetter
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
```

**Step 2: Vet and install prompt-guard**

```bash
skill-vetter prompt-guard
clawhub install prompt-guard
```

`prompt-guard` protects your agent every time it reads external content — like a supplier email or a web page — that could try to hijack its behavior.

**Verify it worked:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
prompt-guard   v1.x.x   ✓ active
```

### Phase 2: Core Coffee Shop Skills

| Your Need | Skill | What It Does |
|---|---|---|
| Inventory tracking via spreadsheet | `data-analyst` | Reads CSVs and spreadsheets, runs analysis, generates summaries — perfect for tracking stock levels |
| Low-stock reminders on your Mac | `apple-reminders` | Creates native Apple Reminders that sync across all your Apple devices |
| Look up supplier info or prices | `exa-web-search-free` | Free AI-powered web search, no API key required |
| Periodic security health check | `claw-audit` | Scans your entire OpenClaw installation for vulnerabilities and misconfigurations |

Install them one at a time, vetting each before installing:

```bash
skill-vetter data-analyst
clawhub install data-analyst

skill-vetter apple-reminders
clawhub install apple-reminders

skill-vetter exa-web-search-free
clawhub install exa-web-search-free

skill-vetter claw-audit
clawhub install claw-audit
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter        v1.x.x   ✓ active
prompt-guard        v1.x.x   ✓ active
data-analyst        v1.x.x   ✓ active
apple-reminders     v1.x.x   ✓ active
exa-web-search-free v1.x.x   ✓ active
claw-audit          v1.x.x   ✓ active
```

> 💡 **TIP:** The `apple-reminders` skill requires macOS 14 or later. Check your macOS version via  → About This Mac. If you're on an older version, skip this skill and use Telegram messages from the agent as your reminder system instead.

---

## 06 | CONFIGURE AUTOMATIONS

> 💡 **TIP:** Why this matters: these two automations replace the manual morning walkthrough and end-of-day review you described. Instead of mentally tracking what's low or what you sold, your agent does the check and texts you a plain-English summary — so you can spend that time on customers.

Both automations are set to **NOTIFY tier** — your agent reads, summarizes, and reports. It takes no action on its own. You stay in full control.

### Automation 1 — Morning Inventory Check (7:00 AM Daily)

**What it does:** Every morning at 7 AM Pacific, your agent sends you a Telegram message reviewing your current inventory status and flagging anything running low based on what you've shared with it.

**Autonomy Tier: NOTIFY** — Agent reads and summarizes. Takes no action.

```bash
openclaw cron add \
  --name "Morning Inventory Check" \
  --cron "0 7 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Good morning! Review the current coffee shop inventory status. Check for any items running low (less than 20% of normal stock). List what needs to be reordered today. Keep the summary concise and actionable — 5 lines or fewer." \
  --announce \
  --channel telegram \
  --to "YOUR_NUMERIC_TELEGRAM_USER_ID"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                      Schedule     Timezone              Status
1    Morning Inventory Check   0 7 * * *    America/Los_Angeles   ✓ active
```

> ✅ **ACTION:** Test the automation immediately — don't wait until 7 AM. Run:
> ```bash
> openclaw cron run 1
> ```
> Check your Telegram — you should receive a message from your bot within a minute.

### Automation 2 — End-of-Day Order Summary (8:00 PM Daily)

**What it does:** Every evening at 8 PM, your agent sends you a Telegram summary of the day's orders and any notes you've logged during the day, so you can plan tomorrow's prep.

**Autonomy Tier: NOTIFY** — Agent reads and summarizes. Takes no action.

```bash
openclaw cron add \
  --name "End-of-Day Order Summary" \
  --cron "0 20 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Good evening! Summarize today's order activity for the coffee shop. Note what sold well, what ran out, and any reorder actions needed before tomorrow morning. Keep it to a short bullet list — no longer than 8 items." \
  --announce \
  --channel telegram \
  --to "YOUR_NUMERIC_TELEGRAM_USER_ID"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                      Schedule     Timezone              Status
1    Morning Inventory Check   0 7 * * *    America/Los_Angeles   ✓ active
2    End-of-Day Order Summary  0 20 * * *   America/Los_Angeles   ✓ active
```

> 💡 **TIP:** You can text your agent throughout the day to log notes like "ran out of oat milk at 11am" or "large caramel latte sold out by noon." The evening summary will incorporate everything you've told it during the day.

---

## 07 | INJECT YOUR SOUL

This step gives your agent its identity, role, and operating rules — turning it from a generic AI into your dedicated Portland coffee shop assistant.

> ✅ **ACTION:** Open `prompts_to_send.md` (in the same folder as this guide) and paste each prompt into your OpenClaw chat interface **one at a time, in order**. Open the dashboard with:

```bash
openclaw dashboard
```

This opens your agent's web interface in a browser at a secure, tokenized URL. You can also just text your bot in Telegram directly.

**Prompt sequence (details in prompts_to_send.md):**
1. **Identity & Role Prompt** → establishes who your agent is and what it knows about your shop
2. **Inventory & Orders Prompt** → teaches it your specific products, stock levels, and ordering workflows
3. **Daily Operations Prompt** → sets its tone and communication style for shift-by-shift use
4. **Security Audit Prompt** → final verification before going live

> 💡 **TIP:** Wait for the agent to send a reply acknowledging each prompt before sending the next one. This ensures each layer of configuration is properly absorbed before you build on it.

---

## 08 | SECURITY HARDENING

> ⚠️ **WARNING:** Do not skip this section. Your Mac Mini holds your API keys, shop data, and conversation history. A few simple steps make a real difference.

### Mac Mini-Specific Hardening

**Enable FileVault disk encryption:**
Go to **System Settings → Privacy & Security → FileVault** and turn it on. This encrypts your entire disk — if someone physically steals the Mac Mini, they cannot read any of your data. Takes about 30 minutes the first time.

**Enable the macOS Firewall:**
Go to **System Settings → Network → Firewall** and turn it on.

**Verify OpenClaw is bound to loopback only:**
```bash
openclaw config show | grep bind
```
You should see `gateway.bind: 127.0.0.1`. This means your agent only accepts connections from your own machine — not from the internet.

**Install Tailscale for secure remote access (recommended):**
Download Tailscale (free at tailscale.com). This lets you securely access your Mac Mini from your phone or home computer without exposing any ports to the internet.

### Coffee Shop Security Checklist

- [ ] FileVault disk encryption enabled
- [ ] macOS Firewall enabled
- [ ] `gateway.bind` is `127.0.0.1` (loopback only)
- [ ] Telegram bot uses `dmPolicy: "allowlist"` with your user ID only
- [ ] Anthropic API spending cap set to $30/month in the console
- [ ] API key is stored only in OpenClaw's config — not in plain text in notes or spreadsheets
- [ ] OpenClaw conversation logs retained in `~/.openclaw/` (automatic audit trail)
- [ ] Plan to rotate your Anthropic API key every 3 months

---

## 09 | SECURITY AUDIT — Run Before Going Live

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

If critical warnings appear:

```bash
openclaw security audit --fix
openclaw doctor
openclaw health
```

**Manual verification checklist:**
- [ ] `openclaw security audit --deep` completes with **zero critical warnings**
- [ ] `openclaw gateway status` shows "running" with token authentication active
- [ ] `openclaw cron list` shows exactly 2 jobs — "Morning Inventory Check" and "End-of-Day Order Summary" — and no unexpected entries
- [ ] `openclaw skills list` shows exactly the 6 skills installed in Section 05
- [ ] Your Telegram bot only responds to your account (test by sending from a different Telegram account — it should not reply)
- [ ] No API keys stored in plain text — check: `cat ~/.openclaw/config.json` and confirm the key is not visible in plain text (it should be stored securely)
- [ ] `claw-audit` passes: run `openclaw skills list --verbose` and review permissions

**Do NOT begin live coffee shop operations until all checks pass.**

---

## 10 | TROUBLESHOOTING & NEXT STEPS

### Common Issues

**"command not found: openclaw" after installing**
```bash
source ~/.zshrc
```
Then open a new Terminal window and try again.

**Gateway not responding**
```bash
openclaw doctor
openclaw gateway stop && openclaw gateway start
```

**Telegram bot not responding**
- Check the bot token: `openclaw channels status`
- Watch live logs: `openclaw logs --follow`
- Confirm your user ID is in the `allowFrom` list (Section 3D)

**Cron jobs not firing**
- Verify gateway is running: `openclaw gateway status`
- Check the schedule: `openclaw cron list`
- Test manually: `openclaw cron run 1`
- Make sure the Mac Mini is not sleeping (check Amphetamine in the menu bar)

**"sharp" errors during install**
```bash
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g openclaw@latest
```
Also run `xcode-select --install` to make sure Xcode tools are present.

**High API costs**
Check usage in the Anthropic Console under **Billing → Usage**. If costs are unexpectedly high, run `openclaw logs --follow` to see if anything is looping. Consider switching sub-tasks to `claude-sonnet-4-6` (cheaper) via the model override on cron jobs.

### What to Do After Your First Week

Once you've run the system for 1–2 weeks, consider these next steps:

1. **Upload your actual inventory spreadsheet** — Share a CSV or Google Sheet with your agent, and it can give you real inventory analysis instead of general advice. Ask your agent: "How do I share my inventory spreadsheet with you?"
2. **Add supplier contacts** — Tell your agent the names and contact info for your main suppliers. Then it can draft reorder messages for your approval with a single text.
3. **Context hygiene** — After week 5, if you add more workflows (like tracking wholesale orders separately from retail), set up a second Telegram group topic per workflow to keep conversations clean.

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI** | `openclaw dashboard` (tokenized — use this command, don't type the URL manually) |
| **Gateway Port** | 18789 |
| **Model** | Anthropic (`anthropic/claude-opus-4-6`) |
| **Channel** | Telegram |
| **Cron Timezone** | `America/Los_Angeles` (Portland, OR) |
| **OpenClaw Docs** | https://docs.openclaw.ai |
| **Security Audit** | `openclaw security audit --deep` |
| **Watch Live Logs** | `openclaw logs --follow` |
| **Gateway Status** | `openclaw gateway status` |
| **Cron Jobs** | `openclaw cron list` |
| **Installed Skills** | `openclaw skills list` |
| **Test a Cron Job** | `openclaw cron run <job-id>` |

---

**OPENCLAW | Your Agent. Your Hardware. Your Soul.**
