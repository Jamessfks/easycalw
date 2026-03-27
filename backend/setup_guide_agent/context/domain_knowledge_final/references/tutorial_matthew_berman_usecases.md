# Matthew Berman's OpenClaw Use Cases — OpenClaw Reference Guide

## What This Covers
This tutorial walks through practical, real-world OpenClaw use cases inspired by Matthew Berman's demonstrations and approach to AI agents. Berman focuses on concrete productivity wins — things that save measurable time every day — rather than theoretical possibilities. Each use case here is something you can set up in under 15 minutes and start benefiting from immediately.

## Who This Is For
Viewers of Matthew Berman's AI content who want to replicate the workflows he demonstrates. Also useful for anyone who prefers a practical, results-first approach to OpenClaw rather than exploring every feature. You want to know "what should I set up first to get the most value?"

## Prerequisites
- OpenClaw installed and running with a configured AI model
- A Google account (for Gmail, Calendar, Drive integration)
- Basic comfort with the terminal (copy-paste commands)
- 30-60 minutes for initial setup
- Security stack installed (`skill-vetter` at minimum)

---

## Step-by-Step Walkthrough

### Use Case 1 — The AI Email Assistant

This is the use case Berman highlights as the single biggest time saver. The agent reads, triages, and drafts replies to your email.

#### Setup

```bash
clawhub install skill-vetter
skill-vetter gog
clawhub install gog
skill-vetter agent-mail
clawhub install agent-mail
clawhub install summarize
```

#### How It Works

Ask your agent: "Go through my inbox. Show me anything urgent first, then anything that needs a reply. Draft responses for the top 5 emails that need replies."

The `gog` skill connects to Gmail and reads your messages. The `agent-mail` skill adds intelligent triage — it categorizes emails by urgency and type. The `summarize` skill condenses long email threads into digestible summaries.

#### The Daily Workflow

1. Morning: "Show me what came in overnight. Anything urgent?"
2. Agent presents a prioritized summary
3. "Draft replies to the top 3 action items"
4. You review and approve each draft
5. Agent sends approved replies through Gmail

#### Why This Matters

Berman estimates this saves 30-45 minutes per day for anyone who handles more than 20 emails daily. The compound effect over a month is substantial — 10-15 hours of reclaimed time.

#### Automate It

```bash
openclaw cron add "0 7 * * 1-5 openclaw run 'Triage my inbox: urgent items first, then action-needed, then FYI. Summarize each category.'" --name morning-email
```

---

### Use Case 2 — Research and Summarization Engine

Berman demonstrates using OpenClaw as a research assistant that pulls information from multiple sources and synthesizes it.

#### Setup

```bash
skill-vetter tavily-web-search
clawhub install tavily-web-search
skill-vetter youtube-summarizer
clawhub install youtube-summarizer
clawhub install summarize
skill-vetter obsidian
clawhub install obsidian
```

#### How It Works

Ask: "Research the pros and cons of the new MacBook Pro M4 vs the Framework Laptop 16. Check at least 5 review sources. Summarize the key differences in a comparison table."

The agent uses `tavily-web-search` to find reviews, `summarize` to condense each one, and presents a structured comparison. If you want to save the research:

"Save this comparison to my Obsidian vault under /Research/Hardware."

#### YouTube Deep Dives

Ask: "Summarize this 2-hour podcast episode: [URL]. Give me timestamps for the most interesting segments and the top 5 takeaways."

The `youtube-summarizer` extracts the transcript and produces a structured summary. You decide which segments are worth watching in full.

#### Compound Research

The real power comes from combining sources:

"Research [topic]. Search the web for recent articles, find any relevant YouTube videos, and if there are academic papers on ArXiv, include those too. Give me a consolidated briefing."

Add `arxiv-watcher` for academic research:

```bash
skill-vetter arxiv-watcher
clawhub install arxiv-watcher
```

---

### Use Case 3 — Calendar and Schedule Management

Berman shows how the agent becomes a personal scheduling assistant.

#### Setup

The `gog` skill already includes Google Calendar. No additional installation needed if you set up Use Case 1.

#### How It Works

Ask: "What does my week look like? Are there any scheduling conflicts? Where do I have free blocks of at least 2 hours?"

The agent reads your calendar and analyzes it for conflicts, gaps, and patterns.

#### Smart Scheduling

"I need to schedule a 1-hour meeting with 3 people this week. Check my calendar and suggest 3 time slots that work."

"Block 2 hours tomorrow afternoon for deep work. Label it 'Focus Time — No Meetings.'"

"Move my 3 PM meeting to Thursday same time and send an update to attendees."

#### Weekly Planning

```bash
openclaw cron add "0 17 * * 5 openclaw run 'Review next week calendar. Flag any conflicts, identify free blocks, and suggest optimal times for deep work sessions.'" --name friday-planning
```

---

### Use Case 4 — Smart Home Automation Hub

Berman demonstrates using OpenClaw as a unified smart home control layer.

#### Setup

```bash
skill-vetter home-assistant
clawhub install home-assistant
skill-vetter sonoscli
clawhub install sonoscli
```

#### How It Works

"Set the house to movie mode: dim the living room lights to 20%, turn off the kitchen lights, set the thermostat to 72, and play ambient music on the living room Sonos at low volume."

Instead of opening 3 different apps, one sentence does everything. The `home-assistant` skill talks to your local Home Assistant instance. The `sonoscli` skill controls Sonos speakers directly.

#### Routine Automation

"Create a bedtime routine: at 10 PM, dim all lights to 10%, lock the front door, set thermostat to 68, and turn off all Sonos speakers."

```bash
openclaw cron add "0 22 * * * openclaw run 'Execute bedtime routine: dim lights, lock doors, thermostat to 68, Sonos off'" --name bedtime
```

#### Scene Control

"Create a 'working from home' scene: office lights to 80%, close the blinds, thermostat to 70, play lo-fi music in the office at 25% volume."

You build scenes through natural language instead of configuring them in each app separately.

---

### Use Case 5 — Content Creation Pipeline

Berman shows how OpenClaw accelerates content creation for creators and professionals.

#### Setup

```bash
skill-vetter aeo-prompt-question-finder
clawhub install aeo-prompt-question-finder
clawhub install tavily-web-search
clawhub install summarize
skill-vetter image-generation
clawhub install image-generation
```

#### How It Works

Step 1 — Topic Research:
"What are people asking about [topic]? Find the top 10 questions from Google autocomplete."

The `aeo-prompt-question-finder` surfaces real search queries people are typing.

Step 2 — Competitive Analysis:
"Find the top 5 existing articles on this topic. Summarize what they cover and identify gaps."

Step 3 — Outline Generation:
"Create a detailed blog post outline that covers the gaps you identified. Include a hook, 5 main sections, and a conclusion."

Step 4 — Visual Assets:
"Generate a hero image for this blog post using image-generation."

#### Video Script Pipeline

For video creators:
"Write a 10-minute YouTube script on [topic]. Include a hook in the first 15 seconds, 3 main points with examples, and a call to action. Format with timestamps."

---

### Use Case 6 — Personal Knowledge Management

Berman emphasizes building a second brain with OpenClaw.

#### Setup

```bash
clawhub install obsidian
skill-vetter gno
clawhub install gno
clawhub install summarize
```

#### How It Works

Every time you learn something, research something, or have a useful conversation:

"Save the key points from this conversation to my Obsidian vault. File it under /Learning/[topic]. Add backlinks to any related notes."

The `gno` skill indexes everything locally, so you can later ask:

"What do I know about [topic]? Search my notes."

#### Automated Knowledge Capture

```bash
openclaw cron add "0 21 * * * openclaw run 'Review today conversations and extract any key learnings, decisions, or useful information. Save them as Obsidian notes with proper tags and backlinks.'" --name daily-capture
```

Over months, this builds a comprehensive, searchable personal knowledge base that grows with every interaction.

---

### Use Case 7 — Task Management and Accountability

#### Setup

```bash
skill-vetter todoist
clawhub install todoist
clawhub install adhd-daily-planner
```

Or for Apple users:

```bash
clawhub install apple-reminders
clawhub install adhd-daily-planner
```

#### How It Works

Morning planning:
"What are my top priorities today? Check my task list, calendar, and any deadlines this week. Help me plan the day with time blocks."

The `adhd-daily-planner` structures daily planning through conversational prompts. It helps prioritize and creates a realistic schedule.

End-of-day review:
"What did I accomplish today? Check off completed tasks and move anything unfinished to tomorrow."

#### Weekly Review

```bash
openclaw cron add "0 17 * * 5 openclaw run 'Weekly review: what tasks did I complete this week, what rolled over, what are my top 3 priorities for next week?'" --name weekly-review
```

---

### Use Case 8 — Security-First Agent Management

Berman strongly emphasizes security. Here is the full protective setup he recommends.

#### Setup

```bash
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard
skill-vetter claw-audit
clawhub install claw-audit
skill-vetter agentgate
clawhub install agentgate
```

#### The Security Workflow

Before installing any new skill:
```bash
skill-vetter <skill-name>
```

This is non-negotiable. The ClawHavoc incident put 1,184 malicious skills in the registry. One attacker alone published 314 skills, all flagged as malicious, all disguised as harmless utilities. `skill-vetter` is your first line of defense.

Monthly security audit:
```bash
openclaw cron add "0 10 1 * * openclaw run 'Run claw-audit for a full security assessment. Report any issues, score, and recommended fixes.'" --name monthly-audit
```

For sensitive operations, `agentgate` forces human approval before any write action. This means the agent can read your email but cannot send anything without your explicit approval.

---

## Key Skills Used

| Skill | Primary Use Case |
|---|---|
| `gog` | Email, calendar, drive integration |
| `agent-mail` | Email triage and prioritization |
| `summarize` | Content condensation |
| `tavily-web-search` | Web research |
| `youtube-summarizer` | Video content extraction |
| `obsidian` | Knowledge management |
| `gno` | Local document search |
| `home-assistant` | Smart home control |
| `sonoscli` | Music/speaker control |
| `aeo-prompt-question-finder` | Content topic research |
| `image-generation` | Visual content creation |
| `todoist` | Cross-platform task management |
| `apple-reminders` | Apple ecosystem task management |
| `adhd-daily-planner` | Daily planning and prioritization |
| `arxiv-watcher` | Academic research monitoring |
| `skill-vetter` | Pre-install security scanning |
| `prompt-guard` | Prompt injection defense |
| `agentguard` | Runtime safety guardrails |
| `claw-audit` | Security posture assessment |
| `agentgate` | Write operation approval gates |

---

## Automation Examples

### Morning Productivity Stack
```bash
openclaw cron add "0 7 * * 1-5 openclaw run 'Morning brief: weather, calendar, email triage, top 3 tasks for today'" --name morning-stack
```

### Content Research Pipeline
```bash
openclaw cron add "0 9 * * 1 openclaw run 'Research trending topics in my niche. Find top questions, summarize competitor content, suggest 3 content ideas for the week.'" --name weekly-content
```

### Evening Knowledge Capture
```bash
openclaw cron add "0 21 * * * openclaw run 'Capture today key learnings and save to Obsidian. Update my weekly progress note.'" --name evening-capture
```

### Weekend Smart Home Reset
```bash
openclaw cron add "0 10 * * 6 openclaw run 'Set weekend mode: thermostat to 72, all lights to auto, play morning playlist on kitchen Sonos'" --name weekend-mode
```

### Monthly Security Review
```bash
openclaw cron add "0 10 1 * * openclaw run 'Full security audit with claw-audit. List all installed skills, check for updates, report security score.'" --name security-review
```

---

## Tips and Best Practices

1. **Vet every skill before installing.** Run `skill-vetter` on everything. This is non-negotiable, especially after the ClawHavoc incident that put 1,184 malicious skills in the registry.

2. **Start with email.** The `gog` + `agent-mail` combination provides the fastest return on investment. If you only set up one thing, make it email triage.

3. **Build the habit of saving to Obsidian.** Knowledge management compounds over time. The first month feels pointless. By month six, you have a searchable archive of everything you have learned and decided.

4. **Use free models for routine tasks.** Install `free-ride` and route simple queries (weather, reminders, basic search) through free models. Save paid model tokens for complex reasoning.

5. **Automate only after manual mastery.** Run every workflow manually at least 10 times before creating a cron job. Automation amplifies both good habits and mistakes.

---

## Common Gotchas

1. **Gmail OAuth token rotation.** Google forces token refresh periodically. If `gog` stops working, run `clawhub auth refresh gog`. This is expected behavior.

2. **Obsidian vault path configuration.** The `obsidian` skill needs to know where your vault is. If notes are not appearing, check that the vault path in your OpenClaw config matches your actual Obsidian vault location.

3. **Home Assistant network access.** The `home-assistant` skill needs to reach your Home Assistant instance on the local network. If you are on a VPN or different subnet, it will fail to connect. Ensure your `HASS_TOKEN` and instance URL are correctly configured.

---

## Next Steps

- Start with Use Cases 1 and 2 (email and research) — they deliver value on day one
- Add smart home control if you have Home Assistant or Sonos
- Build your Obsidian knowledge base gradually — do not try to capture everything at once
- Review the full skill registry for skills specific to your profession or interests
- Join the OpenClaw community forums to share workflows and learn from other power users
- Explore the advanced mastery guide once you have been using OpenClaw for a month
