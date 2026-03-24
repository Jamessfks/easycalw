# OpenClaw Skill — Navigation Guide for the Setup Guide Agent

This folder provides the agent with awareness of the OpenClaw documentation skill and how to navigate the 347-page knowledge base efficiently.

## Primary Reference

The full documentation skill definition lives at `openclaw-docs/SKILL.md`. Read that file to understand:
- The complete section directory (20 topic areas)
- Lookup strategy (specific → keyword → browse)
- Frequently needed docs with direct paths
- Search patterns for Glob and Grep
- Cross-reference table (which docs to read together)
- Answering guidelines (cite filenames, include source URLs, verify CLI commands)

## What is OpenClaw?

OpenClaw is an open-source, self-hosted AI gateway that bridges messaging platforms (WhatsApp, Telegram, Discord, iMessage, Slack, Signal, IRC, Matrix, etc.) with AI coding agents. It provides multi-channel messaging, agent orchestration, plugin extensibility, automation (hooks, cron, webhooks), and a browser-based control dashboard.

## Key Directories

| Directory | Contents |
|-----------|----------|
| `openclaw-docs/docs/install/` | Platform install guides (npm, Docker, Nix, cloud) |
| `openclaw-docs/docs/channels/` | Channel setup (WhatsApp, Telegram, Discord, etc.) |
| `openclaw-docs/docs/automation/` | Cron, hooks, standing orders, webhooks |
| `openclaw-docs/docs/security/` | Threat model (MITRE ATLAS), hardening |
| `openclaw-docs/docs/providers/` | AI model providers (OpenAI, Anthropic, Google, etc.) |
| `openclaw-docs/docs/tools/` | Skills system, browser, exec, MCP |
| `openclaw-docs/docs/gateway/` | Configuration, sandboxing, secrets |
| `openclaw-docs/docs/concepts/` | Agents, routing, memory, sessions |
| `openclaw-docs/docs/reference/` | Templates (AGENTS.md, SOUL.md), memory config |

## Usage

When generating setup guides, always:
1. Read `openclaw-docs/SKILL.md` first for the full lookup strategy
2. Use the section directory to find the right docs for the user's platform, channel, and provider
3. Grep for specific CLI syntax rather than guessing
4. Cross-reference related docs (see the cross-reference table in SKILL.md)
