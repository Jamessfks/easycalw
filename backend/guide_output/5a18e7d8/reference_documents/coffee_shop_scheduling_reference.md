# Reference: Coffee Shop Scheduling with OpenClaw

**Industry:** Small Business — Cafe / Coffee Shop
**Use Case:** Staff scheduling, shift reminders, roster management via WhatsApp
**Source Context:** Adapted from "How Small Businesses Can Use OpenClaw To Save Time" (ueni.com/blog, Peter O. Fonts, 2026-02-23) and OpenClaw platform documentation.

---

## Why Coffee Shops Struggle with Scheduling

Independent coffee shops face a specific scheduling problem: small teams (3–12 staff), variable shift patterns (opens early, peak hours, closes late), and high reliance on informal communication channels like WhatsApp group chats. Common failure modes:

- Owner manually texts each staff member their shifts every week
- Last-minute "can anyone cover Saturday?" messages create chain-reaction threads
- Staff forget their shifts because the roster is buried in a 200-message WhatsApp thread
- No confirmation loop — owner never knows if staff have seen the schedule

OpenClaw addresses all four problems by acting as the single point of truth for scheduling, connected directly to Google Calendar and WhatsApp.

---

## Core Capability Map

| Pain Point | OpenClaw Solution | Skills Used |
|---|---|---|
| Manual roster distribution | Weekly cron job posts roster to WhatsApp automatically | `gog` (Google Calendar), cron scheduler |
| Staff forget shifts | One-shot reminder cron jobs 24h before each shift | `gog`, cron + `apple-reminders` |
| "What time do I start?" questions | Assistant checks Google Calendar and replies instantly | `gog` |
| Unformatted messy messages | Styling guide enforces clean WhatsApp formatting | `whatsapp-styling-guide` |
| Owner needs to approve changes | Tier 2 autonomy — assistant proposes, owner approves | Autonomy config |

---

## Recommended SOUL.md Sections for Coffee Shops

The following domains should be explicitly defined in SOUL.md for a coffee shop deployment:

### Identity block
```
I am the scheduling assistant for [SHOP NAME]. My job is to manage staff rosters and answer shift questions — I do not handle payroll, cash, or customer complaints.
```

### Scheduling rules
```
1. Always check Google Calendar before answering any shift question.
2. Refer to shifts as: Name | Day | HH:MM–HH:MM (24h clock).
3. Do not schedule anyone for more than 8 hours without owner confirmation.
4. If a shift is unfilled, alert the owner — do not fill it automatically.
```

### Communication tone
```
- Brief: staff are usually checking between tasks
- Warm but professional: this is their livelihood
- Use WhatsApp bold (*text*) for names and times
- End roster messages with a confirmation request
```

### Hard limits
```
- Never share one staff member's contact details with another
- Never confirm a shift swap without owner approval (Tier 2 enforced)
- Never discuss wages, tips, or payroll
```

---

## Cron Job Patterns for Coffee Shop Scheduling

### Weekly roster (Sunday 6 PM)
```bash
openclaw cron add \
  --name "Weekly Roster" \
  --cron "0 18 * * 0" \
  --tz "YOUR_TIMEZONE" \
  --session isolated \
  --message "Pull this week's roster from Google Calendar. Format as: *Name* | Day | Start–End. List Mon–Sun. End with: 'Reply with your name to confirm you've seen your shifts.' Send via WhatsApp." \
  --announce \
  --channel whatsapp \
  --to "+YOUR_NUMBER"
```

### 24-hour shift reminder (daily, checks calendar for next-day shifts)
```bash
openclaw cron add \
  --name "Tomorrow Shift Reminder" \
  --cron "0 19 * * *" \
  --tz "YOUR_TIMEZONE" \
  --session isolated \
  --message "Check Google Calendar for tomorrow's shifts. For each staff member scheduled, draft a brief WhatsApp reminder: 'Hi [Name], reminder: you're on tomorrow [Day] [Start]–[End]. See you then! ☕'" \
  --announce \
  --channel whatsapp \
  --to "+YOUR_NUMBER"
```

### Morning owner briefing (6:30 AM weekdays)
```bash
openclaw cron add \
  --name "Morning Briefing" \
  --cron "30 6 * * 1-5" \
  --tz "YOUR_TIMEZONE" \
  --session isolated \
  --message "Today's briefing for the coffee shop: (1) Who is on shift today and when? (2) Any time-off requests or gaps? (3) Any reminders flagged for today? Keep to 5 bullet points max. WhatsApp format." \
  --announce \
  --channel whatsapp \
  --to "+YOUR_NUMBER"
```

---

## Skills Stack for Coffee Shop Scheduling

| Skill | Why | Install Command |
|---|---|---|
| `skill-vetter` | Security scan — install this FIRST before anything else | `clawhub install skill-vetter` |
| `gog` | Google Calendar + Gmail — reads/writes your roster | `clawhub install gog` |
| `apple-reminders` | Native iOS/macOS reminders for the owner | `clawhub install apple-reminders` |
| `whatsapp-styling-guide` | Professional formatting for all WhatsApp messages | `clawhub install whatsapp-styling-guide` |
| `whatsapp-cli` | Compose and send WhatsApp messages from agent | `clawhub install whatsapp-cli` |

---

## Cost Estimate for a Small Coffee Shop

Based on typical volumes (50–150 messages/day, 3 cron jobs/day):

| Component | Monthly Cost |
|---|---|
| Anthropic Claude Sonnet API | ~$10–20/month |
| OpenClaw | Free (self-hosted) |
| WhatsApp channel | Free (Baileys / WhatsApp Web) |
| Google Calendar API | Free (within Google free tier) |
| **Total** | **~$10–20/month** |

This compares to 10–15 hours/week of manual scheduling admin, which at even minimum wage is worth $150–$300/month in recovered time.

---

## Autonomy Tier Recommendation

For a basic-tech coffee shop owner, **Tier 2 (NOTIFY)** is the correct default:

- Agent spots a gap in the roster → sends Jordan a WhatsApp: "Tuesday 2–6 PM has no cover. Want me to message the team?"
- Agent asked to update a shift → replies: "I'll update Tom's Wednesday shift to 8 AM–2 PM. Confirm? Reply YES to approve."
- Agent never sends a group message without owner confirmation

This keeps Jordan in control while eliminating the manual legwork.

**Do not use Tier 4 (EXECUTE) for:**
- Any outbound message to staff
- Any calendar modification
- Any financial or payroll interaction

---

## Troubleshooting: Common Coffee Shop Issues

### "The assistant doesn't know who's working tomorrow"
- Check that `gog` is installed and Google Calendar is authorised
- Run `openclaw skills list | grep gog`
- Re-authorise: `clawhub auth gog`

### "Roster messages are messy / hard to read"
- Confirm `whatsapp-styling-guide` is installed
- Update SOUL.md to explicitly instruct formatting: "Always use *bold* for names, - bullets for each shift"

### "Messages don't arrive when my Mac is asleep"
- Install Amphetamine or run `caffeinate -i -w $(pgrep -f "openclaw") &` on startup
- WhatsApp Web sessions do not queue messages when the gateway is offline — use Telegram as a backup if 24/7 availability is needed

### "Staff keep asking the same questions"
- Add a FAQ block to SOUL.md with answers to: opening time, Wi-Fi password, allergen menu location, parking
- The assistant will answer from SOUL.md before doing a calendar lookup

---

*Reference document generated 2026-03-26 | OpenClaw Setup Guide Agent*
