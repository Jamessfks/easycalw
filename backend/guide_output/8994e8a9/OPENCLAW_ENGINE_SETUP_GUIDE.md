# OPENCLAW ENGINE SETUP GUIDE
**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Eight |
| **MISSION** | Organize Gmail workflow and manage email conversations automatically |
| **DATE** | 2026-03-27 |
| **DEPLOYMENT** | Existing Mac |
| **CHANNEL** | Telegram |
| **MODEL** | Anthropic — claude-sonnet-4-6 |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

> ⚠️ **WARNING:** Your interview did not specify hardware or a messaging channel. This guide assumes you are running OpenClaw on your **existing Mac** and will connect via **Telegram**. If you use a different setup, visit https://docs.openclaw.ai to find the matching guide.

**This guide configures your OpenClaw agent to tame your Gmail inbox and organize your email conversations — so you spend time on work that matters, not sorting through messages.**

---

## 🎯 Key Moments — What You Will Accomplish

By the end of this guide, you will have:

- **A running OpenClaw instance** on your existing Mac, connected to Telegram, ready to read and summarize your Gmail inbox on demand and on a schedule
- **Two tailored automations** — a morning inbox briefing and an on-demand email conversation organizer — that replace the manual inbox-scanning you currently do every day
- **Beginner-safe guardrails** ensuring your agent never sends emails or deletes messages without your explicit approval

---

## 00 | ✅ PRE-FLIGHT CHECKLIST

> ✅ **ACTION:** Complete every item below **before** running a single command. Missing prerequisites will cause you to backtrack mid-setup.

### Accounts to Create
- [ ] **Anthropic account** — Sign up at https://console.anthropic.com. You need an API key. Set a monthly spending limit of **$20** to start.
- [ ] **Telegram account** — Install the Telegram app on your phone if you haven't already (https://telegram.org). It's free.
- [ ] **Google account access confirmed** — You will authorize OpenClaw to read (not send) your Gmail during the skills setup step.

### API Keys to Obtain
- [ ] **Anthropic API Key** — In the Anthropic Console: go to **API Keys → Create Key**. Copy the key and paste it into your password manager or a secure notes app. You will need it in Section 04.

### Hardware & Software
- [ ] Mac with Apple Silicon (M1, M2, M3, or M4) running macOS 13 Ventura or newer
- [ ] At least 8 GB RAM and 2 GB free disk space
- [ ] Mac is plugged in (or you are comfortable with the sleep trade-offs described in Section 01)
- [ ] You know how to open Terminal: press **⌘ + Space**, type "Terminal", press Enter

> 💡 **TIP:** Eight, gather your Anthropic API key and have Telegram installed on your phone before starting — this prevents context-switching mid-setup and makes Section 03 much faster.

---

## 01 | 🖥️ PLATFORM SETUP

Eight, these steps prepare your Mac to run OpenClaw reliably alongside your everyday work.

> 💡 **TIP:** Why this matters for you: a Mac that goes to sleep will stop processing your email automations and miss your morning inbox briefing. A few minutes here saves you from troubleshooting a silent failure later.

### 1A — Install Xcode Command Line Tools

Open **Terminal** and run:

```bash
xcode-select --install
```

A dialog will appear asking you to install the tools. Click **Install** and wait (about 5–10 minutes). This provides the compilers and tools that OpenClaw needs.

**Verify it worked:**
```
$ xcode-select -p
/Library/Developer/CommandLineTools
```

### 1B — Install Homebrew (Package Manager)

Homebrew is the standard tool for installing software on a Mac. If you see `command not found` when typing `brew`, run:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the post-install instructions it prints on screen — specifically, copy and run the two lines it shows you to add Homebrew to your PATH.

**Verify it worked:**
```
$ brew --version
Homebrew 4.x.x
```

### 1C — Install Node.js

```bash
brew install nvm
```

After it finishes, follow the instructions it prints to add nvm to your shell. Then run:

```bash
nvm install 24
nvm use 24
nvm alias default 24
```

**Verify it worked:**
```
$ node --version
v24.x.x
```

### 1D — Keep Your Mac Awake (Recommended for Automations)

If you use a **laptop**, install the free app Amphetamine from the Mac App Store:

1. Search "Amphetamine" in the Mac App Store and install it (free)
2. Open Amphetamine → Preferences → Triggers
3. Create a new trigger: "While application is running" → choose **node**
4. Check "Allow display to sleep" — your screen can go dark, the agent keeps running
5. Set "Allow system to sleep on battery after: 30 minutes" as a safety net

If you use a **desktop Mac** (iMac, Mac Studio, Mac Pro), run this in Terminal:

```bash
sudo pmset -c sleep 0 displaysleep 10
```

**Verify it worked:**
```
$ pmset -g | grep " sleep"
 sleep          0 (current)
```

> ⚠️ **WARNING:** Without this step, when your Mac sleeps your morning email briefing cron job will not run. Telegram queues messages, so you won't lose them — but the automation won't fire on schedule.

---

## 02 | 📦 INSTALL OPENCLAW

### 2A — Run the OpenClaw Installer

In Terminal, run:

```bash
curl -fsSL https://get.openclaw.ai | bash
```

**Verify it worked:**
```
$ openclaw --version
openclaw v2026.x.x
```

> ⚠️ **WARNING:** You need version **2026.1.29 or later**. Earlier versions had a security gap. If you see a version older than that, run `npm install -g openclaw@latest` to update.

### 2B — Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag makes OpenClaw start automatically every time you log into your Mac — so you don't need to remember to start it manually.

**At each wizard prompt, choose:**

| Prompt | What to Choose |
|---|---|
| Gateway mode | **Local** |
| AI provider | **Anthropic** — paste your API key when asked |
| Model | **`anthropic/claude-sonnet-4-6`** |
| Messaging channel | **Telegram** — you will finish connecting it in Section 03 |
| Hooks | Enable **session memory** and **boot hook** |
| Skills | **Skip for now** — you'll install skills carefully in Section 05 |

![Security Handshake](templates/images/image12.png)

> ✅ **ACTION:** When the wizard shows the security acknowledgment screen, select **"Yes, I am the sole operator."** This is important — OpenClaw is designed for single-person use.

### 2C — Verify the Gateway Is Running

```bash
openclaw gateway status
openclaw doctor
```

**Verify it worked:**
```
$ openclaw gateway status
Gateway: running   Port: 18789   Uptime: Xs
Model: anthropic/claude-sonnet-4-6   Status: ✓ connected
```

Open the dashboard in your browser:

```bash
openclaw dashboard
```

This opens at `http://127.0.0.1:18789/` — you should see a green "Gateway: Online" status.

![OpenClaw Web UI](templates/images/image6.png)

---

## 03 | 📱 CONNECT YOUR CHANNEL (TELEGRAM)

Eight, this connects your OpenClaw agent to Telegram so you can chat with it from your phone or computer. This is how you'll ask it to check your email, read summaries, and receive your morning briefings.

> ✅ **ACTION:** Follow the sub-steps below in order. Each step has a verification so you know it worked before moving on.

For detailed Telegram setup, see **`reference_documents/telegram_bot_setup.md`** (in this same folder). The summary is here:

### 3A — Create Your Telegram Bot

1. Open Telegram and search for **@BotFather** (verify the handle is exactly `@BotFather`)
2. Send the message: `/newbot`
3. It will ask for a name (e.g., "My Email Assistant") then a username (must end in `bot`, e.g., `EightEmailBot`)
4. BotFather will reply with your **bot token** — a long string like `123456789:ABCDefGhIJKlmNoPQRstuVWXyz`
5. Copy that token — you need it in the next step

### 3B — Add Your Bot Token to OpenClaw

```bash
openclaw secret set telegram_token "YOUR_BOT_TOKEN_HERE"
```

Replace `YOUR_BOT_TOKEN_HERE` with the actual token from BotFather (keep the quotes).

Then update your config to use it:

```bash
openclaw config patch '{"channels":{"telegram":{"enabled":true,"botToken":"${{ secret.telegram_token }}","dmPolicy":"pairing"}}}'
openclaw gateway restart
```

**Verify it worked:**
```
$ openclaw channel test telegram
telegram   ✓ connected   bot: @YourBotName
```

### 3C — Pair Your Phone

1. Open Telegram on your phone
2. Find your newly created bot (search for its username)
3. Send it any message (e.g., "hello")
4. In Terminal, run:

```bash
openclaw pairing list telegram
openclaw pairing approve telegram
```

This approves your phone as the authorized sender — only you can talk to this bot.

### 3D — Lock Down Access

> ⚠️ **WARNING:** Without this step, anyone who discovers your bot's username can send it commands. Always lock it down.

```bash
openclaw config patch '{"access":{"dm":{"mode":"allowlist"}}}'
```

To get your Telegram numeric user ID (needed for the allowlist):

1. DM your bot from your phone
2. In Terminal, run `openclaw logs --follow`
3. Look for `from.id:` in the output — that number is your Telegram user ID
4. Press Ctrl+C to stop the log

```bash
openclaw config patch '{"channels":{"telegram":{"dmPolicy":"allowlist","allowFrom":["YOUR_NUMERIC_USER_ID"]}}}'
openclaw gateway restart
```

**Verify it worked:**
```
$ openclaw channel list
telegram   ✓ connected   dmPolicy: allowlist   allowFrom: 1 user
```

![Channel Selection](templates/images/image3.png)

---

## 04 | 🧠 CONFIGURE YOUR MODEL PROVIDER (ANTHROPIC)

Verify your provider is configured correctly:

```bash
openclaw models status
```

**Verify it worked:**
```
Provider: anthropic   Status: ✓ active   Model: claude-sonnet-4-6
```

If you see an error, run:

```bash
openclaw onboard --anthropic-api-key "YOUR_ANTHROPIC_API_KEY"
```

Then verify again with `openclaw models status`.

> 💡 **TIP:** Eight, set a monthly spending limit in your Anthropic Console at https://console.anthropic.com → Settings → Limits. For Gmail triage and email organization, expect **$3–$10/month** with Claude Sonnet. Set your limit to $20 to give yourself headroom.

![Model Provider Selection](templates/images/image11.png)

---

## 05 | 🔧 INSTALL SKILLS

> ⚠️ **WARNING:** Always install `skill-vetter` first and use it to screen every subsequent skill before installing it. This is non-negotiable — approximately 17–20% of community skills contain suspicious code. `skill-vetter` is your firewall.

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

`prompt-guard` is essential for you specifically: every time the agent reads one of your emails, it reads content from the internet. `prompt-guard` stops malicious email content from hijacking your agent.

```bash
skill-vetter prompt-guard
clawhub install prompt-guard
```

**Step 3: Vet and install agentguard**

`agentguard` is your runtime safety net — it blocks dangerous actions (like deleting files or sending emails without approval) before they happen.

```bash
skill-vetter agentguard
clawhub install agentguard
```

**Verify all three are active:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
prompt-guard   v1.x.x   ✓ active
agentguard     v1.x.x   ✓ active
```

### Phase 2: Gmail & Email Skills

| Your Need | Skill | What It Does |
|---|---|---|
| Read Gmail, check calendar, organize Drive | `gog` | Full Google Workspace — Gmail, Calendar, Drive, Docs, and Sheets in one skill |
| Dedicated email triage + reply drafting | `agent-mail` | AI inbox with automatic sorting, prioritization, and draft replies |
| Summarize long email threads | `summarize` | Condenses any long text, thread, or document into a concise digest |
| Agent that learns your preferences over time | `self-improving-agent` | Remembers your habits, avoids repeated mistakes, adapts to your style |

**Install them in order (vet each one first):**

```bash
skill-vetter gog
clawhub install gog

skill-vetter agent-mail
clawhub install agent-mail

skill-vetter summarize
clawhub install summarize

skill-vetter self-improving-agent
clawhub install self-improving-agent
```

**Verify all skills are active:**
```
$ openclaw skills list
skill-vetter        v1.x.x   ✓ active
prompt-guard        v1.x.x   ✓ active
agentguard          v1.x.x   ✓ active
gog                 v1.x.x   ✓ active
agent-mail          v1.x.x   ✓ active
summarize           v1.x.x   ✓ active
self-improving-agent v1.x.x  ✓ active
```

### Phase 3: Authorize Google (gog skill)

After installing `gog`, you need to connect your Google account:

1. Open your OpenClaw dashboard: `openclaw dashboard`
2. Navigate to **Skills → gog → Authorize**
3. Follow the OAuth flow to grant read access to your Gmail
4. Choose **read-only access** — do not grant send access yet

> 🔒 **Data Handling Note:** Your Gmail content is sent to Anthropic's API for processing. Do not ask your agent to read emails containing passwords, full credit card numbers, or other sensitive secrets. For routine work emails, newsletters, and meeting coordination, this is safe and appropriate.

---

## 06 | ⚡ CONFIGURE AUTOMATIONS

> 💡 **TIP:** Why this matters for you, Eight: instead of opening Gmail every morning to see what came in overnight, your agent will do it automatically and send you a clean summary directly in Telegram — before you've had your first coffee.

Before adding cron jobs, find your Telegram chat ID:

1. Send any message to your bot in Telegram
2. Run `openclaw logs --follow` in Terminal
3. Look for `chat.id:` in the output — note that number
4. Press Ctrl+C

### Automation 1 — Morning Inbox Briefing

**What it does:** Every morning at 8 AM, your agent reads your Gmail inbox, identifies unread emails from the past 12 hours, and sends you a prioritized summary to Telegram.
**Autonomy Tier: 🔔 NOTIFY** — Agent reads and summarizes. Does not reply to or delete anything.

```bash
openclaw cron add \
  --name "morning-inbox-brief" \
  --cron "0 8 * * *" \
  --tz "America/New_York" \
  --session isolated \
  --message "Check my Gmail inbox for unread emails from the last 12 hours. Group them by priority: (1) needs my reply today, (2) FYI only, (3) newsletters/promotions. Give me a bulleted summary with sender, subject, and one-sentence description for each. Do not send any replies." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

Replace `YOUR_TELEGRAM_CHAT_ID` with the number you noted above. Replace `America/New_York` with your actual timezone (e.g., `America/Los_Angeles`, `America/Chicago`, `Europe/London`).

**Verify it worked:**
```
$ openclaw cron list
ID   Name                   Schedule     Timezone           Status
1    morning-inbox-brief    0 8 * * *    America/New_York   ✓ active
```

### Automation 2 — Evening Thread Digest

**What it does:** Every weekday at 6 PM, your agent checks for email conversations that are waiting for your response and summarizes any long threads you were CC'd on.
**Autonomy Tier: 🔔 NOTIFY** — Observe and summarize only. No action taken.

```bash
openclaw cron add \
  --name "evening-thread-digest" \
  --cron "0 18 * * 1-5" \
  --tz "America/New_York" \
  --session isolated \
  --message "Check my Gmail for: (1) any threads where the last message was from someone else and I haven't replied in more than 4 hours, and (2) any long CC threads from today that I should be aware of. Summarize what I need to follow up on. Do not send any replies." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                    Schedule        Timezone           Status
1    morning-inbox-brief     0 8 * * *       America/New_York   ✓ active
2    evening-thread-digest   0 18 * * 1-5    America/New_York   ✓ active
```

> 💡 **TIP:** You can also ask your agent to summarize a specific email thread on demand, any time, just by messaging it in Telegram: "Summarize the thread with [person's name] from today."

---

## 07 | 💉 INJECT YOUR SOUL

This is the step that transforms OpenClaw from a generic AI into YOUR personal email assistant.

> ✅ **ACTION:** Open `prompts_to_send.md` (in the same folder as this guide). Paste each prompt into your OpenClaw chat interface **one at a time**, in order. Wait for the agent to acknowledge each one before sending the next.

Open your dashboard:

```bash
openclaw dashboard
```

Or open Telegram and message your bot directly.

**Prompt sequence to send:**
1. **Identity Prompt** → tells the agent who it is and what it serves
2. **Skills Installation Prompt** → confirms skills and maps them to your needs
3. **Routines & Automations Prompt** → describes the email workflows it should follow
4. **Guardrails & Safety Prompt** → establishes what the agent must never do
5. **Personality & Style Prompt** → sets tone and communication style
6. **Security Audit Prompt** → final verification before going live

> 💡 **TIP:** Wait for the agent to reply to each prompt before sending the next. A short "Got it" or acknowledgment is fine — you just want each instruction layer to be absorbed before adding the next one.

![OpenClaw Web UI](templates/images/image6.png)

---

## 08 | 🔒 SECURITY HARDENING

> ⚠️ **WARNING:** Eight, do not skip this section. Your Gmail contains private conversations, and your OpenClaw agent will have read access to it. These steps ensure that access stays controlled and that no one else can send commands to your bot.

### Mac-Specific Hardening

**Step 1: Verify FileVault is on**

FileVault encrypts your entire Mac disk, protecting your agent's session data and API keys if your Mac is ever lost or stolen.

```bash
fdesetup status
```

**Verify it worked:**
```
FileVault is On.
```

If it says "FileVault is Off", go to **System Settings → Privacy & Security → FileVault** and turn it on. This is a one-time setup.

**Step 2: Enable sandboxing in your config**

This prevents the agent from reading files outside its workspace:

```bash
openclaw config patch '{"sandbox":{"enabled":true,"mode":"workspace","workspaceRoot":"~/.openclaw/workspaces","perSender":true}}'
```

**Step 3: Restrict tools to what you actually need**

```bash
openclaw config patch '{"tools":{"allow":["file_read","web_search","calculator","datetime","memory_store","memory_recall"],"deny":["shell_exec","file_delete"]}}'
```

**Step 4: Set up macOS Keychain for secrets (already configured if you used `openclaw secret set`)**

Verify your secrets are in the Keychain, not in plain text:

```bash
cat ~/.openclaw/config.yaml | grep -i "api_key\|token\|secret"
```

**Verify it worked:** You should see only `${{ secret.xxx }}` references, never actual key values.

**Step 5: Schedule a nightly gateway restart**

This prevents memory buildup on long-running sessions:

```bash
openclaw config patch '{"cron":[{"name":"daily_restart","schedule":"0 4 * * *","action":"run_command","command":"openclaw gateway restart"}]}'
```

### General Security Checklist

- [ ] FileVault is enabled
- [ ] Telegram bot uses `dmPolicy: allowlist` with your user ID only
- [ ] Sandbox is enabled
- [ ] Shell exec tool is denied
- [ ] No plain-text API keys in `~/.openclaw/config.yaml`
- [ ] Anthropic console spending limit is set to $20/month
- [ ] API keys will be rotated every 90 days (add a calendar reminder now)

---

## 09 | 🔍 SECURITY AUDIT CHECKLIST

> ✅ **ACTION:** Run this audit before using OpenClaw for real email operations. Do not skip this step.

```bash
openclaw security audit --deep
```

**Verify it worked:**
```
Security Audit Complete
Critical warnings: 0
Recommendations: X (review below)
```

If there are critical warnings, run:

```bash
openclaw security audit --fix
openclaw doctor
```

**Manual verification checklist:**
- [ ] `openclaw security audit --deep` completes with 0 critical warnings
- [ ] `openclaw gateway status` shows "running" with authentication active
- [ ] `openclaw cron list` shows exactly 2 jobs: `morning-inbox-brief` and `evening-thread-digest`
- [ ] `openclaw skills list` shows exactly the 7 skills installed in Section 05
- [ ] Telegram bot only responds to messages from your account (test by asking a friend to message it — it should ignore them)
- [ ] No API keys in plain text: `grep -r "sk-ant" ~/.openclaw/` should return nothing
- [ ] FileVault is on: `fdesetup status`
- [ ] Review skill permissions: `openclaw skills list --verbose`

**Do NOT begin using your email agent until all checks pass.**

---

## 10 | 🚀 TROUBLESHOOTING & NEXT STEPS

### Common Issues

**"command not found: openclaw" after installing**
```bash
source ~/.zshrc
# or
source ~/.bash_profile
```

**Gateway not responding**
```bash
openclaw doctor
openclaw gateway stop && openclaw gateway start
```

**Telegram bot not responding**
- Verify bot token: `openclaw channel list`
- Check logs: `openclaw logs --follow`
- Confirm your user ID is in the allowlist: `openclaw config validate`

**Cron jobs not firing**
- Verify gateway is running: `openclaw gateway status`
- Check schedule: `openclaw cron list`
- Test manually: `openclaw cron run <job-id>`
- Ensure your Mac was not asleep at the scheduled time

**Gmail not accessible**
- Re-authorize via the dashboard: `openclaw dashboard` → Skills → gog → Reauthorize
- Check that the OAuth token has not expired

**Memory climbing above 1 GB after long sessions**
```bash
openclaw gateway restart
openclaw session prune --older-than 7d
```

### Next Steps After Your First Week

Once you've run the system for 1–2 weeks, Eight, consider:

1. **Add on-demand commands** — Message your bot: "Draft a reply to [person]'s email about [topic]" and review the draft before sending
2. **Expand to Google Calendar** — The `gog` skill already supports it. Ask: "What's on my calendar tomorrow?" any time
3. **Context hygiene** — After week 5, if your conversations feel confused, use `openclaw session prune --older-than 14d` to clear stale context

> 💡 **TIP:** Memory files should be kept under 1,500 tokens for best performance. The `self-improving-agent` skill handles this automatically, but if responses feel slower over time, run `openclaw session prune` to help.

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI URL** | `openclaw dashboard` → opens at http://127.0.0.1:18789 |
| **Gateway Port** | 18789 |
| **Model Provider** | Anthropic (`claude-sonnet-4-6`) |
| **Channel** | Telegram (DM allowlist) |
| **Config File** | `~/.openclaw/config.yaml` |
| **Cron Jobs** | `openclaw cron list` |
| **Installed Skills** | `openclaw skills list` |
| **Gateway Status** | `openclaw gateway status` |
| **Logs** | `openclaw logs --follow` |
| **Security Audit** | `openclaw security audit --deep` |
| **OpenClaw Docs** | https://docs.openclaw.ai |
| **Telegram Bot Setup Reference** | `reference_documents/telegram_bot_setup.md` |

---

**OPENCLAW | Your Agent. Your Hardware. Your Soul.**
