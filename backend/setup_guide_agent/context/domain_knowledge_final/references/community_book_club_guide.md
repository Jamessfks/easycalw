# Community Book Club Organizer — OpenClaw Reference Guide

## What This Does

This setup turns OpenClaw into a book club coordinator that handles the tedious logistics of running a reading group: scheduling meetings, sending reminders, generating discussion questions, tracking member reading progress, and curating the next book selection. It works for both in-person and virtual book clubs, managing communication across WhatsApp, email, or Slack depending on where your group lives.

The agent takes care of the organizational overhead so the club organizer can focus on the actual reading and discussion. It pulls book metadata, generates chapter-by-chapter discussion guides, sends timely nudges before meetings, and even summarizes books for members who fell behind.

## Who This Is For

**Primary user:** Book club organizers, librarians running community reading programs, or anyone who coordinates a recurring reading group of 4-30 people.

**Industry:** Community organizations, public libraries, corporate learning groups, university reading seminars, church study groups.

**Pain point:** Organizing a book club is 80% logistics and 20% discussion. Coordinators burn out sending reminder emails, picking dates that work for everyone, generating fresh discussion questions, and chasing down RSVPs. The reading itself becomes an afterthought.

**Technical comfort:** Low. This guide assumes the organizer can install OpenClaw and copy-paste commands but has no programming background.

## OpenClaw Setup

### Skills to Install

```bash
# Security baseline
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard

# Core functionality
clawhub install gog                    # Gmail + Calendar + Docs + Sheets
clawhub install whatsapp-cli           # Group messaging (if club uses WhatsApp)
clawhub install slack                  # Group messaging (if club uses Slack)
clawhub install tavily-web-search      # Book research, author bios, reviews
clawhub install summarize              # Summarize books, articles, reviews
clawhub install todoist                # Track reading milestones and action items
clawhub install weather                # Check weather for in-person meetup days

# Optional enhancements
clawhub install obsidian               # Knowledge base of past books and discussions
clawhub install youtube-summarizer     # Summarize author interviews and book talks
clawhub install presentation-maker     # Create visual discussion slides
clawhub install whatsapp-styling-guide # Professional formatting for group messages
clawhub install deepl-translate        # For multilingual book clubs
```

### Channels to Configure

- **Group messaging (WhatsApp or Slack):** The primary communication channel for the club. The agent posts meeting reminders, discussion questions, polls for the next book, and reading progress check-ins here. Choose one — do not split communication across multiple platforms.

- **Email (Gmail via `gog`):** Used for longer-form communication: meeting summaries, new member onboarding, and the monthly book announcement with reading schedule.

- **Calendar (Google Calendar via `gog`):** All meeting dates, RSVP deadlines, and reading milestone targets go here. Share the calendar with all members.

- **Shared document (Google Docs via `gog`):** Meeting notes, discussion guides, and the running list of books read are maintained in a shared Drive folder.

### Hardware Recommendations

- Any Mac or Linux machine running OpenClaw. No special hardware needed.
- If meetings are virtual, the host machine should have a stable internet connection.

### API Keys Required

| Service | Key | Where to Get It |
|---|---|---|
| Google (OAuth) | Google Account login | accounts.google.com |
| Tavily | `TAVILY_API_KEY` | tavily.com |
| WhatsApp Business | WhatsApp CLI session | Local setup |
| Slack | Slack Bot Token (OAuth) | api.slack.com |
| Todoist | `TODOIST_API_TOKEN` | todoist.com |

## Core Automation Recipes

### 1. Meeting Reminder Sequence

```bash
openclaw cron add --every day --at 09:00 "Check Google Calendar for any book club meetings in the next 48 hours. If a meeting is within 48 hours, send a reminder to the WhatsApp group with the date, time, location (or video link), the current book title, and which chapters we are discussing. If a meeting is within 2 hours, send a final reminder with just the essentials."
```

This handles the two-stage reminder pattern that maximizes attendance: an advance heads-up and a same-day nudge.

### 2. Discussion Question Generator

```bash
openclaw cron add --every monday --at 10:00 "Check what book our club is currently reading and which chapters are assigned for this week. Use Tavily to research themes, critical reception, and author interviews related to those chapters. Generate 6-8 thoughtful discussion questions that go beyond plot summary — focus on character motivation, thematic connections, and personal reflection. Save the questions to a Google Doc in our Book Club shared folder and post a preview (first 3 questions) to the WhatsApp group."
```

This ensures every meeting has substantive discussion material without the organizer spending an hour crafting questions.

### 3. Reading Progress Check-In

```bash
openclaw cron add --every wednesday --at 18:00 "Post a friendly check-in to the WhatsApp book club group asking how everyone is progressing with this week's assigned reading. Keep the tone casual and encouraging. Include a brief teaser about one interesting theme in the upcoming chapters to build excitement without spoilers."
```

Gentle accountability that keeps members engaged mid-week.

### 4. Monthly Book Selection Poll

```bash
openclaw cron add --every 1st --at 10:00 "We need to select next month's book. Research 4-5 book recommendations based on our club's reading history (check the Obsidian vault for past books). For each recommendation, include: title, author, page count, genre, a 2-sentence hook, and average Goodreads rating. Post the options to the WhatsApp group as a numbered poll. Compile votes after 5 days and announce the winner."
```

Democratic book selection with minimal organizer effort.

### 5. New Member Welcome Package

```bash
openclaw cron add --every day --at 08:00 "Check my Gmail for any emails with subject containing 'join book club' or 'interested in book club'. For each new inquiry, draft a welcome email that includes: our current book and where we are in it, the meeting schedule, the WhatsApp group invite link (from my notes), a list of our last 5 books, and any ground rules. Save as draft for my review before sending."
```

Standardizes onboarding so new members get a warm, informative welcome without the organizer rewriting the same email every time.

### 6. Post-Meeting Summary

```bash
openclaw cron add --every day --at 21:00 "Check if a book club meeting happened today (look at Google Calendar). If so, prompt me for a quick voice or text recap of what we discussed. From that recap, generate a meeting summary covering: key discussion points, any decisions made (like the next book), notable quotes or insights from members, and action items. Save to Google Docs in our shared folder and post a condensed version to WhatsApp."
```

Creates a running archive of your club's intellectual life.

### 7. Author and Context Research

```bash
openclaw cron add --every day --at 12:00 "If we are starting a new book this week, research the author using Tavily: biography, other notable works, any relevant interviews or talks. Check YouTube for author interviews and summarize the best one. Compile an 'Author Spotlight' document in Google Docs and share the link in the WhatsApp group."
```

Adds depth to the reading experience with minimal effort.

### 8. Weather Check for In-Person Meetings

```bash
openclaw cron add --every day --at 07:00 "If there is a book club meeting today and it is marked as an in-person event on Google Calendar, check the weather forecast for the meeting location. If rain or extreme temperatures are expected, post a heads-up to the WhatsApp group suggesting members bring umbrellas or dress accordingly. If conditions are severe (storm warnings, extreme heat above 105F, ice), suggest we consider moving to a virtual format and draft a poll."
```

A small touch that shows thoughtful coordination.

## Guardrails and Safety

### The Agent Must NEVER:

- **Send messages to the group without draft review for the first 2 weeks.** Until the agent has learned the club's communication style and tone, all WhatsApp and email messages should be saved as drafts. After the organizer has approved 10+ messages, the agent can send routine reminders (meeting time/place only) autonomously.

- **Share member contact information.** Phone numbers, email addresses, and personal details of club members must never be included in group messages or shared with external services. Configure `agentguard` to block any action that outputs personal contact data.

- **Post spoilers for upcoming chapters.** Discussion questions and teasers must reference only the chapters assigned up to the current week. The agent should never reveal plot points from later chapters.

- **Remove members from the group or make moderation decisions.** Group membership management is a human-only action.

- **Make purchases or financial transactions.** If the club has dues or buys books together, that is handled by a human.

- **Post content to public social media.** Book club discussions are private group communication.

### Recommended `agentguard` Rules

```
Block: send_message (first 2 weeks), share_contact, post_social, make_purchase
Allow: draft_message, create_event, create_document, search_web, read_email
Require approval: send_message (after initial period, for non-routine messages)
Auto-allow: send_message containing only meeting time/date/location (after trust period)
```

## Sample Prompts

### Prompt 1: Full Club Setup

```
I run a book club with 12 members. We meet every other Thursday at 7pm at a local coffee shop called The Reading Room. We communicate via WhatsApp and I track everything through Gmail and Google Calendar. We are currently reading "Demon Copperhead" by Barbara Kingsolver and we are on chapter 15. Set up my book club management system with meeting reminders, discussion questions, and reading progress check-ins.
```

### Prompt 2: Generating Discussion Material

```
Our book club meets this Thursday to discuss chapters 20-28 of "Demon Copperhead." Generate discussion questions that explore the themes of addiction, class inequality, and the foster care system. Include at least two questions that connect the book to current events and one question that asks members to reflect on their own experiences. Also find one relevant author interview to share with the group.
```

### Prompt 3: Planning the Next Selection

```
We just finished "Demon Copperhead" and need to pick our next book. Our club tends to enjoy literary fiction with strong character development. We have previously read: "The Goldfinch," "A Little Life," "Pachinko," "Homegoing," and "The Underground Railroad." Suggest 5 options that fit our taste but push us slightly outside our comfort zone. Include at least one debut novel and one translated work.
```

### Prompt 4: Handling a Schedule Change

```
We need to reschedule this Thursday's book club meeting because the coffee shop is closed for renovations. Poll the WhatsApp group for availability next Monday, Tuesday, or Wednesday evening. Also suggest two alternative venue options nearby — search for coffee shops or libraries within 2 miles of The Reading Room that are open past 8pm.
```

## Common Gotchas

### 1. WhatsApp Rate Limiting

WhatsApp Business API has rate limits on messages sent to groups. If the agent sends too many messages in a short window (especially during initial setup when you might be testing), messages can be throttled or blocked. **Fix:** Space out automated messages by at least 15 minutes. Batch routine communications (reminders + discussion questions) into a single well-formatted message rather than multiple rapid-fire posts. The `whatsapp-styling-guide` skill helps format these combined messages cleanly.

### 2. Discussion Questions Can Feel Generic

AI-generated discussion questions sometimes default to surface-level "what did you think about X?" prompts. **Fix:** In your initial setup prompt, give the agent examples of the kind of questions your club enjoys. Specify whether your group prefers analytical, emotional, or socially-connected questions. The `self-improving-agent` skill learns from which questions sparked the best discussion if you note that in your post-meeting recaps.

### 3. Book Metadata Accuracy

When the agent researches books, it occasionally confuses editions, gets page counts wrong (hardcover vs. paperback vs. ebook), or attributes quotes to the wrong character. **Fix:** Always spot-check factual claims about books before sharing with the group. This is especially important for reading schedules — "chapters 1-10" means different things if the agent looked up a different edition. Specify the exact edition (ISBN if possible) in your setup prompt.

### 4. Timezone and Meeting Scheduling

If your book club has members across timezones (common for virtual clubs), the agent may create calendar events in the organizer's timezone, confusing remote members. **Fix:** Explicitly state the meeting timezone in your setup prompt and configure Google Calendar to include timezone information in event descriptions. For mixed-timezone clubs, have the agent include "that's Xpm Eastern / Ypm Pacific" in reminder messages.

### 5. Member Privacy and GDPR

If your club collects member information (names, emails, phone numbers) in a Google Sheet or Obsidian note, be aware that this is personal data. The agent should never include member lists in group messages. If any member asks to leave, their information should be removed from all tracked documents. Keep the member roster in a separate, non-shared document.

---

## Reading Schedule Template

When setting up a new book, have the agent generate a reading schedule like this:

```
Book: [Title] by [Author]
Total pages: [N] | Chapters: [N]
Meeting frequency: Every other Thursday

Week 1 (Mar 6-12):   Chapters 1-7    (~80 pages)
Week 2 (Mar 13-19):  Chapters 8-14   (~85 pages)
Week 3 (Mar 20-26):  Chapters 15-21  (~90 pages)
Week 4 (Mar 27-Apr 2): Chapters 22-28 (~75 pages)

Meetings:
  Mar 20 — Discuss chapters 1-14 (midpoint)
  Apr 3  — Discuss chapters 15-28 (finale)
```

The agent calculates page-per-week targets based on your meeting cadence and adjusts for chapter boundaries so you never split a chapter across two discussion sessions.

## Skill Dependency Map

```
gog (Gmail + Calendar + Docs) ──┬──→ Meeting scheduling + email + shared docs
                                │
whatsapp-cli / slack ───────────┼──→ Group communication channel
                                │
tavily-web-search ──────────────┼──→ Book research + author info + reviews
                                │
summarize ──────────────────────┼──→ Book summaries for latecomers
                                │
youtube-summarizer ─────────────┼──→ Author interview highlights
                                │
todoist ────────────────────────┼──→ Reading milestones + action items
                                │
obsidian ───────────────────────┼──→ Archive of past books + discussions
                                │
weather ────────────────────────┼──→ In-person meeting weather alerts
                                │
presentation-maker ─────────────┘──→ Visual discussion slides (optional)
```

## Cost Estimate

| Item | Monthly Cost |
|---|---|
| OpenClaw (local) | Free |
| Tavily API (free tier) | Free |
| WhatsApp Business CLI | Free (personal use) |
| Google Workspace (personal) | Free |
| Todoist (free tier) | Free |
| AI model usage | ~$3-8/mo |
| **Total** | **~$3-8/month** |

A book club meets 2-4 times per month, so model usage is low. The biggest API cost driver is the discussion question generation and book research, which happens weekly.

---

## Discussion Question Types

When generating discussion questions, the agent should rotate through these categories to keep meetings fresh. Include this taxonomy in your setup prompt so the agent varies its approach:

### Comprehension Questions
Questions that ensure everyone understood the key events and character arcs. These are warm-up questions, not the focus of discussion.
- "What was the turning point for [character] in this section?"
- "How did the setting shift between chapters X and Y?"

### Analytical Questions
Questions that dig into craft, structure, and authorial choices.
- "Why do you think the author chose to tell this story in [first person / non-linear / multiple POVs]?"
- "How does the pacing of this section compare to the opening? What effect does that create?"

### Thematic Questions
Questions that explore the book's bigger ideas and connect them to the real world.
- "This book explores [theme]. How does that theme show up in your own life or community?"
- "Do you agree with the author's implicit argument about [topic]? Why or why not?"

### Comparative Questions
Questions that connect the current book to previous reads or other works.
- "How does this book's treatment of [theme] compare to [previous book club read]?"
- "If you could pair this book with a film or podcast, what would you choose and why?"

### Personal Reflection Questions
Questions that invite members to share their own experiences.
- "Which character do you most identify with, and what does that say about you?"
- "Did this book change your perspective on anything? If so, what?"

Ask the agent to include at least one question from each category in every discussion set.

## Running a Virtual or Hybrid Book Club

If some or all members join remotely, the agent can help with these additional logistics:

### Virtual Meeting Setup
```
Set up a recurring video call link for our book club meetings. Add the link to every meeting calendar event. 15 minutes before each meeting, post the video link, today's discussion questions, and a reminder of the assigned reading to the WhatsApp group. After the meeting, share the discussion summary with anyone who could not attend.
```

### Hybrid Considerations
- The agent should send different reminders to in-person and virtual attendees (venue address vs. video link).
- Post-meeting summaries become even more important for remote members who may have connectivity issues or miss portions of the discussion.
- Consider recording virtual meetings (with member consent) and having the agent generate a summary using `summarize` for absent members.

## Annual Book Club Calendar

Have the agent maintain a yearly planning document:

```
Month       | Book                          | Genre            | Proposer    | Rating (avg)
------------|-------------------------------|------------------|-------------|-------------
January     | [Title]                       | Literary Fiction | Sarah       | 4.2
February    | [Title]                       | Memoir           | David       | 3.8
March       | [Title]                       | Science Fiction  | Maria       | 4.5
...         | ...                           | ...              | ...         | ...
December    | [Title]                       | Poetry           | Group Vote  | 4.0

Stats:
  Books read: 12
  Average rating: 4.1
  Most popular genre: Literary Fiction (4 books)
  Highest rated: [Title] by [Author] (4.7)
  Most discussed: [Title] (meeting ran 45 minutes over)
```

This archive is surprisingly valuable after 2-3 years. Members love looking back at what they have read together, and the ratings data helps calibrate future selections.

## Handling Group Dynamics

Book clubs are social groups, and the agent can help with some common interpersonal logistics:

### Rotating Hosts
If your club rotates meeting hosts, the agent tracks whose turn it is and sends a reminder one week before the meeting to the designated host with a checklist (snacks, seating, any A/V setup for hybrid meetings).

### Discussion Facilitation Notes
For the designated meeting facilitator, the agent generates a facilitation guide:
- Suggested time allocation per question (e.g., 6 questions across 90 minutes = ~15 minutes each)
- Which questions are likely to generate debate (mark as "discussion catalysts")
- A wrap-up question to end on a reflective note
- Transition phrases between topics

### Managing Dominant and Quiet Voices
The agent cannot solve interpersonal dynamics, but it can help the facilitator by suggesting structured formats:
- Round-robin opening (everyone shares a one-sentence reaction before open discussion)
- Small-group breakouts for larger clubs (8+ members)
- Anonymous question submission (members WhatsApp questions privately to the organizer, who reads them aloud)

## Genre-Specific Research Templates

The agent adjusts its research approach based on genre:

### Literary Fiction
Research: Author interviews, book reviews from The New York Times and The Guardian, thematic analyses, comparisons to the author's previous work.

### Non-Fiction / History
Research: Fact-checking key claims, finding primary sources referenced in the book, locating counter-arguments or alternative perspectives, identifying relevant documentaries.

### Science Fiction / Fantasy
Research: World-building analysis, author's inspirations and influences, genre context (how the book fits into the tradition), scientific accuracy of speculative elements.

### Memoir / Biography
Research: Subject's other interviews and public appearances, fact vs. narrative choices the author made, contemporary reviews and criticisms, related historical context.

### Translated Works
Research: Translator's approach and reputation, cultural context that may not be obvious to English readers, how the book was received in its original language and market. The `deepl-translate` skill can help members compare specific passages with the original text if someone in the club reads the source language.

## Measuring Club Health

Ask the agent to generate a quarterly "club health" report:

```
Attendance rate:        [Average members per meeting / total members]
RSVP reliability:       [RSVPs who actually showed up / total RSVPs]
Book completion rate:    [Members who finished the book / total attending]
Rating trend:           [Are average ratings going up, down, or stable?]
Genre diversity:        [How many different genres covered this quarter?]
New member retention:   [New members who attended 3+ meetings / new members who tried once]
```

Low attendance or completion rates signal that the club needs adjustment — maybe meetings are too frequent, books are too long, or the selection process needs a refresh.

---

*Last updated: March 2026. Based on OpenClaw skill registry v115.*
