# Dental Practice Workflow Reference
## Park Family Dentistry — OpenClaw Automation Playbook

> This document is a companion to your `OPENCLAW_ENGINE_SETUP_GUIDE.md`. It provides ready-to-use message templates, Dentrix integration guidance, recall campaign setup, and HIPAA-specific operating protocols for Dr. Park's dental practice.

---

## Part 1: WhatsApp Message Templates

These templates are designed for a warm, family-oriented dental practice. Use them verbatim or have your agent adapt them to fit the situation. All templates comply with the Tier 3 SUGGEST model — they are drafts for your review before sending.

### 1A — 48-Hour Appointment Reminder

```
Hi [FirstName]! 👋

Just a friendly reminder from Park Family Dentistry — you have an appointment coming up:

📅 [DAY], [DATE] at [TIME]
👨‍⚕️ With Dr. [DENTIST_NAME]
📍 [PRACTICE_ADDRESS]

To confirm your appointment, simply reply "CONFIRM" to this message.
Need to reschedule? Reply "RESCHEDULE" and we'll find a new time that works for you.

See you soon! 😊
— The Park Family Dentistry Team
```

### 1B — 2-Hour Same-Day Reminder

```
Hi [FirstName]! 🦷

Your appointment at Park Family Dentistry is today at [TIME] — just a couple of hours away!

📍 We're at [PRACTICE_ADDRESS]
🅿️ Parking is available [PARKING_INFO]

Can't make it? Reply "RESCHEDULE" and we'll get you a new spot quickly.

See you soon!
— Park Family Dentistry
```

### 1C — Post-No-Show Reschedule Offer

```
Hi [FirstName],

We noticed you weren't able to make your appointment today at Park Family Dentistry — no worries, life gets busy! 💙

We'd love to find a time that works better for you. Simply reply to this message with your preferred days and times, and we'll take care of the rest.

Your oral health matters to us, and we're here whenever you're ready.

Warmly,
The Park Family Dentistry Team
📞 [PRACTICE_PHONE]
```

### 1D — 24-Hour Post-Procedure Check-In (Root Canal / Extraction / Surgery)

```
Hi [FirstName],

This is the team at Park Family Dentistry checking in on you after your [PROCEDURE] yesterday. We hope you're recovering comfortably! 💙

A few reminders:
• Take prescribed medication as directed
• Avoid hard/crunchy foods for [RECOVERY_PERIOD]
• Apply ice packs if you experience swelling (20 min on, 20 min off)

If you experience: severe pain, heavy bleeding, fever, or swelling that's getting worse — please don't hesitate to reach out right away.

📞 Call or text us at [PRACTICE_PHONE]
🌐 After hours: [AFTER_HOURS_NUMBER or Emergency Protocol]

Wishing you a speedy recovery!
— Dr. Park & the Park Family Dentistry Team
```

### 1E — Post-Procedure Check-In (Deep Cleaning / Scaling)

```
Hi [FirstName]! 😊

Checking in from Park Family Dentistry after your deep cleaning yesterday. How are you feeling?

It's totally normal to experience:
• Sensitivity for a few days
• Slight tenderness in your gums
• Some mild bleeding when brushing

Pro tips for recovery:
• Use a soft-bristled toothbrush
• Rinse with warm salt water (1/2 tsp salt in 8 oz water)
• Avoid very hot or very cold drinks for 24-48 hours

Questions? Just reply here anytime!

— The Park Family Dentistry Team
```

---

## Part 2: Dentrix Integration Notes

OpenClaw does not have a direct native Dentrix connector at this time. The recommended approach for Park Family Dentistry is:

### Option A — Google Calendar Bridge (Recommended for Lisa)

Configure Dentrix to export your daily appointment schedule to Google Calendar. Many Dentrix installations support this via the **Dentrix Communication Manager** or **Patient Engage** add-on.

Once appointments sync to Google Calendar, the `gog` skill reads them directly. This is the simplest integration path and requires no custom development.

**Setup steps:**
1. In Dentrix: Navigate to Office Manager → Practice Setup → Practice Defaults
2. Enable Google Calendar sync (if your Dentrix version supports it)
3. Authorize with your dedicated `parkdentistry.agent@gmail.com` account
4. Verify appointments appear in Google Calendar within 5 minutes

> ⚕️ **HIPAA Note:** When syncing to Google Calendar, use your dedicated agent Google account — not your personal account. Ensure Google Workspace's Business Associate Agreement (BAA) is signed if you are using Google Workspace for Business. Consumer Gmail accounts do not cover HIPAA BAA.

### Option B — Daily Manual Export

If Dentrix-to-Google sync is not available, your front desk can export each day's schedule as a CSV and share it to a specific Google Drive folder the agent monitors. The agent reads the CSV and builds its reminder queue.

**Ask your agent:** "Read the appointment CSV in my Google Drive folder 'Park Dentistry - Daily Schedule' and identify all appointments for tomorrow."

### Option C — Future: Dentrix API (Advanced)

Dentrix offers a Patient Engagement API for enterprise integrations. This requires developer setup but enables real-time bidirectional sync. Consider this as a Phase 2 enhancement after your OpenClaw setup is stable.

---

## Part 3: Recall Campaign Setup

A recall campaign automatically re-engages patients who are overdue for their 6-month hygiene checkup. This is one of the highest-ROI automations for a dental practice.

### Recall Schedule Logic

| Time Since Last Visit | Action |
|---|---|
| 5 months | No action (agent monitors) |
| 6 months | First WhatsApp text recall message |
| 6.5 months | Email recall (via mailchannels skill) |
| 7 months | Phone queue notification to front desk |

### Recall Cron Job (Add After Initial Setup is Stable)

```bash
openclaw cron add \
  --name "Recall Campaign Check" \
  --cron "0 10 * * 1" \
  --tz "YOUR_TZ" \
  --session isolated \
  --message "Check the patient records in Google Calendar. Identify patients who had their last documented appointment (cleaning or checkup) more than 6 months ago and have no future appointment scheduled. For each overdue patient, draft a recall WhatsApp message: 'Hi [FirstName]! It's been a while since we've seen you at Park Family Dentistry — we just want to make sure your smile is still looking great! 😊 It's a great time to schedule your regular checkup and cleaning. Reply here or call us at [PRACTICE_PHONE] to get scheduled. We'd love to see you!' Compile as a list with patient name and message draft. Do not send — provide for Dr. Park's review." \
  --announce \
  --channel whatsapp \
  --to "YOUR_WHATSAPP_PHONE"
```

### Recall Message Templates

**6-Month First Contact:**
```
Hi [FirstName]! It's been about 6 months since your last visit to Park Family Dentistry,
and we want to make sure your smile is in great shape! 😊

Regular checkups catch small problems before they become big ones.

Ready to schedule? Reply here or call us at [PRACTICE_PHONE].
We have morning, afternoon, and some Saturday appointments available!

— Park Family Dentistry Team
```

**7-Month Follow-Up (Email via mailchannels):**
Subject: We Miss You at Park Family Dentistry, [FirstName]!

```
Hi [FirstName],

We noticed it's been a few months since your last visit and wanted to reach out personally.

Your oral health is important to us — regular cleanings prevent cavities, gum disease,
and can even catch early signs of other health issues.

We'd love to see you back!

→ [BOOKING_LINK or CALL_US link]

Call us: [PRACTICE_PHONE]
Hours: [PRACTICE_HOURS]

Warm regards,
Dr. Lisa Park & the Park Family Dentistry Team
[PRACTICE_ADDRESS]
```

---

## Part 4: Google Business Profile Review Requests

Sending review requests 2 hours after completed appointments is one of the easiest ways to build your online reputation. Add this cron job after your initial setup is stable:

```bash
openclaw cron add \
  --name "Post-Visit Review Request" \
  --cron "0 */2 9-18 * * 1-5" \
  --tz "YOUR_TZ" \
  --session isolated \
  --message "Check Google Calendar for appointments at Park Family Dentistry that completed in the last 2 hours. For each completed appointment (not cancelled or no-show), draft a brief WhatsApp review request message: 'Hi [FirstName]! Thank you for visiting Park Family Dentistry today! 😊 We hope your appointment went well. If you have a moment, we'd really appreciate a quick review on Google — it helps other families find us! → [GOOGLE_BUSINESS_PROFILE_REVIEW_LINK] Thank you so much! — The Park Family Dentistry Team' List each draft. Do not send — provide for Dr. Park's review." \
  --announce \
  --channel whatsapp \
  --to "YOUR_WHATSAPP_PHONE"
```

> 💡 **TIP:** Your Google Business Profile review link is formatted as: `https://g.page/r/YOUR_PLACE_ID/review` — find your Place ID in Google Business Profile Manager under "Get more reviews."

---

## Part 5: HIPAA Operating Protocol for OpenClaw

This section documents the operating rules your agent is trained on (via the Soul prompts). Keep this document on file for HIPAA compliance documentation purposes.

### PHI Categories Present in This Deployment

| PHI Type | Source | How Used | Transmitted To |
|---|---|---|---|
| Patient first name | Google Calendar | Personalize reminder messages | WhatsApp (outbound only) |
| Appointment date/time | Google Calendar | Reminder scheduling | WhatsApp (outbound only) |
| Procedure type | Google Calendar | Post-procedure check-in | WhatsApp (outbound only) |
| Phone number | Google Calendar | Message delivery address | WhatsApp routing |

### What the Agent Will Never Do

Per the Guardrails Prompt (Prompt 4 in `prompts_to_send.md`):

1. Never share one patient's information with another patient
2. Never store PHI in external services (no Notion, no cloud storage outside the Mac Mini)
3. Never transmit PHI via unencrypted channels
4. Never send diagnostic information, treatment recommendations, or clinical opinions
5. Never autonomously reschedule or cancel appointments — always defer to front desk
6. Never contact patients outside business hours (8 AM–6 PM local time)
7. Never send more than one reminder per appointment per reminder window

### Escalation Triggers

The agent is instructed to alert Dr. Park immediately (WhatsApp message) when:
- A patient reports a medical emergency or severe post-procedure complication
- A patient mentions they cannot afford treatment (financial hardship flag)
- A patient sends angry or threatening messages
- The agent encounters an error reading appointment data
- Any API cost exceeds $40 in a single day

---

## Part 6: No-Show Rate Tracking

Your target is moving from 18% to under 8%. Track this weekly using Automation 5 (Weekly No-Show Report).

### How to Calculate No-Show Rate

```
No-Show Rate = (No-Shows / Total Scheduled Appointments) × 100
```

**Your baseline:** 18% of 40 daily appointments = ~7 no-shows per day = ~140 no-shows/month

**Your target:** Under 8% = fewer than 3-4 no-shows per day

**Industry impact:** Each no-show costs approximately $200 in lost chair time. Getting from 18% to 8% saves approximately 80 no-shows/month × $200 = **$16,000/month recovered production**.

### Weekly Review Ritual

Every Monday morning, when Automation 5 delivers your weekly report:
1. Note the no-show rate percentage
2. Compare to the previous week
3. If rate exceeds 12%: increase reminder frequency (add 72hr reminder)
4. If rate drops below 8% for 3 consecutive weeks: automation is working — maintain current schedule
5. Review the reschedule offer response rate — patients who reply to Automation 3 are high-value recovery candidates

---

*This reference document is part of your OpenClaw setup package for Park Family Dentistry. Store it securely alongside your HIPAA documentation.*
