# OPENCLAW ENGINE SETUP GUIDE

**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Oakland Bakery Owner |
| **MISSION** | Automate supplier orders and morning schedule briefings |
| **DATE** | 2026-03-27 |
| **DEPLOYMENT** | Mac Mini (dedicated hardware) |
| **CHANNEL** | Telegram |
| **MODEL** | Anthropic Claude (Opus) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

**This guide configures your OpenClaw agent to handle supplier order tracking and morning schedule briefings — built around your bakery workflow and the Mac Mini you already own.**

Running a bakery means your morning starts before most people's alarms go off. Flour deliveries, schedule confirmations, supplier follow-ups — by 6 AM you're already behind. This guide turns your Mac Mini into a 24/7 AI employee that handles the coordination so you can focus on the bake.

---

## Key Moments — What You Will Accomplish

By the end of this guide, you will have:

- **A running OpenClaw instance** on your Mac Mini, connected to Telegram and ready for daily use
- **2 tailored automations** — a morning briefing cron job and a supplier order reminder — that run on schedule without manual intervention
- **A properly hardened Mac Mini** with FileVault encryption, firewall enabled, and token-authenticated gateway so your bakery operations stay private

---

## 00 | PRE-FLIGHT CHECKLIST

> **ACTION:** Complete every item below before running a single command. Missing prerequisites will cause you to backtrack.

### Accounts to Create

- [ ] **Anthropic account** — Create at [console.anthropic.com](https://console.anthropic.com). You need an API key. Set a monthly spending limit of **$20–$50** to start.
- [ ] **Telegram account** — Install Telegram on your iPhone if you haven't already.
- [ ] **Dedicated Apple ID for your Mac Mini** — Do not run OpenClaw under your personal macOS account. Create a separate macOS user account for the agent.

### API Keys to Obtain

- [ ] **Anthropic API Key** — In your Anthropic console: API Keys → Create Key. Copy and save it somewhere secure (a password manager works well).

### Hardware and Software

- [ ] Mac Mini powered on and connected to the internet
- [ ] If running headless (no monitor): pick up an **HDMI dummy plug** ($8–10 on Amazon) — without it, macOS gets erratic in headless mode and screen capture breaks
- [ ] Terminal access confirmed: press Cmd+Space, type "Terminal", press Enter

> **TIP:** Gather your Anthropic API key before starting — switching context mid-setup to hunt for credentials is where most people lose their place.

---

## 01 | PLATFORM SETUP

These steps prepare your Mac Mini to run OpenClaw reliably around the clock.

> **WARNING:** Run OpenClaw under a **dedicated macOS user account**, not your personal account. Your personal account likely has iCloud Photos, Keychain passwords, and sensitive documents synced. Giving OpenClaw broad system access on your personal account means it can reach all of that. A separate account isolates the agent completely.

### 1A — Enable FileVault Disk Encryption

Go to **Apple menu > System Settings > Privacy & Security > FileVault** and turn it on. This encrypts your entire disk. If someone physically walks out with your Mac Mini (it happens), they cannot read your API keys, order logs, or anything else stored on it. Encryption takes about 30 minutes on first enable.

### 1B — Update macOS

Go to **Apple menu > System Settings > General > Software Update** and install everything available. Restart if prompted. OpenClaw requires macOS to be current for Node.js compatibility.

### 1C — Configure Always-On Settings

Your bakery opens early. If your Mac Mini goes to sleep at 2 AM, your 5 AM supplier reminder will never fire. Fix this permanently:

Go to **System Settings > Energy** and enable all three:
- "Prevent automatic sleeping when the display is off"
- "Wake for network access"
- "Start up automatically after a power failure"

Then install **Amphetamine** from the Mac App Store for belt-and-suspenders sleep prevention. Launch it (look for the pill icon in your menu bar), open Preferences, and set:
- "Launch Amphetamine at login" — ON
- "Start session when Amphetamine launches" — ON, duration: Indefinitely
- "Start session after waking from sleep" — ON

> **TIP:** Why this matters for you: your morning briefing cron job fires at 5:30 AM. A Mac Mini that sleeps will miss it silently — no error, no message, just nothing. These two layers of sleep prevention ensure your briefing arrives every single morning.

### 1D — Enable Remote Access

Enable Remote Login (SSH) in **System Settings > General > Sharing**. This lets you manage the machine from your phone or another computer without needing a monitor plugged in. Also enable Screen Sharing (VNC) for occasional graphical tasks.

**Verify SSH works:**
```bash
ssh yourusername@your-mac-mini-ip
```

---

## 02 | INSTALL OPENCLAW

### 2A — Install Xcode Command Line Tools

Open Terminal and run:

```bash
xcode-select --install
```

A dialog will appear — click Install and wait a few minutes. This installs the compilers Homebrew needs.

**Verify it worked:**
```
$ xcode-select -p
/Library/Developer/CommandLineTools
```

### 2B — Install Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After it finishes, add Homebrew to your PATH (required on Apple Silicon):

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

If it's older, run `brew upgrade node`.

### 2D — Run the OpenClaw Installer

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Wait until you see "Installation finished successfully!" then verify:

```bash
openclaw --version
```

**Verify it worked:**
```
$ openclaw --version
openclaw v2026.x.x   ← must be 2026.1.29 or later
```

> **WARNING:** You need version **2026.1.29 or later**. In v2026.1.29, the gateway auth mode "none" was permanently removed — the gateway now requires token or password authentication. If you followed an older YouTube tutorial that set `auth: "none"`, your gateway will not start. Fix it by running `openclaw onboard` to reconfigure.

### 2E — Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag is critical. It installs a launchd service so OpenClaw starts automatically on boot and runs 24/7 — even after a power outage restarts your Mac Mini.

**At each wizard prompt, choose:**

| Prompt | Recommended Choice |
|---|---|
| Gateway mode | **Local** (not Remote) |
| AI provider | **Anthropic** — paste your API key |
| Model | **Claude Opus** — the smartest, most personable model. Worth the cost for a bakery with daily decision-making. |
| Messaging channels | **Telegram** — set up in Section 03 |
| Hooks | Enable **session memory**, **boot hook**, and **command logger** |
| Skills | **Skip for now** — install deliberately in Section 05 |

> **ACTION:** When the wizard shows the security acknowledgment screen, select **"Yes"** to confirm you are the sole operator of this instance.

---

## 03 | CONNECT YOUR CHANNEL (TELEGRAM)

This connects your agent to Telegram so you can text it tasks and receive your morning briefings directly on your phone.

### 3A — Create Your Bakery Bot

Do this on your iPhone where Telegram is installed:

1. Open Telegram and search for **@BotFather** — look for the blue checkmark (that's the real one)
2. Tap **Start**
3. Type `/newbot` and send it
4. BotFather asks for a display name — try something like "Baker" or "Atlas" or your bakery's name
5. BotFather asks for a username — it must end in "bot" and be globally unique (e.g. `oaklandbakery_bot`)
6. BotFather responds with your **bot token** — copy it immediately

### 3B — Add the Bot Token to OpenClaw

When OpenClaw asks for your Telegram bot token during channel setup, paste it in. Then start your gateway and approve the pairing:

```bash
openclaw gateway
openclaw pairing list telegram
openclaw pairing approve telegram <code>
```

Pairing codes expire after 1 hour. If yours expired, just DM your bot again and run `openclaw pairing list telegram` to get a fresh code.

**Verify it worked:**
```
$ openclaw channels status
telegram   ✓ connected
```

### 3C — Lock Down Access

> **WARNING:** Without this step, anyone who discovers your bot's username can send it commands. For a bakery, that means a stranger could potentially trigger your supplier order reminders or extract your schedule.

For a single-owner bot (which is what you want), switch from the default pairing policy to an explicit allowlist. After pairing, find your numeric Telegram user ID:

1. DM your bot
2. Run `openclaw logs --follow` in Terminal
3. Look for `from.id` in the log — that number is your Telegram user ID

Then update your config to lock the bot to your ID only:

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

Restart the gateway after changing config: `openclaw gateway stop && openclaw gateway start`

Now message your bot in Telegram — it will respond. Anyone else who tries will be blocked.

---

## 04 | CONFIGURE YOUR MODEL PROVIDER (ANTHROPIC)

```bash
openclaw models status
```

**Verify it worked:**
```
Provider: anthropic   Status: ✓ active   Model: claude-opus-4-20250514
```

If not configured, add your key:
```bash
openclaw onboard --anthropic "YOUR_ANTHROPIC_API_KEY"
```

> **TIP:** Set a monthly spending cap in your Anthropic console right now. Typical bakery usage — morning briefings, supplier reminders, occasional manual queries — runs **$10–$30/month**. A misconfigured runaway loop can burn through that in hours. Set your cap before anything else breaks.

---

## 05 | INSTALL SKILLS

> **WARNING:** Always install `skill-vetter` first — no exceptions. Approximately 17–20% of community skills contain suspicious or malicious code. Skill-vetter scans each skill before you grant it machine access.

### Phase 1: Security Stack (Install First, No Exceptions)

```bash
clawhub install skill-vetter
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
```

Now vet and install prompt-guard:

```bash
skill-vetter prompt-guard
clawhub install prompt-guard
```

Prompt-guard defends against prompt injection — malicious instructions embedded in web pages, emails, or documents that try to hijack your agent. As your agent reads supplier websites or order confirmation emails, prompt-guard is what stops those from becoming attack vectors.

### Phase 2: Core Bakery Skills

All three slugs below are verified against `skill_registry.md`.

| Your Need | Skill | What It Does |
|---|---|---|
| Morning schedule and task reminders | `apple-reminders` | Manage Apple Reminders from chat — lists, adds, edits, completes reminders with iCloud sync across all your Apple devices |
| Supplier order emails and Google Sheets tracking | `gog` | Full Google Workspace — Gmail, Calendar, Drive, Docs, and Sheets in one skill |
| Supplier invoice intake and accounting prep | `bookkeeper` | Email invoice OCR, extraction, and accounting entry creation |

```bash
skill-vetter apple-reminders
clawhub install apple-reminders

skill-vetter gog
clawhub install gog

skill-vetter bookkeeper
clawhub install bookkeeper
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter     v1.x.x   ✓ active
prompt-guard     v1.x.x   ✓ active
apple-reminders  v1.x.x   ✓ active
gog              v1.x.x   ✓ active
bookkeeper       v1.x.x   ✓ active
```

> **SMALL BUSINESS NOTE:** The `gog` skill requires Google OAuth setup. When it prompts you, authenticate with the **dedicated Google account** you set up for the Mac Mini — not your personal Gmail. Share only the specific Sheets and Drive folders your agent needs access to. This limits blast radius if something goes wrong.

---

## 06 | CONFIGURE AUTOMATIONS

> **TIP:** Why this matters: these two automations replace the two most repetitive daily tasks you described — checking what's on your schedule each morning and tracking supplier orders. Once configured, they run themselves.

### Automation 1 — Morning Bakery Briefing

**What it does:** Every morning at 5:30 AM Pacific, your agent checks your schedule for the day (via `gog` and Apple Reminders), compiles a plain-English briefing, and delivers it to your Telegram.

**Autonomy Tier: NOTIFY** — Your agent reads and summarizes. It takes no action without you.

```bash
openclaw cron add \
  --name "Morning Bakery Briefing" \
  --cron "30 5 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Generate a morning briefing for the bakery. Include: (1) today's schedule and any reminders from Apple Reminders, (2) any pending supplier order confirmations in Gmail, (3) any items flagged in the supplier tracking sheet in Google Drive. Keep it brief — bullet points only. This is for a bakery owner reading it at 5:30 AM before the oven goes on." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                      Schedule      Timezone              Status
1    Morning Bakery Briefing   30 5 * * *    America/Los_Angeles   ✓ active
```

To test it immediately without waiting until 5:30 AM:
```bash
openclaw cron run <job-id>
```

### Automation 2 — Weekly Supplier Order Reminder

**What it does:** Every Sunday at 4 PM, your agent sends you a Telegram reminder to review and place next week's supplier orders. It checks your supplier tracking sheet for items running low.

**Autonomy Tier: NOTIFY** — Your agent reminds and summarizes. It does not place orders without your explicit approval.

```bash
openclaw cron add \
  --name "Supplier Order Review" \
  --cron "0 16 * * 0" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Check the supplier tracking sheet in Google Drive for items flagged as 'low' or 'reorder'. Compile a plain-English list of what needs to be ordered this week, which supplier each item comes from, and the typical order lead time. Format as a short checklist I can review and act on. This is for a bakery in Oakland — suppliers include flour, butter, eggs, packaging, and specialty ingredients." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                      Schedule      Timezone              Status
1    Morning Bakery Briefing   30 5 * * *    America/Los_Angeles   ✓ active
2    Supplier Order Review     0 16 * * 0    America/Los_Angeles   ✓ active
```

> **HOW TO FIND YOUR_TELEGRAM_CHAT_ID:** DM your bot and run `openclaw logs --follow` in Terminal. Look for `chat.id` in the output — that number is your chat ID.

---

## 07 | INJECT YOUR SOUL

Open your OpenClaw dashboard in the browser:

```bash
openclaw dashboard
```

> **WARNING:** Do not type `http://127.0.0.1:18789` manually in your browser — you will get a "gateway token missing" error. Use `openclaw dashboard` which opens a tokenized URL. Bookmark it.

With the dashboard open, paste each prompt from `prompts_to_send.md` into the chat interface **one at a time, in order**. Wait for the agent to acknowledge each prompt before sending the next.

**Prompt sequence:**
1. **Identity Prompt** — establishes who the agent is and how it operates your bakery
2. **Supplier Order Protocol** — teaches it how to handle order tracking and supplier communication
3. **Morning Briefing Style** — sets the format and tone for daily briefings
4. **Security Audit Prompt** — final verification before going live (always last)

---

## 08 | SECURITY HARDENING

> **WARNING:** Do not skip this section. OpenClaw runs with broad system permissions on your Mac Mini. A misconfigured agent can read files, execute commands, and send messages. Take 10 minutes here to lock it down properly.

### Mac Mini-Specific Hardening

**Enable macOS Firewall:**
Go to **System Settings > Network > Firewall** — turn it on.

**Verify gateway is loopback-only:**
Check your OpenClaw config (`~/.openclaw/config.json5`) and confirm `gateway.bind` is set to `127.0.0.1`. This means the gateway only accepts connections from your own machine — it cannot be reached from the internet or your local network.

**Token authentication is active:**
As of v2026.1.29, auth mode "none" is permanently removed. Verify:
```bash
openclaw doctor
```
If `doctor` reports "no auth configured", run `openclaw onboard` to reconfigure.

**Remote access via Tailscale (recommended):**
Install Tailscale (free at tailscale.com). This lets you SSH into your Mac Mini from anywhere without port forwarding. It's the safest way to manage your agent remotely.

### Bakery Operations Compliance Checklist

- [ ] FileVault encryption enabled (completed in Section 01)
- [ ] Dedicated macOS user account — OpenClaw is not running under your personal account
- [ ] Dedicated Apple ID and Google account for the agent — not your personal accounts
- [ ] API spending limit set in Anthropic console
- [ ] Telegram bot locked to your numeric user ID only (completed in Section 03C)
- [ ] API keys rotated quarterly — add a recurring Apple Reminder now: "Rotate OpenClaw API keys"
- [ ] OpenClaw conversation logs retained for 30 days (audit trail)

---

## 09 | SECURITY AUDIT CHECKLIST

> **ACTION:** Run this audit before using OpenClaw for real bakery operations.

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

**Manual verification — check every item:**

- [ ] `openclaw security audit --deep` completes with no critical warnings
- [ ] Gateway shows "running" with token authentication active
- [ ] `openclaw cron list` shows exactly 2 jobs — Morning Bakery Briefing and Supplier Order Review — and nothing else
- [ ] `openclaw skills list` shows exactly: skill-vetter, prompt-guard, apple-reminders, gog, bookkeeper
- [ ] Telegram bot only responds to your account (test: have someone else try to DM your bot — it should be silently blocked)
- [ ] No API keys stored in plain text: `cat ~/.openclaw/config.json5` — keys should show as masked or referenced, not raw strings
- [ ] Review skill permissions: `openclaw skills list --verbose`
- [ ] macOS Firewall is ON: System Settings > Network > Firewall

**Do NOT begin using OpenClaw for live bakery operations until all checks pass.**

---

## 10 | TROUBLESHOOTING AND NEXT STEPS

### Common Issues

**"command not found: openclaw" after installing**
```bash
source ~/.zshrc
```
Or open a new Terminal window.

**Gateway not responding**
```bash
openclaw doctor
openclaw gateway stop && openclaw gateway start
```

**Telegram bot not responding**
- Verify bot token: `openclaw channels status`
- Check logs: `openclaw logs --follow`
- Confirm your Telegram user ID is in `allowFrom` (Section 03C)

**Cron jobs not firing at 5:30 AM**
- Verify the Mac Mini did not sleep: check Amphetamine is running
- Verify gateway is running: `openclaw gateway status`
- Check the schedule: `openclaw cron list`
- Test immediately: `openclaw cron run <job-id>`

**"sharp" errors during installation**
```bash
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g openclaw@latest
```
Also verify Xcode Command Line Tools are installed: `xcode-select --install`

**High API costs**
Check which sessions are consuming tokens via `openclaw logs --follow`. The morning briefing and supplier review jobs should each cost only a few cents. If you're seeing dollars per run, there's likely a runaway loop — run `openclaw gateway stop` immediately, then check your cron config.

### Next Steps After Stable Setup (Week 2+)

Once you've run the system for 1–2 weeks and trust the morning briefings, consider:

1. **Add the `payment` skill** — lets the agent draft supplier payment requests with approval gates. Never processes a payment without your explicit confirmation.
2. **Set up a supplier tracking Google Sheet** — your agent's `gog` skill can read and update it automatically when you text it "Mark flour order as received."
3. **Context hygiene** — after week 5, use separate Telegram chat topics for schedule vs supplier orders to keep contexts clean and prevent cross-contamination between workflows.

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI URL** | `openclaw dashboard` (tokenized — do not type manually) |
| **Gateway Port** | 18789 |
| **Model Provider** | Anthropic (Claude Opus) |
| **Channel** | Telegram |
| **Cron Timezone** | `America/Los_Angeles` |
| **Morning Briefing** | Daily 5:30 AM Pacific |
| **Supplier Reminder** | Sundays 4:00 PM Pacific |
| **OpenClaw Docs** | https://docs.openclaw.ai |
| **Security Audit** | `openclaw security audit --deep` |
| **Logs** | `openclaw logs --follow` |
| **Gateway Status** | `openclaw gateway status` |
| **Cron Jobs** | `openclaw cron list` |
| **Installed Skills** | `openclaw skills list` |
| **Anthropic Console** | https://console.anthropic.com |
| **Tailscale** | https://tailscale.com |

---

**OPENCLAW | Your Agent. Your Hardware. Your Soul.**
