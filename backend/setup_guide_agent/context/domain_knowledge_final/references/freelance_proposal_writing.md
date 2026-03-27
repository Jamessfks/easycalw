# Freelance Proposal Writing — OpenClaw Reference Guide

## What This Does

This guide configures OpenClaw as a proposal-writing assistant for freelancers and
consultants. The agent helps you research prospective clients, draft tailored proposals,
manage proposal versions, track submissions, and follow up on outstanding proposals —
turning the painful "write a custom proposal for every lead" cycle into a streamlined
workflow where you provide the brief and the agent does the heavy lifting.

## Who This Is For

**Profile:** Freelance developers, designers, copywriters, consultants, marketing
agencies, and any independent professional who submits proposals or pitches to win
client work.

**Industry:** Professional services, creative services, tech consulting, marketing,
web development — any field where the sales cycle involves submitting written proposals
before a contract is signed.

**Pain point:** You spend 2-5 hours writing each proposal. Most proposals are 60-70%
boilerplate (about you, your process, your pricing structure) and 30-40% custom (the
client's specific problem, your tailored approach, relevant case studies). You know
templating would help but every client brief is different enough that pure templates
feel generic. You need something that can adapt your voice, portfolio, and methodology
to each prospect while keeping the quality consistent.

## OpenClaw Setup

### Required Skills

```bash
# Security baseline
clawhub install skill-vetter
clawhub install prompt-guard
clawhub install agentguard

# Core proposal workflow
clawhub install gog                  # Gmail + Google Docs + Drive for drafts/storage
clawhub install summarize            # Summarize client briefs and RFPs
clawhub install tavily-web-search    # Research prospective clients
clawhub install agent-browser        # Scrape client websites for context
clawhub install obsidian             # Personal knowledge base for portfolio/case studies
clawhub install pdf-toolkit          # Export proposals as PDF
clawhub install esign-automation     # Send contracts for e-signature after acceptance

# Tracking and follow-up
clawhub install agent-mail           # Email triage for proposal-related correspondence
clawhub install apple-reminders      # Follow-up reminders
```

### Optional Skills

```bash
clawhub install notion               # If you manage proposals in Notion databases
clawhub install todoist              # If you prefer Todoist for follow-up tracking
clawhub install things-mac           # If you prefer Things 3 for follow-up tracking
clawhub install hubspot              # If you use HubSpot CRM for lead management
clawhub install pipedrive            # If you use Pipedrive for deal tracking
clawhub install canva                # For designed proposal decks
clawhub install presentation-maker   # For slide-based proposals
clawhub install whatsapp-cli         # If clients communicate via WhatsApp
clawhub install contract-review      # Review incoming client contracts/MSAs
clawhub install data-analyst         # For proposals involving data/analytics work
clawhub install deepl-translate      # For multilingual proposals
clawhub install image-generation     # For proposals that need custom graphics
```

### Channels to Configure

| Channel | Purpose | Setup |
|---------|---------|-------|
| Gmail (via `gog`) | Receive RFPs, send proposals, track correspondence | Google OAuth |
| Google Drive (via `gog`) | Store proposal drafts, templates, final PDFs | Create a "Proposals" folder |
| Google Docs (via `gog`) | Draft and collaborate on proposals | Templates in a subfolder |
| Obsidian (via `obsidian`) | Portfolio vault with case studies, testimonials, rates | Local vault with structured notes |
| Apple Reminders (via `apple-reminders`) | Follow-up schedule for submitted proposals | macOS 14+ with iCloud |

### Hardware Recommendations

- **Minimum:** Any Mac with 8 GB RAM, macOS 14+. Proposal work is text-heavy, not
  compute-heavy.
- **Recommended:** MacBook Pro or Mac Mini M2+ with 16 GB RAM. The `agent-browser`
  skill uses Playwright for client research, which benefits from adequate RAM.
- **Storage:** 20 GB free for proposal drafts, PDFs, and the Obsidian vault.

## Core Automation Recipes

### 1. New Lead Research

When a new RFP or inquiry arrives, automatically research the prospect:

```bash
openclaw cron add --every 30m "check Gmail for new emails that contain RFP, proposal request, project brief, or 'looking for a freelancer'. For each new lead: use tavily-web-search to research the sender's company — find their website, recent news, team size, industry, and any publicly available information about their tech stack or brand. Use agent-browser to visit their website and extract key pages (About, Services, Team). Save a research brief in the Proposals Drive folder under a new subfolder named [Company Name]. Send me a Gmail summary with the research and ask if I want to proceed with a proposal."
```

### 2. Proposal Draft Generation

Generate a first draft based on the client brief and your portfolio:

```bash
openclaw cron add --every 15m "check if I have sent a message in the last 15 minutes starting with 'draft proposal:'. If so, parse the client name and project description. Look up the client research brief in the Proposals Drive folder. Search my Obsidian vault for relevant case studies, testimonials, and similar past projects. Draft a full proposal in Google Docs with these sections: Executive Summary, Understanding of the Problem, Proposed Approach, Timeline and Milestones, Deliverables, Relevant Experience (with case studies), Investment (pricing), and Next Steps. Use my standard voice and tone from the Obsidian note called 'Proposal Voice Guide'. Save the draft and send me the link."
```

### 3. Proposal Follow-Up Tracker

Track submissions and remind you to follow up:

```bash
openclaw cron add --every 24h --at 09:00 "check the Proposals Google Sheet for submitted proposals. For any proposal submitted 3 business days ago with no response, create an Apple Reminder: 'Follow up with [CLIENT] on [PROJECT] proposal — submitted [DATE]'. For any proposal submitted 7 business days ago with no response, draft a follow-up email in Gmail (do not send) with a polite check-in asking if they had questions. For any proposal older than 14 days with no response, mark it as 'Cold' in the sheet and notify me."
```

### 4. Proposal Pipeline Dashboard

Weekly summary of all active proposals:

```bash
openclaw cron add --every 7d --at "Monday 08:00" "generate a proposal pipeline report from the Proposals Google Sheet. Include: proposals drafted this week, proposals sent, proposals awaiting response (with days outstanding), proposals accepted, proposals declined, and total pipeline value. Calculate win rate for the last 90 days. Email the summary to me with the subject 'Weekly Proposal Pipeline — [DATE]'."
```

### 5. Template Maintenance

Keep your proposal templates current:

```bash
openclaw cron add --every 30d --at "1st 10:00" "review the last 10 proposals I sent (from the Proposals Google Sheet and Drive folder). Identify common sections that were reused verbatim, sections that were customized, and sections that were removed. Suggest updates to my proposal template in Google Docs based on what actually gets used. Also check if any case studies in my Obsidian vault are older than 12 months and suggest refreshing them."
```

### 6. Competitive Intelligence

Monitor your market for pricing and positioning signals:

```bash
openclaw cron add --every 7d "use tavily-web-search to search for recent freelance rate surveys, industry pricing reports, and competitor positioning in my field (check my Obsidian note called 'My Services and Rates' for the relevant field). Summarize any notable findings — rate changes, new competitors, demand shifts. Save the summary in my Obsidian vault under 'Market Intelligence/[DATE]'."
```

### 7. Proposal Acceptance Workflow

When a proposal is accepted, kick off the engagement:

```bash
openclaw cron add --every 30m "check Gmail for replies to previously sent proposals that indicate acceptance (look for phrases like 'let us proceed', 'we accept', 'ready to move forward', 'send the contract'). For each accepted proposal: update the Proposals Google Sheet status to 'Accepted', create an Apple Reminder for 'Send contract to [CLIENT] — proposal accepted', and draft a confirmation email thanking them and outlining next steps (contract signing, kickoff call scheduling). Do not send the email — show me the draft first."
```

### 8. Declined Proposal Learning

Extract lessons from rejections:

```bash
openclaw cron add --every 7d "check the Proposals Google Sheet for proposals marked as Declined in the last 7 days. For each one, check Gmail for any feedback from the client explaining why. Summarize the feedback and save it in my Obsidian vault under 'Proposal Learnings/[CLIENT] — [DATE]'. If there are 3 or more declined proposals in the last 30 days, analyze them for common patterns (pricing too high, timeline too long, wrong emphasis) and send me a summary."
```

## Guardrails and Safety

### The Agent Must NEVER Autonomously:

1. **Send a proposal to a client** without explicit human review and approval.
   Proposals are sales documents — a poorly written or incorrectly priced proposal
   can cost you thousands or damage your reputation. The agent drafts; you review
   and send.

2. **Commit to pricing, timelines, or deliverables** in any communication with a
   client. All numbers and commitments must come from the human. The agent can
   suggest based on past proposals, but the final figures are always your call.

3. **Share client information between proposals.** Client A's project details must
   never appear in Client B's proposal, even as a "similar project" reference.
   Case studies in your Obsidian vault should be pre-approved for sharing.

4. **Send follow-up emails without review.** Follow-up emails are drafted, not
   sent. Tone and timing matter in sales — the agent does not have the judgment
   to know when a follow-up would be helpful vs. annoying.

5. **Negotiate or counter-offer.** If a client pushes back on pricing, the agent
   should flag the conversation for you, not propose alternative pricing.

6. **Sign contracts or accept terms** on your behalf. Even with `esign-automation`
   installed, contract signing must be human-initiated. The agent can prepare
   contracts and send them for the client's signature, but only after you have
   reviewed the final terms.

7. **Disclose your rates to inbound leads** before you have qualified them. The
   agent should gather project details first and wait for your approval before
   sharing pricing.

### Recommended Safety Configuration

```bash
# Block auto-sending emails
openclaw config set agentguard.require_approval "gmail.*send,whatsapp.*send"

# Protect rate information
openclaw config set agentguard.sensitive_notes "Obsidian:My Services and Rates"

# Enable audit trail
clawhub install agent-audit-trail
```

## Sample Prompts

### Prompt 1: Initial Setup

```
You are my proposal writing assistant. Your job is to help me research prospects,
draft proposals, and track my proposal pipeline.

About me:
- I am a freelance [YOUR FIELD] based in [LOCATION]
- My hourly rate range is $[MIN]-$[MAX] depending on project complexity
- My typical project size is $[MIN]-$[MAX]
- My portfolio and case studies are in my Obsidian vault under "Portfolio"
- My proposal voice guide is in my Obsidian vault under "Proposal Voice Guide"

Rules:
- Never send proposals or follow-up emails without my review
- Never share pricing before I approve it
- Never share one client's project details in another client's proposal
- Draft everything in Google Docs, final versions as PDF
- Track all proposals in the Google Sheet called "Proposal Pipeline"

My proposals follow this structure: Executive Summary, Understanding of the Problem,
Proposed Approach, Timeline and Milestones, Deliverables, Relevant Experience,
Investment, Next Steps.
```

### Prompt 2: Draft a Proposal

```
Draft proposal: [CLIENT NAME] — [PROJECT DESCRIPTION]

Brief: [PASTE THE CLIENT'S EMAIL OR RFP TEXT HERE]

Additional context:
- Budget mentioned: [IF ANY]
- Timeline: [IF ANY]
- Priority case studies to include: [IF ANY]
- Pricing approach: [FIXED/HOURLY/RETAINER]

Research the client first, then draft. Include 2-3 relevant case studies from my
Obsidian vault. Suggest pricing based on similar past proposals but mark it clearly
as "SUGGESTED — REVIEW BEFORE SENDING."
```

### Prompt 3: Pipeline Review

```
Give me a full pipeline review:
1. How many proposals are currently outstanding?
2. What is the total pipeline value?
3. Which proposals need follow-up this week?
4. What is my win rate for the last quarter?
5. What is the average time from submission to decision?
6. Are there any patterns in what I am winning vs. losing?
```

### Prompt 4: Follow-Up Drafts

```
Draft follow-up emails for all proposals that have been outstanding for more than
5 business days. For each one:
- Keep it brief (3-4 sentences)
- Reference the specific project
- Ask if they have any questions
- Do not pressure or discount
- Match my usual tone

Show me all drafts. I will approve which ones to send.
```

## Common Gotchas

### 1. Obsidian Vault Structure Matters

The agent searches your Obsidian vault for case studies and portfolio items. If your
vault is not well-organized with clear note titles and folder structure, the agent will
either miss relevant case studies or pull irrelevant ones. A note titled "Project X
notes" is less useful than "Case Study — Acme Corp Website Redesign — 2025."

**Fix:** Create a dedicated "Portfolio" folder in your Obsidian vault with a consistent
naming convention: `Case Study — [Client] — [Project Type] — [Year]`. Include sections
for problem, solution, results, and a "shareable: yes/no" flag so the agent knows which
case studies it can reference in proposals.

### 2. Rate Leakage Through Proposal History

If you have proposals at different rate levels in your Google Sheet (discounted projects,
legacy rates, experimental pricing), the agent may suggest rates based on outdated or
anomalous data points. A proposal you sent at 50% off as a favor to a friend should not
anchor future pricing suggestions.

**Fix:** Add a "Rate Type" column to your Proposals Google Sheet with values like
"Standard", "Discounted", "Legacy", or "Experimental." Instruct the agent to only use
"Standard" rate proposals as reference points for pricing suggestions. Keep your
current rates in the Obsidian note "My Services and Rates" and tell the agent to
treat that as the authoritative rate source.

### 3. Research Depth vs. Speed Tradeoff

The client research recipe uses `tavily-web-search` and `agent-browser` to build a
prospect dossier. For well-known companies, this works well. For small businesses,
solo founders, or new companies, there may be very little publicly available information,
and the agent can spend 10+ minutes searching with little to show for it.

**Fix:** Set a research time limit. Tell the agent: "Spend no more than 3 minutes on
client research. If you cannot find substantial information, note what you found and
move on to the proposal draft. I will fill in client-specific context manually." For
small/unknown clients, skip automated research and provide the context yourself in the
draft prompt.
