---
name: openclaw-docs
description: >
  Complete OpenClaw documentation (347 pages). Use whenever the user mentions
  OpenClaw, openclaw, Clawd, or any topic related to OpenClaw: installation,
  gateway configuration, channel setup (WhatsApp, Telegram, Discord, Slack,
  Signal, iMessage, IRC, Matrix), CLI commands, providers, plugins, automation
  (hooks, cron, webhooks, standing orders), sandboxing, multi-agent routing,
  voice/audio nodes, compaction, or the control dashboard. Also trigger for
  self-hosted AI gateways, WhatsApp/Telegram/Discord bots in an OpenClaw context,
  or references to docs.openclaw.ai. Never guess or web-search when this skill is
  available — the docs are the source of truth. Covers 20 topic areas.
---

# OpenClaw Documentation Reference

You have the complete docs.openclaw.ai documentation (347 pages) available locally.
Use these files to answer questions accurately — never guess or web-search when the
answer is in these docs. The docs are the source of truth; always prefer them over
your training data for OpenClaw-specific details.

## What is OpenClaw?

OpenClaw is an open-source, self-hosted AI gateway that bridges messaging platforms
(WhatsApp, Telegram, Discord, iMessage, Slack, Signal, IRC, Matrix, etc.) with AI
coding agents. It provides multi-channel messaging, agent orchestration, plugin
extensibility, automation (hooks, cron, webhooks), and a browser-based control dashboard.

## How to Find Answers

All docs live under `${CLAUDE_SKILL_DIR}/docs/` organized by section. Follow this
lookup strategy — start specific, broaden if needed:

1. **If you know the topic area**, go straight to the right section directory (see table below)
2. **If you need to find something by keyword**, use `Grep` on `${CLAUDE_SKILL_DIR}/docs/`
3. **If you need to browse what's available**, read `${CLAUDE_SKILL_DIR}/INDEX.md` (full manifest of all 347 docs)

### Section Directory

| Intent | Path | What's Inside |
|--------|------|---------------|
| Install OpenClaw | `docs/install/` | npm, Docker, Nix, source, cloud deployments (GCP, Azure, Hetzner, Fly, Railway, etc.) |
| Configure the gateway | `docs/gateway/` | Configuration guide, reference, examples, sandboxing, secrets, security, Tailscale |
| Set up messaging channels | `docs/channels/` | WhatsApp, Telegram, Discord, iMessage, Slack, Signal, IRC, Matrix, LINE, Teams, etc. |
| Use CLI commands | `docs/cli/` | Full CLI reference (47 commands) |
| Add AI providers | `docs/providers/` | OpenAI, Anthropic, Google, Ollama, Bedrock, Groq, OpenRouter, xAI, etc. (37 providers) |
| Use tools & skills | `docs/tools/` | Browser, exec, slash commands, MCP, skills, sub-agents, web search, PDF, TTS |
| Understand concepts | `docs/concepts/` | Agents, workspaces, multi-agent routing, compaction, memory, sessions, streaming |
| Build plugins | `docs/plugins/` | Plugin architecture, bundles, building custom plugins, community plugins |
| Deploy to platforms | `docs/platforms/` | macOS, iOS, Android, Linux, Windows, Raspberry Pi |
| Set up automation | `docs/automation/` | Hooks, cron jobs, polls, webhooks, standing orders, Gmail PubSub |
| Security | `docs/security/` | Threat model (MITRE ATLAS), formal verification, contributing |
| Get help | `docs/help/` | FAQ, debugging, environment variables, troubleshooting |
| Reference | `docs/reference/` | Memory config, test framework, API costs, templates (AGENTS.md, SOUL.md, etc.) |
| Getting started | `docs/start/` | Getting started, onboarding, bootstrapping, showcase |
| Web dashboard | `docs/web/` | Control UI, dashboard setup, WebChat, TUI |
| Node types | `docs/nodes/` | Audio, camera, voice wake, talk mode, media understanding |
| Diagnostics | `docs/diagnostics/` | Feature flags and diagnostic tools |
| Codelabs | `docs/_codelabs/` | Tutorials (ADK streaming, multi-agent A2A) |
| Other | `docs/_root/` | Logging, networking, auth semantics, CI, date-time, OpenProse |

### Frequently Needed Docs

| Task | Direct Path |
|------|-------------|
| Getting started | `${CLAUDE_SKILL_DIR}/docs/start/getting-started.md` |
| Install via Docker | `${CLAUDE_SKILL_DIR}/docs/install/docker.md` |
| Install via npm | `${CLAUDE_SKILL_DIR}/docs/install/npm.md` |
| Configuration reference | `${CLAUDE_SKILL_DIR}/docs/gateway/configuration-reference.md` |
| Configuration examples | `${CLAUDE_SKILL_DIR}/docs/gateway/configuration-examples.md` |
| WhatsApp setup | `${CLAUDE_SKILL_DIR}/docs/channels/whatsapp.md` |
| Discord setup | `${CLAUDE_SKILL_DIR}/docs/channels/discord.md` |
| Telegram setup | `${CLAUDE_SKILL_DIR}/docs/channels/telegram.md` |
| Slack setup | `${CLAUDE_SKILL_DIR}/docs/channels/slack.md` |
| CLI reference | `${CLAUDE_SKILL_DIR}/docs/cli/index.md` |
| Multi-agent routing | `${CLAUDE_SKILL_DIR}/docs/concepts/multi-agent.md` |
| Plugin architecture | `${CLAUDE_SKILL_DIR}/docs/plugins/architecture.md` |
| Sandboxing | `${CLAUDE_SKILL_DIR}/docs/gateway/sandboxing.md` |
| System prompt | `${CLAUDE_SKILL_DIR}/docs/concepts/system-prompt.md` |
| FAQ | `${CLAUDE_SKILL_DIR}/docs/help/faq.md` |
| Onboarding (CLI) | `${CLAUDE_SKILL_DIR}/docs/start/wizard.md` |

### Search Patterns

```
# Keyword search across all docs
Grep pattern="whatsapp" path="${CLAUDE_SKILL_DIR}/docs/" -i

# Search within a specific section
Grep pattern="memory" path="${CLAUDE_SKILL_DIR}/docs/gateway/"

# List all docs in a section
Glob pattern="*.md" path="${CLAUDE_SKILL_DIR}/docs/providers/"
```

### Common Cross-References

Many questions touch topics that span multiple docs. When a user asks about one of
these topics, also read the related doc — the combination gives a much better answer
than either alone.

| When the user asks about... | Also read... |
|-----------------------------|-------------|
| Cron jobs / scheduled tasks | `docs/automation/cron-vs-heartbeat.md` (heartbeat is often confused with cron) |
| Sandboxing / code isolation | `docs/gateway/sandbox-vs-tool-policy-vs-elevated.md` (the three controls) |
| Multi-agent setup | `docs/cli/agents.md` (CLI for managing agents) + `docs/gateway/configuration-examples.md` |
| Channel setup (any) | `docs/gateway/configuration-examples.md` (copy-paste config patterns) |
| Hooks / webhooks | `docs/automation/standing-orders.md` (standing orders complement hooks) |
| Model providers / failover | `docs/concepts/model-failover.md` + `docs/concepts/model-providers.md` |
| Session management | `docs/concepts/compaction.md` + `docs/concepts/session-pruning.md` |
| WhatsApp groups | `docs/channels/group-messages.md` + `docs/channels/groups.md` |
| Troubleshooting (any channel) | `docs/channels/troubleshooting.md` + `docs/gateway/troubleshooting.md` |
| Discord bot not responding | `docs/channels/discord.md` (check Message Content Intent) |
| Memory / context | `docs/concepts/memory.md` + `docs/concepts/context.md` + `docs/reference/memory-config.md` |
| Remote access / SSH | `docs/gateway/remote.md` + `docs/gateway/remote-gateway-readme.md` |

## Answering Guidelines

- **Always cite the doc filename**: for every major topic you reference, include the doc path at least once (e.g., "According to `docs/gateway/sandboxing.md`..."). This is how the user verifies your answer and finds more detail. Don't just use the information — name where it came from.
- **Include source URLs**: each doc file has a `source_url` in its YAML frontmatter. Include these URLs so the user can read the full page on docs.openclaw.ai.
- **Be precise with CLI commands**: OpenClaw has 47 CLI commands. When the user asks about a command, read the specific CLI doc (e.g., `docs/cli/gateway.md` for `openclaw gateway`) rather than paraphrasing from memory.
- **Cross-reference using the table above**: many topics span multiple docs. Check the cross-reference table and read all relevant docs before answering — the user benefits from a complete picture.
- **Don't fabricate config fields or flags**: if you're unsure about a config key or CLI flag, look it up in the configuration reference or the specific CLI doc. The docs are exhaustive — if a field isn't documented, it probably doesn't exist.

## Source

All documentation was scraped from https://docs.openclaw.ai/ on 2026-03-21.
Each file includes YAML frontmatter with `title`, `source_url`, and `section` for traceability.
