---
Source: https://medium.com/@soloprenerd/i-bought-a-mac-mini-just-for-openclaw-fe2b5c0e665a
Title: "I Bought a Mac Mini Just for OpenClaw. Here's the Setup — And Why My 'Free' API Wasn't Actually Free."
Author: Soloprenerd
Date: 2026-03-19
Type: reference
---

A non-technical solopreneur's honest setup diary: getting OpenClaw running on Apple Silicon, the command-line spells that actually work, and the rate-limit trap nobody warns you about.

## Why a Separate Machine?

Hunted down the most affordable Mac mini M4 and dedicated it entirely to OpenClaw and AI experiments. No day-to-day work. No personal accounts. Purely an AI sandbox.

Reasoning: If an experiment goes sideways, can wipe the entire machine. Registered a fresh Apple ID for complete isolation. All work contained in two directories: ~/ai-workspace/ for projects and ~/openclaw/ for config.

Rule: Master local operations first before connecting external services (Notion, GitHub, cloud storage).

## The Setup Sequence

1. **Install Xcode Command Line Tools:** `xcode-select --install`
2. **Install Homebrew:** Standard install script, don't skip adding brew to PATH
3. **Install Node.js via nvm:** `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash` then `nvm install --lts`
4. **Install OpenClaw:** `npm install -g openclaw` — verify with `openclaw --version`
5. **Run Setup Wizard:** `openclaw onboard` — chose local gateway, Kimi (Moonshot) as model provider

Key config files generated:
- SOUL.md — AI's core personality and values
- USER.md — Profile about you and what you're building
- AGENTS.md / TOOLS.md / MEMORY.md — Working instructions and persistent memory

## The Kimi Rate Limit Trap

Chose Kimi (Moonshot) for budget reasons. Immediately hit "rate limit exceeded" despite zero usage. New accounts are severely rate-limited to prevent bulk exploitation. Fix: topped up account with $2, restarted gateway with `openclaw gateway restart`.

## Security Rules

- **Total Account Isolation** — Brand-new Apple ID, iCloud syncing off, API keys never in cloud
- **Strictly Defined Sandbox** — Agent can only read/write within ~/ai-workspace/ and ~/openclaw/
- **No External Connections Yet** — No Notion, GitHub, or cloud drives until local capabilities fully understood
- **Sanitized Backups Only** — Template config with API keys replaced by placeholders

## Essential Commands

```
openclaw status / openclaw gateway status
openclaw gateway restart  # MVP command — after any config change
openclaw logs --follow
openclaw channels add
openclaw chat --once "message"
openclaw chat  # full interactive session
```

Written February 2026 based on OpenClaw v2.17.
