# OpenClaw Documentation Index

Total: 347 documents across 20 sections
Source: https://docs.openclaw.ai/ (scraped 2026-03-21)

## _codelabs/ (2 docs)

| File | Title | Description |
|------|-------|-------------|
| _codelabs/level3-adk-bidi-streaming.md | level3-adk-bidi-streaming | Building a Biometric Neural Sync application using Google ADK with Gemini Live A |
| _codelabs/level4-multi-agent-a2a.md | level4-multi-agent-a2a | Building a multi-agent system combining bi-directional streaming, Agent-to-Agent |

## _root/ (10 docs)

| File | Title | Description |
|------|-------|-------------|
| _root/auth-credential-semantics.md | Auth Credential Semantics | This document defines the canonical credential eligibility and resolution semant |
| _root/ci.md | CI Pipeline | The CI runs on every push to `main` and every pull request. It uses smart scopin |
| _root/date-time.md | Date and Time | OpenClaw defaults to **host-local time for transport timestamps** and **user tim |
| _root/index.md | OpenClaw | > *"EXFOLIATE! EXFOLIATE!"* — A space lobster, probably |
| _root/logging.md | Logging | OpenClaw logs in two places: |
| _root/network.md | Network | This hub links the core docs for how OpenClaw connects, pairs, and secures |
| _root/pi-dev.md | Pi Development Workflow | This guide summarizes a sane workflow for working on the pi integration in OpenC |
| _root/pi.md | Pi Integration Architecture | This document describes how OpenClaw integrates with [pi-coding-agent](https://g |
| _root/prose.md | OpenProse | OpenProse is a portable, markdown-first workflow format for orchestrating AI ses |
| _root/vps.md | Linux Server | Run the OpenClaw Gateway on any Linux server or cloud VPS. This page helps you |

## automation/ (9 docs)

| File | Title | Description |
|------|-------|-------------|
| automation/auth-monitoring.md | Auth Monitoring | OpenClaw exposes OAuth expiry health via `openclaw models status`. Use that for |
| automation/cron-jobs.md | Cron Jobs | > **Cron vs Heartbeat?** See [Cron vs Heartbeat](/automation/cron-vs-heartbeat)  |
| automation/cron-vs-heartbeat.md | Cron vs Heartbeat | Both heartbeats and cron jobs let you run tasks on a schedule. This guide helps  |
| automation/gmail-pubsub.md | Gmail PubSub | Goal: Gmail watch -> Pub/Sub push -> `gog gmail watch serve` -> OpenClaw webhook |
| automation/hooks.md | Hooks | Hooks provide an extensible event-driven system for automating actions in respon |
| automation/poll.md | Polls | openclaw message poll --channel telegram --target 123456789 \ |
| automation/standing-orders.md | Standing Orders | Standing orders grant your agent **permanent operating authority** for defined p |
| automation/troubleshooting.md | Automation Troubleshooting | Use this page for scheduler and delivery issues (`cron` + `heartbeat`). |
| automation/webhook.md | Webhooks | Gateway can expose a small HTTP webhook endpoint for external triggers. |

## channels/ (29 docs)

| File | Title | Description |
|------|-------|-------------|
| channels/bluebubbles.md | BlueBubbles | Status: bundled plugin that talks to the BlueBubbles macOS server over HTTP. **R |
| channels/broadcast-groups.md | Broadcast Groups | Broadcast Groups enable multiple agents to process and respond to the same messa |
| channels/channel-routing.md | Channel Routing | OpenClaw routes replies **back to the channel where a message came from**. The |
| channels/discord.md | Discord | Status: ready for DMs and guild channels via the official Discord gateway. |
| channels/feishu.md | Feishu | Feishu (Lark) is a team chat platform used by companies for messaging and collab |
| channels/googlechat.md | Google Chat | Status: ready for DMs + spaces via Google Chat API webhooks (HTTP only). |
| channels/group-messages.md | Group Messages | Goal: let Clawd sit in WhatsApp groups, wake up only when pinged, and keep that  |
| channels/groups.md | Groups | OpenClaw treats group chats consistently across surfaces: WhatsApp, Telegram, Di |
| channels/imessage.md | iMessage | For new iMessage deployments, use BlueBubbles. |
| channels/index.md | Chat Channels | OpenClaw can talk to you on any chat app you already use. Each channel connects  |
| channels/irc.md | IRC | Use IRC when you want OpenClaw in classic channels (`#room`) and direct messages |
| channels/line.md | LINE | LINE connects to OpenClaw via the LINE Messaging API. The plugin runs as a webho |
| channels/location.md | Channel Location Parsing | OpenClaw normalizes shared locations from chat channels into: |
| channels/matrix.md | Matrix | Matrix is the Matrix channel plugin for OpenClaw. |
| channels/mattermost.md | Mattermost | Status: supported via plugin (bot token + WebSocket events). Channels, groups, a |
| channels/msteams.md | Microsoft Teams | > "Abandon all hope, ye who enter here." |
| channels/nextcloud-talk.md | Nextcloud Talk | Status: supported via plugin (webhook bot). Direct messages, rooms, reactions, a |
| channels/nostr.md | Nostr | Nostr is a decentralized protocol for social networking. This channel enables Op |
| channels/pairing.md | Pairing | “Pairing” is OpenClaw’s explicit **owner approval** step. |
| channels/signal.md | Signal | Status: external CLI integration. Gateway talks to `signal-cli` over HTTP JSON-R |
| channels/slack.md | Slack | Status: production-ready for DMs + channels via Slack app integrations. Default  |
| channels/synology-chat.md | Synology Chat | Status: supported via plugin as a direct-message channel using Synology Chat web |
| channels/telegram.md | Telegram | Status: production-ready for bot DMs + groups via grammY. Long polling is the de |
| channels/tlon.md | Tlon | Tlon is a decentralized messenger built on Urbit. OpenClaw connects to your Urbi |
| channels/troubleshooting.md | Channel Troubleshooting | Use this page when a channel connects but behavior is wrong. |
| channels/twitch.md | Twitch | Twitch chat support via IRC connection. OpenClaw connects as a Twitch user (bot  |
| channels/whatsapp.md | WhatsApp | Status: production-ready via WhatsApp Web (Baileys). Gateway owns linked session |
| channels/zalo.md | Zalo | Status: experimental. DMs are supported. The [Capabilities](#capabilities) secti |
| channels/zalouser.md | Zalo Personal | Status: experimental. This integration automates a **personal Zalo account** via |

## cli/ (47 docs)

| File | Title | Description |
|------|-------|-------------|
| cli/acp.md | acp | Run the [Agent Client Protocol (ACP)](https://agentclientprotocol.com/) bridge t |
| cli/agent.md | agent | Run an agent turn via the Gateway (use `--local` for embedded). |
| cli/agents.md | agents | Manage isolated agents (workspaces + auth + routing). |
| cli/approvals.md | approvals | Manage exec approvals for the **local host**, **gateway host**, or a **node host |
| cli/backup.md | backup | Create a local backup archive for OpenClaw state, config, credentials, sessions, |
| cli/browser.md | browser | Manage OpenClaw’s browser control server and run browser actions (tabs, snapshot |
| cli/channels.md | channels | Manage chat channel accounts and their runtime status on the Gateway. |
| cli/clawbot.md | clawbot | Legacy alias namespace kept for backwards compatibility. |
| cli/completion.md | completion | Generate shell completion scripts and optionally install them into your shell pr |
| cli/config.md | config | Config helpers for non-interactive edits in `openclaw.json`: get/set/unset/valid |
| cli/configure.md | configure | Interactive prompt to set up credentials, devices, and agent defaults. |
| cli/cron.md | cron | Manage cron jobs for the Gateway scheduler. |
| cli/daemon.md | daemon | Legacy alias for Gateway service management commands. |
| cli/dashboard.md | dashboard | Open the Control UI using your current auth. |
| cli/devices.md | devices | Manage device pairing requests and device-scoped tokens. |
| cli/directory.md | directory | Directory lookups for channels that support it (contacts/peers, groups, and “me” |
| cli/dns.md | dns | DNS helpers for wide-area discovery (Tailscale + CoreDNS). Currently focused on  |
| cli/docs.md | docs | Search the live docs index. |
| cli/doctor.md | doctor | Health checks + quick fixes for the gateway and channels. |
| cli/gateway.md | gateway | The Gateway is OpenClaw’s WebSocket server (channels, nodes, sessions, hooks). |
| cli/health.md | health | Fetch health from the running Gateway. |
| cli/hooks.md | hooks | Manage agent hooks (event-driven automations for commands like `/new`, `/reset`, |
| cli/index.md | CLI Reference | This page describes the current CLI behavior. If commands change, update this do |
| cli/logs.md | logs | Tail Gateway file logs over RPC (works in remote mode). |
| cli/memory.md | memory | Manage semantic memory indexing and search. |
| cli/message.md | message | Single outbound command for sending messages and channel actions |
| cli/models.md | models | Model discovery, scanning, and configuration (default model, fallbacks, auth pro |
| cli/node.md | node | Run a **headless node host** that connects to the Gateway WebSocket and exposes |
| cli/nodes.md | nodes | Manage paired nodes (devices) and invoke node capabilities. |
| cli/onboard.md | onboard | Interactive onboarding for local or remote Gateway setup. |
| cli/pairing.md | pairing | Approve or inspect DM pairing requests (for channels that support pairing). |
| cli/plugins.md | plugins | Manage Gateway plugins/extensions and compatible bundles. |
| cli/qr.md | qr | Generate an iOS pairing QR and setup code from your current Gateway configuratio |
| cli/reset.md | reset | Reset local config/state (keeps the CLI installed). |
| cli/sandbox.md | Sandbox CLI | Manage sandbox runtimes for isolated agent execution. |
| cli/secrets.md | secrets | Use `openclaw secrets` to manage SecretRefs and keep the active runtime snapshot |
| cli/security.md | security | Security tools (audit + optional fixes). |
| cli/sessions.md | sessions | List stored conversation sessions. |
| cli/setup.md | setup | Initialize `~/.openclaw/openclaw.json` and the agent workspace. |
| cli/skills.md | skills | Inspect skills (bundled + workspace + managed overrides) and see what’s eligible |
| cli/status.md | status | Diagnostics for channels + sessions. |
| cli/system.md | system | System-level helpers for the Gateway: enqueue system events, control heartbeats, |
| cli/tui.md | tui | Open the terminal UI connected to the Gateway. |
| cli/uninstall.md | uninstall | Uninstall the gateway service + local data (CLI remains). |
| cli/update.md | update | Safely update OpenClaw and switch between stable/beta/dev channels. |
| cli/voicecall.md | voicecall | `voicecall` is a plugin-provided command. It only appears if the voice-call plug |
| cli/webhooks.md | webhooks | Webhook helpers and integrations (Gmail Pub/Sub, webhook helpers). |

## concepts/ (29 docs)

| File | Title | Description |
|------|-------|-------------|
| concepts/agent-loop.md | Agent Loop | An agentic loop is the full “real” run of an agent: intake → context assembly →  |
| concepts/agent-workspace.md | Agent Workspace | The workspace is the agent's home. It is the only working directory used for |
| concepts/agent.md | Agent Runtime | OpenClaw runs a single embedded agent runtime. |
| concepts/architecture.md | Gateway Architecture | Baileys, Telegram via grammY, Slack, Discord, Signal, iMessage, WebChat). |
| concepts/compaction.md | Compaction | Every model has a **context window** (max tokens it can see). Long-running chats |
| concepts/context-engine.md | Context Engine | A **context engine** controls how OpenClaw builds model context for each run. |
| concepts/context.md | Context | “Context” is **everything OpenClaw sends to the model for a run**. It is bounded |
| concepts/delegate-architecture.md | Delegate Architecture | Goal: run OpenClaw as a **named delegate** — an agent with its own identity that |
| concepts/features.md | Features | WhatsApp, Telegram, Discord, and iMessage with a single Gateway. |
| concepts/markdown-formatting.md | Markdown Formatting | OpenClaw formats outbound Markdown by converting it into a shared intermediate |
| concepts/memory.md | Memory | OpenClaw memory is **plain Markdown in the agent workspace**. The files are the |
| concepts/messages.md | Messages | This page ties together how OpenClaw handles inbound messages, sessions, queuein |
| concepts/model-failover.md | Model Failover | OpenClaw handles failures in two stages: |
| concepts/model-providers.md | Model Providers | This page covers **LLM/model providers** (not chat channels like WhatsApp/Telegr |
| concepts/models.md | Models CLI | See [/concepts/model-failover](/concepts/model-failover) for auth profile |
| concepts/multi-agent.md | Multi-Agent Routing | Goal: multiple *isolated* agents (separate workspace + `agentDir` + sessions), p |
| concepts/oauth.md | OAuth | OpenClaw supports “subscription auth” via OAuth for providers that offer it (not |
| concepts/presence.md | Presence | OpenClaw “presence” is a lightweight, best‑effort view of: |
| concepts/queue.md | Command Queue | We serialize inbound auto-reply runs (all channels) through a tiny in-process qu |
| concepts/retry.md | Retry Policy | * Telegram min delay: 400 ms |
| concepts/session-pruning.md | Session Pruning | Session pruning trims **old tool results** from the in-memory context right befo |
| concepts/session-tool.md | Session Tools | Goal: small, hard-to-misuse tool set so agents can list sessions, fetch history, |
| concepts/session.md | Session Management | OpenClaw treats **one direct-chat session per agent** as primary. Direct chats c |
| concepts/streaming.md | Streaming and Chunking | OpenClaw has two separate streaming layers: |
| concepts/system-prompt.md | System Prompt | OpenClaw builds a custom system prompt for every agent run. The prompt is **Open |
| concepts/timezone.md | Timezones | OpenClaw standardizes timestamps so the model sees a **single reference time**. |
| concepts/typebox.md | TypeBox | Last updated: 2026-01-10 |
| concepts/typing-indicators.md | Typing Indicators | Typing indicators are sent to the chat channel while a run is active. Use |
| concepts/usage-tracking.md | Usage Tracking | Usage is hidden if no matching OAuth/API credentials exist. |

## debug/ (1 docs)

| File | Title | Description |
|------|-------|-------------|
| debug/node-issue.md | Node + tsx Crash | Running OpenClaw via Node with `tsx` fails at startup with: |

## diagnostics/ (1 docs)

| File | Title | Description |
|------|-------|-------------|
| diagnostics/flags.md | Diagnostics Flags | Diagnostics flags let you enable targeted debug logs without turning on verbose  |

## gateway/ (34 docs)

| File | Title | Description |
|------|-------|-------------|
| gateway/authentication.md | Authentication | OpenClaw supports OAuth and API keys for model providers. For always-on gateway |
| gateway/background-process.md | Background Exec and Process Tool | OpenClaw runs shell commands through the `exec` tool and keeps long‑running task |
| gateway/bonjour.md | Bonjour Discovery | OpenClaw uses Bonjour (mDNS / DNS‑SD) as a **LAN‑only convenience** to discover |
| gateway/bridge-protocol.md | Bridge Protocol | The Bridge protocol is a **legacy** node transport (TCP JSONL). New node clients |
| gateway/cli-backends.md | CLI Backends | OpenClaw can run **local AI CLIs** as a **text-only fallback** when API provider |
| gateway/configuration-examples.md | Configuration Examples | Examples below are aligned with the current config schema. For the exhaustive re |
| gateway/configuration-reference.md | Configuration Reference | Every field available in `~/.openclaw/openclaw.json`. For a task-oriented overvi |
| gateway/configuration.md | Configuration | OpenClaw reads an optional <Tooltip>**JSON5**</Tooltip> config from `~/.openclaw |
| gateway/discovery.md | Discovery and Transports | OpenClaw has two distinct problems that look similar on the surface: |
| gateway/doctor.md | Doctor | `openclaw doctor` is the repair + migration tool for OpenClaw. It fixes stale |
| gateway/gateway-lock.md | Gateway Lock | Last updated: 2025-12-11 |
| gateway/health.md | Health Checks | Short guide to verify channel connectivity without guessing. |
| gateway/heartbeat.md | Heartbeat | > **Heartbeat vs Cron?** See [Cron vs Heartbeat](/automation/cron-vs-heartbeat)  |
| gateway/index.md | Gateway Runbook | Use this page for day-1 startup and day-2 operations of the Gateway service. |
| gateway/local-models.md | Local Models | Local is doable, but OpenClaw expects large context + strong defenses against pr |
| gateway/logging.md | Logging | For a user-facing overview (CLI + Control UI + config), see [/logging](/logging) |
| gateway/multiple-gateways.md | Multiple Gateways | Most setups should use one Gateway because a single Gateway can handle multiple  |
| gateway/network-model.md | Network model | Most operations flow through the Gateway (`openclaw gateway`), a single long-run |
| gateway/openai-http-api.md | OpenAI Chat Completions | OpenClaw’s Gateway can serve a small OpenAI-compatible Chat Completions endpoint |
| gateway/openresponses-http-api.md | OpenResponses API | OpenClaw’s Gateway can serve an OpenResponses-compatible `POST /v1/responses` en |
| gateway/openshell.md | OpenShell | OpenShell is a managed sandbox backend for OpenClaw. Instead of running Docker |
| gateway/pairing.md | Gateway-Owned Pairing | In Gateway-owned pairing, the **Gateway** is the source of truth for which nodes |
| gateway/protocol.md | Gateway Protocol | The Gateway WS protocol is the **single control plane + node transport** for |
| gateway/remote-gateway-readme.md | Remote Gateway Setup | OpenClaw.app uses SSH tunneling to connect to a remote gateway. This guide shows |
| gateway/remote.md | Remote Access | This repo supports “remote over SSH” by keeping a single Gateway (the master) ru |
| gateway/sandbox-vs-tool-policy-vs-elevated.md | Sandbox vs Tool Policy vs Elevated | OpenClaw has three related (but different) controls: |
| gateway/sandboxing.md | Sandboxing | OpenClaw can run **tools inside sandbox backends** to reduce blast radius. |
| gateway/secrets-plan-contract.md | Secrets Apply Plan Contract | This page defines the strict contract enforced by `openclaw secrets apply`. |
| gateway/secrets.md | Secrets Management | OpenClaw supports additive SecretRefs so supported credentials do not need to be |
| gateway/security-index.md | Security | > [!WARNING] |
| gateway/tailscale.md | Tailscale | OpenClaw can auto-configure Tailscale **Serve** (tailnet) or **Funnel** (public) |
| gateway/tools-invoke-http-api.md | Tools Invoke API | OpenClaw’s Gateway exposes a simple HTTP endpoint for invoking a single tool dir |
| gateway/troubleshooting.md | Troubleshooting | This page is the deep runbook. |
| gateway/trusted-proxy-auth.md | Trusted Proxy Auth | > ⚠️ **Security-sensitive feature.** This mode delegates authentication entirely |

## help/ (7 docs)

| File | Title | Description |
|------|-------|-------------|
| help/debugging.md | Debugging | This page covers debugging helpers for streaming output, especially when a |
| help/environment.md | Environment Variables | OpenClaw pulls environment variables from multiple sources. The rule is **never  |
| help/faq.md | FAQ | Quick answers plus deeper troubleshooting for real-world setups (local dev, VPS, |
| help/index.md | Help | If you want a quick “get unstuck” flow, start here: |
| help/scripts.md | Scripts | The `scripts/` directory contains helper scripts for local workflows and ops tas |
| help/testing.md | Testing | OpenClaw has three Vitest suites (unit/integration, e2e, live) and a small set o |
| help/troubleshooting.md | General Troubleshooting | If you only have 2 minutes, use this page as a triage front door. |

## install/ (26 docs)

| File | Title | Description |
|------|-------|-------------|
| install/ansible.md | Ansible | Deploy OpenClaw to production servers with **[openclaw-ansible](https://github.c |
| install/azure.md | Azure | This guide sets up an Azure Linux VM with the Azure CLI, applies Network Securit |
| install/bun.md | Bun (Experimental) | Bun is **not recommended for gateway runtime** (known issues with WhatsApp and T |
| install/development-channels.md | Release Channels | OpenClaw ships three update channels: |
| install/digitalocean.md | DigitalOcean | Run a persistent OpenClaw Gateway on a DigitalOcean Droplet. |
| install/docker-vm-runtime.md | Docker VM Runtime | Shared runtime steps for VM-based Docker installs such as GCP, Hetzner, and simi |
| install/docker.md | Docker | Docker is **optional**. Use it only if you want a containerized gateway or to va |
| install/exe-dev.md | exe.dev | Goal: OpenClaw Gateway running on an exe.dev VM, reachable from your laptop via: |
| install/fly.md | Fly.io | 1. Clone repo → customize `fly.toml` |
| install/gcp.md | GCP | Run a persistent OpenClaw Gateway on a GCP Compute Engine VM using Docker, with  |
| install/hetzner.md | Hetzner | Run a persistent OpenClaw Gateway on a Hetzner VPS using Docker, with durable st |
| install/index.md | Install | The fastest way to install. It detects your OS, installs Node if needed, install |
| install/installer.md | Installer Internals | OpenClaw ships three installer scripts, served from `openclaw.ai`. |
| install/kubernetes.md | Kubernetes | A minimal starting point for running OpenClaw on Kubernetes — not a production-r |
| install/macos-vm.md | macOS VMs | Use a macOS VM when you specifically need macOS-only capabilities (iMessage/Blue |
| install/migrating.md | Migration Guide | This guide moves an OpenClaw gateway to a new machine without redoing onboarding |
| install/nix.md | Nix | Install OpenClaw declaratively with **[nix-openclaw](https://github.com/openclaw |
| install/node.md | Node.js | OpenClaw requires **Node 22.16 or newer**. **Node 24 is the default and recommen |
| install/northflank.md | Northflank | Deploy OpenClaw on Northflank with a one-click template and finish setup in your |
| install/oracle.md | Oracle Cloud | Run a persistent OpenClaw Gateway on Oracle Cloud's **Always Free** ARM tier (up |
| install/podman.md | Podman | Run the OpenClaw Gateway in a **rootless** Podman container. Uses the same image |
| install/railway.md | Railway | Deploy OpenClaw on Railway with a one-click template and finish setup in your br |
| install/raspberry-pi.md | Raspberry Pi | Run a persistent, always-on OpenClaw Gateway on a Raspberry Pi. Since the Pi is  |
| install/render.md | Render | Deploy OpenClaw on Render using Infrastructure as Code. The included `render.yam |
| install/uninstall.md | Uninstall | Two paths: |
| install/updating.md | Updating | Keep OpenClaw up to date. |

## nodes/ (9 docs)

| File | Title | Description |
|------|-------|-------------|
| nodes/audio.md | Audio and Voice Notes | 1. Locates the first audio attachment (local path or URL) and downloads it if ne |
| nodes/camera.md | Camera Capture | OpenClaw supports **camera capture** for agent workflows: |
| nodes/images.md | Image and Media Support | The WhatsApp channel runs via **Baileys Web**. This document captures the curren |
| nodes/index.md | Nodes | A **node** is a companion device (macOS/iOS/Android/headless) that connects to t |
| nodes/location-command.md | Location Command | OS permissions are multi-level. We can expose a selector in-app, but the OS stil |
| nodes/media-understanding.md | Media Understanding | OpenClaw can **summarize inbound media** (image/audio/video) before the reply pi |
| nodes/talk.md | Talk Mode | Talk mode is a continuous voice conversation loop: |
| nodes/troubleshooting.md | Node Troubleshooting | Use this page when a node is visible in status but node tools fail. |
| nodes/voicewake.md | Voice Wake | OpenClaw treats **wake words as a single global list** owned by the **Gateway**. |

## platforms/ (23 docs)

| File | Title | Description |
|------|-------|-------------|
| platforms/android.md | Android App | > **Note:** The Android app has not been publicly released yet. The source code  |
| platforms/index.md | Platforms | OpenClaw core is written in TypeScript. **Node is the recommended runtime**. |
| platforms/ios.md | iOS App | Availability: internal preview. The iOS app is not publicly distributed yet. |
| platforms/linux.md | Linux App | The Gateway is fully supported on Linux. **Node is the recommended runtime**. |
| platforms/mac-bundled-gateway.md | Gateway on macOS | OpenClaw.app no longer bundles Node/Bun or the Gateway runtime. The macOS app |
| platforms/mac-canvas.md | Canvas | The macOS app embeds an agent‑controlled **Canvas panel** using `WKWebView`. It |
| platforms/mac-child-process.md | Gateway Lifecycle | The macOS app **manages the Gateway via launchd** by default and does not spawn |
| platforms/mac-dev-setup.md | macOS Dev Setup | This guide covers the necessary steps to build and run the OpenClaw macOS applic |
| platforms/mac-health.md | Health Checks (macOS) | How to see whether the linked channel is healthy from the menu bar app. |
| platforms/mac-icon.md | Menu Bar Icon | Author: steipete · Updated: 2025-12-06 · Scope: macOS app (`apps/macos`) |
| platforms/mac-logging.md | macOS Logging | OpenClaw routes macOS app logs through swift-log (unified logging by default) an |
| platforms/mac-menu-bar.md | Menu Bar | * `job`: high‑level command execution (`state: started|streaming|done|error`). |
| platforms/mac-peekaboo.md | Peekaboo Bridge | OpenClaw can host **PeekabooBridge** as a local, permission‑aware UI automation |
| platforms/mac-permissions.md | macOS Permissions | macOS permission grants are fragile. TCC associates a permission grant with the |
| platforms/mac-remote.md | Remote Control | This flow lets the macOS app act as a full remote control for an OpenClaw gatewa |
| platforms/mac-signing.md | macOS Signing | This app is usually built from [`scripts/package-mac-app.sh`](https://github.com |
| platforms/mac-skills.md | Skills (macOS) | The macOS app surfaces OpenClaw skills via the gateway; it does not parse skills |
| platforms/mac-voice-overlay.md | Voice Overlay | Audience: macOS app contributors. Goal: keep the voice overlay predictable when  |
| platforms/mac-voicewake.md | Voice Wake (macOS) | Previously, if the overlay got stuck visible and you manually closed it, Voice W |
| platforms/mac-webchat.md | WebChat (macOS) | The macOS menu bar app embeds the WebChat UI as a native SwiftUI view. It |
| platforms/mac-xpc.md | macOS IPC | Diagram (SCI): |
| platforms/macos.md | macOS App | The macOS app is the **menu‑bar companion** for OpenClaw. It owns permissions, |
| platforms/windows.md | Windows | OpenClaw supports both **native Windows** and **WSL2**. WSL2 is the more |

## plugins/ (7 docs)

| File | Title | Description |
|------|-------|-------------|
| plugins/architecture.md | Plugin Internals | This page is for **plugin developers and contributors**. If you just want to |
| plugins/building-plugins.md | Building Plugins | Plugins extend OpenClaw with new capabilities: channels, model providers, speech |
| plugins/bundles.md | Plugin Bundles | OpenClaw can install plugins from three external ecosystems: **Codex**, **Claude |
| plugins/community.md | Community Plugins | Community plugins are third-party packages that extend OpenClaw with new |
| plugins/manifest.md | Plugin Manifest | This page is for the **native OpenClaw plugin manifest** only. |
| plugins/sdk-migration.md | Plugin SDK Migration | OpenClaw has moved from a broad backwards-compatibility layer to a modern plugin |
| plugins/voice-call.md | Voice Call Plugin | Voice calls for OpenClaw via a plugin. Supports outbound notifications and |

## providers/ (37 docs)

| File | Title | Description |
|------|-------|-------------|
| providers/anthropic.md | Anthropic | Anthropic builds the **Claude** model family and provides access via an API. |
| providers/bedrock.md | Amazon Bedrock | OpenClaw can use **Amazon Bedrock** models via pi‑ai’s **Bedrock Converse** |
| providers/claude-max-api-proxy.md | Claude Max API Proxy | <Warning> |
| providers/cloudflare-ai-gateway.md | Cloudflare AI Gateway | Cloudflare AI Gateway sits in front of provider APIs and lets you add analytics, |
| providers/deepgram.md | Deepgram | Deepgram is a speech-to-text API. In OpenClaw it is used for **inbound audio/voi |
| providers/github-copilot.md | GitHub Copilot | GitHub Copilot is GitHub's AI coding assistant. It provides access to Copilot |
| providers/glm.md | GLM Models | GLM is a **model family** (not a company) available through the Z.AI platform. I |
| providers/google.md | Google (Gemini) | The Google plugin provides access to Gemini models through Google AI Studio, plu |
| providers/groq.md | Groq | [Groq](https://groq.com) provides ultra-fast inference on open-source models |
| providers/huggingface.md | Hugging Face (Inference) | [Hugging Face Inference Providers](https://huggingface.co/docs/inference-provide |
| providers/index.md | Provider Directory | OpenClaw can use many LLM providers. Pick a provider, authenticate, then set the |
| providers/kilocode.md | Kilo Gateway | Kilo Gateway provides a **unified API** that routes requests to many models behi |
| providers/litellm.md | LiteLLM | [LiteLLM](https://litellm.ai) is an open-source LLM gateway that provides a unif |
| providers/minimax.md | MiniMax | OpenClaw's MiniMax provider defaults to **MiniMax M2.7** and keeps |
| providers/mistral.md | Mistral | OpenClaw supports Mistral for both text/image model routing (`mistral/...`) and |
| providers/models.md | Model Provider Quickstart | OpenClaw can use many LLM providers. Pick one, authenticate, then set the defaul |
| providers/modelstudio.md | Model Studio | The Model Studio provider gives access to Alibaba Cloud Coding Plan models, |
| providers/moonshot.md | Moonshot AI | Moonshot provides the Kimi API with OpenAI-compatible endpoints. Configure the |
| providers/nvidia.md | NVIDIA | NVIDIA provides an OpenAI-compatible API at `https://integrate.api.nvidia.com/v1 |
| providers/ollama.md | Ollama | Ollama is a local LLM runtime that makes it easy to run open-source models on yo |
| providers/openai.md | OpenAI | OpenAI provides developer APIs for GPT models. Codex supports **ChatGPT sign-in* |
| providers/opencode-go.md | OpenCode Go | OpenCode Go is the Go catalog within [OpenCode](/providers/opencode). |
| providers/opencode.md | OpenCode | OpenCode exposes two hosted catalogs in OpenClaw: |
| providers/openrouter.md | OpenRouter | OpenRouter provides a **unified API** that routes requests to many models behind |
| providers/perplexity-provider.md | Perplexity (Provider) | The Perplexity plugin provides web search capabilities through the Perplexity |
| providers/qianfan.md | Qianfan | Qianfan is Baidu's MaaS platform, provides a **unified API** that routes request |
| providers/qwen.md | Qwen | Qwen provides a free-tier OAuth flow for Qwen Coder and Qwen Vision models |
| providers/sglang.md | SGLang | SGLang can serve open-source models via an **OpenAI-compatible** HTTP API. |
| providers/synthetic.md | Synthetic | Synthetic exposes Anthropic-compatible endpoints. OpenClaw registers it as the |
| providers/together.md | Together AI | The [Together AI](https://together.ai) provides access to leading open-source mo |
| providers/venice.md | Venice AI | Venice AI provides privacy-focused AI inference with support for uncensored mode |
| providers/vercel-ai-gateway.md | Vercel AI Gateway | The [Vercel AI Gateway](https://vercel.com/ai-gateway) provides a unified API to |
| providers/vllm.md | vLLM | vLLM can serve open-source (and some custom) models via an **OpenAI-compatible** |
| providers/volcengine.md | Volcengine (Doubao) | The Volcengine provider gives access to Doubao models and third-party models |
| providers/xai.md | xAI | OpenClaw ships a bundled `xai` provider plugin for Grok models. |
| providers/xiaomi.md | Xiaomi MiMo | Xiaomi MiMo is the API platform for **MiMo** models. OpenClaw uses the Xiaomi |
| providers/zai.md | Z.AI | Z.AI is the API platform for **GLM** models. It provides REST APIs for GLM and u |

## reference/ (22 docs)

| File | Title | Description |
|------|-------|-------------|
| reference/AGENTS.default.md | Default AGENTS.md | OpenClaw uses a dedicated workspace directory for the agent. Default: `~/.opencl |
| reference/RELEASING.md | Release Policy | OpenClaw has three public release lanes: |
| reference/api-usage-costs.md | API Usage and Costs | This doc lists **features that can invoke API keys** and where their costs show  |
| reference/credits.md | Credits | OpenClaw = CLAW + TARDIS, because every space lobster needs a time and space mac |
| reference/device-models.md | Device Model Database | The macOS companion app shows friendly Apple device model names in the **Instanc |
| reference/memory-config.md | Memory configuration reference | This page covers the full configuration surface for OpenClaw memory search. For |
| reference/prompt-caching.md | Prompt Caching | Prompt caching means the model provider can reuse unchanged prompt prefixes (usu |
| reference/rpc.md | RPC Adapters | OpenClaw integrates external CLIs via JSON-RPC. Two patterns are used today. |
| reference/secretref-credential-surface.md | SecretRef Credential Surface | This page defines the canonical SecretRef credential surface. |
| reference/session-management-compaction.md | Session Management Deep Dive | This document explains how OpenClaw manages sessions end-to-end: |
| reference/templates-AGENTS.md | AGENTS.md Template | This folder is home. Treat it that way. |
| reference/templates-BOOT.md | BOOT.md Template | Add short, explicit instructions for what OpenClaw should do on startup (enable  |
| reference/templates-BOOTSTRAP.md | BOOTSTRAP.md Template | There is no memory yet. This is a fresh workspace, so it's normal that memory fi |
| reference/templates-HEARTBEAT.md | HEARTBEAT.md Template |  |
| reference/templates-IDENTITY.md | IDENTITY | *(pick something you like)* |
| reference/templates-SOUL.md | SOUL.md Template | Be the assistant you'd actually want to talk to. Concise when needed, thorough w |
| reference/templates-TOOLS.md | TOOLS.md Template | Skills define *how* tools work. This file is for *your* specifics — the stuff th |
| reference/templates-USER.md | USER | The more you know, the better you can help. But remember — you're learning about |
| reference/test.md | Tests | For local PR land/gate checks, run: |
| reference/token-use.md | Token Use and Costs | OpenClaw tracks **tokens**, not characters. Tokens are model-specific, but most |
| reference/transcript-hygiene.md | Transcript Hygiene | This document describes **provider-specific fixes** applied to transcripts befor |
| reference/wizard.md | Onboarding Reference | This is the full reference for `openclaw onboard`. |

## security/ (3 docs)

| File | Title | Description |
|------|-------|-------------|
| security/CONTRIBUTING-THREAT-MODEL.md | Contributing to the Threat Model | Thanks for helping make OpenClaw more secure. This threat model is a living docu |
| security/THREAT-MODEL-ATLAS.md | Threat Model (MITRE ATLAS) | This threat model is built on [MITRE ATLAS](https://atlas.mitre.org/), the indus |
| security/formal-verification.md | Formal Verification (Security Models) | This page tracks OpenClaw’s **formal security models** (TLA+/TLC today; more as  |

## start/ (13 docs)

| File | Title | Description |
|------|-------|-------------|
| start/bootstrapping.md | Agent Bootstrapping | Bootstrapping is the **first‑run** ritual that prepares an agent workspace and |
| start/docs-directory.md | Docs directory | <Note> |
| start/getting-started.md | Getting Started | Install OpenClaw, run onboarding, and chat with your AI assistant — all in |
| start/hubs.md | Docs Hubs | <Note> |
| start/lore.md | OpenClaw Lore | In the beginning, there was **Warelay** — a sensible name for a WhatsApp gateway |
| start/onboarding-overview.md | Onboarding Overview | OpenClaw has two onboarding paths. Both configure auth, the Gateway, and |
| start/onboarding.md | Onboarding (macOS App) | This doc describes the **current** first‑run setup flow. The goal is a |
| start/openclaw.md | Personal Assistant Setup | OpenClaw is a self-hosted gateway that connects WhatsApp, Telegram, Discord, iMe |
| start/setup.md | Setup | <Note> |
| start/showcase.md | Showcase | Real projects from the community. See what people are building with OpenClaw. |
| start/wizard-cli-automation.md | CLI Automation | Use `--non-interactive` to automate `openclaw onboard`. |
| start/wizard-cli-reference.md | CLI Setup Reference | This page is the full reference for `openclaw onboard`. |
| start/wizard.md | Onboarding (CLI) | CLI onboarding is the **recommended** way to set up OpenClaw on macOS, |

## tools/ (33 docs)

| File | Title | Description |
|------|-------|-------------|
| tools/acp-agents.md | ACP Agents | [Agent Client Protocol (ACP)](https://agentclientprotocol.com/) sessions let Ope |
| tools/agent-send.md | Agent Send | `openclaw agent` runs a single agent turn from the command line without needing |
| tools/apply-patch.md | apply_patch Tool | Apply file changes using a structured patch format. This is ideal for multi-file |
| tools/brave-search.md | Brave Search | OpenClaw supports Brave Search API as a `web_search` provider. |
| tools/browser-linux-troubleshooting.md | Browser Troubleshooting | OpenClaw's browser control server fails to launch Chrome/Brave/Edge/Chromium wit |
| tools/browser-login.md | Browser Login | When a site requires login, **sign in manually** in the **host** browser profile |
| tools/browser-wsl2-windows-remote-cdp-troubleshooting.md | WSL2 + Windows + remote Chrome CDP troubleshooting | This guide covers the common split-host setup where: |
| tools/browser.md | Browser (OpenClaw-managed) | OpenClaw can run a **dedicated Chrome/Brave/Edge/Chromium profile** that the age |
| tools/btw.md | BTW Side Questions | `/btw` lets you ask a quick side question about the **current session** without |
| tools/clawhub.md | ClawHub | ClawHub is the **public skill registry for OpenClaw**. It is a free service: all |
| tools/creating-skills.md | Creating Skills | Skills teach the agent how and when to use tools. Each skill is a directory |
| tools/diffs.md | Diffs | `diffs` is an optional plugin tool with short built-in system guidance and a com |
| tools/elevated.md | Elevated Mode | When an agent runs inside a sandbox, its `exec` commands are confined to the |
| tools/exec-approvals.md | Exec Approvals | Exec approvals are the **companion app / node host guardrail** for letting a san |
| tools/exec.md | Exec Tool | Run shell commands in the workspace. Supports foreground + background execution  |
| tools/firecrawl.md | Firecrawl | OpenClaw can use **Firecrawl** in three ways: |
| tools/index.md | Tools and Plugins | Everything the agent does beyond generating text happens through **tools**. |
| tools/llm-task.md | LLM Task | `llm-task` is an **optional plugin tool** that runs a JSON-only LLM task and |
| tools/lobster.md | Lobster | Lobster is a workflow shell that lets OpenClaw run multi-step tool sequences as  |
| tools/loop-detection.md | Tool-loop detection | OpenClaw can keep agents from getting stuck in repeated tool-call patterns. |
| tools/multi-agent-sandbox-tools.md | Multi-Agent Sandbox & Tools | Each agent in a multi-agent setup can override the global sandbox and tool |
| tools/pdf.md | PDF Tool | `pdf` analyzes one or more PDF documents and returns text. |
| tools/perplexity-search.md | Perplexity Search | OpenClaw supports Perplexity Search API as a `web_search` provider. |
| tools/plugin.md | Plugins | Plugins extend OpenClaw with new capabilities: channels, model providers, tools, |
| tools/reactions.md | Reactions | The agent can add and remove emoji reactions on messages using the `message` |
| tools/skills-config.md | Skills Config | All skills-related configuration lives under `skills` in `~/.openclaw/openclaw.j |
| tools/skills.md | Skills | OpenClaw uses **[AgentSkills](https://agentskills.io)-compatible** skill folders |
| tools/slash-commands.md | Slash Commands | Commands are handled by the Gateway. Most commands must be sent as a **standalon |
| tools/subagents.md | Sub-Agents | Sub-agents are background agent runs spawned from an existing agent run. They ru |
| tools/tavily.md | Tavily | OpenClaw can use **Tavily** in two ways: |
| tools/thinking.md | Thinking Levels | * minimal → “think” |
| tools/tts.md | Text-to-Speech | OpenClaw can convert outbound replies into audio using ElevenLabs, Microsoft, or |
| tools/web.md | Web Tools | OpenClaw ships two lightweight web tools: |

## web/ (5 docs)

| File | Title | Description |
|------|-------|-------------|
| web/control-ui.md | Control UI | The Control UI is a small **Vite + Lit** single-page app served by the Gateway: |
| web/dashboard.md | Dashboard | The Gateway dashboard is the browser Control UI served at `/` by default |
| web/index.md | Web | The Gateway serves a small **browser Control UI** (Vite + Lit) from the same por |
| web/tui.md | TUI | 1. Start the Gateway. |
| web/webchat.md | WebChat | Status: the macOS/iOS SwiftUI chat UI talks directly to the Gateway WebSocket. |
