# OpenClaw Setup Agent — Complete Skill Registry Allowlist
### The authoritative list of skills the Setup Guide Agent may recommend during onboarding

> **Purpose:** This is the static skill registry that the Setup Guide Agent reads to match user needs to installable skills. The agent must NEVER invent skill slugs — all `clawhub install <slug>` commands come from this file.

> **Ordering:** Skills are ordered from universally essential → broadly useful → niche professional → highly technical. Within each tier, skills are ordered by relevance to the widest audience.

> **Audit Methodology:** Compiled by cross-referencing DataCamp's ClawHub guide (March 2026), VoltAgent's `awesome-openclaw-skills` repo (5,400+ filtered skills), Composio's skills review, rentamac.io's security-first breakdown, OpenClawMCP.com's vet guide, ClawSkills.sh (5,147 indexed), Firecrawl's top 16 review, DoneClaw's top 15, Felo AI's top 10, and the official `openclaw/skills` repository on Playbooks. All skills pass ClawHub's `nonSuspicious=true` filter and carry VirusTotal **"Benign"** badges unless noted otherwise.

> **Install any skill:** `clawhub install <skill-name>`
> **Security rule #1:** Always install `skill-vetter` and run it *before* installing anything else.

> **Link note:** Links marked 🔗 are direct author pages with confirmed URLs. Links marked 🔎 open a ClawHub search for that skill name where the exact author could not be confirmed across sources.

---

## Tier Legend

| Badge | Meaning |
|---|---|
| 🟢 **Bundled** | Ships with OpenClaw — zero additional risk, core-team maintained |
| 🔵 **First-Party** | Published by @steipete (OpenClaw creator) or the official openclaw org |
| ⭐ **Top Download** | In ClawHub's top downloads by volume |
| 🛡️ **Security** | Defensive skill — install before anything else |
| ✅ **Verified** | Multi-version, 100+ stars, documented, community-validated |
| 🆕 **New Addition** | Added in this expanded registry (not in the original 78) |

---

## 🌍 Tier 1 — Everyone Uses This (Core Essentials)
> *These skills solve problems every human with a phone and a calendar already has.*

| # | Skill | Tier | One-Line Description | Use Case It Solves | API Keys / Accounts Required |
|---|---|---|---|---|---|
| 1 | [gog](https://clawhub.ai/steipete/gog) 🔗 | 🟢 🔵 ⭐ | Full Google Workspace integration — Gmail, Calendar, Drive, Docs, and Sheets in one skill. | Read emails, check your schedule, find files, and draft documents — all from a single chat window without opening a browser. | Google Account (OAuth) |
| 2 | [summarize](https://clawhub.ai/steipete/summarize) 🔗 | 🟢 🔵 ⭐ | Summarizes any URL, PDF, audio recording, or document into a concise digest. | Turns a 40-page report, a 2-hour podcast, or a long article into a 10-sentence summary you can actually act on. | None |
| 3 | [weather](https://clawhub.ai/steipete/weather) 🔗 | 🟢 🔵 ⭐ | Fetches real-time weather conditions and multi-day forecasts for any location. | Answers "what should I wear today" or "will it rain during my trip" without opening a weather app. | None |
| 4 | [tavily-web-search](https://clawhub.ai/arun-8687/tavily-search) 🔗 | ⭐ ✅ | AI-optimized web search returning clean, agent-readable structured results via the Tavily API. | Getting a real answer to any question — news, facts, comparisons — without sifting through SEO-bloated pages yourself. | `TAVILY_API_KEY` (Tavily account) |
| 5 | [agent-browser](https://clawhub.ai/TheSethRose/agent-browser) 🔗 | ⭐ ✅ | Browser automation: the agent navigates web pages, fills forms, clicks, and extracts data from dynamic sites. | Completing any browser-based task (booking, form submission, price checking) without you touching a keyboard. | None (uses local Chrome/Playwright) |
| 6 | [whatsapp-cli](https://clawhub.ai/skills?q=whatsapp-cli&nonSuspicious=true) 🔎 | ✅ | Draft, approve, and send WhatsApp messages hands-free via natural language. | Composing and sending WhatsApp messages to contacts through the agent — especially useful for business or repeated messaging. | WhatsApp Business API or local CLI session |
| 7 | [notion](https://clawhub.ai/steipete/notion) 🔗 | 🔵 ✅ | Read and write Notion pages and databases via natural language through the official Notion API. | Creating meeting notes, updating task databases, and querying your workspace without ever opening a Notion tab. | Notion Integration Token |
| 8 | [obsidian](https://clawhub.ai/steipete/obsidian) 🔗 | 🟢 🔵 | Read, write, search, and link notes in your local Obsidian vault. | Querying your personal knowledge base and capturing new ideas into the right note without breaking your flow. | None (local vault) |
| 9 | [youtube-summarizer](https://clawhub.ai/skills?q=youtube-summarizer&nonSuspicious=true) 🔎 | ✅ | Extracts and condenses YouTube video transcripts into summaries, headlines, and key points. | Getting the key takeaways from a 45-minute YouTube video in under 30 seconds without watching it. | None |
| 10 | [openai-whisper](https://clawhub.ai/steipete/openai-whisper) 🔗 | 🔵 ✅ | Runs OpenAI's Whisper model locally for fast, private audio and video transcription. | Turning a voice memo, meeting recording, or lecture into clean searchable text — without any audio leaving your machine. | None (local) or OpenAI API Key |

---

## 📋 Tier 2 — Task Management & Productivity
> *Skills for organizing your day, managing tasks, and staying on top of what matters. Everyone needs a task system.*

| # | Skill | Tier | One-Line Description | Use Case It Solves | API Keys / Accounts Required |
|---|---|---|---|---|---|
| 11 | [apple-reminders](https://clawhub.ai/steipete/apple-reminders) 🔗 | 🟢 🔵 🆕 | Manage Apple Reminders via the `remindctl` CLI on macOS — list, add, edit, complete, delete with date filters. | Creating and managing reminders from chat without opening the Reminders app. Deep iCloud sync means it shows up on all Apple devices. | None (macOS 14+ required) |
| 12 | [things-mac](https://clawhub.ai/steipete/things-mac) 🔗 | 🟢 🔵 🆕 | Manage Things 3 via the `things` CLI on macOS — add/update projects and todos, search tasks, inspect areas and tags. | Full Things 3 task management from the terminal for GTD power users who live in Things. | None (Things 3 installed, macOS) |
| 13 | [todoist](https://clawhub.ai/skills?q=todoist&nonSuspicious=true) 🔎 | ✅ 🆕 | Manage Todoist tasks via CLI — list, add, modify, complete, delete. Supports filters, projects, labels, and priorities. | Cross-platform task management for users who need their tasks everywhere (web, mobile, desktop). | `TODOIST_API_TOKEN` |
| 14 | [adhd-daily-planner](https://clawhub.ai/skills?q=adhd-daily-planner&nonSuspicious=true) 🔎 | ✅ | Structures daily planning through guided conversational prompts for prioritization and time-blocking, designed for ADHD brains. | Turning "I don't know where to start today" into an actual prioritized plan through a quick 5-minute chat. | None |
| 15 | [automation-workflows](https://clawhub.ai/jk-0001/automation-workflows) 🔗 | ⭐ 🆕 | Design and implement automation workflows to save time on repetitive tasks. | Building multi-step automations (if X happens, do Y then Z) without writing code or using Zapier. | None |
| 16 | [auto-updater](https://clawhub.ai/maximeprades/auto-updater) 🔗 | ⭐ 🆕 | Automatically update OpenClaw and all installed skills once. | Keeping your agent and its skills up to date without manually checking for new versions. | None |

---

## 💬 Tier 3 — Communication & Messaging
> *Skills most people interact with every single day: messages, email, voice, and social channels.*

| # | Skill | Tier | One-Line Description | Use Case It Solves | API Keys / Accounts Required |
|---|---|---|---|---|---|
| 17 | [elevenlabs-agents](https://clawhub.ai/PennyroyalTea/elevenlabs-agents) 🔗 | ✅ | Gives OpenClaw a real voice with phone-call fallback if text messages or emails fail to deliver. | Booking a restaurant by phone, following up on an order, or getting a voice readout of your daily tasks — hands-free. | ElevenLabs API Key |
| 18 | [agent-mail](https://clawhub.ai/rimelucci/agent-mail) 🔗 | ✅ | Dedicated AI agent inbox with automatic triage, prioritization, and reply drafting. | Clearing inbox overwhelm by letting the agent sort, label, and draft responses to your emails. | SMTP/IMAP credentials |
| 19 | [mailchannels](https://clawhub.ai/ttulttul/mailchannels) 🔗 | ✅ | Sends reliable transactional email through MailChannels with signed delivery. | Sending confirmations, reminders, or automated follow-up emails through the agent without a full ESP setup. | MailChannels API Key |
| 20 | [discord-voice](https://clawhub.ai/avatarneil/discord-voice) 🔗 | ✅ | Gives the agent a real-time voice presence in Discord channels using speech synthesis. | Having the agent verbally announce alerts, updates, or responses inside a Discord server voice channel. | Discord Bot Token + ElevenLabs API Key |
| 21 | [whatsapp-styling-guide](https://clawhub.ai/rubenfb23/whatsapp-styling-guide) 🔗 | ✅ | Enforces consistent, professional formatting on all agent-sent WhatsApp messages. | Ensuring business WhatsApp communications always look polished and brand-consistent. | None (formatting rules only) |
| 22 | [bird](https://clawhub.ai/skills?q=bird&nonSuspicious=true) 🔎 | ✅ | Interacts with X (Twitter) to monitor feeds, search keywords, and pull social data into the agent. | Staying on top of trending topics, brand mentions, or competitor activity without opening the X app. | X Developer API Key + Secret |
| 23 | [clawsignal](https://clawhub.ai/bmcalister/clawsignal) 🔗 | ✅ | Real-time agent-initiated messaging for proactive alerts and urgent coordination. | Getting an immediate message from the agent the moment a condition you care about is triggered — no polling required. | Signal CLI setup (local) |
| 24 | [slack](https://clawhub.ai/skills?q=slack&nonSuspicious=true) 🔎 | ✅ 🆕 | Read, post, and manage Slack messages and channels via the Slack API. | Summarizing Slack threads, posting standup updates, monitoring channels for keywords, and routing messages — all from the agent. | Slack Bot Token (OAuth) |
| 25 | [telegram](https://clawhub.ai/skills?q=telegram&nonSuspicious=true) 🔎 | ✅ 🆕 | Send and receive Telegram messages, manage groups, and handle bot interactions. | Running the agent as a Telegram bot for personal messaging or community management. | Telegram Bot Token |
| 26 | [instagram](https://clawhub.ai/skills?q=instagram&nonSuspicious=true) 🔎 | ✅ 🆕 | Post content, read DMs, and manage Instagram interactions via the Graph API. | Scheduling posts, replying to DMs, and monitoring engagement without opening the Instagram app. | Instagram Graph API credentials |

---

## 🔍 Tier 4 — Search, Research & Learning
> *For students, writers, researchers, and the endlessly curious — people who need to know things.*

| # | Skill | Tier | One-Line Description | Use Case It Solves | API Keys / Accounts Required |
|---|---|---|---|---|---|
| 27 | [google-search](https://clawhub.ai/mxfeinberg/google-search) 🔗 | ✅ | Structured Google Custom Search results for precise, reliable queries. | Getting clean search results for any topic, especially when you need Google's index specifically. | Google Custom Search API Key + CSE Engine ID |
| 28 | [exa-web-search-free](https://clawhub.ai/whiteknight07/exa-web-search-free) 🔗 | ✅ | Free AI-powered web search via Exa's developer-focused index. | Finding technical answers, docs, and repos without burning paid API credits for everyday queries. | None (free Exa tier) |
| 29 | [brave-search](https://clawhub.ai/skills?q=brave-search&nonSuspicious=true) 🔎 | ✅ 🆕 | Privacy-first web search via Brave's Search API — no API key required for basic use. | Getting web search results without Google tracking or API key setup. Great default search for privacy-conscious users. | None (basic) or Brave Search API Key (advanced) |
| 30 | [arxiv-watcher](https://clawhub.ai/rubenfb23/arxiv-watcher) 🔗 | ✅ | Monitors ArXiv for new papers on specified topics, keywords, or authors and surfaces them daily. | Never manually checking ArXiv again — the agent surfaces new research relevant to you automatically each day. | None |
| 31 | [pubmed-edirect](https://clawhub.ai/killgfat/pubmed-edirect) 🔗 | ✅ | Queries PubMed for peer-reviewed biomedical and life sciences literature via NCBI's Entrez API. | Finding clinical or scientific evidence for health, nutrition, or life sciences questions from a trusted source. | NCBI API Key (free registration) |
| 32 | [aeo-prompt-question-finder](https://clawhub.ai/skills?q=aeo-prompt-question-finder&nonSuspicious=true) 🔎 | ✅ | Surfaces question-based Google Autocomplete suggestions for any topic or keyword. | Discovering what people are actually asking about a topic — useful for content creation, SEO, or market research. | None |
| 33 | [web-scraper-as-a-service](https://clawhub.ai/seanwyngaard/web-scraper-as-a-service) 🔗 | ✅ | Builds clean, scheduled web scrapers that return structured data from any site on a recurring basis. | Extracting and monitoring data from any website automatically — prices, listings, news, job posts — without writing code. | None or optional cloud hosting credentials |
| 34 | [gno](https://clawhub.ai/skills?q=gno&nonSuspicious=true) 🔎 | ✅ | Local BM25 + vector hybrid search across your personal documents and files. | Asking "what did I write about X last year?" and getting an accurate answer from your own files, fully offline. | None (fully local) |
| 35 | [brightdata](https://clawhub.ai/meirkad/bright-data) 🔗 | ✅ | Wraps Bright Data's API to scrape dynamic, paginated, or bot-protected websites at scale. | Getting structured data from any website — even those with aggressive anti-bot measures — without manual copy-pasting. | Bright Data API Key (paid) |

---

## 🛡️ Tier 5 — Security & Trust
> *Install these before anything else. The ClawHavoc attack (Feb 2026) put 1,184 malicious skills in the registry. These are your defence layer.*

| # | Skill | Tier | One-Line Description | Use Case It Solves | API Keys / Accounts Required |
|---|---|---|---|---|---|
| 36 | [skill-vetter](https://clawhub.ai/spclaudehome/skill-vetter) 🔗 | 🛡️ ⭐ | Pre-install scanner that checks any ClawHub skill for red flags before you grant it machine access. | **Your first install.** Ensures no skill touches your system before being scanned for malicious code or suspicious behavior. | None |
| 37 | [clawscan](https://clawhub.ai/g0head/clawscan) 🔗 | 🛡️ ✅ | Scans skill bundles for suspicious code patterns, undeclared network calls, and known malware signatures. | Running a thorough code review of any skill automatically, without needing to read every line yourself. | None |
| 38 | [prompt-guard](https://clawhub.ai/seojoonkim/prompt-guard) 🔗 | 🛡️ ✅ | Defends against prompt injection — malicious content in web pages, emails, or docs trying to hijack the agent. | Protecting the agent every time it reads external content that could contain embedded adversarial instructions. | None |
| 39 | [agentguard](https://clawhub.ai/manas-io-ai/agentguard) 🔗 | 🛡️ ✅ | Real-time behavioral monitoring and guardrails that block unintended high-risk agent actions before they execute. | Preventing the agent from deleting files, sending messages, or making purchases you never intended to authorize. | None |
| 40 | [skill-scanner](https://clawhub.ai/bvinci1-design/skill-scanner) 🔗 | 🛡️ ✅ | Deep post-install scan of active skills and MCP servers for spyware-like behavior and unusual network traffic. | Catching skills that behave normally at install time but turn malicious after they're trusted. | None |
| 41 | [agentgate](https://clawhub.ai/skills?q=agentgate&nonSuspicious=true) 🔎 | 🛡️ ✅ | API gateway for personal data with mandatory human-in-the-loop approval before any write operation. | Making sure the agent can never silently modify or exfiltrate sensitive data — every write requires your explicit sign-off. | None |
| 42 | [config-guardian](https://clawhub.ai/abdhilabs/config-guardian) 🔗 | 🛡️ ✅ | Validates configuration changes before they take effect, blocking silent modifications to sensitive files. | Preventing accidental or adversarially-triggered changes to your OpenClaw config from breaking your setup. | None |
| 43 | [agent-access-control](https://clawhub.ai/skills?q=agent-access-control&nonSuspicious=true) 🔎 | 🛡️ ✅ | Tiered trust levels so different people messaging the agent get different levels of access and capability. | Stopping someone who messages your agent through a shared interface from invoking capabilities meant only for you. | None |
| 44 | [skills-audit](https://clawhub.ai/morozred/skill-audit) 🔗 | 🛡️ ✅ | Policy audit across all installed skills to surface permission drift and flag policy violations. | Running a periodic "what can my agent actually do?" review — essential after installing many skills over time. | None |
| 45 | [agent-audit-trail](https://clawhub.ai/skills?q=agent-audit-trail&nonSuspicious=true) 🔎 | 🛡️ ✅ | Tamper-evident, hash-chained log of every action the agent has ever taken. | Knowing exactly what the agent did and when, with a cryptographically verifiable record no one can quietly edit. | None |
| 46 | [claw-audit](https://clawhub.ai/skills?q=claw-audit&nonSuspicious=true) 🔎 | 🛡️ ✅ 🆕 | Full security scanner and hardening tool — scans installed skills for malware, audits configuration, calculates a security score, and guides auto-fixing. | One-command security posture assessment for your entire OpenClaw installation. | None |

---

## 💰 Tier 6 — Finance, Payments & Accounting
> *For anyone who tracks money — personal budgets, freelance invoicing, business finances, or payment processing.*

| # | Skill | Tier | One-Line Description | Use Case It Solves | API Keys / Accounts Required |
|---|---|---|---|---|---|
| 47 | [plaid](https://clawhub.ai/skills?q=plaid&nonSuspicious=true) 🔎 | ✅ 🆕 | Link bank accounts, query balances, and fetch transactions via the plaid-cli. | Asking "how much did I spend on food this month?" and getting an answer directly from your bank data. | `PLAID_CLIENT_ID` + `PLAID_SECRET` (Plaid account) |
| 48 | [payment](https://clawhub.ai/skills?q=payment&nonSuspicious=true) 🔎 | ✅ 🆕 | Guardrailed payment processing — Stripe checkout, prepaid wallets, and owner-approved shopping via CreditClaw. | Letting the agent handle purchases (order supplies, pay invoices) with strict spending limits and approval gates. | `CREDITCLAW_API_KEY` or Stripe keys |
| 49 | [bookkeeper](https://clawhub.ai/skills?q=bookkeeper&nonSuspicious=true) 🔎 | ✅ 🆕 | Automated pre-accounting — email invoice intake, OCR extraction, payment verification, and accounting entry creation via Gmail + Stripe + Xero. | Turning a pile of emailed invoices into reconciliation-ready accounting entries without manual data entry. | `MATON_API_KEY` + `DEEPREAD_API_KEY` + Xero credentials |
| 50 | [financial-overview](https://clawhub.ai/skills?q=financial-overview&nonSuspicious=true) 🔎 | ✅ 🆕 | Aggregates balance, recent transactions, invoices, and tax status into a single business financial dashboard. | Asking "how is my business doing?" and getting a complete financial snapshot in one response. | Norman Finance MCP server |
| 51 | [ga4-analysis](https://clawhub.ai/skills?q=ga4-analysis&nonSuspicious=true) 🔎 | ✅ | Connects to Google Analytics 4 for automated plain-English summaries of website traffic and performance. | Getting actionable GA4 insights without navigating the GA4 dashboard or writing API queries. | GA4 API Key + Service Account JSON |

---

## 🏥 Tier 7 — Health, Fitness & Wellness
> *For anyone tracking health metrics, building fitness habits, or managing nutrition.*

| # | Skill | Tier | One-Line Description | Use Case It Solves | API Keys / Accounts Required |
|---|---|---|---|---|---|
| 52 | [apple-health-skill](https://clawhub.ai/skills?q=apple-health-skill&nonSuspicious=true) 🔎 | ✅ 🆕 | Query Apple Health data with AI — workouts, heart rate trends, activity rings, VO2 Max, and fitness insights. | Asking "how did my running improve this month?" and getting data-backed answers from your Apple Watch. | Transition app + Apple Health access |
| 53 | [healthsync](https://clawhub.ai/skills?q=healthsync&nonSuspicious=true) 🔎 | ✅ 🆕 | Read-only queries against Apple Health data stored in a local SQLite database — heart rate, steps, SpO2, sleep, workouts, HRV, blood pressure, and more. | Deep health data analysis locally without sending medical data to any cloud service. | `healthsync` binary (local) |
| 54 | [healthy-eating](https://clawhub.ai/skills?q=healthy-eating&nonSuspicious=true) 🔎 | ✅ 🆕 | Meal logging, nutrition tracking, and personalized food guidance — no calorie-counting obsession, just sustainable habits. | Logging meals and getting practical nutrition advice through conversation instead of a separate tracking app. | None |
| 55 | [pubmed-edirect](https://clawhub.ai/killgfat/pubmed-edirect) 🔗 | ✅ | (Also in Tier 4) Queries PubMed for peer-reviewed biomedical literature. | Looking up clinical evidence for health questions from a trusted medical source. | NCBI API Key (free) |

---

## 📊 Tier 8 — CRM, Sales & Business Operations
> *For founders, sales teams, and anyone managing customer relationships and deals.*

| # | Skill | Tier | One-Line Description | Use Case It Solves | API Keys / Accounts Required |
|---|---|---|---|---|---|
| 56 | [hubspot](https://clawhub.ai/skills?q=hubspot&nonSuspicious=true) 🔎 | ✅ 🆕 | Read and write HubSpot contacts, companies, deals, and owner assignments via the REST API. | Qualifying leads from WhatsApp/email and pushing them into HubSpot without manual CRM data entry. | HubSpot API Key or Private App Token |
| 57 | [salesforce](https://clawhub.ai/skills?q=salesforce&nonSuspicious=true) 🔎 | ✅ 🆕 | Query and update Salesforce records — accounts, contacts, opportunities, and custom objects via SOQL. | Enterprise CRM automation for sales teams managing complex deal pipelines. | Salesforce Connected App credentials |
| 58 | [pipedrive](https://clawhub.ai/skills?q=pipedrive&nonSuspicious=true) 🔎 | ✅ 🆕 | Manage Pipedrive deals, contacts, activities, and pipeline stages through the agent. | Small business sales pipeline management without living inside the Pipedrive UI. | Pipedrive API Token |
| 59 | [composio](https://clawhub.ai/composiohq/composio) 🔗 | ✅ | Unlocks 860+ external service integrations (GitHub, Slack, Gmail, Stripe, etc.) through a single auth framework. | Connecting the agent to any business tool without writing custom OAuth pipelines for each one. | Composio API Key (free tier) |
| 60 | [adwhiz](https://clawhub.ai/skills?q=adwhiz&nonSuspicious=true) 🔎 | ✅ | 44 MCP tools for auditing, creating, and optimizing Google Ads campaigns via natural language. | Managing the full Google Ads lifecycle — targeting, bids, copy, audits — without opening the Ads Manager UI. | Google Ads API credentials + Developer Token |

---

## 📁 Tier 9 — Project Management & Collaboration
> *For teams and individuals who need to track work, manage sprints, and coordinate across tools.*

| # | Skill | Tier | One-Line Description | Use Case It Solves | API Keys / Accounts Required |
|---|---|---|---|---|---|
| 61 | [linear](https://clawhub.ai/skills?q=linear&nonSuspicious=true) 🔎 | ✅ 🆕 | Create, update, and query Linear issues, projects, and cycles. | Managing engineering sprints and bug tracking through conversation instead of the Linear UI. | Linear API Key |
| 62 | [jira](https://clawhub.ai/skills?q=jira&nonSuspicious=true) 🔎 | ✅ 🆕 | Full Jira integration — create issues, transition statuses, search with JQL, and manage sprints. | Enterprise project management for teams already in the Atlassian ecosystem. | Jira API Token + Atlassian account |
| 63 | [asana](https://clawhub.ai/skills?q=asana&nonSuspicious=true) 🔎 | ✅ 🆕 | Manage Asana tasks, projects, and sections via the API. | Cross-functional project tracking for non-engineering teams using Asana. | Asana Personal Access Token |
| 64 | [n8n-workflow-automation](https://clawhub.ai/KOwl64/n8n-workflow-automation) 🔗 | ✅ | Chat-driven control of a local n8n instance to create and trigger complex multi-step automation workflows. | Building Zapier-style automations (save Gmail attachments → Slack → Dropbox) without paying for automation SaaS subscriptions. | Self-hosted n8n instance |
| 65 | [agent-team-orchestration](https://clawhub.ai/skills?q=agent-team-orchestration&nonSuspicious=true) 🔎 | ✅ | Orchestrates multi-agent teams with defined roles, handoff protocols, and review workflows. | Managing complex projects across multiple specialised agents working in coordinated pipelines. | None / AI provider API key |

---

## 🏠 Tier 10 — Home, Media & Lifestyle
> *For anyone with smart home devices, a music system, or a creative side.*

| # | Skill | Tier | One-Line Description | Use Case It Solves | API Keys / Accounts Required |
|---|---|---|---|---|---|
| 66 | [home-assistant](https://clawhub.ai/iAhmadZain/home-assistant) 🔗 | ✅ | Full natural-language smart home control via a local Home Assistant instance — zero cloud dependency. | Controlling lights, locks, thermostat, and appliances through a chat message, with no data leaving your home network. | Home Assistant `HASS_TOKEN` on local network |
| 67 | [sonoscli](https://clawhub.ai/steipete/sonoscli) 🔗 | 🟢 🔵 ⭐ | Controls Sonos speakers — playback, volume, playlists, and room grouping — via natural language. | Playing music, setting volume, and grouping rooms in your Sonos system without touching a screen or the Sonos app. | Sonos speakers on local network |

---

## 🌐 Tier 11 — Translation, Localization & Accessibility
> *For multilingual users, international teams, and anyone working across language barriers.*

| # | Skill | Tier | One-Line Description | Use Case It Solves | API Keys / Accounts Required |
|---|---|---|---|---|---|
| 68 | [translate-image](https://clawhub.ai/skills?q=translate-image&nonSuspicious=true) 🔎 | ✅ 🆕 | Translate text in images via OCR — menus, signs, manga, product labels, scanned documents. Supports multiple translator models. | Taking a photo of a foreign menu or street sign and getting an instant translation overlaid on the image. | TranslateImage API Key |
| 69 | [deepl-translate](https://clawhub.ai/skills?q=deepl-translate&nonSuspicious=true) 🔎 | ✅ 🆕 | High-quality text translation via DeepL's API — supports 30+ languages with context-aware accuracy. | Translating documents, emails, or chat messages with near-human quality across major language pairs. | DeepL API Key (free tier available) |
| 70 | [tts-multilingual](https://clawhub.ai/skills?q=tts-multilingual&nonSuspicious=true) 🔎 | ✅ 🆕 | Text-to-speech in 50+ languages with natural-sounding voices for accessibility and content creation. | Reading documents aloud in the user's native language, creating audio content, or assisting visually impaired users. | TTS provider API Key (varies) |

---

## ✍️ Tier 12 — Documents, Legal & E-Signatures
> *For anyone who handles contracts, legal documents, PDFs, or needs e-signature workflows.*

| # | Skill | Tier | One-Line Description | Use Case It Solves | API Keys / Accounts Required |
|---|---|---|---|---|---|
| 71 | [esign-automation](https://clawhub.ai/skills?q=esign-automation&nonSuspicious=true) 🔎 | ✅ 🆕 | Automated document signing via eSignGlobal — create, send, and track e-signature workflows through natural language. | Sending contracts for signature, tracking signing status, and managing document workflows without opening DocuSign. | eSignGlobal API Key |
| 72 | [pdf-toolkit](https://clawhub.ai/skills?q=pdf-toolkit&nonSuspicious=true) 🔎 | ✅ 🆕 | Merge, split, compress, watermark, and extract text from PDF files. | Handling all common PDF operations through chat instead of hunting for online tools or installing desktop software. | None (local tools) |
| 73 | [contract-review](https://clawhub.ai/skills?q=contract-review&nonSuspicious=true) 🔎 | ✅ 🆕 | AI-assisted contract analysis — surfaces key terms, obligations, deadlines, and red flags in legal documents. | Getting a plain-English summary of a contract's important terms before you sign, without paying a lawyer for routine reviews. | None |

---

## 🎨 Tier 13 — Creative, Design & Content
> *For designers, writers, content creators, and anyone who makes things.*

| # | Skill | Tier | One-Line Description | Use Case It Solves | API Keys / Accounts Required |
|---|---|---|---|---|---|
| 74 | [frontend-design](https://clawhub.ai/anthropics/frontend-design) 🔗 | ✅ | Forces the agent into a master-level design mindset — bold aesthetics, intentional typography, production-grade UI. | Breaking out of generic AI-generated interfaces into distinctive, client-ready frontend designs with real visual intent. | None |
| 75 | [image-generation](https://clawhub.ai/skills?q=image-generation&nonSuspicious=true) 🔎 | ✅ 🆕 | Generate images from text prompts using multiple AI providers (DALL-E, Stable Diffusion, Flux). | Creating hero images, social media graphics, product mockups, and illustrations from natural language descriptions. | AI image provider API Key |
| 76 | [video-generation](https://clawhub.ai/skills?q=video-generation&nonSuspicious=true) 🔎 | ✅ 🆕 | Generate short-form videos from text descriptions using AI video models (Kling, Runway, etc.). | Creating product demos, social media videos, and marketing content without video editing software. | Video provider API Key (varies) |
| 77 | [canva](https://clawhub.ai/skills?q=canva&nonSuspicious=true) 🔎 | ✅ 🆕 | Create and edit Canva designs via the Canva Connect API — templates, brand assets, and exports. | Generating branded marketing materials, social posts, and presentations without opening Canva's editor. | Canva Connect API Key |
| 78 | [presentation-maker](https://clawhub.ai/skills?q=presentation-maker&nonSuspicious=true) 🔎 | ✅ 🆕 | Generate slide decks from natural language — outlines, content, and formatting in one shot. | Creating a polished presentation for a meeting in minutes instead of hours in PowerPoint. | None or Google Slides OAuth |

---

## 🤖 Tier 14 — AI Self-Improvement & Agent Intelligence
> *Skills that make the agent itself smarter and more personalised over time.*

| # | Skill | Tier | One-Line Description | Use Case It Solves | API Keys / Accounts Required |
|---|---|---|---|---|---|
| 79 | [capability-evolver](https://clawhub.ai/autogame-17/capability-evolver) 🔗 | ⭐ | AI self-evolution engine that reviews session logs and autonomously improves the agent's behavior over time. | The agent gets measurably better at your specific tasks without you manually configuring anything. | None |
| 80 | [self-improving-agent](https://clawhub.ai/pskoett/self-improving-agent) 🔗 | ⭐ ✅ | Logs errors, learnings, and preferences into a persistent memory folder for continuous personalization. | Building an agent that remembers your preferences, avoids past mistakes, and adapts to your working style. | None (local memory) |
| 81 | [memory-hygiene](https://clawhub.ai/dylanbaker24/memory-hygiene) 🔗 | ✅ | Cleans and prunes stale, contradictory, or outdated entries from the agent's vector memory. | Preventing months of accumulated bad context from making the agent less accurate over time. | None |
| 82 | [model-usage](https://clawhub.ai/skills?q=model-usage&nonSuspicious=true) 🔎 | ✅ | Monitors and reports real-time API token consumption and cost across all connected AI providers. | Knowing exactly what you're spending on AI every day, and which tasks are eating the most tokens. | Connected AI provider API keys (read-only) |
| 83 | [add-top-openrouter-models](https://clawhub.ai/skills?q=add-top-openrouter-models&nonSuspicious=true) 🔎 | ✅ | Automatically syncs the best-performing OpenRouter models into your local OpenClaw config. | Always having access to the latest top models without manually editing config files each time rankings change. | `OPENROUTER_API_KEY` |
| 84 | [free-ride](https://clawhub.ai/shaivpidadi/free-ride) 🔗 | ⭐ 🆕 | Manages free AI models from OpenRouter for OpenClaw — access powerful models at zero cost. | Using top-tier AI models without paying for API access by routing through OpenRouter's free tier. | `OPENROUTER_API_KEY` (free) |

---

## 💼 Tier 15 — Small Business & Freelance
> *For founders, freelancers, marketers, and anyone running their own operation.*

| # | Skill | Tier | One-Line Description | Use Case It Solves | API Keys / Accounts Required |
|---|---|---|---|---|---|
| 85 | [vercel](https://clawhub.ai/TheSethRose/vercel) 🔗 | ✅ | Connects OpenClaw to the Vercel CLI for deploy, rollback, and debugging via conversational commands. | Deploying and managing web projects on Vercel entirely through chat — no terminal gymnastics required. | Vercel account + Vercel CLI |
| 86 | [agentdo](https://clawhub.ai/skills?q=agentdo&nonSuspicious=true) 🔎 | ✅ | Posts tasks to and picks up work from the AgentDo distributed AI task queue at agentdo.dev. | Offloading work to other AI agents asynchronously — useful when one agent needs to delegate without a direct channel. | AgentDo account (agentdo.dev) |
| 87 | [fast-io](https://clawhub.ai/skills?q=fast-io&nonSuspicious=true) 🔎 | ✅ 🆕 | Persistent file workspace with built-in search — shared between human and agent for collaborative document management. | Having a shared file system where both you and the agent can upload, search, and reference documents. | Fast.io account |
| 88 | [api-gateway](https://clawhub.ai/byungkyu/api-gateway) 🔗 | ⭐ 🆕 | API gateway for calling third-party APIs with managed auth — centralizes all external API connections. | Connecting to any third-party API without managing auth tokens and rate limits per-service. | Varies per connected API |

---

## 📊 Tier 16 — Data & Analysis
> *For analysts, researchers, operations people, and anyone making decisions from data.*

| # | Skill | Tier | One-Line Description | Use Case It Solves | API Keys / Accounts Required |
|---|---|---|---|---|---|
| 89 | [data-analyst](https://clawhub.ai/oyi77/data-analyst) 🔗 | ✅ | Covers SQL queries, spreadsheet analysis, and chart generation to produce decision-ready reports. | Turning "here's a CSV" into a clean visual summary or data-backed answer without a dedicated analyst. | None |
| 90 | [duckdb](https://clawhub.ai/camelsprout/duckdb) 🔗 | ✅ | Runs fast analytical queries on CSV, Parquet, and JSON files using the DuckDB CLI engine. | Analysing large local datasets with SQL-level power in seconds, without spinning up a database or Jupyter kernel. | DuckDB CLI (local install) |
| 91 | [csv-toolkit](https://clawhub.ai/faahim/csv-toolkit) 🔗 | ✅ | Wraps Miller, csvkit, and xsv for comprehensive, memory-safe text-data processing and filtering. | Filtering, reshaping, and statistically summarizing large CSV files without loading them into model context. | Miller, csvkit, xsv (local installs) |
| 92 | [hugging-face-datasets](https://clawhub.ai/hugging-face/datasets) 🔗 | ✅ | Manages dataset creation, versioning, and querying on Hugging Face using DuckDB as the backend. | ML teams versioning and exploring training datasets without a separate pipeline infrastructure. | Hugging Face API Token |
| 93 | [senior-data-scientist](https://clawhub.ai/alirezarezvani/senior-data-scientist) 🔗 | ✅ | Guides the full data science workflow from exploratory analysis through model selection and evaluation. | Structured expert-level data science reasoning — especially useful for teams without a dedicated data scientist. | None |
| 94 | [senior-data-engineer](https://clawhub.ai/alirezarezvani/senior-data-engineer) 🔗 | ✅ | Production-grade ETL/ELT pipeline guidance using Spark, Airflow, dbt, and Kafka best practices. | Designing robust, cost-aware data infrastructure with proper orchestration, lineage, and monitoring. | Optional cloud credentials, Kafka, Airflow |

---

## 💻 Tier 17 — Developer Workflow
> *For software engineers and technical builders.*

| # | Skill | Tier | One-Line Description | Use Case It Solves | API Keys / Accounts Required |
|---|---|---|---|---|---|
| 95 | [github](https://clawhub.ai/steipete/github) 🔗 | 🟢 🔵 ⭐ | Wraps the GitHub `gh` CLI to manage repos, issues, PRs, and branches through natural language. | Handling the full GitHub workflow — creating issues, reviewing PRs, managing branches — without leaving chat. | GitHub Personal Access Token |
| 96 | [coding-agent](https://clawhub.ai/steipete/coding-agent) 🔗 | 🟢 🔵 | Orchestrates Claude Code, OpenAI Codex, and other coding models through one unified skill interface. | Delegating coding tasks to specialised models without manually switching tools or environments. | Claude or OpenAI API Key |
| 97 | [cursor-agent](https://clawhub.ai/swiftlysingh/cursor-agent) 🔗 | ✅ | Full programmatic interface to the Cursor IDE CLI for agent-driven code editing and task delegation. | Letting OpenClaw interact with and delegate editing tasks directly inside Cursor. | Cursor IDE installed |
| 98 | [debug-pro](https://clawhub.ai/cmanfre7/debug-pro) 🔗 | ✅ | Structured multi-language debugging methodology guiding the agent through systematic issue isolation. | Eliminating unguided trial-and-error debugging with a reproducible, step-by-step approach across any language. | None |
| 99 | [test-runner](https://clawhub.ai/cmanfre7/test-runner) 🔗 | ✅ | Writes and executes tests across multiple languages — scaffolding, running, and interpreting results end-to-end. | Automating the full test-write-run-interpret cycle without manually invoking test frameworks in the terminal. | Local test toolchain (pytest, jest, etc.) |
| 100 | [buildlog](https://clawhub.ai/espetey/buildlog) 🔗 | ✅ | Records and exports coding sessions as structured, shareable logs with decisions and context preserved. | Generating session documentation for PR descriptions, retrospectives, or onboarding teammates. | None |
| 101 | [cc-godmode](https://clawhub.ai/cubetribe/cc-godmode) 🔗 | ✅ | Orchestrates multi-agent software projects by coordinating agents, tracking progress, and synthesizing results. | Managing large coding tasks too complex for a single agent pass through structured multi-agent delegation. | Claude or OpenAI API Key |
| 102 | [aetherlang-claude-code](https://clawhub.ai/skills?q=aetherlang-claude-code&nonSuspicious=true) 🔎 | ✅ | Executes AetherLang V3 AI workflows directly from within a Claude Code environment. | Running structured multi-step AI workflow pipelines without leaving the Claude Code shell. | AetherLang V3 runtime |
| 103 | [exa](https://clawhub.ai/fardeenxyz/exa) 🔗 | ✅ | Developer-focused web search via Exa pulling from GitHub repos, technical docs, and coding forums. | Finding accurate technical documentation, code examples, and API references that generic search buries. | `EXA_API_KEY` |
| 104 | [logseq](https://clawhub.ai/juanirm/logseq) 🔗 | ✅ | Connects to a local Logseq graph for reading, writing, and linking notes inside the agent's workflow. | Keeping a graph-based personal knowledge system in sync with the agent — similar to Obsidian but for Logseq users. | None (local vault) |

---

## 🔧 Tier 18 — Advanced Infrastructure & DevOps
> *Valuable for engineers and sysadmins, but carries elevated risk — test in a sandbox before live use.*

> ⚠️ These skills have shell-level access to your system. Always confirm actions before executing on live infrastructure.

| # | Skill | Tier | One-Line Description | Use Case It Solves | API Keys / Accounts Required |
|---|---|---|---|---|---|
| 105 | [docker-essentials](https://clawhub.ai/arnarsson/docker-essentials) 🔗 | ✅ | Builds, tags, runs, and manages Docker containers using production-ready workflows via natural language. | Eliminating Docker CLI syntax lookup and sequencing errors for common container management tasks. | Docker (local) + optional registry credentials |
| 106 | [nginx-config-creator](https://clawhub.ai/xieyuanqing/nginx-config-creator) 🔗 | ✅ | Generates production-ready Nginx and OpenResty reverse proxy configurations from plain-language descriptions. | Creating correct Nginx configs without hunting documentation every time a new service is deployed. | None (local Nginx install) |
| 107 | [hetzner](https://clawhub.ai/TheSethRose/hetzner) 🔗 | ✅ | Controls Hetzner Cloud VPS, firewalls, and networking via the `hcloud` CLI through natural language. | Managing budget VPS infrastructure and self-hosted services without the Hetzner dashboard. | Hetzner Cloud API Token |
| 108 | [aws-infra](https://clawhub.ai/bmdhodl/aws-infra) 🔗 | ✅ | Guides AWS infrastructure provisioning and management following established best-practice patterns. | Provisioning and managing AWS resources through guided, policy-compliant natural language operations. | AWS CLI + `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` |
| 109 | [k8-multicluster](https://clawhub.ai/rohitg00/k8-multicluster) 🔗 | ✅ | Manages multiple Kubernetes clusters with safe context switching across dev, staging, and production. | Coordinating multi-environment Kubernetes operations without manually managing kubeconfig context files. | `kubectl` + kubeconfig credentials |
| 110 | [cloudflare](https://clawhub.ai/skills?q=cloudflare&nonSuspicious=true) 🔎 | ✅ 🆕 | Manage Cloudflare DNS, Workers, Pages, and security settings via the API. | DNS management, edge function deployment, and CDN configuration without the Cloudflare dashboard. | Cloudflare API Token |

---

## 🔬 Tier 19 — Specialist & Expert-Only
> *High ceiling, narrow audience. Powerful in the right hands; risky without domain expertise.*

| # | Skill | Tier | One-Line Description | Use Case It Solves | API Keys / Accounts Required |
|---|---|---|---|---|---|
| 111 | [protocol-reverse-engineering](https://clawhub.ai/wshobson/protocol-reverse-engineering) 🔗 | ✅ | Turns OpenClaw into a network analyst — captures raw traffic, decodes binary protocols, generates Lua dissectors. | Security research, protocol documentation, or building interoperability layers for undocumented APIs. | None (local: Wireshark, tcpdump, Python) |
| 112 | [byterover](https://clawhub.ai/byteroverinc/byterover) 🔗 | ⭐ ✅ | High-volume multi-purpose task handler for parallel utility and development automation workflows. | Running diverse, concurrent automation tasks across utility and dev domains from a single skill entry point. | None / optional Byterover cloud account |
| 113 | [agent-audit](https://clawhub.ai/skills?q=agent-audit&nonSuspicious=true) 🔎 | ✅ | Audits your full AI agent setup for performance inefficiencies, cost exposure, and ROI signal. | Identifying wasteful API usage, underperforming skills, or cost-heavy operations before they accumulate. | None |
| 114 | [agent-card-signing-auditor](https://clawhub.ai/skills?q=agent-card-signing-auditor&nonSuspicious=true) 🔎 | ✅ | Audits Agent Card signing practices in A2A (Agent-to-Agent) protocol implementations for compliance. | Ensuring multi-agent systems follow secure A2A identity and signing standards — critical in regulated enterprise deployments. | None |
| 115 | [wacli](https://clawhub.ai/steipete/wacli) 🔗 | 🟢 🔵 ⭐ | Swiss-army CLI utility covering a wide range of agent automation and system utility tasks. | Power-user Swiss-army tool for diverse OS-level and automation tasks via a unified agent command layer. | None |

---

## ❌ What Was Filtered Out & Why

| Reason | Pattern Detected |
|---|---|
| VirusTotal flagged | Any skill with a "Suspicious" or "Malicious" ClawHub badge |
| Zero documentation | SKILL.md with empty instruction body or missing frontmatter fields |
| Zero community signal | `v1.0.0` + 0 stars + 0 downloads — no evidence of real use |
| ClawHavoc-era uploads | Skills submitted Jan 15–Feb 5, 2026 by new accounts with 50+ bulk uploads (attacker fingerprint) |
| Undeclared network calls | `curl`/`wget` calls to non-obvious endpoints not declared in the SKILL.md frontmatter |
| Prompt injection vectors | Skills that dynamically load external SKILL.md files at runtime |
| Credential capture patterns | Skills requesting API keys with no matching declared integration |
| Orphaned / abandoned | No updates in 12+ months + open security issues with no maintainer response |
| Crypto / finance / trade spam | 731 skills flagged by ClawSkills.sh as crypto/blockchain spam — excluded unless individually vetted |
| Duplicate / similar name | 1,040 skills flagged as near-duplicates — only the highest-quality version kept |
| Paid marketplace skills | Skills from ShopClawMart and similar paid marketplaces excluded unless independently verified on ClawHub |

---

## Quick Security Checklist — Run This Before Every Install

```
1. clawhub install skill-vetter            ← do this once, on first setup
2. skill-vetter <skill-name>               ← run before every new install
3. Visit the ClawHub link above            ← confirm VirusTotal badge = "Benign"
4. clawhub inspect <skill-name>            ← review declared env vars + binaries
5. Check: versions > 1  AND  stars > 50   ← or author = @steipete / core team
6. Read the SKILL.md manually              ← look for undeclared curl, base64, dynamic file loads
7. DevOps/Cloud/Infrastructure skills:    ← always test in a sandbox before any live environment
```

---

## 🔐 Security Must-Haves — What You Actually Can't Skip

### Install these on day one, before anything else

**`skill-vetter`** is non-negotiable. It checks for undeclared environment variable access, hidden network calls, and obfuscated shell commands. Every other skill you ever install should go through this first. 86,800 downloads for a reason.

**`prompt-guard`** is the one most people overlook until it's too late. The ClawHavoc attacker posted fake "update service" commands disguised as legitimate instructions in skill page comments — and hit 99 out of the top 100 most-downloaded skills. The moment your agent reads any external content — an email, a web page, a document — prompt-guard is what stops that content from hijacking it.

**`agentguard`** is your runtime safety net. It hooks into OpenClaw's `before_tool_call` and `after_tool_call` events to block dangerous actions like `rm -rf /`, fork bombs, and `curl | bash` before they execute. Think of it as a circuit breaker sitting between the agent and your machine.

### Install these once you have a few skills running

**`clawscan`** and **`skill-scanner`** serve different moments — clawscan is pre-install, skill-scanner catches things that only show up after a skill is trusted and running. One attacker alone had 314 skills published on ClawHub, all flagged as malicious, all covering apparently harmless use cases like crypto analytics and finance tracking — but every one instructed users to download and execute external code as part of the "setup" process. These two skills are your defence against that pattern.

**`claw-audit`** is the comprehensive security posture tool — scans all installed skills for malware, audits your full configuration, calculates a security score, and guides auto-fixing. Run it periodically.

**`agentgate`** is the one for anyone who connects their agent to anything sensitive — files, databases, personal data. It forces a human approval step before any write operation, so the agent can read freely but can't change or exfiltrate anything without you signing off.

### The other four — valuable but situational

| Skill | When it matters most |
|---|---|
| `agent-access-control` | Multiple people message your agent through a shared interface |
| `skills-audit` | Periodic review tool — run it monthly, not continuously |
| `config-guardian` | Running OpenClaw in a production or team environment |
| `agent-audit-trail` | Any situation where you need to prove what happened after the fact |

### The short version

> **`skill-vetter` + `prompt-guard` + `agentguard` = your minimum viable security stack.**
> Add `claw-audit` for periodic health checks. Add the rest as your skill count and risk surface grows.

---

## 📋 Registry Summary

| Tier | Category | Skill Count | Audience |
|---|---|---|---|
| 1 | Core Essentials | 10 | Everyone |
| 2 | Task Management & Productivity | 6 | Everyone |
| 3 | Communication & Messaging | 10 | Everyone |
| 4 | Search, Research & Learning | 9 | Students, writers, researchers |
| 5 | Security & Trust | 11 | Everyone (mandatory) |
| 6 | Finance, Payments & Accounting | 5 | Freelancers, business owners |
| 7 | Health, Fitness & Wellness | 4 | Health-conscious users |
| 8 | CRM, Sales & Business Operations | 5 | Sales teams, founders |
| 9 | Project Management & Collaboration | 5 | Teams, PMs, engineers |
| 10 | Home, Media & Lifestyle | 2 | Smart home users |
| 11 | Translation, Localization & Accessibility | 3 | Multilingual users |
| 12 | Documents, Legal & E-Signatures | 3 | Contract/document handlers |
| 13 | Creative, Design & Content | 5 | Creators, marketers |
| 14 | AI Self-Improvement | 6 | Power users |
| 15 | Small Business & Freelance | 4 | Founders, freelancers |
| 16 | Data & Analysis | 6 | Analysts, data teams |
| 17 | Developer Workflow | 10 | Software engineers |
| 18 | Advanced Infrastructure & DevOps | 6 | Engineers, sysadmins |
| 19 | Specialist & Expert-Only | 5 | Domain experts |
| | **TOTAL** | **115** | |

---

## 🔮 Skills Under Consideration (Not Yet Allowlisted)

> These skills are on the radar but need further vetting before being added to the allowlist. The Setup Guide Agent should NOT recommend these yet.

| Skill | Category | Why It's Pending |
|---|---|---|
| `browser-use` | Web Automation | Very popular (LinkedIn production use) but overlaps with `agent-browser`. Needs head-to-head comparison. |
| `stealth-browser` | Web Automation | Designed for anti-bot evasion — useful but raises ethical/ToS questions per-site. |
| `baidu-search` | Search | 45.2k downloads but primarily useful for Chinese-language users. Evaluate for internationalization tier. |
| `reddit` | Social | Reddit API access; needs evaluation post-Reddit API pricing changes. |
| `linkedin` | Social/CRM | High demand but LinkedIn aggressively blocks automation. Legal risk. |
| `stripe-dashboard` | Finance | Direct Stripe API access — powerful but high-risk if misconfigured. Needs security deep-dive. |
| `shopify` | E-commerce | Full store management — useful for e-commerce but needs trust tier evaluation. |
| `quickbooks` | Accounting | Enterprise accounting integration — high value but needs compliance review. |
| `calendly` | Scheduling | Meeting scheduling automation — overlaps with Google Calendar in `gog`. |
| `zoom` | Communication | Meeting management — useful but privacy/recording concerns need review. |
| `figma` | Design | Design file access — needs evaluation of Figma's API ToS for agent use. |
| `google-maps` | Location | Location search, directions, place details — useful for local business skills. |
| `spotify` | Media | Music control — overlaps with Sonos for some users, useful standalone. |
| `workout-tracker` | Health | Exercise logging — needs comparison with Apple Health skills. |
| `recipe-finder` | Lifestyle | Meal planning from ingredients — interesting but low download count. |
| `howtocook` | Lifestyle | 11.1k downloads on MCP registries — AI personal chef from recipe database. Needs SKILL.md quality check. |

---

## 📚 Sources & References

- [DataCamp — Best ClawHub Skills Guide](https://www.datacamp.com/blog/best-clawhub-skills) (March 2026)
- [VoltAgent/awesome-openclaw-skills](https://github.com/VoltAgent/awesome-openclaw-skills) — 40,722 stars, 5,400+ filtered skills
- [sundial-org/awesome-openclaw-skills](https://github.com/sundial-org/awesome-openclaw-skills) — 491 stars, 913 curated skills
- [ClawSkills.sh](https://clawskills.sh/) — 5,147 indexed, 30 categories, 2,917 contributors
- [Firecrawl — 16 Best OpenClaw Skills](https://www.firecrawl.dev/blog/openclaw-skills) (March 2026)
- [DoneClaw — 15 Best OpenClaw Skills](https://doneclaw.com/blog/best-openclaw-skills-clawhub/) (February 2026)
- [Felo AI — Best OpenClaw Skills 2026](https://felo.ai/blog/best-openclaw-skills-2026/) (March 2026)
- [OpenClaw Launch — Top ClawHub Skills List](https://openclawlaunch.com/guides/best-openclaw-skills)
- [Playbooks.com — openclaw/skills](https://playbooks.com/skills/openclaw/skills/) — individual skill analysis
- [OpenClaw Setup Guide (getopenclaw.ai)](https://www.getopenclaw.ai/blog/openclaw-skills-guide) — built-in skills reference
- [TryOpenClaw — CRM Integration Guide](https://www.tryopenclaw.ai/blog/openclaw-crm-integration/) — HubSpot, Salesforce, Pipedrive
- [Fast.io — Top OpenClaw Integrations for PMs](https://fast.io/resources/top-openclaw-integrations-product-managers/)
- [SlackClaw — Automated Slack Standup Summaries](https://www.slackclaw.ai/news/how-to-use-openclaw-skills-for-automated-slack-standup-summaries)
- [Shyft — MCP Servers by Industry](https://shyft.ai/blog/mcp-servers-by-industry) (March 2026)
- [eSignGlobal — esign-automation Skill](https://www.prnewswire.com/apac/news-releases/esignglobal-empowers-openclaw-with-automated-e-signatures-via-new-esign-automation-skill-302713102.html) (March 2026)

*Last audited: March 2026*
