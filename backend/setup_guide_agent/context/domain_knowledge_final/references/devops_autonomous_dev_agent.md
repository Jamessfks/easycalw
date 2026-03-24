---
Source: https://speedscale.com/blog/building-speedy-autonomous-ai-development-agent/
Title: Building Speedy: An Autonomous AI Development Agent
Author: Josh Thornton and Matthew LeRay
Date: 2026-02-18
Type: reference
---

How we built an AI agent that implements Jira tickets, creates merge requests, and tracks them on its own.

## The Vision

Send "Implement SPD-1234" in Slack, walk away, come back to find the ticket moved to "In Progress," git branch created with failing tests, code implemented, merge request created, CI pipeline failures investigated and fixed, and MR comments addressed—all without intervention.

## Architecture: The Core Components

### OpenClaw: The Gateway
- Persistent filesystem access
- Communication channel integrations (Slack, email)
- Cron-based heartbeat monitoring
- Model tier selection (Sonnet for routine, Opus for complex)
- Sub-agent spawning for parallel work

### Workspace Files: The Agent's Identity
- IDENTITY.md: Name, Role, Vibe
- SOUL.md: Core Principles (TDD, context, autonomy, clean commits)
- TOOLS.md: Configured repo paths, Jira project prefix
- HEARTBEAT.md: Periodic monitoring instructions
- MEMORY.md: Long-term learnings

### Skills: Modular Capabilities
1. jira-tickets — Jira Operations via acli
2. gitflow — Git Worktree Workflow
3. glab-speedscale — GitLab MR Management
4. speedscale-change — The Orchestrator (8 phases)

### The 8-Phase Workflow
| Phase | What Happens |
|-------|-------------|
| 0. Confirm Intent | Confirms receipt of ticket |
| 1. Start | Reads ticket, transitions to In Progress |
| 2. Investigate & Plan | Creates worktree, investigates code |
| 3. Implement | TDD loop: fails tests first, then code |
| 4. Verify | Executes verification strategy |
| 5. Review | High-level sub-agent reviews quality |
| 6. Submit | Pushes code, creates MR, auto-merges |
| 7. Notify | Sends message with outcome |

### The Heartbeat: Autonomous Monitoring
Cron job that periodically checks open MRs, investigates build failures (up to 10 attempts), responds to new comments.

## Lessons Learned
1. Iteration is Everything - weeks of tuning from single prompt to production
2. Memory is Persistent, Use It - enforce memory updates when corrected
3. Design for Orchestration, Not Direct Execution - main agent = project manager
4. Shared Credentials Require Bot Identification - === bot === prefix
5. Skills Should Be Modular but Coordinated
6. The Heartbeat is Underrated
7. Test Quality > Test Coverage
8. Dependencies Are Silent Killers - document and verify tools

## Key Design Decisions
- Sub-agents for delegation (Orchestrator pattern)
- thoughts/ directory for auditability
- Gates and honest abort points
- Model selection by task complexity
- Scripted vs declarative guidance

Source code: github.com/speedscale/speedy-template
