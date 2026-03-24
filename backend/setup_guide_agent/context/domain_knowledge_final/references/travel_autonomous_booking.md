---
Source: https://www.linkedin.com/pulse/applying-agent-armed-scary-ability-pay-things-complex-john-mckinley-rbzue
Title: "Applying an AI agent (OpenClaw) armed with the scary ability to pay for things on a real-world, complex task"
Author: John McKinley
Date: 2026-02
Type: reference
---

A real-world test of what happens when you ask an AI (OpenClaw) to plan and book an 8-day trip to New Zealand.

## The Promise

The pitch for OpenClaw: an always-on AI agent that lives on your server, connects to your messaging apps, browses the web, executes tasks. A personal chief of staff that never sleeps, costs a fraction of a human assistant.

Test case: 8 days, Queenstown to Christchurch to Kaikoura — flights, hotels, whale watching, jet boats, scenic trains, Milford Sound flyover.

## What Worked

**Research and information synthesis were genuinely excellent.** Within minutes, OpenClaw produced detailed availability reports, compared pricing, identified booking priorities, built comprehensive day-by-day itinerary. Quality rivaled a good travel agent — instant and exhaustive.

**Messaging integration is solid.** AI accessible via Telegram with natural language ("research Milford Sound fly-cruise-fly options for March 9").

**Model routing best practice** — Haiku for routine tasks, Sonnet for complex research — smart cost management.

**Workspace and file management work well.** Organized files, generated PDFs, maintained state across conversations. Read from Google Drive (sandboxed), extracted correct info, formatted properly.

**Infrastructure is thoughtful.** Docker-based deployment, Caddy reverse proxy, rclone for Google Drive sync, configurable model routing, multi-channel support.

## Where It Fell Short

**Couldn't actually book anything reliably.** Playwright-based booking scripts were brittle. One stuck on CAPTCHA. Another filled form but couldn't submit payment. Author completed 12 of 13 bookings manually.

**The AI was a research assistant, not an executive assistant.** The gap between "here's everything you need" and "I booked it for you" is the gap between useful and transformative.

The modern web is actively hostile to automation: CAPTCHAs, payment processor verification, anti-bot JavaScript, iframes, shadow DOMs, dynamic content.

## The Security Solution: Snapper

Built an open-source tool called Snapper that sits between agents and sensitive operations:
- Handles PII management — credit card numbers, passport details never in OpenClaw's context
- Agent knows "payment details for John McKinley" exist but needs approval to use them
- Expanded to cover API key protection
- Human-in-the-loop approval chain for anything that costs money or touches sensitive data

## The Bottom Line

OpenClaw in early 2026: A+ researcher, graduated from D- executor to maybe a C. Can now complete purchases but needs hand-holding, guardrails, and patient human approving each step.

Saved 55% compared to traditional tour operator. Early savings from informed DIY booking guided by AI research.

The right mental model: "AI with a human-in-the-loop approval chain for anything that costs money or touches sensitive data."

Infrastructure: OpenClaw runs in Docker on Ubuntu 24.04 VPS, AI agents orchestrated via Docker Compose, Caddy as TLS-terminating reverse proxy, UFW restricting inbound traffic to HTTPS only.
