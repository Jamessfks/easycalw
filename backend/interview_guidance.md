# Vapi Interview Agent — Configuration Guidance

Reference document for configuring the EasyClaw voice interview assistant in the Vapi dashboard.

---

## 1. Required Information to Extract

The interview MUST collect these 8 data points before ending. Missing any of these degrades guide quality significantly.

| # | Field | Why It Matters | Example |
|---|-------|---------------|---------|
| 1 | **Name / business name** | Personalizes the guide title and references | "Marco's Trattoria" |
| 2 | **Industry / business type** | Determines which OpenClaw skills and integrations to recommend | Restaurant, retail, logistics, dev agency |
| 3 | **Hardware / infrastructure** | Drives install method (Docker vs npm vs cloud) and channel recommendations | "Mac laptop + iPad POS", "Linux server", "just my phone" |
| 4 | **Primary channel** | Determines which messaging channel to configure first | WhatsApp, Slack, Discord, Telegram, iMessage |
| 5 | **Technical comfort level** | Calibrates guide complexity — CLI-heavy vs GUI-first | "I can use a terminal" vs "I've never coded" |
| 6 | **Pain points / goals** | Shapes which automation recipes to include (scheduling, inventory, customer comms) | "Staff scheduling is chaos", "I want auto-replies to customers" |
| 7 | **Existing tools** | Identifies integrations to set up (POS, CRM, calendar, accounting) | Toast POS, Square, Google Calendar, QuickBooks |
| 8 | **Autonomy preference** | Sets the agent's permission level in the guide (supervised vs autonomous) | "I want to approve everything" vs "just handle it" |

---

## 2. Question Flow

### Opening (10-15 seconds)
> "Hey! I'm the EasyClaw setup assistant. I'll ask you a few quick questions so we can build you a personalized setup guide. What's your name and what kind of business do you run?"

This captures **name** + **industry** in a single natural question.

### Pain Points (15-20 seconds)
> "Got it. So what's the biggest headache in your day-to-day operations right now? What would you automate first if you could?"

Captures **pain points / goals**. Listen for implicit tool mentions ("our POS is slow" → existing tools).

### Tech Assessment (10-15 seconds)
> "Are you comfortable with a terminal / command line, or would you prefer something more visual?"

Captures **technical comfort level**. If they mention specific tech ("I use Docker"), note it.

### Hardware + Channel (15-20 seconds)
> "What devices does your team use day-to-day? And what's the main way you communicate — WhatsApp group, Slack, something else?"

Captures **hardware** + **primary channel** together.

### Tools + Preferences (15-20 seconds)
> "Any specific software you're already using that you'd want to connect — like a POS system, calendar, or CRM?"
>
> "Last question — when the AI agent handles tasks, do you want it to check with you first, or should it just go ahead and do its thing?"

Captures **existing tools** + **autonomy preference**.

### Close (5 seconds)
> "Perfect, I've got everything I need. Give me a moment and I'll generate your personalized setup guide."

---

## 3. Handling Vague Responses

When the user gives an unclear answer, use these follow-up patterns:

| Vague response | Follow-up |
|----------------|-----------|
| "I don't know what I need" | "No worries — tell me what takes the most time in your day and we'll figure it out together." |
| "I'm not technical" | "That's totally fine. Do you know if your team uses Mac or Windows? That's all I need." |
| "We use a bunch of stuff" | "What's the one tool you open first every morning?" |
| "Just make it work" | "Got it — so you'd prefer the AI to handle things autonomously. If something big comes up, should it still check with you?" |
| Long rambling answer | Let them finish, then: "Okay cool — so the main thing is [extracted point], right?" |

---

## 4. Interview Length Targets

| Mode | Target | Notes |
|------|--------|-------|
| **Demo** (YC, investor pitch) | 60-90 seconds | Hit all 8 fields fast. Use the demo script below. |
| **Real user** (production) | 3-5 minutes | Let the conversation flow naturally. Probe deeper on pain points. |

If the user is clearly done talking before all 8 fields are captured, ask the remaining questions directly rather than ending early.

---

## 5. Demo Script — Scouts Coffee (YC Pitch)

For Kaan's YC demo, the interviewee plays the owner of a multi-location specialty coffee roaster. This script sounds natural while hitting all 8 fields in ~75 seconds.

### The persona
- **Name**: Jordan, owner of Scouts Coffee
- **Industry**: Specialty coffee — 3 retail locations + wholesale
- **Hardware**: MacBook Pro at HQ, iPads at each location running Square POS
- **Channel**: WhatsApp group for staff, Slack for wholesale clients
- **Tech level**: Comfortable with apps, basic terminal use, not a developer
- **Pain points**: Staff scheduling across locations is manual (group chat chaos), wholesale order tracking falls through cracks, inventory reorder is always late
- **Tools**: Square POS, Google Workspace, a shared Google Sheet for inventory
- **Autonomy**: "Auto-handle routine stuff, but flag me for anything over $500 or staffing changes"

### Sample dialogue

**Agent**: "Hey! I'm the EasyClaw setup assistant. Quick few questions to build your personalized guide. What's your name and what do you do?"

**Jordan**: "I'm Jordan, I run Scouts Coffee — we're a specialty roaster with three locations plus wholesale."

**Agent**: "Nice! What's your biggest operational headache right now?"

**Jordan**: "Honestly, scheduling. We've got like 20 baristas across three shops and right now it's all WhatsApp messages and a shared Google Sheet. Stuff falls through the cracks constantly. And our wholesale orders — I lose track of what's been fulfilled."

**Agent**: "Yeah that sounds painful. Are you comfortable with command-line tools or would you prefer a more visual setup?"

**Jordan**: "I can fumble through a terminal but I'm not a developer. I mostly live in apps."

**Agent**: "Totally fine. What devices does your team use, and what's the main communication channel?"

**Jordan**: "MacBook at our roasting HQ, iPads at each shop running Square. Team talks on WhatsApp, wholesale clients are on Slack."

**Agent**: "Any other tools you'd want to connect besides Square and Google?"

**Jordan**: "That's the main stack. Square for POS, Google Workspace for everything else."

**Agent**: "Last one — when the AI handles things like reordering inventory or adjusting schedules, should it just do it or check with you first?"

**Jordan**: "Auto-handle the routine stuff. But anything over five hundred bucks or staffing changes — flag me."

**Agent**: "Perfect. Building your guide now."

---

## Notes for Vapi Dashboard Configuration

- Set **max duration** to 120s for demo mode, 600s for production
- Enable **silence detection** — if user is quiet for 4+ seconds, prompt with "Still there? No rush."
- Set **end-of-call function** to POST the transcript to `/generate-guide` endpoint
- The transcript format should include speaker labels (`User:` / `Agent:`)
- Configure **voice**: warm, conversational tone — not robotic. Recommended: Vapi's "alloy" or "nova" voice
