# Architecture of Production Automations — OpenClaw Reference Guide

## What This Does

This guide documents five proven production automation architectures that OpenClaw power users have deployed for always-on, business-critical workflows. Unlike beginner guides that cover single-skill setups, this reference focuses on multi-skill orchestration patterns, fault tolerance, monitoring, and the operational practices that keep autonomous agents running reliably over weeks and months. Each architecture pattern is fully described with the specific skills, cron schedules, error-handling strategies, and security configurations required to run them in production.

## Who This Is For

**User profile:** Experienced OpenClaw users who have moved past experimentation and want to run the agent as a core part of their daily operations or business infrastructure. They have already installed and used 5-10 skills and are comfortable with cron scheduling, Google Sheets as a data layer, and multi-channel communication.

**Industry:** Cross-industry — applicable to solopreneurs, small business operators, freelancers, and technical professionals who want to move from "I use OpenClaw sometimes" to "OpenClaw runs key parts of my business autonomously."

**Pain point:** Most OpenClaw users hit a ceiling where individual automations work fine but combining them creates fragile, unpredictable behavior. Cron jobs conflict, context windows fill up, API rate limits cause silent failures, and there is no monitoring to catch when something breaks. This guide provides the patterns needed to build reliable, observable, production-grade automation systems.

**Technical comfort:** High. This guide assumes familiarity with OpenClaw concepts, skill installation, cron syntax, and basic troubleshooting. It is not a beginner resource.

---

## OpenClaw Setup

### Baseline Security Stack (Required for All Architectures)

Every production deployment must install these security skills first. Non-negotiable.

```bash
# Security — install in this exact order
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard
clawhub install agentgate
clawhub install agent-audit-trail
clawhub install claw-audit
clawhub install config-guardian
```

**Why all seven:** Production automations run unattended. A single compromised skill can execute actions for hours before anyone notices. `agent-audit-trail` provides the tamper-evident log needed to diagnose incidents after the fact. `config-guardian` prevents silent config drift that gradually weakens security posture. `claw-audit` gives you a periodic security health score. These three are optional for casual use but mandatory for production.

### Monitoring and Self-Improvement Stack

```bash
clawhub install model-usage             # Track API costs per automation
clawhub install self-improving-agent     # Persistent memory for learned patterns
clawhub install memory-hygiene           # Prevent stale context from degrading quality
clawhub install skills-audit             # Monthly permission drift review
clawhub install capability-evolver       # Optional: auto-improve agent behavior from session logs
```

### Hardware Requirements for Production

- **Minimum:** Mac Mini M2 with 16GB RAM, ethernet connection, UPS battery backup
- **Recommended:** Mac Mini M4 with 24GB RAM, ethernet, UPS, and a second machine as warm standby
- **Network:** Wired ethernet, not Wi-Fi. Production automations that depend on Wi-Fi will fail during router reboots, interference, or power cycles
- **Power:** A UPS (uninterruptible power supply) is essential. A 30-second power blip at 3am will kill all running cron jobs and the agent may not restart cleanly
- **Storage:** 256GB minimum SSD. Log files, audit trails, and cached data accumulate quickly in production
- **macOS settings:** Disable sleep, disable automatic updates during business hours, enable automatic login after power loss

---

## Core Automation Recipes

The recipes below are organized into five architecture patterns. Each pattern solves a different class of production problem.

---

### Architecture 1: The Inbox-Driven Business (Inbound Processing Pipeline)

**Pattern:** All business activity enters through email. The agent triages, routes, and processes inbound communication with structured escalation.

**Use cases:** Freelance consultants, property managers, small agencies, customer support.

**Required skills:**

```bash
clawhub install gog                     # Gmail monitoring and response
clawhub install agent-mail              # Dedicated triage inbox
clawhub install summarize               # Extract key info from lengthy emails
clawhub install automation-workflows    # Multi-step processing chains
clawhub install todoist                 # Task creation from email
clawhub install hubspot                 # CRM entry for new leads (optional)
clawhub install whatsapp-cli            # Urgent escalation channel
```

#### Recipe 1A: Continuous Inbox Triage

```bash
openclaw cron add --every 15m "Check the business inbox via gog for unread emails. For each email: (1) Use summarize to extract: sender, subject category (lead, support request, invoice, newsletter, spam), urgency level (high, medium, low), and a 2-sentence summary. (2) Apply labels in Gmail via gog: Leads, Support, Finance, Newsletter, or Review. (3) For HIGH urgency items, send an alert via whatsapp-cli with the sender name and summary. (4) For emails categorized as Leads, create a todoist task: 'Respond to lead from [sender] - [subject]' with a due date of today. (5) Log triage decisions in the Triage Log Google Sheet via gog."
```

#### Recipe 1B: Auto-Draft Responses for Common Patterns

```bash
openclaw cron add --every 30m "Check Gmail (via gog) for emails labeled 'Support' that are less than 1 hour old and have no draft reply. For each: (1) Check self-improving-agent memory for similar past queries and the approved response. (2) If a matching pattern exists, draft a response using the approved template. (3) If no pattern match, draft a response and mark it as '[NEW PATTERN - REVIEW]' in the subject. (4) Save all responses as Gmail drafts — never send automatically. (5) Send a WhatsApp summary via whatsapp-cli every 2 hours: '[N] responses drafted and ready for review.'"
```

#### Recipe 1C: Escalation Watchdog

```bash
openclaw cron add --every 1h "Check the Triage Log Google Sheet (via gog) for any email that was triaged more than 4 hours ago but has no response draft and no 'handled' flag. These are falling through the cracks. Send a consolidated escalation alert via whatsapp-cli: 'Attention: [N] emails have been waiting more than 4 hours with no response. Top priority: [sender] - [subject] ([urgency level]).' Include a maximum of 5 items per alert to avoid message fatigue."
```

---

### Architecture 2: The Multi-Channel Sales Engine (Outbound Coordination)

**Pattern:** The agent coordinates across CRM, email, and messaging to manage a sales pipeline with consistent follow-up cadence.

**Use cases:** B2B sales teams, real estate agents, insurance brokers, financial advisors.

**Required skills:**

```bash
clawhub install gog                     # Email for formal outreach
clawhub install hubspot                 # CRM pipeline management
clawhub install whatsapp-cli            # Informal follow-up channel
clawhub install tavily-web-search       # Prospect research
clawhub install summarize               # Summarize prospect company info
clawhub install automation-workflows    # Follow-up sequences
clawhub install data-analyst            # Pipeline analytics
```

#### Recipe 2A: Daily Pipeline Review

```bash
openclaw cron add --every day --at 08:00 "Query hubspot for all deals in the pipeline. For each stage (Prospecting, Qualified, Proposal Sent, Negotiation, Closed Won, Closed Lost): count the deals, sum the value, and identify the deal closest to its expected close date. Calculate the pipeline velocity (average days per stage this month vs last month). Send a morning briefing via whatsapp-cli with: total pipeline value, deals requiring action today, and any deals that have been stuck in the same stage for more than 7 days."
```

#### Recipe 2B: Automated Follow-Up Cadence

```bash
openclaw cron add --every day --at 09:30 "Check hubspot for deals where the last activity was more than 3 days ago in Prospecting stage, or more than 5 days ago in Qualified stage, or more than 7 days ago in Proposal Sent stage. For each: (1) Use tavily-web-search to check if there is any recent news about the prospect's company, (2) Draft a personalized follow-up email via gog that references the last conversation and any relevant news, (3) Save as a Gmail draft for review, (4) Update the deal's last activity date in hubspot to today, (5) Send a summary via whatsapp-cli: '[N] follow-up emails drafted for your review.'"
```

#### Recipe 2C: Win/Loss Analysis

```bash
openclaw cron add --every week --on friday --at 16:00 "Use data-analyst to analyze this week's sales activity from hubspot. Calculate: deals moved forward, deals moved backward, deals won (count and value), deals lost (count and value with reasons), average deal age by stage, and conversion rate between stages. Compare all metrics against the 30-day rolling average. Email the report via gog to the sales team distribution list. Highlight any metric that deviated more than 20% from the 30-day average."
```

---

### Architecture 3: The Content Operations Machine (Publish Pipeline)

**Pattern:** The agent manages a content creation pipeline from research through draft, review, and distribution across multiple channels.

**Use cases:** Newsletter publishers, content agencies, social media managers, blogger-entrepreneurs.

**Required skills:**

```bash
clawhub install gog                     # Google Docs for drafts, Gmail for distribution
clawhub install tavily-web-search       # Topic research and trend monitoring
clawhub install summarize               # Summarize source material
clawhub install arxiv-watcher           # Monitor academic research (for technical content)
clawhub install notion                  # Editorial calendar and content database
clawhub install canva                   # Visual asset creation
clawhub install youtube-summarizer      # Extract insights from video content
clawhub install automation-workflows    # Content pipeline orchestration
clawhub install agent-browser           # Publish to platforms
```

#### Recipe 3A: Daily Trend Scan

```bash
openclaw cron add --every day --at 06:30 "Use tavily-web-search to scan for trending topics in [your niche — e.g., AI, fintech, sustainability]. Check the top 5 results for each of 3 seed keywords. Use summarize to extract key themes and angles. Cross-reference against the editorial calendar in notion to avoid duplicating recent topics. Save the trend report to a 'Content Ideas' page in notion with today's date. Flag any topic that is trending AND has not been covered in the last 60 days as 'High Priority Idea.'"
```

#### Recipe 3B: Research Package Assembly

```bash
openclaw cron add --every day --at 10:00 "Check notion for any content pieces in 'Research' status. For each: (1) Use tavily-web-search to find 5-8 high-quality sources on the topic, (2) Use summarize to extract key data points, quotes, and statistics from each source, (3) If the topic is technical, check arxiv-watcher for recent relevant papers, (4) Use youtube-summarizer to find and summarize any relevant video content, (5) Compile everything into a 'Research Package' section on the content's notion page with properly attributed sources. Move the piece to 'Ready to Draft' status."
```

#### Recipe 3C: Distribution Checklist

```bash
openclaw cron add --every day --at 14:00 "Check notion for content pieces in 'Approved' status that have not yet been distributed. For each: (1) Create platform-specific versions: full article for blog, shortened summary for email newsletter, key quote + link for social, (2) Use canva to generate a social media graphic using the content's headline, (3) Draft the newsletter email in Gmail via gog, (4) Save all distribution assets to the content's notion page, (5) Move status to 'Ready to Publish.' Send a WhatsApp summary via whatsapp-cli: '[N] pieces ready to publish. Review and approve in Notion.'"
```

---

### Architecture 4: The Operations Dashboard (Business Intelligence)

**Pattern:** The agent aggregates data from multiple sources into a single daily operational picture, with automated anomaly detection.

**Use cases:** Small business owners, operations managers, e-commerce operators, SaaS founders.

**Required skills:**

```bash
clawhub install gog                     # Google Sheets as the data warehouse
clawhub install data-analyst            # Analysis and visualization
clawhub install duckdb                  # Fast analytical queries on local data
clawhub install csv-toolkit             # Data transformation
clawhub install financial-overview      # Financial data aggregation
clawhub install ga4-analysis            # Web traffic data
clawhub install tavily-web-search       # Market and competitor data
clawhub install whatsapp-cli            # Alert delivery
clawhub install automation-workflows    # Data pipeline orchestration
```

#### Recipe 4A: Morning Operations Digest

```bash
openclaw cron add --every day --at 07:00 "Compile the daily operations digest. Pull data from: (1) financial-overview for yesterday's revenue, expenses, and cash position, (2) ga4-analysis for yesterday's website traffic, top pages, and conversion rate, (3) The operations Google Sheet (via gog) for order fulfillment status, support ticket count, and open issues. Use data-analyst to compare each metric against its 7-day and 30-day averages. Flag anything that deviates more than 15% from the 30-day average as an anomaly. Format the digest and send via whatsapp-cli. Save the full data to the Daily Metrics sheet in Google Sheets."
```

#### Recipe 4B: Anomaly Alert System

```bash
openclaw cron add --every 2h "Run anomaly detection on key business metrics stored in the Daily Metrics Google Sheet (via gog). Use duckdb to query the last 30 days of data and calculate statistical bounds (mean plus/minus 2 standard deviations) for each metric. Check the most recent data point against these bounds. If any metric is outside bounds, send an immediate alert via whatsapp-cli: 'Anomaly detected: [metric name] is [value], which is [X]% [above/below] the normal range of [lower bound]-[upper bound]. Last 3 values: [v1, v2, v3]. Possible cause: [hypothesis based on correlated metrics].' Do NOT alert on the same anomaly more than once per 6 hours."
```

#### Recipe 4C: Weekly Competitive Intelligence

```bash
openclaw cron add --every week --on monday --at 09:00 "Use tavily-web-search to check for updates from top 5 competitors (listed in the Competitors sheet in Google Sheets via gog). Search for: new product launches, pricing changes, press releases, job postings (which indicate growth areas), and social media activity. Use summarize to condense findings. Compare against last week's competitive intelligence report stored in the sheet. Highlight anything that changed. Email the report via gog to the leadership team with subject 'Weekly Competitive Intelligence - [date]'."
```

---

### Architecture 5: The Self-Maintaining Agent (Meta-Automation)

**Pattern:** The agent monitors its own health, performance, and cost, and takes corrective action when things degrade.

**Use cases:** Any production deployment. This architecture is a meta-layer that runs on top of any of the other four patterns.

**Required skills:**

```bash
clawhub install model-usage             # API cost monitoring
clawhub install skills-audit            # Permission drift detection
clawhub install claw-audit              # Security posture scoring
clawhub install memory-hygiene          # Memory cleanup
clawhub install agent-audit-trail       # Action logging
clawhub install capability-evolver      # Self-improvement from session logs
clawhub install auto-updater            # Skill update management
clawhub install self-improving-agent    # Pattern learning
```

#### Recipe 5A: Daily Self-Health Check

```bash
openclaw cron add --every day --at 05:00 "Run a self-health check: (1) Use model-usage to report yesterday's total API cost, broken down by skill. Flag any skill that consumed more than 30% of the total. (2) Check agent-audit-trail for any failed actions in the last 24 hours. Categorize failures by type (API error, timeout, permission denied, rate limit). (3) Run memory-hygiene to identify and prune stale or contradictory memory entries older than 30 days. (4) Log all results to the Agent Health Google Sheet (via gog). (5) If total daily cost exceeded the budget threshold, or if failure rate exceeded 5%, send an alert via whatsapp-cli to the operator."
```

#### Recipe 5B: Weekly Security Audit

```bash
openclaw cron add --every week --on sunday --at 03:00 "Run a comprehensive security audit: (1) Execute claw-audit for a full security posture score. (2) Run skills-audit to check for permission drift across all installed skills. (3) Check config-guardian for any configuration changes since last week. (4) Use auto-updater to check for available skill updates — list them but do NOT install automatically. (5) Compile the results into a security report and email via gog to the operator. Include the security score, any flagged issues, pending updates, and recommended actions."
```

#### Recipe 5C: Monthly Performance Review

```bash
openclaw cron add --every month --on 1 --at 06:00 "Compile a monthly agent performance review from the Agent Health Google Sheet (via gog). Use data-analyst to calculate: (1) Total API cost for the month and trend vs previous months, (2) Total actions executed and failure rate, (3) Most expensive skills by token consumption, (4) Most common failure modes, (5) Memory growth (entries added vs pruned), (6) Cron job execution reliability (scheduled vs actually ran). Use capability-evolver to analyze session logs and suggest specific improvements. Email the report via gog with subject 'Monthly Agent Performance Review - [month/year]'."
```

---

## Guardrails and Safety

### Universal Production Rules

These guardrails apply to ALL five architecture patterns.

1. **Never auto-send external communications.** Drafts only. This applies to emails, WhatsApp messages to clients/prospects, and any content published to external platforms. Internal alerts to the operator are the sole exception.

2. **Never modify financial data without human approval.** Use `agentgate` to require explicit sign-off before any write operation to financial systems (HubSpot deal values, invoice amounts, payment records).

3. **Never install or update skills autonomously.** `auto-updater` checks for updates but does not install them. The operator reviews and approves all skill changes.

4. **Rate limit all external API calls.** Configure `agentguard` to block any single cron job from making more than 50 external API calls per execution. This prevents runaway loops from burning through API credits.

5. **Implement dead-man's switch monitoring.** If the agent has not logged a health check entry in the Agent Health sheet for more than 6 hours, something is wrong. Set up an external monitoring service (even a simple cron job on a different machine) to alert you.

6. **Never escalate access privileges.** The agent operates with the minimum permissions needed for each task. It must never request additional OAuth scopes, create new API keys, or modify its own configuration files. `config-guardian` enforces this.

7. **Preserve all audit logs for minimum 90 days.** `agent-audit-trail` logs must not be pruned or archived more frequently than quarterly. In a security incident, these logs are your forensic evidence.

### Recommended `agentguard` Configuration for Production

```
Block: Any action executing more than 50 external API calls in a single cron cycle
Block: Any action that modifies agent configuration files
Block: Any action that installs, uninstalls, or updates skills
Block: Any action sending external email without "draft" status
Block: Any action writing to financial systems without agentgate approval
Allow: Internal WhatsApp alerts to operator
Allow: Google Sheets read/write for operational data
Allow: Google Drive file storage
Allow: Read-only API queries to CRM, analytics, and data sources
```

---

## Sample Prompts

### Prompt 1: Production Readiness Audit

```
I have been running OpenClaw for 3 months with 12 skills installed. I want to move to a production setup. Please:
1. Run claw-audit and give me my current security score
2. Run skills-audit and flag any permissions that seem too broad
3. Check my current cron jobs and identify any that could conflict or create race conditions
4. Review my model-usage data from the last 30 days and tell me my average daily cost
5. Recommend which of the 5 architecture patterns in this guide best fits my current usage
```

### Prompt 2: Disaster Recovery Planning

```
Help me create a disaster recovery plan for my OpenClaw production setup:
1. List every skill I have installed and their configuration requirements (API keys, OAuth tokens, local dependencies)
2. Document my current cron schedule and all active automations
3. Export my self-improving-agent memory as a backup
4. Create a step-by-step restoration guide I could follow to rebuild this setup on a new Mac Mini from scratch
5. Estimate how long the full restoration would take
Save everything to a "Disaster Recovery" folder in Google Drive.
```

### Prompt 3: Cost Optimization

```
My OpenClaw API costs have been climbing. Analyze my usage:
1. Pull the last 60 days of cost data from model-usage
2. Identify which cron jobs are the most expensive
3. For each expensive job, analyze whether the frequency could be reduced without impacting business outcomes
4. Check if any jobs are doing redundant work (querying the same data multiple times)
5. Recommend specific changes to reduce costs by 30% while maintaining the same output quality
```

---

## Common Gotchas

### 1. Cron Job Pile-Up During Peak Hours

**Problem:** When multiple cron jobs are scheduled close together (e.g., five different automations all running at the top of each hour), they compete for the agent's context window and API rate limits. Jobs that normally complete in 3 minutes take 15 minutes because they are queued behind other jobs. If a job runs long enough to overlap with its next scheduled execution, the system creates duplicate actions — sending the same alert twice, creating duplicate CRM entries, or processing the same email multiple times.

**Fix:** Stagger cron schedules by at least 10 minutes. Never schedule two jobs at exactly the same time. Use the pattern: critical monitoring at :00, data collection at :15, processing at :30, reporting at :45. For jobs that should not run concurrently, add a lock-check step: "Before starting, check the Agent Health sheet for a 'running' flag for this job. If the flag exists and is less than 30 minutes old, skip this execution and log 'skipped - previous run still active.'" Clear the flag when the job completes.

### 2. Memory Bloat Degrades Quality Over Weeks

**Problem:** `self-improving-agent` accumulates memory entries continuously. After 4-8 weeks of production use, the agent's persistent memory can contain hundreds of entries, many of which are contradictory (an early entry says "the client prefers email" while a later entry says "the client switched to WhatsApp"), outdated (references to completed projects), or trivially specific (logging every single triage decision). This bloated context reduces response quality across all tasks because the agent wastes context window space processing irrelevant memories.

**Fix:** Run `memory-hygiene` weekly, not monthly. Configure it aggressively: prune entries older than 60 days unless they are tagged as "permanent." After each major project completion, manually review and archive project-specific memories. Set a hard cap: if total memory entries exceed 200, trigger an immediate cleanup before the next production cron cycle. Monitor memory entry count in the weekly health check and track it as a metric in the Agent Health sheet.

### 3. Silent API Failures Create Data Gaps

**Problem:** When an external API (Google Sheets, HubSpot, weather service) returns an error or times out, the cron job often completes "successfully" from the agent's perspective — it just skips the failed step and moves on. The daily operations digest shows all green because the agent reported on the data it could access, while silently omitting the data source that was down. These gaps compound: a week of missing weather data, three days of missed CRM updates, or hours of unprocessed emails — all invisible until someone manually checks.

**Fix:** Every cron job that reads from an external source must include an explicit verification step: "Confirm that you received data from [source]. If the response was empty, returned an error, or timed out, log the failure in the Agent Health sheet with the source name, error type, and timestamp. Do NOT proceed with partial data — instead, send a WhatsApp alert: 'Data source [name] is unavailable. Today's [report/process] is incomplete. Last successful pull: [timestamp].'" Review the Agent Health sheet failure log daily as part of the morning health check.

---

## Production Deployment Checklist

Before moving any architecture pattern to production, verify each item:

| Step | Check | Tool |
|------|-------|------|
| 1 | All 7 security skills installed and configured | `claw-audit` |
| 2 | Security score above 80/100 | `claw-audit` |
| 3 | All cron jobs staggered by at least 10 minutes | Manual review |
| 4 | `agentguard` rules configured for all write operations | Manual review |
| 5 | `agentgate` enabled for financial and PII operations | Manual review |
| 6 | `agent-audit-trail` logging to persistent storage | `agent-audit-trail` |
| 7 | `model-usage` baseline established (7 days of cost data) | `model-usage` |
| 8 | UPS installed and tested | Physical check |
| 9 | macOS sleep disabled, auto-login configured | System Preferences |
| 10 | External monitoring / dead-man's switch configured | Separate system |
| 11 | Disaster recovery documentation completed and tested | Google Drive |
| 12 | Weekly security audit cron job active | Cron schedule |
| 13 | Memory hygiene cron job active | Cron schedule |
| 14 | Operator alert channel tested (WhatsApp delivery confirmed) | `whatsapp-cli` |
| 15 | 72-hour burn-in period completed with no critical failures | Agent Health sheet |

---

## Related Guides

- `devops_autonomous_dev_agent.md` — For software engineering-specific production patterns
- `entrepreneurship_autonomous_business.md` — For the full autonomous business architecture
- `tutorial_solopreneur_macmini.md` — For the hardware setup walkthrough
- `tutorial_advanced_templates.md` — For template patterns used across architectures
