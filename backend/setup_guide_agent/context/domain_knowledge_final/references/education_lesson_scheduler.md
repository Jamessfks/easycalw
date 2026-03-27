# Lesson Scheduling and Teaching Workflow — OpenClaw Reference Guide

## What This Does

OpenClaw manages the full administrative workflow for independent educators, private tutors, and small teaching practices: scheduling lessons with students, sending reminders and confirmations, tracking attendance, managing rescheduling and cancellations, preparing lesson materials before each session, logging session notes after teaching, tracking student progress over time, and handling the billing cycle for paid lessons. It replaces the patchwork of calendar apps, spreadsheets, messaging threads, and note-taking tools that most independent teachers juggle.

## Who This Is For

**Primary user:** Independent tutors (academic, music, language, test prep), private instructors (fitness, cooking, art), small tutoring centers (1-5 instructors), and freelance corporate trainers managing their own client roster.

**Industry:** Education, tutoring, coaching, professional development, music instruction, test preparation, corporate training.

**Pain point:** Teaching is the work you love. Scheduling, reminding, rescheduling, invoicing, and tracking is the work you tolerate. You lose 5-10 hours per week to administrative overhead: texting students about schedule changes, updating spreadsheets after each session, writing session notes, chasing late payments, and preparing materials for different students at different levels. You want an assistant that handles the admin so you can focus on teaching.

**Technical level:** Basic comfort with calendar apps, email, and messaging. Many tutors are non-technical and need a setup that works reliably without ongoing maintenance.

## OpenClaw Setup

### Required Skills

Install these skills via `clawhub install <skill-name>`:

| Skill | Purpose in This Workflow |
|---|---|
| `skill-vetter` | Security-first: scan every skill before installing |
| `prompt-guard` | Protect against prompt injection in student emails or messages |
| `agentguard` | Prevent the agent from sending messages or modifying schedules without approval |
| `gog` | Google Calendar for lesson scheduling, Gmail for student communication, Google Sheets for tracking |
| `obsidian` | Store student profiles, session notes, lesson plans, and progress records locally |
| `whatsapp-cli` | Send lesson reminders, confirmations, and schedule updates to students via WhatsApp |
| `apple-reminders` | Push teaching reminders to your Apple devices (lesson prep, follow-ups) |
| `summarize` | Condense curriculum materials and generate lesson plan summaries |
| `self-improving-agent` | Learn scheduling patterns, student preferences, and your administrative habits |
| `automation-workflows` | Build multi-step workflows (e.g., when a lesson is confirmed, create a prep reminder and send a confirmation message) |

### Optional Skills

| Skill | Purpose |
|---|---|
| `telegram` | Alternative messaging channel for students who prefer Telegram |
| `slack` | Team communication if you coordinate with other instructors |
| `notion` | Alternative to Obsidian for student management and lesson planning |
| `todoist` | Cross-platform task management for lesson prep and follow-up tasks |
| `things-mac` | macOS-native task management for lesson prep lists |
| `mailchannels` | Send professional lesson confirmations and invoices via email |
| `agent-mail` | Dedicated inbox for student communications and scheduling requests |
| `payment` | Process lesson payments with guardrailed billing workflows |
| `bookkeeper` | Track income from lessons, generate invoicing records |
| `financial-overview` | Aggregate teaching income and expense tracking |
| `pdf-toolkit` | Generate and manage lesson handouts, worksheets, and certificates |
| `tavily-web-search` | Find supplementary teaching materials and resources online |
| `canva` | Create lesson handouts, certificates, and visual aids |

### Channels to Configure

1. **Google Calendar:** Create a dedicated "Teaching" calendar via `gog` for all lesson slots. Use event descriptions to store student name, subject, and level.
2. **Obsidian vault:** Create a `Teaching/` folder with subfolders: `Students/`, `Lessons/`, `Materials/`, `Notes/`, and `Billing/`.
3. **Student profiles:** For each student, create a profile note in `Teaching/Students/{{student-name}}.md` with: name, contact info, subject, level, scheduling preferences, lesson history, and notes.
4. **WhatsApp:** Configure `whatsapp-cli` for student messaging. Most tutors find WhatsApp is where 90% of scheduling conversations happen.

### Hardware Recommendations

- **Minimum:** Any Mac with 8 GB RAM. Scheduling and messaging workflows are lightweight.
- **Recommended:** Mac Mini M2 with 16 GB RAM if you want continuous background monitoring of schedule changes and automated reminder dispatch.
- **Storage:** Minimal. Student profiles and session notes for 50 students over a year is well under 200 MB.
- **Always-on:** For automated reminders to work reliably, the Mac should be powered on during business hours (or use scheduled wake).

## Installation Walkthrough

### Step 1: Security Foundation

```
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard
```

### Step 2: Core Skills

```
skill-vetter gog && clawhub install gog
skill-vetter obsidian && clawhub install obsidian
skill-vetter whatsapp-cli && clawhub install whatsapp-cli
skill-vetter apple-reminders && clawhub install apple-reminders
skill-vetter summarize && clawhub install summarize
skill-vetter self-improving-agent && clawhub install self-improving-agent
skill-vetter automation-workflows && clawhub install automation-workflows
```

### Step 3: Configuration

- **Google Account (OAuth):** Required for `gog`. Grant access to Calendar, Gmail, and Sheets.
- **WhatsApp Business API or local CLI session:** Required for `whatsapp-cli`. Follow the skill's setup guide to authenticate your WhatsApp number.
- **Apple Reminders:** No configuration needed if you are on macOS 14+. Reminders sync automatically to all iCloud-connected devices.

### Step 4: Obsidian Vault Structure

```
Teaching/
  Students/
    _template.md
  Lessons/
  Materials/
  Notes/
  Billing/
  Reports/
```

### Step 5: Student Profile Template

Create `Teaching/Students/_template.md`:

```
## Student Profile

- **Name:** [Full name]
- **Contact:** [WhatsApp number or email]
- **Parent/Guardian Contact:** [If minor]
- **Subject:** [e.g., Algebra 1, Piano Grade 3]
- **Level:** [e.g., Grade 8, Intermediate]
- **Schedule:** [e.g., Tuesdays 4:00 PM, 60 min]
- **Rate:** [e.g., $60/hour]
- **Start Date:** [Date]
- **Billing Method:** [e.g., monthly invoice, per-lesson payment]

## Lesson History

| Date | Topic Covered | Notes | Homework |
|------|--------------|-------|----------|

## Progress Notes

[Ongoing observations about the student's development]
```

### Step 6: Verify Connections

```
openclaw "list today's events on my Teaching calendar via gog"
openclaw "send a test WhatsApp message to [your-own-number] via whatsapp-cli saying 'Test reminder'"
openclaw "create a test reminder via apple-reminders: 'Test teaching reminder'"
openclaw "create a test note in Obsidian at Teaching/Notes/test.md"
```

## Core Automation Recipes

### 1. Daily Teaching Schedule Briefing

Every morning, get a summary of today's lessons and any prep needed.

```
openclaw cron add --every day --at 07:00 "read my Teaching calendar from Google Calendar via gog for today's lessons, for each lesson pull the student's profile from Obsidian at Teaching/Students/{{student-name}}.md, list: time, student name, subject, current level, what we covered last session, and any prep notes I left for this lesson, flag any schedule conflicts or back-to-back lessons without a break, and save the briefing to Teaching/Notes/daily-briefing-{{date}}.md"
```

### 2. Lesson Reminder Dispatch

Send reminders to students 24 hours before their lesson and again 2 hours before.

```
openclaw cron add --every 30m "check my Teaching calendar via gog for any lesson starting in approximately 24 hours that has not been reminded yet, send a WhatsApp message via whatsapp-cli to the student: 'Hi [Name], just a reminder about your [Subject] lesson tomorrow at [Time]. Please let me know if you need to reschedule. See you then!', and mark the event as reminded in Obsidian at Teaching/Notes/reminders-{{date}}.md"
```

```
openclaw cron add --every 30m "check my Teaching calendar via gog for any lesson starting in approximately 2 hours that has not received a same-day reminder, send a WhatsApp message: 'Hi [Name], your [Subject] lesson is at [Time] today. Looking forward to it!', and log the reminder"
```

### 3. Post-Lesson Session Notes Prompt

After each lesson, prompt you to dictate quick session notes.

```
openclaw cron add --every 30m "check my Teaching calendar via gog for any lesson that ended in the last 30 minutes, create an Apple Reminder via apple-reminders: 'Write session notes for [Student Name] - [Subject]', and prepare a session notes template in Obsidian at Teaching/Notes/{{student-name}}-{{date}}.md with fields: Topics Covered, Student Performance, Homework Assigned, Notes for Next Session"
```

### 4. Weekly Schedule Assembly

Every Sunday evening, compile next week's teaching schedule and identify gaps.

```
openclaw cron add --every sunday --at 18:00 "read my Teaching calendar via gog for the upcoming week (Monday-Sunday), compile a complete schedule showing: day, time, student, subject, and any special notes, identify open slots where I could schedule additional lessons, check for any recurring students who do not have a lesson scheduled this week (compare against student profiles in Obsidian), and save the weekly overview to Teaching/Notes/week-of-{{date}}.md"
```

### 5. Rescheduling Handler

Monitor incoming messages for rescheduling requests and propose alternatives.

```
openclaw cron add --every 15m "check Gmail via gog and WhatsApp incoming messages for any student rescheduling requests received in the last 15 minutes, when a request is found: check my Teaching calendar for available alternative slots this week, draft a reply suggesting 2-3 available times, and save the draft to Teaching/Notes/reschedule-pending-{{date}}.md for my review before sending"
```

### 6. Monthly Student Progress Summary

At the end of each month, generate a progress report for each active student.

```
openclaw cron add --every month --at 09:00 "read all session notes from this month in Obsidian at Teaching/Notes/ for each active student, compile a progress summary: total lessons attended, topics covered, skills improved, areas needing work, attendance rate, and a brief narrative assessment, save each student's report to Teaching/Students/{{student-name}}-progress-{{month}}.md"
```

### 7. Billing Cycle Management

Track lesson counts and generate monthly invoices.

```
openclaw cron add --every month --at 10:00 "read my Teaching calendar via gog for all lessons completed this month, cross-reference with attendance records in Obsidian (mark no-shows separately), for each student calculate: lessons attended, lessons cancelled with notice, no-shows, and total amount due at their agreed rate (stored in their student profile), generate an invoice summary at Teaching/Billing/invoices-{{month}}.md, and flag any students with outstanding balances from previous months"
```

### 8. Lesson Material Preparation

Before each lesson, queue up relevant materials based on the curriculum plan.

```
openclaw cron add --every day --at 20:00 "check my Teaching calendar via gog for tomorrow's lessons, for each lesson read the student's profile and last session notes from Obsidian, identify what materials I need to prepare (worksheets, exercises, reading passages), check if I already have appropriate materials in Teaching/Materials/, if not search tavily-web-search for suitable resources at the student's level, and create a prep checklist as an Apple Reminder via apple-reminders for each lesson"
```

## Guardrails and Safety

### What the Agent Should NEVER Do Autonomously

1. **Never send messages to students without your review and approval.** All reminder messages, rescheduling proposals, and communications must be drafted for your review first. The only exception: you may configure pre-approved reminder templates that send automatically (Recipe #2), but even these should be tested manually for the first week.

2. **Never cancel or delete lessons from the calendar.** The agent can propose rescheduling and draft alternatives, but only you confirm calendar changes. A mis-cancelled lesson erodes student trust immediately.

3. **Never share student information with anyone.** Student profiles, progress reports, session notes, and contact details are private educational records. The agent must never transmit this data externally.

4. **Never discuss one student's performance with another student.** If the agent handles messaging for multiple students, it must maintain strict separation. No "your classmate is ahead of you" or comparative statements.

5. **Never process payments without explicit authorization.** If the `payment` skill is installed, every charge must be individually approved. Never auto-charge students.

6. **Never provide academic assessments or diagnoses.** The agent tracks progress but must not diagnose learning disabilities, make placement recommendations for formal educational institutions, or issue certifications.

7. **Never contact parents or guardians of minor students without your explicit instruction.** Communication with minors' parents is a sensitive area requiring your direct judgment.

8. **Never modify lesson rates or billing terms.** Rate changes and billing adjustments are business decisions that require your explicit input.

### Recommended `agentguard` Rules

```
agentguard rule add "block any outbound WhatsApp or email message unless template is pre-approved or I explicitly confirm"
agentguard rule add "block deletion or modification of any Google Calendar event"
agentguard rule add "block any payment processing action"
agentguard rule add "block sharing of any file from the Teaching/ folder externally"
agentguard rule add "require confirmation before creating new student profiles"
```

## Sample Prompts

### Prompt 1: Initial Setup

```
I'm a private math tutor with 18 students. I teach middle school and high school math, mostly algebra, geometry, and pre-calculus. I give 25-30 lessons per week, charging $60/hour for middle school and $75/hour for high school.

Set up my teaching management system: create the Obsidian folder structure, set up my Teaching calendar in Google, create a student profile template, configure daily briefing and reminder crons, and show me how to add my first 5 students.
```

### Prompt 2: Bulk Student Import

```
Here are my 18 students. For each one, create a profile in Obsidian with their details:

1. Sarah K. - Grade 8, Algebra 1, Tuesdays 4pm, WhatsApp: [number]
2. Marcus T. - Grade 10, Geometry, Mondays and Thursdays 5pm, WhatsApp: [number]
[...continue for all students]

After creating profiles, add all recurring lessons to my Teaching calendar and confirm the schedule looks correct.
```

### Prompt 3: End-of-Semester Review

```
Generate progress reports for all my students for this semester. For each student, include: total lessons attended vs. scheduled, topics covered in sequence, my session notes summary, areas of improvement, areas still needing work, and a recommended focus for next semester. Format each report so I can share it with the student (or their parents for minors) — professional, encouraging, and specific.
```

### Prompt 4: Schedule Optimization

```
Look at my teaching schedule for the last 3 months. Identify: which time slots have the most cancellations, which days are most reliably attended, how much dead time I have between lessons (travel or gaps), and whether any students would be better served by a different time slot. Propose an optimized weekly schedule that maximizes my teaching hours and minimizes gaps.
```

### Prompt 5: Substitute Coverage

```
I'm sick and need to cancel all lessons for the next 3 days. Draft individual WhatsApp messages to each affected student offering to reschedule. Check my calendar for the following week and suggest 2 available makeup slots for each student. Queue all messages for my approval before sending.
```

## Advanced Workflows

### Automated Waitlist Management

If you are at capacity, maintain a waitlist and notify prospective students when slots open.

```
openclaw cron add --every day --at 21:00 "compare my Teaching calendar capacity (read from Obsidian at Teaching/Notes/capacity.md which lists my maximum weekly hours) against currently scheduled recurring lessons, if any recurring student has cancelled permanently or paused lessons this week, check the waitlist at Teaching/Students/waitlist.md, and draft a message to the next person on the waitlist offering the open slot, save the draft for my review"
```

### Homework Follow-Up Reminders

Remind students about homework assignments 24 hours before their next lesson.

```
openclaw cron add --every 2h "check my Teaching calendar via gog for lessons happening in approximately 24 hours, for each upcoming lesson read the previous session notes from Obsidian to check if homework was assigned, if homework exists and the student has not confirmed completion, draft a WhatsApp reminder: 'Hi [Name], just a reminder about the homework from our last session: [homework description]. See you tomorrow at [Time]!', save the draft for review"
```

### Term-End Report Generation

At the end of each academic term, generate comprehensive reports.

```
openclaw cron add --every 3months "for each active student in Obsidian at Teaching/Students/, compile a term report covering: all session notes from the past 3 months, attendance statistics, topics covered in chronological order, homework completion rate, areas of improvement, areas still needing attention, and a recommended focus for next term, format each report as a professional PDF-ready document at Teaching/Reports/{{student-name}}-term-{{date}}.md"
```

### Revenue Tracking Dashboard

Maintain a running revenue summary.

```
openclaw cron add --every week "read all billing records from Teaching/Billing/ for the current month, calculate: total lessons delivered, total revenue earned, outstanding invoices, cancellation rate, and average lessons per student, compare against the previous month, and save the financial summary to Teaching/Billing/revenue-summary-{{month}}.md"
```

## Common Gotchas

### 1. Reminder Fatigue and Message Timing

Sending automated reminders is the most immediately valuable automation, but getting the timing and tone wrong annoys students quickly. Start with one reminder 24 hours before the lesson. Add the 2-hour reminder only if you have a no-show problem. Never send reminders before 8:00 AM or after 9:00 PM in the student's timezone. Test all reminder templates with 2-3 students before enabling them for your full roster. One badly timed or oddly worded reminder will make students ask "are you using a bot?" in a negative way.

### 2. Calendar Sync Conflicts

If you use your Google Calendar for both personal and teaching events, the agent may incorrectly identify personal events as available teaching slots (or vice versa). Use a dedicated "Teaching" sub-calendar and configure the agent to only read and write to that specific calendar. Double-bookings caused by calendar sync lag (especially if you also use Apple Calendar or a scheduling tool like Calendly) are the most common operational failure in this setup.

### 3. Student Data Privacy Requirements

Depending on your jurisdiction and whether you teach minors, you may be subject to data protection regulations (FERPA in the US, GDPR in the EU, etc.). OpenClaw stores all data locally in your Obsidian vault, which is good for privacy, but you are still responsible for: obtaining consent to store student data, not backing up the vault to unencrypted cloud storage, and having a data deletion process when a student leaves. The agent cannot advise you on legal compliance — consult a professional if you teach minors or operate in a regulated jurisdiction.

### 4. WhatsApp Message Delivery Failures

WhatsApp messages can fail silently if the recipient has changed their number, blocked your number, or if the WhatsApp Business API session has expired. The agent should log every sent message and its delivery status. If a reminder is not delivered, the agent should flag it in the daily briefing so you can follow up manually. Check your `whatsapp-cli` session health weekly — session timeouts are the most common cause of silently failed messages.

### 5. Session Notes Procrastination

The post-lesson session notes prompt (Recipe #3) works only if you actually dictate the notes within 30 minutes of the lesson ending. In practice, many tutors skip notes when they are tired or rushing between back-to-back lessons. At minimum, jot down three words per student per session: the topic covered, one thing the student did well, and one thing to work on. Even incomplete notes are vastly better than no notes when you need to plan the next session two weeks later.

## Frequently Asked Questions

**Q: Can the agent handle group lessons?**
A: Yes. Create a student profile for the group (e.g., "Grade-8-Algebra-Group.md") listing all group members. Schedule the group session as a single calendar event. Reminders go to all group members. Session notes track the group as a unit, with individual comments as needed.

**Q: What if a student prefers email over WhatsApp?**
A: Use `gog` (Gmail) for email-based reminders instead of `whatsapp-cli`. You can mix communication channels per student — store the preferred channel in each student's profile and configure the reminder cron to use the appropriate channel.

**Q: Can the agent handle payments directly?**
A: If you install the `payment` skill, the agent can process payments through Stripe or CreditClaw with strict approval gates. However, most independent tutors find that generating invoice summaries (Recipe #7) and sending them via WhatsApp or email is simpler and avoids the complexity of payment processing infrastructure. Start with invoice generation and add direct payment processing only if manual collection becomes a bottleneck.

**Q: How do I handle public holidays and vacation periods?**
A: Block out holidays on your Teaching calendar in Google Calendar. The agent will exclude those dates from scheduling and skip reminders for cancelled sessions. For extended vacations, tell the agent: "I'm on vacation from [date] to [date]. Pause all lesson reminders and skip the daily briefing during this period."

**Q: Can the agent suggest lesson content?**
A: With the `tavily-web-search` and `summarize` skills, the agent can find and prepare teaching materials relevant to each student's current topic. Recipe #8 (Lesson Material Preparation) handles this. However, the agent suggests materials — you decide what is pedagogically appropriate for each student.

**Q: What happens when a student leaves?**
A: Archive the student's profile: move their file from `Teaching/Students/` to `Teaching/Students/Archive/`, remove their recurring calendar events, and keep their session notes for your records. If data privacy regulations apply, follow your data retention policy for deletion timelines.
