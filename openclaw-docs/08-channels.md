# Chat Channels

OpenClaw supports 22+ messaging platforms as chat channels. Each channel connects to the gateway and routes messages to your configured agents.

## Supported Channels

| Channel | Description | Setup Complexity |
|---------|-------------|-----------------|
| **WhatsApp** | WhatsApp Business API via Meta Cloud API | Medium |
| **WhatsApp Web** | WhatsApp Web bridge (no Business API needed) | Easy |
| **Telegram** | Telegram Bot API | Easy |
| **Discord** | Discord bot with slash commands and message intents | Easy |
| **iMessage** | Apple iMessage via paired macOS device or iOS node | Medium |
| **Signal** | Signal Messenger via signal-cli bridge | Medium |
| **Slack** | Slack workspace bot | Medium |
| **Matrix** | Matrix/Element protocol | Medium |
| **IRC** | Internet Relay Chat | Easy |
| **XMPP** | Jabber/XMPP protocol | Medium |
| **Facebook Messenger** | Meta Messenger platform | Medium |
| **Instagram** | Instagram Direct Messages via Meta API | Medium |
| **LINE** | LINE Messaging API | Medium |
| **WeChat** | WeChat Official Account or Mini Program | Hard |
| **Viber** | Viber Bot API | Easy |
| **Teams** | Microsoft Teams bot | Medium |
| **Google Chat** | Google Workspace Chat | Medium |
| **RCS** | Rich Communication Services | Hard |
| **SMS** | SMS via Twilio, Vonage, or similar providers | Medium |
| **Email** | IMAP/SMTP email integration | Medium |
| **Web Chat** | Embeddable web widget | Easy |
| **REST API** | Direct HTTP API for custom integrations | Easy |

## Channel Architecture

Each channel runs as an independent connection within the gateway process:

```
[WhatsApp] ──┐
[Telegram] ──┤
[Discord]  ──┼──> [Gateway] ──> [Agent Router] ──> [Model Provider]
[iMessage] ──┤
[Web Chat] ──┘
```

Channels can be enabled/disabled independently, and the gateway gracefully handles channel failures without affecting other channels.

## Common Channel Configuration

All channels share these common settings:

```yaml
channels:
  <channel_name>:
    enabled: true/false       # Enable or disable this channel
    model: "model-override"   # Optional: override the default model for this channel
    system_prompt: "..."      # Optional: channel-specific system prompt
    max_tokens: 4096          # Optional: channel-specific token limit
```

## Quick Setup: Most Popular Channels

### Telegram (Easiest)

1. Message @BotFather on Telegram to create a bot
2. Copy the bot token
3. Add to config:

```yaml
channels:
  telegram:
    enabled: true
    bot_token: ${{ env.TELEGRAM_BOT_TOKEN }}
```

### Discord

1. Create an application at https://discord.com/developers
2. Create a bot and copy the token
3. Enable MESSAGE CONTENT intent
4. Add to config:

```yaml
channels:
  discord:
    enabled: true
    bot_token: ${{ env.DISCORD_BOT_TOKEN }}
    application_id: ${{ env.DISCORD_APP_ID }}
```

### WhatsApp Business API

1. Create a Meta Business account
2. Set up WhatsApp Business API in Meta Developer portal
3. Get phone ID, token, and set verify token
4. Configure webhook URL pointing to your gateway
5. Add to config:

```yaml
channels:
  whatsapp:
    enabled: true
    phone_id: ${{ env.WA_PHONE_ID }}
    token: ${{ env.WA_TOKEN }}
    verify_token: ${{ env.WA_VERIFY_TOKEN }}
```

### Web Chat Widget

No external accounts needed:

```yaml
channels:
  web:
    enabled: true
    cors_origins:
      - "https://yoursite.com"
    auth: api_key
    api_key: ${{ env.WEBCHAT_API_KEY }}
```

Embed in your website:

```html
<script src="http://127.0.0.1:18789/widget.js"></script>
```

## Channel Management CLI

```bash
# List all channels and their status
openclaw channels list

# Check a specific channel
openclaw channel status whatsapp

# Restart a channel
openclaw channel restart telegram

# Test a channel connection
openclaw channel test discord
```

## Further Reading

Each channel has its own detailed setup guide in the full documentation at https://docs.openclaw.ai/channels.
