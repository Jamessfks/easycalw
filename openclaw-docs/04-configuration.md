# Configuration Guide

OpenClaw is configured through a YAML file (default: `~/.openclaw/config.yaml`). This guide covers common configuration tasks and patterns.

## Minimal Config

The absolute minimum configuration requires just a model provider:

```yaml
models:
  - provider: openai
    api_key: sk-...
```

Everything else uses sensible defaults.

## Editing the Config

There are four ways to edit your configuration:

### 1. Direct File Edit

Edit the YAML file directly:

```bash
$EDITOR ~/.openclaw/config.yaml
```

### 2. CLI Config Commands

Use the CLI to get and set values:

```bash
openclaw config set models[0].api_key sk-...
openclaw config get models[0].provider
```

### 3. Dashboard UI

Open the Control UI and use the visual config editor:

```bash
openclaw dashboard
```

### 4. Config RPC

Apply configuration changes programmatically via the RPC interface (see Config RPC section below).

## Strict Validation

OpenClaw validates the configuration on load. If the config is invalid, the gateway will refuse to start and print detailed error messages pointing to the exact field and line number.

```bash
# Validate without starting
openclaw config validate
```

## Common Tasks

### Adding Channels

Add messaging channels under the `channels` key:

```yaml
channels:
  whatsapp:
    enabled: true
    phone_id: "1234567890"
    token: "EAAx..."
    verify_token: "my-verify-token"

  telegram:
    enabled: true
    bot_token: "123456:ABC-DEF..."

  discord:
    enabled: true
    bot_token: "MTIz..."
    application_id: "1234567890"
```

### Configuring Models

Set up one or more model providers:

```yaml
models:
  - provider: openai
    api_key: sk-...
    model: gpt-4o

  - provider: anthropic
    api_key: sk-ant-...
    model: claude-sonnet-4-20250514

  - provider: google
    api_key: AIza...
    model: gemini-2.5-pro
```

### DM Access Control

Control who can send direct messages to the bot:

```yaml
access:
  dm:
    mode: allowlist    # allowlist, denylist, or open
    allowlist:
      - "+1234567890"
      - "user@telegram"
```

### Group Mention Gating

Configure how the bot responds in group chats:

```yaml
access:
  groups:
    require_mention: true     # Bot only responds when @mentioned
    mention_prefix: "@bot"    # Custom mention trigger
    allowed_groups:
      - "group-id-1"
      - "group-id-2"
```

### Health Monitoring

Enable health checks and monitoring:

```yaml
health:
  enabled: true
  port: 18790
  path: /health
  interval: 30s
  checks:
    - provider_connectivity
    - channel_status
    - memory_usage
```

### Sessions

Configure session behavior:

```yaml
sessions:
  mode: per_sender          # per_sender, per_channel, or global
  ttl: 24h                  # Session expiry time
  max_history: 100          # Max messages per session
  persistence: sqlite       # sqlite, redis, or memory
  storage_path: ~/.openclaw/sessions.db
```

### Sandboxing

Isolate agent execution:

```yaml
sandbox:
  enabled: true
  mode: workspace           # workspace, container, or none
  workspace_root: ~/.openclaw/workspaces
  per_sender: true          # Each sender gets their own workspace
  allowed_paths:
    - /tmp/openclaw
  denied_commands:
    - rm -rf /
    - shutdown
```

### Relay Push

Configure push relay for mobile channel bridges:

```yaml
relay:
  push:
    enabled: true
    service: apns            # apns or fcm
    key_path: ~/.openclaw/apns-key.p8
    team_id: "ABCDE12345"
    bundle_id: "ai.openclaw.node"
```

### Heartbeat

Set up periodic heartbeat checks:

```yaml
heartbeat:
  enabled: true
  interval: 60s
  timeout: 10s
  on_failure: restart_channel   # restart_channel, alert, or ignore
  alert:
    webhook: https://hooks.slack.com/...
```

### Cron Jobs

Schedule recurring tasks:

```yaml
cron:
  - name: daily_summary
    schedule: "0 9 * * *"        # 9 AM daily
    action: send_message
    channel: telegram
    target: "@admin"
    message: "Daily summary: {{ stats }}"

  - name: cleanup
    schedule: "0 0 * * 0"       # Weekly Sunday midnight
    action: run_command
    command: "openclaw sessions prune --older-than 7d"
```

### Webhooks and Hooks

Configure event webhooks:

```yaml
hooks:
  on_message:
    - url: https://example.com/webhook
      method: POST
      headers:
        Authorization: "Bearer {{ env.WEBHOOK_TOKEN }}"

  on_error:
    - url: https://example.com/errors
      method: POST

  on_session_start:
    - url: https://example.com/sessions
      method: POST
```

### Multi-Agent Routing

Route messages to different agents based on rules:

```yaml
agents:
  - name: code_agent
    model: gpt-4o
    match:
      channels: [discord]
      groups: ["dev-team"]

  - name: support_agent
    model: claude-sonnet-4-20250514
    match:
      channels: [whatsapp, telegram]
      keywords: ["help", "support", "issue"]

  - name: default_agent
    model: gpt-4o-mini
    match:
      fallback: true
```

### $include — Splitting Config Files

Split large configs into multiple files using `$include`:

```yaml
models:
  $include: models.yaml

channels:
  $include: channels.yaml

agents:
  $include: agents.yaml
```

Each included file contains just the value for that key:

```yaml
# models.yaml
- provider: openai
  api_key: sk-...
  model: gpt-4o
```

## Config Hot Reload

OpenClaw supports hot-reloading configuration changes without restarting the gateway.

### Reload Modes

| Mode | Description |
|------|-------------|
| `auto` | Watch config file for changes and reload automatically |
| `signal` | Reload on SIGHUP signal |
| `manual` | Reload only via CLI or RPC |
| `off` | No hot reload; requires gateway restart |

```yaml
gateway:
  reload: auto              # auto, signal, manual, or off
```

### Hot-Apply vs Restart

Not all changes can be hot-applied. Some require a gateway restart.

| Setting | Hot-Apply | Requires Restart |
|---------|-----------|-----------------|
| Model API keys | Yes | No |
| Model selection | Yes | No |
| Access control lists | Yes | No |
| Session TTL | Yes | No |
| Channel add/remove | No | Yes |
| Sandbox mode | No | Yes |
| Listen port | No | Yes |
| Daemon settings | No | Yes |
| Plugin load/unload | No | Yes |

When a change requires restart, the gateway logs a warning and continues with the old config for those fields.

## Config RPC

Apply configuration changes at runtime via the RPC interface.

### config.apply

Replace the entire configuration:

```bash
openclaw config apply --file new-config.yaml
```

Or via RPC:

```json
{
  "method": "config.apply",
  "params": {
    "config": { "models": [...], "channels": {...} }
  }
}
```

### config.patch

Apply a partial update (JSON Merge Patch):

```bash
openclaw config patch '{"models": [{"provider": "openai", "api_key": "sk-new-key"}]}'
```

Or via RPC:

```json
{
  "method": "config.patch",
  "params": {
    "patch": {
      "access": { "dm": { "mode": "open" } }
    }
  }
}
```

## Environment Variables

### Env Files

OpenClaw loads environment variables from `.env` files:

```yaml
env_file:
  - .env                    # Always loaded
  - .env.local              # Local overrides (gitignored)
  - .env.production         # Environment-specific
```

Search order (first match wins):
1. `OPENCLAW_HOME/.env`
2. Current working directory `.env`
3. Explicitly listed env files

### Shell Environment Import

Import specific environment variables from the shell:

```yaml
env:
  import:
    - OPENAI_API_KEY
    - ANTHROPIC_API_KEY
    - DATABASE_URL
```

### Environment Variable Substitution

Use `${{ env.VAR_NAME }}` syntax in config values:

```yaml
models:
  - provider: openai
    api_key: ${{ env.OPENAI_API_KEY }}

channels:
  telegram:
    bot_token: ${{ env.TELEGRAM_BOT_TOKEN }}

hooks:
  on_message:
    - url: ${{ env.WEBHOOK_URL }}
      headers:
        Authorization: "Bearer ${{ env.WEBHOOK_TOKEN }}"
```

### Secret References

For sensitive values, use secret references that resolve at runtime:

```yaml
models:
  - provider: openai
    api_key: ${{ secret.openai_key }}

secrets:
  backend: keychain          # keychain, vault, aws-ssm, or env
  keychain:
    service: openclaw
  vault:
    address: https://vault.example.com
    path: secret/data/openclaw
```

Supported secret backends:

| Backend | Description |
|---------|-------------|
| `keychain` | macOS Keychain / Linux Secret Service |
| `vault` | HashiCorp Vault |
| `aws-ssm` | AWS Systems Manager Parameter Store |
| `env` | Environment variables (fallback) |
