# OpenClaw Concierge — documentation

This repository holds the **full documentation suite** for **OpenClaw Concierge** (**V2.2**): **multi-AI orchestration** that turns a **raw interview transcript** into **`OPENCLAW_ENGINE_SETUP_GUIDE.md`**, plus the **knowledge base** spec for the **optional live Interview Agent**.

There is **no application code** in this checkout—only specs under [`Documentations/`](Documentations/).

---

## Start here (reading order for humans & coding agents)

| # | Document | Purpose |
|---|----------|---------|
| 1 | **This README** | Index, pipeline summary, action steps. |
| 2 | [**Project Master Specification (V2.2)**](Documentations/Project%20Master%20Specification%20(V2.1)_%20OpenClaw%20Concierge%20Technical%20Architecture.md) | **Normative** architecture: Input / Output agents, `schema.json`, security, registry, optional Way Back Home §8, **§10** doc index. |
| 3 | [**Master Execution Blueprint (Kaan To Do) – V2 Deep Dive**](Documentations/Master%20Execution%20Blueprint%20(Kaan%20To%20Do)%20%E2%80%93%20V2%20Deep%20Dive.md) | **`system_knowledge_base/`** layout, `system_prompt.md` / `skill_registry.md` / `domain_knowledge/`, templates, research roadmap, scraper prompts, **registry sync** with runtime. |
| 4 | [**Claude Code Implementation Guide**](Documentations/Claude%20Code%20Implementation%20Guide_%20OpenClaw%20Concierge%20(1).md) | Wire FastAPI, both agents, optional interview, QA checklist. |
| 5 | [**AGENTS.md**](Documentations/AGENTS.md) | **AI coding agents:** invariants, paths, build order, do-not rules. |

---

## End-to-end vision (V2.2 + knowledge base)

```text
[Optional] Live Interview Agent ← system_knowledge_base/system_prompt.md + domain_knowledge/
        ↓ transcript (text)
Input Agent ← input_agent_prompt.md + schema.json
        ↓ validated JSON
Output Agent ← registry.md ⟷ skill_registry.md + templates + openclaw_ref.md
        ↓
OPENCLAW_ENGINE_SETUP_GUIDE.md
```

**Registry rule:** **`system_knowledge_base/skill_registry.md`** and backend **`registry.md`** must list the **same slugs** (one file or sync at build — see Blueprint).

---

## Two-agent orchestration (runtime)

| Agent | Input | Output |
| :--- | :--- | :--- |
| **Input Agent** | Raw **transcript** | **JSON** validated against `schema.json` |
| **Output Agent** | JSON + **registry** | **`OPENCLAW_ENGINE_SETUP_GUIDE.md`** |

**Orchestration** (e.g. FastAPI): validate between steps; return Markdown to the client.

---

## Action steps (operator / implementer)

1. **Build** `system_knowledge_base/` per the **Master Execution Blueprint** (Step 3.0 in Implementation Guide).  
2. **Obtain** transcript (paste, upload, ASR, or export from optional live interview).  
3. **Validate** transcript; run **Input Agent**; **validate JSON** against `schema.json`.  
4. **Output Agent:** deterministic slug lookup + guide generation.  
5. **Deliver** `OPENCLAW_ENGINE_SETUP_GUIDE.md`; user runs steps locally (**zero API key storage** in Concierge).

---

## Artifact map (quick reference)

| Role | Artifact |
| :--- | :--- |
| Interview brain (optional live) | `system_knowledge_base/system_prompt.md` |
| Approved slugs (content + code) | `system_knowledge_base/skill_registry.md` ↔ `registry.md` |
| Scoped scenarios | `system_knowledge_base/domain_knowledge/*.md` |
| Transcript → JSON | `input_agent_prompt.md`, `schema.json` |
| JSON → guide | `output_agent_prompt.md`, `smart_markdown_templates.md`, `openclaw_ref.md` |

---

## Way Back Home — Level 4 (reference only)

[Way Back Home Level 4](https://codelabs.developers.google.com/way-back-home-level-4/instructions#0) / [`way-back-home` repo](https://github.com/google-americas/way-back-home/tree/main/level_4) — patterns for multi-agent, ADK, FastAPI, React. Mapped in Master Specification **§8**; normative path here remains **transcript → two agents → setup guide**.

---

## External references

- OpenClaw documentation: [https://docs.openclaw.ai/](https://docs.openclaw.ai/)

---

*Master Specification, Implementation Guide, and Blueprint amended 2026-03-21 for V2.2 + knowledge-base alignment. Add **AGENTS.md** to your Cursor/Claude rules if you want tools to load it automatically.*
