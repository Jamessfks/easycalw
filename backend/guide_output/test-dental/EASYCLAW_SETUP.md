# EASYCLAW SETUP GUIDE
**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | Sarah |
| **MISSION** | Stop losing hours to manual appointment reminders and protect your patients' HIPAA data — every automation stays on your Mac Mini, never in the cloud |
| **DATE** | 2025-07-10 |
| **DEPLOYMENT** | Mac Mini (Back Office — Always On) |
| **CHANNEL** | Telegram (Sarah) + Email (Front Desk) |
| **MODEL** | claude-sonnet-4-6 |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

*Sarah, your front desk is spending hours every week on calls that an agent can handle in seconds — and with HIPAA constraints, this has to run on your own hardware. This guide sets that up, step by step. No technical background required. Follow the phases in order.*

---

## 🎯 Key Moments

- **Your Mac Mini becomes a 24/7 silent staff member** — reminding patients 48 hours and 2 hours before their appointments, automatically, while your front desk focuses on the patients standing in front of them.
- **Your morning starts with a complete picture** — a daily schedule summary lands on your Telegram before you arrive, with cancellations already flagged and openings identified.
- **Patient data never leaves your building** — OpenClaw runs entirely on your local network. No patient names, phone numbers, or appointment details pass through any cloud service. HIPAA is baked into the architecture, not bolted on.

---

## ⚠️ Read Before You Start

> ⚠️ **HIPAA WARNING — Read This First**
>
> OpenClaw will only be as HIPAA-safe as how you configure it. This guide is written with that constraint front and center. Specifically:
> - **Never** connect a third-party cloud skill that sends patient data outbound (no cloud CRM, no external SMS gateway that stores messages)
> - **Always** keep your Mac Mini on your internal network behind your clinic's firewall
> - **Never** let the agent draft or send messages that include full patient names + appointment details + diagnosis in the same message
> - Use first name only, or appointment reference numbers, in any outbound communications your agent sends
>
> When in doubt, ask your agent: *"Does this action involve transmitting patient data outside our local network?"* before approving anything.

---

## Phase 1: Get It Running
*Estimated time: 20–30 minutes. You only do this once.*

### Pre-Flight Security (Do This First)

Before installing anything else, you need to lock down the Mac Mini that will run your agent. This is your practice's back-office computer — it needs to be hardened.

**Step 1 — Create a dedicated Mac user account**

Your agent must NOT run under your personal Mac account. Open **System Settings > Users & Groups** and create a new Standard account called something like `openclaw-agent`. Log into that account for everything that follows.

> ⚠️ **WARNING:** If you run OpenClaw under your personal account, it will have access to your personal iCloud, photos, passwords, and documents. Always use the dedicated account.

**Step 2 — Enable FileVault disk encryption**

Open **Apple menu > System Settings > Privacy & Security > FileVault** and turn it ON. This encrypts every file on disk — including any patient-adjacent data your agent touches. It takes about 30 minutes the first time.

**Step 3 — Keep the Mac Mini awake 24/7**

Open **System Settings > Energy** and enable:
- ✅ Prevent automatic sleeping when the display is off
- ✅ Wake for network access
- ✅ Start up automatically after a power failure

> 💡 **TIP:** Also install **Amphetamine** (free, Mac App Store). It's a tiny app that sits in your menu bar and prevents sleep more reliably than the Energy settings alone. Once installed: open Preferences → enable "Launch at login" → set session to Indefinitely.

**Step 4 — Set API spending limits**

Before you enter any API keys, go to your Anthropic billing page and set a monthly cap of **$30–$50**. A misconfigured agent can burn through credits in a loop. Start conservative and raise it once you see your actual usage.

---

### Install OpenClaw

Open the **Terminal** app on your Mac Mini. (Press Cmd+Space, type "Terminal", press Enter.)

**1. Install Xcode Command Line Tools**
```bash
xcode-select --install
```
A dialog box will pop up — click Install. Wait a few minutes until it finishes.

**Verify it worked:**
```bash
xcode-select -p
```
You should see a path like `/Library/Developer/CommandLineTools`. If you do, move on.

---

**2. Install Homebrew**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
Follow the prompts. When it finishes, if you're on an M-series Mac Mini, run:
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

**Verify it worked:**
```bash
brew --version
```
You should see something like `Homebrew 4.x.x`.

---

**3. Install OpenClaw**
```bash
brew install openclaw/tap/openclaw
```

**Verify it worked:**
```bash
openclaw --version
```
You should see a version number. If you do, the software is installed.

---

### Connect Your AI Model

```bash
openclaw setup
```

Select **Anthropic** when prompted. A browser window will open — sign in with the Anthropic account where you set your spending limit. Come back to Terminal when it closes.

---

### Connect Telegram (Your Personal Channel)

> 💡 **TIP:** This sets up YOUR personal Telegram connection. Your agent will message you directly. The front desk email connection is set up in Phase 4.

**Step 1 — Create your bot**

Open Telegram on your phone. Search for `@BotFather` (make sure it has the blue verified checkmark). Tap it and send:
```
/newbot
```
Follow the prompts. Name your bot something like `SarahsDentalAgent`. BotFather will give you a token that looks like `123456789:ABCdef...` — **save this token, you will need it in a moment.**

**Step 2 — Configure the Telegram channel**

OpenClaw's Telegram channel does NOT use `openclaw channels login`. Instead, add your token to the config file. In Terminal:

```bash
openclaw gateway
```

This will prompt you for your bot token. Paste it in.

**Step 3 — Approve your own access**

```bash
openclaw pairing list telegram
openclaw pairing approve telegram
```

> ⚠️ **WARNING:** Pairing codes expire after 1 hour. If you see an error, run `openclaw gateway` again to generate a fresh code.

---

### Verify "Hello"

Open Telegram and send your new bot:
```
hello
```

If it responds — **Phase 1 is complete.** Your agent is live on your Mac Mini, connected to your Telegram, and ready to be given a purpose.

---

## Phase 2: Wake Up Your Agent
*Estimated time: 10 minutes. Two prompts that give your agent its mission and memory.*

Your agent is alive but it knows nothing about you, your practice, or HIPAA. These two prompts fix that.

### Prompt 1 — First Contact

Send this to your agent on Telegram:

```
Hi! I just finished setting you up. I'm Sarah — I run a small dental practice in Portland, Oregon with three dentists and two hygienists. 

Before I tell you more about our practice, I need you to do two things:

1. Install this self-improvement skill so you can keep learning and improving:
   clawhub install skill-vetter

   IMPORTANT: skill-vetter must be installed and running BEFORE you install any other skill. It scans every skill for security problems. This is non-negotiable.

2. Set up your memory system. Study the patterns from this project for inspiration — don't install it, just learn from it:
   https://github.com/anthropics/claude-mem
   
   Create a MEMORY.md file as a short index of important things you learn about me and our practice. Also create a memory/ folder for daily operational notes. Use an index style — short titles pointing to details. Keep entries brief so you stay fast.

   The very first entry in MEMORY.md should always be:
   "HIPAA: Patient data never leaves local network. No cloud transmission of PHI."

Let me know when both are done and I'll tell you about our practice.
```

*What happens: Your agent installs the security scanner and sets up its own memory — including your HIPAA constraint as its first and most important rule. It'll confirm when ready.*

---

### Prompt 2 — Tell Your Story

Once your agent confirms Prompt 1 is done, send this:

```
Here's our situation. We're a dental practice and HIPAA compliance is non-negotiable — patient data cannot leave our local network. Everything you do must stay on our Mac Mini.

Our biggest problem right now: our front desk makes every appointment reminder call manually. It takes hours every week and things still fall through the cracks. Patients don't show up because they forgot.

Here's what I need help with:
1. Automated appointment reminders — 48 hours before and 2 hours before each appointment
2. A daily morning summary of the full schedule, with any cancellations or openings flagged
3. Help drafting insurance pre-authorization letters (templates I can review and send)

We use Dentrix for patient records, Google Calendar for scheduling, and email for front desk communications.

I'm not very technical, so I need things explained clearly.

Based on what I've told you, what do you think you can help with? What would you suggest we set up first — and are there any HIPAA risks I should know about before we proceed?
```

*What happens: Your agent will propose a plan based on your practice's actual needs. Read its response carefully. If anything sounds like it would send patient data outside your network, tell it that's not acceptable. Your agent should flag that itself — but you're the final check.*

---

## Phase 3: Your Command Center
*Estimated time: 5 minutes. One prompt that creates your daily dashboard.*

### Prompt 3 — Morning Briefing Setup

```
I want a daily morning briefing every weekday at 7:15 AM Pacific time. Send it to me on Telegram.

The briefing should include:
1. Full schedule for today — every appointment, patient first name only, time, and which dentist or hygienist
2. Any confirmed cancellations or no-shows from yesterday
3. Any open slots today that could be filled (flag these clearly)
4. Any appointments tomorrow that haven't been confirmed yet
5. A count of how many reminder messages are scheduled to go out today

Format it clearly — I want to read it in 60 seconds while I'm having coffee. Use plain language, not medical jargon.

Also set up a "status" command — when I send you the word "status" at any time, give me a live version of this same summary.

Please set up the cron job for the morning briefing now using:
openclaw cron add --name "Morning Dental Brief" --cron "0 15 * * 1-5" --tz "America/Los_Angeles" --session isolated --announce
```

> 💡 **TIP:** The cron schedule `0 15 * * 1-5` means 7:15 AM Pacific (UTC-8). If you're on daylight saving time, adjust to `0 14 * * 1-5` for PDT (UTC-7). Ask your agent to help you confirm the right time.

**Verify it worked:**
```bash
openclaw cron list
```
You should see "Morning Dental Brief" in the list.

---

### Your Front Desk Dashboard

Your agent should also be able to send a simplified version of the daily summary to your front desk email. Set this up in Phase 4 once Google is connected — but plant the seed now by telling your agent:

```
When the morning briefing runs, also prepare a front-desk version. This version should only list: today's appointments by time, any confirmed cancellations, and any open slots. No patient last names, no insurance details. Keep it to a simple table. We'll connect the email delivery in Phase 4.
```

---

## Phase 4: Connect Your Tools
*Estimated time: 20–30 minutes. Sets up the integrations that power your automations.*

> ⚠️ **CRITICAL: DEDICATED GOOGLE ACCOUNT REQUIRED**
>
> Do NOT connect your personal Gmail or the Gmail you use for patient correspondence. Create a brand-new Google account specifically for your OpenClaw agent — something like `dental-agent-portland@gmail.com`. Then share only the specific Google Calendars and Sheets you want it to access.
>
> This is both a HIPAA practice and a general security principle. Your agent should only see what it needs to see.

### Prompt 4 — Google Setup Instructions

Send this to your agent:

```
I need to connect Google Calendar so you can read our appointment schedule. Before we do, remind me: 

1. Confirm that you will ONLY read calendar data locally and will NOT sync it to any external service
2. Confirm that you will use first names only (never full names + appointment details together) in any message you send

Once you've confirmed those two things, let's install the Google integration. I'll set up a dedicated Google account first — walk me through the steps.
```

*Your agent will guide you through creating the dedicated Google account and connecting it. Follow its instructions.*

---

### Install Your Skills

Once `skill-vetter` is installed (from Phase 2), install each skill below by first running the vetter, then the install:

**Security baseline — install these first:**
```bash
skill-vetter skill-vetter
clawhub install skill-vetter
```

> ✅ **ACTION:** Run `skill-vetter <skill-name>` before EVERY install below. Do not skip this step.

**Core skills for your practice:**
```bash
# Scan first, then install — repeat this pattern for every skill
skill-vetter telegram
clawhub install telegram

skill-vetter skill-vetter
```

> 💡 **TIP:** The `skill-vetter` and `telegram` slugs come directly from the verified ClawHub skill registry. Only install skills using these exact slugs. If your agent suggests a skill name not on this list, ask it to verify the slug at clawhub.ai before proceeding.

**Verify skills installed:**
```bash
openclaw skills list
```

---

### Activate Your Reminder Automations

Now that Google Calendar is connected, set up your appointment reminder cron jobs. Send this to your agent:

```
Now let's set up the automated appointment reminders. I need two reminder sequences:

REMINDER 1 — 48 hours before appointment:
- Check Google Calendar for all appointments exactly 48 hours from now
- For each appointment, compose a friendly reminder message
- Use patient first name only — no last names in messages
- Include: date, time, which dentist, and our office phone number
- Flag any appointment where we don't have a contact method

REMINDER 2 — 2 hours before appointment:
- Check Google Calendar for all appointments exactly 2 hours from now  
- Send a brief "see you soon" reminder
- Include our address and parking info

For now, draft these reminders and show them to me for review before any are sent. We'll switch to automatic sending once I've reviewed 5 examples and I'm happy with the format.

Please set up both cron jobs:
openclaw cron add --name "48hr Reminder Batch" --cron "0 * * * *" --tz "America/Los_Angeles" --session isolated --announce
openclaw cron add --name "2hr Reminder Batch" --cron "0 * * * *" --tz "America/Los_Angeles" --session isolated --announce
```

*Your agent will set up the schedule and show you draft reminders for your review before anything goes to patients.*

---

### Insurance Pre-Authorization Templates

```
Let's set up the insurance pre-authorization letter system.

When I say "pre-auth [procedure] for [patient first name] [insurance plan]", I want you to:
1. Pull up our standard pre-auth template
2. Fill in what you know (procedure, date, our practice info)
3. Leave placeholders clearly marked for anything you don't know — [DIAGNOSIS CODE], [TOOTH NUMBER], etc.
4. Show me the draft for review before I do anything with it

Draft me a base template for a standard pre-authorization letter now. Use our practice name as "Portland Family Dental" — I'll tell you if that's wrong. Leave all patient-specific fields as clear placeholders.

IMPORTANT: These letters should never be auto-sent. I always review and send them manually. Confirm you understand this.
```

---

## Phase 5: Set the Rules
*Estimated time: 5 minutes. This is where you define what your agent can and cannot do on its own.*

### Prompt 5 — Your Practice Rules

```
Before we go any further, I need to set your operating rules. Read these carefully and confirm you understand each one.

THINGS YOU CAN DO FREELY (no need to ask me first):
- Read our Google Calendar
- Draft appointment reminder messages for my review
- Draft insurance pre-auth letters for my review
- Compile the morning schedule summary
- Answer my questions about the schedule
- Set your own memory and notes

THINGS YOU MUST CHECK WITH ME FIRST (notify me and wait for approval):
- Sending any message that includes patient information
- Adding or changing anything on the Google Calendar
- Installing any new skill or tool
- Connecting to any new service or API

THINGS YOU MUST NEVER DO — NO EXCEPTIONS:
- Send patient data (names, appointment times, treatment info) to any service outside this Mac Mini
- Auto-send any message to patients without my explicit approval first
- Store patient information in any cloud service
- Connect to Dentrix without my direct supervision — ask me before attempting any Dentrix integration
- Delete any files or calendar entries

AUTONOMY LEVEL: You are at Tier 2 — Notify. You suggest, I approve. You do not act on patient communications autonomously.

Confirm you've understood all of these rules and tell me if anything seems unclear.
```

> ✅ **ACTION:** Read your agent's confirmation carefully. If it qualifies or pushes back on any rule, clarify until it confirms clearly. These rules protect your patients and your license.

---

## Phase 6: Stay Safe
*This phase is mandatory. Do not skip it.*

### Prompt 6 — Security Audit

```
I want to run a full security review of everything we've set up. Please do the following:

1. Run a security audit of all installed skills:
   skill-vetter --audit-all

2. List every external connection you currently have configured — any API, any service, any URL you can reach

3. Confirm for each connection: does it have access to anything that could contain patient information?

4. Check our cron job list and confirm none of them are configured to send data to an external URL:
   openclaw cron list

5. Summarize your findings and flag anything that concerns you

After the audit, remind me of the three most important things I should check monthly to keep this setup HIPAA-safe.
```

**Verify your cron jobs are clean:**
```bash
openclaw cron list
```
Review the output. Every job should have a recognizable name that you set up. If you see anything unfamiliar, ask your agent what it is before proceeding.

---

### Monthly Security Checklist

Put this in your calendar as a monthly recurring task:

| Check | How |
|---|---|
| Review installed skills | `openclaw skills list` — remove anything you don't recognize |
| Review cron jobs | `openclaw cron list` — delete any you didn't create |
| Check API spending | Log into Anthropic billing — review actual vs. expected spend |
| Re-run skill vetter on all installs | `skill-vetter --audit-all` |
| Confirm FileVault is still on | System Settings > Privacy & Security > FileVault |

> ⚠️ **WARNING:** If you ever see a skill listed that you don't remember installing, or a cron job sending data to an unfamiliar URL, stop everything and run `skill-vetter --audit-all` immediately. Then ask your agent to explain every unfamiliar entry before doing anything else.

---

## ✅ You're Set Up, Sarah

Here's what you've built:

- ✅ OpenClaw running 24/7 on your back-office Mac Mini
- ✅ Encrypted disk (FileVault) protecting all agent data
- ✅ Telegram connected for your personal morning briefings
- ✅ Dedicated Google account (never your personal account) connected to your schedule
- ✅ Automated 48-hour and 2-hour appointment reminders (draft-for-review mode)
- ✅ Daily 7:15 AM morning briefing with schedule, cancellations, and open slots
- ✅ Insurance pre-auth letter drafting on demand
- ✅ HIPAA constraint set as your agent's first and permanent memory rule
- ✅ Tier 2 autonomy — your agent suggests, you approve, nothing goes to patients without your sign-off
- ✅ Security audit complete

---

## Quick Command Reference

| Task | Command or Action |
|---|---|
| Check all running cron jobs | `openclaw cron list` |
| Run a cron job immediately | `openclaw cron run <job-id>` |
| View recent cron run history | `openclaw cron runs --id <job-id>` |
| Audit all installed skills | `skill-vetter --audit-all` |
| List installed skills | `openclaw skills list` |
| View live agent logs | `openclaw logs --follow` |
| Fix config issues | `openclaw doctor --fix` |
| Get live schedule summary | Send "status" to your Telegram bot |

---

## Safety TL;DR

> 🔒 **Your HIPAA Safety in One Paragraph**
>
> Your agent runs on your Mac Mini. It reads your Google Calendar locally. It drafts messages and shows them to you — it does not send anything to patients automatically. Patient data never leaves your network. FileVault encrypts everything on disk. You approve every patient-facing communication before it goes anywhere. If your agent ever suggests connecting to a new service that would receive patient information, your answer is no until you've checked with your IT professional or HIPAA compliance officer.