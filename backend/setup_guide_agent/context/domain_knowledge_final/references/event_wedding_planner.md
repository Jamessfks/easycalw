# Wedding Planner Assistant — OpenClaw Reference Guide

## What This Does

This setup turns OpenClaw into a wedding planning coordinator that manages vendor communication, tracks budgets, maintains guest lists, sends timeline reminders, and keeps the couple organized across the 6-18 month planning window. It replaces the patchwork of spreadsheets, Pinterest boards, and frantic group texts with a single agent that knows every deadline, every vendor contract, and every guest's RSVP status.

The agent monitors email for vendor quotes and confirmations, tracks spending against your budget in a Google Sheet, sends reminders for deposit deadlines and tastings, and drafts vendor follow-ups so nothing slips between the cracks during the busiest planning phases.

## Who This Is For

**Primary user:** Engaged couples planning their own wedding without a full-time professional planner, or DIY planners coordinating on behalf of friends and family.

**Industry:** Personal event planning. Also useful for professional wedding planners managing multiple clients, though this guide focuses on the single-wedding use case.

**Pain point:** Wedding planning involves coordinating 10-20+ vendors, managing a budget that can exceed $30,000, tracking 50-300 guest RSVPs, and hitting dozens of deadlines over 6-18 months — all while working a full-time job and maintaining sanity. The organizational overhead is crushing, and missing a single deposit deadline or vendor confirmation can cascade into expensive problems.

**Technical comfort:** Low to moderate. The couple should be able to install OpenClaw and paste setup commands. No coding required.

## OpenClaw Setup

### Skills to Install

```bash
# Security baseline
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard
clawhub install agentgate            # Extra protection for financial data

# Core functionality
clawhub install gog                  # Gmail + Calendar + Drive + Sheets
clawhub install agent-mail           # Email triage for vendor correspondence
clawhub install todoist              # Task and deadline management
clawhub install tavily-web-search    # Vendor research and price comparisons
clawhub install summarize            # Summarize vendor contracts and proposals
clawhub install whatsapp-cli         # Coordinate with wedding party
clawhub install weather              # Weather forecasts for outdoor venues
clawhub install obsidian             # Central planning knowledge base

# Optional enhancements
clawhub install pdf-toolkit          # Handle vendor contracts and invoices
clawhub install canva                # Create save-the-dates and signage
clawhub install image-generation     # Mood boards and visual concepts
clawhub install brave-search         # Privacy-first vendor and venue research
clawhub install whatsapp-styling-guide # Professional vendor messages
clawhub install self-improving-agent # Learn vendor communication patterns
```

### Channels to Configure

- **Email (Gmail via `gog` + `agent-mail`):** The primary channel for vendor communication. Create Gmail labels: `Wedding/Vendors`, `Wedding/Guests`, `Wedding/Contracts`, `Wedding/Receipts`. The agent triages incoming wedding-related emails into these categories.

- **Calendar (Google Calendar via `gog`):** Create a dedicated "Wedding Planning" calendar shared between both partners. All vendor meetings, tastings, dress fittings, deposit deadlines, and RSVP cutoffs go here.

- **Budget tracker (Google Sheets via `gog`):** A master spreadsheet with columns for vendor category, vendor name, quoted price, deposit paid, deposit due date, balance due, balance due date, status. The agent updates this as vendor confirmations come in.

- **Guest list (Google Sheets via `gog`):** A separate sheet tracking guest name, address, email, phone, RSVP status, meal preference, plus-one, table assignment.

- **WhatsApp groups:** Separate groups for the wedding party (bridesmaids/groomsmen coordination), family (logistics for parents and close relatives), and an optional vendor group if any vendors prefer WhatsApp.

- **Obsidian vault:** Central knowledge base with notes organized under `Wedding/Vendors`, `Wedding/Timeline`, `Wedding/Ideas`, `Wedding/Decisions`.

### Hardware Recommendations

- Any Mac or Linux machine running OpenClaw.
- Consider keeping OpenClaw running on a Mac Mini at home if both partners want continuous access to the planning agent.

### API Keys Required

| Service | Key | Where to Get It |
|---|---|---|
| Google (OAuth) | Google Account login | accounts.google.com |
| Tavily | `TAVILY_API_KEY` | tavily.com |
| Todoist | `TODOIST_API_TOKEN` | todoist.com |
| WhatsApp | WhatsApp CLI session | Local setup |
| Canva | Canva Connect API Key | canva.com/developers |

## Core Automation Recipes

### 1. Daily Vendor Email Digest

```bash
openclaw cron add --every day --at 08:00 "Scan my Gmail for any new emails from wedding vendors or anyone in my Wedding contacts group from the last 24 hours. Categorize each as: quote/proposal, confirmation, question requiring response, invoice/receipt, or informational. Summarize each email in 2 sentences and flag any that need a response within 48 hours. List any upcoming payment deadlines in the next 14 days."
```

Keeps both partners informed without either needing to dig through email threads.

### 2. Budget Tracker Auto-Update

```bash
openclaw cron add --every 6h "Check my Gmail for new vendor invoices, receipts, or payment confirmations related to the wedding. For each one, extract the vendor name, amount, and what it covers. Update the Wedding Budget Google Sheet with the payment information and recalculate the remaining budget. If total spending exceeds 90% of our overall budget, alert me immediately."
```

Real-time budget visibility prevents the slow creep of overspending.

### 3. Deadline and Milestone Reminders

```bash
openclaw cron add --every day --at 09:00 "Check my Todoist wedding project and Google Calendar for any deadlines in the next 7 days. Group them by urgency: overdue, due today, due this week. For deposit deadlines, include the vendor name, amount due, and payment method. For tastings or fittings, include the address, time, and what to bring. Post the summary to my partner and me via WhatsApp."
```

The most critical automation — missed deposit deadlines can mean losing a vendor.

### 4. Guest RSVP Tracking

```bash
openclaw cron add --every day --at 10:00 "Check my Gmail for any new RSVPs (look for replies to our invitation email or notifications from our wedding website). Update the Guest List Google Sheet with new responses including attendance confirmation, meal preference, plus-one name, and any dietary restrictions. Give me a running count: total invited, confirmed yes, confirmed no, pending."
```

Automates the most tedious part of wedding planning — chasing RSVPs.

### 5. RSVP Chase Sequence

```bash
openclaw cron add --every monday --at 10:00 "Check the Guest List Google Sheet for any guests who have not responded and whose invitation was sent more than 21 days ago. For each non-responder, draft a polite follow-up email mentioning the RSVP deadline and making it easy to reply. Do NOT send — save all drafts for my review. Group the non-responders by relationship (family, friends, colleagues) so I can prioritize who gets a personal phone call instead."
```

Systematic RSVP follow-up without the awkwardness of tracking it manually.

### 6. Vendor Comparison Research

```bash
openclaw cron add --every saturday --at 10:00 "Check my Todoist for any vendor categories I have marked as 'researching' (e.g., photographer, florist, DJ). For each one, use Tavily to find 3 highly-rated options in our area within our stated budget range. For each option, compile: name, price range, portfolio link, Yelp/Google rating, and availability for our wedding date if listed. Save the research to Obsidian under 'Wedding/Vendors/[Category]'."
```

Structured vendor research replaces hours of scrolling through review sites.

### 7. Wedding Party Coordination

```bash
openclaw cron add --every friday --at 17:00 "Check if there are any wedding party tasks due in the next 2 weeks (dress fittings, suit rentals, bachelor/bachelorette planning milestones, rehearsal dinner coordination). Post a friendly update to the wedding party WhatsApp group with what is coming up and any actions needed from the group."
```

Keeps the wedding party informed without the couple having to micromanage.

### 8. Weather Watch for Outdoor Events

```bash
openclaw cron add --every day --at 07:00 "If the wedding date is within 14 days, check the weather forecast for the venue location. If rain probability exceeds 40% or temperatures are outside the 55-95F range for any outdoor portion of the event, alert me immediately with the forecast details and a reminder to confirm the backup indoor plan with the venue. Starting 3 days before the wedding, check weather every 6 hours."
```

Essential for outdoor ceremonies and receptions.

## Guardrails and Safety

### The Agent Must NEVER:

- **Send vendor communications without approval.** Every email and WhatsApp message to a vendor must be saved as a draft and approved by the couple before sending. Vendor relationships are personal and tone-sensitive — a poorly worded message can sour a relationship or create contractual misunderstandings. Configure `agentguard` to block all `send_email` and `send_message` actions to vendor contacts.

- **Make payments or authorize charges.** The agent can track invoices and remind you of deadlines, but must never interact with payment systems, enter credit card information, or confirm financial transactions. Use `agentgate` to enforce human-in-the-loop for any write operation involving financial data.

- **Sign or agree to contracts.** The agent can summarize contract terms and flag unusual clauses, but any agreement, modification, or cancellation requires human action.

- **Share guest personal information.** Guest addresses, phone numbers, dietary restrictions, and meal preferences are private data. The agent must never include this information in group messages or share it with vendors beyond what is necessary (e.g., the caterer gets meal counts but not individual guest names tied to restrictions).

- **Make aesthetic decisions autonomously.** The agent can research options and present comparisons, but choices about flowers, colors, music, and decor are deeply personal. The agent should always present options, never make selections.

- **Contact guests directly.** RSVP reminders go through the couple's email as drafts. The agent should never message guests from its own identity or an unfamiliar address.

### Recommended `agentguard` Rules

```
Block: send_email, send_message, make_payment, sign_contract, delete_file
Allow: draft_email, draft_message, create_event, update_spreadsheet, search_web, read_email
Require approval: any message to vendor contacts, any update to guest list, budget changes > $500
```

## Sample Prompts

### Prompt 1: Initial Wedding Setup

```
We are getting married on October 18, 2026 at Willow Creek Estate in Napa Valley, CA. Our budget is $45,000. We have 180 guests on our invite list. We are handling planning ourselves without a professional planner. Set up our wedding planning system. We need vendor tracking, budget management, guest RSVP tracking, and timeline reminders. We communicate with each other and the wedding party via WhatsApp. All vendor communication goes through Gmail.
```

### Prompt 2: Vendor Research Request

```
We need a photographer for our October 18 wedding in Napa Valley. Budget is $3,000-5,000 for 8 hours of coverage including an engagement session. We prefer a documentary/photojournalistic style over posed portraits. Research 5 options, compare their packages, and save the results. Include links to their portfolios so we can review their work.
```

### Prompt 3: Budget Status Check

```
Give me a complete budget status report. Show total budget, total committed (deposits + confirmed vendors), total paid to date, remaining balance, and upcoming payments due in the next 30 days. Flag any vendor categories where we are over budget. How does our spending compare to typical wedding budget allocations?
```

### Prompt 4: RSVP Crunch Time

```
Our RSVP deadline is September 1. It is now August 20 and we have 47 guests who have not responded out of 180 invited. Draft follow-up emails for all non-responders. For close family, make the tone warm and personal. For colleagues and distant friends, keep it brief and include a direct link to RSVP. Show me the drafts grouped by category before I approve sending.
```

### Prompt 5: Week-of-Wedding Checklist

```
The wedding is in 7 days. Generate a day-by-day countdown checklist covering: final vendor confirmations, payment balances due, rehearsal dinner logistics, day-of timeline, emergency contacts, and anything commonly forgotten in the final week. Also check the Napa Valley weather forecast for October 18 and the surrounding days.
```

## Common Gotchas

### 1. Vendor Email Threading Gets Messy

Vendor communication often happens across multiple email threads (initial inquiry, quote, negotiation, contract, revisions). The agent may lose context if a vendor replies to an old thread. **Fix:** Ask the agent to maintain a per-vendor summary note in Obsidian that consolidates all communication into a single timeline. When reviewing vendor correspondence, reference the summary rather than individual emails.

### 2. Budget Tracking Requires Consistent Categories

If you and the agent use different names for the same budget category ("photographer" vs. "photo/video" vs. "photography"), the spreadsheet becomes inconsistent. **Fix:** In your initial setup prompt, define your exact budget categories: Venue, Catering, Photography, Videography, Flowers, Music/DJ, Officiant, Attire, Stationery, Transportation, Decor, Favors, Hair/Makeup, Miscellaneous. The agent will standardize all entries against this list.

### 3. Guest List Merging Creates Duplicates

When both partners contribute guests, names can appear in slightly different formats ("Dr. Sarah Chen" vs. "Sarah Chen" vs. "Dr. & Mr. Chen"). The agent may create duplicate entries. **Fix:** Periodically ask the agent to run a deduplication check on the guest list spreadsheet. Establish a naming convention upfront (e.g., formal names with titles) and specify it in your setup prompt.

### 4. WhatsApp Group Fatigue

If the agent posts too frequently to the wedding party WhatsApp group, members may mute it and miss important messages. **Fix:** Limit automated posts to the wedding party group to once per week maximum. Bundle multiple updates into a single, well-formatted message. Reserve the group for actionable information only — save informational or excitement-building content for a separate group or one-on-one messages.

### 5. Contract Summarization Is Not Legal Advice

The `summarize` skill can highlight key terms, cancellation policies, and payment schedules in vendor contracts, but it is not a substitute for actually reading the contract or consulting a lawyer for high-value agreements. **Fix:** Always read vendor contracts yourself. Use the agent's summary as a starting checklist, not a final review. For venue contracts exceeding $10,000, consider having a lawyer review the liability and cancellation clauses.

---

## Wedding Planning Timeline Template

The agent can generate a customized version of this based on your wedding date:

```
12 months out:  Set budget | Book venue | Start guest list
10 months out:  Book photographer | Book caterer | Choose wedding party
8 months out:   Book florist | Book DJ/band | Order save-the-dates
6 months out:   Order invitations | Book officiant | Plan rehearsal dinner
4 months out:   Finalize menu | Order attire | Book hair/makeup
3 months out:   Send invitations | Order favors | Finalize decor
2 months out:   RSVP deadline | Finalize seating chart | Final fittings
1 month out:    Confirm all vendors | Create day-of timeline | Marriage license
2 weeks out:    Final guest count to caterer | Final payments | Rehearsal
1 week out:     Confirm timeline with all vendors | Pack for honeymoon
Day before:     Rehearsal dinner | Deliver final items to venue
Wedding day:    Enjoy it.
```

## Skill Dependency Map

```
gog (Gmail + Calendar + Sheets) ──┬──→ Vendor email + calendar + budget + guest list
                                   │
agent-mail ────────────────────────┼──→ Email triage and draft vendor responses
                                   │
todoist ───────────────────────────┼──→ Deadline tracking + milestone tasks
                                   │
whatsapp-cli ──────────────────────┼──→ Wedding party + family coordination
                                   │
tavily-web-search ─────────────────┼──→ Vendor research + price comparisons
                                   │
summarize ─────────────────────────┼──→ Contract and proposal summaries
                                   │
weather ───────────────────────────┼──→ Outdoor event weather monitoring
                                   │
obsidian ──────────────────────────┼──→ Central planning knowledge base
                                   │
pdf-toolkit ───────────────────────┼──→ Contract and invoice PDFs
                                   │
canva ─────────────────────────────┼──→ Save-the-dates and signage design
                                   │
agentgate ─────────────────────────┘──→ Financial data write protection
```

## Cost Estimate

| Item | Monthly Cost |
|---|---|
| OpenClaw (local) | Free |
| Tavily API (free tier) | Free |
| Google Workspace (personal) | Free |
| WhatsApp CLI | Free |
| Todoist (free tier) | Free |
| Canva (free tier) | Free (paid for premium templates) |
| AI model usage | ~$8-20/mo (higher during peak planning phases) |
| **Total** | **~$8-20/month** |

Model usage peaks during vendor research phases and the RSVP tracking period. Expect higher costs 3-4 months before the wedding when the most coordination happens.

---

## Budget Category Breakdown

Have the agent set up the budget spreadsheet with these standard categories and typical allocation percentages. Adjust the percentages based on your priorities:

```
Category              | Typical %  | Your Budget ($45K) | Actual Spent | Remaining
----------------------|------------|--------------------|--------------|-----------
Venue & Rentals       | 30-35%     | $13,500-15,750     |              |
Catering & Bar        | 25-30%     | $11,250-13,500     |              |
Photography           | 8-12%      | $3,600-5,400       |              |
Videography           | 5-8%       | $2,250-3,600       |              |
Flowers & Decor       | 6-10%      | $2,700-4,500       |              |
Music / DJ / Band     | 5-8%       | $2,250-3,600       |              |
Attire & Accessories  | 3-5%       | $1,350-2,250       |              |
Stationery & Invites  | 2-3%       | $900-1,350         |              |
Transportation        | 2-3%       | $900-1,350         |              |
Officiant             | 1-2%       | $450-900           |              |
Hair & Makeup         | 1-3%       | $450-1,350         |              |
Favors                | 1-2%       | $450-900           |              |
Gifts (wedding party) | 1-2%       | $450-900           |              |
Contingency           | 5-10%      | $2,250-4,500       |              |
```

The contingency line is non-negotiable. Every wedding has unexpected costs — a last-minute rental, an alteration, a tip for a vendor who went above and beyond. The agent should alert you if your committed spending leaves less than 5% contingency remaining.

## Vendor Communication Templates

The agent uses these as starting frameworks for drafted messages. Include your preferred tone in the setup prompt (formal, friendly, professional-casual):

### Initial Inquiry
```
Subject: Inquiry for [Service] — [Your Names] Wedding, [Date]

Hi [Vendor Name],

We are planning our wedding for [Date] at [Venue] in [City] and are looking for a [service type]. We found your work through [where you found them] and love [specific thing you liked].

Could you let us know your availability for our date and provide information about your packages and pricing? We would also love to set up a time to chat or meet.

Our budget for [service] is approximately $[range].

Thank you,
[Your Names]
```

### Follow-Up After No Response (7 Days)
```
Subject: Re: Inquiry for [Service] — [Your Names] Wedding, [Date]

Hi [Vendor Name],

Just following up on my inquiry from last week. We are very interested in working with you for our [Date] wedding. If you are available, we would love to hear about your packages.

If you are fully booked for our date, we completely understand — just let us know so we can continue our search.

Best,
[Your Names]
```

### Post-Meeting Thank You
```
Subject: Thank you — [Service] for [Date] wedding

Hi [Vendor Name],

Thank you so much for meeting with us [today/yesterday]. We really enjoyed learning about your approach to [specific thing discussed]. [Mention one specific thing that impressed you.]

We are reviewing proposals from a few vendors and will make our decision by [date]. We will be in touch!

Warm regards,
[Your Names]
```

The agent adapts these templates based on the vendor category and the details of your interaction.

## Guest List Management Details

The guest list spreadsheet should include these columns, which the agent populates from invitation responses and email RSVPs:

```
Column              | Purpose
--------------------|--------------------------------------------------
Guest Name          | Full name as it appears on the invitation
Address             | Mailing address for invitation and thank-you cards
Email               | For digital communications
Phone               | For urgent contact
Relationship        | Bride's family / Groom's family / Mutual friends / Work
Invitation Sent     | Date the invitation was mailed or emailed
RSVP Status         | Pending / Attending / Declined / No Response
Plus-One Name       | Name of their guest, if applicable
Meal Preference     | Chicken / Fish / Vegetarian / Vegan / Other
Dietary Restrictions| Allergies, intolerances, religious dietary laws
Table Assignment    | Table number (filled in closer to the wedding)
Gift Received       | Yes/No — for thank-you card tracking
Thank You Sent      | Date the thank-you card was sent
Notes               | Any special considerations (wheelchair access, etc.)
```

The agent should generate summary statistics on demand:
- Total invited: X couples, Y singles = Z seats
- Confirmed attending: A (B% response rate)
- Declined: C
- Awaiting response: D
- Meal breakdown: E chicken, F fish, G vegetarian, H vegan
- Dietary restrictions requiring kitchen attention: [list]

## Day-of Timeline Template

Two weeks before the wedding, have the agent generate a detailed day-of timeline:

```
TIME        | WHAT                              | WHO               | WHERE
------------|-----------------------------------|-------------------|------------------
8:00 AM     | Florist arrives for setup          | Florist team      | Venue
9:00 AM     | Hair and makeup begins             | Bride + party     | Bridal suite
10:00 AM    | Photographer arrives               | Photographer      | Bridal suite
11:00 AM    | Groom and groomsmen get ready       | Groom + party     | Hotel room
12:00 PM    | First look (optional)              | Couple + photog   | Garden
12:30 PM    | Wedding party photos               | Full party        | Garden + venue
1:30 PM     | Family formal photos               | Families + photog | Ceremony site
2:00 PM     | Guest arrival begins               | Guests            | Ceremony area
2:30 PM     | Musicians/DJ start pre-ceremony     | Musicians         | Ceremony area
3:00 PM     | CEREMONY                           | Everyone          | Ceremony area
3:30 PM     | Cocktail hour begins               | Guests            | Cocktail area
3:30 PM     | Couple photos during cocktail hour  | Couple + photog   | Scenic spots
4:30 PM     | Guests seated for reception         | Guests            | Reception hall
4:45 PM     | Grand entrance + first dance        | Couple            | Reception hall
5:00 PM     | Welcome toast                       | Best man/MOH      | Reception hall
5:15 PM     | Dinner service begins               | Guests            | Reception hall
6:30 PM     | Speeches and toasts                 | Designated speakers| Reception hall
7:00 PM     | Cake cutting                        | Couple            | Reception hall
7:15 PM     | Open dancing begins                 | Everyone          | Dance floor
9:00 PM     | Bouquet/garter toss (optional)      | Guests            | Dance floor
9:30 PM     | Last call for bar                   | Bar staff          | Bar
10:00 PM    | Last dance                          | Couple            | Dance floor
10:15 PM    | Sparkler send-off / exit             | Everyone          | Venue entrance
```

The agent sends this timeline to all vendors, the wedding party, and the couple. Each vendor receives only the portions relevant to them.

## Post-Wedding Tasks

The agent's job does not end at the reception. After the wedding, it helps with:

- **Thank-you card tracking.** As gifts arrive (many come after the wedding), the agent logs them in the guest list spreadsheet and creates a Todoist task to send a thank-you card within 2 weeks.
- **Final vendor payments.** The agent checks for any outstanding balances and reminds you of final payment deadlines (typically due within 30 days of the event).
- **Photo delivery tracking.** Photographers typically deliver final images 4-8 weeks after the wedding. The agent sets a reminder and follows up if the deadline passes.
- **Name change reminders.** If either partner is changing their name, the agent creates a checklist of documents and accounts to update: SSN, driver's license, passport, bank accounts, insurance, employer records.

---

*Last updated: March 2026. Based on OpenClaw skill registry v115.*
