# Personal Wardrobe Planner — OpenClaw Reference Guide

## What This Does

This setup turns OpenClaw into a personal wardrobe assistant that helps you plan outfits based on your calendar, the weather, dress codes, and what you have actually worn recently. The agent maintains a catalog of your clothing, suggests outfits for upcoming events, tracks what you wore to avoid repeating looks at the same venue or with the same people, and helps you identify gaps in your wardrobe. It replaces the daily "what should I wear?" decision fatigue with a quick recommendation you can accept, modify, or reject.

## Who This Is For

**Profile:** Anyone who spends too much time deciding what to wear each morning, professionals who need to dress appropriately for varying contexts (client meetings, casual Fridays, conferences), or people who want to make more intentional use of the clothes they already own.

**Industry:** Personal lifestyle management. Particularly valuable for professionals with client-facing roles, public speakers, frequent travelers who pack efficiently, and anyone who has a closet full of clothes but "nothing to wear."

**Pain point:** You own plenty of clothes but default to the same 5 outfits. You sometimes dress inappropriately for an occasion because you did not think ahead. You buy duplicates because you forgot what you already have. You spend 10-15 minutes every morning staring at your closet.

## OpenClaw Setup

### Required Skills

```bash
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard
clawhub install gog
clawhub install weather
clawhub install obsidian
clawhub install summarize
clawhub install self-improving-agent
```

**Skill explanations:**

- **gog** — Reads your Google Calendar to see what events you have today and this week. Uses event titles, descriptions, and locations to infer dress codes (e.g., "client lunch at The Ritz" vs. "team standup" vs. "outdoor farmers market").
- **weather** — Fetches current conditions and the day's forecast for your location. Essential for layering decisions, rain preparation, and seasonal appropriateness.
- **obsidian** — Stores your wardrobe catalog, outfit history, and style preferences in structured markdown files in your local vault. This is your persistent wardrobe database.
- **summarize** — Condenses event descriptions to extract dress code hints when calendar entries include long agendas or venue details.
- **self-improving-agent** — Learns your outfit preferences over time. When you accept or reject suggestions, the agent adjusts its recommendations to match your actual style, not just generic fashion rules.

### Optional Skills

```bash
clawhub install apple-reminders     # Remind you to prep outfits the night before
clawhub install tavily-web-search   # Research dress codes for unfamiliar venues or events
clawhub install agent-browser       # Browse venue websites to check dress code policies
clawhub install image-generation    # Generate visual outfit mockups (experimental)
clawhub install telegram            # Get outfit suggestions via Telegram each morning
clawhub install whatsapp-cli        # Get outfit suggestions via WhatsApp
```

### Accounts and API Keys Required

| Service | What You Need | Where to Get It |
|---|---|---|
| Google Account | OAuth for Calendar | Google Cloud Console |
| Obsidian | Local vault | Install Obsidian |

No paid API keys required for the core setup. The `weather` skill is bundled with OpenClaw.

### Hardware Recommendations

- Any Mac, Linux, or Windows machine running OpenClaw.
- A smartphone for taking photos of clothing items during initial cataloging.
- No GPU required.
- Always-on machine helpful for morning outfit suggestions timed to your wake-up alarm.

### Channel Configuration

- **Primary:** OpenClaw chat for morning outfit suggestions and wardrobe queries.
- **Mobile push:** `telegram` or `whatsapp-cli` for suggestions delivered to your phone while you are getting dressed.
- **Evening prep:** `apple-reminders` to remind you to lay out clothes the night before important events.

## Core Automation Recipes

### 1. Morning Outfit Suggestion

```bash
openclaw cron add --at "06:45" "Morning outfit suggestion. Check my Google Calendar for today's events. Get today's weather forecast for [YOUR CITY]. Review my wardrobe catalog in Obsidian at Wardrobe/catalog/. Check my recent outfit history at Wardrobe/history/ to avoid repeats from the last 2 weeks. Suggest a complete outfit (top, bottom, shoes, outerwear if needed, accessories if relevant) that is: (1) appropriate for today's most formal event, (2) suitable for the weather, (3) not worn in the last 14 days in its current combination. Explain your reasoning in one sentence."
```

This is the core daily automation. Adjust the time to 15 minutes before you typically start getting dressed.

### 2. Weekly Outfit Planning

```bash
openclaw cron add --at "20:00" --weekdays "sun" "Plan my outfits for the coming week. Review my Google Calendar for Monday through Friday. Get the 5-day weather forecast. For each day, suggest a complete outfit considering: (1) the day's events and dress code requirements, (2) the weather, (3) variety across the week (don't repeat the same pants two days in a row), (4) laundry cycle (assume anything worn this week won't be available until next week). Present as a Monday-Friday plan I can review and adjust."
```

Sunday evening planning eliminates morning decision fatigue for the entire week.

### 3. Event-Specific Outfit Research

```bash
openclaw cron add --every 6h "Check my Google Calendar for any new events added in the next 14 days that might require special attire. Look for keywords like: wedding, gala, interview, presentation, conference, dinner, black tie, cocktail, outdoor, formal, casual. For any such event, research the typical dress code and suggest an outfit from my wardrobe. If I don't own something appropriate, flag it as a potential purchase with a description of what I need."
```

Catches upcoming events early so you have time to shop, dry clean, or borrow if needed.

### 4. Laundry Day Wardrobe Update

```bash
openclaw cron add --at "10:00" --weekdays "sat" "It's laundry day check-in. Ask me which items from my outfit history this week have been laundered and are back in rotation. Update the wardrobe availability accordingly. Also ask if any items need to be marked as: (1) at the dry cleaner, (2) damaged/needs repair, (3) retired/donated."
```

Keeps the wardrobe database accurate by tracking what is clean and available.

### 5. Seasonal Wardrobe Rotation Reminder

```bash
openclaw cron add --at "09:00" --monthday "1" "Check the current month. If it's March, June, September, or December (seasonal transition months), prompt me to review my wardrobe for seasonal rotation. List items in my catalog tagged as [current outgoing season] that should be stored, and items tagged as [incoming season] that should be made accessible. Ask if any items should be donated or replaced."
```

### 6. Travel Packing Assistant

```bash
openclaw cron add --every 12h "Check my Google Calendar for any trips in the next 7 days (look for multi-day events, flights, hotel bookings, or events in a different city). If a trip is found, generate a packing list based on: (1) trip duration, (2) events during the trip, (3) weather at the destination, (4) my wardrobe catalog. Prioritize versatile pieces that work for multiple events. Minimize total items by maximizing mix-and-match combinations."
```

### 7. Wardrobe Gap Analysis

```bash
openclaw cron add --at "10:00" --monthday "15" "Analyze my wardrobe catalog and outfit history from the last 3 months. Identify: (1) items I own but never wear (0 appearances in 3 months), (2) categories where I'm lacking variety (e.g., only 2 pairs of pants but 15 shirts), (3) outfit combinations I rely on too heavily (same combo 3+ times in a month), (4) items I might need for upcoming seasonal changes. Present as a brief wardrobe health report."
```

### 8. Outfit Logging

```bash
openclaw cron add --at "09:00" "Ask me what I'm actually wearing today. Accept a brief description (e.g., 'blue oxford, gray chinos, white sneakers'). Log it in Wardrobe/history/[today's date].md along with today's events and weather. If I adopted your morning suggestion, just confirm and log it."
```

Captures what you actually wore (which may differ from the suggestion) to build accurate history.

## Guardrails and Safety

The agent must NEVER do the following autonomously:

1. **Never make purchases.** The agent may recommend items to buy and describe what you need, but it must never add items to a cart, complete a checkout, or click "buy" on any website.

2. **Never share wardrobe data or outfit photos.** Your wardrobe catalog and outfit history are private. The agent should not post outfits to social media, share them in group chats, or sync them to any external fashion service.

3. **Never body-shame or comment on body size.** The agent discusses clothes, not bodies. It should never suggest that an item "won't look good on you" based on body type assumptions. If sizing is relevant, the agent refers to the size recorded in the catalog without editorial commentary.

4. **Never impose gendered fashion rules.** The agent follows your stated preferences, not assumptions about what men or women "should" wear. If you want to wear a skirt to a board meeting, the agent helps you style it.

5. **Never discard or donate items without explicit confirmation.** The agent may suggest items for donation, but it must never mark items as removed from the catalog without your explicit say-so.

6. **Never pressure you to buy new clothes.** Gap analysis is informational. The agent should present wardrobe gaps neutrally, not create urgency to shop.

Configure guardrails:

```
- NEVER make purchases or add items to shopping carts
- NEVER share my wardrobe data, outfit history, or clothing photos externally
- NEVER comment on my body, size, or appearance — discuss clothes only
- NEVER apply gendered fashion assumptions — follow my stated preferences
- NEVER remove items from the catalog without my explicit confirmation
- Outfit suggestions are recommendations, not mandates — accept my choices gracefully
- When suggesting purchases, describe what I need generically — do not link to specific products or stores
```

## Sample Prompts

### Prompt 1: Initial Wardrobe Cataloging

```
I want to set up my wardrobe planner. Let's start cataloging my clothes. I'll describe items category by category. For each item, I'll tell you: type, color, formality level (casual/smart-casual/business/formal), season (all-season/summer/winter/spring-fall), and any notes.

Let's start with tops. I'll list them one by one. After each, confirm you've recorded it and ask for the next.

Store everything in my Obsidian vault at Wardrobe/catalog/ with one file per category (tops.md, bottoms.md, shoes.md, outerwear.md, accessories.md).

First item: Navy blue Oxford button-down shirt, smart-casual to business, all-season, my go-to for client meetings.
```

### Prompt 2: Quick Morning Override

```
I know you suggested the gray suit today, but my meeting got moved to a casual coffee shop. What should I wear instead? Same weather, but the vibe is more relaxed — think startup founder, not corporate lawyer.
```

### Prompt 3: Shopping Trip Preparation

```
I have a 2-hour window to shop this Saturday. Based on my wardrobe gap analysis and upcoming calendar (next 30 days), what are the 3 most impactful items I should look for? Prioritize things that would unlock the most new outfit combinations with what I already own. Give me specific descriptions (color, style, formality) so I know what to look for in stores.
```

### Prompt 4: Conference Packing

```
I'm attending a 3-day tech conference in Austin next month ([dates]). The agenda includes: keynote sessions (business casual), a networking dinner (smart casual), and a startup crawl (casual/trendy). I also want to explore the city one evening. Build me a packing list that covers all events with maximum 8 clothing items total, plus shoes and accessories. Show me which items pair with which events.
```

### Prompt 5: Closet Declutter Session

```
Let's do a closet declutter. Show me every item in my catalog that I haven't worn in the last 6 months (check the outfit history logs). For each item, ask me: keep (with a reason), donate, or sell. Update the catalog based on my decisions. At the end, summarize how many items I removed and estimate how much closet space I freed up.
```

## Common Gotchas

### 1. Incomplete Initial Catalog

The wardrobe planner is only as good as its catalog. If you skip cataloging half your closet, the agent will never suggest those items and you will wonder why it keeps recommending the same 10 pieces. **Fix:** Dedicate 30-60 minutes to the initial cataloging session. Go category by category (tops, bottoms, shoes, outerwear, accessories). You do not need to be exhaustive about every undershirt — focus on items you would actually choose to wear. You can add items incrementally when you wear something the agent does not know about.

### 2. Weather Forecast Timing

The morning outfit suggestion runs at a fixed time (e.g., 6:45 AM) and uses that moment's forecast. If the weather changes significantly by midday (unexpected rain, temperature drop), the suggestion may no longer be appropriate. **Fix:** Add a midday weather check: `openclaw cron add --at "11:00" "Check if today's weather has changed significantly from this morning's forecast. If so, suggest adjustments — should I grab a jacket for the afternoon? Do I need to swap shoes?"` This is especially useful in climates with volatile weather.

### 3. Calendar Event Interpretation

The agent infers dress codes from calendar event titles, which can be ambiguous. "Dinner with Sarah" could be a casual taco night or a Michelin-star restaurant. **Fix:** When creating calendar events, add a brief dress code note in the description (e.g., "casual," "business formal," "outdoor"). Alternatively, tell the agent your default assumptions: "If a dinner event has no dress code specified, assume smart-casual. If a meeting has no context, assume business casual."

## Maintenance and Long-Term Health

### Catalog Maintenance Cadence

Your wardrobe changes over time — new purchases, gifts, worn-out items, weight changes affecting fit, and seasonal rotations. Establish a regular maintenance rhythm:

- **Weekly (Saturday):** Laundry day check-in updates item availability. Takes 2 minutes.
- **Monthly (15th):** Wardrobe gap analysis identifies underused items and missing pieces. Takes 5 minutes to review.
- **Quarterly (seasonal transitions):** Full seasonal rotation review. Add new seasonal items, store off-season items, donate items you did not wear all season. Takes 15-20 minutes.
- **After any shopping trip:** Immediately add new purchases to the catalog. Describe each item to the agent the same day — waiting means you will forget.

### Building an Outfit Combination Database

After 4-6 weeks of daily logging, the agent has enough outfit history to start identifying your best combinations. Ask it to analyze:

```
Review my outfit history for the last 6 weeks. Which outfit combinations did I wear most often? Which ones did I accept from your suggestions vs. choose independently? Are there any items that appear in my most-worn outfits that I should consider buying a second copy of (in case of wear or damage)? Are there items that have never appeared in a logged outfit — should we discuss whether to keep them?
```

This analysis reveals your real wardrobe patterns — not what you think you wear, but what you actually wear. The difference is often surprising.

### Handling Special Occasions

For events outside your normal rotation (weddings, galas, costume parties, themed events), the agent may not have appropriate items in your catalog. Establish a protocol:

```
Tell the agent: "When I have a special occasion event and nothing in my wardrobe is appropriate: (1) describe what I would ideally wear for this event and dress code, (2) check if any items in my catalog could work with creative styling, (3) if nothing works, suggest renting vs. buying based on whether I'm likely to wear this type of outfit again, (4) provide a description of what to look for without linking to specific stores or products."
```

### Weather Sensitivity Profiles

Different people have different temperature sensitivities. Configure the agent with your personal comfort profile:

```
Tell the agent: "My temperature preferences for outfit planning:
- Below 40F / 5C: Heavy coat, layers, boots, scarf, gloves
- 40-55F / 5-13C: Medium jacket or heavy sweater, closed shoes
- 55-68F / 13-20C: Light jacket or cardigan, any shoes
- 68-80F / 20-27C: No outerwear needed, lighter fabrics
- Above 80F / 27C: Lightest possible fabrics, breathable shoes
- Rain: Waterproof shoes, rain jacket, avoid suede and light-colored shoes
- I run cold / warm / neutral (pick one)

Adjust suggestions accordingly. If I say I 'run cold,' bias toward warmer layers at borderline temperatures."
```

### Multi-Context Days

Many days involve multiple dress-code contexts — a morning client meeting, an afternoon at the office, and an evening dinner with friends. Configure the agent to handle these:

```
Tell the agent: "When I have events with different dress codes on the same day, prioritize the most formal event for the core outfit and suggest layers or accessory swaps I can carry to dress down for casual events. For example: business shirt + blazer for the morning meeting, remove blazer and roll sleeves for the office, add a different jacket for the evening. Minimize the number of items I need to carry for transitions."
```

### Cost Considerations

This setup has minimal costs:

- **No paid API keys required** for the core setup. `gog`, `weather`, `obsidian`, and `self-improving-agent` are all free or local.
- **AI model token usage** is low — one outfit suggestion per day plus weekly planning uses a modest number of tokens.
- **Optional `tavily-web-search`** costs credits only when researching dress codes for unfamiliar venues, which happens infrequently.
- The main investment is the initial cataloging time (30-60 minutes) and the daily 30-second outfit logging habit.

### Obsidian Wardrobe Catalog Template

For reference, here is the recommended catalog format for `Wardrobe/catalog/tops.md`:

```markdown
# Tops

## 1. Navy Blue Oxford Button-Down
- **Type:** Dress shirt
- **Color:** Navy blue
- **Brand:** [optional]
- **Size:** [your size]
- **Formality:** Smart-casual to business
- **Season:** All-season
- **Condition:** Good
- **Pairs well with:** Gray chinos, charcoal suit pants, khaki chinos
- **Notes:** Go-to for client meetings. Has a small thread pull near the left cuff.

## 2. White Crew Neck T-Shirt
- **Type:** T-shirt
- **Color:** White
- **Brand:** [optional]
- **Size:** [your size]
- **Formality:** Casual
- **Season:** All-season (layering piece)
- **Condition:** Good
- **Pairs well with:** Jeans, shorts, any jacket
- **Notes:** Own 3 of these. Replace when they yellow.
```

The outfit history format for `Wardrobe/history/YYYY-MM-DD.md`:

```markdown
# Outfit Log — [Date]

**Weather:** 62F, partly cloudy, 10% rain
**Events:** Team standup (casual), client lunch at Nobu (smart-casual)

**Outfit:**
- Top: Navy blue Oxford button-down
- Bottom: Gray chinos
- Shoes: Brown leather loafers
- Outerwear: None
- Accessories: Silver watch

**Source:** Agent suggestion (accepted as-is)
**Notes:** Perfect for the dual-context day. Could have used a blazer for Nobu.
```

### Integration with Other OpenClaw Workflows

- **Event Aggregator:** When new events are added to your calendar, the wardrobe planner can proactively check for dress code requirements and flag items that need dry cleaning or repair.
- **Travel Itinerary:** If you run a travel planning setup, the packing assistant integrates naturally — it pulls your destination weather, event schedule, and wardrobe catalog to generate optimal packing lists.
- **Personal CRM:** If you have a meeting with someone you met recently, the wardrobe planner can check what you wore the last time you met them and suggest something different.
- **Habit Tracker:** If "dress intentionally" is one of your habits, the wardrobe planner provides the data — did you plan an outfit or just grab whatever was closest?
