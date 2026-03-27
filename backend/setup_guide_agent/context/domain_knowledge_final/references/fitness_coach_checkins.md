# Fitness Coach Check-Ins — OpenClaw Reference Guide

## What This Does

This guide configures OpenClaw as a fitness accountability partner that checks in with
you daily, tracks your workouts and health metrics, adjusts guidance based on your
progress, and keeps you honest about your fitness goals. The agent pulls data from Apple
Health (workouts, heart rate, steps, sleep), logs your meals, and provides evidence-based
coaching feedback — like having a personal trainer who is always available but never
charges $150/hour.

## Who This Is For

**Profile:** Anyone with fitness goals who struggles with consistency — gym-goers who
skip sessions, runners training for races, people recovering from injuries, or anyone
who wants structured accountability without paying for a full-time coach.

**Industry:** Personal fitness, athletic training, wellness coaching, rehabilitation.

**Pain point:** You know what to do in the gym. You have read the programs, watched the
videos, and downloaded the apps. The problem is not knowledge — it is consistency and
accountability. You skip workouts when no one is watching. You do not track progressive
overload. You ignore recovery signals. You need someone (or something) to check in
every day, review your data, and give you a nudge when you are falling off track.

## OpenClaw Setup

### Required Skills

```bash
# Security baseline
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard

# Core fitness tracking
clawhub install apple-health-skill    # Query Apple Health — workouts, HR, steps, VO2 Max
clawhub install healthsync            # Deep local health data analysis via SQLite
clawhub install healthy-eating        # Meal logging and nutrition guidance
clawhub install gog                   # Google Sheets for workout logs + Gmail for reports

# Communication and reminders
clawhub install apple-reminders       # Workout reminders on all Apple devices
clawhub install whatsapp-cli          # Daily check-in messages
```

### Optional Skills

```bash
clawhub install summarize             # Summarize weekly/monthly fitness progress
clawhub install pubmed-edirect        # Evidence-based exercise science lookups
clawhub install obsidian              # Personal training journal/notes
clawhub install notion                # If you prefer Notion for workout programming
clawhub install todoist               # If you prefer Todoist for workout scheduling
clawhub install things-mac            # If you prefer Things 3 for workout scheduling
clawhub install data-analyst          # For deep statistical analysis of training data
clawhub install duckdb                # For querying large health datasets
clawhub install csv-toolkit           # For processing exported health data
clawhub install tavily-web-search     # Research exercises, techniques, and programming
clawhub install telegram              # Telegram check-ins instead of WhatsApp
clawhub install self-improving-agent  # Agent learns your patterns over time
clawhub install capability-evolver    # Agent improves its coaching based on session logs
```

### Channels to Configure

| Channel | Purpose | Setup |
|---------|---------|-------|
| Apple Health (via `apple-health-skill` + `healthsync`) | Pull workout data, HR, sleep, steps | Transition app + Apple Health access |
| WhatsApp (via `whatsapp-cli`) | Daily check-ins and accountability messages | WhatsApp Business API or local session |
| Apple Reminders (via `apple-reminders`) | Workout reminders | macOS 14+ with iCloud sync |
| Google Sheets (via `gog`) | Training log with progressive overload tracking | Create "Fitness Tracker" sheet |
| Gmail (via `gog`) | Weekly/monthly progress reports | Google OAuth |

### Hardware Recommendations

- **Minimum:** Any Mac with 8 GB RAM, macOS 14+. An Apple Watch is strongly
  recommended for automatic workout and health metric tracking.
- **Recommended:** Mac Mini M2 (always-on) with 16 GB RAM. The `healthsync` skill
  queries a local SQLite database of health data, and the Mac needs to be running for
  cron jobs to fire morning check-ins.
- **Apple Watch:** Series 6 or later for VO2 Max estimates, HRV tracking, blood oxygen,
  and sleep staging. Earlier models work but capture fewer metrics.

## Core Automation Recipes

### 1. Morning Accountability Check-In

Start each day with a fitness status update:

```bash
openclaw cron add --every 24h --at 06:30 "query Apple Health via healthsync for yesterday's data: total steps, active calories, workout(s) completed (type, duration, heart rate zones), sleep duration and quality, resting heart rate, and HRV. Compare against my goals in the Fitness Tracker Google Sheet. Send me a WhatsApp message with a brief morning check-in: what I accomplished yesterday, what is on the training plan for today, and one specific encouragement or adjustment based on the data. Keep it under 10 sentences. End with 'Reply DONE when today's workout is complete.'"
```

### 2. Workout Completion Tracker

Log completed workouts and track progressive overload:

```bash
openclaw cron add --every 30m "check if I have sent a WhatsApp message in the last 30 minutes containing 'DONE' or describing a completed workout. If so, query Apple Health for the most recent workout session. Log the workout to the Fitness Tracker Google Sheet with: date, workout type, duration, average heart rate, max heart rate, calories burned, and any exercises/weights I mentioned in the message. Compare key lifts against last session to check for progressive overload. Reply via WhatsApp with a brief acknowledgment and note whether I progressed, maintained, or regressed on tracked lifts."
```

### 3. Rest Day Enforcement

Prevent overtraining by monitoring recovery signals:

```bash
openclaw cron add --every 24h --at 06:00 "query healthsync for the past 7 days of training data, HRV trend, resting heart rate trend, and sleep quality. If HRV is trending down more than 15% from baseline, resting HR is elevated more than 10% above baseline, sleep has averaged under 6 hours for 3+ consecutive nights, or I have trained 5+ days in a row without a rest day, send a WhatsApp message recommending a rest day or active recovery with a specific explanation of why. Do not just say 'take a rest day' — cite the specific metric that triggered the recommendation."
```

### 4. Weekly Progress Report

A comprehensive look at the week:

```bash
openclaw cron add --every 7d --at "Sunday 18:00" "generate a weekly fitness report using data from Apple Health (via healthsync) and the Fitness Tracker Google Sheet. Include: workouts completed vs. planned, total training volume, progressive overload summary for key lifts, average daily steps, average sleep duration and quality, HRV trend, resting HR trend, body weight trend (if tracked), and nutrition compliance (if meal logging is active). Compare this week to last week. Highlight the top accomplishment and the biggest area for improvement. Email the report to me via Gmail and also send a shorter WhatsApp summary."
```

### 5. Meal Logging

Track nutrition through conversational logging:

```bash
openclaw cron add --every 15m "check if I have sent a WhatsApp message in the last 15 minutes describing a meal or snack (look for food words, meal names like 'breakfast', 'lunch', 'dinner', 'snack', or messages starting with 'ate' or 'had'). If so, use healthy-eating to estimate the macronutrient breakdown (protein, carbs, fat, calories) and log it to the Fitness Tracker Google Sheet on the Nutrition tab. Reply via WhatsApp with the estimated macros and a running daily total. If protein is below target for the time of day, gently suggest a high-protein option for the next meal."
```

### 6. Monthly Body Composition Review

Track long-term trends:

```bash
openclaw cron add --every 30d --at "1st 09:00" "generate a monthly fitness review using all available data from healthsync and the Fitness Tracker Google Sheet. Include: training consistency (days trained / days planned), strength progression on key lifts, cardiovascular fitness indicators (resting HR trend, VO2 Max if available), body weight trend with 7-day moving average, average daily nutrition vs. targets, sleep quality trend, and injury notes. Compare this month to the previous month and to the same month last year if data exists. Identify the top 3 wins and 3 areas to focus on next month. Email the full report via Gmail."
```

### 7. Pre-Workout Reminder

Get a specific reminder for what is on the plan today:

```bash
openclaw cron add --every 24h --at 05:30 "check the Fitness Tracker Google Sheet for today's planned workout. Create an Apple Reminder 90 minutes before my usual workout time with the title: '[WORKOUT TYPE] Day — [KEY EXERCISES]'. Include the target sets, reps, and weights for the main lifts based on last session's numbers plus the planned progression. If today is a rest day, set the reminder to 'Rest Day — light walk or stretching only.'"
```

### 8. Injury and Pain Monitoring

Track and respond to pain reports:

```bash
openclaw cron add --every 30m "check if I have sent a WhatsApp message in the last 30 minutes mentioning pain, soreness, injury, tweak, strain, or discomfort. If so, log the report in the Fitness Tracker Google Sheet on the Injuries tab with: date, body part, description, severity (based on my description). If this is a new pain location, recommend reducing load on related exercises and suggest I consult a physiotherapist if it persists beyond 3 days. If this body part has been reported painful 3 or more times in the last 14 days, send an escalation message: 'This is the [Nth] time you have reported [BODY PART] pain in 2 weeks. Please see a healthcare provider before training that area again.' Never suggest specific diagnoses or medical treatments."
```

## Guardrails and Safety

### The Agent Must NEVER Autonomously:

1. **Provide medical advice or diagnoses.** The agent tracks fitness metrics and
   provides general coaching, but it must never diagnose injuries, recommend
   specific treatments, prescribe supplements, or override medical advice. For any
   pain that persists or worsens, the agent must recommend seeing a healthcare
   provider.

2. **Recommend extreme caloric restriction.** The agent should never suggest eating
   below 1,200 calories/day for women or 1,500 calories/day for men without explicit
   human override. Eating disorder risk is real, and the agent should promote
   sustainable nutrition, not crash diets.

3. **Push through pain signals.** If a user reports pain during exercise, the agent
   must never respond with "push through it" or "no pain no gain." The correct
   response is always to reduce load, suggest modification, or recommend rest.

4. **Share health data with anyone.** Health metrics, body weight, nutrition logs,
   and injury reports are deeply personal data. The agent must never include this
   information in any message to anyone other than the user. Configure
   `agent-access-control` if the agent is accessible to others.

5. **Adjust prescribed medical exercise programs.** If the user mentions they are
   following a physical therapist's or doctor's exercise program, the agent must not
   modify those exercises. It can track compliance and remind about prescribed
   exercises, but modifications come from the prescribing provider only.

6. **Shame, guilt, or use negative reinforcement.** Missed workouts happen. The
   agent should acknowledge missed sessions matter-of-factly and focus on getting
   back on track, not on making the user feel bad. Language like "you failed" or
   "you need to try harder" is never appropriate.

7. **Recommend performance-enhancing substances.** No suggestions of steroids,
   SARMs, or other performance-enhancing drugs, even if the user asks. The agent
   can discuss legal supplements (creatine, protein, caffeine) with appropriate
   disclaimers.

### Recommended Safety Configuration

```bash
# Block sharing health data externally
openclaw config set agentguard.block_patterns "whatsapp.*send.*health_data,gmail.*forward.*fitness"

# Enable audit trail for health data access
clawhub install agent-audit-trail

# Restrict agent access to owner only
clawhub install agent-access-control
```

## Sample Prompts

### Prompt 1: Initial Setup

```
You are my fitness accountability coach. Your job is to check in with me daily,
track my workouts and nutrition, and keep me consistent with my training.

About me:
- Age: [AGE], Gender: [GENDER], Height: [HEIGHT], Weight: [WEIGHT]
- Training experience: [BEGINNER/INTERMEDIATE/ADVANCED]
- Current program: [PROGRAM NAME OR DESCRIPTION]
- Training days: [E.G., Mon/Tue/Thu/Fri/Sat]
- Primary goal: [E.G., build muscle, lose fat, run a marathon, general fitness]
- Secondary goal: [E.G., improve sleep, reduce stress, increase mobility]

Rules:
- Never give medical advice — recommend I see a doctor for persistent pain
- Never suggest extreme caloric restriction
- Never shame me for missing workouts — just help me get back on track
- Always cite the specific data point when making recommendations
- Keep check-in messages brief (under 10 sentences)
- End morning check-ins with today's workout plan

My Apple Watch tracks my workouts and health metrics automatically.
Training data lives in the Google Sheet called "Fitness Tracker".
We communicate via WhatsApp for daily check-ins.
Weekly reports go to my Gmail.
```

### Prompt 2: Program Setup

```
Set up my training program in the Fitness Tracker sheet. Here is my current split:

Monday: Upper Body Push (bench press, OHP, incline DB press, lateral raises, triceps)
Tuesday: Lower Body (squat, RDL, leg press, leg curl, calf raises)
Wednesday: Rest or light cardio
Thursday: Upper Body Pull (deadlift, barbell row, pull-ups, face pulls, bicep curls)
Friday: Lower Body (front squat, hip thrust, walking lunges, leg extension, calf raises)
Saturday: Conditioning (30-min run or rowing intervals)
Sunday: Full rest

For each exercise, create a tracking row with: date, exercise, sets, reps, weight,
RPE (rate of perceived exertion). Set progressive overload targets: increase weight
by 2.5 lbs when I hit all prescribed reps at RPE 7 or below for 2 consecutive sessions.
```

### Prompt 3: Nutrition Goals

```
Set up my nutrition tracking with these targets:
- Daily calories: [TARGET] kcal
- Protein: [TARGET] g (minimum)
- Carbs: [TARGET] g
- Fat: [TARGET] g
- Water: [TARGET] liters

I will message you on WhatsApp when I eat. Estimate the macros from my description
and keep a running daily total. At the end of each day, send me a nutrition summary
showing actual vs. target for each macro. If I am consistently under on protein,
suggest specific high-protein foods I can add.

Do not count calories obsessively — round to the nearest 50. Focus on protein
hitting the minimum and overall calories being in a reasonable range.
```

### Prompt 4: Race Training

```
I am training for a [RACE DISTANCE] race on [DATE]. That gives me [WEEKS] weeks.
My current comfortable pace is [PACE] per mile/km. My goal time is [TIME].

Adjust my training plan to include:
- [X] running days per week
- One long run (building from [CURRENT] to [TARGET] distance)
- One speed/interval session
- One tempo run
- Easy runs on remaining days

Track my runs via Apple Health. After each run, tell me: distance, pace, heart rate
zones, and how it compares to the plan. Adjust paces if I am consistently
over-performing or under-performing the targets.
```

### Prompt 5: Recovery Check

```
I have been feeling unusually fatigued this week. Pull my health data for the last
14 days and analyze:
1. Training volume — am I overreaching?
2. Sleep — has duration or quality dropped?
3. HRV — is it trending down?
4. Resting heart rate — is it elevated?
5. Nutrition — have I been undereating?

Based on the data, recommend whether I should:
A) Continue as planned
B) Reduce volume by 20-30% (deload week)
C) Take 2-3 full rest days
D) See a doctor

Show me the data that supports your recommendation.
```

## Common Gotchas

### 1. Apple Health Data Lag

Apple Health data from your Apple Watch does not sync instantly. Workout data
typically syncs within 5-15 minutes of ending a workout, but health metrics like
HRV, resting heart rate, and sleep staging can take several hours to appear.
Morning check-ins at 6:30 AM may not have last night's sleep data available yet
if the watch is still processing.

**Fix:** Schedule health-data-dependent cron jobs at least 2 hours after your
typical wake time. For sleep data specifically, 8:00 AM or later is safest. If
the agent reports "no sleep data available," it is almost always a sync delay, not
a bug.

### 2. Meal Estimation Inaccuracy

The `healthy-eating` skill estimates macros from natural language descriptions, but
accuracy depends heavily on how specific you are. "I had chicken and rice" could be
300 calories or 900 calories depending on portion sizes. Over time, estimation errors
compound and the daily totals become unreliable.

**Fix:** Include approximate portions in your meal descriptions. Instead of
"chicken and rice," say "6oz grilled chicken breast with 1 cup cooked rice and
steamed broccoli." The agent cannot weigh your food, but specific descriptions cut
estimation error from +/-50% to +/-15%. Also, do not treat the macro numbers as
gospel — they are directional, not precise. Focus on protein minimums and calorie
ranges rather than exact figures.

### 3. Motivation Burnout from Too Many Messages

Daily check-ins, meal logging confirmations, workout reminders, rest day alerts,
and weekly reports can add up to 5-10 messages per day. For the first few weeks
this feels motivating. By week 6, it feels like nagging, and you start ignoring
the messages entirely. At that point, the system is worse than no system.

**Fix:** Start minimal and add channels gradually. Begin with only the morning
check-in and the workout completion tracker. Add meal logging only if you
specifically want to track nutrition. Move weekly reports to email (Gmail) so
they do not clutter your WhatsApp. Reduce check-in frequency from daily to
every-other-day once you have built a solid 30-day streak. The goal is sustainable
accountability, not notification fatigue.
