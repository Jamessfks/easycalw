# OpenClaw Productivity Workflows (Alex Finn Style) — OpenClaw Reference Guide

## What This Covers
This tutorial focuses on building productivity systems with OpenClaw that eliminate repetitive work and free up hours each week. Inspired by Alex Finn's workflow-first approach, it moves beyond basic skill installation into designing interconnected productivity pipelines. You will learn how to automate email triage, meeting preparation, research workflows, and daily planning using real OpenClaw skills.

## Who This Is For
- Users who have completed the beginner tutorial and have a working OpenClaw setup
- Knowledge workers drowning in email, meetings, and context-switching
- Freelancers and solo operators who need to be their own assistant
- Anyone who spends more than 2 hours per day on email, scheduling, and information management

## Prerequisites
- OpenClaw installed with security stack (`skill-vetter`, `prompt-guard`, `agentguard`)
- The `gog` skill installed and connected to your Google account
- The `summarize` skill installed
- Familiarity with basic OpenClaw commands and skill installation
- At least one task management skill installed (`todoist`, `apple-reminders`, or `things-mac`)

---

## Step-by-Step Walkthrough

### Step 1: Audit Your Current Time Waste

Before building productivity workflows, identify where your time actually goes. Most knowledge workers lose time to five categories:

1. **Email triage** — reading, sorting, deciding what matters
2. **Meeting preparation** — gathering context for upcoming calls
3. **Research** — finding and synthesizing information
4. **Task management** — updating lists, reviewing priorities
5. **Communication** — drafting messages across multiple channels

OpenClaw can automate or accelerate all five. This tutorial builds a workflow for each.

### Step 2: Build the Email Triage Workflow

Email is the biggest time sink for most professionals. Install the dedicated email management skill:

```
clawhub install agent-mail
```

The `agent-mail` skill creates a dedicated AI agent inbox with automatic triage, prioritization, and reply drafting. It requires SMTP/IMAP credentials for your email account.

Combine it with `gog` for full Gmail integration:

```
clawhub install gog
```

Your email workflow now looks like this:
1. `agent-mail` scans incoming emails and categorizes them by urgency and type
2. The agent drafts replies for routine messages
3. Important emails get flagged for your personal attention
4. `gog` handles the actual sending once you approve drafts

For outbound email that needs reliable delivery (confirmations, follow-ups, automated notifications):

```
clawhub install mailchannels
```

The `mailchannels` skill sends transactional email through MailChannels with signed delivery, ensuring your automated messages actually reach inboxes.

### Step 3: Build the Meeting Preparation Workflow

The worst meetings are the ones you walk into unprepared. Build a workflow that automatically gathers context before every meeting:

```
clawhub install gog
clawhub install summarize
clawhub install obsidian
```

The workflow runs 30 minutes before each meeting:
1. `gog` reads the calendar event and extracts attendee names, agenda, and any linked documents
2. `summarize` processes any attached documents or linked pages
3. The agent checks `obsidian` for your previous notes about the attendees or topic
4. You receive a pre-meeting brief with context, talking points, and open questions

This turns "scrambling to remember what this meeting is about" into walking in fully prepared every time.

### Step 4: Build the Research Pipeline

Research tasks eat hours when done manually. Build a multi-source research pipeline:

```
clawhub install tavily-web-search
clawhub install exa-web-search-free
clawhub install brave-search
clawhub install summarize
clawhub install obsidian
```

Why three search skills? Each has a different strength:
- **`tavily-web-search`** returns AI-optimized structured results (requires `TAVILY_API_KEY`)
- **`exa-web-search-free`** excels at technical content and documentation (free, no key)
- **`brave-search`** offers privacy-first search without Google tracking (free for basic use)

The research workflow:
1. Query all three sources for comprehensive coverage
2. `summarize` condenses results into key findings
3. `obsidian` stores the research with proper tags and links for future reference

For academic or scientific research, add:

```
clawhub install arxiv-watcher
clawhub install pubmed-edirect
```

The `arxiv-watcher` monitors arXiv daily for papers matching your keywords. The `pubmed-edirect` skill queries PubMed for peer-reviewed biomedical literature. Together, they ensure you never miss relevant research in your field.

### Step 5: Build the Daily Planning System

A productivity system without a planning ritual is just a collection of tools. Build a daily planning workflow:

```
clawhub install todoist
clawhub install gog
clawhub install weather
clawhub install adhd-daily-planner
```

The `adhd-daily-planner` is useful for anyone, not just people with ADHD. It structures daily planning through guided conversational prompts for prioritization and time-blocking. The result is a concrete plan for the day in under 5 minutes.

The morning planning workflow:
1. `gog` pulls today's calendar and unread email count
2. `todoist` surfaces today's tasks and overdue items
3. `weather` provides conditions for planning outdoor activities or commuting
4. `adhd-daily-planner` guides you through a prioritization conversation
5. The result is a time-blocked plan saved to your task manager

### Step 6: Build the Communication Hub

Stop switching between apps to send messages. Centralize communication:

```
clawhub install gog
clawhub install slack
clawhub install whatsapp-cli
clawhub install telegram
clawhub install whatsapp-styling-guide
```

The `slack` skill reads, posts, and manages Slack messages and channels. It requires a Slack Bot Token via OAuth. The `whatsapp-cli` skill handles WhatsApp messaging. The `telegram` skill manages Telegram bot interactions.

Add `whatsapp-styling-guide` to ensure all WhatsApp messages maintain professional formatting — it is a rules-only skill with no API key.

Your communication workflow:
1. Ask the agent to "message Sarah about the project update"
2. The agent determines the best channel (email, Slack, WhatsApp, Telegram) based on your contact preferences
3. Drafts the message with appropriate formatting
4. Sends after your approval

### Step 7: Build the Content Processing Pipeline

Knowledge workers consume enormous amounts of content. Build a pipeline to process it efficiently:

```
clawhub install summarize
clawhub install youtube-summarizer
clawhub install openai-whisper
clawhub install obsidian
```

The `openai-whisper` skill runs OpenAI's Whisper model locally for audio transcription. No audio leaves your machine. It turns voice memos, meeting recordings, and lectures into searchable text.

The content processing workflow:
1. Drop any content into the pipeline — URLs, PDFs, audio files, YouTube links
2. `summarize` handles text content and documents
3. `youtube-summarizer` handles video content with transcript extraction
4. `openai-whisper` handles audio files locally
5. Everything gets summarized and stored in `obsidian` with proper tags

### Step 8: Add Automation Triggers

Manual workflows are good. Automated workflows are better. Install the automation engine:

```
clawhub install automation-workflows
```

The `automation-workflows` skill lets you build multi-step automations without code: if X happens, do Y, then Z. Use it to connect your other workflows together.

For more complex automations with external service integration:

```
clawhub install n8n-workflow-automation
```

This requires a self-hosted n8n instance but gives you Zapier-style automation power without paying for automation SaaS subscriptions.

### Step 9: Monitor and Optimize

Productivity systems need monitoring. Install tools to track how your agent is performing:

```
clawhub install model-usage
clawhub install self-improving-agent
clawhub install memory-hygiene
```

The `model-usage` skill monitors real-time API token consumption and cost across all providers. Know exactly what you are spending and which workflows consume the most tokens.

The `self-improving-agent` logs errors, learnings, and preferences into persistent local memory. Over time, the agent gets better at your specific tasks.

Run `memory-hygiene` monthly to clean stale entries from the agent's memory. Without it, accumulated outdated context degrades performance.

### Step 10: Keep Everything Updated

Install the auto-update skill to maintain your stack:

```
clawhub install auto-updater
```

The `auto-updater` skill updates OpenClaw and all installed skills in one command. Run it weekly to stay current with bug fixes and new features.

---

## Key Skills Used

| Skill | Productivity Role |
|---|---|
| `gog` | Central hub for email, calendar, and document access |
| `agent-mail` | Dedicated email triage, prioritization, and draft generation |
| `summarize` | Condenses any content into actionable summaries |
| `todoist` | Cross-platform task management with filters and priorities |
| `adhd-daily-planner` | Guided daily planning through structured conversation |
| `tavily-web-search` | AI-optimized web search for research tasks |
| `exa-web-search-free` | Free technical search for documentation and code |
| `brave-search` | Privacy-first web search alternative |
| `obsidian` | Local knowledge base for storing processed content |
| `slack` | Slack channel management and messaging |
| `automation-workflows` | No-code multi-step automation builder |
| `openai-whisper` | Local audio transcription for meetings and voice memos |
| `model-usage` | API cost tracking across all workflows |
| `self-improving-agent` | Persistent learning from your usage patterns |

---

## Automation Examples

### 1. Email-to-Task Pipeline
When an email contains an action item, automatically create a task:
```
cron: */30 * * * * → agent-mail (scan new) → todoist (create task if action detected)
```

### 2. Pre-Meeting Brief Generator
Prepare context briefs 30 minutes before every calendar event:
```
trigger: 30min before gog calendar event → summarize (linked docs) + obsidian (prior notes) → brief
```

### 3. Daily Research Digest
Run morning research on your monitored topics:
```
cron: 0 7 * * * → arxiv-watcher + tavily-web-search (keywords) → summarize → obsidian
```

### 4. Weekly Productivity Review
Summarize the week's completed tasks and time spent:
```
cron: 0 18 * * 5 → todoist (completed this week) + model-usage (weekly costs) → summarize → obsidian
```

### 5. Content Inbox Processing
Process saved content links every evening:
```
cron: 0 20 * * * → obsidian (tagged "inbox") → summarize + youtube-summarizer → obsidian (processed)
```

---

## Tips and Best Practices

1. **Batch your agent interactions.** Instead of asking the agent one thing at a time throughout the day, batch related requests. "Process all my unread emails, summarize the top 3, and add action items to Todoist" is more efficient than three separate requests.

2. **Trust the triage, verify the drafts.** Let `agent-mail` triage and categorize freely, but always review drafted replies before sending. The agent's judgment about urgency is usually excellent; its tone in your voice takes a few weeks to calibrate.

3. **Use `obsidian` as your single source of truth.** Every workflow should end with something being saved to your knowledge base. Six months from now, you will have a searchable archive of every research project, meeting note, and decision — all created automatically.

4. **Start with one workflow, not all five.** Pick the one area where you waste the most time (usually email) and automate that first. Once it is running smoothly, add the next workflow. Trying to build everything at once leads to a fragile system.

5. **Review `model-usage` weekly.** API costs can creep up when multiple automated workflows run on schedules. Check your token consumption every week and adjust frequencies for workflows that cost more than they save.

---

## Common Gotchas

1. **Over-automating communication.** Automating email drafts is powerful, but automating email sending without human review is risky. Always keep a human approval step before any message goes out, especially in professional contexts. The `agentguard` skill helps enforce this.

2. **Search skill redundancy costs.** Running `tavily-web-search`, `exa-web-search-free`, and `brave-search` simultaneously for every query triples your API usage. Use `exa-web-search-free` for everyday queries (free) and reserve `tavily-web-search` for deep research sessions where comprehensive coverage matters.

3. **Stale automation schedules.** Cron jobs you set up in week one may not match your needs in month three. Review your automation schedules monthly. A daily digest that runs at 7 AM stops being useful when your schedule changes to start at 9 AM.

---

## Next Steps

- Add CRM integration with `hubspot` or `pipedrive` for client-facing workflows
- Explore `elevenlabs-agents` for voice-based interactions and phone-call automation
- Set up `home-assistant` to extend productivity workflows into smart home control
- Build cross-channel notification routing with `clawsignal` for urgent alerts
- Implement `agent-team-orchestration` for delegating to specialized sub-agents
- Review the Business Automation tutorial for scaling these workflows to a team
