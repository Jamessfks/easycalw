# PROMPTS TO SEND — Sarah's Dental Practice
*Copy and paste each prompt in order. Send via Telegram to your agent.*

---

## PROMPT 1 — First Contact
*Send this immediately after Phase 1 is complete and your agent responds to "hello"*

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

---

## PROMPT 2 — Tell Your Story
*Send this once your agent confirms Prompt 1 is complete*

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

---

## PROMPT 3 — Morning Briefing & Status Command
*Send this after Prompt 2 and your agent's response*

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

When the morning briefing runs, also prepare a front-desk version. This version should only list: today's appointments by time, any confirmed cancellations, and any open slots. No patient last names, no insurance details. Keep it to a simple table. We'll connect the email delivery once Google is set up.
```

---

## PROMPT 4 — Google Setup & Reminder Automations
*Send this during Phase 4, after creating your dedicated Google account*

```
I need to connect Google Calendar so you can read our appointment schedule. Before we do, confirm:

1. You will ONLY read calendar data locally and will NOT sync it to any external service
2. You will use first names only (never full names + appointment details together) in any message you send

Once you've confirmed those two things, walk me through connecting my dedicated Google account (the one I just created specifically for you — not my personal Gmail).

After Google Calendar is connected, set up the automated appointment reminders:

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

Also, let's set up the insurance pre-authorization letter system.

When I say "pre-auth [procedure] for [patient first name] [insurance plan]", I want you to:
1. Pull up our standard pre-auth template
2. Fill in what you know (procedure, date, our practice info)
3. Leave placeholders clearly marked for anything you don't know — [DIAGNOSIS CODE], [TOOTH NUMBER], etc.
4. Show me the draft for review before I do anything with it

Draft me a base template for a standard pre-authorization letter now. Use our practice name as "Portland Family Dental" — I'll tell you if that's wrong. Leave all patient-specific fields as clear placeholders.

IMPORTANT: These letters should never be auto-sent. I always review and send them manually. Confirm you understand this.
```

---

## PROMPT 5 — Set the Rules
*Send this after your tools are connected and working*

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

---

## PROMPT 6 — Security Audit
*Send this last. Always do this before considering setup complete.*

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

---

*That's all 6 prompts, Sarah. Send them in order and you'll have a fully configured, HIPAA-aware dental practice agent running on your Mac Mini.*