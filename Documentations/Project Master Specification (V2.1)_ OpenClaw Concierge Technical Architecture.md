# Project Master Specification (V2.2): OpenClaw Concierge Technical Architecture

This document provides a comprehensive, high-fidelity technical architecture for the OpenClaw Concierge system. It is designed for an AI agent to ingest and understand the full system context, data flow, and technical constraints, ensuring accurate implementation.

**V2.2 pivot:** The product is defined as **multi-AI orchestration** with two primary agents: an **Input Agent** that consumes a **raw user interview transcript**, and an **Output Agent** that produces a single canonical **OpenClaw engine setup guide** as **Markdown**. Live voice (e.g. Google ADK / Gemini Live) is **optional** for *capturing* the interview; the orchestration boundary is **transcript → structured contract → guide `.md`**.

**Knowledge base (content track):** The **Master Execution Blueprint** defines **`system_knowledge_base/`** — `system_prompt.md` (optional **Interview Agent**), **`skill_registry.md`** (approved slugs aligned with this spec’s registry), and **`domain_knowledge/`** (scoped use cases). That content **constrains** what the interview may recommend and **grounds** extraction; it is **not** a substitute for **`schema.json`** validation or deterministic Output Agent mapping.

---

## 1. System Architecture Overview

The OpenClaw Concierge is a **two-agent orchestration** system. It turns a **raw interview transcript** into a **personalised OpenClaw engine setup guide** (`OPENCLAW_ENGINE_SETUP_GUIDE.md`), grounded in a **verified skill registry** and **OpenClaw configuration reference**. A thin **orchestration layer** (recommended: FastAPI) sequences the agents, stores intermediate artifacts if needed, and returns the final Markdown to the client.

### 1.1 The Two-Agent Pipeline

1.  **Input Agent:** Ingests the **raw user interview transcript** (plain text). It interprets consultative content, resolves ambiguity where possible, and emits a **single structured JSON object** that conforms to `schema.json`. This JSON is the **only** normative handoff to the Output Agent.
2.  **Output Agent:** Consumes the validated JSON plus deterministic lookups from `registry.md`. It generates **`OPENCLAW_ENGINE_SETUP_GUIDE.md`** — a complete, user-facing Markdown document that explains how to install and configure OpenClaw for this user (OAuth-first flows, `clawhub` commands, tiered transparency, security suite pointers, and links to official docs). Optional: the same pipeline may **attach** code blocks or appendix snippets (e.g. `openclaw.json` fragments) **inside** the guide; a separate ZIP bundle is **optional** and not the primary deliverable.

### 1.2 Orchestration action steps (evaluation)

These steps define **what must happen** in order for the system to fulfil its purpose. They are intended for both **implementers** and **operators**.

| Step | Actor | Action |
|------|--------|--------|
| 1 | Operator / UX | Obtain a **raw transcript** of the user interview (from manual paste, file upload, ASR export, or a prior live session exported to text). Ensure locale, speaker labels, and ordering are preserved if they affect interpretation. |
| 2 | Orchestration | **Validate** input (non-empty, max size, encoding). Assign a **correlation id** for tracing across both agents. |
| 3 | Input Agent | Run **transcript analysis** using `input_agent_prompt.md` (or equivalent system instruction) and **enforce** output against **`schema.json`** (repair / re-ask model if validation fails). Persist or cache structured JSON only according to privacy policy. |
| 4 | Orchestration | **Validate JSON** against `schema.json` programmatically. Reject or retry with Input Agent if invalid. |
| 5 | Output Agent | **Map** `useCases` (and related fields) to **`registry.md`** entries using **deterministic** code (not free-form LLM slug invention). Merge registry rows with template logic from `smart_markdown_templates.md` and syntax rules from `openclaw_ref.md`. |
| 6 | Output Agent | **Generate** `OPENCLAW_ENGINE_SETUP_GUIDE.md` body (Markdown). Apply **§5** security and tier rules in prose and in any embedded commands. |
| 7 | Orchestration | Return the Markdown to the client (HTTP response, storage URL, or CI artifact). Log success/failure; do **not** log raw transcripts in production unless consented. |
| 8 | Operator / User | User follows the guide locally. **No API keys** are stored by Concierge; OAuth / sign-in flows remain user-side per **§5.1**. |

**Failure modes to handle explicitly:** empty transcript; schema validation failure after max retries; registry misses (use Tier 3 transparency — document manual path in the guide); model refusals; partial transcripts.

### 1.3 Optional: live interview capture

If the interview is conducted **live**, any **Google ADK / Gemini Live** (or other realtime stack) session is a **capture mechanism** whose **artifact** is still the **transcript** fed to the Input Agent. The normative architecture does **not** require ADK for V2.2; it remains a **supported** option for generating the transcript.

---

## 2. Input Agent: Transcript → Structured Contract

The Input Agent is responsible for turning **noisy, raw dialogue** into a **machine-readable contract** aligned with OpenClaw onboarding needs.

### 2.1 Core functionality

*   **Transcript ingestion:** Accepts full interview text; may support speaker tags (`Interviewer:` / `User:`) if present.
*   **Consultative interpretation:** Infers user role, pain points, hardware, technical confidence, autonomy preferences, and desired capabilities **even when phrased colloquially**, mirroring the intent of the former consultative interviewer.
*   **Schema-bound extraction:** Outputs JSON matching **`schema.json`** (required fields, types, enums). No additional keys that the Output Agent does not expect, unless versioned in the schema.
*   **Tier tagging:** Assigns or suggests Tier 1–3 for each capability where the schema requires it, consistent with **§5.2**.

### 2.2 Key components

*   **`input_agent_prompt.md`:** System instruction for the Input Agent (transcript-focused). *Replaces the former voice-only framing of `consultative_system_prompt.md`; you may alias or merge prompts if one document covers both “how to interview” and “how to read a transcript.”*
*   **`schema.json`:** JSON Schema for the handoff object (e.g. user context, persona, use cases, hardware, technical level, channels).
*   **LLM runtime:** Implementer’s choice (e.g. Gemini, Claude) with **structured output** or validation loop; latency is typically batch/async.

### 2.3 Optional Interview Agent & `system_knowledge_base/`

When the product includes a **live** interview, the runtime uses **`system_knowledge_base/system_prompt.md`** as the Interview Agent system instruction (conversation flow, decision logic, hardware/security constraints, **mock transcripts** as few-shot style guidance). **`domain_knowledge/*.md`** defines **in-scope** scenarios and warnings; the interviewer should not promise integrations that have no backing use-case file or registry row. The **artifact** handed to the Input Agent remains the **raw transcript** (text). Optional: supply **retrieval-augmented** snippets from `domain_knowledge/` into the Input Agent context for disambiguation — RAG is **non-normative**; schema validation is **normative**.

---

## 3. Inter-Agent Contract (`schema.json`)

The structured JSON emitted by the Input Agent and consumed by the Output Agent is the **single source of truth** between agents.

*   **Validation:** Orchestration MUST validate with a JSON Schema library before invoking the Output Agent.
*   **Versioning:** Bump schema version when fields change; both agents must agree on the same version for a given deployment.

---

## 4. Output Agent: Contract → `OPENCLAW_ENGINE_SETUP_GUIDE.md`

The Output Agent is responsible for **authoring the setup guide** — the user’s executable instructions for standing up OpenClaw — not for holding a conversation.

### 4.1 Core functionality

*   **Registry-backed skill resolution:** Maps extracted use cases to **`registry.md`** rows and emits **exact** `clawhub install <slug>` lines (deterministic lookup).
*   **Guide composition:** Assembles sections such as prerequisites, OAuth / Codex sign-in, skill installation order, Tier 2–3 manual steps, security suite recommendations, and troubleshooting — following **`smart_markdown_templates.md`**.
*   **Technical accuracy:** All `openclaw.json` snippets and channel examples MUST conform to **`openclaw_ref.md`**.
*   **Primary artifact:** One Markdown file, conventionally named **`OPENCLAW_ENGINE_SETUP_GUIDE.md`**.

### 4.2 Key components

*   **`output_agent_prompt.md`:** System instruction for the Output Agent (authoring voice, section order, must-not-hallucinate-slugs rule).
*   **Orchestration API (recommended):** FastAPI (or equivalent) endpoint: `POST` transcript or `POST` pre-validated JSON → returns raw Markdown **or** JSON, e.g. `{ "guide_markdown": "...", "schema_version": "..." }`. **Document** response shape in your API spec for clients.
*   **LLM (optional for prose):** e.g. Gemini 2.5 Pro for narrative glue and personalised explanations; **slug list and commands** come from deterministic code + `registry.md`, not from model recall.
*   **`registry.md`**, **`smart_markdown_templates.md`**, **`openclaw_ref.md`:** Consumed primarily by the Output Agent path. **`registry.md`** MUST list the same **skill slugs** as **`system_knowledge_base/skill_registry.md`** (single source of truth: either one file or a build step that copies/synchronises — see **Master Execution Blueprint** registry sync rule).

### 4.3 Optional packaging

A **ZIP** containing the guide plus generated `SOUL.md` / `setup.sh` / etc. may be offered as a **product extension**; V2.2 treats that as **optional** and does not change the normative primary output.

---

## 5. Technical Constraints & Security

### 5.1 OpenAI "Sign-In" (Codex OAuth)

*   **Zero-Key Storage:** The system strictly adheres to a zero-API-key-storage policy. Users authenticate directly with OpenAI via an official browser-based sign-in (`openclaw onboard --auth-choice openai-codex`). No API keys are ever handled or stored by the Concierge backend or generated files.
*   **Anthropic Restriction Mitigation:** This approach bypasses the recent Anthropic ban on OpenClaw by leveraging the fully supported OpenAI Codex subscription path.

### 5.2 Tiered Transparency

*   **Tier 1 (Native/Easy):** Full setup provided; user only needs to sign in (OAuth) or provide their own API keys.
*   **Tier 2 (Medium/Third-Party):** Configuration provided, but the user is explicitly informed about manual setup steps required for complex API scopes (e.g., creating developer accounts).
*   **Tier 3 (Advanced/Complex):** The guide explains the complexity and provides documentation links for advanced configurations, rather than attempting an auto-setup that might fail or be insecure.

### 5.3 Integrated Security Suite

The generated **setup guide** should recommend the default security layer where applicable:

*   **`agent-trust-hub`:** Intercepts outgoing tool calls to prevent malicious actions (e.g., system file deletion, data exfiltration).
*   **`snyk-scanner`:** Automatically scans new skills or code for known vulnerabilities.
*   **`permission-gatekeeper`:** Requires explicit user permission before sensitive actions. *During interview capture this may be voice/chat; in transcript-only mode, document this behavior in the guide for post-setup use.*

---

## 6. The Skill Registry & Mapping Logic

**`registry.md`** (or a loader pointed at **`system_knowledge_base/skill_registry.md`**) is the authoritative table for OpenClaw **install slugs**. The **Output Agent path** uses it for **deterministic** mapping. The **Interview Agent** (if present) and **domain knowledge** files should reference **only** slugs that appear in this table.

### 6.1 Registry structure

*   **Use Case:** Human-centric description (e.g., "Email Triage & Drafts").
*   **Skill Slugs:** Verified `clawhub` identifiers.
*   **Required API Keys / Setup:** OAuth, PATs, etc.
*   **Description:** Brief explanation.
*   **Tier:** Tier 1, 2, or 3.

### 6.2 Mapping logic

*   **Natural language to technical ID:** Python (or equivalent) maps `useCases` from JSON to `clawhub install` commands using `registry.md`. **Never** rely on the LLM alone for slug strings.
*   **Guide content:** The Output Agent (or template layer) turns each selected row into Markdown subsections (what it does, how to install, what credentials are needed).

---

## 7. Frontend & Integration

The client provides **transcript submission**, **progress**, and **delivery** of the setup guide.

### 7.1 User flow

1.  **Submit transcript:** Paste or upload raw interview text (or trigger export from a completed live session).
2.  **Processing:** Show “Analysing interview…” then “Writing your setup guide…” with optional correlation id for support.
3.  **Deliver:** Display preview of `OPENCLAW_ENGINE_SETUP_GUIDE.md` and offer **download** as `.md` (or optional PDF export outside core spec).
4.  **Optional:** If live capture is integrated, show realtime transcript **and** the same pipeline once the user finalises the transcript.

### 7.2 Key components

*   **React / TypeScript** (or any UI): Form, preview, download.
*   **Orchestration API client:** Calls the backend that chains Input → Output agents.
*   **Optional: Google ADK WebRTC client** — only if product includes live interview capture; not required for transcript-only deployments.

---

## 8. Reference Architecture Alignment: Way Back Home Level 4

This section references [Way Back Home](https://github.com/google-americas/way-back-home) Level 4 and the [Google Codelab](https://codelabs.developers.google.com/way-back-home-level-4/instructions#0) as **patterns** for multi-agent and realtime stacks. Under V2.2, map them as follows:

| Way Back Home Level 4 | OpenClaw Concierge (V2.2) |
|------------------------|---------------------------|
| Dispatch + Gemini Live (bidi) | **Optional** transcript capture + UX; not the core orchestration boundary. |
| Architect + Redis + strict tool output | Analogous to **deterministic registry / vault** behind the **Output Agent** (or a future **Registry Agent** via A2A). |
| Agent-as-a-Tool | Analogous to **chaining specialists** (Input Agent then Output Agent) without merging concerns into one monolith. |
| Post-hoc structured delegation | Aligns with **Input Agent → schema.json → Output Agent**. |
| FastAPI + WebSocket + `run_live` | Useful if Concierge adds **live** preview; **transcript batch** orchestration can use simpler HTTP. |
| React client | **Transcript upload + guide preview**; reuse media patterns only if live capture is in scope. |

---

## 9. Conclusion

The OpenClaw Concierge (V2.2) advances onboarding by **separating interview understanding (Input Agent) from setup authoring (Output Agent)**. The **raw transcript** and the **`schema.json`** contract make the pipeline testable, auditable, and independent of any single vendor’s realtime stack. The **`OPENCLAW_ENGINE_SETUP_GUIDE.md`** is the primary user-facing artifact, with security, tiered transparency, and registry-backed commands preserved. The **Master Execution Blueprint** completes the vision by specifying the **knowledge base** and **interview content** that keep recommendations **on-scope** and **on-registry**.

---

## 10. Documentation index (for implementers and coding agents)

| Document | Audience | Purpose |
|----------|----------|---------|
| [README.md](../README.md) | Everyone | Repo index, quick architecture, action steps. |
| This Master Specification | Engineers / AI | Normative runtime architecture and security. |
| [Master Execution Blueprint (Kaan To Do) – V2 Deep Dive.md](Master%20Execution%20Blueprint%20(Kaan%20To%20Do)%20%E2%80%93%20V2%20Deep%20Dive.md) | Content + engineers | `system_knowledge_base/` manifest, templates, research roadmap, scraper prompts. |
| [Claude Code Implementation Guide_ OpenClaw Concierge (1).md](Claude%20Code%20Implementation%20Guide_%20OpenClaw%20Concierge%20(1).md) | Engineers / Claude Code | Wiring, endpoints, checklist. |
| [AGENTS.md](AGENTS.md) | AI coding agents | Invariants, paths, implementation order, do-not rules. |

**Recommended read order:** README → Master Specification → Master Execution Blueprint → Implementation Guide → AGENTS.md.

---

**Generated by Manus AI (2026-03-21)**  
**Amended (2026-03-21):** Section 8 — Way Back Home Level 4 alignment.  
**Amended (2026-03-21):** **V2.2** — Multi-agent orchestration pivot: Input Agent (transcript), Output Agent (setup guide Markdown); action steps in §1.2; optional live capture.  
**Amended (2026-03-21):** **V2.2 finalized** — §2.3 knowledge base / Interview Agent; §6 registry ↔ `skill_registry.md` sync; §10 documentation index; alignment with Master Execution Blueprint and AGENTS.md.
