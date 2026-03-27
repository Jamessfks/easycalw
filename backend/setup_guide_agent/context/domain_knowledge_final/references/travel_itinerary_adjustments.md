# Travel Itinerary Adjustments — OpenClaw Reference Guide

## What This Does

This setup turns OpenClaw into a travel companion agent that monitors your active trips for disruptions and helps you adapt on the fly. It watches for flight delays and cancellations, suggests alternative routes, adjusts hotel and activity bookings when plans change, keeps all reservations organized in one place, and provides real-time local information (weather, transport, restaurant recommendations) wherever you are. The agent does not book travel from scratch — it manages and adjusts trips that are already planned.

The key value is reactive intelligence: when something goes wrong mid-trip (a canceled flight, a closed attraction, unexpected weather), the agent immediately surfaces alternatives so you spend less time on your phone troubleshooting and more time traveling.

## Who This Is For

**Primary user:** Frequent travelers, digital nomads, business travelers managing complex multi-city itineraries, and families coordinating group travel where a disruption affects multiple people and bookings.

**Industry:** Personal travel, business travel, group tour coordination, travel blogging and content creation.

**Pain point:** When a flight gets canceled at 11pm in a foreign city, you are on your own — frantically searching for alternatives on a phone while stressed and exhausted. Even minor disruptions (a delayed connection, a closed restaurant, rain on a beach day) cascade into wasted time and suboptimal backup plans. Most travelers have their itinerary scattered across confirmation emails, booking apps, and screenshots. There is no single place where everything lives, and no system watching for problems.

**Technical comfort:** Moderate. This guide assumes the user is comfortable with apps and can install OpenClaw. Some travelers may run OpenClaw on a laptop they carry; others may leave it running on a home machine and interact remotely.

## OpenClaw Setup

### Skills to Install

```bash
# Security baseline
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard

# Core functionality
clawhub install gog                    # Gmail + Calendar for reservation emails and schedule
clawhub install agent-mail             # Email triage for booking confirmations
clawhub install tavily-web-search      # Real-time flight status, local search, alternatives
clawhub install weather                # Destination weather forecasts
clawhub install summarize              # Summarize booking details and travel articles
clawhub install obsidian               # Trip knowledge base and itinerary notes
clawhub install todoist                # Packing lists, pre-trip tasks, day-of checklists
clawhub install brave-search           # Privacy-first search for local recommendations
clawhub install whatsapp-cli           # Coordinate with travel companions

# Navigation and local intelligence
clawhub install agent-browser          # Check airline and hotel websites for updates
clawhub install deepl-translate        # Translate menus, signs, conversations
clawhub install translate-image        # Photo translation for foreign text

# Optional enhancements
clawhub install self-improving-agent   # Learn travel preferences over time
clawhub install pdf-toolkit            # Handle boarding passes, vouchers, confirmations
clawhub install notion                 # Alternative to Obsidian for trip planning
clawhub install clawsignal             # Urgent disruption alerts via Signal
```

### Channels to Configure

- **Email (Gmail via `gog` + `agent-mail`):** The intake channel for all booking confirmations. Airlines, hotels, rental car companies, and activity platforms all send confirmation emails. The agent extracts reservation details (confirmation numbers, dates, times, addresses) and consolidates them into the trip itinerary. Create a Gmail label `Travel/Active Trip` for the current journey.

- **Calendar (Google Calendar via `gog`):** Each booking becomes a calendar event with the confirmation number, address, check-in time, and contact phone number in the event description. The full trip is visible at a glance on any device.

- **Obsidian vault:** Trip notes organized by destination. Each trip folder contains: itinerary overview, restaurant shortlist, local transport notes, emergency contacts (embassy, insurance, local emergency numbers), and a daily journal.

- **WhatsApp (`whatsapp-cli`):** For coordinating with travel companions, sharing itinerary updates, and communicating with local contacts (tour guides, hosts, drivers).

- **Todoist:** Pre-trip packing checklist, document preparation tasks (visa, travel insurance, currency exchange), and day-of reminders.

### Hardware Recommendations

- **Option A: Laptop on the road.** Run OpenClaw on the laptop you carry while traveling. Requires internet connectivity, which can be intermittent in some destinations.

- **Option B: Home server (Mac Mini) + remote access.** Leave OpenClaw running at home and interact via WhatsApp or Signal messages. The agent monitors your email and sends alerts proactively. This is more reliable since it is always on and always connected, but depends on a messaging channel staying available.

- **Smartphone:** Essential for receiving alerts and interacting with the agent via WhatsApp or Signal when away from the laptop.

### API Keys Required

| Service | Key | Where to Get It |
|---|---|---|
| Google (OAuth) | Google Account login | accounts.google.com |
| Tavily | `TAVILY_API_KEY` | tavily.com |
| Todoist | `TODOIST_API_TOKEN` | todoist.com |
| DeepL | DeepL API Key (free tier) | deepl.com/pro-api |
| TranslateImage | TranslateImage API Key | translateimage.com |
| WhatsApp | WhatsApp CLI session | Local setup |

## Core Automation Recipes

### 1. Flight Status Monitoring

```bash
openclaw cron add --every 30m "Check the status of all my upcoming flights within the next 72 hours. Use Tavily to search for real-time flight status by airline and flight number (stored in my Google Calendar events labeled 'Flight'). If any flight is delayed by more than 30 minutes, canceled, or has a gate change, alert me immediately via WhatsApp with the updated information and suggest what to do: for delays, check if my connection is still viable; for cancellations, search for the next 3 alternative flights on any airline to my destination."
```

This is the single most valuable automation. A 30-minute head start on a cancellation means you are rebooking while other passengers are still in the queue.

### 2. Daily Trip Briefing

```bash
openclaw cron add --every day --at 07:00 "Generate today's trip briefing for wherever I am. Include: weather forecast for the day and evening, today's scheduled activities and reservations from Google Calendar with addresses and confirmation numbers, any transit or logistics between activities (estimated travel times), local tips for today's area, and tomorrow's first activity so I can plan ahead. Keep it concise and actionable."
```

Wake up to a complete picture of the day ahead, no matter what city you are in.

### 3. Connection Viability Monitor

```bash
openclaw cron add --every 15m "If I have a connecting flight today, monitor the inbound flight status and calculate whether the connection is still viable given the minimum connection time at the connecting airport. If the connection becomes tight (less than 60 minutes for domestic, less than 90 minutes for international), alert me via WhatsApp and: 1) identify the gate for my connecting flight, 2) search for the next available flight if I miss the connection, 3) check if the airline has automatically rebooked me by scanning my email for rebooking notifications."
```

Tight connections are the most stressful part of air travel. Proactive monitoring turns anxiety into information.

### 4. Weather-Based Activity Adjustment

```bash
openclaw cron add --every day --at 06:00 "Check the weather forecast for my current location today and tomorrow. If rain probability exceeds 60% during any planned outdoor activity (beach, hiking, walking tour, outdoor dining), alert me and suggest indoor alternatives using Brave Search. Include: museums, covered markets, indoor attractions, and restaurants near my planned activity location. If I have a refundable outdoor booking, remind me of the cancellation policy deadline."
```

Turns a rained-out day from a disappointment into a pivot.

### 5. Restaurant and Dining Research

```bash
openclaw cron add --every day --at 11:00 "Check my Google Calendar for today's location. Search for highly-rated restaurants within walking distance of my afternoon and evening activities. Focus on local cuisine, not tourist traps. For each recommendation, include: name, cuisine type, price range, must-try dishes, reservation requirement (walk-in friendly or booking needed), and hours. If a restaurant requires reservations, note that I should book now. Save the list to my trip notes in Obsidian."
```

Local dining intelligence tailored to where you already are in the city.

### 6. Itinerary Consolidation

```bash
openclaw cron add --every 4h "Scan my Gmail for any new booking confirmations, itinerary changes, or travel-related emails. For each one, extract: service type (flight, hotel, car, activity), confirmation number, dates and times, address or terminal, cancellation policy, and contact information. Update my trip itinerary note in Obsidian and create or update the corresponding Google Calendar event. If any new booking conflicts with an existing one, alert me."
```

Keeps the master itinerary current as bookings roll in or change.

### 7. Local Transport Guidance

```bash
openclaw cron add --every day --at 08:00 "For my current city, research the most practical transportation options between today's activities. Include: public transit routes and costs, ride-share availability and typical pricing, walking distances, and any transit passes or cards I should buy. If I am in a city with a metro system, identify the nearest stations to each activity. Note any transport-specific gotchas (last train times, zones, tap-on requirements). Save to my trip notes."
```

Local transport is where most travelers waste the most time and money.

### 8. Pre-Trip Preparation Checklist

```bash
openclaw cron add --every day --at 09:00 "If my next trip departure is within 7 days, run through the pre-trip checklist: 1) verify all flights are confirmed (check email for any schedule changes), 2) confirm all hotel reservations, 3) check passport expiration (must be valid 6+ months past return date for most countries), 4) verify travel insurance coverage, 5) check destination entry requirements (visa, COVID rules, customs declarations), 6) create a packing list based on the weather forecast and planned activities. Post any action items to Todoist."
```

The week-before checklist catches problems while they are still solvable.

## Guardrails and Safety

### The Agent Must NEVER:

- **Book, cancel, or modify reservations autonomously.** The agent researches alternatives and presents options, but the human clicks "Book" or calls the airline. Automated booking changes can result in unexpected charges, lost reservations, or non-refundable commitments. Configure `agentguard` to block any action that submits forms, clicks confirmation buttons, or enters payment information via `agent-browser`.

- **Share passport numbers, credit card numbers, or loyalty account details in messages.** These should be stored securely and never included in WhatsApp messages, emails to travel companions, or any output the agent generates. Configure `agentguard` to detect and block output containing patterns matching passport numbers, credit card numbers, or frequent flyer numbers.

- **Enter payment information on any website.** Even for legitimate rebooking, the agent must never input financial data into web forms.

- **Make decisions about trip cancellation or insurance claims.** The agent can surface cancellation policies and flag deadlines, but the decision to cancel and the process of filing claims are human actions with legal and financial implications.

- **Share real-time location data.** The agent infers location from your itinerary, not from GPS tracking. It should never transmit location data to third-party services beyond what is needed for weather and search queries.

- **Contact airlines, hotels, or other service providers on your behalf.** The agent drafts messages and provides phone numbers, but actual communication with providers is human-initiated.

### Recommended `agentguard` Rules

```
Block: submit_form, make_payment, share_credential, cancel_booking, send_email_to_vendor
Allow: search_web, read_email, create_note, create_event, draft_message, check_weather
Require approval: any WhatsApp message to non-companion contacts, any agent-browser navigation to booking sites
```

## Sample Prompts

### Prompt 1: Trip Setup

```
I am flying from San Francisco to Tokyo on April 12 (United UA837, departing 11:25am), connecting through Narita to Osaka on April 13 (ANA NH2177, 8:00am). I am staying at Hotel Granvia Osaka (confirmation #HG-29471) for 4 nights, then taking the Shinkansen to Kyoto on April 17 for 3 nights at Kyoto Granbell Hotel (confirmation #KG-83021). Return flight April 20 from Osaka KIX (United UA838, 5:30pm). Set up my trip monitoring with flight status alerts, daily briefings, and local recommendations. I speak no Japanese so translation support is critical.
```

### Prompt 2: Flight Disruption Response

```
My flight UA837 SFO to NRT has been canceled. I am currently at SFO Terminal 3. Find me the next 5 available flights to any Tokyo-area airport (NRT or HND) departing today or early tomorrow morning. Include: airline, departure time, arrival time, number of stops, and whether the flight has award availability (I have United MileagePlus status). Also check if my hotel in Osaka will charge for a late check-in if I arrive a day late — their cancellation policy should be in my trip notes.
```

### Prompt 3: Rainy Day Pivot

```
It is pouring rain in Kyoto today and I had planned to visit the Fushimi Inari shrine and walk the Philosopher's Path. What are the best indoor alternatives within a 30-minute transit radius? I am interested in traditional crafts, food markets, museums, and cultural experiences. Also suggest a great ramen spot near whatever you recommend — I want something local, not a tourist chain.
```

### Prompt 4: Itinerary Change Cascade

```
I want to extend my Osaka stay by one night and shorten Kyoto to 2 nights. What needs to change? Check if Hotel Granvia Osaka has availability for April 17 (one extra night). Check if Kyoto Granbell will allow shortening my stay without penalty — their cancellation policy is in my notes. I will also need to change my Shinkansen reservation from April 17 to April 18. List everything I need to do to make this change, with phone numbers and websites for each booking.
```

### Prompt 5: Emergency Contacts and Information

```
Compile an emergency reference card for my Japan trip. Include: US Embassy in Tokyo and Osaka consulate addresses and phone numbers, Japan emergency numbers (police, ambulance, fire), my travel insurance policy number and 24/7 assistance phone number (it is in my email confirmations), nearest English-speaking hospitals to my hotels in Osaka and Kyoto, and how to say "I need help" and "I need a doctor" in Japanese. Save this as a note I can access offline.
```

## Common Gotchas

### 1. Flight Status Data Can Lag

Free flight status sources via web search sometimes lag 15-30 minutes behind real-time airline data. The agent's alert about a cancellation may arrive after the airline's own app notification. **Fix:** Use the agent for alternative research and cascading impact analysis (what else changes if this flight is canceled?), but keep the airline's own app installed for the fastest raw status updates. The agent adds value by immediately researching alternatives, not by being the first to detect the problem.

### 2. Hotel and Activity Websites Block Automated Browsing

Many booking platforms (Booking.com, Expedia, Airbnb) actively block automated browsing via `agent-browser`. The agent may fail to check availability or cancellation policies on these sites. **Fix:** Have the agent search for the information via Tavily or Brave Search first, which often surfaces cached availability and policy pages. For critical checks (can I extend my hotel stay?), call the hotel directly — the agent can provide the phone number and draft what you want to say.

### 3. Translation Quality Varies by Language Pair

`deepl-translate` excels at European languages but quality drops for some Asian languages. `translate-image` depends on image clarity and font style. **Fix:** For critical translations (medical situations, legal documents, allergy communication at restaurants), do not rely solely on the agent. Use multiple translation sources and, when possible, have a native speaker verify. For restaurants, have the agent generate an allergy card in the local language before the trip that you can show to staff.

### 4. Timezone Confusion in Multi-City Trips

When you cross timezones mid-trip, calendar events can appear at the wrong local time. The agent may also confuse "departure time" (always in local time) with UTC when processing flight information from emails. **Fix:** Explicitly confirm timezone handling in your setup prompt. Specify that all flight times should be in local departure/arrival timezone. Set Google Calendar to automatically adjust to your current timezone. Double-check any auto-created calendar events for the first day in a new timezone.

### 5. Connectivity Gaps Abroad

If you are running OpenClaw on a laptop, you lose the agent whenever you lose internet (subway, remote areas, airplane mode). If running on a home server, you depend on WhatsApp or Signal staying connected. **Fix:** Before going offline, ask the agent to generate a "pocket briefing" for the next 12 hours with everything you might need (maps, addresses, phone numbers, translations, reservation details). Save it to a locally-accessible note in Obsidian that does not require internet to read.

---

## Trip Folder Structure

Ask the agent to create this structure in Obsidian for each trip:

```
Trips/
  Japan April 2026/
    00-itinerary-overview.md        ← Master itinerary with all bookings
    01-flights.md                   ← Flight details, confirmation numbers, status
    02-hotels.md                    ← Hotel details, check-in/out, cancellation policies
    03-transport.md                 ← Trains, transfers, local transit
    04-restaurants.md               ← Shortlist with addresses and hours
    05-activities.md                ← Planned activities and tickets
    06-emergency-contacts.md        ← Embassy, hospitals, insurance, police
    07-packing-list.md              ← Checked items
    08-daily-journal.md             ← Daily notes and memories
    09-expenses.md                  ← Running expense log
```

## Skill Dependency Map

```
gog (Gmail + Calendar) ─────────┬──→ Booking confirmations + schedule
                                 │
agent-mail ──────────────────────┼──→ Email triage for travel correspondence
                                 │
tavily-web-search ───────────────┼──→ Flight status + local search + alternatives
                                 │
brave-search ────────────────────┼──→ Privacy-first local recommendations
                                 │
weather ─────────────────────────┼──→ Destination forecasts + activity planning
                                 │
agent-browser ───────────────────┼──→ Check airline/hotel websites
                                 │
deepl-translate ─────────────────┼──→ Text translation
                                 │
translate-image ─────────────────┼──→ Photo translation (menus, signs)
                                 │
obsidian ────────────────────────┼──→ Trip knowledge base + offline reference
                                 │
todoist ─────────────────────────┼──→ Pre-trip checklist + packing list
                                 │
whatsapp-cli ────────────────────┼──→ Travel companion coordination + alerts
                                 │
pdf-toolkit ─────────────────────┘──→ Boarding passes + vouchers
```

## Cost Estimate

| Item | Monthly Cost |
|---|---|
| OpenClaw (local) | Free |
| Tavily API (free tier) | Free |
| DeepL API (free tier, 500K chars/mo) | Free |
| TranslateImage API | ~$2-5/trip |
| Google Workspace (personal) | Free |
| WhatsApp CLI | Free |
| AI model usage | ~$15-30/mo during active travel |
| **Total** | **~$15-35/month during active travel** |

Cost scales with trip complexity. A simple domestic weekend trip uses minimal API calls. A multi-city international trip with frequent flight monitoring and translation requests will be at the higher end. The agent costs nothing when you are not traveling.

---

## Disruption Response Playbooks

Pre-configure the agent with response playbooks for common disruption scenarios. These templates help the agent react faster because it already knows what information you need:

### Flight Cancellation Playbook
```
When a flight is canceled:
1. Search for next 5 alternative flights to my destination on ANY airline
2. Check if the airline has automatically rebooked me (scan email)
3. Look up my rights: EU261 (if EU route), DOT compensation rules (if US domestic)
4. Find the airline's rebooking phone number and status of their customer service lines
5. Check if my travel insurance covers accommodation if I am stranded overnight
6. If overnight stay needed, search for hotels near the airport with availability tonight
7. Notify my travel companions via WhatsApp
8. Check cascading impact: does this affect my hotel check-in or any pre-booked activities?
```

### Hotel Cancellation / Overbooking Playbook
```
When hotel cannot honor reservation:
1. Document the situation (screenshot/save the confirmation for dispute)
2. Search for alternative hotels within 1 mile of the original, same star rating, available tonight
3. Check if the original booking was prepaid or pay-at-property
4. Look up my credit card's trip protection benefits
5. Draft a complaint email to the hotel chain's corporate office (save as draft)
6. If the hotel offers to relocate me, research the alternative property before accepting
```

### Missed Connection Playbook
```
When I miss a connecting flight:
1. Immediately check the departure board for next flights to my final destination
2. Search for flights on partner airlines that my ticket might be rebooked to
3. Locate the airline's rebooking desk or transfer counter at this airport
4. Check baggage status — will my checked bags be pulled or forwarded?
5. If next flight is tomorrow, find airport hotel options and lounge access
6. Notify anyone meeting me at the destination about the delay
```

### Lost Luggage Playbook
```
When checked baggage does not arrive:
1. Document: airline, flight number, bag tag number, bag description
2. Note the baggage claim office location at this airport
3. Check my travel insurance for delayed baggage coverage and per-day allowance
4. Search for a 24-hour pharmacy/store near my hotel for essential purchases
5. Draft a delayed baggage claim using the airline's online form (save as draft)
6. Set a reminder to follow up in 24 hours if no update received
```

## Packing List Generator

The agent generates a customized packing list based on your destination, trip duration, activities, and weather forecast:

```
Trip: Japan, 8 nights
Activities: City exploration, temple visits, day hiking, fine dining
Weather: 55-68F, 30% rain probability
Dress code notes: Remove shoes at temples, conservative dress for shrines

CLOTHING
[ ] Light jacket / windbreaker (layering for variable temps)
[ ] Rain layer (compact, packable)
[ ] Walking shoes (broken in, comfortable for 15K+ steps/day)
[ ] Temple-appropriate shoes (easy to remove — slip-ons)
[ ] 4x quick-dry shirts
[ ] 2x long pants (no shorts for temples)
[ ] 1x nice outfit (dinner at [restaurant])
[ ] Hiking pants + moisture-wicking top
[ ] 8x underwear + socks
[ ] Sleepwear

DOCUMENTS
[ ] Passport (valid through [date] — 6+ months past return ✓)
[ ] Printed hotel confirmations (backup for check-in without internet)
[ ] Travel insurance card (policy #[number])
[ ] International driving permit (if renting a car)
[ ] 2x passport photos (spare, for emergencies)
[ ] Copies of all bookings (saved offline in Obsidian)

ELECTRONICS
[ ] Phone + charger
[ ] Power adapter (Japan uses Type A, same as US — no adapter needed)
[ ] Portable battery (20,000mAh recommended for full-day exploration)
[ ] Noise-canceling headphones (long flights)
[ ] Camera + memory cards + charger

HEALTH
[ ] Prescription medications (in original containers for customs)
[ ] Basic first aid (band-aids, pain relief, anti-diarrheal)
[ ] Hand sanitizer
[ ] Sunscreen
[ ] Insect repellent (if hiking)

MONEY
[ ] Credit card (notify bank of travel — done? [ ])
[ ] Backup credit card (different network)
[ ] Small amount of local currency (JPY — Japan is still partly cash-based)
[ ] Cash for transit IC card top-up

MISC
[ ] Daypack for daily exploration
[ ] Reusable water bottle
[ ] Pocket Wi-Fi / SIM card (research before departure)
[ ] Small towel (onsen etiquette)
[ ] Ziplock bags (wet clothes, organization)
```

The agent adjusts this based on destination-specific knowledge: Japan needs cash (many places do not accept cards), European cities need universal power adapters, tropical destinations need reef-safe sunscreen.

## Multi-City Trip Coordination

For trips with multiple destinations, the agent manages the cascading logistics:

### Transit Between Cities
The agent tracks every intercity transfer:
```
Apr 13: Osaka → Kyoto (Shinkansen, reserved seat, ~15 min)
  - Depart: Shin-Osaka Station, Track [TBD]
  - Arrive: Kyoto Station
  - Luggage: Forwarded via Kuroneko Yamato to Kyoto hotel (ship by Apr 12)
  - Hotel check-in: 3:00 PM, walking distance from Kyoto Station

Apr 17: Kyoto → Hiroshima (day trip, Shinkansen, ~1h45)
  - Depart: Kyoto Station 8:15 AM
  - Return: Kyoto Station by 7:00 PM
  - JR Pass covers this route ✓
```

### Luggage Forwarding
In Japan and several other countries, luggage forwarding services let you send bags ahead to your next hotel. The agent researches the local service, provides the shipping label format, and reminds you the day before to drop off your bag at the hotel front desk.

### Timezone Adjustment Reminders
For trips crossing multiple timezones, the agent sends reminders:
```
You are now in JST (UTC+9), 17 hours ahead of your home timezone (PST).
- Adjust medication timing: take your [medication] at [local time] to maintain schedule
- Jet lag tip: avoid napping before 8 PM local time on arrival day
- Your 9 AM meeting back home is 2 AM here — decline or reschedule if not critical
```

## Expense Tracking on the Road

The agent maintains a running expense log:

```
Date       | Category      | Description              | Amount (Local) | Amount (USD) | Payment
-----------|---------------|--------------------------|----------------|--------------|--------
Apr 12     | Transport     | NRT Express to Tokyo     | ¥3,250         | $21.50       | IC Card
Apr 12     | Food          | Ramen at Ichiran Shibuya | ¥1,280         | $8.50        | Cash
Apr 12     | Activity      | Shibuya Sky observation  | ¥2,000         | $13.25       | Card
Apr 12     | Transport     | Metro day pass           | ¥600           | $4.00        | Cash
...        | ...           | ...                      | ...            | ...          | ...

Daily total: ¥7,130 ($47.25)
Trip running total: $47.25 / $2,000 budget = 2.4% spent (Day 1 of 8)
Daily average needed to stay on budget: $250/day
```

The agent converts currencies using the day's exchange rate and tracks spending against your trip budget. You log expenses by voice ("spent 1280 yen on ramen at Ichiran") and the agent structures and categorizes them.

## Post-Trip Review

After returning home, the agent generates a trip debrief:

```
Trip Summary: Japan, April 12-20, 2026

FLIGHTS
  - Outbound: On time ✓
  - Return: 45-minute delay (weather), no impact on connections
  - Seat comfort notes: [your notes]

ACCOMMODATIONS
  - Hotel Granvia Osaka: [rating] — [brief note]
  - Kyoto Granbell: [rating] — [brief note]
  - Would rebook: [yes/no for each]

HIGHLIGHTS
  - Best meal: [from your daily journal]
  - Best activity: [from your daily journal]
  - Unexpected discovery: [from your daily journal]

EXPENSES
  - Total spent: $1,847 / $2,000 budget (7.7% under budget)
  - Biggest category: Food ($612, 33%)
  - Best value: [activity or meal with best experience-to-cost ratio]

LESSONS FOR NEXT TIME
  - [Agent-generated suggestions based on any disruptions or issues noted]
  - [Packing items you needed but did not bring]
  - [Restaurants or activities recommended by locals that you did not have time for]

SAVED FOR NEXT VISIT
  - [Restaurants, neighborhoods, and activities to bookmark for a return trip]
```

This debrief is valuable if you travel to the same region again or if friends ask for recommendations.

---

*Last updated: March 2026. Based on OpenClaw skill registry v115.*
