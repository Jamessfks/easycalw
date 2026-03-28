# Vapi Knowledge Base Setup for EasyClaw

## Overview
Instead of stuffing use case examples into the system prompt (wastes tokens, kills latency), upload them as knowledge base documents that the agent queries only when needed.

## Step 1: Upload Knowledge Files

Split content into focused documents under 300KB each:

```bash
VAPI_KEY="your-private-key"

# Upload use case examples
curl -X POST 'https://api.vapi.ai/file' \
  -H "Authorization: Bearer $VAPI_KEY" \
  --form 'file=@"kb/use-cases-business.md"'

# Upload capabilities overview
curl -X POST 'https://api.vapi.ai/file' \
  -H "Authorization: Bearer $VAPI_KEY" \
  --form 'file=@"kb/openclaw-capabilities.md"'

# Upload industry-specific knowledge
curl -X POST 'https://api.vapi.ai/file' \
  -H "Authorization: Bearer $VAPI_KEY" \
  --form 'file=@"kb/industries.md"'
```

Save the returned file IDs.

## Step 2: Create Query Tool

```bash
curl -X POST 'https://api.vapi.ai/tool/' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $VAPI_KEY" \
  -d '{
    "type": "query",
    "function": { "name": "knowledge-search" },
    "knowledgeBases": [{
        "provider": "google",
        "name": "openclaw-use-cases",
        "description": "Contains real OpenClaw use case examples across industries including law, healthcare, real estate, e-commerce, marketing, finance, education, and personal productivity. Search this when the user mentions their industry or asks what OpenClaw can do.",
        "fileIds": ["FILE_ID_1", "FILE_ID_2", "FILE_ID_3"]
    }]
}'
```

Save the returned tool ID.

## Step 3: Attach Tool to Assistant

```bash
curl -X PATCH "https://api.vapi.ai/assistant/a53bb710-dbba-4c5c-9952-f8442b912d2f" \
  -H "Authorization: Bearer $VAPI_KEY" \
  -d '{
    "model": {
        "toolIds": ["TOOL_ID"]
    }
}'
```

## Step 4: Knowledge Base Files to Create

### kb/use-cases-business.md
Extract the 10 business examples from the current system prompt and format as:
```
## Law & Legal
One law firm set up an OpenClaw voice agent to screen potential clients, collect case details, and draft summary memos in their CRM.

## Real Estate  
An independent broker uses voice notes via Telegram. OpenClaw transcribes, extracts client details, updates Follow Up Boss, and drafts follow-up emails.

[...etc for each industry]
```

### kb/openclaw-capabilities.md
Short summary of what OpenClaw supports:
- Channels: Telegram, WhatsApp, Discord, iMessage, Slack, Signal
- Hardware: Mac Mini, VPS, Docker, Cloud
- Skills: 150+ on ClawHub (email, calendar, web search, browser automation, etc.)
- Autonomy levels: notify, draft for approval, fully autonomous

### kb/industries.md
One paragraph per industry on common pain points and how OpenClaw typically helps. Drawn from our domain_knowledge_final/ files.

## Why This Matters
- System prompt goes from ~4,500 tokens → ~450 tokens
- Latency drops ~75% on every turn
- Use cases only loaded when relevant (token-efficient)
- Easy to update KB without changing the prompt
