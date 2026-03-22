# Getting Started

Get OpenClaw running in under 5 minutes.

## What You Need

- **Node.js** — Node 24 recommended; Node 22 LTS (22.16+) also supported
- **API key** — At least one provider API key (OpenAI, Anthropic, Google, etc.)

## Quick Setup (5 Steps)

### Step 1: Install OpenClaw

**macOS / Linux:**

```bash
curl -fsSL https://get.openclaw.ai | bash
```

**Windows (PowerShell):**

```powershell
irm https://get.openclaw.ai/win | iex
```

Alternatively, install via npm:

```bash
npm install -g openclaw@latest
```

### Step 2: Onboard and Install the Daemon

```bash
openclaw onboard --install-daemon
```

This interactive command will:
- Create your initial configuration file
- Ask for your provider API key
- Install the background daemon (launchd on macOS, systemd on Linux)
- Start the gateway process

### Step 3: Check Gateway Status

```bash
openclaw gateway status
```

Verify the gateway is running and all channels report healthy.

### Step 4: Open the Dashboard

```bash
openclaw dashboard
```

This opens the browser-based Control UI at `http://127.0.0.1:18789/`. From here you can monitor sessions, view logs, and manage channels.

### Step 5: Send Your First Message

Connect a channel (e.g., WhatsApp or Telegram) and send a message. The gateway will route it to the configured agent and return the response.

## What to Do Next

- **Connect channels** — Add WhatsApp, Telegram, Discord, or other channels to the gateway
- **Pairing and safety** — Set up device pairing for mobile channels and configure access controls
- **Configure the gateway** — Customize models, sessions, tools, and routing in your config file
- **Browse tools** — Explore the built-in tools and plugin ecosystem

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENCLAW_HOME` | Base directory for OpenClaw data and configuration (default: `~/.openclaw`) |
| `OPENCLAW_STATE_DIR` | Directory for runtime state files (sessions, locks, PID files) |
| `OPENCLAW_CONFIG_PATH` | Explicit path to the configuration file (overrides default location) |

These can be set in your shell profile or passed inline:

```bash
OPENCLAW_HOME=/opt/openclaw openclaw gateway start
```
