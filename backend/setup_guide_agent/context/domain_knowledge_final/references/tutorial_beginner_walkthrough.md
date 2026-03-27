# Beginner Walkthrough: Your First Hour with OpenClaw — OpenClaw Reference Guide

## What This Covers
This step-by-step walkthrough takes you from zero to a fully functional OpenClaw setup in about one hour. Every single step is explained in detail, with no assumptions about prior experience. By the end, you will have OpenClaw running with security protections, connected to your email and calendar, able to search the web and summarize content, and managing your tasks — all through plain English conversation.

## Who This Is For
- Absolute beginners who have never heard of OpenClaw before today
- People who are curious about AI assistants but intimidated by the technical setup
- Anyone who wants a guided, hand-held walkthrough with nothing left to guesswork
- Non-technical users who follow instructions well but do not want to troubleshoot on their own

## Prerequisites
- A computer running macOS (recommended), Windows, or Linux
- An internet connection
- A Google account (Gmail)
- A web browser
- Approximately 60 minutes of focused time
- No coding, terminal, or technical experience required

---

## Step-by-Step Walkthrough

### Phase 1: Understanding What You Are About to Do (5 minutes)

OpenClaw is software that runs on your computer and acts as a personal AI assistant. Unlike Siri or Alexa, OpenClaw is extensible — you add capabilities called "skills" to teach it new things.

Here is the mental model:
- **OpenClaw** = the assistant's brain
- **Skills** = things the brain knows how to do
- **ClawHub** = the store where you get skills
- **`clawhub install`** = the command to add a new skill

You will be typing commands into a text interface called the terminal. Do not worry — every command will be given to you exactly as you need to type it.

### Phase 2: Opening the Terminal (2 minutes)

**On macOS:**
- Press Command + Space to open Spotlight
- Type "Terminal" and press Enter
- A window with a text prompt will appear — this is where you type commands

**On Windows:**
- Press Windows + R
- Type "cmd" and press Enter
- A command prompt window will appear

**On Linux:**
- Press Ctrl + Alt + T
- A terminal window will appear

You should now see a blinking cursor waiting for your input. Everything from here on happens in this window.

### Phase 3: Install OpenClaw (5 minutes)

Follow the installation instructions from the official OpenClaw website at getopenclaw.ai. The installer will download and configure OpenClaw on your system.

After installation, verify it worked by typing:
```
openclaw --version
```

You should see a version number. If you do, OpenClaw is installed. If you see an error, revisit the installation steps.

### Phase 4: Install Security Protections (5 minutes)

This is the most important phase. Do not skip it. Do not come back to it later. Do it now.

The OpenClaw skill registry is open, and in February 2026, an attack called ClawHavoc placed over 1,000 malicious skills in the registry. Three skills protect you:

**Install `skill-vetter`:**
```
clawhub install skill-vetter
```
This scans any skill for malicious code before you install it. It is your bouncer at the door. 86,800 people have downloaded it. It is non-negotiable.

**Install `prompt-guard`:**
```
clawhub install prompt-guard
```
This protects the agent when it reads external content — emails, web pages, documents — that might contain hidden instructions trying to hijack the agent. It runs invisibly in the background.

**Install `agentguard`:**
```
clawhub install agentguard
```
This is your runtime safety net. It blocks dangerous actions before they execute. Think of it as a circuit breaker between the agent and your machine.

From this point forward, before installing any new skill, always run:
```
skill-vetter <skill-name>
```

Replace `<skill-name>` with the name of whatever skill you want to install next. If `skill-vetter` says it is safe, proceed with the install.

### Phase 5: Your First Skill — Weather (3 minutes)

Start with something simple and immediately satisfying:

```
skill-vetter weather
clawhub install weather
```

No API keys. No configuration. No accounts. Just install and ask:

- "What's the weather right now?"
- "Will it rain tomorrow?"
- "What's the forecast for this weekend?"

Congratulations — you just installed a skill, used it, and got useful results. Every other skill works the same basic way.

### Phase 6: Install the Summarize Skill (3 minutes)

The `summarize` skill is arguably the most useful single skill in OpenClaw. It takes any content and condenses it:

```
skill-vetter summarize
clawhub install summarize
```

Try these:
- Give it any web URL: "Summarize this page: [URL]"
- Give it a long document: "Give me the key points from this"
- Give it a YouTube link: "What are the main takeaways?"

This skill alone saves most people 30-60 minutes daily by eliminating the need to read everything in full.

### Phase 7: Connect Google Workspace (10 minutes)

This is the step that transforms OpenClaw from interesting to indispensable. The `gog` skill connects your Gmail, Google Calendar, Google Drive, Google Docs, and Google Sheets in one installation:

```
skill-vetter gog
clawhub install gog
```

During installation, a browser window will open asking you to sign in to your Google account and grant permissions. Here is what to expect:

1. Click "Sign in with Google"
2. Choose your Google account
3. Review the permissions (email, calendar, drive access)
4. Click "Allow"
5. The browser will confirm success
6. Return to the terminal — the skill is now connected

If the browser window does not open automatically, look for a URL printed in the terminal. Copy it and paste it into your browser manually.

Now try:
- "Show me my unread emails"
- "What meetings do I have today?"
- "Find the document about [topic] in my Drive"
- "What's on my calendar this week?"
- "Draft a reply to the latest email from [name]"

Take a moment to appreciate what just happened. You connected your entire Google Workspace to your AI assistant with a single command.

### Phase 8: Set Up Note-Taking (5 minutes)

Choose based on what you already use:

**Option A: Obsidian (recommended for new users)**
```
skill-vetter obsidian
clawhub install obsidian
```
Obsidian is free and keeps everything local on your machine. No accounts. No cloud. No API keys. The skill reads, writes, searches, and links notes in your vault.

**Option B: Notion**
```
skill-vetter notion
clawhub install notion
```
Requires a Notion Integration Token. Go to notion.so/my-integrations to create one. More setup, but works well if you already use Notion.

### Phase 9: Add Web Search (5 minutes)

Give the agent the ability to search the internet:

```
skill-vetter exa-web-search-free
clawhub install exa-web-search-free
```

This provides AI-powered web search with no API key and no cost. Particularly good for finding technical content, documentation, and detailed answers.

For broader, general-purpose search:

```
skill-vetter brave-search
clawhub install brave-search
```

Brave Search is privacy-first and works without an API key for basic use. No Google tracking.

Now try:
- "Search for the best restaurants in [your city]"
- "Find recent news about [topic you care about]"
- "What are the current regulations on [topic]?"

### Phase 10: Add Task Management (5 minutes)

Everyone needs a task system. Pick one:

**For Apple users (macOS 14+):**
```
skill-vetter apple-reminders
clawhub install apple-reminders
```
Zero setup. Syncs with iCloud. Shows up on iPhone, iPad, Mac, and Apple Watch.

**For cross-platform needs:**
```
skill-vetter todoist
clawhub install todoist
```
Requires a `TODOIST_API_TOKEN` from your Todoist account settings. Works on every device and platform.

**For Things 3 users (macOS):**
```
skill-vetter things-mac
clawhub install things-mac
```
Full Things 3 management. Requires Things 3 to be installed.

**If daily planning is your struggle:**
```
skill-vetter adhd-daily-planner
clawhub install adhd-daily-planner
```
Not a task list — it is a guided planning conversation that helps you figure out what to do today. Works for anyone, not just people with ADHD.

### Phase 11: Add YouTube Summaries (3 minutes)

If you watch any educational or informational YouTube content:

```
skill-vetter youtube-summarizer
clawhub install youtube-summarizer
```

Give it any YouTube URL. Get a structured summary with key points. A 45-minute video becomes a 30-second read.

### Phase 12: Review Your Setup (5 minutes)

Take stock of what you have built. Your OpenClaw now has:

| Skill | What It Does | Setup Complexity |
|---|---|---|
| `skill-vetter` | Security scanning | None |
| `prompt-guard` | Content protection | None |
| `agentguard` | Action safety net | None |
| `weather` | Weather forecasts | None |
| `summarize` | Content summarization | None |
| `gog` | Google Workspace | Google OAuth |
| `obsidian` or `notion` | Note-taking | None / Token |
| `exa-web-search-free` | Web search | None |
| `brave-search` | Privacy web search | None |
| Task manager | Task tracking | Varies |
| `youtube-summarizer` | Video summaries | None |

That is 11 skills. You built a custom AI assistant in about an hour. Most skills required zero configuration.

### Phase 13: Learn the Daily Rhythm (5 minutes)

Here is how most people use OpenClaw day to day:

**Morning:**
- "What's the weather today?"
- "Show me my calendar"
- "Any urgent emails?"
- "What are my tasks for today?"

**During work:**
- "Summarize this document I just received"
- "Search for [information I need for this project]"
- "Draft a reply to [person's] email about [topic]"
- "Add a task: finish the proposal by Friday"

**Evening:**
- "Summarize this YouTube video I saved"
- "What's on my calendar tomorrow?"
- "Save these notes about today's meeting to Obsidian"

The key insight: just talk to it like you would talk to a human assistant. There is no special syntax or command language to memorize.

---

## Key Skills Used

| Skill | Why It Is Essential for Beginners |
|---|---|
| `skill-vetter` | Protects you from malicious skills — always the first install |
| `prompt-guard` | Invisible background protection against prompt injection |
| `agentguard` | Prevents the agent from doing anything dangerous |
| `weather` | Simple, zero-config proof that OpenClaw works |
| `summarize` | Highest daily value for time savings across all skill levels |
| `gog` | Single skill that replaces tab-switching between Google apps |
| `obsidian` | Free, private, local note-taking with no cloud dependency |
| `exa-web-search-free` | Web search with no cost and no API key setup |
| `brave-search` | Privacy-respecting web search alternative |
| `apple-reminders` | Zero-setup task management for Apple users |
| `youtube-summarizer` | Instant time savings for anyone who watches online video |

---

## Automation Examples

### 1. Good Morning Briefing
Start every day with a single prompt that gathers everything:
```
cron: 0 7 * * * → weather + gog (calendar + email count) + todoist (today's tasks) → summarize
```

### 2. Save-for-Later Processing
Queue articles and videos during the day, process them at night:
```
cron: 0 21 * * * → obsidian (tagged "to-process") → summarize + youtube-summarizer → obsidian (processed)
```

### 3. Weekend Planning
Friday evening prep for the weekend:
```
cron: 0 17 * * 5 → weather (weekend forecast) + gog (weekend calendar) → summarize
```

### 4. Daily Note Creation
Automatically create a daily note template in Obsidian:
```
cron: 0 6 * * * → obsidian (create daily note template with date, weather, calendar preview)
```

### 5. Weekly Task Review
Review completed and pending tasks every Sunday:
```
cron: 0 18 * * 0 → todoist (completed this week) + todoist (overdue) → summarize → obsidian (weekly review)
```

---

## Tips and Best Practices

1. **Security is not optional.** The three security skills (`skill-vetter`, `prompt-guard`, `agentguard`) are not suggestions. They are requirements. Always install them first and always run `skill-vetter` before installing anything new.

2. **Speak naturally.** You do not need to use special commands. "Check my email" works. "What is the weather tomorrow in Chicago" works. "Summarize this" works. If the agent misunderstands, just rephrase like you would with a person.

3. **Start small, grow gradually.** You installed 11 skills today. Resist the urge to install 20 more tomorrow. Use what you have for a week. Notice what is missing. Then add skills to fill specific gaps.

4. **Everything is reversible.** If a skill does not work the way you expected or you do not use it, uninstall it. Nothing is permanent. You can always reinstall later.

5. **Check the weather first thing.** It sounds trivial, but starting each day with "What's the weather?" builds the habit of talking to OpenClaw. Habits compound. Within a week, you will naturally reach for the agent for everything.

---

## Common Gotchas

1. **The terminal closes and everything seems gone.** OpenClaw keeps running even when you close the terminal. Open a new terminal window and it is still there. Your skills, configuration, and data persist between sessions.

2. **Google OAuth flow seems stuck.** If the browser window does not appear during `gog` setup, check that your browser is not blocking popups. Look for a URL in the terminal output that you can copy and paste into your browser manually.

3. **"Command not found" errors.** If typing `clawhub` gives a "command not found" error, the installation did not complete properly or your terminal needs to be restarted. Close the terminal, open a new one, and try again. If it still fails, re-run the OpenClaw installer.

---

## Next Steps

- After one week of daily use, explore the `agent-browser` skill for browser automation
- Try the `openai-whisper` skill to transcribe voice memos and meetings locally
- Look into `auto-updater` to keep your skills automatically up to date
- When you feel comfortable, read the Productivity Workflows tutorial for advanced automation
- Consider `self-improving-agent` so the agent learns your preferences over time
- Explore `home-assistant` if you have smart home devices
- Review `healthy-eating` for conversational meal logging and nutrition tracking
- Install `clawscan` and `claw-audit` for deeper security as your skill count grows
