---
title: "Getting Started"
source_url: "https://docs.openclaw.ai/start/getting-started"
section: "start"
---

# Getting Started

# Getting Started

Install OpenClaw, run onboarding, and chat with your AI assistant — all in
about 5 minutes. By the end you will have a running Gateway, configured auth,
and a working chat session.

## What you need

* **Node.js** — Node 24 recommended (Node 22.16+ also supported)
* **An API key** from a model provider (Anthropic, OpenAI, Google, etc.) — onboarding will prompt you

  Check your Node version with `node --version`.
  **Windows users:** both native Windows and WSL2 are supported. WSL2 is more
  stable and recommended for the full experience. See [Windows](/platforms/windows).
  Need to install Node? See [Node setup](/install/node).

## Quick setup

        ```bash}
        curl -fsSL https://openclaw.ai/install.sh | bash
        ```

        ```powershell}
        iwr -useb https://openclaw.ai/install.ps1 | iex
        ```

      Other install methods (Docker, Nix, npm): [Install](/install).

    ```bash}
    openclaw onboard --install-daemon
    ```

    The wizard walks you through choosing a model provider, setting an API key,
    and configuring the Gateway. It takes about 2 minutes.

    See [Onboarding (CLI)](/start/wizard) for the full reference.

    ```bash}
    openclaw gateway status
    ```

    You should see the Gateway listening on port 18789.

    ```bash}
    openclaw dashboard
    ```

    This opens the Control UI in your browser. If it loads, everything is working.

    Type a message in the Control UI chat and you should get an AI reply.

    Want to chat from your phone instead? The fastest channel to set up is
    [Telegram](/channels/telegram) (just a bot token). See [Channels](/channels)
    for all options.

## What to do next

    WhatsApp, Telegram, Discord, iMessage, and more.

    Control who can message your agent.

    Models, tools, sandbox, and advanced settings.

    Browser, exec, web search, skills, and plugins.

  If you run OpenClaw as a service account or want custom paths:

  * `OPENCLAW_HOME` — home directory for internal path resolution
  * `OPENCLAW_STATE_DIR` — override the state directory
  * `OPENCLAW_CONFIG_PATH` — override the config file path

  Full reference: [Environment variables](/help/environment).