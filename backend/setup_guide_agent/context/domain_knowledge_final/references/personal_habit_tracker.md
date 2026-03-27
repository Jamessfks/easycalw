# Personal Habit Tracker — OpenClaw Reference Guide

## What This Does

This setup turns OpenClaw into a conversational habit tracking system that monitors your daily habits through natural check-ins, logs your progress over time, identifies patterns in your consistency, and provides gentle accountability nudges when you fall off track. Unlike traditional habit tracking apps that require you to open an app and tap checkboxes, this system meets you where you already are — in your chat interface, your morning briefing, or your messaging app — and turns habit tracking into a brief conversation rather than a chore.

## Who This Is For

**Profile:** Anyone trying to build or maintain daily habits — fitness routines, meditation practice, reading goals, hydration tracking, journaling, language learning, or any recurring personal behavior they want to reinforce.

**Industry:** Personal development and wellness. Particularly valuable for people with ADHD or executive function challenges who struggle with traditional app-based tracking, and for anyone who has downloaded habit tracking apps only to abandon them after two weeks.

**Pain point:** You know what habits you want to build, but you forget to track them, the tracking itself feels like a chore, and you lose motivation because you cannot see your progress. You need something that checks in with you rather than waiting for you to remember to open an app.

## OpenClaw Setup

### Required Skills

```bash
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard
clawhub install gog
clawhub install apple-reminders
clawhub install obsidian
clawhub install self-improving-agent
clawhub install summarize
```

**Skill explanations:**

- **gog** — Google Calendar integration for scheduling habit check-ins and blocking time for habits that need dedicated time slots (e.g., "30 minutes reading" or "gym session").
- **apple-reminders** — Creates reminder notifications on all Apple devices for habit check-ins. The agent creates timed reminders that ping your phone at the right moment. macOS only.
- **obsidian** — Stores habit logs, streaks, and analytics in your local Obsidian vault as structured markdown files. Gives you a permanent, searchable record of your habit data without any cloud dependency.
- **self-improving-agent** — Learns your patterns over time — when you are most likely to complete habits, what time of day you respond to check-ins, which phrasing motivates you vs. annoys you. Gets better at supporting you the longer you use it.
- **summarize** — Condenses weekly and monthly habit data into readable progress reports.

### Optional Skills

```bash
clawhub install apple-health-skill   # Sync workout/step data automatically instead of manual logging
clawhub install healthsync           # Deep Apple Health analysis for fitness-related habits
clawhub install healthy-eating       # If one of your habits is nutrition-related
clawhub install todoist              # If you prefer Todoist for task-based habit reminders
clawhub install notion               # If you track habits in a Notion database instead of Obsidian
clawhub install adhd-daily-planner   # If you have ADHD and want structured daily planning alongside habits
clawhub install weather              # Factor weather into outdoor habit recommendations
clawhub install telegram             # Receive check-ins via Telegram
clawhub install whatsapp-cli         # Receive check-ins via WhatsApp
clawhub install clawsignal           # Push notifications for check-ins via Signal
```

### Accounts and API Keys Required

| Service | What You Need | Where to Get It |
|---|---|---|
| Google Account | OAuth for Calendar | Google Cloud Console |
| Obsidian | Local vault (no account needed) | Install Obsidian, create a vault |
| Apple Reminders | macOS 14+ | Built into macOS |

### Hardware Recommendations

- Any Mac running macOS 14+ (for `apple-reminders` integration). Linux/Windows users should substitute with `todoist` for reminders.
- Always-on machine recommended so the agent can send check-ins at scheduled times even when your primary computer is off.
- No GPU needed.

### Channel Configuration

The habit tracker works best with a push notification channel so check-ins reach you proactively:

- **Recommended for Apple users:** `apple-reminders` for device notifications + OpenClaw chat for responses.
- **Recommended for cross-platform:** `telegram` or `whatsapp-cli` for check-ins you can respond to from your phone.
- **Signal users:** `clawsignal` for privacy-focused notifications.

## Core Automation Recipes

### 1. Morning Habit Check-In

```bash
openclaw cron add --at "07:00" "Good morning habit check-in. Ask me about each of my tracked habits for today. Present them as a simple checklist and let me respond with which ones I plan to do today. Record my intentions in my Obsidian habit log at Habits/daily/[today's date].md."
```

Starts the day with intention-setting. The agent asks what you plan to do, not what you have already done.

### 2. Habit Completion Prompts

```bash
openclaw cron add --at "09:00" "If 'morning meditation' is on today's plan, send a gentle reminder: 'Ready for your morning meditation? Even 5 minutes counts. Let me know when you're done.'"
```

```bash
openclaw cron add --at "12:30" "If 'midday walk' is on today's plan, remind me: 'Time for your midday walk. How about a 15-minute loop? Tell me when you're back.'"
```

```bash
openclaw cron add --at "20:00" "If 'evening reading' is on today's plan, remind me: 'Reading time — what are you reading tonight? Even 10 pages counts.'"
```

Create one of these for each habit at the time you typically do it. The agent adapts the phrasing over time via `self-improving-agent`.

### 3. Evening Habit Review

```bash
openclaw cron add --at "21:30" "Evening habit review. Check today's habit log. For any habits I planned but haven't confirmed completing, ask me about them one by one. Accept simple yes/no answers. Update the Obsidian log with completions and misses. Show me my streak count for each habit. If I completed all planned habits, celebrate briefly."
```

This is the daily close-out. Quick, conversational, and designed to take under 2 minutes.

### 4. Weekly Progress Report

```bash
openclaw cron add --at "09:00" --weekdays "sun" "Generate my weekly habit report. Read all habit logs from the past 7 days in my Obsidian vault. For each tracked habit, show: (1) completion rate (X/7 days or X/planned days), (2) current streak length, (3) longest streak ever, (4) trend vs. last week (improving, stable, declining). Highlight my strongest habit and the one that needs the most attention. Save this report to Habits/weekly/[week-date].md."
```

Weekly reflection is critical for long-term habit building. This report surfaces patterns you would not notice day-to-day.

### 5. Monthly Analytics and Trend Report

```bash
openclaw cron add --at "10:00" --monthday "1" "Generate my monthly habit analytics for last month. For each habit: (1) overall completion rate, (2) best and worst weeks, (3) day-of-week patterns (am I consistently missing habits on Fridays?), (4) correlation analysis (do I complete more habits on days when I completed my morning routine?). Include a month-over-month comparison. Save to Habits/monthly/[month].md."
```

### 6. Streak Protection Alert

```bash
openclaw cron add --at "19:00" "Check my habit streaks. If any habit has a streak of 7+ days and has not been logged today, send an urgent reminder: 'Your [habit name] streak is at [X] days — don't break it today! Even a minimal effort counts.' Priority: protect the longest streaks first."
```

Streak protection is one of the most effective motivational tools. The agent watches your streaks so you do not lose them to forgetfulness.

### 7. Auto-Log from Apple Health

```bash
openclaw cron add --every 2h "Check Apple Health data for today. If my step count has passed 10,000, automatically mark 'daily steps' as complete in my habit log. If a workout was recorded, mark 'exercise' as complete and note the type and duration. Do not ask me about these habits in the evening review — they are already confirmed."
```

Requires `apple-health-skill` or `healthsync`. Eliminates manual tracking for habits that your devices already measure.

### 8. Habit Difficulty Adjustment

```bash
openclaw cron add --at "10:00" --weekdays "mon" "Review my habit completion rates for the past 2 weeks. If any habit is below 30% completion, suggest reducing its scope (e.g., '30 minutes reading' to '10 minutes reading') and ask if I want to adjust. If any habit is at 100% for 2 weeks straight, suggest leveling up (e.g., '10 minutes meditation' to '15 minutes meditation')."
```

Prevents habits from being too ambitious (leading to abandonment) or too easy (no longer challenging).

## Guardrails and Safety

The agent must NEVER do the following autonomously:

1. **Never shame, guilt, or use negative language** about missed habits. The agent should be encouraging and matter-of-fact. "You missed meditation today — no worries, your streak starts fresh tomorrow" is acceptable. "You failed again" is never acceptable.

2. **Never share habit data with anyone.** Habit logs are deeply personal. The agent must not post streaks to social media, share progress in group chats, or sync habit data to any external service without explicit permission.

3. **Never add new habits without your approval.** The agent may suggest habits based on patterns it observes, but it must never start tracking a new habit or adding check-ins for something you did not explicitly request.

4. **Never modify historical habit data.** Logs are append-only. The agent should not retroactively change a miss to a completion or alter past records.

5. **Never send habit notifications during configured quiet hours.** Respect your sleep schedule and focus blocks. Configure quiet hours explicitly.

6. **Never make medical or health claims** based on habit data. The agent tracks behaviors, not outcomes. It should not say "your blood pressure improved because you meditated" or make any health correlation claims.

7. **Never escalate notification frequency without permission.** If you are missing habits, the agent may note the pattern but should not start sending more frequent reminders without being asked.

Configure guardrails:

```
- NEVER use negative, shaming, or guilt-inducing language about missed habits
- NEVER share my habit data with anyone or any external service
- NEVER add new habits without my explicit request
- NEVER modify historical habit log entries
- NEVER send notifications between 10pm and 7am unless I explicitly override
- Keep check-in messages brief — under 3 sentences unless I ask for detail
- Accept minimal responses (yes, no, done, skip) without requiring elaboration
```

## Sample Prompts

### Prompt 1: Initial Habit Setup

```
I want to track the following daily habits:

1. Morning meditation — 10 minutes, ideally before 8am
2. Exercise — at least 30 minutes, any form (gym, run, yoga, walk counts)
3. Read — at least 20 minutes, any book (not social media or news)
4. Drink water — 8 glasses throughout the day
5. Journal — 5 minutes of freewriting before bed
6. No phone in bed — no phone use after 10pm

For each habit, I want:
- A check-in reminder at the optimal time
- Evening review to catch anything I missed
- Streak tracking
- Weekly progress reports every Sunday morning

Store all data in my Obsidian vault under a "Habits" folder. Create a daily log template and start tracking from today.
```

### Prompt 2: Mid-Course Adjustment

```
I've been struggling with the exercise habit — I've only completed it 2 out of the last 10 days. Can you analyze why? Look at what days I did complete it and what was different. Then suggest a modified version that might be more achievable — maybe shorter duration or specific types of exercise on specific days.
```

### Prompt 3: Adding a New Habit with Scaffolding

```
I want to start a new habit: learning Spanish for 15 minutes per day using Duolingo. But I know from experience that new habits fail when I add them cold. Can you help me scaffold this in? Start with just 5 minutes for the first week, then increase to 10 minutes in week 2, and 15 minutes by week 3. Set the check-in for right after my morning meditation since that habit is already solid.
```

### Prompt 4: Vacation Mode

```
I'm on vacation from [date] to [date]. Pause all habit tracking except for 'read' and 'drink water'. Don't send any check-ins for paused habits. Resume full tracking the day after I return. Don't count the vacation days as broken streaks — freeze the streak counters.
```

### Prompt 5: Year in Review

```
Generate my habit year-in-review for 2025. For each habit I've tracked, show: total completion rate, longest streak, month with best consistency, month with worst consistency, and overall trend. Which habit am I most consistent with? Which one should I consider dropping or redesigning? What patterns do you see across all habits?
```

## Common Gotchas

### 1. Notification Fatigue

The number one reason people abandon habit tracking systems is too many notifications. If you track 8 habits and each gets a morning prompt, an optimal-time reminder, and an evening review, that is 24 agent messages per day. **Fix:** Start with 3-4 habits maximum. Group check-ins into batches (morning batch, evening batch) rather than individual per-habit notifications. Only enable mid-day reminders for habits you consistently forget. You can always add more granularity later.

### 2. Obsidian Vault Structure Issues

If you do not define a clear folder structure upfront, habit logs end up scattered across your vault and the agent cannot find historical data for reports. **Fix:** In your initial prompt, explicitly define the structure: `Habits/daily/YYYY-MM-DD.md` for daily logs, `Habits/weekly/YYYY-WXX.md` for weekly reports, `Habits/monthly/YYYY-MM.md` for monthly analytics. Use a consistent template from day one.

### 3. All-or-Nothing Thinking

Users often define habits as pass/fail ("exercise 30 minutes" — either you did it or you did not). This leads to discouragement when partial efforts are not recorded. **Fix:** Configure habits with partial credit. Tell the agent: "For exercise, log the actual duration even if it's under 30 minutes. A 10-minute walk still counts as partial completion. Show partial completions in a different color or format in my weekly report." This acknowledges effort and maintains motivation even on low-energy days.

## Maintenance and Long-Term Health

### The First Two Weeks Are Critical

The most common pattern with habit tracking systems is enthusiastic setup followed by rapid abandonment. To prevent this:

- **Week 1:** Track only 2-3 habits. Get the check-in rhythm working. Respond to every agent prompt, even if the answer is "no, I didn't do it." The goal is to establish the conversation pattern, not to be perfect at habits.
- **Week 2:** Add 1-2 more habits if week 1 felt manageable. Fine-tune reminder times based on when you actually responded to check-ins (the agent may suggest better times via `self-improving-agent`).
- **Week 3+:** Gradually increase to your target habit count. Never add more than 2 new habits in a single week.

If you start with 8 habits and full-featured tracking from day one, you will almost certainly abandon the system within 10 days.

### Handling Bad Weeks

Everyone has bad weeks — illness, travel, family emergencies, or just low motivation. Configure the agent to handle these gracefully:

```
Tell the agent: "If I miss more than 50% of my habits for 3 consecutive days, switch to 'gentle mode.' In gentle mode: (1) send only the evening review, skip all mid-day reminders, (2) ask if I want to pause any habits temporarily, (3) reduce expectations — even completing one habit counts as a win, (4) never reference my current streak or compare to previous performance. Stay in gentle mode until I complete 80% of habits for 2 consecutive days, then resume normal mode."
```

This prevents the system from becoming a source of stress during already-stressful periods.

### Seasonal and Life-Phase Adjustments

Your habits should evolve with your life. Review your habit list quarterly:

- **Are any habits no longer relevant?** Maybe you started tracking "apply to 3 jobs per week" but you have since been hired. Remove it.
- **Should any habits be upgraded?** If "10 minutes meditation" has been at 100% for 2 months, it might be time to increase to 15 or 20 minutes.
- **Are there new habits to add?** Life changes (new job, new baby, health diagnosis) create new habit needs.
- **Do reminder times need shifting?** A new work schedule means your morning routine may happen 30 minutes earlier or later.

### Data Export and Portability

Your habit data lives in Obsidian markdown files, which means it is inherently portable. If you ever want to switch to a different system or analyze your data in a spreadsheet:

- All daily logs are at `Habits/daily/YYYY-MM-DD.md` — plain text, easily parseable.
- Weekly and monthly reports are at `Habits/weekly/` and `Habits/monthly/`.
- You can use the `duckdb` skill to run SQL queries against your exported CSV habit data if you want deeper analytics.
- Consider running a quarterly export to CSV for backup purposes.

### Integration with Health Data

If you install `apple-health-skill` or `healthsync`, the agent can correlate habit compliance with health metrics over time. For example:

- "On days when I completed my morning meditation, was my resting heart rate lower that night?"
- "Does my sleep quality (from Apple Health) correlate with whether I exercised that day?"
- "Is my step count higher on days when I completed my midday walk habit?"

These correlations are informational only — the agent must never make causal health claims. But seeing data-backed patterns can be powerfully motivating. Set up a monthly correlation report:

```bash
openclaw cron add --at "10:00" --monthday "1" "If apple-health-skill is installed, generate a habit-health correlation report for last month. For each fitness/wellness habit, check if completion days show different Apple Health metrics (steps, heart rate, sleep duration) compared to non-completion days. Present correlations without making causal claims. Save to Habits/health-correlations/[month].md."
```

### Cost Considerations

This setup has minimal ongoing costs:

- **No API keys required** for the core setup (gog, apple-reminders, obsidian, self-improving-agent are all free or local).
- **AI model token usage** is modest — each check-in, review, and report uses a small number of tokens. Expect less than $1/month in model costs for typical usage.
- **Apple Health integration** (if added) is free and local.
- The main "cost" is your attention — responding to check-ins takes 1-2 minutes per day. If that feels like too much, reduce the number of check-ins rather than ignoring them.

### Obsidian Daily Log Template

For reference, here is the recommended daily habit log template that the agent should create in `Habits/daily/YYYY-MM-DD.md`:

```markdown
# Habit Log — [Date]

## Morning Intentions
- [ ] Meditation (10 min)
- [ ] Exercise (30 min)
- [ ] Read (20 min)
- [ ] Water (8 glasses)
- [ ] Journal (5 min)

## Completions
| Habit | Planned | Completed | Time | Duration/Notes |
|---|---|---|---|---|
| Meditation | Yes | | | |
| Exercise | Yes | | | |
| Read | Yes | | | |
| Water | Yes | | | |
| Journal | Yes | | | |

## Streaks (auto-updated by agent)
| Habit | Current Streak | Longest Ever |
|---|---|---|
| Meditation | X days | Y days |
| Exercise | X days | Y days |

## Notes
[Freeform notes — energy level, mood, anything affecting habits today]
```

Tell the agent to use this template on the first day, and it will maintain the format going forward. The structured table format makes it easy to parse for weekly and monthly analytics.
