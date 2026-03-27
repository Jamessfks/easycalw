---
Source: https://speedscale.com/blog/building-speedy-autonomous-ai-development-agent/
Title: Building Speedy — Autonomous AI Development Agent Architecture
Relevance: Directly applicable to Kai's PR monitoring, code review, and GitHub automation setup
---

# Autonomous Dev Agent Architecture Reference

This reference documents the production-proven orchestrator pattern used by Speedscale's "Speedy" autonomous dev agent — the same architectural principles powering Kai's OpenClaw setup for SynthLabs.

## Core Architecture Principle

**The main agent is a project manager, not an implementer.**

The main agent maintains a clean context window by delegating detailed implementation work to sub-agents. This is what makes the difference between a demo that works once and a system that runs reliably at 2am.

```
Main Agent (Orchestrator)
├── Confirms intent / ticket receipt
├── Delegates to sub-agents with specific briefs
├── Reviews sub-agent outputs
├── Reports outcomes to Kai via Telegram
└── Logs all decisions to thoughts/ directory

Sub-Agent: Code Explorer      → reads codebase, maps dependencies
Sub-Agent: Implementer        → writes code changes (TDD: tests first)
Sub-Agent: Reviewer           → high-level quality check
Sub-Agent: Reporter           → composes Telegram summary for Kai
```

## The 8-Phase Workflow (adapted for SynthLabs)

| Phase | What Happens | SynthLabs Equivalent |
|---|---|---|
| 0. Confirm Intent | Agent acknowledges task receipt | Telegram: "Got it — reviewing PR #42" |
| 1. Start | Reads ticket/PR, transitions status | Marks PR as "under review" |
| 2. Investigate & Plan | Creates worktree, maps codebase | Checks diff, finds related files |
| 3. Implement | TDD loop — fails tests first, then code | (For autonomous fixes — Kai's config requires approval for commits) |
| 4. Verify | Executes verification strategy | Runs existing test suite, checks CI |
| 5. Review | High-level sub-agent reviews quality | Checks logic, suggests improvements |
| 6. Submit | Posts review comment to PR | Posts `[OpenClaw]` prefixed comment |
| 7. Notify | Sends message with outcome | Telegram summary to Kai |

## Key Design Decisions for SynthLabs

### 1. Bot Identification
Every commit message, PR comment, and Slack message from the agent MUST use the `[OpenClaw]` prefix. This makes AI-generated content immediately distinguishable from human contributions — essential when auditing or debugging.

### 2. The Heartbeat Cron
The 30-minute PR heartbeat (Section 09 of setup guide) directly implements this lesson from Speedy:

> "The heartbeat is underrated. Without it, stalled CI runs and unanswered review comments go unnoticed for hours."

The heartbeat checks: CI status changes, new review comments, PRs aging past 24h without review.

### 3. Workspace Files as Agent Identity
Kai's `~/.openclaw/` workspace files map to Speedy's identity system:

| Speedy File | OpenClaw Equivalent | Purpose |
|---|---|---|
| `IDENTITY.md` | `SOUL.md` | Name, role, operating values |
| `SOUL.md` | `SOUL.md` | Core principles (autonomy, clean commits) |
| `TOOLS.md` | `TOOLS.md` | Configured repo paths, API pointers |
| `HEARTBEAT.md` | Cron config | Periodic monitoring instructions |
| `MEMORY.md` | `MEMORY.md` | Long-term learnings from past sessions |

### 4. Gates and Honest Abort Points
The agent should have clear abort conditions. For Kai's setup:
- If CI is in an unknown state (not green/red), report and wait — don't guess
- If a PR diff is > 500 lines, flag for Kai's manual review rather than attempting full autonomous code review
- If the burn-rate Sheet is inaccessible, notify Kai rather than skipping silently

### 5. Model Tier Selection
From Speedy's production experience: use cheaper/faster models for routine tasks, premium models for complex reasoning.

For Kai's setup:
- **claude-sonnet-4-6 (Sonnet):** Morning briefings, Slack digests, Linear updates, calendar checks
- **Claude Opus:** Complex PR code review, investor update drafting, multi-repo architectural analysis

Configure in `SOUL.md`:
```markdown
## Model Routing
Use Sonnet for: summaries, status checks, routine logging
Use Opus for: code review, investor updates, architectural analysis, any task requiring multi-step reasoning
```

## Common Failure Modes (and Fixes)

| Failure | Symptom | Fix |
|---|---|---|
| Context pollution | Agent gives degraded responses after long sessions | Use `memory-hygiene` skill weekly; delegate heavy tasks to sub-agents |
| Silent cron failure | Morning briefing stops arriving | Check `/tmp/openclaw-morning.log`; `openclaw gateway status`; `openclaw gateway restart` |
| Prompt injection via email | Agent behaves unexpectedly after reading emails | `prompt-guard` skill catches this — confirm it's active with security audit |
| Port conflict on restart | Gateway fails to start | `lsof -i :3000` — kill conflicting process or change OpenClaw port in config |
| API rate limits | Anthropic requests start failing | Check `model-usage` skill output; add back-off in cron schedule if hitting limits |

## Source

Full blog post: https://speedscale.com/blog/building-speedy-autonomous-ai-development-agent/
Authors: Josh Thornton and Matthew LeRay (Speedscale Engineering)
Date: 2026-02-18
Template repo: github.com/speedscale/speedy-template
