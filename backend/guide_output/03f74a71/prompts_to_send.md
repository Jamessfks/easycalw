# Prompts to Send — James Hartwell Real Estate Setup

These are the exact prompts to send to your OpenClaw bot via Telegram to test, configure, and use each capability. Send them one at a time and wait for the response before moving to the next.

---

## Onboarding Prompts (Send These First)

### 1. Identity Confirmation Test
```
Who are you and what can you help me with as a real estate agent?
```
Expected: The agent introduces itself as your real estate assistant, lists its capabilities (CRM updates, lead drafting, property descriptions, calendar, briefings), and confirms it knows it must get your approval before sending anything to clients.

### 2. Guardrail Verification
```
Go ahead and send an email to my last Zillow lead saying I'll call them tomorrow.
```
Expected: The agent REFUSES to send without your approval. It should draft the email and ask you to confirm before sending. If it tries to send directly, your guardrails need adjustment.

### 3. Google Calendar Connection Test
```
What's on my calendar for the next 3 days?
```
Expected: A list of your upcoming appointments pulled live from Google Calendar. If this fails, re-run `openclaw skill auth gog`.

---

## Daily Use Prompts

### Lead Response Drafting

```
I got a new Zillow inquiry from Sarah Chen, she's interested in a 3BR/2BA in the $425K–$475K range in South Austin, says she's pre-approved. Draft a warm reply that asks about her timeline, whether she's working with an agent, and offers to show her properties this weekend.
```

```
Instagram DM from @mike_atx2024: "Hey saw your listing on Barton Hills, is it still available? What's the HOA?" — draft a response.
```

```
Website lead: Tom and Linda Reyes, looking to sell their home in Cedar Park, wondering about current market value. Draft an initial outreach email that sets up a listing consultation.
```

### Property Description Writing

```
Write a property description for MLS listing: 4BR/2.5BA, 2,200 sqft, built 2018, Mueller neighborhood. Open floor plan, chef's kitchen with gas range and waterfall island, primary suite with spa bath, covered back patio, 2-car garage, energy efficient. List price $575,000. Target buyers: young families and move-up buyers.
```

```
Write 3 Instagram captions for a new listing at 4521 Oak Creek Drive, 3BR/2BA, $389,000. Photo themes: front exterior (curb appeal), modern kitchen, backyard with pool. Include relevant Austin hashtags.
```

```
Write a Facebook post announcing an open house this Sunday 1–4pm at 7823 Maple Ridge, $459,000, 4BR in Round Rock school district.
```

### CRM Management (Will Ask for Your Approval)

```
I just finished a showing with David Park at the Riverside property. He liked the layout but said the kitchen needs updating. He's not ready to make an offer yet but wants to see 2-3 more options. Propose the CRM update for my approval.
```

```
Mark Chen has gone 3 weeks without a response. Suggest whether I should move him to cold leads or try one more outreach, and draft the outreach if you recommend it.
```

```
Show me a summary of my hottest leads right now — anyone I've talked to in the last 48 hours or who has asked for a showing.
```

### Calendar and Scheduling

```
I have a listing appointment with the Johnsons at 4pm today on 2341 Willow Creek. Can you add a 30-minute prep block at 3pm with a note to review their property's comparable sales?
```

```
Block off next Tuesday and Wednesday afternoon for a real estate conference. No showings those days.
```

### Voice Note Workflow (After Setup)
Send a Telegram voice note saying one of these — the bot will transcribe and act:

- "Just finished showing at 8200 Lamar, buyers loved the master suite but thought the backyard was small. Mark as warm lead and follow up Wednesday."
- "Add a new contact: Jennifer Walsh, referred by Mike Thompson, looking to buy in the $550–600 range, wants a pool, pre-approved, timeline is 90 days."
- "Cancel my showing tomorrow at 10am with the Garcias, they called and need to reschedule."

---

## Automation Test Prompts

### Manual Cron Trigger
Run the morning briefing manually to verify it works before the scheduled 7am run:
```bash
openclaw cron run morning-briefing
```

### Market Analysis Request
```
Give me a quick market pulse for South Austin single-family homes, $350K–$500K range. What's selling quickly, what's sitting, and are prices trending up or down this month?
```

### Weekly Report Preview
```
Generate a quick pipeline summary: how many active listings do I have, how many leads are hot vs warm vs cold, and what's my next deadline this week?
```

---

## Content Batch Prompts (High-Value Time Savers)

### Monthly Client Touch-Base Batch
```
Draft personalized touch-base messages for 5 past clients. Make each one mention: (1) current Austin market conditions relevant to their neighborhood, (2) an estimated home value trend for their area, and (3) a natural, friendly check-in question. Keep each under 100 words. I'll fill in the client names.
```

### Listing Description Batch
```
I have 3 new listings to describe. Here are the details:

1. 2BR/1BA, 1,100 sqft, East Austin, built 1962 updated 2021, $325K. Highlights: original hardwood floors, new kitchen, backyard with deck.

2. 4BR/3BA, 3,100 sqft, Westlake, built 2015, $689K. Highlights: pool, 3-car garage, home office, primary suite.

3. 3BR/2BA, 1,650 sqft, Cedar Park, built 2020, $399K. Highlights: new construction community, open floor plan, smart home features.

Write MLS-ready descriptions for all three. Make them distinct in tone — the East Austin one should feel hip and urban, Westlake should be upscale, Cedar Park should feel family-friendly.
```

---

## Troubleshooting Prompts

If the bot seems stuck or confused, send:
```
/reset
```
or
```
Start fresh. Ignore everything in our previous conversation. What is your current status and what skills do you have available?
```

If you want to see what the agent is doing:
```bash
openclaw logs --follow
```

---

## Important Reminders

- The agent will DRAFT all client-facing communications and wait for your "send it" or "looks good" before sending anything
- For CRM changes, the agent will show you the proposed action and wait for your confirmation
- You can always override with explicit instructions: "Go ahead and send that" or "Cancel, don't do that"
- The agent operates 7am–9pm CT by default; transaction deadline monitoring runs 24/7
- If you ever see something unexpected, send: "Stop and explain what you were about to do"
