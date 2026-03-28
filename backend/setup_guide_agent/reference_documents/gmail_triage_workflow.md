# Gmail Triage Workflow Reference

**For:** Eight's OpenClaw inbox agent
**Last updated:** 2026-03-27
**Purpose:** Quick reference for how the agent categorizes, surfaces, and acts on emails

---

## Categorization Decision Tree

```
Is a response expected from Eight today?
  YES → URGENT
  NO  → continue

Is it from a known individual (not bulk/automated)?
  YES + informational → FYI
  YES + requires action later → FYI with note
  NO  → continue

Does it have List-Unsubscribe headers or generic salutation?
  YES → NEWSLETTER
  NO  → FYI
```

---

## Triage Category Definitions

### URGENT
- Reply expected by someone waiting on Eight
- Deadline, booking, or payment involved
- Personal question or request addressed directly to Eight
- Time-sensitive language: "today", "urgent", "ASAP", "by end of day", "following up"
- Known contact who has messaged before

**Action:** Include full details + draft reply in morning digest

### FYI
- Updates, announcements from known contacts
- Receipts and confirmations Eight already initiated
- Threads where Eight was CC'd but is not primary recipient
- Good-to-know content requiring no response

**Action:** Count only in morning digest. Details on demand.

### NEWSLETTER
- Marketing, promotional, product updates
- Newsletter subscriptions, blog digests, app notifications
- Bulk sends (List-Unsubscribe present, generic salutations, BCC)

**Action:** Count only. Archive on Eight's instruction.

---

## Cron Schedule Reference

| Job | Schedule | Timezone | Purpose |
|---|---|---|---|
| `morning-gmail-digest` | `0 7 * * *` | America/Los_Angeles | Full 24h digest delivered to Telegram |
| `urgent-email-watch` | `0 9-18 * * 1-5` | America/Los_Angeles | Hourly urgent-only check, Mon–Fri |
| `daily-restart` | `0 4 * * *` | America/Los_Angeles | Memory cleanup, silent |

> Update timezone entries if Eight is not on Pacific Time.

---

## Morning Digest Template

```
[Day], [Date] — [X] Urgent, [Y] FYI, [Z] Newsletters

--- URGENT ---

From: [Sender Name] <sender@email.com>
Subject: [Subject Line]
Summary: [What they need] [Deadline if mentioned]
Draft reply:
  [3–5 sentence reply in Eight's voice]

[Repeat for each URGENT email]

--- STATUS ---
✅ All urgent items covered
— or —
⚠️ [X] item(s) need Eight's attention
```

---

## Reply Approval Sequence

Eight must follow this sequence to trigger a send:

1. Agent presents draft reply in Telegram
2. Eight reviews it
3. Eight says **"send"** or **"send it"** or **"confirmed"**
4. Agent displays the final draft one more time: "Sending this reply to [Name] — confirm?"
5. Eight says **"confirmed"** (second confirmation)
6. Agent sends via Gmail and reports: "Sent to [Name] at [time]"

**No email is ever sent on the first approval word alone.** Two-step confirmation is non-negotiable.

---

## Follow-Up Tracking Rules

| Condition | Agent Action |
|---|---|
| URGENT email unanswered 24h | Re-surface in next morning digest with "(Follow-up needed)" |
| Eight approved a draft, awaiting reply from sender | After 3 days, flag as "Awaiting reply" |
| Eight said "archive" or "not urgent" | Remove from active tracking. Do not re-surface unless sender follows up. |
| Eight said "remind me tomorrow" | Create one-shot cron reminder for next morning digest |

---

## Installed Skills Reference

| Skill | Purpose | Auth Required |
|---|---|---|
| `skill-vetter` | Pre-install security scanner | None |
| `prompt-guard` | Blocks prompt injection from email content | None |
| `agentguard` | Behavioral guardrails on autonomous actions | None |
| `gog` | Gmail, Calendar, Drive access | Google OAuth |
| `agent-mail` | AI email triage and reply drafting | SMTP/IMAP |
| `mailchannels` | Transactional email delivery | MailChannels API Key |

---

## Autonomy Tier Summary

| Tier | Label | What the Agent Can Do |
|---|---|---|
| Tier 1 | READ-ONLY | Access Gmail, read emails, check thread history |
| Tier 2 | NOTIFY (default) | Categorize, summarize, draft replies, deliver to Telegram |
| Tier 3 | SUGGEST | Present ranked recommended actions for Eight's choice |
| Tier 4 | EXECUTE | Send email — **requires explicit two-step approval per email** |

---

## Security Notes

- Gmail OAuth scope: read + draft only. Not send-without-approval.
- All secrets stored in macOS Keychain via `openclaw secret set`
- `prompt-guard` screens all email content before it reaches the model — prevents adversarial content in emails from hijacking agent behavior
- `agentguard` blocks any autonomous action not explicitly in the approved action list
- No email content forwarded to third parties
- Agent responds only to Eight's Telegram account (allowlist enforced)

---

## Useful Commands

```bash
# Check all cron jobs
openclaw cron list

# Run morning digest manually
openclaw cron run <morning-gmail-digest-job-id>

# Check Gmail auth status
openclaw skill status gog

# Re-authorize Gmail if OAuth expired
openclaw skill auth gog

# Check Telegram channel
openclaw channel list

# View agent logs
openclaw gateway logs -f

# Full security audit
openclaw security audit --deep

# Check memory usage
openclaw gateway status
```
