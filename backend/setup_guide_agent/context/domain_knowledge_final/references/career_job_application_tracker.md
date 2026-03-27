# Career Job Application Tracker — OpenClaw Reference Guide

## What This Does

This setup turns OpenClaw into a personal job search command center that tracks every application you submit, monitors responses, prepares you for interviews, and keeps your networking follow-ups on schedule. It replaces the chaotic spreadsheet-and-sticky-note approach most job seekers default to with an agent that actively manages deadlines, drafts tailored cover letters, and alerts you when a recruiter replies so nothing falls through the cracks.

The agent watches your email for application confirmations and recruiter responses, logs each opportunity into a structured tracker, and nudges you with context-rich reminders before interviews and follow-up windows close.

## Who This Is For

**Primary user:** Anyone actively job hunting — new graduates, career changers, people laid off, or passive seekers keeping options open.

**Industry:** Any white-collar or knowledge-work job search where applications happen via email, job boards, and LinkedIn messaging.

**Pain point:** Losing track of where you applied, forgetting to follow up after interviews, sending generic cover letters because customizing each one takes too long, and missing recruiter emails buried under promotional noise.

**Technical comfort:** Low to moderate. This guide assumes you can install OpenClaw and paste commands, but does not require coding skills.

## OpenClaw Setup

### Skills to Install

Install the security baseline first, then the functional skills:

```bash
# Security baseline (always first)
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard

# Core functionality
clawhub install gog                    # Gmail + Calendar + Drive + Docs + Sheets
clawhub install agent-mail             # Email triage and auto-drafting
clawhub install tavily-web-search      # Research companies before interviews
clawhub install summarize              # Summarize job postings and company pages
clawhub install obsidian               # Personal knowledge base for interview notes
clawhub install todoist                # Task management for follow-ups
clawhub install brave-search           # Privacy-first web search for salary research

# Optional but recommended
clawhub install self-improving-agent   # Learns your preferences over time
clawhub install pdf-toolkit            # Handle resume PDFs and offer letters
clawhub install notion                 # If you prefer Notion over Obsidian for tracking
```

### Channels to Configure

- **Email (Gmail via `gog`):** This is the primary intake channel. The agent monitors for recruiter replies, application confirmations, and rejection notices. Set up a Gmail label called `Job Search` and configure a filter to auto-label emails from common job platforms (LinkedIn, Indeed, Greenhouse, Lever, Workday).

- **Calendar (Google Calendar via `gog`):** Interview slots, follow-up deadlines, and networking events go here. The agent creates calendar events with prep notes attached.

- **Task manager (`todoist`):** Each application becomes a task with subtasks for follow-up milestones (applied, first response, phone screen, onsite, offer, decision deadline).

### Hardware Recommendations

- Any Mac or Linux machine that can run OpenClaw. No special hardware needed.
- If you want voice-based interview prep rehearsal, a microphone and the `openai-whisper` skill for transcribing your practice answers.

### API Keys Required

| Service | Key | Where to Get It |
|---|---|---|
| Google (OAuth) | Google Account login | accounts.google.com |
| Tavily | `TAVILY_API_KEY` | tavily.com |
| Todoist | `TODOIST_API_TOKEN` | todoist.com/prefs/integrations |
| Brave Search | None for basic use | brave.com/search/api |

## Core Automation Recipes

### 1. Morning Job Search Briefing

```bash
openclaw cron add --every day --at 08:00 "Check my Gmail for any new recruiter responses, interview invitations, or rejection emails from the last 24 hours. Summarize each one with the company name, role, and what action I need to take. If any interviews are scheduled in the next 3 days, remind me and pull up my notes on that company."
```

This gives you a daily dashboard so you never start your day wondering what happened overnight.

### 2. Auto-Log New Applications

```bash
openclaw cron add --every 2h "Scan my Gmail for new application confirmation emails (look for subject lines containing 'application received', 'thank you for applying', 'your application to'). For each new one, create a Todoist task under the 'Job Applications' project with the company name, role title, date applied, and a follow-up subtask due in 7 days."
```

This eliminates the manual step of updating your tracker every time you submit an application.

### 3. Company Research Before Interviews

```bash
openclaw cron add --every day --at 18:00 "Check my Google Calendar for any interviews scheduled in the next 48 hours. For each one, use Tavily to research the company's recent news, funding rounds, and product launches. Summarize the findings and save them as a note in my Obsidian vault under 'Interview Prep / [Company Name]'."
```

You walk into every interview with fresh, relevant talking points.

### 4. Follow-Up Reminder Engine

```bash
openclaw cron add --every day --at 10:00 "Check my Todoist 'Job Applications' project for any tasks where the follow-up subtask is due today or overdue. For each one, draft a polite follow-up email in Gmail (do NOT send — save as draft) and notify me that it is ready for review."
```

The agent drafts the follow-up but never sends it without your approval — critical for maintaining a professional tone.

### 5. Weekly Application Pipeline Review

```bash
openclaw cron add --every monday --at 09:00 "Generate a weekly summary of my job search. Count how many applications I submitted last week, how many responses I received, how many interviews are scheduled, and any offers or rejections. Format it as a brief report and save it to my Obsidian vault under 'Job Search / Weekly Reviews'."
```

This tracks your conversion rates so you can adjust strategy (more networking, different roles, etc.).

### 6. Salary and Benefits Research

```bash
openclaw cron add --every friday --at 14:00 "For any companies where I have an active application past the phone screen stage, use Brave Search to find Glassdoor salary ranges, benefits reviews, and employee sentiment for the specific role and location. Save the findings to my Obsidian vault under 'Compensation Research / [Company Name]'."
```

Ensures you have data-backed negotiation leverage when offers come in.

### 7. Networking Follow-Up Tracker

```bash
openclaw cron add --every 3d "Check my Obsidian vault for any networking contacts I have not followed up with in the last 14 days. For each one, draft a short check-in message and save it as a Gmail draft. Flag the contact in my notes as 'follow-up drafted'."
```

Keeps your professional network warm without letting contacts go stale.

### 8. Interview Debrief Capture

```bash
openclaw cron add --every day --at 20:00 "Check my Google Calendar for any interviews that happened today. If any occurred, prompt me to record a quick voice debrief. Transcribe it using Whisper and save the transcript to my Obsidian vault under 'Interview Debriefs / [Company Name] / [Date]'."
```

Captures your impressions while they are fresh — invaluable when comparing multiple offers later.

## Guardrails and Safety

### The Agent Must NEVER:

- **Send emails or messages autonomously.** All outbound communication must be saved as drafts for human review. A poorly worded follow-up email can tank a candidacy. Configure `agentguard` to block any `send` action on email.

- **Apply to jobs on your behalf.** The agent can research and recommend roles, but clicking "Apply" must always be a human action. Automated applications are detectable by some ATS systems and can get you blacklisted.

- **Share salary expectations or negotiate without explicit instruction.** Compensation discussions require human judgment and context that the agent cannot fully grasp.

- **Post on social media or update LinkedIn.** Profile changes and public posts during a job search can have unintended consequences (alerting your current employer, for example).

- **Delete or modify application records.** The tracker should be append-only. Use `agentguard` to block delete operations on your job search data.

- **Access financial or medical information.** The agent does not need access to your bank accounts, health records, or background check portals.

### Recommended `agentguard` Rules

```
Block: send_email, send_message, post_social, delete_file
Allow: draft_email, create_task, create_note, search_web, read_email
Require approval: any action involving personal contact information
```

## Sample Prompts

### Prompt 1: Initial Setup

```
I am actively job searching for senior product manager roles in the San Francisco Bay Area. I want to track every application I submit, get reminders to follow up after 7 days of silence, and have company research ready before every interview. My applications go through Gmail and I use Todoist for task management. Set up my job search tracking system.
```

### Prompt 2: Quick Application Log

```
I just applied to Stripe for a Senior PM role through their careers page. The confirmation email should be in my Gmail. Log this application, set a 7-day follow-up reminder in Todoist, and start a company research note in Obsidian with their latest funding news, product launches, and leadership team.
```

### Prompt 3: Interview Prep Request

```
I have an interview with Notion on Thursday at 2pm Pacific. Research their recent product updates, company culture, competitive landscape, and any recent press coverage. Also pull up the job description from my Gmail and highlight the key requirements I should address. Save everything to an interview prep note I can review the night before.
```

### Prompt 4: Weekly Pipeline Check

```
Give me a full status report on my job search. How many active applications do I have? Which ones have gone silent for more than 10 days? Any interviews coming up this week? Which companies have I not heard back from at all? Rank my pipeline by likelihood of moving forward based on response patterns.
```

### Prompt 5: Offer Comparison

```
I have two offers: one from Stripe (Senior PM, $185K base, $50K RSUs/year, San Francisco) and one from Notion (PM Lead, $170K base, $80K RSUs/year, remote). Pull up my Glassdoor research on both companies. Factor in cost of living differences between SF and my current location. Create a comparison table covering total comp, growth trajectory, work-life balance signals from my interview notes, and any red flags from employee reviews.
```

## Common Gotchas

### 1. Email Filter Noise

Job platform emails vary wildly in format. "Application received" from Greenhouse looks completely different from Workday's automated confirmation. The agent may miss some or double-count others in the first week. **Fix:** Spend 15 minutes in the first week reviewing the agent's intake log and correcting any misses. The `self-improving-agent` skill will learn from your corrections and improve pattern matching over time.

### 2. Follow-Up Timing Is Cultural

The default 7-day follow-up window works for most US-based job searches, but some industries (academia, government, large enterprises) operate on longer timelines. If you are applying to positions with notoriously slow hiring processes, adjust the follow-up interval to 14 days to avoid appearing impatient. Conversely, fast-moving startups may warrant a 5-day window.

### 3. Draft Emails Need Real Editing

The agent drafts competent follow-up emails, but they can feel templated if you send them as-is. Always personalize drafts with a specific detail from your interview or a reference to something the recruiter mentioned. The agent gives you a starting point — the human touch is what makes it land.

### 4. Calendar Timezone Confusion

If you are interviewing with companies in different timezones, double-check that interview calendar events are in the correct local time. The agent creates events based on whatever timezone information it extracts from the email, which is sometimes ambiguous. Set your Google Calendar default timezone explicitly and mention your timezone in your initial setup prompt.

### 5. Obsidian Vault Organization

If you do not already have an Obsidian vault, the agent will create notes in the default vault location. Before starting, create a simple folder structure: `Job Search/Applications`, `Job Search/Interview Prep`, `Job Search/Company Research`, `Job Search/Weekly Reviews`, `Job Search/Interview Debriefs`. Tell the agent about this structure in your initial prompt.

---

## Skill Dependency Map

```
gog (Gmail + Calendar) ─────┬──→ Application intake + interview scheduling
                             │
agent-mail ──────────────────┼──→ Email triage and draft generation
                             │
todoist ─────────────────────┼──→ Application tracking + follow-up tasks
                             │
tavily-web-search ───────────┼──→ Company research + salary data
                             │
brave-search ────────────────┼──→ Privacy-first salary and review research
                             │
summarize ───────────────────┼──→ Condense job postings and articles
                             │
obsidian ────────────────────┼──→ Interview prep notes + debriefs
                             │
pdf-toolkit ─────────────────┼──→ Resume and offer letter handling
                             │
self-improving-agent ────────┘──→ Learn from corrections over time
```

## Cost Estimate

| Item | Monthly Cost |
|---|---|
| OpenClaw (local) | Free |
| Tavily API (1,000 searches/mo) | Free tier covers most job searches |
| Todoist (free tier) | Free |
| Brave Search API (basic) | Free |
| Google Workspace (personal Gmail) | Free |
| AI model usage (Claude/GPT) | ~$5-15/mo depending on volume |
| **Total** | **~$5-15/month** |

This is a low-cost setup. The primary expense is the underlying AI model API usage, which scales with how many applications you are managing and how much research the agent does.

---

## Application Status Lifecycle

The agent tracks each application through these stages. Define them in your initial prompt so the agent uses consistent terminology:

```
1. RESEARCHING    — Identified the role, gathering information
2. PREPARING      — Customizing resume and cover letter
3. APPLIED        — Application submitted, confirmation received
4. ACKNOWLEDGED   — Company confirmed receipt (automated or human)
5. PHONE_SCREEN   — Initial recruiter call scheduled or completed
6. INTERVIEW_1    — First-round interview (technical, behavioral, or portfolio)
7. INTERVIEW_2    — Second-round interview (onsite, panel, case study)
8. FINAL_ROUND    — Final interview or executive round
9. REFERENCE_CHECK — References contacted
10. OFFER         — Written offer received
11. NEGOTIATING   — Counter-offer or terms discussion in progress
12. ACCEPTED      — Offer accepted, start date set
13. DECLINED      — You declined the offer
14. REJECTED      — Company rejected your application
15. GHOSTED       — No response after 30+ days despite follow-ups
16. WITHDRAWN     — You withdrew your application
```

The agent moves applications through these stages based on email signals and your manual updates. At any time, you can ask "show me all applications in INTERVIEW_1 or later" to see your active pipeline.

## Cover Letter Customization Workflow

One of the agent's most time-saving capabilities is drafting customized cover letters. Here is the recommended workflow:

1. **Save your master resume** in the Obsidian vault under `Job Search/Resume/master_resume.md`. Include all experience, skills, and accomplishments — even ones you would not include in every application.

2. **Provide 2-3 sample cover letters** you have written yourself that reflect your voice and style. Save these in `Job Search/Cover Letters/samples/`. The `self-improving-agent` skill uses these as style references.

3. **For each application,** paste the job description into the agent and ask it to draft a cover letter. The agent will:
   - Match your experience to the specific requirements listed in the posting
   - Mirror the company's language and values from their website
   - Highlight 2-3 specific accomplishments from your master resume that are most relevant
   - Keep the tone consistent with your sample letters

4. **Always edit the draft.** The agent produces a strong starting point, but cover letters that convert have a personal touch — a specific reason you are drawn to this company, a connection to someone who works there, or a genuine reflection on why this role excites you. Add that yourself.

## Interview Preparation Deep Dive

Beyond the automated company research, here is how to use the agent for thorough interview prep:

### Behavioral Interview Prep
```
For my interview with [Company] for the [Role] position, generate 10 likely behavioral interview questions based on the job description. For each question, suggest a STAR-format answer outline using specific examples from my resume. Focus on: leadership, conflict resolution, cross-functional collaboration, and data-driven decision making.
```

### Technical Interview Prep
```
The [Company] interview includes a [case study / system design / technical assessment]. Based on what I know about their product and the role requirements, generate 5 practice scenarios. For each, outline the key frameworks or approaches I should demonstrate.
```

### Questions to Ask the Interviewer
```
Generate 8-10 thoughtful questions I can ask during my interview with [Company]. Avoid generic questions like "what's the culture like?" Focus on questions that show I have researched the company: their recent product launch, their engineering blog post about [topic], or their expansion into [market]. Include 2-3 questions about career growth and team dynamics.
```

## Networking Tracker Details

The networking component deserves special attention because referrals account for 30-50% of hires at most companies. The agent maintains a networking database in Obsidian with these fields per contact:

```
Name:               [Full name]
Company:            [Current employer]
Role:               [Their title]
Relationship:       [How you know them: former colleague, conference, LinkedIn, mutual connection]
Last Contact:       [Date of last meaningful interaction]
Next Follow-Up:     [Scheduled date]
Notes:              [What you discussed, what they offered, any warm intros]
Referral Potential: [High / Medium / Low — based on whether they work at a target company]
```

The agent automatically flags contacts you have not reached out to in 14+ days and drafts brief, non-generic check-in messages that reference your last conversation.

## Security Considerations for Job Seekers

Job searching involves sharing sensitive personal information. Keep these boundaries firm:

- **Never store your SSN, date of birth, or bank account information** in any system the agent accesses. These are only needed for background checks and onboarding after you accept an offer.
- **Be cautious with salary information.** If you log your current salary or target salary in the tracker, ensure the Obsidian vault and Google Sheets are not shared with anyone.
- **Watch for phishing.** The agent monitors for recruiter emails, but fake job offers are a common phishing vector. The `prompt-guard` skill helps, but if an email asks you to click a link to "verify your application," treat it with skepticism and verify through the company's official careers page.
- **LinkedIn activity visibility.** If you ask the agent to research companies, remember that your LinkedIn profile may show "recently viewed" activity. If your current employer monitors LinkedIn, be discreet.

## Scaling for High-Volume Job Searches

If you are submitting 10+ applications per week, the system needs adjustments:

- **Increase the email scan frequency** from every 2 hours to every 30 minutes to catch confirmations faster.
- **Batch cover letter drafting.** Instead of one at a time, paste 3-5 job descriptions and ask the agent to draft all cover letters in sequence.
- **Weekly pipeline pruning.** Ask the agent to flag applications older than 30 days with no response and move them to GHOSTED status. This keeps your active pipeline focused.
- **Track application-to-response rates** by source (LinkedIn Easy Apply, company website, referral, recruiter outreach). After 4-6 weeks, the data will show which channels have the best conversion rates, and you can concentrate your effort there.

---

*Last updated: March 2026. Based on OpenClaw skill registry v115.*
