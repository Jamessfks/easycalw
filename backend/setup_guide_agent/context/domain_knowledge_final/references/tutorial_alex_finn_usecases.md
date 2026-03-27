# Practical OpenClaw Use Cases (Alex Finn Style) — OpenClaw Reference Guide

## What This Covers
This guide presents a collection of practical, real-world use cases for OpenClaw, each with specific skill combinations and step-by-step setup instructions. Inspired by Alex Finn's hands-on demonstration style, every use case is something you can build and start using today. Each one solves a concrete problem that real people encounter in their daily lives and work.

## Who This Is For
- OpenClaw users at any level looking for inspiration on what to build
- People who have installed OpenClaw but are not sure what to do with it beyond the basics
- Professionals exploring whether OpenClaw can solve specific problems in their workflow
- Anyone who learns best by seeing practical examples before diving into theory

## Prerequisites
- OpenClaw installed and running
- Security stack installed (`skill-vetter`, `prompt-guard`, `agentguard`)
- Willingness to install additional skills as each use case requires
- Some use cases require API keys — each one lists its specific requirements

---

## Step-by-Step Walkthrough

### Use Case 1: The Personal News Briefing

**Problem:** You spend 30-45 minutes every morning scanning news sites, social feeds, and industry sources to stay informed. Most of what you read is noise.

**Skills needed:**
```
clawhub install tavily-web-search
clawhub install summarize
clawhub install obsidian
clawhub install brave-search
```

**How it works:**
1. Define 3-5 topics you need to track (e.g., "AI regulation," "fintech acquisitions," "remote work trends")
2. `tavily-web-search` runs structured searches on each topic daily
3. `brave-search` supplements with privacy-first results that surface different sources
4. `summarize` condenses all results into a single 2-minute read
5. `obsidian` stores the briefing with date tags for historical reference

**Time saved:** 25-35 minutes per day. Instead of scanning 10 sources, you read one curated digest.

**API requirements:** `TAVILY_API_KEY` (Tavily account). `brave-search` works without a key for basic queries.

---

### Use Case 2: The Meeting Preparation Machine

**Problem:** You have 4-6 meetings per day and walk into half of them without proper context. You forget what was discussed last time, what the attendees care about, and what you agreed to do.

**Skills needed:**
```
clawhub install gog
clawhub install summarize
clawhub install obsidian
clawhub install todoist
```

**How it works:**
1. `gog` reads your calendar 30 minutes before each meeting
2. It extracts the meeting agenda, attendee list, and any linked documents
3. `summarize` processes attached documents into key points
4. `obsidian` is searched for previous meeting notes with the same attendees
5. `todoist` is checked for any open tasks related to the meeting topic
6. You receive a brief: attendee context, document summaries, prior commitments, and suggested talking points

**Time saved:** 10-15 minutes per meeting, plus significantly better meeting outcomes.

**API requirements:** Google OAuth for `gog`, `TODOIST_API_TOKEN` for `todoist`.

---

### Use Case 3: The Content Creator's Research Assistant

**Problem:** Creating quality content (blog posts, videos, presentations) requires hours of research, source-finding, and synthesis. Most of that time is spent gathering, not creating.

**Skills needed:**
```
clawhub install tavily-web-search
clawhub install exa-web-search-free
clawhub install youtube-summarizer
clawhub install summarize
clawhub install obsidian
clawhub install arxiv-watcher
```

**How it works:**
1. Define a content topic or title
2. `tavily-web-search` and `exa-web-search-free` gather articles and technical references
3. `youtube-summarizer` processes related video content for additional perspectives
4. `arxiv-watcher` surfaces academic papers if the topic has research backing
5. `summarize` condenses everything into structured research notes
6. `obsidian` stores the research with bidirectional links to related content

**Time saved:** 2-3 hours per piece of content. Research that took an afternoon now takes 20 minutes.

**API requirements:** `TAVILY_API_KEY`. Others are free.

---

### Use Case 4: The Freelancer's Client Communication Hub

**Problem:** As a freelancer, you communicate with clients across email, WhatsApp, Slack, and sometimes Telegram. Messages fall through the cracks. Follow-ups get forgotten.

**Skills needed:**
```
clawhub install gog
clawhub install whatsapp-cli
clawhub install slack
clawhub install telegram
clawhub install whatsapp-styling-guide
clawhub install todoist
```

**How it works:**
1. All incoming client messages across channels are surfaced to you in one place
2. The agent drafts professional replies with `whatsapp-styling-guide` formatting for WhatsApp
3. When a client message contains an action item, `todoist` automatically creates a task
4. Follow-up reminders are generated for messages that need a response within 24 hours
5. `gog` handles email communication and calendar scheduling

**Time saved:** 45 minutes per day on message management, plus zero missed follow-ups.

**API requirements:** Google OAuth, WhatsApp Business API or local CLI session, Slack Bot Token, Telegram Bot Token, `TODOIST_API_TOKEN`.

---

### Use Case 5: The Health-Conscious Daily Tracker

**Problem:** You want to track your health metrics, meals, and activity but find it tedious to use multiple apps. You have an Apple Watch collecting data you never look at.

**Skills needed:**
```
clawhub install apple-health-skill
clawhub install healthy-eating
clawhub install summarize
clawhub install obsidian
```

**How it works:**
1. `apple-health-skill` queries your Apple Health data — workouts, heart rate, activity rings, VO2 Max
2. `healthy-eating` handles meal logging through natural conversation (no calorie obsession)
3. `summarize` creates a daily health digest combining activity and nutrition data
4. `obsidian` stores daily logs for trend tracking over weeks and months

You can ask things like:
- "How did my running improve this month?"
- "Log lunch: grilled chicken salad with olive oil dressing"
- "Compare my sleep quality this week vs last week"
- "Am I hitting my activity rings consistently?"

**Time saved:** 15 minutes per day on tracking, plus better health insights from actually looking at your data.

**API requirements:** Transition app + Apple Health access for `apple-health-skill`. Others are free.

---

### Use Case 6: The Small Business Financial Dashboard

**Problem:** You run a small business and have financial data scattered across your bank, Stripe, invoicing tool, and spreadsheets. Getting a clear picture of your finances requires opening 4 different apps.

**Skills needed:**
```
clawhub install financial-overview
clawhub install bookkeeper
clawhub install plaid
clawhub install gog
clawhub install summarize
```

**How it works:**
1. `plaid` links your bank accounts for balance and transaction queries
2. `bookkeeper` processes emailed invoices with OCR extraction and payment verification
3. `financial-overview` aggregates everything into a single business financial dashboard
4. `gog` accesses financial spreadsheets in Google Sheets
5. `summarize` creates weekly financial summaries in plain English

You can ask things like:
- "How much did I spend on software subscriptions this month?"
- "What invoices are still unpaid?"
- "Give me a weekly cash flow summary"
- "Compare this quarter's revenue to last quarter"

**API requirements:** `PLAID_CLIENT_ID` + `PLAID_SECRET`, `MATON_API_KEY` + `DEEPREAD_API_KEY` + Xero credentials for `bookkeeper`, Norman Finance MCP server for `financial-overview`, Google OAuth for `gog`.

---

### Use Case 7: The Smart Home Command Center

**Problem:** You have smart home devices from multiple brands, each with their own app. Controlling your home requires opening 3-4 different apps and remembering which device is where.

**Skills needed:**
```
clawhub install home-assistant
clawhub install sonoscli
clawhub install weather
clawhub install automation-workflows
```

**How it works:**
1. `home-assistant` connects to your local Home Assistant instance for lights, locks, thermostat, and appliances — zero cloud dependency
2. `sonoscli` controls Sonos speakers for music, volume, and room grouping
3. `weather` provides context for automated routines (rainy day = different lighting)
4. `automation-workflows` chains actions: "When I say goodnight, turn off all lights, lock the front door, set thermostat to 68, and play white noise in the bedroom"

Example commands:
- "Set the living room to 50% brightness and play jazz in the kitchen"
- "What's the thermostat at? Lower it by 2 degrees"
- "Lock all doors and turn off everything downstairs"
- "Start my morning routine" (lights on, coffee maker, morning playlist, weather briefing)

**API requirements:** Home Assistant `HASS_TOKEN` on local network. Sonos speakers on local network. Others are free.

---

### Use Case 8: The Developer's Code and Project Workflow

**Problem:** Software engineers context-switch between code, GitHub issues, project boards, and documentation constantly. Each switch has a 10-15 minute recovery cost.

**Skills needed:**
```
clawhub install github
clawhub install coding-agent
clawhub install debug-pro
clawhub install test-runner
clawhub install linear
clawhub install buildlog
```

**How it works:**
1. `github` manages repos, issues, PRs, and branches through natural language
2. `coding-agent` orchestrates coding models for delegated development tasks
3. `debug-pro` provides structured multi-language debugging methodology
4. `test-runner` writes and executes tests across multiple languages
5. `linear` manages engineering sprints and bug tracking
6. `buildlog` records coding sessions as structured, shareable logs

Example workflow:
- "Show me open PRs that need my review on the backend repo"
- "Debug this failing test — the error is a null pointer in the user service"
- "Write unit tests for the authentication module"
- "Create a Linear issue for the performance regression we found today"
- "Generate a build log for today's session to include in the PR description"

**API requirements:** GitHub Personal Access Token, Claude or OpenAI API Key for `coding-agent`, Linear API Key. Others are free.

---

### Use Case 9: The Multilingual Business Communicator

**Problem:** You work with international clients or teams and need to communicate across language barriers. Translation tools break the flow of conversation.

**Skills needed:**
```
clawhub install deepl-translate
clawhub install translate-image
clawhub install tts-multilingual
clawhub install whatsapp-cli
clawhub install gog
```

**How it works:**
1. `deepl-translate` handles high-quality text translation across 30+ languages
2. `translate-image` translates text in images — menus, signs, product labels, scanned documents
3. `tts-multilingual` reads documents aloud in 50+ languages for accessibility
4. `whatsapp-cli` sends translated messages directly to international contacts
5. `gog` handles translated email drafts through Gmail

Example workflow:
- "Translate this contract summary into German and send it to Klaus on WhatsApp"
- "What does this Japanese product label say?" (attach photo)
- "Read this French document aloud in English"
- "Draft an email to the Madrid office in Spanish about the Q2 timeline"

**API requirements:** DeepL API Key, TranslateImage API Key, TTS provider API Key, WhatsApp Business API, Google OAuth.

---

### Use Case 10: The CRM-Driven Sales Pipeline

**Problem:** Sales teams spend hours on data entry, lead qualification, and pipeline updates instead of actually selling. CRM tools are powerful but tedious to operate.

**Skills needed:**
```
clawhub install hubspot
clawhub install gog
clawhub install whatsapp-cli
clawhub install agent-mail
clawhub install summarize
```

**How it works:**
1. `hubspot` manages contacts, companies, deals, and pipeline stages
2. New leads from email (`agent-mail`) or WhatsApp (`whatsapp-cli`) are automatically qualified
3. Qualified leads get pushed into `hubspot` without manual CRM data entry
4. `gog` schedules follow-up meetings and sends confirmation emails
5. `summarize` creates weekly pipeline reports from CRM data

Example workflow:
- "Add this new lead from today's email to HubSpot and set them to 'Qualified'"
- "What deals are closing this month?"
- "Draft a follow-up email for all deals that have been in 'Proposal' stage for more than 7 days"
- "Give me a summary of my pipeline by stage and total value"

**API requirements:** HubSpot API Key or Private App Token, Google OAuth, WhatsApp Business API, SMTP/IMAP for `agent-mail`.

---

## Key Skills Used

| Skill | Use Cases It Appears In |
|---|---|
| `summarize` | 1, 2, 3, 5, 6, 10 |
| `gog` | 2, 4, 6, 9, 10 |
| `obsidian` | 1, 2, 3, 5 |
| `tavily-web-search` | 1, 3 |
| `todoist` | 2, 4 |
| `hubspot` | 10 |
| `whatsapp-cli` | 4, 9, 10 |
| `slack` | 4 |
| `home-assistant` | 7 |
| `github` | 8 |
| `deepl-translate` | 9 |
| `automation-workflows` | 7 |

---

## Automation Examples

### 1. Lead-to-CRM Pipeline
Automatically qualify and add leads from inbound email:
```
trigger: new email (agent-mail) matching "interested in" → hubspot (create contact) → todoist (follow-up task)
```

### 2. Morning Health + Productivity Briefing
Combine health data with your daily schedule:
```
cron: 0 7 * * * → apple-health-skill (sleep + activity) + gog (calendar) + weather → summarize
```

### 3. Content Research Autopilot
Gather research for your next content piece overnight:
```
cron: 0 22 * * * → tavily-web-search + exa-web-search-free + youtube-summarizer → summarize → obsidian
```

### 4. Smart Home Goodnight Routine
Trigger a full home shutdown sequence:
```
trigger: "goodnight" → home-assistant (lights off, doors locked, thermostat 68) + sonoscli (white noise, bedroom)
```

### 5. Weekly Financial Summary
Generate a business financial report every Friday afternoon:
```
cron: 0 16 * * 5 → financial-overview + plaid (transactions) + bookkeeper (invoices) → summarize → gog (email report)
```

---

## Tips and Best Practices

1. **Pick the use case closest to your biggest pain point.** Do not try to build all ten at once. Identify which scenario matches your daily frustration and start there. A single well-built workflow beats ten half-finished ones.

2. **Layer skills incrementally.** Each use case lists all the skills needed, but you do not have to install them all at once. Start with the core 2-3 skills and add the rest as you get comfortable.

3. **Keep API keys organized.** Some use cases require 3-5 different API keys. Store them in your OpenClaw environment config, not in plaintext files. Use a password manager for the master credentials.

4. **Review automated actions weekly.** Any use case involving automated sending (email, WhatsApp, CRM updates) should include a weekly review of what the agent actually sent and did. Trust but verify.

5. **Share what works.** If you build a use case that saves you significant time, document the exact skill combination and configuration. These setups are reproducible and shareable with colleagues or online communities.

---

## Common Gotchas

1. **API cost surprises on research-heavy use cases.** Use Cases 1 and 3 involve multiple search API calls. The `exa-web-search-free` and `brave-search` skills are free, but `tavily-web-search` charges per query. Monitor costs with `model-usage` and set daily query limits.

2. **Communication use cases need human-in-the-loop.** Use Cases 4, 9, and 10 involve sending messages to real people. Never set these to fully automated mode without a human approval step. One badly phrased automated message can damage a client relationship that took months to build.

3. **Smart home automations need fail-safes.** Use Case 7 controls physical devices. Always include manual override capability and test automations during the day before running them on schedules. A bug in a "lock all doors" automation that instead unlocks them is not a software problem — it is a security problem.

---

## Next Steps

- Combine multiple use cases into a unified daily workflow using `automation-workflows`
- Explore `composio` for connecting to 860+ external services through a single auth framework
- Add `agent-team-orchestration` for complex use cases that benefit from specialized sub-agents
- Look into `cc-godmode` for multi-agent software project coordination
- Review the Business Automation tutorial for scaling use cases across a team
- Implement `claw-audit` for periodic security reviews as your skill count grows
