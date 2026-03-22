---
Source: https://www.microsoft.com/en-us/security/blog/2026/02/19/running-openclaw-safely-identity-isolation-runtime-risk/
Title: Running OpenClaw safely: identity, isolation, and runtime risk
Author: Microsoft Defender Security Research Team
Date: 2026-02-19
Type: reference
---

Self-hosted agent runtimes like OpenClaw are showing up fast in enterprise pilots, and they introduce a blunt reality: OpenClaw includes limited built-in security controls. The runtime can ingest untrusted text, download and execute skills (i.e. code) from external sources, and perform actions using the credentials assigned to it.

This effectively shifts the execution boundary from static application code to dynamically supplied content and third-party capabilities, without equivalent controls around identity, input handling, or privilege scoping.

In an unguarded deployment, three risks materialize quickly:

- Credentials and accessible data may be exposed or exfiltrated.
- The agent's persistent state or "memory" can be modified, causing it to follow attacker-supplied instructions over time.
- The host environment can be compromised if the agent is induced to retrieve and execute malicious code.

Because of these characteristics, OpenClaw should be treated as untrusted code execution with persistent credentials. It is not appropriate to run on a standard personal or enterprise workstation. If an organization determines that OpenClaw must be evaluated, it should be deployed only in a fully isolated environment such as a dedicated virtual machine or separate physical system. The runtime should use dedicated, non-privileged credentials and access only non-sensitive data. Continuous monitoring and a rebuild plan should be part of the operating model.

This post explains how the two supply chains inherent to self-hosted agents — untrusted code (skills and extensions) and untrusted instructions (external text inputs) — converge into a single execution loop. We examine how this design creates compounding risk in workstation environments, provide a representative compromise chain, and outline deployment, monitoring, and hunting guidance aligned to Microsoft Security controls, including Microsoft Defender XDR.

## Clarifying the landscape: runtime vs platform

**OpenClaw (runtime):** A self-hosted agent runtime that runs on a workstation, VM, or container. It can load skills and interact with local and cloud resources. Installing a skill is basically installing privileged code.

**Moltbook (platform):** An agent-focused platform and identity layer where agents post, read, and authenticate through APIs. A single malicious post can reach multiple agents.

## How agents shift the security boundary

That boundary has three components:
- **Identity:** The tokens the agent uses to do work
- **Execution:** The tools it can run that change state
- **Persistence:** The ways it can keep changes across runs

Two types of security problems:
1. **Indirect prompt injection:** Attackers can hide malicious instructions inside content an agent reads
2. **Skill malware:** Agents acquire skills by downloading and running code off the Internet

### End-to-end attack scenario: The poisoned skill

Step 1: Distribution - Attacker publishes malicious skill to ClawHub
Step 2: Installation - Developer or agent installs the skill
Step 3: State access - Attacker gains access to tokens, credentials, configuration
Step 4: Privilege reuse - Attacker performs actions through standard APIs
Step 5: Persistence - Durable configuration changes maintain long-term control

## Minimum safe operating posture

1. Run only in isolation - dedicated VM or separate physical device
2. Use dedicated credentials and non-sensitive data
3. Monitor for state or memory manipulation
4. Back up state to enable rapid rebuild
5. Treat rebuild as an expected control

## Hunting queries (Microsoft Defender XDR)

- Hunt 1: Discover agent runtimes and related tooling
- Hunt 1b: Cloud workloads variant (CloudProcessEvents)
- Hunt 1c: ClawHub skill installs and low-prevalence skill slugs
- Hunt 2: Extension installs and churn on developer endpoints
- Hunt 3: High-privilege OAuth apps and consent drift
- Hunt 4: Unexpected listening services created by agent processes
- Hunt 5: Agent runtimes spawning unexpected shells or download tools
