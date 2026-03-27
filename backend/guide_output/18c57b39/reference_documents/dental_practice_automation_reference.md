---
Title: OpenClaw for Dental Practices — Automation Reference
Prepared For: Dr. Priya Krishnamurthy, Bright Smile Dental
Date: 2026-03-26
Type: reference
---

# OpenClaw for Dental Practices — Automation Reference

This reference document is specific to Bright Smile Dental's deployment. Keep it alongside your setup guide as a working reference for ongoing configuration and expansion.

---

## Your Practice Context (Captured from Interview)

| Field | Detail |
|---|---|
| Practice Name | Bright Smile Dental |
| Locations | Lincoln Park, Chicago / Lakeview, Chicago |
| Total Staff | 12 (2 dentists, 3 hygienists, 4 dental assistants, 3 front desk) |
| Primary Pain Point | Front desk phone overload — 70% of time on calls |
| No-Show Rate | ~15% (industry average is 5–8% — significant revenue leak) |
| Practice Management Software | Dentrix |
| Scheduling/Calendar | Google Workspace (synced from Dentrix) |
| Communication | Telegram (staff), SMS preferred (patients — Phase 2) |
| Accounting | QuickBooks |
| Marketing Tracking | Google Sheets |
| Website | WordPress with contact form |
| AI Autonomy Decision | Zero patient-facing autonomy. Full autonomy for internal/staff operations. |

---

## Revenue Impact Estimates

### No-Show Recovery

Based on your reported 15% no-show rate:

| Metric | Estimate |
|---|---|
| Industry standard no-show rate | 5–8% |
| Your current rate | ~15% |
| Estimated daily appointments (2 locations) | 30–40 |
| Daily revenue lost to no-shows | $900–$1,200 (at $200/slot) |
| Annual no-show revenue loss | $234,000–$312,000 |
| Expected reduction from automated reminders | 30–50% |
| **Estimated annual revenue recovered** | **$70,000–$156,000** |

### Front Desk Time Recovery

| Metric | Estimate |
|---|---|
| Front desk staff spending 70% of time on phones | 3 coordinators × 70% = 2.1 FTE equivalent |
| Cost of that phone time | ~$2,500–$4,000/month in labor |
| Estimated reduction with AI-handled routine inquiries | 40–60% |
| **Estimated monthly labor cost recovery** | **$1,000–$2,400/month** |

### Total Annual ROI Estimate

| Cost | Amount |
|---|---|
| OpenClaw deployment (hardware already owned) | $0 additional hardware cost |
| Anthropic API usage | ~$10–20/month |
| Total ongoing cost | ~$120–240/year |
| **Conservative annual revenue + cost recovery** | **$85,000–$185,000** |

---

## HIPAA Compliance Architecture for This Deployment

### What This Agent Does (Compliant)

- Reads Google Calendar appointment data (scheduling metadata — names, times, locations)
- Sends summaries and draft reminders to your **private** Telegram DM
- Tracks no-shows from calendar data
- Pulls marketing metrics from your Google Sheets
- Drafts patient communication for **your review and approval**

### What This Agent Never Does (Guardrails)

- Never sends patient communication without your explicit approval
- Never stores or transmits Social Security numbers, insurance member IDs, or clinical treatment data
- Never shares one patient's information with any other patient or staff member who doesn't need it
- Never makes clinical recommendations, diagnoses, or treatment suggestions
- Never accesses QuickBooks data (financial records require separate access control review)
- Never responds to after-hours patient inquiries without surfacing them to you first

### HIPAA Risk Register for This Deployment

| Risk | Mitigation | Status |
|---|---|---|
| PHI passing through Anthropic API | Minimize patient name use in prompts; consider Ollama (Phase 2) for PHI-heavy queries | Monitor |
| Patient data in Telegram messages | All automated messages go to your private DM only; no automated patient-facing Telegram | Mitigated |
| Unauthorized staff access to bot | `allowlist` dmPolicy with numeric staff IDs only | Mitigated |
| Data at rest on Mac Mini | FileVault encryption required in Section 01 | Mitigated (requires your action) |
| Loss of audit trail | OpenClaw conversation logging always enabled | Mitigated |
| Runaway automation sending patient data | All patient-facing automations are NOTIFY-tier (draft + review) | Mitigated |

---

## Automation Expansion Recipes

### Phase 2 Automation: Supply Reorder Alert

You mentioned wanting supply reorder alerts. Once you create a Google Sheet for supply inventory, configure this:

```bash
openclaw cron add \
  --name "supply-reorder-check" \
  --cron "0 9 * * 1" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Check the supply inventory Google Sheet. Identify any items below their reorder threshold. Create a summary of what needs to be ordered and from which vendor if noted. Send the reorder list to the all-hands Telegram channel." \
  --announce \
  --channel telegram \
  --to "YOUR_ALLHANDS_TELEGRAM_CHAT_ID"
```

**Autonomy Tier: Tier 1 (AUTO)** — Dr. Krishnamurthy explicitly authorized internal staff operations for full autonomy. This posts directly to the all-hands channel.

### Phase 2 Automation: New Patient Inquiry Response

For when you add a patient-facing channel (Phase 2):

**Autonomy Tier: Tier 2 (NOTIFY) — ALWAYS for patient-facing actions**

```
When a new patient inquiry arrives via [patient channel]:
1. Acknowledge receipt immediately: "Thank you for reaching out to Bright Smile Dental. One of our team members will follow up within [X hours]."
2. Collect basic intake information: name, reason for visit, insurance provider, preferred location (Lincoln Park or Lakeview), preferred appointment times.
3. Check Google Calendar for available slots matching their preferences.
4. Draft a response with 2-3 available options.
5. Send the draft to Dr. Krishnamurthy for review and approval before responding.
NEVER book an appointment without explicit approval.
```

### Phase 2 Automation: 6-Month Recall Campaign

```bash
openclaw cron add \
  --name "weekly-recall-check" \
  --cron "0 10 * * 1" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Check Google Calendar for patients whose last appointment was 6 or more months ago and who have not yet been contacted for recall. Draft personalized recall messages for each patient (first name, mention of their last visit type if available, invitation to schedule their next cleaning or checkup). Present the complete draft list to me for review — DO NOT send anything yet." \
  --announce \
  --channel telegram \
  --to "YOUR_TELEGRAM_CHAT_ID"
```

---

## Staff Communication Guide

When your staff interact with the bot in group chats:

### What Staff Can Ask the Bot (Appropriate Uses)

- "What's tomorrow's schedule for Lincoln Park?"
- "Are there any unconfirmed appointments for Thursday?"
- "Draft a message to remind [patient name] about their 2 PM appointment tomorrow"
- "What supplies did we flag for reorder this week?"
- "Summarize this week's no-show rate"

### What Staff Should NOT Ask the Bot

- Specific clinical questions about patients
- Questions involving insurance billing details or payment information
- Requests to send patient communications without Dr. Krishnamurthy's approval
- Anything involving QuickBooks or financial data (not configured in Phase 1)

### How to Get the Bot's Attention in a Group

After setup, staff need to mention the bot by name in group chats for it to respond. Example:
- `@BrightSmileAssistantBot what's the schedule for tomorrow afternoon?`

---

## Integration Notes

### Dentrix ↔ Google Calendar Sync

OpenClaw works with Google Calendar, not Dentrix directly. For this to work:
1. Configure Dentrix to sync appointments to Google Calendar (check Dentrix's calendar integration settings — this is a standard feature)
2. Share the practice Google Calendar with the Google Workspace account you authorized with `gog`
3. The agent reads from Google Calendar — changes made in Dentrix will appear once synced

If Dentrix sync is not available, the agent can use `agent-browser` to log into the Dentrix web portal directly — this is a Phase 2 enhancement.

### Google Workspace Account Setup

The `gog` skill should be authorized with a **dedicated practice Google Workspace account**, not Dr. Krishnamurthy's personal account. This account should have:
- Read/write access to the shared Google Calendar for both locations
- Access to the marketing metrics Google Sheet
- A Gmail address (for `mailchannels` to use as the sender for recall emails)

---

## Glossary of Autonomy Tiers (Quick Reference)

| Tier | Name | What the Agent Does | Used For in This Deployment |
|---|---|---|---|
| Tier 1 | AUTO | Takes action immediately, no approval | Morning briefing, no-show summary, supply alerts |
| Tier 2 | NOTIFY | Drafts or summarizes, sends to you for review | Appointment reminder drafts, recall campaign drafts |
| Tier 3 | SUGGEST | Proposes an action and waits for your "go ahead" | Future Phase 2 patient-facing scheduling |
| Tier 4 | EXECUTE | Full autonomous execution | **Never for patient-facing, financial, or data-deletion tasks** |

---

## Emergency Contacts (Embed in Agent Context)

The agent should know these:

- **Crisis line:** 988 (Suicide & Crisis Lifeline)
- **Emergency:** 911
- **Dr. Krishnamurthy direct:** [Your personal Telegram ID — add during Prompt 1]
- **After-hours dental emergency:** [Your office's after-hours protocol]

---

*This reference document was generated alongside your OpenClaw setup guide. Update it as your deployment evolves.*
