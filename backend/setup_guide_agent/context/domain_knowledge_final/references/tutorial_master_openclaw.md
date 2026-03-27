# Master OpenClaw — Advanced Power User Guide — OpenClaw Reference Guide

## What This Covers
This guide takes you beyond basic usage into advanced OpenClaw mastery. You will learn multi-skill orchestration, agent self-improvement loops, security hardening, performance optimization, cost management, and automation patterns that transform OpenClaw from a helpful assistant into an autonomous operating system for your digital life.

## Who This Is For
Power users who already have OpenClaw running with 5+ skills installed. You are comfortable with the terminal, understand API keys and OAuth flows, and want to push OpenClaw to its limits. You have been using OpenClaw for at least a few weeks and want to level up.

## Prerequisites
- A working OpenClaw installation with a configured AI model (paid or free-ride)
- At least 5 skills already installed and working
- Familiarity with cron syntax and basic shell scripting
- Comfort reading log output and debugging configuration issues
- A security stack installed (`skill-vetter`, `prompt-guard`, `agentguard`)

---

## Step-by-Step Walkthrough

### Phase 1 — Build Your Intelligence Layer

The difference between a basic OpenClaw setup and a mastered one is the intelligence layer: skills that make the agent smarter over time.

#### Step 1: Install the Self-Improvement Stack

```bash
clawhub install capability-evolver
clawhub install self-improving-agent
clawhub install memory-hygiene
```

What this stack does:
- `capability-evolver` reviews session logs and autonomously improves the agent's behavior. It identifies patterns in your usage and optimizes responses.
- `self-improving-agent` logs errors, learnings, and your preferences into a persistent local memory folder. The agent remembers what you like and avoids past mistakes.
- `memory-hygiene` cleans stale, contradictory, or outdated entries from the agent's memory. Without this, months of accumulated context makes the agent less accurate, not more.

#### Step 2: Configure Memory Pruning

Set up automatic memory hygiene on a weekly schedule:

```bash
openclaw cron add "0 2 * * 0 openclaw run 'Run memory-hygiene: prune contradictory entries, remove items older than 90 days with no references, and merge duplicate preferences'" --name weekly-memory-clean
```

This prevents context bloat. A clean memory is a fast memory.

#### Step 3: Enable Capability Evolution Logging

Tell the capability evolver what to optimize for:

```bash
openclaw config set EVOLVER_FOCUS="response_accuracy,task_completion_speed,preference_adherence"
```

The evolver will now track these metrics across sessions and suggest behavioral improvements.

---

### Phase 2 — Multi-Skill Orchestration

Power users chain skills together for compound workflows. Here are the patterns that matter.

#### Pattern 1: Research-to-Knowledge Pipeline

Install the full research stack:

```bash
clawhub install tavily-web-search
clawhub install arxiv-watcher
clawhub install pubmed-edirect
clawhub install summarize
clawhub install obsidian
clawhub install gno
```

Now create a compound workflow:

"Research the latest developments in [topic]. Search the web with tavily, check ArXiv for recent papers, search PubMed if it is a health topic. Summarize each source into 3 bullet points. Save a consolidated research note to my Obsidian vault with proper backlinks. Index the new note in gno for future search."

This pipeline replaces what would be 2 hours of manual research with a 3-minute conversation. The key insight: `gno` indexes the Obsidian output, so future queries can find this research without asking the agent to search the web again.

#### Pattern 2: Communication Hub

```bash
clawhub install gog
clawhub install slack
clawhub install whatsapp-cli
clawhub install agent-mail
clawhub install clawsignal
```

Orchestrate all communication through a single interface:

"Check all my channels — Gmail, Slack, WhatsApp. Summarize anything urgent. Draft replies for anything that has been waiting more than 24 hours. Send me a Signal alert if there is anything that needs immediate attention."

The `clawsignal` skill acts as your real-time notification layer for truly urgent items, while the agent handles routine communication in the background.

#### Pattern 3: Business Operations Stack

```bash
clawhub install hubspot
clawhub install bookkeeper
clawhub install ga4-analysis
clawhub install financial-overview
clawhub install data-analyst
```

Run your business from chat:

"Give me a Monday morning business report: new leads in HubSpot this week, outstanding invoices from bookkeeper, website traffic trends from GA4, and an overall financial snapshot."

This replaces 5 separate dashboard logins with one consolidated report.

---

### Phase 3 — Security Hardening

Basic security is `skill-vetter` + `prompt-guard` + `agentguard`. Advanced security adds layers.

#### Step 1: Full Security Stack

```bash
clawhub install clawscan
clawhub install skill-scanner
clawhub install claw-audit
clawhub install agentgate
clawhub install config-guardian
clawhub install agent-access-control
clawhub install skills-audit
clawhub install agent-audit-trail
```

#### Step 2: Configure Trust Tiers

With `agent-access-control`, set up tiered access:

- **Owner tier (you):** Full access to all skills and actions
- **Family tier:** Can ask questions and control smart home, but cannot send emails or make purchases
- **Guest tier:** Read-only access to weather and general questions

This matters if anyone else messages your agent through a shared interface.

#### Step 3: Enable Audit Trails

With `agent-audit-trail`, every action the agent takes is logged in a tamper-evident, hash-chained record. Configure it:

```bash
openclaw config set AUDIT_TRAIL_ENABLED=true
openclaw config set AUDIT_TRAIL_RETENTION_DAYS=365
```

#### Step 4: Automated Security Monitoring

```bash
openclaw cron add "0 3 * * * openclaw run 'Run claw-audit, scan all installed skills with skill-scanner, run skills-audit for permission drift, and report any findings'" --name nightly-security
```

This catches skills that behave normally at install time but turn malicious after gaining trust.

#### Step 5: Write Protection for Sensitive Operations

With `agentgate`, force human approval before any write operation:

```bash
openclaw config set AGENTGATE_WRITE_APPROVAL=true
```

The agent can read freely but cannot modify, send, or delete anything without your explicit sign-off.

---

### Phase 4 — Cost Optimization

Running many skills with paid AI models can get expensive. Here is how to optimize.

#### Step 1: Monitor Token Usage

```bash
clawhub install model-usage
```

Ask regularly: "Show me my AI token usage for the last 7 days, broken down by task type."

This reveals which workflows consume the most tokens. Often, a single verbose automation is responsible for 60% of costs.

#### Step 2: Route Strategically

```bash
clawhub install add-top-openrouter-models
clawhub install free-ride
```

Configure model routing based on task complexity:
- Simple tasks (weather, reminders, quick searches): route to free models via `free-ride`
- Complex tasks (research synthesis, code generation, contract review): route to premium models

```bash
openclaw config set MODEL_ROUTING="auto"
```

#### Step 3: Optimize Automation Frequency

Review your cron jobs and ask: does this really need to run every hour, or would daily suffice? Each cron execution burns tokens. A morning briefing running once per day is efficient; the same briefing running every hour is wasteful.

---

### Phase 5 — Advanced Automation Patterns

#### Pattern 1: Conditional Workflows

```bash
openclaw cron add "*/30 * * * * openclaw run 'Check my email for messages from @important-client.com. If any exist, summarize them and send me a Signal alert via clawsignal. Otherwise do nothing.'" --name client-monitor
```

The key is "otherwise do nothing" — this prevents unnecessary token usage when there is nothing to report.

#### Pattern 2: Multi-Agent Orchestration

```bash
clawhub install agent-team-orchestration
clawhub install cc-godmode
```

For complex projects, orchestrate multiple specialized agents:

"Set up a research team: Agent 1 searches the web for market data. Agent 2 analyzes the data with statistical methods. Agent 3 writes the report. Coordinate through agent-team-orchestration."

This pattern is powerful for large tasks that benefit from parallel execution with specialized focus.

#### Pattern 3: Workflow Automation Without Code

```bash
clawhub install automation-workflows
clawhub install n8n-workflow-automation
```

Build Zapier-style automations entirely through conversation:

"Create a workflow: When I receive an email with an attachment, save the attachment to Google Drive, OCR it if it is a PDF, and add a summary to my Obsidian vault."

The `n8n-workflow-automation` skill connects to a local n8n instance for complex multi-step flows without paying for automation SaaS.

---

### Phase 6 — Developer Power Tools

For users who also write code:

```bash
clawhub install github
clawhub install coding-agent
clawhub install debug-pro
clawhub install test-runner
clawhub install buildlog
clawhub install docker-essentials
```

Chain them for a complete development workflow:

"Clone the repo, create a feature branch, implement the changes described in issue #42, write tests, run them, build a Docker image, and create a PR with a summary of what was done. Log the session with buildlog."

---

## Key Skills Used

| Category | Skills |
|---|---|
| Intelligence | `capability-evolver`, `self-improving-agent`, `memory-hygiene` |
| Research | `tavily-web-search`, `arxiv-watcher`, `pubmed-edirect`, `summarize`, `obsidian`, `gno` |
| Communication | `gog`, `slack`, `whatsapp-cli`, `agent-mail`, `clawsignal` |
| Business | `hubspot`, `bookkeeper`, `ga4-analysis`, `financial-overview`, `data-analyst` |
| Security | `clawscan`, `skill-scanner`, `claw-audit`, `agentgate`, `config-guardian`, `agent-access-control`, `skills-audit`, `agent-audit-trail` |
| Cost | `model-usage`, `add-top-openrouter-models`, `free-ride` |
| Automation | `automation-workflows`, `n8n-workflow-automation`, `agent-team-orchestration`, `cc-godmode` |
| Developer | `github`, `coding-agent`, `debug-pro`, `test-runner`, `buildlog`, `docker-essentials` |

---

## Automation Examples

### Nightly Security + Memory Maintenance
```bash
openclaw cron add "0 2 * * * openclaw run 'Run claw-audit, memory-hygiene prune, and model-usage weekly summary'" --name nightly-maintenance
```

### Real-Time Client Monitoring
```bash
openclaw cron add "*/15 * * * 1-5 openclaw run 'Check email and Slack for messages from VIP contacts. Alert via clawsignal if any are urgent.'" --name vip-monitor
```

### Weekly Business Dashboard
```bash
openclaw cron add "0 8 * * 1 openclaw run 'Generate weekly business report: HubSpot leads, GA4 traffic, financial overview, outstanding invoices'" --name weekly-business
```

### Monthly Cost Audit
```bash
openclaw cron add "0 10 1 * * openclaw run 'Show model-usage cost breakdown for last month. Identify top 3 most expensive workflows. Suggest optimizations.'" --name monthly-cost-review
```

### Daily Knowledge Base Update
```bash
openclaw cron add "0 22 * * * openclaw run 'Save today key interactions, decisions, and learnings to Obsidian daily note. Index with gno.'" --name daily-kb-update
```

---

## Tips and Best Practices

1. **Memory hygiene is not optional.** After 3 months of heavy use, an uncleaned memory store degrades response quality noticeably. Schedule `memory-hygiene` weekly.

2. **Audit before you automate.** Any cron job that sends messages or makes changes should first be tested manually 5-10 times. Automation amplifies mistakes.

3. **Use conditional logic in automations.** "If X then Y, otherwise do nothing" saves significant token costs compared to unconditional executions.

4. **Review your security posture monthly.** Run `skills-audit` to check for permission drift. Skills you installed months ago may have updated with new capabilities you did not review.

5. **Keep a buildlog.** The `buildlog` skill records what the agent did during complex sessions. This is invaluable for debugging when something goes wrong in an automated workflow.

---

## Common Gotchas

1. **Capability evolver needs data.** It does not improve the agent on day one. Give it 2-3 weeks of regular usage before expecting meaningful behavioral improvements.

2. **Multi-agent orchestration is expensive.** Each agent in a team consumes its own token budget. Start with 2-agent teams and scale up only when the value justifies the cost.

3. **Config guardian can block legitimate changes.** If you install `config-guardian` and then try to update your OpenClaw config manually, it may flag your own changes as suspicious. Whitelist your own user before enabling it.

---

## Next Steps

- Master the intelligence layer first — `capability-evolver` + `self-improving-agent` + `memory-hygiene` is the foundation
- Build one compound workflow per week and refine it based on actual results
- Track your costs with `model-usage` and optimize aggressively
- Contribute back to the community: share your best automation patterns on the OpenClaw forums
- Consider building custom skills for workflows unique to your situation
