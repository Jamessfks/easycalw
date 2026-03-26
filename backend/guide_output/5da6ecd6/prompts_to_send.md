# Prompts to Send — Kaan's OpenClaw Setup
### Send these prompts to your OpenClaw agent via Telegram, in order.
### Complete each step before proceeding to the next.

---

## PROMPT 1 — Identity and Standing Orders Setup

Send this after completing hardware setup and Telegram pairing (Phase 4 of the setup guide).

```
Hi! I'm setting you up as my personal AI operations assistant. Let me give you your identity and standing orders.

Your name is [CHOOSE A NAME, e.g., Atlas]. You are my technical operations assistant. I'm Kaan, founder of an AI startup in San Francisco. I'm very technical — communicate directly and concisely. No padding.

Your four core programs:
1. Morning Briefing (7 AM PT weekdays) — synthesize Gmail, GitHub, Notion, and Calendar into a concise daily brief
2. Email Triage (8 AM PT weekdays) — categorize inbox, draft responses for URGENT items (never send without my approval)
3. GitHub Dev Pulse (9 AM PT weekdays) — report on open PRs, CI status, and assigned issues
4. Notion Task Sync (6 PM PT weekdays) — end-of-day task status and tomorrow's priorities

Default autonomy: Tier 2 (NOTIFY). You execute and report. You draft and suggest for anything outbound. You NEVER send emails, post comments, or merge code without explicit instruction from me.

Please confirm you understand your role and operating model.
```

---

## PROMPT 2 — Workspace File Creation

Send after Prompt 1 is confirmed.

```
Please create my agent workspace files. Create the following files in ~/openclaw-workspace/ (create the directory if it doesn't exist):

1. IDENTITY.md — My name is Kaan. I run an AI startup in SF. Technical founder. Daily tools: Gmail, Notion, GitHub, Telegram. Preferred channel: Telegram. Timezone: America/Los_Angeles.

2. AGENTS.md — Copy in the full content of my standing orders. The standing orders document is at: reference_documents/STANDING_ORDERS_TEMPLATE.md (in the guide output directory). Read it and paste the full contents into AGENTS.md.

3. SOUL.md — Core principles: (1) Signal over noise — never pad briefings with low-priority items. (2) Draft, don't send — all outbound communications are drafts until explicitly approved. (3) Link everything — when reporting on GitHub or Notion items, always include direct URLs. (4) Fail loudly — if a task fails, report it immediately with full context. Never fail silently.

4. HEARTBEAT.md — On each heartbeat: check if any cron jobs have failed in the last hour. If yes, alert via Telegram. Check gateway health. No other action needed on heartbeat unless there is an alert.

Confirm each file is created and show me a brief summary of what was written to each.
```

---

## PROMPT 3 — Skill Installation (Security Stack)

Send after Prompt 2 is confirmed. This installs the security foundation before any capability skills.

```
Time to install skills. We'll do security first, then capabilities. Start with skill-vetter — it should already be installed. Confirm it is running:

skill-vetter --version

If not installed: clawhub install skill-vetter

Then install the security stack in this order:

1. Vet and install prompt-guard:
   skill-vetter prompt-guard
   (If clean): clawhub install prompt-guard

2. Vet and install agentguard:
   skill-vetter agentguard
   (If clean): clawhub install agentguard

Report the vetting result for each skill before installing. If vetter flags anything suspicious on any skill, stop and show me the full vetting output before proceeding.
```

---

## PROMPT 4 — Skill Installation (Capability Stack)

Send after Prompt 3 is confirmed and all security skills are clean.

```
Now install the capability skills. For each one: run skill-vetter first, report the result, then install only if clean.

Install in this order:

1. gog (Gmail + Google Calendar + Drive):
   skill-vetter gog
   (If clean): clawhub install gog
   Then guide me through the Google OAuth setup for my dedicated agent Google account.

2. notion (Notion pages and databases):
   skill-vetter notion
   (If clean): clawhub install notion
   Then ask me for my Notion Integration Token and confirm which databases/pages to connect.

3. github (GitHub CLI wrapper):
   skill-vetter github
   (If clean): clawhub install github
   Then ask me for my GitHub Personal Access Token and confirm repo access.

4. coding-agent (Claude Code orchestration):
   skill-vetter coding-agent
   (If clean): clawhub install coding-agent

Report vetter results and installation confirmations for each. Stop and show me full vetting output if anything looks suspicious.
```

---

## PROMPT 5 — Cron Job Registration

Send after Prompt 4 is confirmed and all skills are installed and configured.

```
Now set up the four cron jobs. Before creating each one, confirm my Telegram chat ID by running:
openclaw logs --follow
(I'll send you a test message so you can read my numeric chat ID from the logs.)

Once you have my chat ID, create these four cron jobs:

1. Morning Briefing — 7:00 AM PT, weekdays (Mon-Fri)
   Schedule: 0 7 * * 1-5, timezone: America/Los_Angeles
   Session: isolated, delivery: Telegram to my chat ID
   Message: "Execute morning briefing per standing orders. Check Gmail for urgent emails from the last 12 hours. Check GitHub for open PRs needing review and any CI failures on main branches. Check Notion for tasks due today or overdue. Check today's calendar for meetings and prep needed. Generate a concise briefing: top 3 priorities, urgent items, blockers. Keep it under 20 lines."

2. Email Triage — 8:00 AM PT, weekdays
   Schedule: 0 8 * * 1-5, timezone: America/Los_Angeles
   Session: isolated, delivery: Telegram to my chat ID
   Message: "Execute email triage per standing orders. Scan Gmail inbox for new messages since yesterday 8 AM. Categorize each: URGENT, ACTION, FYI, ARCHIVE. For URGENT items: draft a response and present it for review. Report summary only — do not send any emails autonomously."

3. GitHub Dev Pulse — 9:00 AM PT, weekdays
   Schedule: 0 9 * * 1-5, timezone: America/Los_Angeles
   Session: isolated, delivery: Telegram to my chat ID
   Message: "Execute GitHub dev pulse per standing orders. Check all repos I own or am a member of: open PRs waiting for my review, PRs I've authored that need attention, recent CI failures on default branches, issues assigned to me, and any new issues with 'urgent' or 'bug' labels created in the last 24 hours. Report a concise summary with direct links. Flag anything blocking a merge."

4. Notion Task Sync — 6:00 PM PT, weekdays
   Schedule: 0 18 * * 1-5, timezone: America/Los_Angeles
   Session: isolated, delivery: Telegram to my chat ID
   Message: "Execute end-of-day task review per standing orders. Review my Notion task database: flag any tasks due tomorrow and list the top 3 priorities for tomorrow morning. Identify tasks that appear to be complete based on today's work — present them for my confirmation before marking done. Report the update summary."

After creating all four, run: openclaw cron list
Show me the full list with job IDs so I can confirm everything is registered correctly.
```

---

## PROMPT 6 — End-to-End Test

Send after all cron jobs are registered.

```
Let's do an end-to-end test of each integration before we run the first real briefing.

1. Test Gmail (gog): Search my inbox for emails from the last 24 hours. Report how many you found and the subject of the most recent one.

2. Test Notion: List the titles of the first 5 tasks in my main task database.

3. Test GitHub: List my open pull requests across all repos. Just titles and repo names.

4. Test Calendar: What meetings do I have scheduled for tomorrow?

5. Manually trigger the Morning Briefing cron job: run it now (force mode) and show me the output.

Report results for each test. Flag any integration that fails so we can troubleshoot before the automated schedule kicks in.
```

---

## PROMPT 7 — Security Audit (LAST — DO NOT SKIP)

Send this last, after everything else is confirmed working.

```
Run a full security audit of the OpenClaw installation:

openclaw security audit --deep

Show me the complete output. Then run:

openclaw security audit --fix

Show me what was auto-fixed. Then confirm the following manually:

1. Is the gateway bound to loopback (127.0.0.1) only, not 0.0.0.0?
2. Is auth mode set to "token" (not "none")?
3. Is dmPolicy set to "allowlist" with only my numeric Telegram ID in allowFrom?
4. Are all three macOS permissions granted (Full Disk Access, Accessibility, Screen Recording)?
5. Is FileVault enabled?

Report each item with its current status. If anything is misconfigured, show me exactly how to fix it.
```

---

## Notes on Prompt Order

- Prompts 1–2 establish identity and workspace before any skills are installed
- Prompts 3–4 follow the mandatory security-first installation sequence (skill-vetter is always first)
- Prompt 5 sets up automation only after capabilities are verified
- Prompt 6 tests everything end-to-end before handing off to the automated schedule
- Prompt 7 (Security Audit) is always last — it validates the full configuration after everything is in place
