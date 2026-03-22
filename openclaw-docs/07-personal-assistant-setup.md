# Personal Assistant Setup

Set up OpenClaw as your personal AI assistant, accessible through your everyday messaging apps.

## Safety Warnings

- **Your phone number is your identity.** Anyone who has your WhatsApp number can message your bot if DM access is set to `open`.
- **Always use an allowlist** for personal assistant setups to prevent unauthorized access.
- **Sandbox mode is strongly recommended** to prevent agents from accessing sensitive files or running dangerous commands.
- **API costs apply.** Every message routed through the gateway costs money based on your provider's pricing.
- **Do not expose the gateway port to the public internet** without authentication.

## Prerequisites

- OpenClaw installed and running (`openclaw gateway status` shows healthy)
- At least one provider API key configured
- A phone or device for the messaging channel you want to use
- For WhatsApp: a Meta Business account with WhatsApp Business API access

## Two-Phone Setup

For WhatsApp personal assistant use, the recommended setup uses two phones or numbers:

```
[Your Personal Phone]          [OpenClaw Server]
        |                            |
  Send message via               Gateway receives
  WhatsApp to bot number ------>  via WhatsApp API
        |                            |
  Receive reply  <-------------- Agent processes
  on personal phone                and responds
```

- **Phone 1 (personal):** Your everyday phone where you send and receive messages
- **Phone 2 (bot):** The number registered with WhatsApp Business API, connected to OpenClaw

Alternatively, use Telegram or Discord where no second phone is needed.

## 5-Minute Quick Start

### Step 1: Configure Your Assistant

```yaml
# ~/.openclaw/config.yaml
models:
  - provider: anthropic
    api_key: ${{ env.ANTHROPIC_API_KEY }}
    model: claude-sonnet-4-20250514

channels:
  whatsapp:
    enabled: true
    phone_id: ${{ env.WA_PHONE_ID }}
    token: ${{ env.WA_TOKEN }}
    verify_token: ${{ env.WA_VERIFY_TOKEN }}

access:
  dm:
    mode: allowlist
    allowlist:
      - "+1234567890"   # Your personal phone number

sessions:
  mode: per_sender
  ttl: 24h
  max_history: 100
  system_prompt: |
    You are my personal AI assistant. You help me with:
    - Answering questions and research
    - Writing and editing text
    - Code help and debugging
    - Daily planning and reminders
    Be concise but thorough. Use casual, friendly tone.
```

### Step 2: Set Environment Variables

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
export WA_PHONE_ID="1234567890"
export WA_TOKEN="EAAx..."
export WA_VERIFY_TOKEN="my-secret-verify-token"
```

### Step 3: Start the Gateway

```bash
openclaw gateway restart
openclaw gateway status
```

### Step 4: Send a Test Message

Open WhatsApp on your personal phone and send a message to the bot's number. You should receive a response within a few seconds.

### Step 5: Verify in Dashboard

```bash
openclaw dashboard
```

Check that the session appears and messages are flowing correctly.

## Workspace Setup (AGENTS)

For a personal assistant that can work with files and code, set up workspaces:

```yaml
sandbox:
  enabled: true
  mode: workspace
  workspace_root: ~/openclaw-assistant
  per_sender: false         # Single workspace for personal use

agents:
  - name: assistant
    model: claude-sonnet-4-20250514
    workspace: ~/openclaw-assistant/main
    tools:
      - file_read
      - file_write
      - shell_exec
      - web_search
    system_prompt: |
      You are my personal assistant with access to my workspace.
      You can read and write files, run commands, and search the web.
```

## Assistant Config

Fine-tune the assistant's behavior:

```yaml
sessions:
  system_prompt: |
    You are my personal AI assistant named Claw.

    ## Personality
    - Friendly and casual, but precise when needed
    - Proactive: suggest related tasks or improvements
    - Remember context from earlier in the conversation

    ## Capabilities
    - Answer questions on any topic
    - Help with writing, editing, and proofreading
    - Debug code and suggest improvements
    - Create and manage to-do lists
    - Set reminders (via cron integration)

    ## Preferences
    - Keep responses concise unless asked for detail
    - Use bullet points for lists
    - Include code blocks with syntax highlighting
    - When uncertain, say so rather than guessing
```

## Sessions and Memory

Configure session persistence for a continuous conversation experience:

```yaml
sessions:
  mode: per_sender
  ttl: 168h              # 7 days - long memory window
  max_history: 500        # Keep more history for context
  persistence: sqlite
  storage_path: ~/.openclaw/assistant-sessions.db

  # Summarize old messages to save context window
  summarize:
    enabled: true
    after: 50             # Summarize after 50 messages
    model: gpt-4o-mini    # Use cheaper model for summarization
```

## Heartbeats

Monitor the assistant's availability:

```yaml
heartbeat:
  enabled: true
  interval: 120s
  timeout: 15s
  on_failure: restart_channel
  alert:
    webhook: ${{ env.ALERT_WEBHOOK }}
    message: "Personal assistant is down! Channel {{ channel }} failed heartbeat."
```

## Media In/Out

Handle images, audio, and documents:

```yaml
media:
  inbound:
    enabled: true
    max_size: 25MB
    allowed_types:
      - image/*
      - audio/*
      - application/pdf
      - text/*
    storage: ~/.openclaw/media/inbound

  outbound:
    enabled: true
    max_size: 10MB
    allowed_types:
      - image/png
      - image/jpeg
      - application/pdf
      - text/*
    storage: ~/.openclaw/media/outbound

  processing:
    ocr: true             # Extract text from images
    transcribe: true      # Transcribe audio messages
    thumbnails: true      # Generate thumbnails for images
```

## Operations Checklist

Before going live with your personal assistant:

- [ ] API keys are set via environment variables (not in config file)
- [ ] DM access is set to `allowlist` with only your number(s)
- [ ] Session TTL is appropriate (not too short, not infinite)
- [ ] Sandbox is enabled if agent has file/shell access
- [ ] Heartbeat is configured for uptime monitoring
- [ ] `openclaw config validate` passes
- [ ] `openclaw doctor` shows no issues
- [ ] Test message sent and response received
- [ ] Dashboard accessible and showing correct session data
- [ ] Backup of config file created
- [ ] Daemon installed for auto-restart (`openclaw daemon status`)

## Next Steps

- **Add more channels** — Connect Telegram, Discord, or iMessage for multi-platform access
- **Install plugins** — Add tools like GitHub, calendar, or weather integrations
- **Set up cron jobs** — Schedule daily summaries, reminders, or recurring tasks
- **Configure multi-agent routing** — Route different types of requests to specialized agents
- **Enable media processing** — Let your assistant handle images, audio, and documents
- **Set up relay push** — Get push notifications on your phone when the assistant needs attention
