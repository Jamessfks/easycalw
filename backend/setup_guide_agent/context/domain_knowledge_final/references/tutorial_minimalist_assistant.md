# Minimalist OpenClaw Assistant — OpenClaw Reference Guide

## What This Covers
This tutorial sets up a lean, focused OpenClaw configuration with only the skills that matter most. No bloat, no unnecessary integrations, no skill sprawl. You will install exactly 8 skills that cover 90% of what a personal assistant needs to do, and nothing more. The result is a fast, secure, low-maintenance agent that does the essentials exceptionally well.

## Who This Is For
People who value simplicity over features. You want an AI assistant that handles email, calendar, search, notes, and tasks without becoming a project to manage. You are skeptical of installing dozens of skills and prefer a curated, minimal setup. You might be a busy professional, a focused student, or anyone who hates bloatware.

## Prerequisites
- OpenClaw installed on macOS, Linux, or Windows (WSL2)
- A Google account for email and calendar
- An Obsidian vault (or willingness to create one — it is just a folder of markdown files)
- 20 minutes for setup
- A configured AI model (paid API key or free-ride setup)

---

## Step-by-Step Walkthrough

### The Philosophy

More skills means more attack surface, more API keys to manage, more things that can break, and more context the agent has to juggle. The minimalist approach installs only what you will use daily and resists the urge to add "just one more" skill.

The 8-skill stack:
1. `skill-vetter` — security (non-negotiable)
2. `prompt-guard` — security (non-negotiable)
3. `agentguard` — security (non-negotiable)
4. `gog` — email, calendar, drive
5. `summarize` — content digestion
6. `weather` — daily planning
7. `obsidian` — notes and knowledge
8. `brave-search` — web search (free, no API key)

That is it. Three security skills and five functional skills. Everything else is optional.

### Step 1 — Install the Security Foundation

```bash
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard
```

These three skills are not optional in any OpenClaw setup. They protect you from malicious skills, prompt injection, and dangerous agent actions. Install them first, always.

Verify they are working:

```bash
skill-vetter prompt-guard
skill-vetter agentguard
```

Both should return clean results. If either flags an issue, stop and investigate before proceeding.

### Step 2 — Install Google Workspace Integration

```bash
skill-vetter gog
clawhub install gog
```

When prompted, authorize with your Google account. The `gog` skill gives you:
- Gmail reading and draft composition
- Google Calendar viewing and event creation
- Google Drive file search and access
- Google Docs creation

This single skill replaces what would otherwise be 4 separate integrations. It is first-party, maintained by the OpenClaw creator, and bundled with the platform.

### Step 3 — Install Content Summarization

```bash
skill-vetter summarize
clawhub install summarize
```

The `summarize` skill condenses any URL, PDF, audio file, or document into a digestible summary. It requires no API keys and handles the most common "I need to quickly understand this" use case.

Use it for:
- Long articles you do not have time to read
- PDF reports that need a quick overview
- Meeting transcripts that need key points extracted

### Step 4 — Install Weather

```bash
skill-vetter weather
clawhub install weather
```

Simple, free, and useful every single day. "What is the weather today?" is the most common casual question people ask their assistant. Having it built in means one less reason to open a separate app.

### Step 5 — Install Obsidian Integration

```bash
skill-vetter obsidian
clawhub install obsidian
```

If you do not have an Obsidian vault yet, create one:

```bash
mkdir -p ~/Documents/ObsidianVault
```

Configure OpenClaw to point to your vault:

```bash
openclaw config set OBSIDIAN_VAULT_PATH=~/Documents/ObsidianVault
```

The `obsidian` skill lets you:
- Create new notes from conversations
- Search existing notes
- Update notes with new information
- Link notes together with backlinks

Why Obsidian? It stores everything as plain markdown files in a local folder. No vendor lock-in, no cloud dependency, no subscription. Your notes are just files.

### Step 6 — Install Web Search

```bash
skill-vetter brave-search
clawhub install brave-search
```

The `brave-search` skill provides privacy-first web search with no API key required for basic use. It is the best zero-cost search option available.

Use it for:
- Quick factual questions
- Current events
- Product research
- General knowledge queries

### Step 7 — Verify Your Installation

Ask your agent: "List all installed skills."

You should see exactly 8 skills. If you see more, something was bundled automatically — review and remove anything you did not explicitly install.

Run a security check:

```bash
skill-vetter gog
skill-vetter summarize
skill-vetter weather
skill-vetter obsidian
skill-vetter brave-search
```

All five functional skills should return clean results.

### Step 8 — Configure Your Daily Workflow

Now set up the three interactions you will use most:

#### Morning Briefing
Ask: "Good morning. What is the weather today? What is on my calendar? Do I have any urgent emails?"

This single question uses 3 skills (`weather`, `gog` for calendar, `gog` for email) and takes about 10 seconds to answer. It replaces checking 3 separate apps.

#### Quick Research
Ask: "Search for [topic] and give me a summary of the top results."

This uses `brave-search` to find information and the agent's built-in reasoning to synthesize it.

#### Note Taking
Ask: "Save the following to my Obsidian vault as a new note titled [title]: [content]"

Or after a research session: "Save the key points from this conversation to Obsidian."

### Step 9 — Set Up Minimal Automation

Only two cron jobs. Resist adding more.

```bash
openclaw cron add "0 7 * * 1-5 openclaw run 'Morning brief: weather, today calendar, and urgent emails'" --name morning
```

```bash
openclaw cron add "0 21 * * * openclaw run 'Save any useful information from today conversations to Obsidian as a daily note'" --name evening-capture
```

That is your entire automation setup. Two jobs, two purposes, zero complexity.

### Step 10 — Maintain the Minimalist Discipline

The hardest part of a minimalist setup is keeping it minimal. Here are the rules:

1. **The 30-day rule.** Before installing a new skill, wait 30 days. If you still want it after a month, it is probably worth adding.

2. **One in, one out.** If you add a new skill, consider whether an existing skill is now redundant. Remove it.

3. **Monthly audit.** On the first of each month, ask: "Which skills did I actually use in the last 30 days?" Remove any you did not.

4. **Resist automation creep.** If you have more than 5 cron jobs, you have too many. Each one consumes tokens and adds complexity.

---

## Key Skills Used

| Skill | Purpose | API Keys | Maintenance |
|---|---|---|---|
| `skill-vetter` | Pre-install security scanning | None | Zero |
| `prompt-guard` | Prompt injection defense | None | Zero |
| `agentguard` | Runtime safety guardrails | None | Zero |
| `gog` | Email, calendar, drive, docs | Google OAuth | Token refresh occasionally |
| `summarize` | URL/PDF/document summarization | None | Zero |
| `weather` | Weather forecasts | None | Zero |
| `obsidian` | Note taking and search | None | Zero |
| `brave-search` | Web search | None | Zero |

Total API keys needed: 1 (Google OAuth, which you already have)
Total maintenance burden: Near zero (occasional Google token refresh)

---

## Automation Examples

### Morning Briefing (Weekdays Only)
```bash
openclaw cron add "0 7 * * 1-5 openclaw run 'Weather, calendar, urgent emails. Keep it brief.'" --name morning
```

### Evening Knowledge Capture
```bash
openclaw cron add "0 21 * * * openclaw run 'Save any key information from today to Obsidian as a daily note'" --name evening
```

### Weekly Email Cleanup (Optional)
```bash
openclaw cron add "0 10 * * 6 openclaw run 'Show me all unread emails from this week I have not addressed. Summarize each in one line.'" --name weekly-email
```

### Monthly Skill Audit (Keep Yourself Honest)
```bash
openclaw cron add "0 10 1 * * openclaw run 'List all installed skills. For each, tell me the last time it was used. Flag any that have not been used in 30 days.'" --name monthly-audit
```

---

## Tips and Best Practices

1. **Master the 8 before adding a 9th.** Most people do not fully utilize even their core skills. Learn the advanced features of `gog` (Drive search, Docs creation, calendar event management) before installing more skills.

2. **Use Obsidian as your single source of truth.** Instead of scattering information across apps, save everything to Obsidian. One search location, one backup target, one system to maintain.

3. **Keep your prompts simple.** The minimalist setup works best with direct, clear requests. "What is on my calendar today?" works better than "Can you please check my Google Calendar and provide a comprehensive overview of all scheduled events and their details for today?"

4. **Let the security stack run silently.** You should not notice `prompt-guard` and `agentguard` in daily use. They work in the background. If they flag something, pay attention — it means a real threat was blocked.

5. **Free search is good enough.** The `brave-search` skill covers 95% of search needs without any API key. Only upgrade to `tavily-web-search` if you consistently find Brave's results insufficient for your specific domain.

---

## Common Gotchas

1. **The temptation to install more.** Every OpenClaw tutorial will suggest installing 15+ skills. Resist. Each skill is a dependency, a potential security risk, and a piece of complexity. The minimalist setup is deliberately constrained.

2. **Google OAuth token expiry.** The `gog` skill will periodically need re-authorization. When email or calendar stops working, run `clawhub auth refresh gog`. This is normal and takes 30 seconds.

3. **Obsidian vault location mismatch.** If the `obsidian` skill says it cannot find your vault, verify the path in your config matches your actual vault location. Common issue: using `~` in the config when an absolute path is needed.

---

## A Week With the Minimalist Setup

Here is what a typical week looks like with only 8 skills. This demonstrates that constraint creates clarity, not limitation.

### Monday
- Morning: "Weather, calendar, urgent emails." (30 seconds)
- Mid-morning: "Summarize this report PDF my boss sent." (1 minute)
- Afternoon: "Search for best practices on [work topic]." (2 minutes)
- Evening: "Save today's key decisions to Obsidian." (30 seconds)

### Tuesday
- Morning: "Weather, calendar, urgent emails." (30 seconds)
- Lunch: "Summarize this long article someone shared." (1 minute)
- Afternoon: "Draft a reply to the email from [colleague] about [topic]." (2 minutes)

### Wednesday
- Morning: Automated briefing runs at 7 AM. You read the output.
- Afternoon: "What meetings do I have tomorrow? Any conflicts?" (30 seconds)
- Evening: "Save notes from today's brainstorm to Obsidian under /Projects/[name]." (1 minute)

### Thursday
- Morning: "Weather, calendar, emails." (30 seconds)
- Work: "Search for [competitor] recent news." (1 minute)
- End of day: "Save research findings to Obsidian." (30 seconds)

### Friday
- Morning: "What is on my calendar next week?" (30 seconds)
- Afternoon: "Summarize the 3 articles I bookmarked this week." (2 minutes)
- Evening: Automated daily note captures the week's highlights.

Total active time with the assistant: approximately 15-20 minutes across the entire week. No skill management, no API key rotation, no debugging failed integrations. Just five tools doing their jobs reliably.

---

## Why Eight is Enough

People commonly ask: "But what about [specific skill]?" Here is the honest answer for the most requested additions:

| Frequently Requested | Why You Probably Do Not Need It Yet |
|---|---|
| `tavily-web-search` | `brave-search` handles 95% of queries. Add Tavily only when you hit quality walls. |
| `youtube-summarizer` | Valuable, but only if you watch educational YouTube regularly. Add after 30 days if the need persists. |
| `agent-browser` | Powerful but complex. Most people never use it beyond the first week of novelty. |
| `home-assistant` | Only if you have a Home Assistant instance already running. Do not install hardware for this. |
| `slack` | Only if Slack is central to your work. Most people check Slack directly. |
| `todoist` | Calendar events in `gog` cover most task tracking. Add a dedicated task manager only when calendar reminders are insufficient. |

The minimalist approach does not say these skills are bad. It says: prove the need before adding the complexity.

---

## Next Steps

Use this setup for at least 30 days before considering additions. When you do want to expand, the most impactful additions in order of priority:

1. **`todoist` or `apple-reminders`** — if you need task management beyond calendar events
2. **`youtube-summarizer`** — if you watch a lot of educational YouTube content
3. **`tavily-web-search`** — if Brave search results are consistently insufficient
4. **`gno`** — if your Obsidian vault grows large enough that built-in search is not fast enough
5. **`claw-audit`** — for periodic security health checks as your setup matures

Each addition should solve a specific, recurring frustration. If you cannot name the frustration, you do not need the skill.

The minimalist setup is not about having fewer features. It is about having the right features, fully utilized, with nothing to distract or maintain. Eight skills, two automations, zero unnecessary complexity.
