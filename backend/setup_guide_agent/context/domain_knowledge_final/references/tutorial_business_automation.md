# Business Process Automation with OpenClaw — OpenClaw Reference Guide

## What This Covers
This tutorial teaches you how to use OpenClaw to automate core business processes: lead management, invoice processing, client communication, project tracking, and financial reporting. Each section walks through a specific automation with real skill installations, configuration steps, and scheduling. By the end, you will have a functioning business automation stack that replaces hours of manual work daily.

## Who This Is For
- Small business owners and founders running operations with a small team
- Operations managers looking to automate repetitive processes
- Freelancers who handle their own admin, invoicing, and client management
- Sales professionals who want to reduce CRM data entry and follow-up overhead
- Business analysts seeking to automate reporting and data aggregation

## Prerequisites
- OpenClaw installed and running with security stack (`skill-vetter`, `prompt-guard`, `agentguard`)
- A Google Workspace account (Gmail, Calendar, Drive)
- Basic familiarity with OpenClaw skill installation
- API keys or accounts for specific business tools you want to connect (detailed per section)
- Understanding of your current business processes and where manual work creates bottlenecks

---

## Step-by-Step Walkthrough

### Step 1: Establish the Security Foundation

Business automation involves sensitive data — customer information, financial records, contracts. Your security stack must be comprehensive:

```
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard
clawhub install agentgate
clawhub install config-guardian
clawhub install agent-audit-trail
```

The standard trio (`skill-vetter`, `prompt-guard`, `agentguard`) is your baseline. For business use, add three more:

- **`agentgate`** forces a human approval step before any write operation. The agent can read your CRM, bank data, and email freely, but it cannot modify or send anything without your explicit sign-off.
- **`config-guardian`** validates configuration changes before they take effect, blocking silent modifications to sensitive files.
- **`agent-audit-trail`** maintains a tamper-evident, hash-chained log of every action the agent has ever taken. Essential for compliance and dispute resolution.

Run a security assessment:
```
clawhub install claw-audit
```

Execute `claw-audit` to get a security score and identify configuration weaknesses before connecting any business data.

### Step 2: Build the CRM Automation Pipeline

**The problem:** Sales teams spend 30-40% of their time on CRM data entry instead of selling.

Install your CRM integration:

```
clawhub install hubspot
clawhub install gog
clawhub install agent-mail
clawhub install whatsapp-cli
```

**For HubSpot users:** The `hubspot` skill reads and writes contacts, companies, deals, and owner assignments via the REST API. Requires a HubSpot API Key or Private App Token.

**For Salesforce users:** Replace `hubspot` with:
```
clawhub install salesforce
```
The `salesforce` skill queries and updates records via SOQL. Requires Salesforce Connected App credentials.

**For smaller teams:** Replace `hubspot` with:
```
clawhub install pipedrive
```
The `pipedrive` skill manages deals, contacts, activities, and pipeline stages. Requires a Pipedrive API Token.

The CRM automation workflow:
1. `agent-mail` scans incoming emails and identifies potential leads based on keywords and context
2. The agent qualifies leads using criteria you define (company size, industry, budget signals)
3. Qualified leads are automatically created in your CRM with relevant details populated
4. `gog` schedules a follow-up meeting or sends an introductory email
5. `whatsapp-cli` sends a personal WhatsApp message for high-priority leads

### Step 3: Build the Invoice Processing System

**The problem:** Manual invoice processing — receiving, reading, matching to POs, entering into accounting — takes 15-30 minutes per invoice.

```
clawhub install bookkeeper
clawhub install gog
clawhub install pdf-toolkit
clawhub install summarize
```

The `bookkeeper` skill automates pre-accounting: email invoice intake, OCR extraction, payment verification, and accounting entry creation via Gmail, Stripe, and Xero. It requires `MATON_API_KEY`, `DEEPREAD_API_KEY`, and Xero credentials.

The `pdf-toolkit` skill handles PDF operations — merge, split, compress, and extract text. Useful for processing invoice PDFs that arrive in various formats.

The invoice automation workflow:
1. `gog` monitors your inbox for incoming invoices
2. `bookkeeper` extracts invoice data using OCR (vendor, amount, due date, line items)
3. `pdf-toolkit` processes attachments as needed
4. The agent matches invoices to purchase orders or recurring expenses
5. Accounting entries are created in Xero automatically
6. A daily summary is generated via `summarize` showing all processed invoices

### Step 4: Build the Client Communication System

**The problem:** Business communication happens across email, WhatsApp, Slack, and phone. Messages fall through cracks. Follow-ups get missed.

```
clawhub install gog
clawhub install slack
clawhub install whatsapp-cli
clawhub install whatsapp-styling-guide
clawhub install agent-mail
clawhub install elevenlabs-agents
clawhub install mailchannels
```

Key skills:
- **`slack`** reads, posts, and manages Slack messages and channels. Requires Slack Bot Token.
- **`whatsapp-styling-guide`** enforces professional formatting on all WhatsApp messages. No API key needed.
- **`elevenlabs-agents`** gives OpenClaw a voice for phone-call interactions. Requires ElevenLabs API Key.
- **`mailchannels`** sends reliable transactional email with signed delivery. Requires MailChannels API Key.

The communication workflow:
1. All incoming messages across channels are surfaced in priority order
2. The agent drafts professional responses based on context and your communication history
3. Responses are routed through the appropriate channel (email for formal, WhatsApp for quick, Slack for internal)
4. `elevenlabs-agents` handles phone-based follow-ups when text fails to get a response
5. `mailchannels` sends transactional confirmations and automated follow-ups
6. Every communication is logged in your CRM automatically

### Step 5: Build the Project Management Automation

**The problem:** Project status updates, sprint management, and cross-tool synchronization consume hours of coordination time weekly.

Choose based on your project management tool:

**For engineering teams:**
```
clawhub install linear
clawhub install github
```
The `linear` skill manages issues, projects, and cycles. The `github` skill handles repos, issues, PRs, and branches. Together they keep code and project tracking in sync.

**For enterprise teams:**
```
clawhub install jira
```
Full Jira integration with JQL search, status transitions, and sprint management. Requires a Jira API Token.

**For cross-functional teams:**
```
clawhub install asana
```
Manages Asana tasks, projects, and sections. Requires an Asana Personal Access Token.

**For automation-heavy workflows:**
```
clawhub install n8n-workflow-automation
clawhub install automation-workflows
```

The `n8n-workflow-automation` skill provides chat-driven control of a local n8n instance for complex multi-step automations. The `automation-workflows` skill builds simpler if-then automations without external dependencies.

Project management automation workflow:
1. Standup updates are collected from team messages in `slack`
2. Project board statuses are updated automatically based on PR merges (`github`) or task completions
3. Blocked items trigger alerts to the responsible team member
4. Weekly status reports are generated from project data via `summarize`
5. Sprint retrospectives include automatically compiled metrics

### Step 6: Build the Financial Reporting System

**The problem:** Getting a clear picture of business finances requires opening multiple apps, downloading reports, and manually combining data.

```
clawhub install financial-overview
clawhub install plaid
clawhub install ga4-analysis
clawhub install data-analyst
clawhub install summarize
```

Key skills:
- **`financial-overview`** aggregates balance, transactions, invoices, and tax status into a single dashboard. Requires Norman Finance MCP server.
- **`plaid`** links bank accounts for balance and transaction queries. Requires `PLAID_CLIENT_ID` and `PLAID_SECRET`.
- **`ga4-analysis`** connects to Google Analytics 4 for website traffic insights. Requires GA4 API Key and Service Account JSON.
- **`data-analyst`** handles SQL queries, spreadsheet analysis, and chart generation. No API key needed.

The financial reporting workflow:
1. `plaid` pulls current bank balances and recent transactions
2. `financial-overview` aggregates all financial data into a unified view
3. `ga4-analysis` adds website performance metrics (traffic, conversions, revenue attribution)
4. `data-analyst` runs analysis and generates charts
5. `summarize` creates a plain-English weekly financial report

### Step 7: Build the Document and Contract Workflow

**The problem:** Contracts, proposals, and agreements require creation, review, signing, and tracking. Each step is manual and error-prone.

```
clawhub install esign-automation
clawhub install contract-review
clawhub install pdf-toolkit
clawhub install gog
```

Key skills:
- **`esign-automation`** automates document signing via eSignGlobal. Requires eSignGlobal API Key.
- **`contract-review`** provides AI-assisted contract analysis — surfaces key terms, obligations, deadlines, and red flags.
- **`pdf-toolkit`** handles PDF operations without external tools.

The document workflow:
1. Draft contracts and proposals using `gog` (Google Docs)
2. `contract-review` analyzes the document and flags key terms, obligations, and potential issues
3. `pdf-toolkit` converts and prepares the document for signing
4. `esign-automation` sends the document for e-signature and tracks signing status
5. Signed documents are filed in Google Drive via `gog`

### Step 8: Build the Marketing Automation Pipeline

**The problem:** Marketing requires consistent content creation, ad management, social monitoring, and analytics review.

```
clawhub install adwhiz
clawhub install canva
clawhub install bird
clawhub install presentation-maker
clawhub install image-generation
```

Key skills:
- **`adwhiz`** provides 44 tools for auditing, creating, and optimizing Google Ads campaigns. Requires Google Ads API credentials.
- **`canva`** creates and edits designs via the Canva Connect API. Requires Canva Connect API Key.
- **`bird`** monitors X (Twitter) feeds and tracks brand mentions. Requires X Developer API Key.
- **`presentation-maker`** generates slide decks from natural language.
- **`image-generation`** creates images from text prompts using DALL-E, Stable Diffusion, or Flux.

The marketing workflow:
1. `bird` monitors social media for brand mentions and competitor activity
2. `canva` and `image-generation` create branded marketing materials
3. `adwhiz` manages Google Ads campaigns — targeting, bids, copy, and audits
4. `presentation-maker` creates pitch decks and marketing reports
5. `ga4-analysis` tracks campaign performance

### Step 9: Connect Everything with Integration Tools

For businesses using many SaaS tools, a universal connector reduces complexity:

```
clawhub install composio
clawhub install api-gateway
```

The `composio` skill unlocks 860+ external service integrations through a single auth framework. Instead of configuring OAuth for each service individually, `composio` handles authentication centrally. Requires a Composio API Key (free tier available).

The `api-gateway` skill centralizes all external API connections with managed auth, rate limiting, and token management. Requires credentials for each connected API.

### Step 10: Monitor and Maintain the Automation Stack

Business automations need ongoing monitoring:

```
clawhub install model-usage
clawhub install skills-audit
clawhub install auto-updater
clawhub install agent-audit-trail
```

- **`model-usage`** tracks API token consumption and cost across all providers
- **`skills-audit`** runs periodic reviews of installed skill permissions
- **`auto-updater`** keeps all skills current with one command
- **`agent-audit-trail`** provides a tamper-evident log of all agent actions

Run `skills-audit` monthly and `claw-audit` quarterly. Review `model-usage` weekly to catch cost overruns early.

---

## Key Skills Used

| Skill | Business Function |
|---|---|
| `hubspot` / `salesforce` / `pipedrive` | CRM and sales pipeline management |
| `bookkeeper` | Automated invoice processing and accounting |
| `financial-overview` | Unified financial dashboard |
| `plaid` | Bank account integration and transaction queries |
| `gog` | Google Workspace — email, calendar, docs, sheets |
| `agent-mail` | Email triage, prioritization, and draft generation |
| `slack` | Internal team communication |
| `whatsapp-cli` | Client communication via WhatsApp |
| `esign-automation` | Electronic signature workflows |
| `contract-review` | AI-assisted contract analysis |
| `linear` / `jira` / `asana` | Project management |
| `adwhiz` | Google Ads campaign management |
| `composio` | Universal SaaS integration |
| `agentgate` | Human approval gates for write operations |
| `agent-audit-trail` | Compliance logging of all agent actions |

---

## Automation Examples

### 1. Lead-to-Deal Pipeline
Automatically process inbound leads through qualification to CRM entry:
```
trigger: new email (agent-mail) → qualify → hubspot (create contact + deal) → gog (schedule follow-up) → whatsapp-cli (personal welcome)
```

### 2. Daily Invoice Processing
Process all invoices received in the past 24 hours:
```
cron: 0 9 * * 1-5 → gog (invoice emails) → bookkeeper (OCR + extract) → pdf-toolkit (process) → summarize (daily report)
```

### 3. Weekly Financial Report
Generate a comprehensive weekly financial summary:
```
cron: 0 8 * * 1 → plaid (balances + transactions) + financial-overview + ga4-analysis → data-analyst (charts) → summarize → gog (email report)
```

### 4. Project Status Rollup
Compile cross-project status every weekday morning:
```
cron: 0 8 * * 1-5 → linear (active sprints) + github (open PRs) → summarize → slack (post to #status)
```

### 5. Monthly Security and Cost Review
Audit skills and review spending on the first of each month:
```
cron: 0 9 1 * * → claw-audit + skills-audit + model-usage (monthly summary) → summarize → gog (email to team)
```

---

## Tips and Best Practices

1. **Start with one process, not all of them.** Pick the business process with the highest manual time cost and automate that first. Common starting points are email triage (Step 2), invoice processing (Step 3), or CRM data entry (Step 2). Get one running well before adding the next.

2. **Always use `agentgate` for financial and CRM operations.** Any automation that writes to your CRM, sends money, or modifies financial records should require human approval via `agentgate`. The cost of a false positive (you approve something harmless) is zero. The cost of a false negative (the agent sends money or modifies customer records without approval) could be catastrophic.

3. **Keep `agent-audit-trail` running at all times.** For business operations, you need to be able to prove what the agent did and when. This is essential for tax audits, contract disputes, and compliance reviews. The hash-chained log is tamper-evident, so it carries real evidentiary weight.

4. **Review automated communications weekly.** Any automation that sends messages to clients, vendors, or partners should be reviewed weekly. Pull the `agent-audit-trail` logs for all outbound communications and verify tone, accuracy, and appropriateness.

5. **Separate personal and business skill configurations.** If you use OpenClaw for both personal and business tasks, keep the configurations separate. Use different Google accounts via `gog`, different CRM connections, and different communication channels. Mixing personal and business data creates compliance risks.

---

## Common Gotchas

1. **CRM data quality degrades without validation rules.** Automated lead creation sounds great until you realize the agent is creating duplicate contacts, missing required fields, or categorizing leads incorrectly. Define clear qualification criteria and test the automation with 10-20 manual examples before turning on auto-create. Use `agentgate` approval for the first month while you calibrate.

2. **Invoice OCR is not 100% accurate.** The `bookkeeper` skill does excellent OCR extraction, but unusual invoice formats, handwritten notes, and poor scan quality can produce errors. Always review extracted data before it flows into your accounting system. The daily summary from `summarize` should be your quality checkpoint.

3. **Multi-channel communication can become noisy.** When you automate communication across email, WhatsApp, Slack, and phone, clients may receive messages on multiple channels for the same topic. Define channel priority rules: one primary channel per client, with escalation to alternative channels only when the primary does not get a response within your defined timeframe.

---

## Next Steps

- Scale the CRM automation with `agent-team-orchestration` for multi-agent sales workflows
- Add `web-scraper-as-a-service` for competitive intelligence gathering
- Explore `brightdata` for structured data extraction from competitor websites
- Implement `payment` with CreditClaw for automated purchase processing with spending limits
- Build customer onboarding sequences combining `esign-automation`, `gog`, and `hubspot`
- Add `video-generation` and `canva` for automated marketing content production
- Consider `agent-access-control` to provide different team members with different agent permissions
