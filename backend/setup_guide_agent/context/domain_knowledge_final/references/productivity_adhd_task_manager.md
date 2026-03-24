---
Source: https://madebynathan.com/2026/02/03/everything-ive-done-with-openclaw-so-far/
Title: "Everything I've Done with OpenClaw (So Far)"
Author: Nathan Broadbent
Date: 2026-02-03
Type: reference
---

I've been running an AI agent called Reef on my home server for a few days now. What started as an experiment has turned into a genuinely incredibly system. Here's what we've built so far.

## The Setup

Reef runs on OpenClaw, an open-source framework for running Claude as a persistent agent. It has access to my entire home server infrastructure through:

- SSH to all my servers and containers in my home network
- Kubernetes cluster access (kubectl)
- 1Password for secrets management (in a dedicated vault)
- My email accounts (via gog CLI)
- My calendar
- My Obsidian vault (5,000+ notes)
- A personal Wikibase knowledge graph

## 15 Automated Jobs Running 24/7

The most impressive thing is how Reef has become self-sustaining through scheduled automation. Here are all the cron jobs currently running:

### Every 15 Minutes
- **Active Work Session** - Checks Fizzy (our kanban) for in-progress cards and continues work

### Hourly
- **Alerts Check** - Monitors Gatus health checks, ArgoCD deployments, and Fizzy notifications
- **Gmail Triage** - Scans inbox, labels actionable items, archives noise

### Every 6 Hours
- **KB Data Entry Batch** - Processes Obsidian notes to populate Wikibase with entities
- **Wikibase Link Reconciliation** - Converts [[wiki links]] in notes to Wikibase stubs
- **Report Reconciliation** - Ensures all daily reports are complete
- **Self Health Check** - Runs openclaw doctor, checks memory/disk, reviews logs

### Every 8 Hours
- **Wikibase Entity Enrichment** - Takes stub entities and enriches them by searching through all data dumps exported from Gmail, ChatGPT, X, Obsidian, and many other sources.

### Every 12 Hours
- **Internal Audit** - Scans workspace for code quality issues, TODOs, and documentation gaps

### 4x Daily
- **Log Health Check** - Analyzes Loki logs for errors across all services

### Daily
- **Nightly Brainstorm (4am)** - Deep creative exploration through notes, emails, and exports looking for connections
- **Daily Briefing (8am)** - Sends email summary with weather, calendar, system stats, and Fizzy activity
- **Fizzy Comment Reconciliation (9am)** - Catches any cards where I commented but Reef didn't reply
- **Velocity Assessment (1am)** - Analyzes Fizzy metrics to find process improvements
- **Wikibase Weekly Review** - QA pass on recently created entities

## 24 Custom Scripts

All the automation is backed by scripts Reef built autonomously:

**Monitoring:** check-gatus.sh, check-argocd.sh, check-loki-logs.sh, check-email.sh
**Reporting:** daily-briefing.sh, fizzy-daily-stats.sh, velocity-assessment.sh, weekly-infra-report.sh, security-audit.sh
**Knowledge Base:** wikibase-link-reconcile.sh, wikibase-enrich-entities.sh, wikibase-weekly-review.sh
**Utilities:** get-system-stats.sh, reconcile-fizzy-comments.sh, internal-audit.js, md2html.js

## Infrastructure Management

Reef deploys and manages apps on my K3s cluster:
- **Kubernetes deployments** - Writes Kustomize manifests, debugs pod issues
- **Terraform & Ansible** - All changes go through IaC
- **Service monitoring** - Regular health checks with automatic investigation
- **Just deployed** - Gitea and Woodpecker for local Git hosting and CI

## Personal Knowledge Base (Wikibase)

Building a personal knowledge graph using Wikibase - the same software that powers Wikidata.

**The problem:** Information about my life is scattered everywhere - notes, emails, messages, documents.
**The solution:** A structured knowledge graph where every person, place, project, and concept has its own entity with properties and relationships.

- **SPARQL queries** - Find anything instantly
- **Structured data** - Typed properties (dates, locations, relationships)
- **Entity linking** - Everything connects to everything else
- **AI-friendly** - Reef can query the KB to answer questions, fill out forms, or provide context

**Automated pipeline:** Entity extraction from Obsidian notes, link reconciliation, research enrichment from data exports, custom schema for family data model.

## Neat: ADHD-Friendly Task UI

Reef built and deployed a complete web app from scratch called Neat - a minimal interface for Fizzy designed for ADHD brains.

**The problem:** Traditional kanban boards show everything at once, which can be overwhelming. When you have 100+ cards across multiple boards, deciding what to work on becomes its own task.

**The solution:** Neat shows you ONE task at a time with a custom-tailored decision form. Instead of staring at a wall of cards, you answer a simple question and move on.

**Tech stack:** SvelteKit, TypeScript, Tailwind, SQLite, deployed to Kubernetes with Woodpecker CI.

**Features:** Single-task focus view, custom forms per card, swipe navigation on mobile, centralized Loki logging, full test coverage.

**Built and deployed autonomously:** This is the first time that I've experienced end-to-end autonomous engineering across an entire app development lifecycle. It only took a few initial prompts from me and some feedback. All via Telegram on my phone.

## Memory System with 49,000+ Facts

Reef built a memory extraction system that processed my ChatGPT export and extracted 49,079 atomic facts and 57 entities. Now expanding to include Claude Code history (174,000+ messages), Obsidian notes (5,000+ files), Notion, UpNote, Ghost exports.

## Security

What makes this less crazy than it sounds:
1. **Thousands of hours of IaC experience** - Server was already locked down before Reef arrived
2. **A year of Claude collaboration** - Understanding how it thinks, where it makes mistakes
3. **Daily security audits** - Automated security reviews checking for privileged containers, hardcoded secrets, overly permissive access controls, known vulnerabilities
4. **Defense in depth** - Network segmentation, secret scanning, IaC enforcement, monitoring, alerts

### The API Key Incident
On day one, Claude Code hardcoded a Gemini API key directly into code. Committed and pushed without careful review. Google and GitHub's automated secret scanning sent alerts within minutes. Key revoked quickly, no unauthorized usage.

### New Security Measures
1. **TruffleHog pre-push hooks** - Every public repo scanned before push
2. **Local-first Git workflow** - Gitea for local Git hosting, code stays private until scanned
3. **Defense in depth** - Pre-push hooks + CI scanning + GitHub/Google detection

**Lesson learned:** AI assistants will happily hardcode secrets. They sometimes don't have the same instincts humans do.
