# Interview contract spec: `INTERVIEW_CONTRACT.md`

**Role:** Normative **wire format** between the **Input Agent** and **Output Agent**.  
**Rationale:** Markdown handoffs typically use **fewer tokens** than JSON in LLM prompts and responses (often on the order of **~15%** savings), improving cost and context efficiency while staying human-auditable.

---

## 1. Canonical filename

| Context | Filename |
|--------|----------|
| Runtime artifact (Input Agent output) | **`INTERVIEW_CONTRACT.md`** |
| This specification | `interview_contract_spec.md` |

---

## 2. Required structure

The Input Agent MUST emit **valid Markdown** with **exactly these level-2 headings** (order preserved), each followed by body content (lists or prose as appropriate):

1. `## Schema version` — e.g. `1` or semver string; must match deployment expectations.
2. `## User context` — role, goals, constraints (prose).
3. `## Use cases` — bullet list of desired capabilities / workflows (maps to registry lookup).
4. `## Hardware` — devices, OS, limits.
5. `## Technical level` — enum or prose aligned with guide tailoring (e.g. beginner / intermediate / advanced).
6. `## Channels and preferences` — messaging surfaces, models, autonomy where relevant.
7. `## Tier notes` — Tier 1–3 expectations per capability where applicable (Master Spec §5.2).

Implementations MAY add `###` subheadings **under** these sections but MUST NOT omit or rename the `##` headings above.

---

## 3. Optional strict validation (`schema.json`)

`schema.json` remains the **logical field model** for tests and strict pipelines:

1. Parse `INTERVIEW_CONTRACT.md` into a structured object (or extract fields with a small parser).
2. Validate that object with a JSON Schema library **if** the deployment requires byte-for-byte type checks.
3. On parse/validation failure: bounded retry against the Input Agent with a repair hint.

**Normative gate for the Output Agent:** the contract MUST pass **section presence + non-empty critical sections** (at minimum `## Use cases` and `## Technical level`). Whether step (2) is mandatory is a **product flag**; Markdown-first handoff is the default per [architecture_decision.md](architecture_decision.md).

---

## 4. Output Agent consumption

The Output Agent receives **`INTERVIEW_CONTRACT.md` as Markdown in context** (not JSON), plus tools that:

- Resolve `## Use cases` lines to **`registry.md`** rows deterministically (parser may pass structured rows to tools).
- Load template sections from `smart_markdown_templates.md` and snippets from `openclaw_ref.md`.

---

## 5. Example skeleton (non-normative excerpt)

```markdown
## Schema version
1

## User context
...

## Use cases
- Email triage and drafts
- Calendar scheduling

## Hardware
...

## Technical level
intermediate

## Channels and preferences
...

## Tier notes
...
```

---

*Aligned with OpenClaw Concierge V2.2 + architecture decision (Markdown inter-agent handoff).*
