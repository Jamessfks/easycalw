# Free & Local OpenClaw Setup — OpenClaw Reference Guide

## What This Covers
This tutorial walks you through setting up a fully functional OpenClaw agent using only free-tier services and local tools. You will have a working personal AI assistant without spending a single dollar on API subscriptions. Every skill recommended here either runs entirely on your machine or uses a genuinely free tier.

## Who This Is For
Budget-conscious users, students, hobbyists, and anyone who wants to explore OpenClaw before committing to paid services. You should be comfortable with basic terminal commands (copy-paste level is fine), but no programming knowledge is required.

## Prerequisites
- A computer running macOS 14+ (Sonoma or later), Linux, or Windows with WSL2
- At least 8 GB of RAM and 10 GB of free disk space
- A stable internet connection for initial downloads
- A free Google account (for Google Workspace integration)
- A free OpenRouter account (for free AI model access)
- Approximately 60 minutes for the full setup

---

## Step-by-Step Walkthrough

### Step 1 — Install OpenClaw

Download and install OpenClaw from the official site. On macOS, use Homebrew:

```bash
brew install openclaw
```

On Linux or WSL2:

```bash
curl -fsSL https://get.openclaw.ai | sh
```

Verify the installation:

```bash
openclaw --version
```

You should see a version number (v3.x or later). If this fails, check that your PATH includes the OpenClaw binary location.

### Step 2 — Set Up Free AI Model Access

OpenClaw needs an AI model to function. Instead of paying for Claude or GPT-4 API access, use OpenRouter's free tier:

1. Go to openrouter.ai and create a free account
2. Navigate to API Keys and generate a new key
3. Copy the key and configure OpenClaw:

```bash
openclaw config set OPENROUTER_API_KEY=your_key_here
```

Now install the free model manager:

```bash
clawhub install free-ride
```

This skill automatically configures OpenClaw to use the best available free models on OpenRouter. You get access to capable models at zero cost. The free tier has rate limits, but they are generous enough for personal use.

### Step 3 — Install Your Security Foundation (Free)

Security skills cost nothing and protect everything. Install these before anything else:

```bash
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard
```

These three form your minimum viable security stack:
- `skill-vetter` scans every skill before you install it for malicious code
- `prompt-guard` blocks prompt injection attacks from web pages and emails
- `agentguard` prevents the agent from executing dangerous system commands

Run the vetter on itself to confirm it works:

```bash
skill-vetter skill-vetter
```

### Step 4 — Install Core Free Skills

These skills require no API keys and no paid accounts:

```bash
clawhub install summarize
clawhub install weather
clawhub install obsidian
clawhub install youtube-summarizer
clawhub install openai-whisper
```

What each one gives you:
- `summarize` — condenses any URL, PDF, or document into a short digest
- `weather` — real-time weather and forecasts for any location
- `obsidian` — reads, writes, and searches your local Obsidian vault
- `youtube-summarizer` — extracts key points from YouTube videos without watching them
- `openai-whisper` — transcribes audio and video files locally on your machine

### Step 5 — Set Up Google Workspace (Free with Google Account)

The `gog` skill connects to Gmail, Calendar, Drive, and Docs using your existing Google account:

```bash
clawhub install gog
```

When prompted, authorize with your Google account via OAuth. This is a first-party skill maintained by the OpenClaw creator, so the OAuth flow is straightforward. You now have:
- Email reading and drafting
- Calendar viewing and event creation
- Google Drive file search
- Google Docs creation

### Step 6 — Add Free Search Capabilities

Two excellent search skills work without paid API keys:

```bash
clawhub install exa-web-search-free
clawhub install brave-search
```

- `exa-web-search-free` uses Exa's free developer tier for AI-optimized search
- `brave-search` provides privacy-first search with no API key required for basic use

Together, these cover most search needs without any cost.

### Step 7 — Set Up Local File Search

For searching your own documents and files offline:

```bash
clawhub install gno
```

The `gno` skill uses hybrid BM25 + vector search across your local documents. It runs entirely on your machine with no cloud dependency. Perfect for asking "what did I write about X?" and getting accurate results from your own files.

### Step 8 — Add Free Productivity Tools

For task management on macOS:

```bash
clawhub install apple-reminders
```

This connects to Apple Reminders via the `remindctl` CLI. Tasks sync across all your Apple devices through iCloud. No additional accounts needed.

For daily planning:

```bash
clawhub install adhd-daily-planner
```

This skill structures your day through guided conversational prompts. No API keys, no accounts — just a focused planning session.

### Step 9 — Configure Local Audio Transcription

The `openai-whisper` skill you installed in Step 4 can run entirely locally. Configure it for local-only mode:

```bash
openclaw config set WHISPER_MODE=local
```

This means your audio never leaves your machine. Transcription quality is excellent for English and good for dozens of other languages. The first run will download the model (approximately 1.5 GB), but after that it works offline.

### Step 10 — Set Up Automation

Create a cron job for daily tasks. OpenClaw supports scheduled commands:

```bash
openclaw cron add "0 7 * * * openclaw run 'Check my calendar for today and summarize any unread important emails'" --name morning-brief
```

This runs every morning at 7:00 AM, giving you a daily briefing using only free skills.

---

## Key Skills Used

| Skill | Cost | What It Does |
|---|---|---|
| `free-ride` | Free | Routes to free AI models on OpenRouter |
| `skill-vetter` | Free | Pre-install security scanning |
| `prompt-guard` | Free | Blocks prompt injection attacks |
| `agentguard` | Free | Runtime safety guardrails |
| `summarize` | Free | Summarizes URLs, PDFs, documents |
| `weather` | Free | Weather forecasts |
| `obsidian` | Free | Local Obsidian vault integration |
| `youtube-summarizer` | Free | YouTube video summaries |
| `openai-whisper` | Free (local) | Audio/video transcription |
| `gog` | Free (Google account) | Gmail, Calendar, Drive, Docs |
| `exa-web-search-free` | Free | AI-powered web search |
| `brave-search` | Free | Privacy-first web search |
| `gno` | Free | Local document search |
| `apple-reminders` | Free (macOS) | Apple Reminders integration |
| `adhd-daily-planner` | Free | Guided daily planning |

---

## Automation Examples

### Morning Briefing
```bash
openclaw cron add "0 7 * * 1-5 openclaw run 'Give me today weather, calendar events, and top 3 unread emails'" --name weekday-morning
```

### Weekly YouTube Digest
```bash
openclaw cron add "0 18 * * 0 openclaw run 'Summarize the latest videos from my subscribed channels this week'" --name weekly-youtube
```

### Daily Note Capture
```bash
openclaw cron add "0 21 * * * openclaw run 'Create a daily note in Obsidian summarizing what I worked on today based on my calendar'" --name daily-note
```

### Weekend Weather Check
```bash
openclaw cron add "0 8 * * 6 openclaw run 'Give me the weekend weather forecast and suggest outdoor activities'" --name weekend-weather
```

### Monthly Security Audit
```bash
openclaw cron add "0 10 1 * * openclaw run 'Run skill-vetter on all installed skills and report any issues'" --name monthly-security
```

---

## Tips and Best Practices

1. **Start with free-ride before anything else.** Without a working AI model, no skills will function. The free-ride skill ensures you always have a capable model available at zero cost.

2. **Use local tools whenever possible.** Skills like `openai-whisper`, `obsidian`, and `gno` run entirely on your machine. They are faster, more private, and never hit rate limits.

3. **Layer your search skills.** Use `brave-search` for general queries and `exa-web-search-free` for technical or AI-optimized results. Between the two, you rarely need a paid search API.

4. **Keep your Obsidian vault organized.** The `gno` and `obsidian` skills work best when your notes have clear titles and consistent folder structure. This makes local search significantly more accurate.

5. **Monitor your OpenRouter usage.** Even on the free tier, models have daily token limits. Use simple queries for routine tasks and save complex reasoning for when you actually need it.

---

## Common Gotchas

1. **OpenRouter free tier rate limits.** If you hit "rate limit exceeded" errors, wait 60 seconds or switch to a different free model. The `free-ride` skill handles this automatically in most cases, but heavy usage during peak hours can still trigger limits.

2. **Whisper model download on first run.** The first time you use `openai-whisper` in local mode, it downloads a 1.5 GB model. This can look like the skill is frozen. Give it time — subsequent runs are fast.

3. **Google OAuth token expiry.** The `gog` skill's OAuth token expires periodically. If you get authentication errors, run `clawhub auth refresh gog` to re-authorize. This is a Google security feature, not a bug.

---

## Sample Daily Workflows Using Only Free Tools

### The Student Workflow

Morning:
"What is on my calendar today? Any assignment deadlines this week?"

During study sessions:
"Summarize this article: [URL of assigned reading]"
"Summarize this lecture video: [YouTube URL]. Give me the key concepts and any formulas."

Evening:
"Save today's study notes to Obsidian under /Classes/[course name]."

This workflow uses `gog` for calendar, `summarize` for reading, `youtube-summarizer` for lectures, and `obsidian` for note storage. Total cost: zero.

### The Job Seeker Workflow

Morning:
"Search for remote software engineering jobs posted in the last week."

Research phase:
"Summarize the company page for [company name]. What do they do? What is their culture like?"
"Search my Obsidian vault for any notes I have about [company name]."

Application tracking:
"Add a reminder to follow up with [company] in one week."
"Save the job posting details to Obsidian under /Job-Search/[company]."

This uses `brave-search` for job hunting, `summarize` for company research, `obsidian` for tracking, `gno` for searching past notes, and `apple-reminders` for follow-ups. Total cost: zero.

### The Freelancer Workflow

Start of day:
"What is my schedule today? Any emails from clients?"

During work:
"Transcribe this client call recording." (via `openai-whisper`)
"Summarize the key action items from that transcript."
"Save the meeting notes and action items to Obsidian."

End of day:
"Create a daily summary note in Obsidian with what I accomplished today."

All local, all free, all private.

---

## Understanding the Free Tier Limits

Here is what you can realistically do on free tiers before hitting limits:

| Service | Daily Free Limit | What That Means |
|---|---|---|
| OpenRouter free models | ~100-200 requests/day | Enough for 50-100 conversations |
| Brave Search (basic) | Unlimited basic queries | No practical limit for personal use |
| Exa free tier | ~1,000 searches/month | About 33 searches per day |
| Google (via `gog`) | Standard Gmail/Calendar limits | No practical limit for personal use |
| Local skills (Whisper, Obsidian, gno) | Unlimited | Runs on your hardware |

The bottleneck is almost always the AI model, not the skills. If you find yourself hitting OpenRouter limits regularly, that is the signal to consider a paid model — but most personal use stays well within free tier boundaries.

---

## Next Steps

Once you have this free setup running smoothly, consider these upgrades:

- **Add `tavily-web-search`** for higher-quality search results (free tier available with API key signup)
- **Install `agent-browser`** for browser automation (free, uses local Chrome/Playwright)
- **Try `automation-workflows`** to build multi-step automations without code
- **Explore `self-improving-agent`** to make your agent learn your preferences over time
- **Install `claw-audit`** for periodic security health checks as your skill count grows
- When you are ready for paid services, the `gog` skill combined with `tavily-web-search` and a paid AI model transforms the experience significantly

The free setup described here covers 80% of what most people need from a personal AI assistant. Paid upgrades are nice-to-have, not need-to-have.

### When to Consider Paying

You should consider upgrading from free models when:
- You consistently hit rate limits during normal use
- You need the agent to handle complex multi-step reasoning tasks
- You are using the agent for professional work where accuracy is critical
- You want faster response times during peak hours

The cheapest upgrade path is adding a `TAVILY_API_KEY` (free tier gives 1,000 searches/month) and switching to a paid OpenRouter model. This costs approximately $5-15/month for moderate personal use and dramatically improves response quality for complex tasks.
