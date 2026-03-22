# OpenClaw Overview

OpenClaw is a self-hosted gateway that bridges messaging platforms with AI coding agents. It runs as a single Gateway process that manages sessions, routing, and channel connections.

## Supported Messaging Platforms

- WhatsApp
- Telegram
- Discord
- iMessage
- And many more (22+ channels)

## Core Features

- **Multi-channel support** — Connect multiple messaging platforms simultaneously through a single gateway
- **Plugin extensibility** — Extend functionality with tools, skills, and plugins
- **Agent isolation** — Workspace-based routing keeps agent sessions separate and secure
- **Media handling** — Process images, audio, video, and documents across channels
- **Control UI** — Browser-based dashboard for monitoring and management
- **Mobile node pairing** — iOS and Android node pairing for mobile channel access

## Architecture

OpenClaw runs as a single Gateway process. The default configuration uses a bundled Pi binary in RPC mode with per-sender sessions. The gateway handles:

- Session management (per-sender or per-channel)
- Message routing between channels and agents
- Channel connection lifecycle
- Plugin and tool orchestration

## Quick Start

```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

The dashboard is available at `http://127.0.0.1:18789/` after setup.

## System Requirements

- **Node.js**: Node 24 recommended (Node 22 LTS 22.16+ also supported)
- **Provider API key**: At least one AI provider API key (e.g., OpenAI, Anthropic, Google)

## Documentation Coverage

The full documentation at https://docs.openclaw.ai/ spans 400+ pages covering:

| Section | Pages |
|---------|-------|
| Automation | 9 |
| Chat Channels | 28 |
| CLI Reference | 54 |
| Concepts | 30 |
| Installation | 23 |
| Providers | 42 |
| Tools & Skills | 25 |
| Platforms | 22 |
| Reference | 18 |

Full docs index available at https://docs.openclaw.ai/llms.txt
