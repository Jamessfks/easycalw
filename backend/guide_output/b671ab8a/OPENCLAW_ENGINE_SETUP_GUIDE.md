# OPENCLAW ENGINE SETUP GUIDE
**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Amara Okafor — E-commerce (Lush & Local) |
| **MISSION** | Reclaim 3+ hours per day from email and social media so you can focus on product development |
| **DATE** | 2026-03-26 |
| **DEPLOYMENT** | Hetzner VPS (Ubuntu 22.04 LTS) |
| **CHANNEL** | WhatsApp |
| **MODEL** | Anthropic (Claude) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

**Amara, your OpenClaw agent will handle the avalanche of customer emails, shipping questions, and social media tasks that are eating your day — drafting every reply for your approval before anything goes out, so you stay in control while getting your time back.**

---

## 🎯 Key Moments — What You Will Accomplish

By the end of this guide, you will have:

- **A 24/7 AI assistant running on your Hetzner VPS**, reachable from WhatsApp on any device, that works across time zones so your VA and you are always in sync
- **3 automated workflows** that draft customer email replies, summarize your inbox, and surface your daily order status — all delivered to your WhatsApp before you start your morning
- **A secure, supervised system** where your agent drafts and you approve: no customer message ever goes out without your sign-off until you decide you're ready to change that

---

## 00 | ✅ PRE-FLIGHT CHECKLIST

> ✅ **ACTION:** Complete every item below **before** running a single command. Missing prerequisites will cause you to backtrack.

### Accounts to Create
- [ ] **Anthropic account** — Sign up at console.anthropic.com. You will need an API key. Set a monthly spending limit of **$20–$50** to start — this prevents runaway costs if something is misconfigured.
- [ ] **Hetzner account** — Sign up at hetzner.com/cloud. Have a credit card or PayPal ready.
- [ ] **WhatsApp Business** — If you haven't already, download WhatsApp Business on your phone and connect your business number.

### API Keys to Obtain
- [ ] **Anthropic API Key** — In console.anthropic.com: go to API Keys → Create Key. Copy it and save it in your password manager. You will need it during setup.

### Hardware & Software Checklist
- [ ] Windows laptop with a web browser (for logging into Hetzner and pasting commands)
- [ ] A terminal app on Windows: download **PuTTY** (putty.org) for SSH access to your VPS, or use Windows Terminal with the built-in SSH client
- [ ] Your WhatsApp Business number available (you will scan a QR code during channel setup)
- [ ] 30–60 minutes of uninterrupted time

> 💡 **TIP:** Amara, gather your Anthropic API key and have your password manager open before you start. Context-switching mid-setup to find keys is the number one cause of mistakes for first-time installers.

> ⚠️ **WARNING:** Your VPS will be a live server on the internet. Do not skip the firewall steps in Section 01. Over 30,000 OpenClaw instances have been found exposed because users skipped firewall setup.

---

## 01 | 🖥️ PLATFORM SETUP

Amara, these steps provision your Hetzner server and secure it before OpenClaw touches it. Read each step fully before running the command.

> 💡 **TIP:** Why a VPS is right for you: your VA is in a different time zone. A VPS runs 24/7 — it doesn't care when you close your laptop. Your agent will be available to draft replies and run your morning summary even while you sleep.

### 1A — Provision Your Hetzner Server

1. Log into hetzner.com/cloud
2. Click **New Project** → name it "lush-local-agent"
3. Click **Add Server**
4. Choose these settings:
   - **Location:** Pick the region closest to you (e.g., Ashburn for US East, Helsinki for Europe)
   - **Image:** Ubuntu 22.04 LTS
   - **Type:** CX21 (~EUR 5-6/month, 4GB RAM) — this is the minimum recommended for reliable production use
   - **SSH Keys:** Click "Add SSH Key" — see 1B for how to generate one
5. Click **Create & Buy Now**
6. Note the **public IP address** shown in your server dashboard

### 1B — Generate an SSH Key (Windows)

An SSH key is like a digital key that lets you log into your server securely without a password.

Open **Windows Terminal** or **PowerShell** and run:

```bash
ssh-keygen -t ed25519 -C "lush-local-openclaw"
```

Press Enter to accept all defaults. When asked for a passphrase, choose something memorable.

Your public key is now at `C:\Users\YourName\.ssh\id_ed25519.pub`. Open it in Notepad and copy the entire contents — paste this into Hetzner when prompted for your SSH key.

**Verify it worked:**
```
$ cat ~/.ssh/id_ed25519.pub
ssh-ed25519 AAAA...  lush-local-openclaw
```

### 1C — Connect to Your Server

From Windows Terminal or PowerShell:

```bash
ssh root@YOUR-HETZNER-IP
```

Replace `YOUR-HETZNER-IP` with the IP address from your Hetzner dashboard. Type `yes` when asked about the fingerprint.

**Verify it worked:**
```
root@ubuntu-cx21:~#    ← you are now inside your VPS
```

### 1D — Update and Create a Dedicated User

```bash
apt update && apt upgrade -y
```

If asked to reboot, type `reboot`, wait 30 seconds, then reconnect with `ssh root@YOUR-HETZNER-IP`.

Now create a dedicated non-root user for OpenClaw. Running as root is dangerous:

```bash
adduser openclaw
usermod -aG sudo openclaw
rsync --archive --chown=openclaw:openclaw ~/.ssh /home/openclaw
```

Switch to the new user — **all remaining commands run as this user**:

```bash
su - openclaw
```

**Verify it worked:**
```
openclaw@ubuntu-cx21:~$   ← you are now the openclaw user
```

### 1E — Install screen (Do This Before Anything Else)

`screen` keeps your session alive if your WiFi drops mid-install:

```bash
sudo apt install -y screen
screen -S openclaw
```

> ✅ **ACTION:** If your connection drops at any point, reconnect to your VPS with `ssh openclaw@YOUR-HETZNER-IP`, then run `screen -rd openclaw` to pick up exactly where you left off.

### 1F — Lock Down the Firewall

This is critical. Lock down incoming traffic to only what is needed:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw limit 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

**Verify it worked:**
```
$ sudo ufw status verbose
Status: active
To             Action   From
--             ------   ----
22/tcp         LIMIT    Anywhere
80/tcp         ALLOW    Anywhere
443/tcp        ALLOW    Anywhere
```

> ⚠️ **WARNING:** Never run `sudo ufw allow 18789`. That is the OpenClaw gateway port. It must never be directly open to the public internet.

---

## 02 | 📦 INSTALL OPENCLAW

### 2A — Install Node.js

OpenClaw requires Node.js 22 or higher. Install it from the official NodeSource repository:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version
```

**Verify it worked:**
```
$ node --version
v22.x.x   ← must show v22 or higher
```

> ⚠️ **WARNING:** Do not use `nvm` to install Node.js on a VPS with systemd. `nvm` installs Node into your home directory, and the systemd service that runs OpenClaw permanently will not be able to find it.

### 2B — Run the OpenClaw Installer

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

This takes 10–30 minutes. Grab a cup of tea. Do not close your terminal.

**Verify it worked:**
```
$ openclaw --version
openclaw v2026.x.x   ← any version 2026.1.29 or later
```

If you see `bash: openclaw: command not found`, run `source ~/.bashrc` and try again.

> ⚠️ **WARNING:** You need version **2026.1.29 or later**. Earlier versions had a critical security gap allowing unauthenticated gateway access. If you ever see a gateway auth error after an update, run `openclaw onboard` to reconfigure.

### 2C — Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag sets up systemd so OpenClaw restarts automatically if your server reboots.

**At each wizard prompt, choose:**

| Prompt | What to Choose |
|---|---|
| Security warning | Select **Yes** to continue |
| Onboarding mode | **QuickStart** — easiest path |
| Gateway mode | **Local gateway (this machine)** |
| Gateway bind mode | **Loopback** — this is critical, see warning below |
| AI provider | **Anthropic API key** — paste your key from console.anthropic.com |
| Model | Accept the default (Claude Sonnet) |
| Messaging channels | **WhatsApp** |
| Workspace directory | Accept the default (`/home/openclaw/clawd`) |
| Skills | **Skip for now** — you will install skills in Section 05 |

> ⚠️ **WARNING:** When the wizard asks about "gateway bind mode," choose **Loopback**. This binds the gateway to 127.0.0.1 (your server only). If you choose "LAN," the gateway becomes publicly accessible to anyone on the internet without authentication.

**Verify the gateway is bound correctly:**
```bash
openclaw gateway status
```

```
Gateway: running
Bound to: 127.0.0.1:18789   ← must show 127.0.0.1, NOT 0.0.0.0
Authentication: ✓ enabled
```

If it shows `0.0.0.0:18789`, run `openclaw configure` immediately and switch to loopback mode.

### 2D — Confirm systemd Is Running

```bash
sudo systemctl status openclaw
```

**Verify it worked:**
```
● openclaw.service — OpenClaw Gateway
   Active: active (running) since ...
```

To view live logs at any time:
```bash
journalctl -u openclaw -f
```

---

## 03 | 💬 CONNECT YOUR CHANNEL (WHATSAPP)

Amara, WhatsApp is exactly where your conversations already happen — with suppliers, your VA, and customers. Connecting OpenClaw to WhatsApp means your agent lives in the same app you already use every day.

> 💡 **TIP:** OpenClaw recommends using a dedicated WhatsApp number for your agent if possible (a separate SIM or WhatsApp Business account). This keeps your personal messages clearly separate. However, your existing WhatsApp Business number works fine and is how most small business owners set this up.

### 3A — Install the WhatsApp Plugin

```bash
openclaw plugins install @openclaw/whatsapp
```

**Verify it worked:**
```
$ openclaw plugins list
@openclaw/whatsapp   ✓ installed
```

### 3B — Link Your WhatsApp Account

```bash
openclaw channels login --channel whatsapp
```

A QR code will appear in your terminal. Open WhatsApp on your phone:
1. Tap the three dots menu (top right)
2. Tap **Linked Devices**
3. Tap **Link a Device**
4. Scan the QR code shown in your terminal

**Verify it worked:**
```bash
openclaw channels status
```

```
whatsapp   ✓ connected   account: your-business-number
```

### 3C — Lock Down WhatsApp Access

> ⚠️ **WARNING:** Without this step, anyone who knows your WhatsApp number could send commands to your agent. You must restrict access to only your number.

Edit your OpenClaw configuration:
```bash
nano ~/.openclaw/openclaw.json
```

Add this configuration (replace `+1XXXXXXXXXX` with your actual WhatsApp number in E.164 format):

```json5
{
  channels: {
    whatsapp: {
      dmPolicy: "allowlist",
      allowFrom: ["+1XXXXXXXXXX"],
      groupPolicy: "allowlist",
      groupAllowFrom: ["+1XXXXXXXXXX"],
    },
  },
}
```

Save and restart OpenClaw:
```bash
sudo systemctl restart openclaw
openclaw channels status
```

### 3D — Approve Your Number for Pairing

```bash
openclaw pairing list whatsapp
openclaw pairing approve whatsapp
```

**Test it:** Send a message to yourself via WhatsApp — try "Hello, are you there?" Your agent should respond.

> ✅ **ACTION:** See `reference_documents/whatsapp_setup.md` for detailed troubleshooting if your WhatsApp connection drops or needs relinking.

---

## 04 | 🤖 CONFIGURE YOUR MODEL PROVIDER (ANTHROPIC)

```bash
openclaw models status
```

**Verify it worked:**
```
Provider: anthropic   Status: ✓ active   Model: anthropic/claude-sonnet-4-6
```

If not configured or showing an error:
```bash
openclaw onboard --anthropic-api-key "YOUR_ANTHROPIC_API_KEY"
```

> 💡 **TIP:** Amara, go to console.anthropic.com now and set a monthly spending cap of $30. Typical usage for email drafting, daily summaries, and social media assistance runs $10–$25 per month. The cap is your safety net if something goes unexpectedly wrong.

> ✅ **ACTION:** In console.anthropic.com → Settings → Billing → set a **Usage Limit** of $30/month before continuing.

---

## 05 | 🔧 INSTALL SKILLS

> ⚠️ **WARNING:** Always install `skill-vetter` first and run it before installing anything else. Approximately 17–20% of community skills contain suspicious code. This is not optional.

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

And your runtime guardrails:
```bash
skill-vetter agentguard
clawhub install agentguard
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
prompt-guard   v1.x.x   ✓ active
agentguard     v1.x.x   ✓ active
```

> 💡 **TIP:** `prompt-guard` specifically protects you when your agent reads customer emails — malicious content in an email could otherwise try to hijack your agent's behavior. For a business that handles customer inquiries, this is essential.

### Phase 2: Core Business Skills for Lush & Local

| Your Need | Skill | What It Does |
|---|---|---|
| Gmail inbox triage & email drafts | `gog` | Full Google Workspace integration — Gmail, Calendar, Drive, Docs, and Sheets |
| Email inbox management & routing | `agent-mail` | Dedicated AI agent inbox with automatic triage, prioritization, and reply drafting |
| Instagram post scheduling & DMs | `instagram` | Post content, read DMs, and manage Instagram interactions via the Graph API |
| Consistent WhatsApp message formatting | `whatsapp-styling-guide` | Enforces professional formatting on all agent-sent WhatsApp messages |
| Canva design assistance | `canva` | Create and edit Canva designs via the Connect API — templates, brand assets, and exports |

**Install each skill — vet first, then install:**

```bash
skill-vetter gog
clawhub install gog

skill-vetter agent-mail
clawhub install agent-mail

skill-vetter instagram
clawhub install instagram

skill-vetter whatsapp-styling-guide
clawhub install whatsapp-styling-guide

skill-vetter canva
clawhub install canva
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter          v1.x.x   ✓ active
prompt-guard          v1.x.x   ✓ active
agentguard            v1.x.x   ✓ active
gog                   v1.x.x   ✓ active
agent-mail            v1.x.x   ✓ active
instagram             v1.x.x   ✓ active
whatsapp-styling-guide v1.x.x  ✓ active
canva                 v1.x.x   ✓ active
```

### Phase 3: Shopify Integration (Proceed with Caution)

> ⚠️ **WARNING:** The `shopify` skill is currently in "pending evaluation" in the ClawHub registry — it exists and is usable but has not yet received a full security trust-tier review. Vet it carefully before installing.

```bash
skill-vetter shopify
```

Read the vetter output carefully. If it passes with no red flags:
```bash
clawhub install shopify
```

If `skill-vetter` reports any suspicious behavior (undeclared network calls, obfuscated code, unexpected env variable access), skip this skill for now and manage Shopify manually.

---

## 06 | ⏰ CONFIGURE AUTOMATIONS

> 💡 **TIP:** Why this matters for you, Amara: these three automations replace the 2+ hours you currently spend on email and social media every morning. Your agent will do the reading and drafting — you just review and approve.

All automations below are **Autonomy Tier 2 (NOTIFY)** — your agent drafts or summarizes and notifies you via WhatsApp. Nothing is sent to customers automatically. You remain in full control.

### Automation 1 — Morning Business Briefing

**What it does:** Every morning at 8 AM, your agent checks your Gmail, surfaces new customer inquiries, flags urgent orders, and sends you a prioritized summary via WhatsApp. No action taken — just a clear picture of your day.

**Autonomy Tier: 🔔 NOTIFY** — Agent reads and summarizes. Takes no action.

```bash
openclaw cron add \
  --name "morning-briefing" \
  --cron "0 8 * * *" \
  --tz "America/New_York" \
  --session isolated \
  --message "Check Gmail for new customer inquiries, order confirmations, shipping questions, wholesale inquiries, and returns received since yesterday. Categorize them by urgency: URGENT (needs reply today), ROUTINE (can reply within 24h), FYI (no reply needed). Draft a WhatsApp-friendly morning summary for Amara. Do not send any emails. Do not take any actions. Only read and summarize." \
  --announce \
  --channel whatsapp \
  --to "YOUR_WHATSAPP_NUMBER"
```

Replace `YOUR_WHATSAPP_NUMBER` with your number in E.164 format (e.g., `+15551234567`). Replace `America/New_York` with your timezone.

**Verify it worked:**
```
$ openclaw cron list
ID   Name                 Schedule    Timezone           Status
1    morning-briefing     0 8 * * *   America/New_York   ✓ active
```

> 🛍️ **E-COMMERCE NOTE:** This automation is NOTIFY-tier — your agent summarizes incoming customer messages but never sends replies automatically. You approve every customer-facing response. This is the right starting point.

### Automation 2 — Email Draft Queue

**What it does:** At 10 AM each day, your agent drafts replies to the emails flagged in the morning briefing and sends the drafts to you on WhatsApp for review. You copy and send — or edit and send. Your agent does the writing, you do the approving.

**Autonomy Tier: 🔔 NOTIFY** — Agent drafts replies. You send them.

```bash
openclaw cron add \
  --name "email-draft-queue" \
  --cron "0 10 * * *" \
  --tz "America/New_York" \
  --session isolated \
  --message "Review the URGENT and ROUTINE emails from the morning briefing. Draft a professional, warm reply for each one in the voice of a small handmade skincare brand called Lush & Local. Replies should be friendly, brief, and helpful. Present each draft clearly labeled with the sender and subject. Do NOT send any emails — only draft them for Amara's review." \
  --announce \
  --channel whatsapp \
  --to "YOUR_WHATSAPP_NUMBER"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                 Schedule    Timezone           Status
1    morning-briefing     0 8 * * *   America/New_York   ✓ active
2    email-draft-queue    0 10 * * *  America/New_York   ✓ active
```

### Automation 3 — Weekly Inventory & Expense Summary

**What it does:** Every Monday at 9 AM, your agent reads your Google Sheets inventory and expense tracker and sends you a one-page summary: what's running low, what sold well last week, and where money went.

**Autonomy Tier: 🔔 NOTIFY** — Agent reads sheets and summarizes. Makes no changes.

```bash
openclaw cron add \
  --name "weekly-inventory-summary" \
  --cron "0 9 * * 1" \
  --tz "America/New_York" \
  --session isolated \
  --message "Read the inventory tracking spreadsheet and expense tracker in Google Sheets. Identify: (1) products with fewer than 10 units remaining, (2) top 3 selling products from last week if data is available, (3) total expenses logged this week by category. Format as a brief WhatsApp-friendly weekly summary for Amara. Do not modify any spreadsheet data." \
  --announce \
  --channel whatsapp \
  --to "YOUR_WHATSAPP_NUMBER"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                      Schedule     Timezone           Status
1    morning-briefing          0 8 * * *    America/New_York   ✓ active
2    email-draft-queue         0 10 * * *   America/New_York   ✓ active
3    weekly-inventory-summary  0 9 * * 1    America/New_York   ✓ active
```

---

## 07 | 🧠 INJECT YOUR SOUL

> ✅ **ACTION:** Open `prompts_to_send.md` (in the same folder as this guide) and paste each prompt into your OpenClaw chat via WhatsApp, **one at a time, in order**. Wait for the agent to acknowledge each before sending the next.

You can also open the web dashboard if you prefer:
```bash
openclaw dashboard
```

**Prompt sequence:**
1. **Identity Prompt** → Tells your agent who it is and what Lush & Local is
2. **Business Context Prompt** → Loads your product knowledge, customer tone, and supplier context
3. **Skills & Integrations Prompt** → Connects the agent to Gmail, Google Sheets, Instagram, and Canva
4. **Automations & Routines Prompt** → Locks in the supervised draft-and-approve workflow
5. **Guardrails & Safety Prompt** → Defines exactly what the agent must never do without your permission
6. **Security Audit Prompt** → Final check before going live

> 💡 **TIP:** After each prompt, wait for a clear acknowledgment like "Understood" or "I've noted that." Do not rush — each prompt builds on the last.

---

## 08 | 🔒 SECURITY HARDENING

> ⚠️ **WARNING:** Amara, do not skip this section. Your Shopify store, Gmail inbox, and Google Sheets contain sensitive business data — customer information, order history, financial records. Securing them properly takes 10 minutes and prevents significant harm.

### VPS-Specific Hardening

Disable root SSH login (you are now using the `openclaw` user exclusively):

```bash
sudo nano /etc/ssh/sshd_config
```

Find `PermitRootLogin yes` and change it to `PermitRootLogin no`. Save and exit.

```bash
sudo systemctl restart sshd
```

**Verify it worked:**
```
$ grep PermitRootLogin /etc/ssh/sshd_config
PermitRootLogin no
```

Install automatic security updates:
```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

Verify no API keys are stored in plain text:
```bash
grep -r "sk-ant" ~/.openclaw/ 2>/dev/null | grep -v ".enc"
```

This should return nothing. If it returns any lines, those contain exposed API keys that need to be moved to encrypted storage immediately.

### E-Commerce Compliance Checklist

- [ ] Anthropic API key spending limit set to $30/month in console.anthropic.com
- [ ] WhatsApp channel access restricted to your number only (Step 3C complete)
- [ ] Gateway bound to loopback `127.0.0.1:18789` (not `0.0.0.0`)
- [ ] No API keys in plain text in `~/.openclaw/`
- [ ] Root SSH login disabled
- [ ] UFW firewall active with only ports 22, 80, 443 open
- [ ] Agent only drafts customer replies — never auto-sends
- [ ] Google OAuth scoped to only the permissions the `gog` skill needs
- [ ] OpenClaw conversation logs retained (your audit trail for customer interactions)
- [ ] API keys rotated every 90 days (calendar reminder set)

> 🛍️ **E-COMMERCE NOTE:** Customer data (names, addresses, order details) processed through your agent should never be stored in plain text logs. Review your OpenClaw log settings after going live and ensure sensitive order data is not being logged verbatim.

---

## 09 | 🔍 SECURITY AUDIT CHECKLIST

> ✅ **ACTION:** Run this full audit before using OpenClaw for real customer communications.

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
- [ ] `openclaw security audit --deep` completes with 0 critical warnings
- [ ] Gateway shows "running" with token authentication active: `openclaw gateway status`
- [ ] `openclaw cron list` shows exactly 3 jobs — no unexpected entries
- [ ] `openclaw skills list` matches exactly what you installed in Section 05
- [ ] WhatsApp only responds to your approved number (test by asking a friend to message the bot)
- [ ] No API keys in plain text: `grep -r "sk-ant" ~/.openclaw/`
- [ ] UFW firewall active and port 18789 is NOT open: `sudo ufw status verbose`
- [ ] Review skill permissions: `openclaw skills list --verbose`

**Do NOT begin live customer communications until all checks pass.**

---

## 10 | 🛠️ TROUBLESHOOTING & NEXT STEPS

### Common Issues

**"command not found: openclaw" after installing**
```bash
source ~/.bashrc
```

**Gateway not running / won't start**
```bash
openclaw doctor
journalctl -u openclaw -n 50
sudo systemctl restart openclaw
```

**WhatsApp not responding**
- Check connection: `openclaw channels status`
- Check logs: `openclaw logs --follow`
- If WhatsApp shows "not linked": `openclaw channels login --channel whatsapp` and scan the QR code again
- Verify your number is in the allowlist (Step 3C)

**Cron jobs not firing**
- Verify gateway is running: `openclaw gateway status`
- Check job list: `openclaw cron list`
- Test a job manually: `openclaw cron run <job-id>`
- Check timezone is correct: compare your local time to UTC

**502 Bad Gateway from Nginx (if you added a domain)**
- Check OpenClaw gateway: `openclaw gateway status`
- Check Nginx: `sudo systemctl status nginx`
- View OpenClaw logs: `journalctl -u openclaw -n 50`

**WhatsApp session keeps disconnecting**
```bash
openclaw doctor
openclaw logs --follow
openclaw channels login --channel whatsapp
```

**Keeping OpenClaw Updated**
```bash
npm update -g openclaw
sudo systemctl restart openclaw
openclaw --version
```

> ⚠️ **WARNING:** Always check the OpenClaw CHANGELOG before updating. Breaking changes are rare but do happen. If you have critical automations running, test in a staging environment first.

### Next Steps After 2 Weeks of Stable Operation

Once you have run the system reliably for two weeks, Amara, consider:

1. **Increase email autonomy to Tier 3 (DRAFT+SEND) for routine inquiries** — shipping tracking questions and order confirmations are low-risk and follow predictable patterns. When you trust the drafts, you can let them send automatically for those categories.
2. **Add a Mailchimp newsletter skill** — once your inbox time is back, you will have the headspace to actually write that newsletter you mentioned. Your agent can draft it from your product notes and send it for your review.
3. **Context hygiene** — after week 5, consider separate WhatsApp sessions for customer service versus supplier communications to prevent context pollution between conversations.

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web Dashboard** | `openclaw dashboard` (opens browser with auth token) |
| **Gateway Port** | 18789 (loopback only — never expose publicly) |
| **Model Provider** | Anthropic (`anthropic/claude-sonnet-4-6`) |
| **Channel** | WhatsApp |
| **Cron Timezone** | `America/New_York` (change to your actual timezone) |
| **OpenClaw Docs** | https://docs.openclaw.ai |
| **Security Audit** | `openclaw security audit --deep` |
| **Live Logs** | `openclaw logs --follow` |
| **Gateway Status** | `openclaw gateway status` |
| **Cron Jobs** | `openclaw cron list` |
| **Installed Skills** | `openclaw skills list` |
| **Restart Service** | `sudo systemctl restart openclaw` |
| **Hetzner Console** | hetzner.com/cloud |
| **Anthropic Console** | console.anthropic.com |
| **Reference Docs** | `reference_documents/whatsapp_setup.md` |

---

**OPENCLAW | Your Agent. Your Hardware. Your Soul.**
