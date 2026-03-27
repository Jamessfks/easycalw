# Real Estate Tenant Onboarding — OpenClaw Reference Guide

## What This Does

This guide configures OpenClaw as a tenant onboarding assistant for landlords and property managers. The agent handles the repetitive, document-heavy workflow that runs from lease signing through move-in day: sending welcome packets, collecting required documents (ID, proof of insurance, pet documentation), scheduling key pickups and utility transfers, tracking completion status across multiple tenants, and ensuring nothing falls through the cracks. It also manages post-move-in follow-ups like 30-day check-ins and maintenance request setup.

## Who This Is For

**User profile:** Independent landlords managing 5-50 rental units, small property management companies, or real estate investors who self-manage their portfolio. These users handle onboarding personally and lose 3-8 hours per new tenant on administrative coordination.

**Industry:** Residential real estate — single-family rentals, multi-family apartments, duplexes, student housing, and small commercial leases.

**Pain point:** Tenant onboarding involves 15-25 discrete tasks that must happen in a specific sequence over 2-4 weeks. Landlords either use paper checklists (which get lost), generic project management tools (which require manual setup for each tenant), or nothing at all (which results in missed steps, delayed move-ins, and liability exposure from uncollected documents). The process is identical for every tenant, making it an ideal automation target.

**Technical comfort:** Low to moderate. Most independent landlords are not tech-savvy. They need the system to work through email and text messages, not dashboards or command lines.

---

## OpenClaw Setup

### Required Skills

```bash
# Security foundation
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard
clawhub install agentgate              # Critical — tenant PII requires write-approval gates

# Core functionality
clawhub install gog                    # Gmail + Google Sheets + Google Drive for document management
clawhub install agent-browser          # Fill out utility transfer forms, check insurance portals
clawhub install whatsapp-cli           # Primary tenant communication channel
clawhub install summarize              # Summarize lease terms for welcome packets

# Document handling
clawhub install pdf-toolkit            # Merge, split, and organize lease documents
clawhub install esign-automation       # E-signature workflows for onboarding documents
clawhub install contract-review        # Review lease addenda and tenant-submitted documents

# Productivity
clawhub install automation-workflows   # Multi-step onboarding sequences
clawhub install apple-reminders        # Physical task reminders (key copies, unit inspection)
clawhub install todoist                # Onboarding task tracking across tenants
clawhub install self-improving-agent   # Learn landlord preferences over time
```

### Optional Skills

```bash
clawhub install notion                 # Property and tenant knowledge base
clawhub install data-analyst           # Occupancy and turnover analytics
clawhub install agent-mail             # Dedicated property management inbox
clawhub install translate-image        # Read foreign-language documents from international tenants
clawhub install deepl-translate        # Communicate with non-English-speaking tenants
```

### Channel Configuration

1. **Gmail (via `gog`):** The landlord's primary property management email. Used for:
   - Sending welcome emails and onboarding packets to new tenants
   - Receiving tenant-submitted documents (insurance certificates, ID copies)
   - Distributor and vendor communication (locksmith, cleaning, utilities)

2. **WhatsApp (via `whatsapp-cli`):** Tenant-facing communication for:
   - Quick status updates ("Your unit will be ready for key pickup on Friday at 2pm")
   - Document reminders ("Reminder: we still need your renter's insurance certificate")
   - Move-in day coordination
   - Post-move-in check-ins

3. **Google Drive (via `gog`):** Document storage structured as:
   ```
   Property Management/
   ├── Templates/
   │   ├── Welcome_Packet.pdf
   │   ├── Move_In_Checklist.pdf
   │   ├── Maintenance_Request_Guide.pdf
   │   └── Pet_Addendum.pdf
   ├── Properties/
   │   ├── 123_Main_St/
   │   │   ├── Unit_1A/
   │   │   │   ├── Tenant_Smith_2026/
   │   │   │   │   ├── Lease.pdf
   │   │   │   │   ├── Insurance_Certificate.pdf
   │   │   │   │   └── Move_In_Photos/
   ```

4. **Google Sheets (via `gog`):** Master onboarding tracker with columns:
   - Tenant Name, Unit, Lease Start Date, Move-In Date
   - Document checklist columns (Lease Signed, ID Verified, Insurance Received, Pet Docs, Emergency Contact)
   - Task status columns (Welcome Email Sent, Keys Cut, Unit Inspected, Utilities Transferred, Move-In Walkthrough Scheduled)
   - Notes, Last Contact Date, Status (In Progress / Complete / Stalled)

### Hardware Recommendations

- **Minimum:** Any Mac with 8GB RAM running macOS 14+. Tenant onboarding is not compute-intensive.
- **Recommended:** A dedicated Mac Mini in the landlord's home office. Always-on is helpful since tenant messages arrive at all hours, and automated reminders need to fire on schedule.
- **Storage:** 100GB+ recommended. Lease documents, photos, and insurance certificates accumulate quickly across multiple units and years.

---

## Core Automation Recipes

### 1. New Tenant Onboarding Kickoff

Trigger the full onboarding sequence when a new lease is signed.

```bash
openclaw cron add --every day --at 08:00 "Check the master onboarding Google Sheet (via gog) for any new rows where 'Status' is 'New'. For each new tenant: (1) Create a Google Drive folder at Properties/[address]/[unit]/Tenant_[name]_[year], (2) Send a welcome email via gog with the welcome packet PDF attached from the Templates folder, (3) Send a WhatsApp introduction via whatsapp-cli: 'Hi [name], welcome to [address]! I am the property management assistant. I will help coordinate your move-in. You will receive a welcome email shortly with all the details. Feel free to message here with any questions.', (4) Update the Sheet to mark 'Welcome Email Sent' and set Status to 'In Progress'."
```

### 2. Document Collection Follow-Up

Track which documents are outstanding and send reminders.

```bash
openclaw cron add --every day --at 10:00 "Check the master onboarding Google Sheet (via gog) for all tenants with Status 'In Progress'. For each tenant, identify which document columns are still empty (Insurance, ID, Pet Docs, Emergency Contact). If a document has been outstanding for more than 3 days, send a polite reminder via whatsapp-cli: 'Hi [name], just a quick reminder that we still need your [document type] before your move-in date. You can email it to [email] or reply here with a photo. Let me know if you have any questions about what is needed.' Update 'Last Contact Date' in the Sheet."
```

### 3. Insurance Verification

Check received insurance certificates for required coverage.

```bash
openclaw cron add --every 4h "Check Gmail (via gog) for new emails with attachments from tenants in the onboarding tracker. For each attachment that appears to be an insurance certificate: (1) Save it to the tenant's Google Drive folder, (2) Use summarize to extract: policy holder name, coverage amount, effective dates, and whether the property address is listed as a covered location, (3) If the coverage amount meets the minimum requirement ($100,000 liability) and the dates cover the lease period, mark 'Insurance Received' in the Sheet and send a confirmation via whatsapp-cli, (4) If the coverage is insufficient, draft a polite email via gog explaining what needs to be corrected — save as draft for landlord review."
```

### 4. Move-In Day Countdown

Send coordinated notifications as the move-in date approaches.

```bash
openclaw cron add --every day --at 09:00 "Check the master onboarding Google Sheet (via gog) for tenants with a move-in date within the next 7 days. For each: generate a countdown notification based on days remaining. 7 days out: confirm move-in date and time, remind about remaining documents. 3 days out: confirm key pickup logistics, remind about utility transfer. 1 day out: send final checklist — 'Here is what to expect tomorrow: (1) key pickup at [time/location], (2) walkthrough inspection, (3) meter readings.' Send via whatsapp-cli. Also send a reminder to the landlord via apple-reminders for any physical tasks due (key cutting, unit inspection, cleaning verification)."
```

### 5. Utility Transfer Coordination

Guide tenants through utility setup and verify transfers.

```bash
openclaw cron add --every day --at 11:00 "For tenants with move-in dates within 5 days who have not yet confirmed utility transfers (check 'Utilities Transferred' column in Google Sheet via gog): Send a WhatsApp message via whatsapp-cli with specific utility contact information: 'Hi [name], please set up utilities in your name before your move-in date. Here are the contacts: Electric: [company] [phone], Gas: [company] [phone], Water: [company] [phone]. Your account/meter numbers are: [numbers]. Please let me know once the transfers are confirmed so I can update your file.' If a tenant confirms, update the Sheet."
```

### 6. Post-Move-In 24-Hour Check

Follow up the day after move-in to catch immediate issues.

```bash
openclaw cron add --every day --at 17:00 "Check the master onboarding Google Sheet (via gog) for tenants whose move-in date was yesterday. Send a WhatsApp message via whatsapp-cli: 'Hi [name], hope your first night went well! A few quick things: (1) Did everything work as expected? Any issues with plumbing, electrical, or appliances? (2) Do you have any questions about the building or neighborhood? (3) Here is how to submit a maintenance request: [instructions]. We will check in again in about 30 days. Welcome home!' Log the contact in the Sheet."
```

### 7. 30-Day Follow-Up

Conduct a structured check-in one month after move-in.

```bash
openclaw cron add --every day --at 10:00 "Check the master onboarding Google Sheet (via gog) for tenants whose move-in date was approximately 30 days ago and who have not yet received a 30-day check-in. Send a WhatsApp message via whatsapp-cli: 'Hi [name], you have been in your unit for about a month now. Quick check-in: (1) Any maintenance items that need attention? (2) Is everything working properly — heat, AC, appliances, water pressure? (3) Any questions about lease terms, rent payment, or building policies? Feel free to message anytime.' Mark '30-Day Check-In' as complete in the Sheet. Update Status to 'Complete' if all onboarding items are done."
```

### 8. Lease Renewal Early Warning

Flag upcoming lease expirations to begin renewal conversations early.

```bash
openclaw cron add --every week --on monday --at 09:00 "Check the master onboarding Google Sheet (via gog) for all current tenants. Identify any leases expiring within the next 90 days. For each: send an email summary to the landlord via gog listing the tenant name, unit, lease end date, and current rent amount. Include a recommendation: 'Lease for [name] at [unit] expires on [date]. Suggest initiating renewal conversation by [date minus 60 days].' Do NOT contact the tenant directly about renewals — this is landlord-only information."
```

---

## Guardrails and Safety

### The Agent Must NEVER

1. **Make legal representations or give legal advice.** The agent must not interpret lease terms, advise tenants on their legal rights, or make statements about habitability, security deposits, or eviction. All legal questions must be redirected to the landlord or their attorney.

2. **Access, store, or transmit tenant Social Security Numbers, bank account numbers, or credit card information.** These are never needed for onboarding and must not appear in Google Sheets, Drive, or agent memory. Use `agentgate` to block any write operation involving these data types.

3. **Make promises about unit condition, amenities, or services.** The agent sends factual information from templates prepared by the landlord. It must never improvise descriptions of the unit or make commitments the landlord has not authorized.

4. **Discuss other tenants.** The agent must never share information about one tenant with another tenant, including occupancy status, complaints, or personal details. Tenant data is siloed per unit.

5. **Accept or process rent payments.** The agent does not handle financial transactions. Rent payment instructions come from the landlord's templates only.

6. **Enter a tenant's unit or coordinate entry without explicit landlord authorization.** Even scheduling a maintenance visit requires landlord approval, as most jurisdictions require proper notice before entry.

7. **Modify lease terms or agree to exceptions.** If a tenant asks "can I have a pet" or "can I move in early," the agent responds: "Let me check with [landlord name] and get back to you." It never makes commitments.

8. **Delete tenant records.** Historical onboarding records may be needed for legal disputes or tax purposes. The agent can archive but never delete.

### Recommended `agentguard` Configuration

```
Block: Any action containing "SSN", "social security", "bank account", "routing number", "credit card"
Block: Any action containing "legal advice", "your rights", "you are entitled"
Block: Any action containing "approve pet", "allow early move-in", "waive fee", "reduce rent"
Block: Any action sending messages that reference other tenants by name
Allow: Reading and updating Google Sheets (onboarding tracker only)
Allow: Sending pre-approved template messages via WhatsApp and Gmail
Allow: Saving documents to Google Drive
```

### Data Privacy Requirements

- **Tenant PII handling:** All tenant documents (ID copies, insurance certificates) must be stored in Google Drive with sharing restricted to the landlord's account only. The agent must not email tenant documents to any address other than the landlord's.
- **Retention policy:** Onboarding documents should be retained for the duration of the tenancy plus the period required by local law (typically 3-7 years). Configure the agent to never delete files from the Properties folder.
- **Fair Housing compliance:** The agent must never reference tenant race, religion, national origin, familial status, disability, or sex in any communication or tracking sheet. Onboarding tasks must be identical for all tenants.

---

## Sample Prompts

### Prompt 1: System Setup for a New Property

```
I manage 12 rental units across 3 properties. Here are the addresses and unit numbers:
- 123 Main St: Units 1A, 1B, 2A, 2B
- 456 Oak Ave: Units 101, 102, 103, 104
- 789 Pine Rd: Houses A, B, C, D

Please set up:
1. A Google Drive folder structure for all properties and units
2. A master onboarding tracker Google Sheet with all the columns needed for tenant onboarding
3. A template welcome email I can customize (include placeholders for tenant name, unit, move-in date, rent amount, and key pickup details)
4. A move-in checklist template that covers: document collection, utility transfers, key distribution, and walkthrough inspection

I will customize the templates and then you can start using them for new tenants.
```

### Prompt 2: Onboard a New Tenant

```
New tenant moving in:
- Name: Sarah Johnson
- Unit: 123 Main St, Unit 2A
- Lease start: April 1, 2026
- Move-in date: April 1, 2026
- Rent: $1,450/month
- Pet: One cat (pet addendum required)
- Key pickup: March 31 at 3pm at my office

Please kick off the full onboarding process. Send the welcome email and WhatsApp introduction. Set up her document folder. Track what we need to collect: signed lease (already done), renter's insurance certificate, copy of ID, emergency contact info, pet addendum, and first month's rent confirmation.
```

### Prompt 3: Batch Status Check

```
Give me a status update on all tenants currently in the onboarding process. For each one, tell me:
1. What percentage of their onboarding checklist is complete?
2. What specific items are still outstanding?
3. How many days until their move-in date?
4. When was the last time we contacted them?
5. Are any tenants stalled (no progress in 5+ days)?

Highlight anything that needs my immediate attention.
```

### Prompt 4: Post-Move-In Maintenance Setup

```
Sarah Johnson moved in yesterday at 123 Main St, Unit 2A. Please:
1. Send the 24-hour check-in message via WhatsApp
2. Set up a 30-day follow-up reminder
3. Send her the maintenance request guide from the Templates folder
4. Add her to the active tenants list and remove from the onboarding tracker
5. Create a "Maintenance Log" tab in her tenant folder for tracking any future requests
```

### Prompt 5: End-of-Month Onboarding Report

```
Generate an end-of-month onboarding report for March 2026:
1. How many tenants were onboarded this month?
2. Average number of days from lease signing to move-in completion
3. Most commonly missing or delayed documents
4. Any tenants still in progress with outstanding items
5. Upcoming move-ins scheduled for next month
6. Any lease renewals due in the next 90 days

Email the report to me with suggestions for improving the onboarding process based on patterns you have observed.
```

---

## Common Gotchas

### 1. Tenant Document Quality Makes Automated Verification Unreliable

**Problem:** Tenants submit documents in wildly varying quality — phone photos of insurance cards at odd angles, scanned PDFs with missing pages, screenshots of online portals rather than actual certificates, and documents in languages the agent cannot read. The `summarize` skill may extract incorrect information from low-quality images, and the agent may mark a document as "verified" when the coverage is actually insufficient or the document is unreadable.

**Fix:** Never let the agent mark a document as fully verified without landlord review for the first 3-5 tenants. After the agent establishes a track record, allow it to verify clearly legible documents that meet all criteria, but flag any document it is less than 90% confident about as "Needs Manual Review." Include a step in the verification workflow: "If any field on this document is unclear, partially obscured, or in a language other than English, mark it as 'Needs Review' rather than accepting it." Use `translate-image` for documents in other languages.

### 2. WhatsApp Message Timing Causes Tenant Frustration

**Problem:** Automated cron jobs do not account for time zones, work schedules, or tenant communication preferences. A reminder sent at 7:30am on a Saturday, or three messages in one day about different missing documents, makes the landlord look unprofessional and the tenant feel hounded. Tenants who are already stressed about moving do not respond well to frequent automated nudges.

**Fix:** Add tenant preferences to the onboarding tracker: preferred contact channel (WhatsApp vs email), preferred contact times, and a "do not contact before" date for each outstanding document. Space reminders to no more than one every 3 days for the same document. Never send onboarding messages before 9am or after 7pm in the tenant's local time. Batch multiple outstanding items into a single message rather than sending separate messages for each missing document.

### 3. Lease-Specific Variations Break Template Assumptions

**Problem:** Not all leases are the same. Month-to-month tenants have different onboarding requirements than 12-month lease tenants. Furnished units require an additional furniture inventory checklist. Subsidized housing units have additional documentation requirements. Student housing has guarantor requirements. The agent's default onboarding template may miss critical steps for non-standard lease types, or include unnecessary steps that confuse the tenant.

**Fix:** Create multiple onboarding templates in the Google Sheet — one for each lease type the landlord commonly uses (standard 12-month, month-to-month, furnished, student housing, etc.). Add a "Lease Type" column to the master tracker and have the agent select the correct template based on this field. Periodically review completed onboardings to identify steps that were added manually, which indicates the template needs updating. Use `self-improving-agent` to log these pattern adjustments.

---

## Compliance Notes

- **Fair Housing Act:** All onboarding communications and requirements must be identical regardless of tenant demographics. The agent must use the same templates, timelines, and document requirements for every tenant in the same property/lease type.
- **State-specific requirements:** Landlord-tenant laws vary significantly by state and municipality. The landlord is responsible for ensuring templates comply with local law. The agent does not provide legal advice.
- **Security deposit documentation:** Many jurisdictions require specific documentation at move-in (condition reports, photo evidence). Build these into the onboarding checklist if required by local law.
- **Lead paint disclosure:** For buildings constructed before 1978, federal law requires lead paint disclosure. Include this in the onboarding template for applicable properties.

---

## Related Guides

- `realestate_listing_management.md` — For managing rental property listings before the tenant is found
- `realestate_voice_crm.md` — For managing prospective tenant inquiries
- `consulting_client_onboarding.md` — Shares similar onboarding workflow patterns
- `smallbiz_customer_support.md` — For post-onboarding tenant support
