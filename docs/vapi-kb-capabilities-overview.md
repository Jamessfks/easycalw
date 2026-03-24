# OpenClaw Capabilities Overview
## For the Interview Agent — What OpenClaw Can and Cannot Do

This document is uploaded to the VAPI knowledge base so the interview agent can answer "can OpenClaw do X?" questions accurately without guessing.

---

## Supported Communication Channels

OpenClaw can connect to ALL of the following channels. If a user asks about any of these, confirm it is supported:

- Telegram (most popular, recommended default)
- WhatsApp (via WhatsApp Business API)
- Discord (text and voice channels)
- iMessage (macOS only)
- Slack (workspace integration)
- Email (Gmail, Outlook, and general SMTP)
- SMS (via Twilio or similar)

If a user asks about a channel NOT on this list (like TikTok, Instagram DMs, Facebook Messenger, LinkedIn), say: "That one is not natively supported yet, but our build agent can look into workarounds. Let's note it down."

---

## Skill Categories — What OpenClaw Can Do

OpenClaw has over 300 installable skills organized into these categories:

Core essentials: Google Workspace (Gmail, Calendar, Drive, Docs, Sheets), web search, summarisation, weather, browser automation, YouTube summarisation, audio transcription.

Task management: Apple Reminders, Things 3, Todoist, daily planners, automation workflows.

Communication: WhatsApp, Telegram, Discord, Slack, email, SMS, voice agents via ElevenLabs.

Search and research: Google Search, web search, academic paper search (arXiv, PubMed), news monitoring.

Security: Skill vetting (always installed first), system monitoring, access control.

Finance and bookkeeping: Bank transaction classification, invoice processing, expense tracking, Google Sheets automation.

CRM and sales: Contact management, lead tracking, follow-up automation, pipeline management.

Content and marketing: Blog repurposing, social media scheduling, newsletter curation, podcast show notes.

Developer tools: Git automation, CI/CD monitoring, code review, documentation generation.

Health and wellness: Fitness tracking, medication reminders, health data logging.

Education: Lesson planning, curriculum digitisation, language learning, student deadline tracking.

Home and IoT: Smart home control, home maintenance scheduling.

---

## What OpenClaw Is NOT

- It is NOT a website builder
- It is NOT a mobile app
- It is NOT a CRM (but it integrates with CRMs)
- It is NOT a phone system (but it can connect to voice channels)
- It does NOT replace your existing tools — it connects them and automates workflows between them

---

## Deployment Options

Mac mini: One-time cost around 600 dollars. No monthly fees. Sits in your home or office. Most popular option. Needs an M-series chip (M1 or newer). Must be a dedicated machine (not your daily laptop).

Hostinger VPS: Around 5 to 10 dollars per month. Our build agent handles the full setup. Good for users who do not want hardware at home or need 24/7 cloud uptime.

---

## Autonomy Tiers — What the Agent Can Do

When a user asks about how much control they keep, reference these levels:

Notify: The agent watches, analyses, and sends you a summary. It never takes action on its own.

Suggest: The agent drafts an action and asks for your approval before executing.

Execute: The agent acts on its own within defined guardrails. You set the boundaries.

Default is Notify. Users can mix tiers by category (for example: execute for scheduling, notify for financial transactions).
