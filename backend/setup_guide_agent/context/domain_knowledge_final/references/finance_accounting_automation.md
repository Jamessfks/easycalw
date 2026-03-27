# Finance & Accounting Automation — OpenClaw Reference Guide

## What This Does

This guide configures OpenClaw as a hands-off accounting assistant that ingests invoices,
categorizes expenses, reconciles bank transactions, and produces financial summaries on
demand. The agent monitors email for incoming invoices, extracts line items with OCR,
matches them against bank feeds, and flags anomalies — all without you opening a
spreadsheet or logging into your accounting software.

## Who This Is For

**Profile:** Small-business owners, solo accountants, bookkeepers, and freelancers who
handle their own finances.

**Industry:** Professional services, e-commerce, consulting, agency work — any operation
where invoices arrive by email and expenses need categorizing before month-end close.

**Pain point:** You spend 4-8 hours per week on data entry, reconciliation, and chasing
missing receipts. You know it could be automated but you have not had time to set it up.
By the time you get to reconciliation, transactions are stale and context is lost.

## OpenClaw Setup

### Required Skills

Install the security baseline first, then the finance stack:

```bash
# Security baseline (always first)
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard

# Core finance skills
clawhub install bookkeeper          # Invoice intake, OCR, accounting entries
clawhub install plaid               # Bank account linking, transaction feeds
clawhub install financial-overview  # Aggregated financial dashboard
clawhub install payment             # Guardrailed payment processing

# Supporting skills
clawhub install gog                 # Gmail + Google Sheets + Drive access
clawhub install agent-mail          # Dedicated inbox triage and prioritization
clawhub install summarize           # Summarize long financial documents
clawhub install pdf-toolkit         # Extract data from PDF invoices
clawhub install csv-toolkit         # Process bank statement CSVs
clawhub install data-analyst        # SQL queries, spreadsheet analysis, charts
```

### Optional Skills

```bash
clawhub install ga4-analysis        # If you track revenue via web analytics
clawhub install duckdb              # For heavy analytical queries on transaction data
clawhub install obsidian            # If you keep financial notes in Obsidian
clawhub install notion              # If you track finances in Notion databases
clawhub install esign-automation    # For signing vendor contracts
```

### Channels to Configure

| Channel | Purpose | Setup |
|---------|---------|-------|
| Gmail (via `gog`) | Receive invoices, send payment confirmations | Google OAuth — grant read + send |
| Plaid (via `plaid`) | Pull bank transactions daily | Link business checking + credit card accounts |
| Xero / Accounting (via `bookkeeper`) | Push categorized entries | Connect via `MATON_API_KEY` + Xero credentials |
| Google Sheets (via `gog`) | Monthly P&L and expense reports | Create a shared "Finance" folder in Drive |

### Hardware Recommendations

- **Minimum:** Any Mac with 8 GB RAM running macOS 14+. The finance skills are
  lightweight — the bottleneck is API calls, not local compute.
- **Recommended:** Mac Mini M2 or later with 16 GB RAM. Always-on power means cron
  jobs run reliably. Connect via Tailscale or SSH for remote access.
- **Storage:** 50 GB free for invoice PDFs, bank statement archives, and local DuckDB
  databases.

## Core Automation Recipes

### 1. Morning Invoice Intake

Scan Gmail every 30 minutes for new invoices and extract structured data:

```bash
openclaw cron add --every 30m "check Gmail for emails with PDF attachments or subject lines containing 'invoice', 'receipt', 'statement', or 'bill'. For each new one: extract vendor name, amount, date, and line items using OCR via bookkeeper. Save the structured data to the Finance Google Sheet and file the PDF in the Invoices Drive folder. Flag any invoice over $5,000 for manual review."
```

### 2. Daily Bank Reconciliation

Pull transactions and match them against recorded invoices:

```bash
openclaw cron add --every 24h --at 07:00 "pull all new transactions from Plaid for the last 24 hours. For each transaction, attempt to match it against an unreconciled invoice in the Finance Google Sheet by amount and vendor name. Mark matched pairs as reconciled. List any unmatched transactions and unmatched invoices in a summary and send it to me via Gmail."
```

### 3. Weekly Expense Categorization

Categorize uncategorized transactions:

```bash
openclaw cron add --every 7d --at "Monday 08:00" "review all uncategorized transactions from the past week in the Finance Google Sheet. Categorize each one using these categories: Software/SaaS, Office Supplies, Travel, Meals, Professional Services, Advertising, Utilities, Insurance, Payroll, Miscellaneous. If confidence is below 80%, flag it for manual review instead of guessing. Update the sheet with categories and send me a summary."
```

### 4. Monthly Financial Summary

Generate a P&L-style report at month end:

```bash
openclaw cron add --every 30d --at "1st 09:00" "generate a monthly financial summary for the previous month using data from the Finance Google Sheet. Include: total revenue, total expenses by category, net income, top 5 vendors by spend, month-over-month comparison, and any flagged anomalies (duplicate payments, unusually large expenses, missing invoices). Format it as a clean table and email it to me. Also save a copy as a PDF in the Monthly Reports Drive folder."
```

### 5. Duplicate Payment Detection

Catch accidental double-pays:

```bash
openclaw cron add --every 24h --at 18:00 "scan the Finance Google Sheet for potential duplicate payments — same vendor + same amount within a 7-day window. Also check for invoices paid but with no matching bank transaction (phantom payments). Report any findings via Gmail with the subject line 'ACTION REQUIRED: Potential duplicate payment detected'."
```

### 6. Vendor Spend Alerts

Get notified when spending with a vendor exceeds thresholds:

```bash
openclaw cron add --every 7d "check cumulative spend by vendor for the current month against these thresholds: AWS > $500, any single vendor > $2,000, total SaaS > $3,000. If any threshold is breached, send me a Gmail alert with the vendor name, current spend, threshold, and trend vs. last month."
```

### 7. Receipt Chaser

Follow up on missing receipts:

```bash
openclaw cron add --every 7d --at "Wednesday 10:00" "identify all bank transactions over $50 from the past 14 days that do not have a matching invoice or receipt in the Finance Google Sheet. Draft a polite follow-up email for each vendor requesting a copy of the receipt. Show me the drafts for approval before sending."
```

### 8. Tax Estimate Tracker

Quarterly estimated tax calculation:

```bash
openclaw cron add --every 90d --at "1st 09:00" "calculate estimated quarterly tax based on year-to-date net income from the Finance Google Sheet. Use the standard self-employment tax rate (15.3%) plus estimated income tax bracket. Compare against any estimated payments already made. Email me a summary with the recommended quarterly payment amount and IRS due date."
```

## Guardrails and Safety

### The Agent Must NEVER Autonomously:

1. **Initiate or authorize any payment.** The `payment` skill must always require
   explicit human approval before processing. Configure `agentguard` to block all
   payment write operations without confirmation.

2. **File tax returns or submit financial documents** to any government agency, bank,
   or regulatory body. The agent can prepare and draft, but a human must review and
   submit.

3. **Delete or modify historical financial records.** All changes to the Finance Google
   Sheet should be append-only. The agent should never overwrite or delete past entries.
   Configure `agentgate` for write protection on the master ledger.

4. **Share financial data externally.** No financial summaries, bank balances, or
   transaction details should be sent to anyone other than the account owner. Configure
   `agent-access-control` if multiple people interact with the agent.

5. **Reclassify expenses after month-end close.** Once a month is closed, the agent
   should treat those entries as immutable. Any corrections require human approval and
   should be recorded as adjusting entries, not edits.

6. **Connect to new bank accounts or financial services** without explicit human
   authorization. Plaid account linking must always be owner-initiated.

### Recommended Safety Configuration

```bash
# Block all payment operations without human approval
openclaw config set agentguard.block_patterns "payment.*write,payment.*send,payment.*transfer"

# Enable audit trail for all financial operations
clawhub install agent-audit-trail

# Run weekly security audit
openclaw cron add --every 7d "run claw-audit and report any anomalies in skill permissions or unexpected network calls"
```

## Sample Prompts

### Prompt 1: Initial Setup

```
You are my accounting assistant. Your job is to help me stay on top of invoices,
expenses, and bank reconciliation for my small business.

Rules:
- Never initiate payments without my explicit approval
- Never delete financial records — append-only
- Flag anything unusual rather than making assumptions
- Categorize expenses using standard business categories
- Always show your work when calculating totals

My fiscal year starts January 1. I use cash-basis accounting.
My business bank account is linked via Plaid. Invoices arrive in my Gmail.
Financial data lives in the Google Sheet called "2026 Finance Tracker" in my
Finance Drive folder.
```

### Prompt 2: Invoice Processing

```
Process all new invoices from my Gmail inbox. For each one:
1. Extract vendor name, invoice number, date, due date, line items, and total
2. Check if this vendor exists in my Finance Tracker sheet
3. Add the invoice to the "Unpaid Invoices" tab
4. If the due date is within 7 days, flag it as urgent
5. File the original PDF in Drive under Invoices/2026/[Month]/

Show me a summary when done. Do not pay anything.
```

### Prompt 3: Month-End Close

```
It is time for month-end close for [MONTH]. Please:
1. Verify all bank transactions are categorized
2. Reconcile all invoices against bank transactions
3. List any unreconciled items
4. Generate a P&L summary with category breakdowns
5. Calculate total outstanding receivables and payables
6. Compare this month vs. last month and highlight significant changes (>20%)

Save the report as a PDF and email it to me.
```

### Prompt 4: Vendor Analysis

```
Give me a breakdown of my top 10 vendors by total spend this quarter.
For each vendor, show: total spend, number of invoices, average invoice amount,
payment terms, and whether we have been paying on time. Flag any vendor where
our spend increased more than 30% compared to last quarter.
```

### Prompt 5: Cash Flow Forecast

```
Based on my current outstanding invoices (receivable) and unpaid bills (payable),
create a 30-day cash flow forecast. Start with my current bank balance from Plaid.
Show a day-by-day projection assuming invoices are paid on their due dates.
Highlight any days where the projected balance drops below $5,000.
```

## Common Gotchas

### 1. Plaid Token Expiration

Plaid access tokens for some banks expire every 90 days and require manual
re-authentication through the Plaid Link flow. The agent cannot re-authenticate
on its own. If you start seeing "ITEM_LOGIN_REQUIRED" errors in your daily
reconciliation reports, you need to re-link the account through Plaid's dashboard.

**Fix:** Set a calendar reminder every 80 days to check your Plaid connections.
Add a cron job that monitors for Plaid errors:

```bash
openclaw cron add --every 24h "check if any Plaid connections are returning errors. If so, send me a Gmail with the subject 'Plaid Re-authentication Required' and the affected bank name."
```

### 2. OCR Misreads on Scanned Invoices

The `bookkeeper` skill uses OCR to extract invoice data, but scanned or
photographed invoices (as opposed to native PDFs) frequently have extraction
errors — especially for amounts, dates, and vendor names with unusual formatting.

**Fix:** Always review the agent's extraction summary before marking invoices as
confirmed. Set a guardrail rule: if OCR confidence is below 90% on the amount
field, the agent must flag the invoice for manual review instead of recording it.

### 3. Category Drift Over Time

Without periodic review, the agent's categorization logic can drift. A vendor
that started as "Office Supplies" might now mostly sell "Software/SaaS" items.
The agent will keep using the original category unless corrected.

**Fix:** Run a quarterly category audit:

```bash
openclaw cron add --every 90d "review all vendor-to-category mappings. For each vendor, check if the assigned category still matches the majority of recent purchases. List any vendors where the category may be outdated and suggest corrections for my review."
```

## Scaling Up: When You Outgrow This Setup

### Adding a Dedicated Accounting Platform

This guide uses Google Sheets as the primary ledger, which works well for businesses
processing fewer than 200 transactions per month. If you are scaling beyond that:

- The `bookkeeper` skill supports Xero integration natively. Connect it with your
  `MATON_API_KEY` and `DEEPREAD_API_KEY` to push entries directly into Xero instead
  of Google Sheets.
- Use the `financial-overview` skill to aggregate data across Plaid, Xero, and Stripe
  into a single dashboard view — no more tab-switching.

### Multi-Entity or Multi-Currency

If you run multiple business entities or deal in foreign currencies, add these
considerations to your setup prompt:

- Specify which Plaid accounts belong to which entity.
- Set up separate Google Sheet tabs per entity or per currency.
- Add a "Currency" column to your Finance Tracker and instruct the agent to convert
  all amounts to your base currency for summary reports using current exchange rates
  via `tavily-web-search`.

### Team Access

If a bookkeeper or accountant needs to interact with the agent:

```bash
clawhub install agent-access-control
```

Configure tiered access so your accountant can query financial data and generate
reports but cannot modify categorization rules or payment thresholds. Only the
business owner should have full configuration access.

### Compliance and Audit Readiness

For businesses in regulated industries or those undergoing audits:

```bash
clawhub install agent-audit-trail
clawhub install skills-audit
```

The `agent-audit-trail` skill creates a tamper-evident, hash-chained log of every
action the agent takes. This is invaluable during audits — you can prove exactly
what the agent did, when, and why. Run `skills-audit` monthly to ensure no
permission drift has occurred in your installed skills.
