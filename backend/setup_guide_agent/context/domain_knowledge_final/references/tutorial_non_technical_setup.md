# OpenClaw Setup for Non-Technical Users — OpenClaw Reference Guide

## What This Covers
This is a complete, jargon-free guide to setting up OpenClaw if you have never used a terminal, command line, or programming tool in your life. Every step is explained in plain language with exact commands to copy and paste. By the end, you will have a working AI assistant that handles email, calendar, weather, web search, and note-taking — without writing a single line of code.

## Who This Is For
Anyone who is not a programmer, developer, or IT professional. You might be an office worker, a teacher, a small business owner, a retiree, or a student in a non-technical field. You have heard about OpenClaw and want to try it, but the setup guides you have found assume too much technical knowledge. This guide assumes nothing.

## Prerequisites
- A Mac computer running macOS 14 (Sonoma) or later, OR a Windows PC with Windows 11, OR a Linux computer
- An internet connection
- A Google account (Gmail)
- About 45 minutes of uninterrupted time
- Patience — the first time is the hardest, and it gets easier quickly

---

## Step-by-Step Walkthrough

### What is OpenClaw, Really?

Before we start, a quick explanation. OpenClaw is a program that runs on your computer and acts as a personal AI assistant. You type requests in plain English, and it does things for you — checks your email, looks up the weather, searches the web, takes notes. It gets smarter over time by learning your preferences.

Think of it like having a very capable personal secretary who lives inside your computer.

### Part 1 — Opening the Terminal

Everything in this guide happens in a program called the "Terminal." It is a text-based way to talk to your computer. Do not be intimidated — you will only be copying and pasting commands.

**On Mac:**
1. Press Command + Space to open Spotlight
2. Type "Terminal" and press Enter
3. A window with a blinking cursor appears — this is your terminal

**On Windows:**
1. Press the Windows key
2. Type "PowerShell" and click "Windows PowerShell"
3. A blue window with a blinking cursor appears

**On Linux:**
1. Press Ctrl + Alt + T
2. A terminal window opens

Keep this window open throughout the entire setup process.

### Part 2 — Installing OpenClaw

Copy the command below, paste it into your terminal, and press Enter.

**On Mac:**
```bash
brew install openclaw
```

If you see "brew: command not found," you need to install Homebrew first. Copy and paste this:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
Follow the prompts (it may ask for your computer password — this is your Mac login password). Then try `brew install openclaw` again.

**On Windows (WSL2 required):**
First, install WSL2 by opening PowerShell as Administrator and running:
```bash
wsl --install
```
Restart your computer. After restart, open the Ubuntu app from your Start menu, then run:
```bash
curl -fsSL https://get.openclaw.ai | sh
```

**On Linux:**
```bash
curl -fsSL https://get.openclaw.ai | sh
```

#### Verify It Worked

Type this and press Enter:
```bash
openclaw --version
```

You should see a version number like "v3.2.1". If you see an error, the installation did not work — try the installation command again or check the OpenClaw website for troubleshooting.

### Part 3 — Setting Up Your AI Brain

OpenClaw needs an AI model to think with. The easiest free option is OpenRouter.

1. Open your web browser and go to: openrouter.ai
2. Click "Sign Up" and create a free account
3. After signing in, look for "API Keys" in the menu
4. Click "Create Key" and give it any name (like "my openclaw")
5. Copy the key that appears (it looks like a long string of random letters and numbers)

Now go back to your terminal and type (replacing YOUR_KEY_HERE with the key you copied):

```bash
openclaw config set OPENROUTER_API_KEY=YOUR_KEY_HERE
```

Install the free model manager:

```bash
clawhub install free-ride
```

This ensures you always use free AI models, so you will never be charged.

### Part 4 — Installing Security Protection

These three commands protect your computer from malicious software. Copy and paste each one, pressing Enter after each:

```bash
clawhub install skill-vetter
```

```bash
clawhub install prompt-guard
```

```bash
clawhub install agentguard
```

What these do in plain language:
- `skill-vetter` checks any new program you add for viruses or suspicious behavior
- `prompt-guard` prevents malicious content in emails or websites from tricking your assistant
- `agentguard` stops the assistant from accidentally doing anything dangerous on your computer

These run silently in the background. You do not need to do anything with them after installation.

### Part 5 — Installing Your Assistant's Abilities

Now we give your assistant useful abilities. Copy and paste each command:

**Email and Calendar (connects to your Google account):**
```bash
clawhub install gog
```

After this installs, a web browser window will open asking you to sign in to Google. Sign in with your Gmail account and click "Allow" on the permissions page. This lets your assistant read your email and calendar.

**Weather forecasts:**
```bash
clawhub install weather
```

**Web search (free, no account needed):**
```bash
clawhub install brave-search
```

**Summarize articles and documents:**
```bash
clawhub install summarize
```

**Note taking:**
```bash
clawhub install obsidian
```

For Obsidian, create a folder where your notes will live:
```bash
mkdir -p ~/Documents/MyNotes
```

Tell OpenClaw where your notes folder is:
```bash
openclaw config set OBSIDIAN_VAULT_PATH=~/Documents/MyNotes
```

### Part 6 — Talking to Your Assistant

You are now set up. Here is how to use OpenClaw. Type this in your terminal:

```bash
openclaw chat
```

This starts a conversation with your assistant. You type in plain English, and it responds. Try these:

**Check the weather:**
"What is the weather like today?"

**Check your email:**
"Do I have any unread emails? Show me the most important ones."

**Check your calendar:**
"What is on my calendar for today?"

**Search the web:**
"Search for the best restaurants near me."

**Summarize an article:**
"Summarize this article: [paste a URL here]"

**Take a note:**
"Save a note called 'Grocery List' with: milk, bread, eggs, butter."

**Find a note:**
"Search my notes for 'Grocery List'."

To stop chatting, type `exit` or press Ctrl + C.

### Part 7 — Setting Up Daily Automation

You can tell OpenClaw to do things automatically at certain times. The most useful one is a morning briefing.

Copy and paste this command:

```bash
openclaw cron add "0 7 * * 1-5 openclaw run 'Good morning. Give me the weather, my calendar for today, and a summary of urgent emails.'" --name morning-briefing
```

What this does: Every weekday (Monday through Friday) at 7:00 AM, your assistant will automatically check the weather, your calendar, and your email, and prepare a summary for you.

To see your automated tasks:
```bash
openclaw cron list
```

To remove an automated task:
```bash
openclaw cron remove morning-briefing
```

### Part 8 — Adding Task Management

If you use an iPhone or Mac, you can manage your reminders and to-do lists:

```bash
clawhub install apple-reminders
```

Now you can say:
- "Add a reminder to pick up dry cleaning tomorrow at 3 PM"
- "What reminders do I have for this week?"
- "Mark the dry cleaning reminder as done"

If you prefer a cross-platform option that works on any device:

```bash
clawhub install todoist
```

This requires a free Todoist account. Sign up at todoist.com, then find your API token in Todoist Settings and configure it:

```bash
openclaw config set TODOIST_API_TOKEN=YOUR_TODOIST_TOKEN
```

### Part 9 — Watching YouTube Without Watching YouTube

This is a favorite for many users. Install the YouTube summarizer:

```bash
clawhub install youtube-summarizer
```

Now when someone sends you a long YouTube video, instead of watching the whole thing, paste the URL and ask:

"Summarize this YouTube video: [URL]. Give me the key points in 5 bullet points."

You get the important content in 30 seconds instead of 45 minutes.

### Part 10 — Daily Planning Help

If you struggle with planning your day or staying focused:

```bash
clawhub install adhd-daily-planner
```

Start your day by saying:
"Help me plan my day. I need to [list your tasks]. Help me prioritize and create a schedule."

This skill uses guided prompts to help you organize your time. It is designed to work especially well for people who find traditional planning tools overwhelming.

---

## Key Skills Used

| Skill | What It Does | Do I Need an Account? |
|---|---|---|
| `skill-vetter` | Protects you from bad software | No |
| `prompt-guard` | Blocks tricks from websites/emails | No |
| `agentguard` | Prevents dangerous computer actions | No |
| `free-ride` | Uses free AI models | Free OpenRouter account |
| `gog` | Email, calendar, Google Drive | Google account (you have one) |
| `weather` | Weather forecasts | No |
| `brave-search` | Web search | No |
| `summarize` | Summarizes articles and documents | No |
| `obsidian` | Takes and searches notes | No |
| `apple-reminders` | Manages Apple Reminders | No (Mac only) |
| `todoist` | Cross-platform to-do lists | Free Todoist account |
| `youtube-summarizer` | Summarizes YouTube videos | No |
| `adhd-daily-planner` | Helps plan your day | No |

---

## Automation Examples

### Morning Briefing (Weekdays)
```bash
openclaw cron add "0 7 * * 1-5 openclaw run 'Weather, calendar, and urgent emails summary'" --name morning
```

### Evening Reminder Check
```bash
openclaw cron add "0 18 * * * openclaw run 'What reminders or tasks do I still have open for today?'" --name evening-check
```

### Weekend Weather
```bash
openclaw cron add "0 9 * * 6 openclaw run 'What is the weather forecast for this weekend?'" --name weekend-weather
```

### Weekly Email Summary
```bash
openclaw cron add "0 10 * * 0 openclaw run 'Give me a summary of all important emails from this past week that I may have missed'" --name weekly-email
```

---

## Tips and Best Practices

1. **Start simple.** Use your assistant for one thing per day for the first week. Get comfortable with weather and calendar before trying email or notes.

2. **Talk naturally.** You do not need special commands or keywords. Just type what you want in plain English: "What is the weather?" works just as well as "Provide current meteorological conditions."

3. **Save useful notes.** When the assistant gives you information you want to keep, say "Save that to my notes." Building a habit of note-taking makes the assistant more valuable over time.

4. **Do not worry about mistakes.** You cannot break anything by typing the wrong thing in a conversation. The worst that happens is the assistant misunderstands and you ask again.

5. **Use the morning briefing.** Set up the automated morning briefing (Part 7) and let it run for a week. Most people find this alone is worth the entire setup effort.

---

## Common Gotchas

1. **"Command not found" errors.** If you see this after installing OpenClaw, close your terminal window completely and open a new one. Sometimes the computer needs to refresh before it recognizes new programs.

2. **Google sign-in problems.** When connecting your Google account, make sure you click "Allow" on every permissions screen. If you accidentally click "Deny," run `clawhub auth refresh gog` to try again.

3. **The terminal closes unexpectedly.** If your terminal window closes while you are chatting with the assistant, just open a new terminal and type `openclaw chat` again. Nothing is lost — the assistant remembers previous conversations.

---

## Next Steps

You now have a working AI assistant. Here is what to do next, in order:

1. **Use it daily for a week.** Just the morning briefing and occasional questions. Get comfortable.

2. **After one week:** Start using it for email triage. Ask "Show me unread emails and summarize the important ones."

3. **After two weeks:** Start saving notes regularly. Ask the assistant to save interesting findings, decisions, and ideas.

4. **After one month:** Consider adding more skills if you have specific needs. The minimalist tutorial in this guide series covers the philosophy of keeping things simple.

5. **If something breaks:** Do not panic. Run `openclaw --version` to check if OpenClaw is still installed. If it is, the issue is usually a temporary API or network problem that resolves itself.

You did it. You set up an AI assistant without writing any code. Everything from here gets easier.
