# Personal Event Aggregator — OpenClaw Reference Guide

## What This Does

This setup configures OpenClaw to automatically discover, collect, and consolidate events from multiple sources — your email invitations, social media feeds, local event boards, newsletters, and friends' shared calendars — into a single unified view on your Google Calendar. Instead of manually checking five different apps and websites to figure out what is happening this weekend, the agent continuously scans your configured sources, deduplicates events, and presents a curated list tailored to your interests, location, and schedule availability.

## Who This Is For

**Profile:** Socially active individuals, parents coordinating family schedules, community organizers, or anyone who regularly misses events because they were announced on a platform they did not check in time.

**Industry:** Personal life management. Also useful for community managers, local business owners tracking competitor events, and freelancers who attend networking events and meetups.

**Pain point:** Events are announced across too many channels — Facebook, Meetup, Eventbrite, email newsletters, WhatsApp groups, Instagram stories, neighborhood apps. You find out about things after they happen, or you double-book because your calendar does not reflect everything you are considering attending.

## OpenClaw Setup

### Required Skills

```bash
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard
clawhub install gog
clawhub install tavily-web-search
clawhub install summarize
clawhub install agent-browser
clawhub install web-scraper-as-a-service
```

**Skill explanations:**

- **gog** — Google Workspace integration for reading and writing to Google Calendar, processing Gmail invitations, and accessing shared calendars.
- **tavily-web-search** — Searches the web for events matching your interests and location. Used for discovering events not sent directly to you.
- **summarize** — Condenses event descriptions, long newsletter announcements, and multi-paragraph event pages into short summaries with date, time, location, and cost.
- **agent-browser** — Navigates dynamic event websites (Eventbrite, Meetup, local venue calendars) that require JavaScript rendering to extract event details.
- **web-scraper-as-a-service** — Builds recurring scrapers for event sources you check regularly (a local theater's calendar page, a community center's schedule, a venue's upcoming shows page).

### Optional Skills

```bash
clawhub install whatsapp-cli       # Scan WhatsApp group chats for event mentions
clawhub install telegram           # Monitor Telegram channels for event announcements
clawhub install instagram          # Track event posts from local venues on Instagram
clawhub install bird               # Monitor X/Twitter for local event announcements
clawhub install obsidian           # Log attended events and notes in your knowledge base
clawhub install apple-reminders    # Set reminders for RSVP deadlines and ticket sales
clawhub install todoist            # Create tasks for event prep (buy tickets, arrange transport)
clawhub install weather            # Add weather forecasts to outdoor event entries
clawhub install deepl-translate    # Translate event descriptions in foreign languages
```

### Accounts and API Keys Required

| Service | What You Need | Where to Get It |
|---|---|---|
| Google Account | OAuth for Calendar + Gmail | Google Cloud Console |
| Tavily | `TAVILY_API_KEY` | https://tavily.com |
| Chrome/Playwright | Local browser for `agent-browser` | Installed automatically |

### Hardware Recommendations

- Any OpenClaw-capable machine. A Mac Mini or always-on Linux box is ideal so the agent can scrape event sources on a schedule without your laptop being open.
- No GPU needed.
- Stable internet connection required for web scraping and API calls.

### Channel Configuration

- **Primary output:** Google Calendar entries created via `gog`.
- **Notifications:** Use `clawsignal` or `telegram` for real-time alerts when a high-interest event is discovered.
- **Weekly digest:** The agent can compile a weekly email or chat message summarizing upcoming events.

## Core Automation Recipes

### 1. Email Invitation Auto-Processing

```bash
openclaw cron add --every 15m "Scan my Gmail for new calendar invitations and event-related emails. For each: (1) extract the event name, date, time, location, and cost, (2) check my Google Calendar for conflicts, (3) if no conflict, create a tentative calendar entry with all details in the description, (4) if there is a conflict, flag it and include both events in your notification to me."
```

This catches formal invitations and event emails (Eventbrite confirmations, meetup RSVPs, party invites) and gets them onto your calendar automatically.

### 2. Local Event Discovery

```bash
openclaw cron add --at "08:00" --weekdays "mon,thu" "Search for events happening in [YOUR CITY] this coming weekend. Focus on these categories: [live music, art exhibitions, food festivals, outdoor markets, tech meetups]. Use tavily-web-search to find events from Eventbrite, Meetup, and local event listing sites. For each event found, provide: name, date, time, venue, price, and a one-line description. Deduplicate against events already on my calendar."
```

Runs twice a week to catch new event listings before the weekend.

### 3. Venue Calendar Scraping

```bash
openclaw cron add --at "09:00" --weekdays "mon" "Scrape the following venue websites for their upcoming event schedules: [LIST YOUR FAVORITE VENUES WITH URLs]. Extract all events for the next 30 days. Compare against my calendar. For any new events matching my interests ([your interests]), create tentative calendar entries and summarize what is new this week."
```

This handles venues that do not use Eventbrite or Meetup — local theaters, community centers, bars with live music, galleries with opening nights.

### 4. WhatsApp and Messaging Group Scan

```bash
openclaw cron add --every 2h "Scan my WhatsApp groups [list group names] for messages that mention events, parties, gatherings, meetups, or contain dates and times. Extract any event details and add them to my 'Social Events' Google Calendar as tentative entries. Include the group name and sender in the calendar entry notes."
```

Requires `whatsapp-cli`. Catches the informal "hey everyone, BBQ at my place Saturday 3pm" messages that never make it to a formal calendar invitation.

### 5. Weekend Preview Briefing

```bash
openclaw cron add --at "18:00" --weekdays "thu" "Compile my Weekend Preview. Review all calendar entries for Saturday and Sunday. Add weather forecasts for outdoor events using the weather skill. Group events by: (1) confirmed (I have RSVPd or bought tickets), (2) tentative (on my calendar but not confirmed), (3) discovered (new events matching my interests not yet on my calendar). Format as a clean summary I can review in 2 minutes."
```

Thursday evening is the ideal time to review weekend plans while there is still time to buy tickets or make reservations.

### 6. RSVP Deadline Tracker

```bash
openclaw cron add --every 6h "Check my tentative calendar events for the next 14 days. For any event with an RSVP deadline or ticket sale end date mentioned in the description, check if the deadline is within 48 hours. If so, send me a notification: 'RSVP deadline approaching: [event name] — deadline [date/time]. Confirm or remove?'"
```

Prevents you from missing early-bird pricing or RSVP cutoffs for events you want to attend.

### 7. Post-Event Logging

```bash
openclaw cron add --at "21:00" "Check if I had any calendar events today that are now past. For each completed event, ask me: 'How was [event name]? Any notes?' If I respond, save my notes to the calendar entry description. If I don't respond within 30 minutes, skip."
```

Builds a lightweight event diary without requiring you to open a separate app.

### 8. Monthly Event Report

```bash
openclaw cron add --at "10:00" --monthday "1" "Generate my monthly event report for last month. List: (1) total events attended, (2) events by category, (3) total estimated spending on tickets/entry fees, (4) events I had on my calendar but did not attend, (5) most active event sources (which venues, groups, or newsletters generated the most events). Highlight any patterns."
```

### Advanced Configuration: Interest-Based Scoring

For power users who want smarter event recommendations, configure an interest scoring system:

```
Tell the agent: "Rate each discovered event on a 1-10 relevance scale based on these weighted factors:
- Category match (does it match my listed interests?) — 3 points max
- Proximity (how close to my home?) — 2 points max
- Social signal (was it shared by someone I know or in a group I'm in?) — 2 points max
- Timing (does it fit my availability without conflicts?) — 2 points max
- Novelty (have I attended similar events recently or is this something new?) — 1 point max

Only add events scoring 6+ to my calendar. Show me events scoring 4-5 in the weekly digest but don't add them. Ignore events below 4."
```

This prevents calendar flooding while ensuring you still see borderline-interesting events in digest form.

### Source Priority Configuration

Not all event sources are equally reliable. Configure the agent to weight sources by trust level:

- **Tier 1 (highest trust):** Direct email invitations, Eventbrite confirmations, events from people in my contacts.
- **Tier 2 (medium trust):** Venue websites I've explicitly listed, Meetup groups I follow, newsletters I subscribe to.
- **Tier 3 (lower trust):** General web search results, social media mentions, WhatsApp group chatter.

For Tier 1 sources, create calendar entries automatically as tentative. For Tier 2, create entries but mark as UNVERIFIED. For Tier 3, include in the weekly digest only — do not auto-create calendar entries.

## Guardrails and Safety

The agent must NEVER do the following autonomously:

1. **Never purchase tickets or make payments.** The agent may find events and provide purchase links, but it must never complete a transaction. Even if `payment` skill is installed, ticket purchases require explicit human approval for each transaction.

2. **Never RSVP or confirm attendance** on your behalf. The agent creates tentative calendar entries. You decide which become confirmed.

3. **Never share your calendar or event plans** with anyone. The agent should not post your schedule to social media, share it in group chats, or expose which events you are considering attending.

4. **Never accept calendar invitations automatically.** Invitations are processed into tentative entries for your review, never auto-accepted.

5. **Never scrape websites that require login credentials** unless you have explicitly configured those credentials. The agent should use public event pages only.

6. **Never store or transmit location data** beyond what is needed for event discovery. Your city/neighborhood preference stays in the local config.

7. **Never delete or modify confirmed calendar events.** The agent may add tentative entries and update their descriptions, but confirmed events are read-only.

Configure these guardrails in your OpenClaw rules file:

```
- NEVER purchase tickets, RSVP, or confirm attendance without my explicit approval
- NEVER share my calendar, schedule, or event interests with third parties
- NEVER accept calendar invitations automatically — create tentative entries only
- NEVER delete or modify confirmed calendar events
- Only scrape publicly accessible event pages — do not log into any service to find events
- When creating calendar entries, always set status to TENTATIVE
```

## Sample Prompts

### Prompt 1: Initial Configuration

```
I want you to be my personal event aggregator. I live in [CITY, STATE/COUNTRY]. My interests include: [live jazz, craft beer festivals, tech meetups, outdoor hiking groups, art gallery openings, comedy shows].

Here are my regular event sources:
- Email: Check my Gmail for Eventbrite and Meetup notifications
- Websites: [list 3-5 venue URLs you check regularly]
- WhatsApp groups: [list group names if using whatsapp-cli]

My availability rules:
- Weekday evenings: available after 6pm, prefer events ending by 10pm
- Weekends: fully available
- I don't attend events more than 45 minutes drive from my home

Start by searching for events in my area for the next 2 weeks and show me what you find.
```

### Prompt 2: Specific Event Search

```
I'm looking for something fun to do this Saturday evening with 3 friends. We like [type of activity]. Budget is under $50 per person. Search for options in [area/neighborhood] and give me the top 5, ranked by how well they match our preferences. Include venue, time, cost, and a link to more info.
```

### Prompt 3: Travel Event Discovery

```
I'm traveling to [CITY] from [date] to [date]. Search for noteworthy events happening during my visit — concerts, festivals, museum exhibitions, food events, or anything a visitor shouldn't miss. Cross-reference with my interests. Create tentative calendar entries for the top recommendations.
```

### Prompt 4: Recurring Event Setup

```
Set up weekly monitoring for these recurring event series:
- [Local farmers market] — every Saturday, but sometimes moves locations
- [Neighborhood run club] — every Tuesday and Thursday, check their Instagram for route updates
- [Monthly book club] — first Wednesday of every month, check the WhatsApp group for the book selection

Make sure these stay on my calendar with the latest details updated each week.
```

### Prompt 5: Season Pass Planning

```
I want to plan my cultural calendar for the next 3 months. Search for: (1) upcoming concert tours with stops in my city, (2) museum exhibitions opening or closing soon, (3) seasonal festivals or markets, (4) recurring meetup series in my interest areas. Compile everything into a "season preview" document and highlight the events that require advance ticket purchases. Add the most interesting ones as tentative calendar entries.
```

## Common Gotchas

### 1. Duplicate Calendar Entries

The most common issue. An event appears on Eventbrite AND in a newsletter AND a friend shares it on WhatsApp — the agent creates three calendar entries. **Fix:** Configure deduplication rules explicitly. Tell the agent: "Before creating any calendar entry, search my calendar for existing events on the same date at the same venue. If a match exists, update the existing entry's description with any new information instead of creating a duplicate." The agent should match on date + venue combination, not just event name (which may vary across sources).

### 2. Stale Event Data from Scraped Websites

Venue websites sometimes leave old events up, or events get canceled without the page being taken down. The agent may create calendar entries for events that no longer exist. **Fix:** Configure the agent to only scrape events dated in the future, and to flag any event sourced from web scraping (as opposed to a formal invitation) as UNVERIFIED in the calendar entry description. Run a weekly cleanup to remove tentative entries for events that have passed without being confirmed.

### 3. Over-Enthusiastic Discovery

If your interest list is broad ("music, food, outdoors"), the agent may flood your calendar with dozens of tentative events per week. **Fix:** Set a maximum — "discover no more than 10 events per week" — and have the agent rank by relevance before adding to your calendar. You can also configure a "discovery budget" where the agent only adds events that score above a relevance threshold based on your past attendance patterns.

## Maintenance and Long-Term Health

### Keeping Event Sources Fresh

Venue websites change their URL structure, event listing platforms update their layouts, and community groups move between platforms. Every 3 months, review your configured event sources:

1. Run each venue scraper manually and confirm it still returns valid results.
2. Check that your WhatsApp groups are still active and still posting events.
3. Remove any newsletter sources that have stopped publishing.
4. Add any new venues, groups, or platforms you have started using.

The `web-scraper-as-a-service` skill may need its scrapers rebuilt if a venue redesigns their website. The agent will usually report scraping errors, but silent failures (where the page loads but the events section has moved) require periodic manual verification.

### Calendar Hygiene

Over time, your calendar accumulates tentative events that you never confirmed or declined. These clutter your calendar view and make it harder to see your actual schedule. Run a monthly cleanup:

```bash
openclaw cron add --at "10:00" --monthday "15" "Find all TENTATIVE calendar events in the past that were never confirmed. List them and ask me: delete all past unconfirmed events? Also find any TENTATIVE events in the next 7 days and ask me to confirm or remove each one."
```

### Cost and API Usage

The primary cost drivers for this setup are:

- **Tavily API credits** — Each local event search and venue research query uses credits. The free tier handles casual use. If you run discovery twice a week for a single city, expect 8-12 search queries per week.
- **agent-browser sessions** — Dynamic website scraping via Playwright uses local compute but no API credits. However, aggressive scraping (every hour across many sites) will slow down your machine. Weekly scraping for most venues is sufficient.
- **Google Calendar API** — Free tier is generous. Creating dozens of tentative events per week is well within limits.

### Sharing Event Discoveries

If you want to share your curated event list with friends or family without exposing your full calendar:

1. Create a dedicated "Shared Events" Google Calendar that is separate from your primary calendar.
2. Configure the agent to create event entries in the shared calendar for events you explicitly tag as "shareable."
3. Share that specific calendar with friends or family.
4. The agent should NEVER automatically share events — you must tag each one for sharing.

This gives friends access to your curated event discoveries without revealing your personal schedule, meeting commitments, or tentative plans.

### Integration with Other OpenClaw Workflows

Event aggregation connects naturally with other personal automation setups:

- **Wardrobe Planner:** When the event aggregator adds a tentative event to your calendar, the wardrobe planner can automatically flag it for outfit planning. Events with specific dress codes (galas, outdoor festivals, business mixers) get outfit suggestions generated well in advance.
- **Personal CRM:** When attending a networking event or conference, the CRM system can generate a list of contacts who may also attend, based on their professional interests and past event attendance patterns.
- **Habit Tracker:** If one of your tracked habits is "attend one social event per week," the event aggregator feeds data to your habit tracker. The agent can check whether you confirmed attendance at any event this week and log it automatically.
- **Budget Tracking:** If you track spending, the event aggregator can estimate weekly and monthly event-related costs based on ticket prices and entry fees in the calendar entries. Install `plaid` or `financial-overview` for actual spending correlation.
