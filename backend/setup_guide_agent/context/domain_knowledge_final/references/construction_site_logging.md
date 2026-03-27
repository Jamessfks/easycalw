# Construction Site Logging — OpenClaw Reference Guide

## What This Does

This guide configures OpenClaw as a daily site logging and documentation assistant for construction projects. The agent collects daily reports from superintendents and foremen via voice memos and text messages, structures the information into standardized daily logs, tracks weather conditions that affect work schedules, monitors subcontractor activity against the project timeline, and compiles weekly progress summaries for stakeholders. It replaces the handwritten daily log books and scattered email chains that most small-to-mid-size general contractors rely on today.

## Who This Is For

**User profile:** General contractors, construction project managers, and site superintendents managing 1-5 active job sites simultaneously. The primary user is typically the company owner or project manager who needs visibility across sites but cannot physically be at every location every day.

**Industry:** Residential and light commercial construction — custom homes, renovations, additions, multi-family builds, tenant improvements, and small commercial projects under $10M.

**Pain point:** Construction daily logs are a legal and contractual requirement on most projects, but they are one of the most neglected administrative tasks. Superintendents hate paperwork and skip logs when they are busy (which is always). When logs are completed, they are inconsistent, illegible, and missing critical details. Incomplete site documentation leads to disputes over delays, change orders, and liability. Most contractors know their logs are inadequate but have no practical way to enforce consistent documentation from field staff.

**Technical comfort:** Low. Construction professionals are comfortable with phones and texting but resistant to new apps and data entry. The solution must work through voice memos and text messages, not forms or dashboards.

---

## OpenClaw Setup

### Required Skills

```bash
# Security foundation
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard

# Core functionality
clawhub install gog                    # Google Sheets for log database + Gmail for stakeholder reports + Google Drive for photos
clawhub install openai-whisper         # Transcribe voice memo site reports from superintendents
clawhub install whatsapp-cli           # Primary field communication channel
clawhub install weather                # Automatic weather condition logging
clawhub install summarize              # Summarize lengthy voice memos into structured entries

# Document management
clawhub install pdf-toolkit            # Generate PDF daily log reports
clawhub install csv-toolkit            # Export log data for accounting and project management software

# Productivity
clawhub install automation-workflows   # Multi-step daily log compilation
clawhub install apple-reminders        # Remind superintendents to submit daily reports
clawhub install self-improving-agent   # Learn project-specific terminology and patterns
```

### Optional Skills

```bash
clawhub install notion                 # Project knowledge base (plans, specs, contacts)
clawhub install data-analyst           # Progress tracking and timeline analysis
clawhub install todoist                # Punch list and task tracking
clawhub install agent-browser          # Check permit status on municipal websites
clawhub install tavily-web-search      # Research material pricing and supplier availability
clawhub install image-generation       # Generate simple site layout diagrams from descriptions
```

### Channel Configuration

1. **WhatsApp (via `whatsapp-cli`):** Primary channel for field staff. Used for:
   - Daily log submissions (voice memos and text)
   - Photo submissions (site progress, issues, deliveries)
   - Quick status queries ("what subs are scheduled for tomorrow?")
   - Report reminders

2. **Gmail (via `gog`):** Used for:
   - Sending compiled daily and weekly reports to project owners, architects, and stakeholders
   - Receiving subcontractor scheduling updates
   - Documenting formal correspondence related to delays or disputes

3. **Google Sheets (via `gog`):** Master log database with sheets for:
   - **Daily Log** — Date, Site, Weather (auto-filled), Temperature (auto-filled), Wind (auto-filled), Precipitation, Work Hours, Manpower Count, Subcontractors On Site, Work Performed, Materials Delivered, Equipment On Site, Visitors, Safety Incidents, Delays/Issues, Superintendent Notes
   - **Subcontractor Schedule** — Sub Name, Trade, Scheduled Date, Actual Date, Status, Notes
   - **Material Deliveries** — Date, Supplier, Material, Quantity, PO Number, Condition on Arrival
   - **Weather Log** — Auto-populated daily weather record for each site location
   - **Issue Tracker** — Date Identified, Description, Responsible Party, Status, Resolution Date

4. **Google Drive (via `gog`):** Site photo storage:
   ```
   Construction Projects/
   ├── [Project Name]/
   │   ├── Daily_Logs/
   │   │   ├── 2026-03-25/
   │   │   │   ├── photos/
   │   │   │   └── daily_log_2026-03-25.pdf
   │   ├── Subcontractor_Docs/
   │   ├── Permits/
   │   └── Change_Orders/
   ```

### Hardware Recommendations

- **Minimum:** Any Mac with 8GB RAM. The `openai-whisper` skill for voice transcription benefits from more RAM but works on 8GB.
- **Recommended:** Mac Mini M2 with 16GB RAM. Voice memo transcription is the most resource-intensive task. A dedicated, always-on machine ensures reports are compiled even when the project manager is on site without their laptop.
- **Field requirements:** Superintendents need only their existing smartphones. No app installation required — everything works through WhatsApp voice memos and photos.

---

## Core Automation Recipes

### 1. Morning Weather Log

Automatically record weather conditions for each active job site at the start of each work day.

```bash
openclaw cron add --every day --at 06:00 "For each active project site listed in the 'Active Sites' tab of the master Google Sheet (via gog), use weather to fetch the current conditions and forecast for that location. Log the following to the Weather Log sheet: date, site name, temperature, humidity, wind speed, precipitation type and amount, and the day's forecast summary. If conditions indicate work stoppages (sustained winds over 35mph, heavy rain, lightning, or temperature below 20F), send an alert via whatsapp-cli to the project manager: 'Weather alert for [site]: [condition]. May affect today's scheduled work.'"
```

### 2. Daily Report Collection Prompt

Prompt superintendents to submit their daily reports via voice memo.

```bash
openclaw cron add --every day --at 16:30 "Send a WhatsApp message via whatsapp-cli to each active site superintendent: 'End of day report time for [site name]. Please send a voice memo covering: (1) What work was performed today, (2) Which subs were on site and their headcount, (3) Any materials delivered, (4) Any delays, issues, or safety incidents, (5) What is planned for tomorrow. A quick 2-minute voice memo is perfect — I will handle the rest.' If no report is received by 18:00, send one follow-up reminder."
```

### 3. Voice Memo to Structured Log

Transcribe and structure incoming voice memos into daily log entries.

```bash
openclaw cron add --every 30m "Check WhatsApp (via whatsapp-cli) for new voice memos from site superintendents. For each voice memo: (1) Transcribe using openai-whisper, (2) Use summarize to extract the key information into structured fields: work performed, subcontractors present with headcount, materials delivered, delays or issues, safety incidents, and tomorrow's plan, (3) Cross-reference the weather log for that date and site, (4) Create a new row in the Daily Log Google Sheet (via gog) with all fields populated, (5) Save the original voice memo file and transcript to the day's folder in Google Drive, (6) Reply via whatsapp-cli with a brief confirmation: 'Got it. Logged for [site] on [date]: [1-sentence summary]. Let me know if anything needs correcting.'"
```

### 4. Photo Documentation Intake

Process and organize site photos submitted through WhatsApp.

```bash
openclaw cron add --every 1h "Check WhatsApp (via whatsapp-cli) for new photos from site superintendents. For each photo: (1) Save to Google Drive in the correct project/date folder (via gog), (2) If the superintendent included a caption, use it as the filename, (3) If no caption, ask via whatsapp-cli: 'Got the photo for [site]. Quick caption? (e.g., framing inspection east wall, concrete pour foundation)' (4) Add a reference to the photo in the daily log entry for that site and date."
```

### 5. Weekly Progress Summary

Compile a stakeholder-ready weekly report every Friday.

```bash
openclaw cron add --every week --on friday --at 17:00 "For each active project, compile a weekly progress summary from the Daily Log Google Sheet (via gog). Include: (1) Summary of work completed this week by trade, (2) Total manpower hours, (3) Subcontractor activity vs schedule — who was on time, who was late, who did not show, (4) Materials received this week, (5) Weather days lost, (6) Open issues and their status, (7) Key photos from the week (select 3-5 most representative from Google Drive), (8) Next week's planned activities. Format as a clean report and email via gog to the project stakeholder distribution list. Also save a PDF copy to the project folder using pdf-toolkit."
```

### 6. Subcontractor Schedule Tracking

Monitor subcontractor commitments against actual show-up dates.

```bash
openclaw cron add --every day --at 17:00 "Compare today's daily log entries (which subs actually showed up) against the Subcontractor Schedule sheet in Google Sheets (via gog). For any sub that was scheduled today but did not appear in the daily log: (1) Flag them in the Issue Tracker as a no-show, (2) Alert the project manager via whatsapp-cli: '[Sub name] ([trade]) was scheduled for [site] today but was not reported in the daily log. This is their [Nth] no-show this month.' For any sub that showed up unscheduled, log them and note the discrepancy."
```

### 7. Delay and Issue Escalation

Track reported issues and ensure they are resolved within acceptable timeframes.

```bash
openclaw cron add --every day --at 08:00 "Review the Issue Tracker sheet in Google Sheets (via gog). For any open issue older than 3 business days: send an escalation alert to the project manager via whatsapp-cli: 'Open issue at [site] for [X] days: [description]. Responsible party: [name]. Original report date: [date]. This needs attention.' For any issue older than 7 days, also include it in the daily email summary to the project owner. Never close issues automatically — only the project manager can mark an issue as resolved."
```

### 8. Material Delivery Verification

Cross-reference material deliveries against purchase orders.

```bash
openclaw cron add --every day --at 12:00 "Check today's daily log entries for material deliveries reported at any site. For each delivery: (1) Look up the corresponding PO number in the Material Deliveries sheet, (2) Verify the quantity received matches the quantity ordered, (3) If the superintendent noted any damage or discrepancy, flag it in the Issue Tracker, (4) Update the delivery status in the Sheet. If a delivery was expected today (based on the schedule) but not reported in the log, send a query via whatsapp-cli to the superintendent: 'Was the [material] delivery from [supplier] received today? It was scheduled for today per PO [number].'"
```

---

## Guardrails and Safety

### The Agent Must NEVER

1. **Alter historical daily log entries.** Daily logs are potential legal documents. Once a log entry is created, it can be appended to with corrections but never silently modified. The agent adds amendment notes rather than editing original entries. This is critical for dispute resolution and claims.

2. **Communicate directly with project owners, architects, or engineers without PM review.** All external stakeholder communications must be drafted and held for project manager approval. The agent can auto-send to the PM and superintendents only.

3. **Make scheduling commitments to subcontractors.** The agent tracks and reports on the schedule but does not negotiate dates, approve schedule changes, or make promises about site readiness.

4. **Approve or process change orders.** Change orders are contractual modifications that require formal review. The agent can track them but never approve, accept, or acknowledge a change order on behalf of the contractor.

5. **Provide safety directives.** The agent logs safety incidents and conditions but must never issue safety instructions, clear a site for work after weather events, or make safety determinations. All safety decisions are made by qualified personnel on site.

6. **Share project financial information with field staff.** Cost data, bid amounts, subcontractor rates, and markup percentages are confidential. Daily logs visible to superintendents must not include financial data.

7. **Delete photos or voice recordings.** All field documentation is preserved as-is. The agent organizes and files but never deletes source material.

### Recommended `agentguard` Configuration

```
Block: Any action that modifies a Daily Log row with a date more than 24 hours in the past
Block: Any action sending email to addresses not in the "Approved Stakeholders" list
Block: Any action containing "change order approved", "schedule change confirmed"
Block: Any action containing "safe to work", "cleared for", "safety approved"
Allow: Creating new rows in Google Sheets
Allow: Appending amendment notes to existing log entries
Allow: Sending WhatsApp messages to superintendents and the PM
Allow: Saving files to Google Drive
```

---

## Sample Prompts

### Prompt 1: Project Setup

```
I am starting a new construction project:
- Project: Smith Residence Addition
- Address: 456 Oak Street, Springfield
- Superintendent: Mike Torres (WhatsApp: +1-555-0123)
- Expected duration: 16 weeks
- Start date: April 7, 2026
- Stakeholders (for weekly reports): homeowner@email.com, architect@email.com

Please set up:
1. Google Drive folder structure for this project
2. Add it to the Active Sites tab in the master sheet
3. Create the Daily Log, Subcontractor Schedule, and Material Delivery tabs for this project
4. Set up weather logging for the project address
5. Add Mike Torres to the daily report reminder list
6. Schedule the first weekly report for Friday April 11
```

### Prompt 2: Retroactive Log Entry from Notes

```
Mike sent me his notes from yesterday at the Smith Residence project. Here they are:

"Plumber was here all day, 3 guys. They finished rough-in for the master bath and started the kitchen. Electrician showed up around 10, just one guy, pulled wire for the addition bedrooms. We got the window delivery from Marvin — 8 windows total, all looked good, no damage. Had to stop exterior framing at 2pm because of wind. No safety issues. Tomorrow should be the electrician finishing the rough-in and the HVAC crew starting ductwork."

Please create a proper daily log entry from this. Pull yesterday's weather from the weather log and include it. File it properly.
```

### Prompt 3: Subcontractor Performance Review

```
I want to review subcontractor reliability across all my active projects for the past 60 days. For each sub:
1. How many days were they scheduled vs how many days they actually showed?
2. What is their on-time percentage?
3. How many times were they a no-show with no advance notice?
4. Any open issues attributed to their work?

Rank them from most reliable to least reliable. I need this for my subcontractor evaluation meeting next week.
```

### Prompt 4: Dispute Documentation Package

```
The homeowner on the Smith Residence project is claiming we lost 2 weeks due to our mismanagement. I need to compile a documentation package showing the actual causes of delay:

1. Pull all weather days from the weather log where conditions prevented work
2. Pull all subcontractor no-shows and late starts from the daily logs
3. Pull all material delivery delays (scheduled vs actual arrival dates)
4. Pull all issues logged that were caused by factors outside our control (owner change orders, inspection delays, utility company delays)
5. Create a timeline showing each day of delay and its documented cause

Compile everything into a PDF report with supporting daily log entries. Email it to me for review before I share it with anyone.
```

### Prompt 5: Multi-Site Morning Briefing

```
Give me this morning's briefing across all active sites:
1. Weather conditions and forecast for each site today
2. Which subs are scheduled at each site today
3. Any open issues at each site that need attention
4. Yesterday's log summary for each site (did everyone submit their reports?)
5. Any material deliveries expected today
6. Anything flagged as urgent from yesterday's reports

Keep it concise — I am reading this in the truck on the way to the first site.
```

---

## Common Gotchas

### 1. Voice Memo Transcription Struggles with Construction Jargon and Noise

**Problem:** Construction sites are loud. Voice memos are recorded with heavy machinery, compressors, and hammering in the background. The `openai-whisper` skill produces transcripts with significant errors in these conditions — "rough-in" becomes "ruffin," trade-specific terms are garbled, and numbers (critical for headcounts and quantities) are frequently wrong. Superintendents also use highly regional and trade-specific slang that the transcription model has not seen.

**Fix:** Configure `self-improving-agent` with a custom vocabulary list of project-specific terms: subcontractor names, material brands, trade jargon, and local terminology. Always include a confirmation step: after transcribing a voice memo, send the structured summary back to the superintendent for verification before committing it to the log. Encourage superintendents to record voice memos from inside their truck or office trailer rather than on the active job site. For critical entries (safety incidents, delays), require text confirmation of key details even if a voice memo was submitted.

### 2. Photo Submissions Without Context Become Useless

**Problem:** Superintendents send dozens of photos via WhatsApp with no captions, descriptions, or context. Three months later, a photo of a concrete pour is meaningless without knowing which foundation section, what date, and what stage of the pour it represents. The agent faithfully saves every photo, but the archive becomes a disorganized folder of thousands of unlabeled images.

**Fix:** Make captioning a requirement, not a request. When a photo arrives without a caption, the agent should immediately reply: "Got the photo. What am I looking at? Quick reply like: 'foundation pour section B, east wall' is all I need." Set a rule: uncaptioned photos are saved to a "Needs Caption" folder and a weekly reminder is sent listing all uncaptioned photos. Over time, use `self-improving-agent` to learn common photo types for each project phase and suggest captions: "This looks like a framing inspection photo. Is that right?"

### 3. Weekend and Holiday Gaps Break Continuity

**Problem:** Construction schedules do not always follow Monday-Friday patterns, and the cron jobs assume weekday operation. Some trades work Saturdays. Weather delays shift schedules. The agent sends daily report prompts on days when the site is empty, and misses prompts on unexpected work days. The daily log shows gaps that make the record look incomplete.

**Fix:** Add a "Work Days" column to the Active Sites sheet — the PM marks which days each site is active this week. The cron jobs check this column before sending prompts. For sites marked as inactive on a given day, the agent creates a "No work — [reason]" log entry automatically. Add a simple override: if the superintendent sends a message on a day the site is marked inactive, the agent recognizes this as an unscheduled work day and initiates normal logging. Weather days should be auto-logged as "No work — weather" using the weather skill data, pending superintendent confirmation.

---

## Legal and Compliance Notes

- **Daily logs as legal documents:** In most jurisdictions, construction daily logs are discoverable documents in litigation. They can be used as evidence in delay claims, defect disputes, and worker injury cases. The immutability of log entries is not optional — it is a legal necessity.
- **OSHA requirements:** Safety incidents must be logged per OSHA reporting requirements. The agent's log supplements but does not replace formal OSHA reporting obligations.
- **Retention period:** Construction project records should be retained for the statute of limitations period in your jurisdiction — typically 6-10 years after project completion. Do not delete any project data.
- **Subcontractor privacy:** Daily logs may reference individual workers. Be mindful of privacy laws regarding worker identification in shared reports.

---

## Related Guides

- `personal_voice_journal.md` — Shares voice-to-text patterns used in field reporting
- `freelance_invoice_tracking.md` — For tracking project costs and subcontractor payments
- `smallbiz_customer_support.md` — For handling homeowner communication during construction
