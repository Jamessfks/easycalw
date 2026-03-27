# Family Medication Reminder — OpenClaw Reference Guide

## What This Does

This setup configures OpenClaw to manage medication schedules for multiple family members, sending timely reminders through their preferred communication channel, tracking whether medications were taken, alerting on missed doses, managing refill schedules, and logging a compliance history that can be shared with healthcare providers. It is designed for families where one person (typically a parent or adult child of aging parents) coordinates medication schedules across several household members, each with different medications, dosages, and timing requirements.

## Who This Is For

**Profile:** Family caregivers managing medication schedules for children, elderly parents, or household members with chronic conditions. Also useful for individuals managing their own multi-medication regimen who need structured reminders and compliance tracking.

**Industry:** Personal healthcare management. Particularly valuable for sandwich-generation adults caring for both children and aging parents, families managing chronic conditions (diabetes, hypertension, thyroid disorders), and anyone taking 3+ medications daily who struggles with timing and consistency.

**Pain point:** Medication adherence is hard. Family members forget doses, take them at the wrong time, run out of refills unexpectedly, or cannot remember whether they already took their morning pills. Existing pill reminder apps only work for one person and do not provide a caregiver-level overview across multiple family members.

## OpenClaw Setup

### Required Skills

```bash
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard
clawhub install agentgate
clawhub install gog
clawhub install apple-reminders
clawhub install whatsapp-cli
clawhub install obsidian
clawhub install self-improving-agent
```

**Skill explanations:**

- **agentgate** — Mandatory for this use case. Medication data is sensitive health information. `agentgate` ensures human-in-the-loop approval before any write operation, preventing the agent from accidentally modifying medication records or sending incorrect reminders without oversight.
- **gog** — Google Calendar integration for scheduling medication times, doctor appointments, and pharmacy refill pickups. Shared family calendars work well here.
- **apple-reminders** — Creates device-level notifications that persist until acknowledged. Critical for medication reminders because they need to be persistent, not dismissable push notifications. macOS/iOS only.
- **whatsapp-cli** — Sends medication reminders to family members via WhatsApp, which is often the easiest channel for elderly parents or teenagers who may not use the OpenClaw interface directly.
- **obsidian** — Stores the medication database, dosage schedules, compliance logs, and refill tracking in structured local files. No cloud dependency for sensitive health data.
- **self-improving-agent** — Learns optimal reminder timing. If a family member consistently takes their evening medication at 8:30 PM instead of the scheduled 8:00 PM, the agent adjusts the reminder time.
- **prompt-guard** — Extra important here because medication instructions must never be corrupted by prompt injection from external content the agent reads.

### Optional Skills

```bash
clawhub install telegram           # For family members who prefer Telegram
clawhub install clawsignal         # For Signal-based reminders (maximum privacy)
clawhub install summarize          # Condense doctor visit notes and prescription documents
clawhub install todoist            # Track pharmacy errands as tasks
clawhub install pubmed-edirect     # Look up drug interactions and side effects
clawhub install pdf-toolkit        # Process prescription PDFs and pharmacy documents
clawhub install healthy-eating     # Coordinate meal timing with medications that must be taken with food
clawhub install apple-health-skill # Correlate medication compliance with health metrics
clawhub install weather            # Remind about medications affected by weather (e.g., inhalers during high pollen)
```

### Accounts and API Keys Required

| Service | What You Need | Where to Get It |
|---|---|---|
| Google Account | OAuth for Calendar | Google Cloud Console |
| WhatsApp | WhatsApp Business API or local CLI session | WhatsApp Business setup |
| Obsidian | Local vault | Install Obsidian |
| Apple Reminders | macOS 14+ | Built into macOS |

### Hardware Recommendations

- **Always-on machine is essential.** Medication reminders must fire on time, every time, even when your laptop is closed. A Mac Mini, Intel NUC, or cloud VPS is strongly recommended.
- No GPU required.
- Stable internet connection for sending WhatsApp/Telegram reminders.
- Backup reminder channel: Configure at least two notification channels per family member (e.g., WhatsApp + Apple Reminders) so a single channel failure does not cause a missed dose.

### Channel Configuration

Different family members may prefer different notification channels:

- **Adults (tech-comfortable):** WhatsApp or Telegram for reminders, OpenClaw chat for confirmations.
- **Elderly parents:** WhatsApp is usually best — they already use it and know how to reply. Keep messages simple and large-font-friendly.
- **Children/teenagers:** Apple Reminders (persistent notification on their phone) or WhatsApp.
- **Caregiver (coordinator):** OpenClaw chat for the dashboard view, plus a daily compliance summary via email through `gog`.

## Core Automation Recipes

### 1. Individual Medication Reminders

```bash
openclaw cron add --at "08:00" "Send medication reminder to [FAMILY MEMBER NAME] via WhatsApp: 'Good morning! Time for your morning medications: (1) Levothyroxine 50mcg — take on empty stomach with water, (2) Vitamin D 1000IU — take with breakfast. Reply DONE when taken.' Log the reminder as sent in Obsidian at Health/medications/[name]/log/[today].md."
```

```bash
openclaw cron add --at "20:00" "Send medication reminder to [FAMILY MEMBER NAME] via WhatsApp: 'Evening medication time: (1) Lisinopril 10mg — take with dinner or right after. Reply DONE when taken.' Log the reminder as sent."
```

Create one cron job per family member per medication time slot. Keep messages clear, specific, and actionable.

### 2. Missed Dose Follow-Up

```bash
openclaw cron add --every 30m "Check today's medication log for all family members. If any medication reminder was sent more than 45 minutes ago without a DONE confirmation, send a follow-up: '[Name], friendly reminder — your [time] medications are still pending. Please take them when you can and reply DONE.' If no confirmation after 2 follow-ups (90 minutes total), alert the caregiver: '[Name] has not confirmed their [time] medications. Please check in.'"
```

Two follow-ups, then escalation to the caregiver. This balances persistence with avoiding notification fatigue.

### 3. Daily Compliance Dashboard

```bash
openclaw cron add --at "21:30" "Generate today's medication compliance dashboard. For each family member, show: (1) all scheduled medications, (2) which were confirmed taken (with timestamp), (3) which were missed or unconfirmed, (4) any notes or issues reported. Save to Obsidian at Health/medications/daily-dashboard/[today].md. Send the summary to the caregiver via [preferred channel]."
```

The caregiver gets one consolidated view each evening instead of tracking each family member individually.

### 4. Refill Tracking and Alerts

```bash
openclaw cron add --at "09:00" "Check the medication refill schedule in Obsidian at Health/medications/refills.md. For any medication with fewer than 7 days of supply remaining, alert the caregiver: '[Medication] for [family member] needs a refill — approximately [X] days of supply left. Pharmacy: [pharmacy name and phone]. Prescription number: [Rx number].' If fewer than 3 days remain, mark as URGENT."
```

Prevents the panic of running out of essential medications. The 7-day warning gives time to call the pharmacy, get a new prescription if needed, and pick it up.

### 5. Doctor Appointment Preparation

```bash
openclaw cron add --every 12h "Check Google Calendar for upcoming doctor or medical appointments in the next 7 days. For each appointment found, compile: (1) the relevant family member's current medication list with dosages, (2) compliance rate for the last 30 days for each medication, (3) any reported side effects or issues from the log, (4) questions or concerns noted in the log. Save as a pre-appointment summary at Health/medications/[name]/appointments/[date].md."
```

Gives you a printable medication history to bring to the doctor, with compliance data they can actually use.

### 6. Drug Interaction Check on New Medications

```bash
openclaw cron add --on-demand "When I add a new medication to any family member's profile, use pubmed-edirect to search for known interactions between the new medication and all existing medications in that person's profile. Present findings with PubMed citation links. Flag any interactions rated as 'major' or 'contraindicated' and recommend discussing with the prescribing physician before starting."
```

Requires `pubmed-edirect`. This is an informational tool — the agent must never recommend stopping or changing a medication based on interaction data.

### 7. Weekly Compliance Report

```bash
openclaw cron add --at "09:00" --weekdays "sun" "Generate the weekly medication compliance report for all family members. For each person, show: (1) overall compliance rate this week (doses confirmed / doses scheduled), (2) most commonly missed medication and time slot, (3) trend vs. last week (improving, declining, stable), (4) refill status for all medications, (5) upcoming doctor appointments. Save to Obsidian and send to the caregiver."
```

### 8. Travel and Timezone Adjustment

```bash
openclaw cron add --every 6h "Check Google Calendar for upcoming travel. If any family member is traveling across time zones, calculate adjusted medication times for the destination timezone. Notify the caregiver: '[Name] is traveling to [destination] ([timezone]). Their medication times should shift as follows: [adjusted schedule]. Adjust reminders? Reply YES to update or NO to keep current times.'"
```

Medication timing matters, especially for time-sensitive medications like insulin or thyroid hormones. Timezone changes can cause dangerous gaps or overlaps.

## Guardrails and Safety

The agent must NEVER do the following autonomously:

1. **Never provide medical advice.** The agent is a reminder and logging tool, not a healthcare provider. It must never suggest dosage changes, recommend stopping a medication, or interpret symptoms. Always direct medical questions to the prescribing physician.

2. **Never modify medication schedules without caregiver approval.** If a family member says "I want to stop taking this," the agent logs the request and alerts the caregiver but does not remove the medication from the schedule. Only the caregiver can modify the medication database.

3. **Never share medication data outside the household.** Health data is governed by privacy expectations even in a non-clinical setting. The agent must not post medication information to any external service, social media, or shared workspace.

4. **Never auto-refill or order medications.** The agent alerts when refills are needed but never places orders with pharmacies or online services.

5. **Never dismiss or downplay reported side effects.** If a family member reports a side effect, the agent logs it, alerts the caregiver immediately, and suggests contacting the prescribing physician. It must never respond with "that's normal" or "don't worry about it."

6. **Never send medication details in the clear to unsecured channels.** Use WhatsApp (end-to-end encrypted) or Signal (`clawsignal`) for reminders. Avoid sending full medication lists via unencrypted email or SMS.

7. **Never store medication data in cloud services.** All medication logs stay in the local Obsidian vault. Do not sync the Health folder to Notion, Google Docs, or any cloud-based note service.

8. **Never make assumptions about medications not in the database.** If a family member mentions a new medication the agent does not have on file, it asks for details and adds it only with caregiver approval.

Configure guardrails:

```
- NEVER provide medical advice, dosage recommendations, or diagnostic opinions
- NEVER modify medication schedules without explicit caregiver approval
- NEVER share medication or health data with any external service or person outside the household
- NEVER order, refill, or purchase medications
- NEVER dismiss or minimize reported side effects — always log and escalate to caregiver
- NEVER store health data in cloud services — Obsidian local vault only
- If a family member reports a concerning symptom, immediately alert the caregiver and recommend contacting their doctor
- All medication reminders must include the medication name, dosage, and any critical instructions (with food, on empty stomach, etc.)
```

## Sample Prompts

### Prompt 1: Initial Family Medication Setup

```
I want to set up medication tracking for my family. Here are the family members and their medications:

**Mom (age 72):**
- Metformin 500mg — twice daily with meals (breakfast and dinner)
- Amlodipine 5mg — once daily in the morning
- Calcium + Vitamin D — once daily with lunch
- Pharmacy: [pharmacy name], Rx numbers: [list]

**Dad (age 75):**
- Warfarin 5mg — once daily at 6pm (critical timing)
- Omeprazole 20mg — once daily 30 minutes before breakfast
- Pharmacy: [pharmacy name], Rx numbers: [list]

**Me (caregiver):**
- I take no regular medications, but I need to see the family dashboard

Send reminders to Mom and Dad via WhatsApp. Send the daily compliance dashboard to me via OpenClaw chat. Store all data in Obsidian under Health/medications/. Set up refill tracking for all medications — Mom's are 90-day supplies, Dad's are 30-day supplies, all last refilled on [date].
```

### Prompt 2: Adding a New Medication

```
Dad's doctor prescribed a new medication today: Atorvastatin 20mg, once daily in the evening with dinner. Start date is [date]. It's a 30-day supply. Please: (1) add it to Dad's medication profile, (2) check for any interactions with his current medications (Warfarin and Omeprazole), (3) update his evening reminder to include this new medication, (4) set up refill tracking.
```

### Prompt 3: Vacation Coverage

```
I'm going away for 5 days ([dates]). My sister [Name] will be checking in on Mom and Dad. Please: (1) add [sister's phone number] as a temporary caregiver contact, (2) send the daily compliance dashboard to her instead of me during those dates, (3) escalate missed-dose alerts to her, (4) resume sending everything to me when I return on [date]. Do NOT change any medication schedules or reminder times for Mom and Dad.
```

### Prompt 4: Doctor Visit Prep

```
Mom has a cardiology appointment on [date]. Generate a medication report I can bring to the appointment. Include: (1) her current complete medication list with dosages and timing, (2) her compliance rate for each medication over the last 90 days, (3) any missed doses with dates and reasons if noted, (4) any side effects she reported, (5) her most recent blood pressure readings if logged. Format it cleanly so I can print it.
```

### Prompt 5: Side Effect Report

```
Dad says his new Atorvastatin is making his muscles ache, especially in the morning. He started noticing it about a week after starting the medication. Log this as a reported side effect. Look up whether muscle pain is a known side effect of Atorvastatin on PubMed. Do NOT tell him to stop taking it — just log the information and remind me to bring it up with his doctor at the next appointment.
```

## Common Gotchas

### 1. Confirmation Ambiguity

The biggest issue: a family member responds to a WhatsApp reminder with something like "OK" or a thumbs-up emoji instead of "DONE." The agent may not interpret this as confirmation. **Fix:** Configure the agent to accept a range of confirmation signals: "done," "took it," "yes," "taken," thumbs-up emoji, checkmark emoji, or any affirmative response. Also define what does NOT count as confirmation: "I'll take it later" or "remind me again" should keep the reminder pending. Explicitly configure this in your rules.

### 2. Medication Name Variations

Doctors, pharmacies, and family members use different names for the same medication — brand names vs. generic names, abbreviations, or nicknames. "Metformin" might be called "Glucophage," "my diabetes pill," or "the white one." **Fix:** In each family member's medication profile, record both the generic name and the brand name, plus any nicknames the family member uses. Tell the agent: "When [family member] refers to 'my blood pressure pill,' they mean Amlodipine 5mg."

### 3. Timezone and Daylight Saving Time

Medication reminders run on cron schedules, which are timezone-sensitive. When clocks change for daylight saving time, a reminder scheduled for 8:00 AM suddenly fires at 7:00 AM or 9:00 AM. For time-sensitive medications (insulin, Warfarin), a one-hour shift matters. **Fix:** Verify that your OpenClaw cron jobs use timezone-aware scheduling. After each DST transition, run a quick check: "List all medication reminder times and confirm they are correct for the current timezone." Consider running a DST audit cron job that fires on the Sunday of each DST change.

## Maintenance and Long-Term Health

### Medication Database Integrity

The medication database in Obsidian is the single source of truth for this entire system. Protect it:

1. **Backup regularly.** Copy the `Health/medications/` folder to a separate location weekly. A corrupted or accidentally deleted medication file could cause missed reminders.
2. **Audit quarterly.** Every 3 months, sit down with each family member's complete medication list (from their pharmacy or doctor) and compare it against the Obsidian database. Medications get added, dosages change, and drugs get discontinued — the database must reflect reality.
3. **Single-editor policy.** Only the designated caregiver should modify the medication database. If multiple family members can edit Obsidian files, you risk conflicting changes. Use `agent-access-control` if needed.

### When Medications Change

Medication changes are the highest-risk moment for this system. When a doctor prescribes a new medication, changes a dosage, or discontinues a drug:

1. Update the medication profile in Obsidian immediately — do not wait until you get home.
2. Use the Quick Contact Capture pattern: text the agent via WhatsApp: "UPDATE: Mom's Metformin increased from 500mg to 850mg twice daily, effective today."
3. The agent should confirm the change, update all future reminders, and adjust the refill schedule.
4. Run the drug interaction check if a new medication was added.
5. Log the change with the date and prescribing doctor's name for the medical record.

### Handling Pharmacy Interactions

The agent tracks refill schedules but does not interact with pharmacies. When a refill alert fires:

1. The caregiver calls the pharmacy or submits a refill request through the pharmacy's own app or website.
2. Once the refill is picked up, tell the agent: "Refill picked up for [medication] for [family member]. New supply: [X] days. Reset the refill tracker."
3. If the pharmacy switches manufacturers (generic substitution), update the medication profile with the new brand name and pill appearance so family members are not confused by different-looking pills.

### Emergency Information Card

Use the medication database to generate a printable emergency card for each family member:

```bash
openclaw cron add --at "09:00" --monthday "1" "Generate updated emergency medication cards for all family members. For each person, create a concise card with: (1) full name and date of birth, (2) complete current medication list with dosages and timing, (3) known allergies, (4) primary physician name and phone number, (5) pharmacy name and phone number, (6) emergency contact (caregiver) phone number. Format for printing on a wallet-sized card. Save to Health/medications/emergency-cards/[name].md."
```

These cards are invaluable in an emergency room visit, urgent care situation, or when traveling.

### Privacy and Access Control

Medication data is among the most sensitive personal information. Beyond the guardrails above:

- **Physical security:** If the Obsidian vault is on a shared family computer, ensure the `Health/medications/` folder is in a separate vault or protected by OS-level file permissions.
- **Device security:** If reminders go via WhatsApp, ensure family members' phones have screen locks. A medication reminder displayed on an unlocked phone in a public place reveals health information.
- **Caregiver transition:** If the primary caregiver changes (e.g., a sibling takes over care responsibilities), document the handoff. Export the full medication database, provide the new caregiver with access, and update all notification routing.

### Cost Considerations

This setup has low ongoing costs:

- **No paid API keys required** for the core setup. `gog`, `apple-reminders`, `obsidian`, `whatsapp-cli`, and `agentgate` are all free or local.
- **`pubmed-edirect`** (optional, for drug interaction checks) requires a free NCBI API key.
- **AI model token usage** is modest — daily reminders, compliance logging, and weekly reports use few tokens.
- **The real cost is reliability.** Medication reminders must never fail silently. Budget for an always-on machine (Mac Mini at ~$600 or a cloud VPS at ~$5/month) if you do not already have one. The cost of a missed medication dose for an elderly parent can far exceed the cost of reliable hardware.

### When to Consider a Dedicated Medical System

This OpenClaw setup is appropriate for home-based, caregiver-managed medication tracking. It is NOT a replacement for:

- **Clinical medication management systems** used by hospitals, nursing homes, or home health agencies.
- **Automated pill dispensers** that physically control medication access (these are important for patients with dementia or cognitive decline).
- **Pharmacy-managed synchronization programs** that align all medications to a single refill date.

If a family member's medication regimen is complex (10+ medications, multiple dosage changes per month, IV or injectable medications requiring clinical oversight), consult their healthcare provider about clinical-grade tools. Use OpenClaw as a supplementary reminder and logging layer, not as the primary safety system.
