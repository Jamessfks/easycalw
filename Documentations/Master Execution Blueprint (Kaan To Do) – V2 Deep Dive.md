# Master Execution Blueprint — Knowledge Base & Interview Phase (V2.2 Aligned)

This document is the **execution plan** for building the **Concierge knowledge base**: the contextual material that powers the **optional live Interview Agent** and constrains **what skills and use cases** the system may recommend. It aligns with the **Project Master Specification (V2.2)** and the **Claude Code Implementation Guide**.

**Where this fits in the full product:**  
V2.2 runtime is **transcript → Input Agent → JSON → Output Agent → `OPENCLAW_ENGINE_SETUP_GUIDE.md`**. The knowledge base here is **not** the orchestration code; it is the **content layer** that (1) shapes **how** the live interview is conducted, and (2) defines **approved scope** (use cases + skills) so extraction and guide generation stay **safe, consistent, and on-registry**.

---

## 1. Document suite order (for humans and coding agents)

Read in this order when implementing or extending the product:

1. **[README.md](../README.md)** — Repository index and action-step summary.  
2. **Project Master Specification (V2.2)** — Normative architecture, security, registry rules, optional Way Back Home patterns.  
3. **This blueprint** — Folder structure, content specs, research roadmap, scraper prompts.  
4. **Claude Code Implementation Guide** — Wiring agents, API, validation, QA checklist.  
5. **[AGENTS.md](AGENTS.md)** — Short rules for AI agents that write code against this repo.

---

## 2. Folder structure & file manifest

Create this structure (content repo or `system_knowledge_base/` inside the app monorepo):

```text
system_knowledge_base/
├── system_prompt.md              # Live Interview Agent brain (optional capture path)
├── skill_registry.md             # Approved slugs + mapping to use cases (must sync with Output Agent registry)
└── domain_knowledge/
    ├── use_case_001_....md
    ├── use_case_002_....md
    └── ... (aim for 50–100 files)
```

### Quantity summary

| Item | Count | Role |
|------|-------|------|
| `system_prompt.md` | 1 | Conversation flow, decision logic, constraints, **2–3 mock transcripts** |
| `skill_registry.md` | 1 | Curated `clawhub` slugs, tiers, setup/API columns, **primary use case** links |
| `domain_knowledge/*.md` | 50–100 | Scoped inspiration: industry, story, required skills, **roadblocks / agent warnings** |

### Registry sync rule (normative for coding)

The **Output Agent** performs **deterministic** `clawhub install` resolution from a registry file. **Use one logical table:**

- **Recommended:** Treat **`system_knowledge_base/skill_registry.md`** as the **source of truth** for human curation; at build or deploy time, materialise **`registry.md`** (same rows) for the backend parser, **or** load the markdown table directly from this path.  
- **Invariant:** Slugs in **`skill_registry.md`**, **`registry.md`**, and generated guides **must match**. Never let the LLM invent slugs not present in this table.

---

## 3. Deep-dive content specifications

### A. `system_prompt.md` (Interview Agent — optional live path)

**Purpose:** Master instruction for the **live** interviewer only. Focus on **conversation flow** and **decision-making**, not on emitting the **Input Agent** handoff JSON (that is **`input_agent_prompt.md` + `schema.json`** in the Implementation Guide).

**Must include:**

1. **Question formulation** — Open-ended probes (e.g. business context, bottlenecks), not checkbox questions like “Do you want email?”  
2. **Decision logic** — How to walk users through OpenClaw capabilities, tools, **effort vs reward**, and **costs** (e.g. Meta Developer account before WhatsApp).  
3. **Constraint checking** — Technical level, security, hardware (Mac Mini vs VPS vs laptop-only → cloud).  
4. **Mock transcripts (required)** — **2–3** full end-to-end examples (spoken tone, roadblocks, trade-offs).

**Template block for mock transcripts:**

```markdown
### Mock Transcript 1: The Non-Technical Restaurant Owner

**User:** "I own a small Italian restaurant..."
**Agent:** "That sounds incredibly stressful..."
```

**Export contract:** When the live session ends, export **plain text transcript** (with speaker labels if possible). That string is the **Input Agent** input per Master Specification §1–2.

---

### B. `domain_knowledge/` (scope and inspiration)

**Purpose:** If a scenario is **not** represented here, the Interview Agent should **not** invent exotic integrations; the Input Agent should **prefer** mapping user intent to **known** use-case narratives and registry-backed skills.

**Each `use_case_XXX_name.md` must contain:**

1. **Industry / domain**  
2. **Specific use case**  
3. **Execution story** — How someone achieved it with OpenClaw (research-backed)  
4. **Roadblocks & agent warnings** — API delays, verification steps, security notes  

**Template:**

```markdown
# Use Case: [Title]

**Industry:** [Name]
**Target Persona:** [Role]

## The Execution Story
[Paragraph(s): tools/skills used, outcome]

## Required Skills
* `skill-slug-a`
* `skill-slug-b`

## Roadblocks and Considerations (Agent Warnings)
* **Hurdle:** [...]
* **Agent Warning:** "[Quoted guidance the agent can paraphrase in the interview or guide]"
```

---

### C. `skill_registry.md` (approved tools)

**Purpose:** Curated allow-list for **conversation**, **extraction grounding**, and **Output Agent** commands.

**Must include:**

1. **Breadth** beyond Tier-1 productivity (marketing, coding, finance, etc. where appropriate).  
2. **Quality bar** — Prefer well-maintained, documented skills; document trust/risk in a column.  
3. **Linkage** — Each row maps to **primary use case(s)** that exist under `domain_knowledge/` (or note “general”).

**Table template:**

```markdown
# OpenClaw Skill Registry (Approved List)

| Skill Slug | Description | Primary Use Case | Required Setup / API Keys | Tier | Rating/Trust |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `github-mcp` | [...] | Local Coding Assistant | GitHub PAT | 2 | High |
```

**Tier column** must align with Master Specification **§5.2** (Tier 1–3 transparency).

---

## 4. Research roadmap (manual / agent-assisted)

To populate `domain_knowledge/`:

1. **Reddit** — `r/openclaw`, `r/LocalLLaMA`, `r/AI_Agents`: “what I built”, setup posts, hurdles.  
2. **GitHub** — OpenClaw discussions, show-and-tell, issues with real workflows.  
3. **Blogs** — OpenClaw / local-agent automation articles (respect copyright; summarise).  
4. **Filter** — Drop dangerous (e.g. unsupervised financial trading) or absurdly niche scope; keep **business and personal productivity** that maps to **registry slugs**.

---

## 5. Scraper / researcher prompt library

Use these when delegating research to another LLM or scraper agent.

### Prompt 1 — Domain knowledge files

> Act as an expert AI systems researcher. Scour Reddit, GitHub Discussions, blogs for **real** OpenClaw (or comparable local agent) use cases by industry. For each use case, output **one** Markdown file following the template in §3.B: Industry, Use Case, Execution Story, Roadblocks. Exclude dangerous or ultra-niche ideas. Tie **Required Skills** to plausible `clawhub`-style slugs you will later verify against `skill_registry.md`.

### Prompt 2 — Skill registry expansion

> Act as a technical auditor. Curate OpenClaw / ClawHub skills: exact install slug, one-line description, primary use case, required keys/accounts, suggested Tier (1–3). Exclude malware, zero-doc, or untrusted repos. Output a **Markdown table** matching §3.C.

### Prompt 3 — Mock transcripts for `system_prompt.md`

> Act as a conversational UX designer for an **OpenClaw Setup Concierge**. Write a realistic **end-to-end** transcript: consultative probes, hardware/cloud trade-offs, effort vs reward, **no** lazy “what do you want” openings. Persona: [insert]. End with enough detail that a downstream **Input Agent** could fill a structured onboarding JSON.

---

## 6. Integration with the V2.2 pipeline (reference)

| Blueprint artifact | Agent / phase | How it is used |
|--------------------|---------------|----------------|
| `system_prompt.md` | **Optional Interview Agent** | System instruction; produces **transcript** artifact. |
| `domain_knowledge/*.md` | **Interview** + **Input Agent** (optional RAG) | Scope + few-shot context; extraction should **align** user intent with known use cases. |
| `skill_registry.md` | **Interview** + **Output Agent** | Single allow-list; backend **deterministic** install lines. |
| `input_agent_prompt.md` | **Input Agent** | Transcript → **`schema.json`** (see Implementation Guide). |
| `output_agent_prompt.md` + templates | **Output Agent** | JSON → **`OPENCLAW_ENGINE_SETUP_GUIDE.md`**. |

**End-to-end flow (final vision):**

1. **Build** `system_knowledge_base/` per this blueprint.  
2. **Run** optional live interview using `system_prompt.md` → **transcript**.  
3. **Run** Input Agent (`input_agent_prompt.md`, `schema.json`) → JSON.  
4. **Run** Output Agent (`registry`/`skill_registry`, templates) → setup guide Markdown.  
5. User executes guide locally; **§5.1** zero-key storage unchanged.

---

## 7. Revision history

| Version | Notes |
|---------|--------|
| V2.2 aligned | Integrated with Master Specification two-agent orchestration; registry sync rule; pipeline table; document suite order; renamed from “Model 1 only” to **Interview phase + knowledge base**. |

---

*Original Kaan / Travis execution notes incorporated and reconciled with OpenClaw Concierge V2.2 (2026-03-21).*
