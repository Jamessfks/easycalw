# Finance Bill Reminders — OpenClaw Reference Guide

## What This Does

This guide sets up OpenClaw as a bill-tracking agent that monitors upcoming due dates,
sends reminders before bills are overdue, and keeps a centralized ledger of all recurring
and one-time obligations. The agent pulls bill data from email, bank feeds, and manual
entries, then proactively alerts you via your preferred channel (Gmail, WhatsApp, or
Apple Reminders) when payments are approaching or overdue.

## Who This Is For

**Profile:** Anyone who pays bills — individuals managing household finances, freelancers
juggling multiple subscriptions, small-business owners with vendor payment obligations,
or families coordinating shared expenses.

**Industry:** Universal. This is not industry-specific. If you have bills, this helps.

**Pain point:** Late fees from missed due dates. You have 15-30 recurring bills across
utilities, subscriptions, insurance, rent, credit cards, and vendor invoices. Some arrive
by email, some by mail, some auto-draft. You lose track, pay late, and eat unnecessary
fees. A $35 late fee on a $90 utility bill is a 39% penalty — and it happens more often
than you would like to admit.

## OpenClaw Setup

### Required Skills

```bash
# Security baseline
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard

# Core bill tracking
clawhub install gog                  # Gmail for bill emails + Google Sheets for tracking
clawhub install apple-reminders      # Native reminders on all Apple devices
clawhub install plaid                # Bank feeds to detect auto-pay charges
clawhub install bookkeeper           # Invoice/bill OCR extraction

# Notification channels
clawhub install whatsapp-cli         # WhatsApp alerts (optional)
clawhub install agent-mail           # Dedicated email triage for bills
```

### Optional Skills

```bash
clawhub install payment              # If you want the agent to help queue payments
clawhub install financial-overview   # Aggregated view of all obligations
clawhub install summarize            # Summarize lengthy billing statements
clawhub install pdf-toolkit          # Parse PDF bills and statements
clawhub install todoist              # If you prefer Todoist over Apple Reminders
clawhub install things-mac           # If you prefer Things 3 over Apple Reminders
clawhub install notion               # If you track bills in a Notion database
clawhub install telegram             # Telegram alerts instead of WhatsApp
clawhub install slack                # Slack alerts for business bill tracking
```

### Channels to Configure

| Channel | Purpose | Setup |
|---------|---------|-------|
| Gmail (via `gog`) | Ingest bill notifications, send reminder emails | Google OAuth |
| Apple Reminders (via `apple-reminders`) | Push due-date reminders to iPhone/Watch | macOS 14+ with iCloud sync |
| WhatsApp (via `whatsapp-cli`) | Urgent overdue alerts | WhatsApp Business API or local session |
| Google Sheets (via `gog`) | Master bill tracker spreadsheet | Shared "Bills" sheet in Drive |
| Plaid (via `plaid`) | Detect auto-pay charges, verify payments | Link checking + credit card accounts |

### Hardware Recommendations

- **Minimum:** MacBook or Mac Mini, macOS 14+, 8 GB RAM. Bill tracking is very
  lightweight — almost all processing is API-based.
- **Recommended:** Mac Mini M2 (always-on). Bill reminders only work if the machine
  is running. A laptop that sleeps at night will miss morning reminder windows.
- **Critical:** If using `apple-reminders`, the Mac must be signed into the same
  iCloud account as your iPhone. Reminders sync via iCloud, so the Mac needs to
  be online for reminders to propagate to your phone and watch.

## Core Automation Recipes

### 1. Daily Bill Scanner

Check email for new bills every morning:

```bash
openclaw cron add --every 24h --at 07:00 "scan Gmail for new emails containing bill notifications, payment due notices, or subscription renewal alerts from the last 24 hours. For each one, extract: biller name, amount due, due date, account number (last 4 digits only), and whether auto-pay is enabled. Add new bills to the Bills Google Sheet. If the due date is within 5 days and auto-pay is NOT enabled, create an Apple Reminder with a 2-day advance alert."
```

### 2. Three-Day Warning System

Proactive alerts before due dates:

```bash
openclaw cron add --every 24h --at 08:00 "check the Bills Google Sheet for any bills due in the next 3 days that are not marked as paid and do not have auto-pay enabled. For each one, send me a reminder via Apple Reminders with the title '[BILLER NAME] — $[AMOUNT] due [DATE]'. If any bill is due tomorrow or today, also send a WhatsApp message with the details."
```

### 3. Overdue Bill Escalation

Catch bills that slipped through:

```bash
openclaw cron add --every 24h --at 09:00 "check the Bills Google Sheet for any bills with a due date in the past that are not marked as paid. For each overdue bill, send a WhatsApp message: 'OVERDUE: [BILLER NAME] was due [DATE] for $[AMOUNT]. Please pay immediately to avoid late fees.' Also add a high-priority Apple Reminder. Mark the bill as 'overdue' in the sheet."
```

### 4. Auto-Pay Verification

Confirm auto-pay charges actually went through:

```bash
openclaw cron add --every 24h --at 10:00 "for all bills in the Bills Google Sheet marked as auto-pay, check Plaid transactions for the last 3 days to see if the expected charge appeared. If a matching transaction is found (same vendor, amount within 10%), mark the bill as paid and record the transaction date. If an auto-pay bill's due date has passed and no matching transaction is found, alert me via WhatsApp: 'AUTO-PAY MISSED: [BILLER NAME] $[AMOUNT] was expected but not found in bank transactions.'"
```

### 5. Weekly Bill Summary

A consolidated view of where you stand:

```bash
openclaw cron add --every 7d --at "Sunday 18:00" "generate a weekly bill summary from the Bills Google Sheet. Include: bills paid this week (with totals), bills due next week, overdue bills, and total monthly obligation remaining. Format as a clean table and email it to me via Gmail with the subject 'Weekly Bill Summary — [DATE RANGE]'."
```

### 6. Monthly Subscription Audit

Catch subscriptions you forgot about:

```bash
openclaw cron add --every 30d --at "1st 10:00" "review all recurring charges from Plaid for the past 30 days. Compare against the known bills in the Bills Google Sheet. Flag any recurring charge that is NOT in the sheet — these may be forgotten subscriptions. Also flag any bill in the sheet that did NOT have a corresponding bank transaction — it may have been cancelled. Send me the findings via Gmail with the subject 'Monthly Subscription Audit'."
```

### 7. Annual Bill Calendar

Build a 12-month view at the start of each year:

```bash
openclaw cron add --every 365d --at "Jan 2 09:00" "using the Bills Google Sheet, generate a 12-month bill calendar for the year. Include all recurring bills with their expected due dates and amounts for each month. Calculate total expected monthly outflow and annual total. Create a new tab called '[YEAR] Bill Calendar' in the sheet. Highlight months with unusually high obligations (insurance renewals, annual subscriptions, property taxes)."
```

### 8. New Bill Registration

A quick way to add bills by voice or text:

```bash
openclaw cron add --every 15m "check if I have sent any messages in the last 15 minutes starting with 'new bill:'. If so, parse the message to extract biller name, amount, due date, frequency (one-time, monthly, quarterly, annual), and whether auto-pay is on. Add it to the Bills Google Sheet and create appropriate Apple Reminders. Confirm back to me what was added."
```

## Guardrails and Safety

### The Agent Must NEVER Autonomously:

1. **Pay any bill.** The agent tracks and reminds — it does not pay. Even if the
   `payment` skill is installed, bill payment must always require explicit human
   approval with the exact amount and recipient confirmed in writing.

2. **Store full account numbers or banking credentials.** The Bills Google Sheet
   should only contain the last 4 digits of any account number. Full credentials
   must never appear in agent memory, sheets, or logs.

3. **Share bill information with third parties.** Bill amounts, due dates, and
   vendor relationships are private financial data. The agent should never include
   this information in any message to anyone other than the account owner.

4. **Automatically negotiate or dispute bills.** If the agent detects a rate
   increase or unexpected charge, it should flag it for human review — not
   initiate contact with the biller.

5. **Cancel subscriptions or services.** Even if asked to "cancel that subscription,"
   the agent should provide the cancellation method (link, phone number) but never
   execute the cancellation itself.

6. **Modify past payment records.** Historical payment data in the sheet should be
   treated as immutable once a month is closed.

### Recommended Safety Configuration

```bash
# Block payment operations
openclaw config set agentguard.block_patterns "payment.*write,payment.*send"

# Enable audit trail
clawhub install agent-audit-trail

# Restrict data sharing
openclaw config set agentguard.block_patterns "whatsapp.*send.*account_number,gmail.*send.*bank"
```

## Sample Prompts

### Prompt 1: Initial Setup

```
You are my bill reminder assistant. Your job is to track all my bills, remind me
before they are due, and alert me if anything is overdue.

Rules:
- Never pay bills for me — only remind
- Never store full account numbers — last 4 digits only
- Send reminders 3 days before due date via Apple Reminders
- Send urgent alerts on the due date via WhatsApp
- Escalate overdue bills daily until I mark them paid

My bills are tracked in a Google Sheet called "Bills Tracker" in my Finance folder.
Incoming bills arrive in my Gmail. My bank accounts are linked via Plaid.

For recurring bills, track the frequency (monthly, quarterly, annual) and
automatically generate future due dates.
```

### Prompt 2: Bulk Bill Import

```
I am setting up my bill tracker from scratch. Here are my recurring bills:

- Rent: $2,100/month, due 1st, no auto-pay
- Electric (ConEd): ~$120/month, due 15th, auto-pay ON
- Internet (Spectrum): $79.99/month, due 22nd, auto-pay ON
- Phone (T-Mobile): $85/month, due 7th, auto-pay ON
- Car Insurance (GEICO): $180/month, due 12th, auto-pay ON
- Health Insurance: $450/month, due 1st, no auto-pay
- Netflix: $15.49/month, due 8th, auto-pay ON
- Spotify: $10.99/month, due 14th, auto-pay ON
- iCloud+: $2.99/month, due 20th, auto-pay ON
- Property Tax: $3,200/quarter, due Mar 1, Jun 1, Sep 1, Dec 1, no auto-pay

Add all of these to the Bills Tracker sheet and set up Apple Reminders for each
non-auto-pay bill (3 days before and on the due date).
```

### Prompt 3: Monthly Review

```
Run my monthly bill review for [MONTH]:
1. Were all bills paid on time?
2. Did any auto-pay charges fail?
3. Were there any new recurring charges I have not registered?
4. What is my total monthly bill obligation?
5. Are there any bills with amounts that changed from last month?

Give me a clean summary I can review in 2 minutes.
```

## Common Gotchas

### 1. Apple Reminders Sync Delay

When the agent creates an Apple Reminder via `apple-reminders`, it syncs
through iCloud. If the Mac's internet connection is spotty, there can be a
5-30 minute delay before the reminder appears on your iPhone or Apple Watch.
This is fine for 3-day advance reminders but problematic for same-day alerts.

**Fix:** For urgent same-day alerts, always use WhatsApp (`whatsapp-cli`) or
email (`gog`) as a secondary channel. Do not rely solely on Apple Reminders for
time-critical notifications.

### 2. Bill Email Parsing Failures

Not all bill notification emails are structured the same way. Some billers send
HTML-heavy emails where the amount and due date are embedded in images or
dynamic content that the agent cannot parse. The agent may miss bills from these
vendors entirely.

**Fix:** For the first month of operation, manually verify that every expected
bill was captured. For billers whose emails the agent cannot parse, add those
bills manually to the Google Sheet as recurring entries and set their due dates
by frequency rather than relying on email detection.

### 3. Amount Variability in Auto-Pay Matching

The auto-pay verification recipe matches transactions by vendor name and amount.
But variable bills (electricity, water, phone with data overages) have different
amounts each month. The 10% tolerance window helps, but seasonal spikes (summer
AC bills, holiday data usage) can exceed that range and cause false "missed
auto-pay" alerts.

**Fix:** For variable-amount bills, increase the matching tolerance or switch to
vendor-name-only matching. You can also set expected amount ranges per biller
in the Google Sheet (e.g., "ConEd: $80-$200") so the agent knows what range
to expect.

## Advanced Configuration

### Shared Household Bill Tracking

If you share expenses with a partner, roommate, or family member, you can extend
this setup to track who owes what:

- Add a "Paid By" and "Split With" column to the Bills Google Sheet.
- Configure the agent to calculate running balances between household members at
  the end of each month.
- Use `whatsapp-cli` to send a monthly settlement summary to all parties.

Example prompt addition:

```
Bills marked "split" should be divided equally between me and [PARTNER NAME].
At the end of each month, calculate who owes whom and send us both a WhatsApp
summary with the net amount and direction of payment.
```

### Business Bill Tracking with Approval Workflows

For small businesses where bills need managerial approval before payment:

- Add an "Approval Status" column (Pending, Approved, Rejected) to the sheet.
- Configure the agent to send bills over a threshold (e.g., $500) to a manager
  via Slack (`slack`) or email for approval before adding them to the payment queue.
- Use `agentgate` to enforce that no bill can be marked as "Approved" without
  explicit human confirmation.

### Integration with Calendar

For bills that align with business cycles (quarterly taxes, annual renewals):

```bash
openclaw cron add --every 30d "sync all bill due dates for the next 60 days from the Bills Google Sheet to my Google Calendar via gog. Create all-day events for each bill with the title 'BILL DUE: [BILLER] $[AMOUNT]'. Update existing events if amounts or dates have changed. Do not create duplicate events."
```

### Notification Channel Preferences

Different urgency levels deserve different channels. Here is a recommended
escalation ladder:

| Time to Due Date | Channel | Urgency |
|------------------|---------|---------|
| 7+ days | Google Sheet only | Low — tracked but no notification |
| 3-7 days | Apple Reminders | Medium — gentle nudge |
| 1-2 days | Apple Reminders + Gmail | High — action needed soon |
| Due today | WhatsApp + Apple Reminders | Urgent — pay now |
| Overdue | WhatsApp (repeated daily) | Critical — late fees accumulating |

Configure this in your setup prompt so the agent uses the right channel at the
right time instead of sending every alert through every channel.
