# Configuration Examples

Copy-paste ready configuration examples for common OpenClaw setups.

## Absolute Minimum

The smallest valid configuration:

```yaml
models:
  - provider: openai
    api_key: sk-your-key-here
```

## Recommended Starter

A good starting point for most users:

```yaml
models:
  - provider: openai
    api_key: ${{ env.OPENAI_API_KEY }}
    model: gpt-4o

channels:
  whatsapp:
    enabled: true
    phone_id: ${{ env.WA_PHONE_ID }}
    token: ${{ env.WA_TOKEN }}
    verify_token: ${{ env.WA_VERIFY_TOKEN }}

sessions:
  mode: per_sender
  ttl: 24h
  max_history: 50

access:
  dm:
    mode: open

gateway:
  reload: auto
  port: 18789
```

## Expanded Example with All Options

A comprehensive configuration showing all available options:

```yaml
# Gateway settings
gateway:
  port: 18789
  host: 127.0.0.1
  reload: auto
  log_level: info
  log_format: json
  pid_file: ~/.openclaw/gateway.pid
  max_connections: 1000
  request_timeout: 120s
  graceful_shutdown: 30s

# Model providers
models:
  - provider: openai
    api_key: ${{ env.OPENAI_API_KEY }}
    model: gpt-4o
    temperature: 0.7
    max_tokens: 4096
    base_url: https://api.openai.com/v1
    organization: org-xxx
    timeout: 60s

  - provider: anthropic
    api_key: ${{ env.ANTHROPIC_API_KEY }}
    model: claude-sonnet-4-20250514
    max_tokens: 8192
    timeout: 90s

  - provider: google
    api_key: ${{ env.GOOGLE_API_KEY }}
    model: gemini-2.5-pro

# Chat channels
channels:
  whatsapp:
    enabled: true
    phone_id: ${{ env.WA_PHONE_ID }}
    token: ${{ env.WA_TOKEN }}
    verify_token: ${{ env.WA_VERIFY_TOKEN }}
    business_account_id: ${{ env.WA_BUSINESS_ID }}

  telegram:
    enabled: true
    bot_token: ${{ env.TELEGRAM_BOT_TOKEN }}
    webhook_url: https://example.com/telegram/webhook
    allowed_updates: [message, callback_query]

  discord:
    enabled: true
    bot_token: ${{ env.DISCORD_BOT_TOKEN }}
    application_id: ${{ env.DISCORD_APP_ID }}
    intents: [GUILDS, GUILD_MESSAGES, DIRECT_MESSAGES, MESSAGE_CONTENT]

  imessage:
    enabled: true
    node_id: ${{ env.IMESSAGE_NODE_ID }}

# Access control
access:
  dm:
    mode: allowlist
    allowlist:
      - "+1234567890"
      - "user123@telegram"
  groups:
    require_mention: true
    mention_prefix: "@bot"
    allowed_groups:
      - "group-id-1"

# Sessions
sessions:
  mode: per_sender
  ttl: 24h
  max_history: 100
  persistence: sqlite
  storage_path: ~/.openclaw/sessions.db
  system_prompt: |
    You are a helpful assistant. Be concise and accurate.

# Sandbox
sandbox:
  enabled: true
  mode: workspace
  workspace_root: ~/.openclaw/workspaces
  per_sender: true
  allowed_paths:
    - /tmp/openclaw
  denied_commands:
    - rm -rf /

# Multi-agent routing
agents:
  - name: code_agent
    model: gpt-4o
    system_prompt: "You are a coding assistant."
    match:
      channels: [discord]
      keywords: ["code", "debug", "fix"]

  - name: default_agent
    model: gpt-4o-mini
    match:
      fallback: true

# Health monitoring
health:
  enabled: true
  port: 18790
  path: /health
  interval: 30s

# Heartbeat
heartbeat:
  enabled: true
  interval: 60s
  timeout: 10s
  on_failure: restart_channel

# Cron jobs
cron:
  - name: daily_summary
    schedule: "0 9 * * *"
    action: send_message
    channel: telegram
    target: "@admin"
    message: "Daily stats: {{ stats }}"

# Webhooks
hooks:
  on_message:
    - url: ${{ env.WEBHOOK_URL }}
      method: POST

  on_error:
    - url: ${{ env.ERROR_WEBHOOK_URL }}
      method: POST

# Relay push
relay:
  push:
    enabled: true
    service: apns
    key_path: ~/.openclaw/apns-key.p8
    team_id: ${{ env.APNS_TEAM_ID }}
    bundle_id: ai.openclaw.node

# Environment
env_file:
  - .env
  - .env.local

env:
  import:
    - PATH
    - HOME

# Secrets
secrets:
  backend: keychain
  keychain:
    service: openclaw

# Tools
tools:
  allow:
    - file_read
    - file_write
    - shell_exec
    - web_search
  deny:
    - system_shutdown
  profiles:
    safe:
      allow: [file_read, web_search]
      deny: [shell_exec, file_write]

# Plugins
plugins:
  - name: github
    enabled: true
    config:
      token: ${{ env.GITHUB_TOKEN }}
```

## Common Patterns

### Multi-Platform Setup

Connect WhatsApp, Telegram, and Discord simultaneously:

```yaml
models:
  - provider: openai
    api_key: ${{ env.OPENAI_API_KEY }}
    model: gpt-4o

channels:
  whatsapp:
    enabled: true
    phone_id: ${{ env.WA_PHONE_ID }}
    token: ${{ env.WA_TOKEN }}
    verify_token: ${{ env.WA_VERIFY_TOKEN }}

  telegram:
    enabled: true
    bot_token: ${{ env.TELEGRAM_BOT_TOKEN }}

  discord:
    enabled: true
    bot_token: ${{ env.DISCORD_BOT_TOKEN }}
    application_id: ${{ env.DISCORD_APP_ID }}

sessions:
  mode: per_sender
  ttl: 12h
```

### Secure DM Mode

Lock down to specific users only:

```yaml
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
      - "+1234567890"
      - "+0987654321"
  groups:
    require_mention: true
    allowed_groups: []

sessions:
  mode: per_sender
  ttl: 1h
  max_history: 20
```

### OAuth Failover

Primary provider with automatic failover:

```yaml
models:
  - provider: openai
    api_key: ${{ env.OPENAI_API_KEY }}
    model: gpt-4o
    priority: 1
    failover:
      max_retries: 2
      backoff: exponential

  - provider: anthropic
    api_key: ${{ env.ANTHROPIC_API_KEY }}
    model: claude-sonnet-4-20250514
    priority: 2
    failover:
      max_retries: 2

  - provider: google
    api_key: ${{ env.GOOGLE_API_KEY }}
    model: gemini-2.5-pro
    priority: 3
```

### Anthropic Setup-Token + MiniMax Fallback

Use Anthropic as primary with MiniMax as fallback:

```yaml
models:
  - provider: anthropic
    api_key: ${{ env.ANTHROPIC_API_KEY }}
    model: claude-sonnet-4-20250514
    priority: 1
    setup_token: ${{ env.ANTHROPIC_SETUP_TOKEN }}

  - provider: minimax
    api_key: ${{ env.MINIMAX_API_KEY }}
    group_id: ${{ env.MINIMAX_GROUP_ID }}
    model: abab6.5-chat
    priority: 2
```

### Work Bot (Restricted)

A locked-down bot for workplace use:

```yaml
models:
  - provider: openai
    api_key: ${{ env.OPENAI_API_KEY }}
    model: gpt-4o

channels:
  discord:
    enabled: true
    bot_token: ${{ env.DISCORD_BOT_TOKEN }}
    application_id: ${{ env.DISCORD_APP_ID }}

access:
  dm:
    mode: denylist
    denylist: []
  groups:
    require_mention: true
    allowed_groups:
      - "work-general"
      - "work-engineering"

sessions:
  mode: per_sender
  ttl: 8h
  max_history: 50
  system_prompt: |
    You are a workplace assistant. Only discuss work-related topics.
    Do not engage with personal requests or off-topic conversations.

tools:
  allow:
    - web_search
    - file_read
  deny:
    - shell_exec
    - file_write

sandbox:
  enabled: true
  mode: workspace
  per_sender: true
```

### Local Models Only

Use locally-hosted models (no external API calls):

```yaml
models:
  - provider: ollama
    base_url: http://localhost:11434
    model: llama3:70b
    timeout: 180s

  - provider: openai
    base_url: http://localhost:1234/v1
    api_key: lm-studio
    model: local-model

channels:
  telegram:
    enabled: true
    bot_token: ${{ env.TELEGRAM_BOT_TOKEN }}

sessions:
  mode: per_sender
  ttl: 4h

gateway:
  port: 18789
  host: 127.0.0.1
```

## Tips

- **Start minimal** — Begin with the absolute minimum config and add options as needed
- **Use env vars** — Never put API keys directly in config files; use `${{ env.VAR }}` or `${{ secret.name }}`
- **Use `$include`** — Split large configs into smaller files for maintainability
- **Validate first** — Run `openclaw config validate` before restarting the gateway
- **Hot reload** — Set `gateway.reload: auto` to apply changes without downtime
- **Test access control** — Always test DM and group access settings before going live
- **Monitor health** — Enable health checks and heartbeats for production deployments
