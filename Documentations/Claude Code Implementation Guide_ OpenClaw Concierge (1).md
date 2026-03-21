# Claude Code Implementation Guide: OpenClaw Concierge

This guide explains how to use the **documentation suite** to build OpenClaw Concierge with Claude Code. It follows **V2.2** (two-agent orchestration) and the **Master Execution Blueprint** (knowledge base + optional interview).

---

## 0. Documentation suite (read first)

| Order | Document | Role |
|-------|----------|------|
| 1 | [README.md](../README.md) | Index and action-step summary. |
| 2 | [Project Master Specification (V2.2)](Project%20Master%20Specification%20(V2.1)_%20OpenClaw%20Concierge%20Technical%20Architecture.md) | Normative architecture, security, registry rules. |
| 3 | [Master Execution Blueprint (Kaan To Do) – V2 Deep Dive](Master%20Execution%20Blueprint%20(Kaan%20To%20Do)%20%E2%80%93%20V2%20Deep%20Dive.md) | **`system_knowledge_base/`** structure, content specs, research prompts. |
| 4 | This Implementation Guide | Code wiring, API, QA. |
| 5 | [AGENTS.md](AGENTS.md) | **Coding-agent** invariants and file paths. |

---

## 1. Project overview

The OpenClaw Concierge is a **two-agent orchestration** system:

*   **Input Agent:** Reads a **raw user interview transcript** and produces **structured JSON** validated against `schema.json`.
*   **Output Agent:** Reads that JSON and the **skill registry** (`registry.md` and/or `system_knowledge_base/skill_registry.md`), and produces **`OPENCLAW_ENGINE_SETUP_GUIDE.md`**.

**Optional upstream:** A **live Interview Agent** uses **`system_knowledge_base/system_prompt.md`** (+ domain files for scope) and exports a **transcript** into the same Input Agent pipeline.

A small **orchestration service** (recommended: FastAPI) validates the schema between agents and returns the final guide. **Live voice** (e.g. Google ADK) is optional for capture only.

---

## 2. Artifact mapping for Claude Code

### Runtime / code artifacts

| Document | File name | Role | Use in Claude Code |
| :--- | :--- | :--- | :--- |
| **Skill registry (deterministic)** | `registry.md` *or* `system_knowledge_base/skill_registry.md` | Verified slugs for `clawhub install`. | Parse table in code; **sync** with knowledge base per Blueprint. |
| **Input Agent instruction** | `input_agent_prompt.md` | Transcript → JSON per `schema.json`. | System prompt for Input Agent. |
| **Output Agent instruction** | `output_agent_prompt.md` | Authoring voice for setup guide. | System prompt for Output Agent. |
| **Structured handoff** | `schema.json` | JSON Schema between agents. | Validate before Output Agent runs. |
| **Guide templates** | `smart_markdown_templates.md` | Sections for `OPENCLAW_ENGINE_SETUP_GUIDE.md`. | Template merge + optional LLM glue. |
| **Config reference** | `openclaw_ref.md` | `openclaw.json` / channel accuracy. | Validate embedded snippets. |

### Knowledge base (content track — build before or in parallel)

| Path | Role |
| :--- | :--- |
| `system_knowledge_base/system_prompt.md` | Optional **Interview Agent**; conversation flow + mock transcripts. |
| `system_knowledge_base/skill_registry.md` | Curated table; **must align** with backend `registry.md`. |
| `system_knowledge_base/domain_knowledge/*.md` | Scoped use cases, warnings, required skills. |

*Legacy:* `consultative_system_prompt.md` may be merged into `system_prompt.md` (live) or `input_agent_prompt.md` (transcript tone).

---

## 3. Implementation workflow

### Step 3.0: Build the knowledge base (content)

Follow the **Master Execution Blueprint**: create `system_knowledge_base/`, populate `system_prompt.md`, `skill_registry.md`, and 50–100 `domain_knowledge` files using the templates and research roadmap. **Materialise or symlink** `registry.md` from `skill_registry.md` for the backend parser.

### Step 3.1: Initialize the project

Scaffold **orchestration API** (FastAPI) and minimal **UI** (transcript paste/upload, progress, Markdown preview/download). Add JSON Schema validation.

### Step 3.2: Implement the Input Agent

1. Accept raw transcript (+ optional metadata).  
2. Run model with `input_agent_prompt.md`; optional **RAG** over `domain_knowledge/` for disambiguation (non-normative).  
3. Validate output against `schema.json`; retry or error.  
4. Never pass invalid JSON to the Output Agent.

### Step 3.3: Implement the Output Agent

1. **Deterministic** skill resolution: map JSON `useCases` to registry rows in **code**.  
2. Generate **`OPENCLAW_ENGINE_SETUP_GUIDE.md`** with `output_agent_prompt.md` + `smart_markdown_templates.md` + `openclaw_ref.md`.  
3. Enforce Master Specification **§5** (OAuth-first, tiers).

### Step 3.4: Wire orchestration

`POST /v1/guide` with `{ "transcript": "..." }` → Input Agent → validate → Output Agent → `{ "guide_markdown": "...", "schema_version": "..." }`.

### Step 3.5: Optional live interview

Load `system_knowledge_base/system_prompt.md` into the Interview Agent; on session end, **export transcript text** to the **same** Input Agent entrypoint as paste/upload.

### Step 3.6: Frontend

Transcript submission, loading states, sanitised Markdown preview, download `.md`.

---

## 4. Orchestration action steps (checklist)

(See Master Specification **§1.2** for full table.)

1. Transcript validated (size, encoding).  
2. Input Agent → JSON → **schema** validation passes.  
3. Registry lookup covers every use case or Tier 3 fallback in guide.  
4. All `clawhub` lines from registry table, not model-invented.  
5. OAuth / Codex path documented; no keys stored server-side.  
6. Deliver `OPENCLAW_ENGINE_SETUP_GUIDE.md` (or API field).

---

## 5. Final verification

1. Sample transcripts → valid JSON.  
2. Guide readable for a non-expert.  
3. Every install slug matches **`registry.md` / `skill_registry.md`**.  
4. Snippets match `openclaw_ref.md`.  
5. Tier 2/3 include manual steps or links.  
6. **Knowledge base:** mock transcripts in `system_prompt.md`; domain files reference only approved slugs.

---

**Generated by Manus AI (2026-03-21)**  
**Amended (2026-03-21):** V2.2 two-agent orchestration.  
**Amended (2026-03-21):** **Finalized** — Master Execution Blueprint integration, §0 suite order, Step 3.0 knowledge base, `skill_registry.md` sync, AGENTS.md pointer.
