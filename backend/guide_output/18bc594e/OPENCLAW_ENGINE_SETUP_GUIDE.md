# OPENCLAW ENGINE SETUP GUIDE
**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Dr. Lisa Park — Park Family Dentistry |
| **MISSION** | Cut no-show rate from 18% to under 8% with automated WhatsApp patient communication |
| **DATE** | 2026-03-26 |
| **DEPLOYMENT** | Mac Mini (always-on, server closet) |
| **CHANNEL** | WhatsApp |
| **MODEL** | Anthropic Claude (claude-opus-4-6) |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

**This guide configures your OpenClaw agent to eliminate the no-show crisis at Park Family Dentistry — built around your dental practice workflow, your existing Google Calendar and Gmail stack, and the WhatsApp channel your patients already use every day.**

---

## Key Moments — What You Will Accomplish

By the end of this guide, you will have:

- **A running OpenClaw instance** on your Mac Mini, connected to WhatsApp and sending automated patient reminders around the clock — no front-desk manual outreach required
- **5 dental automations** that handle appointment reminders (48hr + 2hr), post-no-show reschedule offers, post-procedure check-ins, and recall campaigns — targeting your goal of sub-8% no-shows
- **HIPAA-grade guardrails** ensuring your agent never transmits PHI without encryption, never acts autonomously on patient data, and maintains a full audit trail for compliance purposes

---

## 00 | ✅ PRE-FLIGHT CHECKLIST

> ✅ **ACTION:** Complete every item below **before** running a single command. Missing prerequisites cause backtracking — and in a busy dental practice, that's lost chair time.

### Accounts to Create
- [ ] **Anthropic account** — Create at [console.anthropic.com](https://console.anthropic.com). You need an API key. Set a monthly spending limit of **$30–$50** to start.
- [ ] **WhatsApp Business number** — OpenClaw recommends a **dedicated phone number** for your practice agent, separate from any staff personal numbers. A $10–$15/month SIM works fine.
- [ ] **Google Account (dedicated)** — Create a separate Google account for OpenClaw (e.g. `parkdentistry.agent@gmail.com`). Share only your practice calendar and the Gmail folder you want the agent to read — do not link your personal Google account.

### API Keys to Obtain
- [ ] **Anthropic API Key** — In the Anthropic Console: API Keys → Create Key. Copy and save it in your password manager immediately.
- [ ] **Google OAuth credentials** — Needed for the `gog` skill (Google Calendar + Gmail integration). Set up in Step 5.

### Hardware
- [ ] Mac Mini is powered on and connected to your office network
- [ ] You have physical or remote (SSH) access to it
- [ ] A monitor, keyboard, and mouse connected for initial setup (or SSH from another Mac)
- [ ] Terminal access confirmed (Cmd+Space → "Terminal")

> ⚠️ **WARNING (HIPAA):** Dr. Park, the Mac Mini that runs OpenClaw will hold patient appointment data in memory and logs. Before you proceed to Step 1, you must enable FileVault disk encryption. This is a HIPAA technical safeguard requirement. Instructions are in Section 01, Step 1A. Do not skip it.

> 💡 **TIP:** Gather your Anthropic API key and Google credentials in a password manager (1Password, Bitwarden) before starting. This prevents interruption mid-setup when a prompt asks for them.

---

## 01 | 🖥️ PLATFORM SETUP

Dr. Park, these steps prepare your Mac Mini to run OpenClaw reliably as a 24/7 practice automation server.

> ⚠️ **WARNING:** Your dental practice is a HIPAA Covered Entity. Any computer that processes, stores, or transmits Protected Health Information (PHI) — including appointment names, dates, and phone numbers — must have full-disk encryption enabled. This is not optional. The next step covers this first.

### 1A — Enable FileVault (HIPAA Mandatory)

On the Mac Mini, go to: **Apple menu → System Settings → Privacy & Security → FileVault**

Click **"Turn On FileVault..."** and follow the prompts. Save the recovery key in a secure location (not in the same building as the Mac Mini).

> ⚕️ **HIPAA Note:** FileVault encryption satisfies the HIPAA Security Rule technical safeguard requirement under 45 CFR §164.312(a)(2)(iv) — Encryption and Decryption. Without it, a physically stolen Mac Mini exposes patient data. Encryption takes approximately 30 minutes on first enable.

**Verify it worked:**
Go to **System Settings → Privacy & Security → FileVault** — it should show **"FileVault is turned on"** with a lock icon.

### 1B — Install macOS Updates

Go to **Apple menu → System Settings → General → Software Update** and install all available updates. Restart if prompted.

### 1C — Configure Always-On Settings

> 💡 **TIP:** Why this matters for you: a Mac Mini that sleeps will miss your scheduled appointment reminder cron jobs. A patient due for a reminder at 8 AM Monday will receive nothing if the machine slept at midnight Sunday. Configure this correctly once and it runs forever.

1. Go to **System Settings → Energy**
2. Enable **"Prevent automatic sleeping when the display is off"**
3. Enable **"Wake for network access"**
4. Enable **"Start up automatically after a power failure"**
5. Go to **System Settings → Users & Groups → Login Options** → enable **"Automatic login"** for the agent user (see 1D below)

Then install **Amphetamine** from the Mac App Store as a belt-and-suspenders solution:
- Launch Amphetamine (pill icon in menu bar)
- Go to Preferences → enable **"Launch Amphetamine at login"**
- Set duration to **Indefinitely**
- Enable **"Start session after waking from sleep"**

### 1D — Create a Dedicated User Account

> ⚠️ **WARNING:** Never run OpenClaw under your personal macOS account. A dedicated account isolates the agent's permissions from your personal files, iCloud, and keychain.

1. Go to **System Settings → Users & Groups → Add User**
2. Create a standard account named **"openclaw"** (or "dentistaagent")
3. Log in as this new user before proceeding to the install steps
4. Enable Remote Login (SSH) for remote access: **System Settings → General → Sharing → Remote Login** — turn on

### 1E — Install an HDMI Dummy Plug

Since your Mac Mini runs headless in the server closet, plug in an **HDMI dummy plug** ($8–10 on Amazon). Without it, macOS behaves erratically in headless mode — screen capture and GUI permissions can silently fail.

**Verify it worked:**
Open **System Settings → Displays** — it should show a virtual display connected.

### 1F — Configure Tailscale for Secure Remote Access

Install Tailscale from [tailscale.com](https://tailscale.com) — it's free for personal use. This lets you access your Mac Mini from anywhere without opening firewall ports.

```bash
brew install tailscale
```

**Verify it worked:**
```
$ tailscale status
your-macmini   ← should appear in your tailnet
```

---

## 02 | 📦 INSTALL OPENCLAW

### 2A — Install Xcode Command Line Tools

Open **Terminal** on the Mac Mini (logged in as the openclaw user) and run:

```bash
xcode-select --install
```

A dialog will appear — click **Install** and wait. This gives you the compilers Homebrew needs.

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
v22.16.0   ← must be v22.16 or higher
```

If the version is older, run `brew upgrade node`.

### 2D — Run the OpenClaw Installer

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Wait until you see **"Installation finished successfully!"**

**Verify it worked:**
```
$ openclaw --version
openclaw v2026.1.29   ← must be 2026.1.29 or later
```

> ⚠️ **WARNING:** You need version **2026.1.29 or later**. Earlier versions allowed unauthenticated gateway access — a serious HIPAA risk. If you get a gateway auth error after updating, run `openclaw onboard` to reconfigure.

### 2E — Run the Onboarding Wizard

```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag is critical — it sets up a launchd service so OpenClaw starts automatically on every boot and runs 24/7 without manual intervention.

**At each wizard prompt, choose:**

| Prompt | Your Choice |
|---|---|
| Gateway mode | **Local** |
| AI provider | **Anthropic API key** — paste `YOUR_ANTHROPIC_API_KEY` |
| Model | **`anthropic/claude-opus-4-6`** (warmest, most personable for patient-facing communication) |
| Messaging channels | **WhatsApp** — you'll complete setup in Section 03 |
| Hooks | Enable **session memory**, **boot hook**, and **command logger** |
| Skills | **Skip for now** — install deliberately in Section 05 |

![Security Handshake](templates/images/image12.png)

> ✅ **ACTION:** When the wizard shows the security acknowledgment, select **"Yes"** to confirm you are the sole operator.

### 2F — Grant macOS Permissions

Go to **System Settings → Privacy & Security** and grant the OpenClaw process:

1. **Full Disk Access** — required to read/write files
2. **Accessibility Access** — required to control apps

**Verify everything is running:**
```bash
openclaw gateway status
openclaw doctor
openclaw health
```

If health shows "no auth configured", re-run `openclaw onboard`.

To open the dashboard:
```bash
openclaw dashboard
```

This opens `http://127.0.0.1:18789/` with a tokenized URL. **Bookmark it.** Do not type the URL manually — you will get a "gateway token missing" error.

---

## 03 | 💬 CONNECT YOUR CHANNEL (WHATSAPP)

Dr. Park, this connects your agent to WhatsApp so it can send and receive patient appointment messages.

> ⚕️ **HIPAA Note:** OpenClaw recommends using a **dedicated WhatsApp number** for your practice agent — not a staff member's personal number. This maintains a clear boundary between patient communications and personal data, and ensures message logs are attributed to the practice, not an individual employee.

> ⚠️ **WARNING:** WhatsApp Business operates via WhatsApp Web (Baileys protocol). This means your dedicated number must be linked like you would link WhatsApp Web. Use a SIM-only number you control — not linked to any personal account.

### 3A — Install the WhatsApp Plugin

```bash
openclaw plugins install @openclaw/whatsapp
```

**Verify it worked:**
```
$ openclaw channels status
whatsapp   ← listed (may show "not linked" until Step 3B)
```

### 3B — Link Your WhatsApp Number

Have your dedicated WhatsApp phone ready:

```bash
openclaw channels login --channel whatsapp --account practice
```

This will display a **QR code** in your terminal. On your dedicated WhatsApp phone:
1. Open WhatsApp → Settings → Linked Devices → Link a Device
2. Scan the QR code

**Verify it worked:**
```
$ openclaw channels status
whatsapp (practice)   ✓ connected
```

### 3C — Lock Down Access (Critical)

Add this to your OpenClaw configuration (`~/.openclaw/openclaw.json`). This restricts WhatsApp access so only your authorized number can command the agent:

```json5
{
  channels: {
    whatsapp: {
      accounts: {
        practice: {
          dmPolicy: "allowlist",
          allowFrom: ["+1YOUR_ADMIN_PHONE_NUMBER"],
        },
      },
    },
  },
}
```

Replace `+1YOUR_ADMIN_PHONE_NUMBER` with your personal number in E.164 format (e.g. `+14155551234`).

For patient-facing outbound messages (cron-driven reminders), the agent sends **to** patient numbers — patients do not command the agent directly.

> ✅ **ACTION:** Restart the gateway after config changes: `openclaw gateway stop && openclaw gateway start`

**Verify it worked:**
```
$ openclaw pairing list whatsapp
No pending pairings   ← correct; access is locked to your allowlist
```

![Channel Selection](templates/images/image3.png)

---

## 04 | 🧠 CONFIGURE YOUR MODEL PROVIDER (ANTHROPIC)

```bash
openclaw models status
```

**Verify it worked:**
```
Provider: anthropic   Status: ✓ active   Model: anthropic/claude-opus-4-6
```

If not configured:
```bash
openclaw onboard --anthropic-api-key "YOUR_ANTHROPIC_API_KEY"
```

> 💡 **TIP:** Dr. Park, set a monthly spending cap in your Anthropic Console. For a practice sending appointment reminders to 1,200 patients at 40 appointments/day, expect **$15–$35/month** in API costs. This is dramatically less than dedicated software like Weave or RevenueWell at $300–$500/month.

Go to [console.anthropic.com](https://console.anthropic.com) → Billing → Set Usage Limit → **$50/month** to start.

![Model Provider Selection](templates/images/image11.png)

---

## 05 | 🔧 INSTALL SKILLS

> ⚠️ **WARNING:** Always install `skill-vetter` first and use it to screen every subsequent skill before installation. Approximately 17–20% of community skills contain suspicious code. For a HIPAA-regulated practice, an unvetted skill with hidden network calls could constitute a data breach.

> 💡 **TIP:** The skill-vetter was downloaded 86,800 times for a reason. It checks for undeclared environment variable access, hidden network calls, and obfuscated shell commands. Run it on every skill, every time — no exceptions.

### Phase 1: Security Stack (Install First — No Exceptions)

**Install skill-vetter:**
```bash
clawhub install skill-vetter
```

**Verify it worked:**
```
$ openclaw skills list
skill-vetter   v1.x.x   ✓ active
```

**Vet and install prompt-guard:**
```bash
skill-vetter prompt-guard
clawhub install prompt-guard
```

`prompt-guard` defends against prompt injection — malicious content embedded in emails, web pages, or external documents trying to hijack your agent. Since your agent will read patient-facing content, this is mandatory.

**Vet and install config-guardian:**
```bash
skill-vetter config-guardian
clawhub install config-guardian
```

`config-guardian` validates configuration changes before they take effect, blocking silent modifications to sensitive settings. Essential for a production dental practice setup.

### Phase 2: Core Dental Practice Skills

| Your Need | Skill | What It Does |
|---|---|---|
| Google Calendar + Gmail integration | `gog` | Read appointment schedules, check Gmail, draft email follow-ups |
| WhatsApp message formatting | `whatsapp-styling-guide` | Ensures patient-facing WhatsApp messages are professionally formatted |
| Transactional email backup | `mailchannels` | Reliable email delivery for patients who prefer email over WhatsApp |

**Install gog (Google Workspace):**
```bash
skill-vetter gog
clawhub install gog
```

During setup, authorize with your **dedicated Google account** (the `parkdentistry.agent@gmail.com` you created in the pre-flight checklist). Do not use your personal Google account.

**Install whatsapp-styling-guide:**
```bash
skill-vetter whatsapp-styling-guide
clawhub install whatsapp-styling-guide
```

**Install mailchannels (optional — for email reminders as backup):**
```bash
skill-vetter mailchannels
clawhub install mailchannels
```

**Verify all skills are active:**
```
$ openclaw skills list
skill-vetter           v1.x.x   ✓ active
prompt-guard           v1.x.x   ✓ active
config-guardian        v1.x.x   ✓ active
gog                    v1.x.x   ✓ active
whatsapp-styling-guide v1.x.x   ✓ active
mailchannels           v1.x.x   ✓ active
```

---

## 06 | ⏰ CONFIGURE AUTOMATIONS

> 💡 **TIP:** Why this matters: these automations are the core of your revenue-recovery strategy. Your front desk currently cannot manually call all patients before each appointment. These cron jobs run silently 24/7 — they do not require staff action. Every automation below is **Tier 3: SUGGEST** or lower for patient communications, and **never Tier 4** for sending. The agent prepares the message; a cron job delivers it on schedule.

**All cron jobs use your local timezone. Replace `YOUR_TZ` with your timezone** (e.g., `America/Los_Angeles`, `America/New_York`, `America/Chicago`).

**Replace `YOUR_WHATSAPP_PHONE` with your personal WhatsApp number in E.164 format** (e.g., `+14155551234`) — this is where the agent sends its operational summaries to you.

---

### Automation 1 — 48-Hour Appointment Reminder Check

**What it does:** Every morning at 7 AM, the agent checks Google Calendar for appointments scheduled 48 hours from now and compiles a list of patients due for reminders. The agent sends you (Dr. Park) a summary on WhatsApp for review before any patient messages go out.

**Autonomy Tier: SUGGEST** — Agent prepares reminder drafts. You review and approve before sending.

```bash
openclaw cron add \
  --name "48hr Reminder Check" \
  --cron "0 7 * * *" \
  --tz "YOUR_TZ" \
  --session isolated \
  --message "Check Google Calendar for all appointments scheduled 48 hours from now. For each appointment, draft a warm WhatsApp reminder message addressed to the patient by first name, including: the appointment date and time, the dentist's name, the practice address (Park Family Dentistry), and an offer to confirm or reschedule. Format as a bulleted list of patient name + draft message. Do not send any messages — compile the list for Dr. Park's review." \
  --announce \
  --channel whatsapp \
  --to "YOUR_WHATSAPP_PHONE"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                    Schedule    Timezone    Status
1    48hr Reminder Check     0 7 * * *   YOUR_TZ     ✓ active
```

> ⚕️ **HIPAA Note:** This automation is Tier 3 SUGGEST — the agent compiles patient appointment data and draft messages, but takes no action until you review. Patient names and appointment times are processed in memory on your Mac Mini and are never transmitted to third parties.

---

### Automation 2 — 2-Hour Same-Day Reminder

**What it does:** Every hour during business hours (8 AM–4 PM), checks for appointments starting in the next 2–3 hours and sends a reminder message directly.

**Autonomy Tier: SUGGEST** — For this automation, you can optionally upgrade to Tier 4 (EXECUTE) after 2 weeks of reviewing outputs and confirming message quality. Start with SUGGEST.

```bash
openclaw cron add \
  --name "2hr Same-Day Reminder" \
  --cron "0 8-16 * * 1-5" \
  --tz "YOUR_TZ" \
  --session isolated \
  --message "Check Google Calendar for appointments starting in the next 2 to 3 hours at Park Family Dentistry. For each appointment not already confirmed today, draft a warm and brief WhatsApp reminder: 'Hi [FirstName]! Just a quick reminder that you have an appointment at Park Family Dentistry today at [TIME]. We look forward to seeing you! If you need to reschedule, reply to this message.' List each draft for review. Do not send — compile for Dr. Park." \
  --announce \
  --channel whatsapp \
  --to "YOUR_WHATSAPP_PHONE"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                    Schedule         Timezone    Status
1    48hr Reminder Check     0 7 * * *        YOUR_TZ     ✓ active
2    2hr Same-Day Reminder   0 8-16 * * 1-5   YOUR_TZ     ✓ active
```

---

### Automation 3 — Post-No-Show Reschedule Offer

**What it does:** Every afternoon at 5 PM on weekdays, reviews the day's appointments for any that were missed (no-shows) and drafts a warm, caring re-engagement message offering to reschedule.

**Autonomy Tier: SUGGEST** — Drafts are sent to you for review. No patient is contacted without your approval.

```bash
openclaw cron add \
  --name "Post-No-Show Reschedule Drafts" \
  --cron "0 17 * * 1-5" \
  --tz "YOUR_TZ" \
  --session isolated \
  --message "Review today's Google Calendar for Park Family Dentistry. Identify any appointments where the patient did not attend (status shows as not completed or cancelled after the appointment start time). For each no-show, draft a compassionate WhatsApp message: 'Hi [FirstName], we noticed you weren't able to make your appointment today. We understand that life gets busy! We'd love to find a time that works better for you. Reply to this message and we'll get you rescheduled right away.' Compile as a list with patient name and draft message. Do not send — compile for Dr. Park's review." \
  --announce \
  --channel whatsapp \
  --to "YOUR_WHATSAPP_PHONE"
```

**Verify it worked:**
```
$ openclaw cron list
ID   Name                          Schedule        Timezone    Status
...
3    Post-No-Show Reschedule       0 17 * * 1-5    YOUR_TZ     ✓ active
```

---

### Automation 4 — 24-Hour Post-Procedure Check-In

**What it does:** Every morning at 9 AM, checks yesterday's appointments for major procedures (root canals, extractions, surgeries) and drafts warm check-in messages to send to those patients.

**Autonomy Tier: SUGGEST** — Warm and caring tone, drafted for review.

```bash
openclaw cron add \
  --name "Post-Procedure Check-In Drafts" \
  --cron "0 9 * * *" \
  --tz "YOUR_TZ" \
  --session isolated \
  --message "Review yesterday's Google Calendar for Park Family Dentistry appointments involving major procedures such as root canals, extractions, oral surgery, or deep cleaning. For each patient who had such a procedure, draft a warm, caring 24-hour check-in WhatsApp message from Dr. Park's practice: 'Hi [FirstName], this is the team at Park Family Dentistry checking in on you after your [procedure] yesterday. We hope you're recovering comfortably! If you have any questions, discomfort, or concerns, please don't hesitate to reply here or call us at [PRACTICE_PHONE]. We're here for you.' List each draft. Do not send — compile for review." \
  --announce \
  --channel whatsapp \
  --to "YOUR_WHATSAPP_PHONE"
```

> ⚕️ **HIPAA Note:** Procedure type information referenced in this automation (root canal, extraction) is clinical PHI. This automation operates entirely on your Mac Mini — no procedure data is transmitted to external services. The agent reads from your connected Google Calendar only. Ensure your Google Calendar entries use appointment type labels consistently for the agent to detect them.

**Verify it worked:**
```
$ openclaw cron list
ID   Name                          Schedule       Timezone    Status
...
4    Post-Procedure Check-In       0 9 * * *      YOUR_TZ     ✓ active
```

---

### Automation 5 — Weekly No-Show Rate Report

**What it does:** Every Monday morning at 8 AM, compiles a weekly summary of appointment attendance, no-show count, and reminder coverage — sent directly to you as a management dashboard.

**Autonomy Tier: READ-ONLY** — Pure reporting, no patient contact.

```bash
openclaw cron add \
  --name "Weekly No-Show Report" \
  --cron "0 8 * * 1" \
  --tz "YOUR_TZ" \
  --session isolated \
  --message "Review the past 7 days of Google Calendar for Park Family Dentistry. Count: total appointments scheduled, total appointments completed, total no-shows or cancellations. Calculate the no-show rate as a percentage. Write a brief weekly summary for Dr. Park including: total appointments, no-shows, current no-show rate percentage, and a note on whether the rate is trending toward the target of under 8%. Format clearly for a WhatsApp message." \
  --announce \
  --channel whatsapp \
  --to "YOUR_WHATSAPP_PHONE"
```

**Verify all 5 automations are active:**
```
$ openclaw cron list
ID   Name                          Schedule         Timezone    Status
1    48hr Reminder Check           0 7 * * *        YOUR_TZ     ✓ active
2    2hr Same-Day Reminder         0 8-16 * * 1-5   YOUR_TZ     ✓ active
3    Post-No-Show Reschedule       0 17 * * 1-5     YOUR_TZ     ✓ active
4    Post-Procedure Check-In       0 9 * * *        YOUR_TZ     ✓ active
5    Weekly No-Show Report         0 8 * * 1        YOUR_TZ     ✓ active
```

> 💡 **TIP:** Test each cron job manually before relying on it for patient care: `openclaw cron run <job-id>`. Review the output in your WhatsApp to confirm the message tone and content match your expectations before patients receive anything.

---

## 07 | 💉 INJECT YOUR SOUL

> ✅ **ACTION:** Open `prompts_to_send.md` (in the same folder as this guide) and paste each prompt into the OpenClaw chat interface **one at a time, in order**. Wait for the agent to acknowledge each prompt before sending the next.

```bash
openclaw dashboard
```

**Prompt sequence (all prompts are in `prompts_to_send.md`):**
1. **Identity Prompt** — establishes who the agent is (Park Family Dentistry practice assistant)
2. **Business Context Prompt** — your practice size, patient demographics, and tools
3. **Skills & Workflow Prompt** — how to use Google Calendar, Gmail, and WhatsApp skills
4. **Guardrails & HIPAA Safety Prompt** — forbidden actions, escalation triggers, PHI handling rules
5. **Personality & Communication Style Prompt** — warm, caring, professional dental practice tone
6. **Dental Workflow Prompt** — appointment reminder rules, post-procedure protocol, no-show handling
7. **Security Audit Prompt** — final verification before going live (always last)

![OpenClaw Web UI](templates/images/image6.png)

> 💡 **TIP:** Dr. Park, after pasting the Identity Prompt, ask the agent "Who are you and what is your primary mission?" — the response should reflect Park Family Dentistry and no-show reduction. If it doesn't, re-send the Identity Prompt.

---

## 08 | 🔒 SECURITY HARDENING

> ⚠️ **WARNING:** Dr. Park, do not skip this section. Your dental practice is a HIPAA Covered Entity. OpenClaw processes patient names and appointment times — this qualifies as PHI under HIPAA. Security hardening is a regulatory requirement, not a preference.

### Mac Mini-Specific Hardening

**Enable macOS Firewall:**
Go to **System Settings → Network → Firewall** → turn it on.

**Verify gateway is bound to loopback only:**
Open `~/.openclaw/openclaw.json` and confirm:
```json5
{
  gateway: {
    bind: "127.0.0.1",
  },
}
```

This means the gateway only accepts connections from your own machine — external connections are blocked.

**Run the security audit:**
```bash
openclaw security audit --deep
openclaw security audit --fix
```

**Verify it worked:**
```
Security Audit Complete
Critical warnings: 0
```

**Set API spending limit:** Go to [console.anthropic.com](https://console.anthropic.com) → Billing → Usage Limits → **$50/month**

### HIPAA Compliance Checklist

- [ ] FileVault disk encryption is ON (verified in Step 1A)
- [ ] A dedicated macOS user account runs OpenClaw (not your personal account)
- [ ] The dedicated Google account is authorized — not your personal Google account
- [ ] WhatsApp uses a dedicated practice number, not a staff personal number
- [ ] Gateway bound to loopback (`gateway.bind: "127.0.0.1"`)
- [ ] Token authentication active (not "none" mode)
- [ ] macOS Firewall enabled
- [ ] API spending limit set to $50/month in Anthropic Console
- [ ] Tailscale installed for secure remote access (no open ports)
- [ ] OpenClaw conversation logs retained for audit trail (`~/.openclaw/sessions/`)
- [ ] Anthropic API key stored only in OpenClaw config — never in plain text files, emails, or documents
- [ ] All 5 cron automations are Tier 3 SUGGEST or lower — no autonomous patient outreach
- [ ] All skill-vetter scans passed before installation
- [ ] Review skill permissions annually: `openclaw skills list --verbose`

> ⚕️ **HIPAA Note:** OpenClaw's session transcripts at `~/.openclaw/sessions/` constitute part of your audit trail. Retain these logs for a minimum of 6 years per HIPAA requirements. Consider backing them up to an encrypted external drive monthly.

---

## 09 | 🛡️ SECURITY AUDIT CHECKLIST

> ✅ **ACTION:** Run this audit before using OpenClaw for any real patient operations.

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

**Manual verification checklist:**
- [ ] `openclaw security audit --deep` completes with **zero critical warnings**
- [ ] `openclaw gateway status` shows "running" with **token authentication active**
- [ ] `openclaw cron list` shows exactly **5 jobs** — no unexpected entries
- [ ] `openclaw skills list` shows exactly: `skill-vetter`, `prompt-guard`, `config-guardian`, `gog`, `whatsapp-styling-guide`, `mailchannels` — nothing else
- [ ] WhatsApp channel responds **only** to your authorized number
- [ ] No API keys stored in plain text — check `~/.openclaw/` with `grep -r "sk-ant" ~/.openclaw/` (should return nothing)
- [ ] FileVault is confirmed ON: **System Settings → Privacy & Security → FileVault**
- [ ] Review skill permissions: `openclaw skills list --verbose`
- [ ] Test one cron job manually: `openclaw cron run 1` and confirm output in WhatsApp

> ⚠️ **WARNING:** Do NOT begin live patient operations until all checks above pass. A misconfigured agent sending incorrect reminder messages to patients creates clinical and regulatory liability.

---

## 10 | 🔧 TROUBLESHOOTING & NEXT STEPS

### Common Issues

**"command not found: openclaw" after installing**
```bash
source ~/.zshrc
```
Then open a new Terminal window.

**Gateway not responding**
```bash
openclaw doctor
openclaw gateway stop && openclaw gateway start
```

**WhatsApp bot not responding**
- Verify connection: `openclaw channels status`
- Check logs: `openclaw logs --follow`
- Confirm allowlist in config: `cat ~/.openclaw/openclaw.json | grep allowFrom`
- If disconnected, re-link: `openclaw channels login --channel whatsapp --account practice`

**Cron jobs not firing**
- Verify gateway is running: `openclaw gateway status`
- Check schedule: `openclaw cron list`
- Test manually: `openclaw cron run <job-id>`
- Check cron is enabled: confirm `cron.enabled` is not set to `false` in your config

**WhatsApp keeps disconnecting**
- WhatsApp Web sessions can expire. Re-link with: `openclaw channels login --channel whatsapp --account practice`
- Ensure you are using **Node** (not Bun) as your runtime — WhatsApp/Baileys requires Node for stable operation

**High API costs**
- Check which sessions are consuming the most: `openclaw logs --follow`
- For cron summary jobs, you can add `--model "anthropic/claude-sonnet-4-6"` to use a cheaper model for routine reporting tasks

**Gateway dies after config-change restart**
```bash
openclaw doctor
```
`doctor` often catches and fixes this automatically.

### Next Steps After Stable Setup

Once you've run the system for 1–2 weeks, Dr. Park, consider:

1. **Upgrade Automation 2 to Tier 4** — After reviewing 2hr reminder drafts for 2 weeks and confirming message quality and tone, you can instruct the agent to send them automatically. Add this to the cron message: "Send the WhatsApp message directly to each patient number from the calendar."
2. **Add recall campaign automation** — For patients 6+ months overdue for hygiene/checkup, a dedicated recall sequence (text at 6 months, email at 6.5 months) can recover lapsed patients and fill the hygienists' schedule
3. **Post-visit review requests** — A cron job 2 hours after each completed appointment can send a Google Business Profile review request, building your practice's online reputation
4. **Context hygiene** — After week 5, consider separate OpenClaw channels per major workflow (one for reminders, one for clinical follow-ups) to prevent context pollution as conversation history grows

---

## QUICK REFERENCE

| Item | Details |
|---|---|
| **Web UI** | `openclaw dashboard` (tokenized — do not type URL manually) |
| **Gateway Port** | 18789 (loopback only) |
| **Model** | `anthropic/claude-opus-4-6` |
| **Channel** | WhatsApp (practice account) |
| **Cron Timezone** | Set to your local timezone during cron add |
| **OpenClaw Docs** | https://docs.openclaw.ai |
| **Security Audit** | `openclaw security audit --deep` |
| **Logs** | `openclaw logs --follow` |
| **Gateway Status** | `openclaw gateway status` |
| **Cron Jobs** | `openclaw cron list` |
| **Skills List** | `openclaw skills list` |
| **Re-link WhatsApp** | `openclaw channels login --channel whatsapp --account practice` |
| **Anthropic Console** | https://console.anthropic.com |
| **HIPAA Audit Logs** | `~/.openclaw/sessions/` |
| **Tailscale** | https://tailscale.com |

---

> **See also:** `reference_documents/dental_workflow_reference.md` for detailed message templates, Dentrix integration notes, and recall campaign setup instructions.

---

**OPENCLAW | Your Agent. Your Hardware. Your Soul.**
**Park Family Dentistry — Powered by OpenClaw**
