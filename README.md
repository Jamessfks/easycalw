# OpenClaw Concierge — documentation

This repository holds the **architecture and implementation guides** for **OpenClaw Concierge**: a voice-first flow that turns a consultative conversation into a downloadable OpenClaw configuration package.

There is **no application code** in this checkout—only specs under [`Documentations/`](Documentations/).

---

## Start here

| Document | Purpose |
| :--- | :--- |
| [**Project Master Specification (V2.1)**](Documentations/Project%20Master%20Specification%20(V2.1)_%20OpenClaw%20Concierge%20Technical%20Architecture.md) | End-to-end technical architecture: three-tier pipeline, security, registry logic, frontend expectations, and **§8** reference alignment with [Way Back Home Level 4](https://codelabs.developers.google.com/way-back-home-level-4/instructions#0). |
| [**Claude Code Implementation Guide**](Documentations/Claude%20Code%20Implementation%20Guide_%20OpenClaw%20Concierge%20(1).md) | How to map each artifact type to implementation work (ADK, FastAPI, React) and what to verify before a demo. |

---

## Architecture (from the Master Specification)

1. **Discovery (Model 1)** — Google ADK + **Gemini Multimodal Live**: bidirectional voice, consultative “researcher” behavior, hardware steering, tiered transparency (Tier 1–3).
2. **Extraction (Model 2)** — Google ADK: post-call / structured extraction against a **`schema.json`** data contract.
3. **Generation (Model 3)** — **FastAPI** backend (spec cites **Gemini 2.5 Pro** for file generation): webhook ingestion, deterministic skill mapping from a **registry**, smart templates, ZIP output (`SOUL.md`, `USER.md`, `AGENTS.md`, `IDENTITY.md`, `setup.sh`, `README.md`, etc.).

The spec also describes **security** (e.g. zero API key storage in the concierge path, OAuth-oriented flows), **tiered transparency**, an **integrated security suite** concept (trust hub, scanner, permission gatekeeper), and a **React** UI (voice start, transcript, processing state, ZIP download).

---

## Artifact map (from the Implementation Guide)

When you implement the product, the guide expects these **named artifacts** to drive behavior (they may live in another repo or be added later):

| Role | Artifact | Use |
| :--- | :--- | :--- |
| Skill allow-list & mapping | `registry.md` | Backend lookup + conversational grounding |
| Live agent instruction | `consultative_system_prompt.md` | Model 1 system instruction |
| Structured output | `schema.json` | Model 2 extraction shape |
| Generator spec | `smart_markdown_templates.md` | Model 3 template logic |
| Config accuracy | `openclaw_ref.md` | `openclaw.json` / channel snippets |

---

## Implementation workflow (summary)

1. Scaffold **React** + **FastAPI** as needed.  
2. Wire **Model 1 & 2** in Google ADK using the consultative prompt and schema.  
3. Implement **Model 3**: skill lookup, template-driven generation, ZIP response, and security rules from the specs.  
4. Build the UI: start call / transcript / processing / download.  
5. Run the **final verification** checklist in the Implementation Guide (voice behavior, JSON vs schema, `setup.sh` slugs, README snippets).

---

## Way Back Home — Level 4 (Google Codelab)

Google’s **[Way Back Home — Live Bidirectional Multi-Agent system](https://codelabs.developers.google.com/way-back-home-level-4/instructions#0)** is the canonical hands-on walkthrough for the **same class of stack** the Master Specification assumes: **ADK**, **Gemini Live (bidi)**, **FastAPI + WebSockets**, **React**, optional **Redis / Memorystore**, **A2A**, and **Cloud Run** deployment.

### What that codelab builds

| Codelab piece | Role |
| :--- | :--- |
| **Dispatch agent** | Primary **Gemini Live** agent: voice/video in real time, orchestrates tools and subordinate agents. |
| **Architect agent** | Specialist with **structured tools** backed by a **data vault** (Redis lists of “schematics” in the story). Exposed over **A2A** with an **Agent Card** (`/.well-known/agent.json`). |
| **Agent-as-a-tool** | Dispatch calls Architect via **`RemoteA2aAgent` + `AgentTool`** so Dispatch keeps the live session; Architect returns facts, not the whole conversation. |
| **Streaming tool** | Background **`async` generator** (e.g. `monitor_for_hazard`) subscribed by the live runner—proactive alerts from **video frames** on the shared **`LiveRequestQueue`**. |
| **FastAPI `main.py`** | **WebSocket** bridge: PCM audio, JSON text/audio/image → **`LiveRequestQueue`**; **`runner.run_live`**; downstream **`Event`** JSON to the UI (`model_dump_json` / GenAI shapes). |
| **React frontend** | Captures **mic/camera/screen**, streams media, shows traces / status. |
| **Prod (optional)** | **Cloud Run** for Dispatch + Architect; **Memorystore (Redis)** + **VPC connector** for the vault; **`ARCHITECT_URL`** wires Dispatch to the deployed Architect. |

Dependencies called out in the lab include **`google-adk`**, **`google-genai`**, **`a2a-sdk`**, **FastAPI**, **uvicorn**, **redis**, **websockets**, **pydantic**, etc.—aligned with a production-style Python agent service.

### How this maps to OpenClaw Concierge (this project’s intent)

The **Concierge** specs describe a *different product* (onboarding ZIP, OpenClaw files, skill registry), but the **plumbing is the same pattern**:

| Codelab | OpenClaw Concierge (per Master Spec / Implementation Guide) |
| :--- | :--- |
| Dispatch + Live | **Model 1** — consultative **Gemini Multimodal Live** via ADK. |
| Architect + Redis “vault” | A **specialist agent or service** over **allow-listed skills / registry** (deterministic slug lookup—not LLM-invented `clawhub` names). A2A is optional but matches the “remote specialist” shape. |
| Schema-driven handoff | **Model 2** — extraction into **`schema.json`**. |
| Post-conversation / tool completion → backend | **Model 3** — **FastAPI** + templates → **ZIP** (`SOUL.md`, `setup.sh`, …). |
| Streaming “sentinel” | **Optional** for Concierge (e.g. proactive UX or safety); not required for the core “conversation → JSON → ZIP” loop. |
| WebSocket + `run_live` + React | Same **integration style** for a voice-first UI, transcript, and download UX. |

Working through **[Level 4](https://codelabs.developers.google.com/way-back-home-level-4/instructions#0)** on Google’s [`way-back-home`](https://github.com/google-americas/way-back-home/tree/main/level_4) repo gives you runnable code and deployment steps. The **normative mapping** of that stack to Concierge is now in the Master Specification **§8**; **`Documentations/`** here defines **what** the Concierge should do and **which artifacts** (`registry.md`, `schema.json`, …) must line up when you implement or extend that stack.

---

## External references

- OpenClaw documentation: [https://docs.openclaw.ai/](https://docs.openclaw.ai/)

---

*Master Specification and Implementation Guide attributed in those files to Manus AI (2026-03-21).*
