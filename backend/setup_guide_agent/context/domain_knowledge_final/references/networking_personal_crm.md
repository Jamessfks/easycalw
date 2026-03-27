# Networking Personal CRM — OpenClaw Reference Guide

## What This Does

This setup turns OpenClaw into a personal relationship management system that tracks everyone you meet professionally and socially, logs interaction history, reminds you to follow up with important contacts at the right intervals, surfaces relevant context before meetings, and helps you maintain relationships that would otherwise fade due to neglect. Unlike enterprise CRMs designed for sales pipelines, this is a personal tool for anyone who values their network but cannot keep hundreds of relationships active through memory alone.

## Who This Is For

**Profile:** Professionals who meet a lot of people — conference attendees, consultants, founders, salespeople, community leaders, job seekers, or anyone who has ever thought "I should have stayed in touch with that person." Also valuable for anyone who struggles to remember names, faces, or context about people they have met before.

**Industry:** Universal across professional domains. Particularly valuable for consultants and freelancers who depend on referrals, startup founders building investor and partner networks, sales professionals managing relationships outside their company CRM, job seekers tracking recruiter and hiring manager contacts, and community organizers maintaining volunteer and sponsor relationships.

**Pain point:** You meet someone interesting at a conference, exchange contact info, and never follow up. Three months later, you cannot remember their name, what they do, or what you talked about. You have hundreds of LinkedIn connections but no system for maintaining real relationships. You miss opportunities because you forgot to follow up.

## OpenClaw Setup

### Required Skills

```bash
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard
clawhub install gog
clawhub install obsidian
clawhub install summarize
clawhub install tavily-web-search
clawhub install self-improving-agent
```

**Skill explanations:**

- **gog** — Google Workspace integration for Gmail (scanning for contact interactions), Calendar (checking upcoming meetings with contacts), and Contacts (syncing contact information).
- **obsidian** — The core CRM database. Each contact gets a markdown file with structured metadata (name, company, role, how you met, interests, interaction history). Obsidian's linking and search make it easy to find connections between people.
- **summarize** — Condenses email threads, meeting notes, and web content about contacts into brief context summaries for pre-meeting briefings.
- **tavily-web-search** — Researches contacts before meetings — finds their latest company news, published articles, social media updates, and professional milestones to give you relevant conversation starters.
- **self-improving-agent** — Learns your relationship priorities. Over time, it recognizes which contacts you consistently prioritize and which ones you routinely deprioritize, adjusting reminder frequency accordingly.

### Optional Skills

```bash
clawhub install whatsapp-cli        # Log WhatsApp conversations as interactions
clawhub install telegram            # Log Telegram interactions
clawhub install slack               # Track Slack DM interactions with contacts
clawhub install bird                # Monitor X/Twitter for contact activity
clawhub install notion              # If you prefer Notion databases over Obsidian for CRM
clawhub install agent-mail          # Enhanced email scanning for contact interactions
clawhub install todoist             # Create follow-up tasks in Todoist
clawhub install apple-reminders     # Follow-up reminders on Apple devices
clawhub install hubspot             # Sync with HubSpot if you also use an enterprise CRM
clawhub install pipedrive           # Sync with Pipedrive for sales-focused contacts
clawhub install openai-whisper      # Transcribe voice notes about contacts after meetings
clawhub install exa-web-search-free # Free alternative to tavily for contact research
```

### Accounts and API Keys Required

| Service | What You Need | Where to Get It |
|---|---|---|
| Google Account | OAuth for Gmail, Calendar, Contacts | Google Cloud Console |
| Obsidian | Local vault | Install Obsidian |
| Tavily | `TAVILY_API_KEY` | https://tavily.com |

### Hardware Recommendations

- Any OpenClaw-capable machine. Always-on recommended for scheduled follow-up reminders and contact research.
- No GPU required.
- A smartphone for quick contact logging after meetings (via WhatsApp or Telegram to the agent).

### Channel Configuration

- **Primary:** OpenClaw chat for contact queries, pre-meeting briefings, and CRM management.
- **Quick capture:** `whatsapp-cli` or `telegram` so you can text the agent "Just met Sarah Chen from Acme Corp at the DevOps meetup — she's interested in our API product" from your phone immediately after a conversation.
- **Reminders:** `apple-reminders` or `todoist` for follow-up tasks that need to persist on your phone.

## Core Automation Recipes

### 1. Pre-Meeting Briefing

```bash
openclaw cron add --every 30m "Check my Google Calendar for meetings starting in the next 60 minutes. For each meeting with attendees who exist in my CRM (Obsidian vault at CRM/contacts/), generate a briefing: (1) my relationship history with each attendee (when we last spoke, what we discussed), (2) any pending follow-ups I owe them, (3) their latest professional news (search tavily-web-search for their name + company), (4) suggested conversation starters based on our shared interests. If attendees are NOT in my CRM, create a stub contact file and research them."
```

This is the highest-value automation. Walking into a meeting with fresh context about every attendee makes a strong impression and strengthens relationships.

### 2. Post-Meeting Logging

```bash
openclaw cron add --every 1h "Check my Google Calendar for meetings that ended in the last 60 minutes. For each completed meeting, ask me: 'You just had [meeting name] with [attendees]. Any notes? Key takeaways, action items, or relationship updates?' Accept a brief response and log it in each attendee's CRM file under Interaction History. If I don't respond within 2 hours, skip and move on."
```

Capturing notes while the meeting is fresh is critical. The agent prompts you so you do not have to remember to open a CRM.

### 3. Follow-Up Reminder System

```bash
openclaw cron add --at "08:30" "Check my CRM for contacts with pending follow-ups due today or overdue. For each, show: (1) contact name and company, (2) what I promised to follow up on, (3) how many days overdue (if applicable), (4) suggested follow-up message draft. Limit to the 5 most important follow-ups to avoid overwhelm."
```

```bash
openclaw cron add --at "08:30" --weekdays "mon" "Check my CRM for contacts I tagged as 'keep warm' who I haven't interacted with in more than [configured interval, default 30 days]. List the top 5 contacts at risk of going cold, with: (1) last interaction date and context, (2) their latest news from a quick web search, (3) a suggested casual reach-out message (not sales-y, genuinely friendly)."
```

Two-layer system: explicit follow-ups (things you promised to do) and relationship maintenance (people you want to stay connected to).

### 4. Email Interaction Logging

```bash
openclaw cron add --every 2h "Scan my Gmail for sent and received emails in the last 2 hours. For any email where the sender or recipient matches a contact in my CRM, log the interaction: date, direction (sent/received), subject line, and a one-sentence summary. Do not log the full email content — just enough context to remember what the exchange was about."
```

Automatically builds interaction history from your email without manual logging.

### 5. Quick Contact Capture via Messaging

```bash
openclaw cron add --every 15m "Check for any WhatsApp or Telegram messages I sent to you that start with 'NEW CONTACT:' or 'MET:'. Parse the message for: name, company, role, how we met, and any notes. Create a new contact file in Obsidian at CRM/contacts/[name-slugified].md with structured metadata. Confirm creation by replying with the contact summary."
```

This lets you capture contacts from your phone immediately after meeting someone — at a conference, a dinner, or a chance encounter. Example message: "MET: Sarah Chen, VP Engineering at Acme Corp, at the DevOps meetup. Interested in API integration. Has a golden retriever named Max."

### 6. Contact Research and Enrichment

```bash
openclaw cron add --at "10:00" --weekdays "wed" "Select 5 contacts from my CRM who have the least enrichment data (no company description, no recent news, no social profiles listed). For each, run a web search for their name + company. Update their CRM file with: (1) current company description, (2) their recent professional activity (blog posts, conference talks, job changes), (3) any shared connections or interests I should know about. Flag any contacts who appear to have changed companies since I last interacted with them."
```

Keeps your CRM fresh without manual research. The weekly enrichment pass catches job changes and company news you would otherwise miss.

### 7. Networking Event Preparation

```bash
openclaw cron add --every 6h "Check my Google Calendar for events in the next 48 hours tagged as 'conference,' 'meetup,' 'networking,' or 'event.' For each, check if an attendee list or speaker list is available (search the event website). Cross-reference any names against my CRM. Prepare a briefing: (1) people I already know who will be there, with context refreshers, (2) speakers or attendees I should try to meet based on shared interests, (3) conversation starters for each."
```

### 8. Monthly Relationship Health Report

```bash
openclaw cron add --at "09:00" --monthday "1" "Generate my monthly relationship health report. Analyze my CRM and show: (1) total contacts in the system, (2) contacts added this month, (3) contacts I interacted with this month, (4) contacts going cold (no interaction in 60+ days), (5) follow-ups completed vs. missed, (6) most active relationships, (7) suggested contacts to reconnect with this month based on their importance rating and how long it's been. Save to CRM/reports/[month].md."
```

## Guardrails and Safety

The agent must NEVER do the following autonomously:

1. **Never send messages to contacts without your explicit approval.** The agent drafts follow-ups and suggests reach-outs, but you must review and send every message yourself. An AI-generated message sent without review can damage a real relationship.

2. **Never share contact information with anyone.** Your CRM data is private. The agent must not share contact details, interaction history, or relationship notes with anyone — including other contacts in your network.

3. **Never connect to or scrape LinkedIn.** LinkedIn aggressively blocks automation and may ban your account. Do not ask the agent to scrape LinkedIn profiles.

4. **Never record or transcribe conversations without consent.** If you use `openai-whisper` for voice notes, you must be recording your own reflections, not secretly transcribing a meeting. Follow your jurisdiction's recording consent laws.

5. **Never store sensitive personal information beyond what is needed for relationship management.** Do not log medical conditions, financial details, political views, or other sensitive information about contacts unless it is directly relevant to your professional relationship and they have shared it openly.

6. **Never rate, rank, or score contacts by "value."** The CRM tracks interaction frequency, not human worth. Avoid framing relationships as transactional. Use terms like "keep warm" and "follow up due" rather than "high value" and "low value."

7. **Never auto-connect or auto-follow on social media.** The agent may research public profiles for context, but it must never send connection requests, follow requests, or friend requests on your behalf.

8. **Never email or message contacts for whom you do not have opt-in consent.** If someone gave you their business card at a conference, a polite follow-up is appropriate. If you scraped their email from a website, cold outreach may violate spam laws.

Configure guardrails:

```
- NEVER send any message to a contact without my explicit review and approval
- NEVER share contact data or CRM contents with anyone
- NEVER scrape LinkedIn or any social media requiring authentication
- NEVER record or transcribe conversations I have with other people
- NEVER auto-connect, auto-follow, or auto-friend on any platform
- Draft follow-up messages in a genuinely helpful, non-sales tone unless I specify otherwise
- When logging interaction notes, capture only professional context — not personal gossip or sensitive information
- Classify contacts by relationship type (colleague, client, friend, mentor, etc.) not by "value"
```

## Sample Prompts

### Prompt 1: Initial CRM Setup

```
I want to set up a personal CRM in my Obsidian vault. Create the following structure:
- CRM/contacts/ — one file per contact
- CRM/reports/ — monthly and weekly reports
- CRM/templates/ — contact file template

Each contact file should use this template:
---
name:
company:
role:
email:
phone:
linkedin:
how_we_met:
met_date:
relationship_type: [colleague/client/friend/mentor/investor/vendor]
follow_up_interval: [7/14/30/60/90 days]
tags: []
---

## About
[1-2 sentences about this person]

## Interaction History
| Date | Type | Summary |
|---|---|---|

## Follow-Ups
- [ ] [pending follow-ups]

## Notes
[freeform notes, shared interests, family details they've mentioned, etc.]

Start by importing contacts from my Google Contacts who I've emailed in the last 6 months. Create a CRM file for each with whatever information is available.
```

### Prompt 2: Post-Conference Batch Entry

```
I just got back from [Conference Name]. Here are the people I met — create CRM entries for each:

1. Sarah Chen — VP Engineering at Acme Corp — discussed API integration challenges — she wants to see our product demo — follow up within 1 week
2. Marcus Rivera — Founder of DataFlow — we bonded over running — he's training for a marathon — follow up in 2 weeks to share running routes
3. Dr. Anita Patel — Professor at [University] — researching ML interpretability — could be a great advisor — follow up in 2 weeks with our research paper
4. Jake Thompson — Sales Director at BigCo — seemed interested in partnership — get his team on a call within 10 days

For each, draft a brief follow-up email I can review and send.
```

### Prompt 3: Meeting Prep on Demand

```
I have a lunch meeting with [Name] tomorrow. Pull up everything I know about them: our full interaction history, any pending follow-ups, their latest professional news, and any personal details I should remember (kids' names, hobbies, etc.). Also check if they've published anything new or if their company has been in the news. Give me a 2-minute prep briefing.
```

### Prompt 4: Reconnection Campaign

```
Show me contacts I haven't interacted with in 90+ days who I tagged as 'keep warm.' For each one, draft a casual, genuine reconnection message — not a sales pitch, just a friendly check-in that references something specific from our last interaction or their recent professional activity. I'll review each draft and send the ones that feel right.
```

### Prompt 5: CRM Cleanup

```
Do a CRM health check. Find: (1) contacts with incomplete profiles (missing company or role), (2) contacts with no interactions logged in 180+ days, (3) duplicate entries (same name or same email), (4) contacts with outdated company info (they may have changed jobs). For incomplete profiles, try to enrich them from web search. For potential duplicates, show me both entries and let me decide which to merge. For stale contacts, ask me one by one: keep, archive, or delete.
```

## Common Gotchas

### 1. CRM Becomes a Graveyard

The most common failure mode: you enter 200 contacts, the agent sends follow-up reminders, and you ignore all of them because 200 follow-ups is overwhelming. The CRM becomes a guilt-generating machine. **Fix:** Start small. Enter only 20-30 contacts — the ones you genuinely want to maintain relationships with. Set realistic follow-up intervals (every 30-90 days for most contacts, weekly only for active deals or urgent relationships). You can always add more contacts once the system is working. Quality over quantity.

### 2. Stale Context in Pre-Meeting Briefings

The agent's pre-meeting briefing is only as good as your interaction logs. If you skipped post-meeting logging for the last 3 months, the briefing will reference information that is 3 months old. **Fix:** The post-meeting logging cron is the most important habit to maintain. If you consistently skip it, simplify the prompt — accept a single sentence instead of structured notes. Something logged is infinitely better than nothing logged. Consider using the quick-capture via WhatsApp ("just had coffee with Sarah, she's starting a new project on X") rather than waiting for the formal evening prompt.

### 3. Over-Enthusiastic Email Scanning

The email interaction logger may pick up automated system emails, marketing emails, or transactional emails and log them as genuine interactions. Getting an auto-generated invoice from someone's company is not an "interaction." **Fix:** Configure the agent to only log emails where you or the contact wrote a substantive message (more than one line, not an auto-reply, not a calendar notification). Exclude specific email patterns: "noreply@", "notifications@", "billing@", and similar automated senders. Review the first week of auto-logged interactions and tell the agent which ones to filter out.

## Maintenance and Long-Term Health

### CRM Hygiene Cadence

- **Daily:** Post-meeting logging (prompted by the agent). Takes 1-2 minutes per meeting.
- **Weekly (Monday morning):** Review follow-up reminders and "going cold" contacts. Takes 5 minutes.
- **Monthly (1st of month):** Review the relationship health report. Archive contacts you no longer need to track. Takes 10 minutes.
- **Quarterly:** Run the CRM Cleanup prompt (Sample Prompt 5). Enrich incomplete profiles. Remove stale contacts. Takes 20-30 minutes.

### Handling Contact Departures and Job Changes

People change jobs, companies get acquired, and contacts move on. The agent should detect and handle these transitions:

```bash
openclaw cron add --at "10:00" --weekdays "mon" "Select 10 contacts from my CRM who I haven't interacted with in 30+ days. For each, do a quick web search for their name + company. If their company website no longer lists them, or if they appear at a different company, flag the contact as 'POSSIBLE JOB CHANGE' and include the evidence. This is a great reason to reach out — job transitions are natural reconnection points."
```

A job change is often the best excuse to reach out to someone you have lost touch with. "Congratulations on the new role" is always a welcome message.

### Scaling Your CRM Over Time

- **0-50 contacts:** Manual entry works fine. Log everyone yourself.
- **50-150 contacts:** Email interaction logging becomes essential — you cannot manually track this many relationships. Enable the auto-logger.
- **150-300 contacts:** The follow-up system is critical. Without it, most of these relationships go cold. Set longer follow-up intervals (60-90 days) for less important contacts.
- **300+ contacts:** Consider segmenting into active (follow-up enabled) and archive (searchable but no reminders). Only your active segment should generate follow-up reminders. The agent should not remind you to follow up with 300 people.

### Enterprise CRM Sync

If you also use a company CRM (HubSpot, Salesforce, Pipedrive), your personal CRM should complement it, not duplicate it:

- **Work contacts managed in the company CRM** should NOT be duplicated in your personal Obsidian CRM. The company CRM is the source of truth for business relationships.
- **Personal connections** (mentors, friends, conference acquaintances, community contacts) live in your Obsidian CRM.
- **Overlap contacts** (someone who is both a personal friend and a business contact) can exist in both, but keep them separate. Your personal CRM notes ("we bonded over our kids' soccer teams") should not be in your company CRM.
- If you install `hubspot` or `pipedrive`, configure the agent to sync in one direction only: read from the enterprise CRM for context, but never write personal CRM data into the enterprise system.

### Voice Notes and Quick Capture Patterns

The most valuable CRM data is captured in the 5 minutes after a conversation while it is fresh. For situations where typing is not convenient (walking between conference sessions, driving home from a dinner), use voice notes:

1. Install `openai-whisper` for local transcription.
2. Record a voice memo on your phone: "Just had a great conversation with Maria Santos from TechCorp. She runs their developer relations team. We talked about community building strategies. She mentioned they're looking for speakers for their November conference. Follow up in 2 weeks with my speaker bio."
3. Send the voice memo to the agent via WhatsApp or Telegram.
4. The agent transcribes it, extracts the contact details and action items, creates or updates the CRM file, and sets the follow-up reminder.

This captures rich context with zero typing. The transcription does not need to be perfect — even rough notes are better than nothing.

### Cost Considerations

- **Tavily API credits** are the main cost driver. Each contact research query (pre-meeting briefings, weekly enrichment) uses credits. The free tier handles light use (5-10 research queries per week). Heavy users (daily meetings with new contacts) should budget for paid Tavily access.
- **AI model tokens** are used for summarization, draft generation, and CRM queries. Moderate usage — expect $2-5/month for an active networker.
- **openai-whisper** (optional) runs locally with no API cost if you use the local model. The cloud API version costs per minute of audio transcribed.
- **All CRM data is stored locally** in Obsidian — no SaaS subscription required for the database itself.
