# Engineering Crossroad: Execution Plan & Delegation

I listened to the recording. You guys are hitting the exact right pivot point. You're moving from "what is the idea" to "how do we actually build this in the next 3 hours."

Your architecture vision is spot on:
**Input Layer (Agent):** Steered by a "Rulebook" document, not runtime web searches. It extracts intent, constraints, and hosting preferences.
**Output Layer (Generator):** Takes that intent and generates the final setup package (SOUL.md, openclaw.json, setup instructions, hardware reqs, API key links).

You also made a massive strategic decision: **Using the Google ADK (Agent Development Kit) instead of Vapi.** This is the right move for a Google-sponsored hackathon. It proves you can build natively on their stack.

Here is the exact mapping of what we build, who builds what, and the 3-hour checkpoint plan.

---

## The 3 Core Documents We Need to Prepare (The "Rulebook")

To make the ADK Agent smart without doing runtime searches, we need to feed it three static documents. I will generate these for you while you code.

1.  **The V1 Scope & Skill Map (The "80% Use Cases"):** A clean mapping of the top 3 workflows (Inbox, Briefing, Chat) to their exact OpenClaw skill slugs and required API keys. The agent uses this to recommend the right skills based on user intent.
2.  **The Setup & Hardware Constraints Matrix:** A logic tree that tells the agent what to output based on the user's technical level. (e.g., If user = non-technical, output = Mac Mini recommendation + simple Telegram config. If user = dev, output = VPS recommendation + complex Slack config).
3.  **The Output Template Spec:** The exact markdown templates for `SOUL.md`, `USER.md`, and the final `README.md` that the backend will use to generate the zip file.

---

## Task Delegation (The Next 2-3 Hours)

Here is who does what. We are working backwards from the demo.

### Pranav & Kaan: The Input Layer (Google ADK + Prompting)
*   **The Goal:** Get the Google ADK bi-directional voice agent running locally and talking to you.
*   **The Task:** Take the Google ADK example repo. Rip out their default prompt. Inject our "Concierge Rulebook" prompt.
*   **The Output:** The agent must be able to have a 2-minute conversation and output a structured JSON object at the end containing: `user_intent`, `selected_skills`, `hardware_preference`, `channel_preference`.
*   **Checkpoint (1 Hour):** You can talk to the ADK agent on your laptop and it doesn't crash.

### Zicheng: The Output Layer (FastAPI Backend)
*   **The Goal:** Turn JSON into a downloadable ZIP file.
*   **The Task:** Build a FastAPI endpoint that accepts the JSON payload from Pranav's ADK agent. Write a Python script that takes that JSON, injects the values into our Markdown templates (`SOUL.md`, `README.md`), zips them up, and returns a download link.
*   **The Output:** A working `/generate-config` endpoint.
*   **Checkpoint (1 Hour):** You can send a dummy JSON payload via Postman/cURL and get a ZIP file back containing properly formatted Markdown files.

### Travis: The Connective Tissue & UI (React Frontend)
*   **The Goal:** Make it look like a real product for the judges.
*   **The Task:** Build a simple React frontend. It needs a "Start Call" button that hooks into Pranav's ADK agent. It needs a "Processing" state while Zicheng's backend generates the files. It needs a "Download Setup Package" button at the end.
*   **The Output:** The visual face of the OpenClaw Concierge.
*   **Checkpoint (1 Hour):** The UI is scaffolded and the "Start Call" button successfully triggers the ADK agent.

---

## The 3-Hour Timeline

*   **Hour 1 (Independent Build):** Pranav gets ADK running. Zicheng builds the FastAPI zip generator. Travis scaffolds the React UI. (I will generate the 3 Rulebook documents during this hour).
*   **Hour 2 (Integration):** Pranav connects the ADK output to Zicheng's FastAPI endpoint. Travis connects the React UI to Pranav's ADK agent. Kaan refines the system prompt based on the first few test conversations.
*   **Hour 3 (The Polish):** End-to-end testing. Kaan clicks the button on the UI, talks to the agent, the call ends, the backend generates the files, and Kaan downloads the ZIP. If this works, you freeze the code.

---

## My Next Steps

While you guys start coding, I am going to generate the **3 Rulebook Documents** mentioned above. I will format them so Kaan and Pranav can literally copy-paste them into the ADK system prompt and Zicheng can use them as backend templates.

Does this delegation make sense? Give me a thumbs up and I will start generating the Rulebooks.



# The 'Art of the Possible' Skill Map: OpenClaw Concierge V2

This document serves as the core knowledge base for the OpenClaw Concierge, enabling it to intelligently map user needs to concrete OpenClaw capabilities and skills. It is designed to be used by:

*   **Model 1 (Gemini Live):** To guide the consultative conversation, suggest relevant use cases, and understand the implications of user requests.
*   **Model 2 (ADK Agent):** To extract structured `useCases` from the conversation that can be mapped to specific skills.
*   **Model 3 (Gemini 2.5 Pro Backend):** To accurately select and generate `clawhub install` commands for the final `setup.sh` script.

This map is not exhaustive but focuses on the 80% of use cases that provide the most value and are most reliably implemented in OpenClaw V1.

---

## Core Problem Areas & Mapped OpenClaw Capabilities

### 1. Email Management & Automation (Tier 1: "I've got you covered")

*   **User Problems:** Overwhelmed inbox, too much spam, missing important emails, slow to reply, want to automate routine email tasks.
*   **Concierge Guidance:** "I can set up your agent to help you achieve 'inbox zero,' categorize emails, draft replies, and even unsubscribe from newsletters automatically."
*   **Mapped Skill Categories:** `email`, `communication`
*   **Example Skill Slugs:** `clawemail`, `agent-mail`, `email-summariser`, `email-autoreply`, `custom-smtp-sender`
*   **Associated Setup:** Requires connecting to an email provider (Gmail, Outlook) via API keys (provided by user during OpenClaw setup).

### 2. Daily Briefings & Information Synthesis (Tier 1: "I've got you covered")

*   **User Problems:** Missing important updates, too many news sources, want a quick summary of their day, need to stay on top of tasks and calendar.
*   **Concierge Guidance:** "Your agent can send you a personalized morning briefing with your calendar, top tasks, weather, and key news headlines, delivered directly to your phone."
*   **Mapped Skill Categories:** `productivity`, `news`, `calendar`
*   **Example Skill Slugs:** `briefing`, `coordinate-meeting`, `brainz-tasks`, `tavily-search`, `rss-reader`, `weather-forecast`
*   **Associated Setup:** Requires read-only access to calendar (e.g., Google Calendar API), task manager (e.g., Linear API), and potentially an RSS feed or news API key.

### 3. Chat-Based Interaction & Control (Tier 1: "I've got you covered")

*   **User Problems:** Don't want to use the command line, want to interact with their AI from their phone, prefer natural language commands.
*   **Concierge Guidance:** "You can talk to your OpenClaw agent directly through WhatsApp or Telegram, making it easy to give commands and get updates from anywhere."
*   **Mapped Skill Categories:** `communication`, `messaging`
*   **Example Skill Slugs:** `whatsapp-connector`, `telegram-bot-api`, `discord-bot-kit`, `slack-integration`
*   **Associated Setup:** Requires setting up a bot on the chosen messaging platform and providing the API token.

### 4. Task & Project Management (Tier 1: "I've got you covered")

*   **User Problems:** Forgetting tasks, difficulty organizing projects, need to quickly add or check tasks on the go.
*   **Concierge Guidance:** "Your agent can help you manage your tasks and projects, allowing you to add new items, check deadlines, and get updates through simple commands."
*   **Mapped Skill Categories:** `productivity`, `tasks`
*   **Example Skill Slugs:** `todoist-integration`, `notion-connector`, `linear-mcp`, `trello-board`
*   **Associated Setup:** Requires API access to the chosen task management platform.

### 5. Web Research & Summarization (Tier 1: "I've got you covered")

*   **User Problems:** Too much information online, need quick summaries, want to monitor specific topics.
*   **Concierge Guidance:** "Your agent can perform web searches, summarize articles, and keep you updated on topics of interest."
*   **Mapped Skill Categories:** `web-browsing`, `information-retrieval`
*   **Example Skill Slugs:** `tavily-search`, `firecrawl-browser`, `web-summarizer`, `rss-reader`
*   **Associated Setup:** May require API keys for specific search engines or web scraping services.

---

## Tier 2: "I can set this up, but here's what you should know."

These are use cases that are achievable but require more user involvement or have specific considerations. The Concierge will transparently communicate these.

### 6. Social Media Management

*   **User Problems:** Need to post updates, manage multiple accounts, schedule content.
*   **Concierge Guidance:** "Your agent can help manage your social media presence, posting updates and scheduling content. This requires setting up developer access with platforms like Twitter or LinkedIn, and I'll include detailed instructions for that."
*   **Mapped Skill Categories:** `social-media`
*   **Example Skill Slugs:** `twitter-poster`, `linkedin-publisher`
*   **Associated Setup:** Requires creating developer apps and obtaining API keys from social media platforms.

### 7. GitHub Integration & Developer Tools

*   **User Problems:** Monitoring repos, automating PRs, checking build status.
*   **Concierge Guidance:** "For developers, your agent can integrate with GitHub to monitor repositories, run tests, or even help with pull requests. This will involve configuring GitHub API tokens, and I'll provide the steps."
*   **Mapped Skill Categories:** `developer-tools`, `git`
*   **Example Skill Slugs:** `github-mcp`, `git-cli-agent`
*   **Associated Setup:** Requires GitHub Personal Access Tokens with appropriate permissions.

### 8. Personal Finance Tracking

*   **User Problems:** Tracking expenses, querying spending habits, managing budgets.
*   **Concierge Guidance:** "Your agent can help you track personal finances, query spending, and manage budgets. This often involves connecting to financial APIs or using plain-text accounting tools, which I'll guide you through."
*   **Mapped Skill Categories:** `finance`
*   **Example Skill Slugs:** `hledger-agent`, `ynab-connector`
*   **Associated Setup:** Requires API access to financial services or setting up local accounting tools.

---

## Tier 3: "That's possible, but beyond what I can configure for you today."

These are advanced OpenClaw capabilities that are outside the V1 scope due to complexity, security implications, or high resource usage. The Concierge will acknowledge the possibility but recommend starting with simpler setups.

*   **Autonomous Coding & Server Management (e.g., Docker, SSH, NixOS):** "OpenClaw is incredibly powerful and can manage servers or write code, but these are advanced setups requiring careful sandboxing and security configurations. I recommend starting with a simpler agent, and your setup guide will include resources for exploring these capabilities later."
*   **Continuous Monitoring Loops (e.g., 24/7 web scraping):** "While OpenClaw can monitor things, continuous loops can consume significant resources and API credits. For now, I'll set up scheduled tasks, and you can explore continuous monitoring as you become more familiar with the platform."
*   **Local LLM Integration:** "OpenClaw can run with local LLMs, but this requires specific hardware and advanced configuration. I'll set you up with a cloud-based model for now, and your guide will point you to resources for local model integration."

---

## Skill Lookup Table Integration

The backend will use a Python dictionary-based lookup table, similar to the `skill_lookup_table.py` we discussed, to map the `useCases` extracted by the ADK agent to these verified skill slugs. This ensures that only known, reliable skills are recommended and installed. The `setup.sh` will then generate `clawhub install <skill-slug>` commands based on this mapping.


# Smart Markdown Templates: OpenClaw Concierge Backend Generator

These templates are designed to be used by the FastAPI backend (Model 3, powered by Gemini 2.5 Pro) to generate the final OpenClaw configuration files. They incorporate conditional logic based on the structured JSON output from the ADK agent (Model 2), ensuring a personalized and context-aware setup package.

## Input Data Structure (from ADK Agent JSON)

The backend will receive a JSON payload with the following structure (example, actual schema will be more detailed):

```json
{
  "user_profile": {
    "role": "restaurant owner",
    "technical_level": "beginner",
    "time_availability": "limited",
    "pain_points": ["managing reservations", "customer communication"]
  },
  "hardware_preference": "Mac Mini",
  "channel_preference": "WhatsApp",
  "selected_skills": [
    "whatsapp-connector",
    "briefing",
    "clawemail",
    "todoist-integration"
  ],
  "agent_persona": {
    "name": "Orion",
    "role": "personal assistant",
    "tone": "friendly and efficient",
    "goals": ["streamline daily tasks", "improve customer engagement"]
  },
  "advanced_features_requested": [
    "local_llm_integration"
  ]
}
```

---

## Template 1: `SOUL.md` (Agent Persona & Core Directives)

This template defines the agent's core identity, personality, and operational rules. It should be rich and reflect the `agent_persona` from the input.

```markdown
# Agent SOUL: {{agent_persona.name}}

## Core Identity

**Name:** {{agent_persona.name}}
**Role:** {{agent_persona.role}} for a {{user_profile.role}}
**Personality:** {{agent_persona.tone}}. Always helpful, proactive, and focused on user efficiency.

## Goals & Objectives

My primary goals are to:
{% for goal in agent_persona.goals %}
- {{goal}}
{% endfor %}

## Communication Style

- Be concise and direct, but always polite.
- Prioritize actionable information.
- Adapt language to the user's technical level.

## Constraints & Boundaries

- I operate within the permissions granted by the user.
- I will always confirm before executing sensitive actions.
- I will not engage in tasks outside my defined role without explicit instruction.

## Example Interactions

*   **User:** "What's on my plate today?"
    **Agent:** "Good morning! Today, you have a meeting at 10 AM, and your top task is to review the Q3 report. I've also summarized key emails for you."
*   **User:** "Can you draft a reply to this email?"
    **Agent:** "Certainly. What key points would you like to include in the reply?"
```

---

## Template 2: `USER.md` (User Preferences)

This template captures key user preferences that the OpenClaw agent should be aware of.

```markdown
# User Profile: {{user_profile.role}}

## Key Preferences

**Primary Communication Channel:** {{channel_preference}}
**Technical Comfort:** {{user_profile.technical_level | capitalize}}

## Daily Routine & Pain Points

**Role:** {{user_profile.role}}
**Time Availability:** {{user_profile.time_availability | capitalize}}
**Key Pain Points:**
{% for pain in user_profile.pain_points %}
- {{pain}}
{% endfor %}

## Agent Interaction Style

- Prefers direct and efficient communication.
- Values proactive assistance for routine tasks.
```

---

## Template 3: `AGENTS.md` (Operating Manual & Memory)

This template provides the agent with an operating manual and instructions on how to manage its memory and context.

```markdown
# Agent Operating Manual

## Context Management

- I maintain a short-term memory of recent interactions to ensure continuity.
- For long-term memory, I will store key facts and preferences in a structured format.

## Tool Usage

- I will select the most appropriate tool for the task at hand.
- I will always confirm tool execution with the user if the action is irreversible or sensitive.

## Self-Correction

- I will monitor my own performance and seek clarification if I encounter ambiguity.
- I will learn from user feedback to improve future interactions.
```

---

## Template 4: `IDENTITY.md` (Basic Agent Metadata)

Simple metadata for the agent.

```markdown
# Agent Identity

**Display Name:** {{agent_persona.name}}
**Version:** 1.0
**Created By:** OpenClaw Concierge
```

---

## Template 5: `setup.sh` (Skill Installation & Channel Configuration)

This is a Bash script that automates the installation of selected skills and configures the chosen communication channel. It includes conditional logic for different technical levels and hardware.

```bash
#!/bin/bash

echo "Starting OpenClaw Concierge Setup..."
echo "This script will install the necessary skills and configure your communication channel."

# --- Install OpenClaw if not present (Basic check) ---
if ! command -v clawhub &> /dev/null
then
    echo "OpenClaw not found. Installing now..."
    # Add OpenClaw installation steps here, e.g., curl -fsSL https://install.openclaw.ai | bash
    echo "Please follow the official OpenClaw installation guide if this fails: https://docs.openclaw.ai/start/getting-started"
    exit 1
fi

# --- Install Selected Skills ---
echo "\nInstalling selected OpenClaw skills..."
{% for skill in selected_skills %}
clawhub install {{skill}}
{% endfor %}

# --- Configure Communication Channel ---
echo "\nConfiguring {{channel_preference}} communication channel..."

{% if channel_preference == "WhatsApp" %}
# WhatsApp configuration requires a WhatsApp Business API account.
echo "For WhatsApp, you will need to set up the WhatsApp Business API. Follow these steps:"
echo "1. Register for a WhatsApp Business API account: [Link to WhatsApp Business API docs]"
echo "2. Obtain your API key and phone number ID."
echo "3. Edit your ~/.openclaw/openclaw.json file to include the WhatsApp connector configuration."
echo "   Example snippet for openclaw.json:"
echo "   ```json"
echo "   \"channels\": {\n     \"whatsapp\": {\n       \"enabled\": true,\n       \"api_key\": \"YOUR_WHATSAPP_API_KEY\",\n       \"phone_number_id\": \"YOUR_PHONE_NUMBER_ID\"\n     }\n   }"
echo "   ```"
{% elif channel_preference == "Telegram" %}
# Telegram configuration requires creating a bot via BotFather.
echo "For Telegram, you will need to create a bot via BotFather:"
echo "1. Open Telegram and search for @BotFather."
echo "2. Send /newbot and follow the instructions to create your bot."
echo "3. BotFather will give you an API Token. Keep it secure."
echo "4. Edit your ~/.openclaw/openclaw.json file to include the Telegram connector configuration."
echo "   Example snippet for openclaw.json:"
echo "   ```json"
echo "   \"channels\": {\n     \"telegram\": {\n       \"enabled\": true,\n       \"api_token\": \"YOUR_TELEGRAM_BOT_TOKEN\"\n     }\n   }"
echo "   ```"
{% else %}
echo "Configuration for {{channel_preference}} is not yet fully automated. Please refer to the OpenClaw documentation for manual setup: https://docs.openclaw.ai/gateway/configuration-reference"
{% endif %}

echo "\nSetup complete! Please review the README.md for next steps and security considerations."
```

---

## Template 6: `README.md` (Setup Instructions & Security Guidance)

This README provides the user with clear, step-by-step instructions and critical security advice, tailored to their technical level and hardware.

```markdown
# Your OpenClaw Concierge Setup Guide

Congratulations on setting up your personalized OpenClaw Concierge! This package contains all the necessary files to get your AI agent up and running.

## 1. What You Have Received

*   `SOUL.md`: Your agent's core personality and directives.
*   `USER.md`: Your personal preferences for the agent.
*   `AGENTS.md`: The agent's operating manual.
*   `IDENTITY.md`: Basic agent metadata.
*   `setup.sh`: A script to install recommended skills and configure your communication channel.
*   `README.md`: This guide!

## 2. Getting Started

### Step 2.1: Initial OpenClaw Setup (if not already done)

If you don't have OpenClaw installed, please follow the official guide:
[Official OpenClaw Installation Guide](https://docs.openclaw.ai/start/getting-started)

### Step 2.2: Place Your Files

Move the `SOUL.md`, `USER.md`, `AGENTS.md`, and `IDENTITY.md` files into your OpenClaw workspace directory (e.g., `~/.openclaw/agents/my_concierge/`).

### Step 2.3: Run the Setup Script

Open your terminal, navigate to where you saved this package, and run the `setup.sh` script:

```bash
bash setup.sh
```

This script will install the necessary OpenClaw skills and guide you through configuring your {{channel_preference}} channel.

### Step 2.4: Configure `openclaw.json`

The `setup.sh` script will provide instructions for editing your `~/.openclaw/openclaw.json` file to enable your {{channel_preference}} channel. This is where you will securely add any required API keys.

## 3. Hardware & Hosting Recommendations

{% if hardware_preference == "Mac Mini" %}
**Recommendation for Mac Mini:**
Given your preference for a Mac Mini, it's an excellent choice for running OpenClaw locally 24/7. Ensure it has sufficient RAM (16GB+) and storage. Keep it connected to power and a stable internet connection. You can use tools like `pmset` to prevent it from sleeping.
{% elif hardware_preference == "VPS" %}
**Recommendation for VPS (Virtual Private Server):**
For 24/7 uptime and remote access, a VPS is ideal. Choose a provider like DigitalOcean, AWS EC2, or Google Cloud Compute Engine. Ensure your VPS has at least 2 vCPUs and 4GB RAM. You will need to SSH into your VPS to install OpenClaw and manage your agent.
{% else %}
**Recommendation for Existing Device:**
Running OpenClaw on your existing device (e.g., laptop) is great for getting started. For 24/7 operation, consider a dedicated machine or a VPS in the future. Ensure your device is always on and connected to the internet for your agent to function continuously.
{% endif %}

## 4. Security & API Keys (CRITICAL!)

**YOUR API KEYS ARE YOUR RESPONSIBILITY.**

*   **NEVER share your API keys.**
*   **DO NOT store API keys directly in your agent's Markdown files.**
*   OpenClaw uses your `~/.openclaw/openclaw.json` file to securely manage API keys. The `setup.sh` script will guide you on where to add them.
*   Always review the permissions you grant to OpenClaw skills. Start with the minimum necessary and increase only if required.

## 5. Next Steps & Advanced Features

Your agent is now ready to assist you! Start by interacting with it via {{channel_preference}}.

{% if "local_llm_integration" in advanced_features_requested %}
**Exploring Local LLMs:** You mentioned interest in local LLM integration. This is an advanced setup. Refer to the OpenClaw documentation on local model providers:
[OpenClaw Local LLM Guide](https://docs.openclaw.ai/models/local-llms)
{% endif %}

For more advanced configurations and to explore the full power of OpenClaw, visit the official documentation:
[OpenClaw Documentation](https://docs.openclaw.ai/)

Enjoy your new OpenClaw Concierge!
```
---

**Generated by OpenClaw Concierge (V1 Hackathon Build)**
```

---

This set of templates provides a robust foundation for the backend generator. The conditional logic allows for a highly personalized output based on the user's input, addressing the need for flexibility and transparency. The `setup.sh` and `README.md` are particularly critical for guiding the user through the installation process and managing expectations regarding advanced features and security. The backend will need to implement a templating engine (like Jinja2 in Python) to process these Markdown files. 
