# Frequently Asked Questions

The full FAQ is available at https://docs.openclaw.ai/help/faq.

## Key Topics Covered

### Runtime Diagnostics

- Gateway won't start or crashes on boot
- High memory or CPU usage
- Slow response times
- Log interpretation and debugging
- Running `openclaw doctor` for automated diagnostics
- Common error messages and their solutions

### Model Setup

- Configuring API keys for different providers
- Switching between models
- Model failover and priority configuration
- Token limits and cost management
- Using local models (Ollama, LM Studio)
- Testing model connectivity

### Channel Configuration

- Setting up WhatsApp, Telegram, Discord, and other channels
- Webhook configuration and troubleshooting
- Channel-specific message format limitations
- Media handling per channel
- Multi-channel message routing
- Channel reconnection and retry behavior

### OAuth and API Keys

- Where to obtain API keys for each provider
- OAuth flow setup for services like Slack and Google
- Rotating API keys without downtime
- Secret management best practices
- Environment variable configuration

### Session Management

- Session persistence options (SQLite, Redis, memory)
- Session TTL and expiry behavior
- Clearing or resetting sessions
- Per-sender vs per-channel session modes
- Session export and backup
- Memory and context window management

### Multi-Agent Routing

- Setting up multiple agents with different models
- Routing rules based on channel, keywords, or sender
- Fallback agent configuration
- Agent-specific tool and permission profiles
- Workspace isolation between agents

### Deployment Troubleshooting

- Docker container issues
- Firewall and port configuration
- Running behind a reverse proxy (nginx, Caddy)
- SSL/TLS certificate setup
- DNS and webhook URL configuration
- Cloud platform-specific issues (AWS, GCP, Azure, Fly.io)
- Daemon management (systemd, launchd)
- Auto-restart and crash recovery
