# OpenClaw for Beginners (Alex Finn Style) — OpenClaw Reference Guide

## What This Covers
This beginner-friendly tutorial walks you through your first day with OpenClaw, from installation to your first useful automation. Inspired by Alex Finn's approachable teaching style, it breaks down every concept into plain language and builds your confidence step by step. By the end, you will have a working OpenClaw setup with real skills doing real things.

## Who This Is For
- Complete beginners who have never used OpenClaw or any AI agent tool
- People who are comfortable using a computer but not necessarily the command line
- Anyone who heard about OpenClaw and wants to understand what it actually does
- Non-technical users who want to automate daily tasks without writing code

## Prerequisites
- A computer running macOS, Windows, or Linux
- An internet connection
- A Google account (for Gmail, Calendar, and Drive integration)
- About 30 minutes of uninterrupted time
- No coding experience required

---

## Step-by-Step Walkthrough

### Step 1: What Is OpenClaw, Really?

Think of OpenClaw as a personal assistant that lives in your computer. You type what you want in plain English, and it does things for you — checks your email, summarizes long documents, looks up the weather, manages your to-do list, and much more.

The magic comes from "skills." Each skill teaches OpenClaw how to do one specific thing. Want it to read your Gmail? Install the Gmail skill. Want it to check the weather? Install the weather skill. You build your own custom assistant by choosing which skills to install.

### Step 2: Install Your Security Foundation

Before installing any fun skills, you need to protect yourself. This is non-negotiable. The OpenClaw skill registry is open, and not every skill out there is trustworthy.

Install the security essentials first:

```
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard
```

Here is what each one does:

- **`skill-vetter`** scans any skill before you install it, checking for malicious code or suspicious behavior. Think of it as a bouncer at the door.
- **`prompt-guard`** protects the agent when it reads external content like emails or web pages that might contain hidden instructions trying to hijack it.
- **`agentguard`** acts as a safety net that blocks dangerous actions before they execute — like preventing accidental file deletion.

From now on, before installing any new skill, run:
```
skill-vetter <skill-name>
```

### Step 3: Install Your First Real Skill — Weather

Let us start with something simple and satisfying. The weather skill needs zero configuration:

```
clawhub install weather
```

That is it. Now you can ask OpenClaw things like:
- "What's the weather in New York today?"
- "Will it rain this weekend in London?"
- "What should I wear tomorrow in San Francisco?"

You just installed your first skill. It took about 5 seconds. Every skill works the same way.

### Step 4: Install the Summarize Skill

The `summarize` skill is one of the most universally useful tools in OpenClaw. It takes any URL, PDF, audio recording, or document and turns it into a concise summary:

```
clawhub install summarize
```

No API keys. No configuration. Just install and use. Try it:
- "Summarize this article: [paste any URL]"
- "Give me the key points from this PDF" (drag and drop a file)
- "What are the main takeaways from this 2-hour podcast?"

This single skill saves most people 30-60 minutes per day by eliminating the need to read or listen to everything in full.

### Step 5: Connect Your Google Account

The `gog` skill is the big one. It connects OpenClaw to your entire Google Workspace — Gmail, Calendar, Drive, Docs, and Sheets — in a single installation:

```
clawhub install gog
```

This skill requires you to sign in with your Google account through OAuth. Follow the prompts when they appear. You will be asked to grant permissions for email, calendar, and drive access.

Once connected, you can:
- "Show me my unread emails"
- "What meetings do I have today?"
- "Find the document I was working on last week"
- "Draft a reply to the email from Sarah about the project update"

The `gog` skill alone transforms OpenClaw from a novelty into something genuinely useful for daily life.

### Step 6: Set Up a Note-Taking System

Choose one of these based on what you already use:

**If you use Obsidian:**
```
clawhub install obsidian
```
This connects to your local Obsidian vault. No API keys needed. The agent can read, write, search, and link notes in your vault.

**If you use Notion:**
```
clawhub install notion
```
This requires a Notion Integration Token. You can create one at notion.so/my-integrations. Once connected, the agent can create pages, update databases, and query your workspace.

**If you do not use either:**
Start with `obsidian`. It is free, local (your notes never leave your machine), and the skill ships bundled with OpenClaw.

### Step 7: Add Web Search

You already have `summarize` for processing content. Now add the ability to find content:

```
clawhub install exa-web-search-free
```

The `exa-web-search-free` skill provides AI-powered web search at no cost. No API key required for the free tier. It is particularly good at finding technical content, documentation, and code examples.

If you want broader web search coverage and do not mind setting up an API key:
```
clawhub install tavily-web-search
```

This requires a `TAVILY_API_KEY` from a free Tavily account. It returns cleaner, more structured results than traditional search engines.

### Step 8: Add a Task Manager

Everyone needs a way to track what they need to do. Pick the one that matches your setup:

**If you use Apple devices:**
```
clawhub install apple-reminders
```
No API keys. Works on macOS 14 and above. Syncs with iCloud so reminders appear on all your Apple devices.

**If you use Things 3:**
```
clawhub install things-mac
```
Full Things 3 management from the agent. Requires Things 3 to be installed on macOS.

**If you want cross-platform:**
```
clawhub install todoist
```
Requires a `TODOIST_API_TOKEN`. Works everywhere — web, mobile, desktop.

**If you struggle with daily planning:**
```
clawhub install adhd-daily-planner
```
This is not a traditional task manager. It guides you through a 5-minute daily planning conversation designed for brains that struggle with "where do I start today?"

### Step 9: Get YouTube Summaries

If you watch educational or informational YouTube content, this skill pays for itself immediately:

```
clawhub install youtube-summarizer
```

No API key needed. Give it any YouTube URL and get a structured summary with key points and timestamps. A 45-minute video becomes a 30-second read.

### Step 10: Explore Browser Automation

If you want the agent to interact with websites for you — filling forms, checking prices, booking appointments — install the browser automation skill:

```
clawhub install agent-browser
```

The `agent-browser` skill uses your local Chrome browser (via Playwright) to navigate web pages, click buttons, fill forms, and extract data from dynamic sites. No API key required.

Example tasks:
- "Check the current price of [product] on Amazon"
- "Fill out this online form with my information"
- "Navigate to my bank's website and show me my recent transactions"

This skill is powerful but carries more risk than passive skills like `weather` or `summarize`. Always review what the agent plans to do before it interacts with sensitive websites. The `agentguard` skill you installed earlier will block dangerous actions, but use your judgment too.

### Step 11: Add Voice Transcription

If you record voice memos, attend meetings, or listen to lectures, the transcription skill is invaluable:

```
clawhub install openai-whisper
```

The `openai-whisper` skill runs OpenAI's Whisper model locally on your machine. This means no audio data leaves your computer — everything stays private. It turns voice memos, meeting recordings, and lectures into clean, searchable text.

Try it:
- Record a voice memo on your phone and transfer it to your computer
- Ask OpenClaw: "Transcribe this audio file"
- Get clean text output you can search, summarize, or save to your notes

### Step 12: Review What You Have Built

At this point, you have a working OpenClaw setup with:

| Skill | What It Does | API Key Needed? |
|---|---|---|
| `skill-vetter` | Scans skills before install | No |
| `prompt-guard` | Blocks prompt injection | No |
| `agentguard` | Blocks dangerous actions | No |
| `weather` | Weather forecasts | No |
| `summarize` | Summarizes any content | No |
| `gog` | Full Google Workspace | Google OAuth |
| `obsidian` or `notion` | Note-taking | No / Notion Token |
| `exa-web-search-free` | Web search | No |
| Task manager of choice | Task tracking | Varies |
| `youtube-summarizer` | YouTube summaries | No |

That is 10 skills, most requiring zero API keys, and you now have a genuinely useful AI assistant.

---

## Key Skills Used

| Skill | Why It Matters for Beginners |
|---|---|
| `skill-vetter` | Your first install — always. Scans every other skill before you trust it. |
| `prompt-guard` | Invisible protection that runs in the background, blocking hijack attempts. |
| `agentguard` | Safety net preventing the agent from doing anything dangerous on your machine. |
| `weather` | Zero-config first skill that proves OpenClaw works and is useful immediately. |
| `summarize` | The single highest-value skill for most people — saves time every single day. |
| `gog` | One skill that replaces switching between Gmail, Calendar, and Drive tabs. |
| `obsidian` | Free, local, private note-taking with zero cloud dependency. |
| `exa-web-search-free` | Web search without API costs or account setup. |
| `youtube-summarizer` | Instantly useful for anyone who watches educational content online. |
| `apple-reminders` | Native Apple integration with zero setup for macOS users. |

---

## Automation Examples

### 1. Morning Briefing
Ask OpenClaw to give you a daily summary every morning:
```
cron: 0 7 * * * → gog (unread emails + today's calendar) + weather → summarize
```
Result: A single digest with your emails, schedule, and weather before you start your day.

### 2. Weekly Article Digest
Automatically summarize saved articles every Sunday evening:
```
cron: 0 18 * * 0 → obsidian (tagged "to-read") → summarize → obsidian (save digest)
```

### 3. End-of-Day Task Review
Review completed and pending tasks every weekday at 5 PM:
```
cron: 0 17 * * 1-5 → todoist (today's tasks) → summarize → obsidian (daily log)
```

### 4. YouTube Learning Queue
Process a queue of saved YouTube links every evening:
```
cron: 0 20 * * * → youtube-summarizer (queued URLs) → obsidian (learning notes)
```

### 5. Weather-Based Morning Alert
Get a weather alert only on days with rain or extreme temperatures:
```
cron: 0 6 * * * → weather → alert if rain/extreme → gog (calendar note)
```

---

## Tips and Best Practices

1. **Start with free skills.** Most of the best OpenClaw skills require zero API keys. Do not let API key setup intimidate you — start with `weather`, `summarize`, `obsidian`, and `youtube-summarizer` and you already have a powerful setup.

2. **Run `skill-vetter` every time.** Before installing any new skill, always run `skill-vetter <skill-name>` first. It takes seconds and protects you from the thousands of malicious skills that have been uploaded to the registry.

3. **One skill at a time.** Do not install 20 skills on day one. Install one, try it out, understand what it does, then move to the next. Each skill you add should solve a specific problem you actually have.

4. **Talk to OpenClaw in plain English.** You do not need special commands or syntax. Just describe what you want: "Check my email," "What's the weather tomorrow," "Summarize this page." The agent understands natural language.

5. **Keep your notes in one place.** Whether you choose `obsidian` or `notion`, commit to one and let the agent build your knowledge base there. Scattered notes across multiple systems defeats the purpose of having an AI assistant organize things for you.

---

## Common Gotchas

1. **Forgetting to install security skills first.** If you skip `skill-vetter`, `prompt-guard`, and `agentguard`, you are running skills on your machine without any safety checks. The ClawHavoc attack in February 2026 put over 1,000 malicious skills in the registry. Always install security first.

2. **Google OAuth confusion.** When installing `gog`, the OAuth flow opens a browser window. If it seems stuck, check that your default browser is not blocking popups. Some users need to copy the authorization URL manually into their browser.

3. **Expecting instant perfection.** OpenClaw gets better the more you use it. The `self-improving-agent` skill (which you can install later) logs your preferences and adapts over time. On day one, you may need to rephrase requests or provide more context. By week two, the agent knows your patterns.

---

## Next Steps

- Explore the `agent-browser` skill for browser automation — fill forms, check prices, and navigate websites hands-free
- Try the `openai-whisper` skill to transcribe voice memos and meeting recordings locally
- Look into `healthy-eating` for meal logging and nutrition tracking through conversation
- Consider `home-assistant` if you have smart home devices you want to control from chat
- When you are comfortable, read the Advanced Templates tutorial for building reusable multi-skill configurations
- Install `auto-updater` to keep all your skills current without manual checks
