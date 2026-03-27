# Advanced OpenClaw Templates — OpenClaw Reference Guide

## What This Covers
This tutorial teaches power users how to create, customize, and chain advanced OpenClaw templates for repeatable workflows. You will learn how to build multi-skill templates, parameterize them for different contexts, and deploy them as reusable automation blueprints that save hours of repetitive configuration.

## Who This Is For
- Experienced OpenClaw users who have already installed and used at least 5-10 skills
- Technical users comfortable with YAML configuration, environment variables, and CLI tools
- Team leads who want to standardize OpenClaw workflows across their organization
- Power users who find themselves repeating the same multi-step setups and want to templatize them

## Prerequisites
- OpenClaw installed and running (v2.0+)
- At least 5 skills already installed and configured
- Familiarity with the `clawhub` CLI and basic skill management
- A working `skill-vetter` installation (security-first approach)
- Basic understanding of YAML syntax and environment variables
- Comfort with terminal/command-line usage

---

## Step-by-Step Walkthrough

### Step 1: Understand the Template Architecture

OpenClaw templates are structured configuration bundles that define which skills to install, how they connect, and what automation rules govern their behavior. A template consists of three layers:

1. **Skill manifest** — the list of skills to install
2. **Configuration layer** — environment variables, API keys, and skill-specific settings
3. **Automation rules** — cron schedules, triggers, and chaining logic

Before building templates, make sure your security stack is solid:

```
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard
```

These three form your minimum viable security stack and should be present in every template you build.

### Step 2: Build a Research Template

A research template bundles search, summarization, and note-taking into a single deployable unit. Start by defining the skills:

```
clawhub install tavily-web-search
clawhub install summarize
clawhub install obsidian
clawhub install arxiv-watcher
clawhub install exa-web-search-free
```

Configure each skill for research workflows. The `tavily-web-search` skill requires a `TAVILY_API_KEY`, which you should store in your OpenClaw environment config rather than hardcoding into any template file.

The `exa-web-search-free` skill provides developer-focused search without API costs, making it ideal for technical research queries. Pair it with `tavily-web-search` for broader coverage.

Set up `arxiv-watcher` to monitor specific research topics automatically. Configure keyword filters so only relevant papers surface in your daily digest.

### Step 3: Build a Communication Template

Communication templates standardize how the agent handles messaging across channels:

```
clawhub install gog
clawhub install slack
clawhub install whatsapp-cli
clawhub install agent-mail
clawhub install whatsapp-styling-guide
```

The `gog` skill handles Gmail, Calendar, Drive, Docs, and Sheets in one integration, making it the backbone of any communication template. Layer `agent-mail` on top for dedicated inbox triage and draft generation.

Add `whatsapp-styling-guide` to ensure all WhatsApp messages maintain professional formatting. This is a formatting-rules-only skill with no API key requirements.

### Step 4: Build a Business Operations Template

For business users, combine CRM, finance, and project management:

```
clawhub install hubspot
clawhub install bookkeeper
clawhub install financial-overview
clawhub install automation-workflows
clawhub install todoist
```

The `hubspot` skill requires a HubSpot API Key or Private App Token. The `bookkeeper` skill needs `MATON_API_KEY`, `DEEPREAD_API_KEY`, and Xero credentials for full invoice-to-accounting automation.

`automation-workflows` ties everything together by letting you build multi-step automations without code — if a new HubSpot contact is created, automatically create a Todoist task and send a welcome email.

### Step 5: Create a Security-Hardened Template

Every template should include a security layer, but for sensitive environments, build a dedicated security template:

```
clawhub install skill-vetter
clawhub install clawscan
clawhub install prompt-guard
clawhub install agentguard
clawhub install skill-scanner
clawhub install agentgate
clawhub install config-guardian
clawhub install claw-audit
clawhub install agent-audit-trail
clawhub install skills-audit
```

Run `claw-audit` after initial setup to get a security score and identify any configuration weaknesses. Schedule `skills-audit` monthly to catch permission drift as you add more skills over time.

### Step 6: Parameterize Your Templates

Templates become truly powerful when parameterized. Instead of hardcoding values, use environment variable references that get resolved at deployment time:

- Store API keys in your system environment or a secure vault
- Reference them by name in your template configuration
- Use different parameter sets for development vs. production deployments
- Keep a separate parameter file for each team member using the template

### Step 7: Chain Templates Together

Advanced users can compose templates by layering them. A "Full Business Stack" might combine:

1. The Security-Hardened Template (always first)
2. The Communication Template
3. The Business Operations Template
4. A custom monitoring template using `model-usage` to track API costs

Install `model-usage` to monitor token consumption across all connected AI providers:

```
clawhub install model-usage
```

This skill gives you visibility into which templates and workflows consume the most resources.

### Step 8: Add Self-Improvement to Templates

For templates that evolve over time, include the AI self-improvement skills:

```
clawhub install capability-evolver
clawhub install self-improving-agent
clawhub install memory-hygiene
```

The `capability-evolver` reviews session logs and autonomously improves agent behavior. The `self-improving-agent` logs errors and preferences into persistent local memory. Run `memory-hygiene` periodically to prune stale or contradictory entries.

### Step 9: Build a Data Analysis Template

For teams that make decisions from data, build a dedicated analytics template:

```
clawhub install data-analyst
clawhub install duckdb
clawhub install csv-toolkit
clawhub install gog
clawhub install summarize
```

The `data-analyst` skill covers SQL queries, spreadsheet analysis, and chart generation. The `duckdb` skill runs fast analytical queries on CSV, Parquet, and JSON files using the DuckDB CLI engine. The `csv-toolkit` skill wraps Miller, csvkit, and xsv for comprehensive text-data processing.

Together, they form a lightweight analytics stack that lets the agent:
- Query large datasets with SQL-level power
- Filter and reshape CSV files without loading them into the model context
- Generate visual charts and summary reports
- Pull data from Google Sheets via `gog` for collaborative analysis

For machine learning teams, add:
```
clawhub install hugging-face-datasets
clawhub install senior-data-scientist
```

The `hugging-face-datasets` skill manages dataset creation and versioning on Hugging Face. The `senior-data-scientist` skill guides the full data science workflow from exploratory analysis through model evaluation.

### Step 10: Build a DevOps and Infrastructure Template

For teams managing infrastructure, create a template that covers deployment and monitoring:

```
clawhub install docker-essentials
clawhub install github
clawhub install vercel
clawhub install cloudflare
```

The `docker-essentials` skill builds, tags, runs, and manages containers through natural language. The `vercel` skill connects to the Vercel CLI for deploy, rollback, and debugging. The `cloudflare` skill manages DNS, Workers, Pages, and security settings.

For cloud infrastructure management:
```
clawhub install aws-infra
clawhub install hetzner
clawhub install nginx-config-creator
```

The `aws-infra` skill guides AWS provisioning following best-practice patterns. The `hetzner` skill controls Hetzner Cloud VPS and networking. The `nginx-config-creator` generates production-ready reverse proxy configurations.

Always test infrastructure templates in sandbox environments first. These skills have shell-level access and can modify live systems.

### Step 11: Version and Share Templates

Once a template is stable, version it for reproducibility:

- Tag each template version with a date and changelog
- Document which skill versions were tested together
- Include a README with deployment instructions
- Share templates with your team through a shared repository
- Track which team members are using which template versions
- Maintain a rollback plan for every template version in production

When sharing templates across teams, strip all API keys and credentials. Use environment variable references so each team member inserts their own credentials at deployment time.

### Step 12: Test Templates in Isolation

Before deploying a template to production, test it in a sandboxed environment:

1. Install the template skills in a fresh OpenClaw instance
2. Run `clawscan` on every skill in the template
3. Run `claw-audit` to validate the full configuration
4. Execute each automation rule manually to verify behavior
5. Monitor with `agent-audit-trail` for unexpected actions
6. Run `skills-audit` to verify all permission levels are appropriate
7. Test with realistic but non-production data before going live
8. Have a second person review the template configuration before deployment

---

## Key Skills Used

| Skill | Purpose in Templates |
|---|---|
| `skill-vetter` | Pre-install security scanning for every skill in the template |
| `prompt-guard` | Runtime protection against prompt injection in external content |
| `agentguard` | Runtime behavioral guardrails blocking unintended actions |
| `tavily-web-search` | AI-optimized web search for research templates |
| `summarize` | Document and URL summarization across all template types |
| `gog` | Google Workspace integration for communication templates |
| `obsidian` | Local knowledge base for research templates |
| `automation-workflows` | Multi-step automation logic connecting skills together |
| `hubspot` | CRM integration for business templates |
| `model-usage` | API cost monitoring across template deployments |
| `capability-evolver` | Self-improvement for templates that evolve over time |
| `claw-audit` | Comprehensive security posture assessment |
| `memory-hygiene` | Maintenance of agent memory quality over time |

---

## Automation Examples

### 1. Daily Research Digest
Schedule `arxiv-watcher` and `tavily-web-search` to run every morning at 7 AM, pipe results through `summarize`, and save to `obsidian`:
```
cron: 0 7 * * * → arxiv-watcher → summarize → obsidian
```

### 2. Weekly Security Audit
Run `claw-audit` and `skills-audit` every Sunday at midnight to check for permission drift and configuration issues:
```
cron: 0 0 * * 0 → claw-audit → skills-audit → agent-mail (report)
```

### 3. Business Morning Briefing
Pull financial overview, CRM pipeline status, and unread emails at 8 AM on weekdays:
```
cron: 0 8 * * 1-5 → financial-overview + hubspot + gog → summarize
```

### 4. Monthly Memory Cleanup
Run `memory-hygiene` on the first of each month to prune stale agent memory:
```
cron: 0 2 1 * * → memory-hygiene → agent-audit-trail (log)
```

### 5. Real-Time Cost Monitoring
Check `model-usage` every 4 hours and alert via `slack` if daily spend exceeds threshold:
```
cron: 0 */4 * * * → model-usage → slack (if threshold exceeded)
```

---

## Tips and Best Practices

1. **Always start with security.** Every template should include `skill-vetter`, `prompt-guard`, and `agentguard` as non-negotiable foundations. Run `skill-vetter` on every skill before adding it to any template.

2. **Keep templates focused.** A template that tries to do everything becomes unmaintainable. Build small, composable templates (research, communication, finance) and layer them rather than creating monolithic configurations.

3. **Version your templates religiously.** Skills update, APIs change, and configurations drift. Tag every working template with a version number and date so you can roll back when something breaks.

4. **Monitor costs from day one.** Install `model-usage` in every template that makes API calls. Token costs compound quickly when multiple skills run on automated schedules.

5. **Test in isolation before production.** Deploy every template to a sandboxed OpenClaw instance first. Run `claw-audit` to validate security posture before connecting to live data or services.

---

## Common Gotchas

1. **API key conflicts across templates.** When layering templates, ensure environment variables do not collide. Two templates referencing different Google accounts through `gog` will conflict unless you namespace the credentials properly.

2. **Automation storms from chained cron jobs.** If Template A triggers an action that Template B monitors, you can create infinite loops. Always map your automation chains on paper before deploying and add circuit-breaker conditions.

3. **Memory bloat from self-improvement skills.** The `self-improving-agent` and `capability-evolver` skills accumulate data over time. Without regular `memory-hygiene` runs, the agent's context window fills with stale information that degrades performance rather than improving it.

---

## Next Steps

- Explore the `n8n-workflow-automation` skill for even more complex multi-step workflows
- Study the `agent-team-orchestration` skill for coordinating multiple specialized agents
- Review the `cc-godmode` skill for orchestrating multi-agent software projects
- Build a monitoring dashboard using `model-usage` and `agent-audit-trail` to track template performance over time
- Consider `auto-updater` to keep all skills in your templates current automatically
