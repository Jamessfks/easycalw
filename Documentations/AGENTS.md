# Instructions for AI coding agents (OpenClaw Concierge)

Use this file when generating or modifying **application code** for OpenClaw Concierge. The repo may contain **documentation only**; still follow these rules so future code matches the specs.

---

## 1. Source of truth (read before coding)

| Priority | Document | What you take from it |
|----------|----------|------------------------|
| 1 | `Documentations/Project Master Specification (V2.1)_ OpenClaw Concierge Technical Architecture.md` | **Normative** architecture: Input Agent → `schema.json` → Output Agent → `OPENCLAW_ENGINE_SETUP_GUIDE.md`, security §5, tiers, optional Way Back Home §8. |
| 2 | `Documentations/Claude Code Implementation Guide_ OpenClaw Concierge (1).md` | API shape, validation order, artifact filenames, QA checklist. |
| 3 | `Documentations/Master Execution Blueprint (Kaan To Do) – V2 Deep Dive.md` | **`system_knowledge_base/`** layout, content rules, registry sync, research prompts. |

**README.md** — Entry point and human-oriented summary only; do not contradict the Master Specification.

---

## 2. Non-negotiable invariants

1. **Transcript → validate → JSON → validate schema → Output Agent.** Never pass unvalidated JSON downstream.  
2. **`clawhub install <slug>` lines** come from **registry data** (e.g. `skill_registry.md` / `registry.md`), **not** from LLM memory. Implement **deterministic** lookup in code.  
3. **Zero API key storage** in Concierge backends; OAuth / Codex flows are **user-side** per Master Specification §5.1.  
4. **Tier 1–3** copy and behavior must match §5.2 in guides and prompts.  
5. **Primary user artifact** is **`OPENCLAW_ENGINE_SETUP_GUIDE.md`** (Markdown). ZIP bundles are optional.

---

## 3. Artifact paths (when you create the repo tree)

```
system_knowledge_base/
  system_prompt.md          # Optional live Interview Agent
  skill_registry.md         # Allow-list; sync with backend registry loader
  domain_knowledge/*.md     # Scoped use cases

# Orchestration / prompts (may live beside code)
input_agent_prompt.md
output_agent_prompt.md
schema.json
smart_markdown_templates.md
openclaw_ref.md
registry.md                   # Same slugs as skill_registry.md if duplicated
```

If both `registry.md` and `skill_registry.md` exist, **keep slugs identical** or **load one from the other** at build time.

---

## 4. What to implement first (suggested order)

1. JSON Schema validation + `POST` transcript → internal pipeline stub.  
2. Input Agent integration with `input_agent_prompt.md`.  
3. Registry parser + unit tests for slug extraction from markdown table.  
4. Output Agent + template merge → Markdown response.  
5. Optional: live interview service loading `system_knowledge_base/system_prompt.md` and emitting transcript text into the same Input Agent entrypoint.

---

## 5. Do not

- Invent skill slugs not in the approved registry table.  
- Store user API keys or Codex secrets in your database or logs.  
- Skip schema validation between agents.  
- Change Master Specification security tiers without updating prompts and templates.

---

*Aligned with Concierge V2.2 and Master Execution Blueprint (2026-03-21).*
