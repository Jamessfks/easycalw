from __future__ import annotations
"""Setup Guide Agent — Single-Pass Anthropic API.

Gathers all context in Python, sends ONE API call with tool use for
skill registry lookups only. 10x faster, 5x cheaper than multi-turn.
"""

import os
import re
import uuid
import asyncio
import logging
from pathlib import Path

import anthropic

logger = logging.getLogger(__name__)

_AGENT_DIR = Path(__file__).parent
_CONTEXT_DIR = _AGENT_DIR / "context"
_SYSTEM_PROMPT_PATH = _AGENT_DIR / "system_prompt.md"
_OUTPUT_BASE = Path(os.getenv("GUIDE_OUTPUT_DIR", "./guide_output"))

MODEL = os.getenv("GUIDE_MODEL", "claude-sonnet-4-6")

# ── Context gathering (done in Python, not by the LLM) ────────────────────

def _detect_keywords(transcript: str) -> dict:
    """Extract deployment, channel, industry signals from transcript text."""
    t = transcript.lower()
    result = {}

    # Deployment
    for key, terms in [
        ("mac_mini", ["mac mini", "macmini"]),
        ("docker", ["docker", "container"]),
        ("vps", ["vps", "cloud", "server", "ubuntu", "linux", "aws", "digital ocean"]),
        ("mac", ["mac", "macbook", "imac"]),
    ]:
        if any(term in t for term in terms):
            result["deployment"] = key
            break
    result.setdefault("deployment", "mac")

    # Channel
    for key, terms in [
        ("telegram", ["telegram"]),
        ("whatsapp", ["whatsapp"]),
        ("discord", ["discord"]),
        ("imessage", ["imessage", "i message"]),
        ("slack", ["slack"]),
    ]:
        if any(term in t for term in terms):
            result["channel"] = key
            break
    result.setdefault("channel", "telegram")

    # Industry
    for key, terms in [
        ("healthcare", ["health", "dental", "medical", "hipaa", "patient", "clinic", "doctor", "therapy"]),
        ("realestate", ["real estate", "listing", "property", "realtor", "showing"]),
        ("finance", ["finance", "invoice", "expense", "tax", "accounting", "bookkeep"]),
        ("restaurant", ["restaurant", "cafe", "coffee", "food", "menu", "kitchen", "chef"]),
        ("content", ["content", "newsletter", "social media", "youtube", "blog", "podcast"]),
        ("developer", ["developer", "devops", "ci/cd", "github", "deploy", "code", "engineer"]),
        ("freelancer", ["freelance", "consultant", "client", "invoice"]),
        ("ecommerce", ["ecommerce", "e-commerce", "shop", "product", "listing"]),
    ]:
        if any(term in t for term in terms):
            result["industry"] = key
            break

    # Tools mentioned
    tools = []
    for tool in ["gmail", "google calendar", "google drive", "notion", "slack",
                 "sheets", "crm", "pos", "dentrix", "quickbooks", "stripe"]:
        if tool in t:
            tools.append(tool)
    result["tools"] = tools

    return result


def _gather_context(transcript: str, kb_docs: list[dict]) -> str:
    """Gather all relevant KB context based on transcript analysis."""
    signals = _detect_keywords(transcript)
    ctx = _CONTEXT_DIR

    sections = []

    # 1. Setup guide for their deployment
    deploy_map = {
        "mac_mini": "setup_guides/mac_mini_setup.md",
        "mac": "setup_guides/existing_mac_setup.md",
        "docker": "setup_guides/docker_setup.md",
        "vps": "setup_guides/vps_setup.md",
    }
    deploy_file = ctx / deploy_map.get(signals["deployment"], "setup_guides/existing_mac_setup.md")
    if deploy_file.exists():
        content = deploy_file.read_text()[:6000]
        sections.append(f"## SETUP GUIDE: {deploy_file.name}\n{content}")

    # 2. Channel docs
    channel_file = ctx / f"openclaw-docs/docs/channels/{signals['channel']}.md"
    if channel_file.exists():
        sections.append(f"## CHANNEL: {signals['channel']}\n{channel_file.read_text()[:4000]}")

    # 3. Industry domain knowledge
    industry_map = {
        "healthcare": "domain_knowledge_final/references/healthcare_therapy_intake.md",
        "realestate": "domain_knowledge_final/references/realestate_voice_crm.md",
        "finance": "domain_knowledge_final/references/finance_expense_tracking.md",
        "restaurant": "domain_knowledge_final/references/smallbiz_customer_support.md",
        "content": "domain_knowledge_final/references/content_newsletter_curation.md",
        "developer": "domain_knowledge_final/references/devops_autonomous_dev_agent.md",
        "freelancer": "domain_knowledge_final/references/consulting_client_onboarding.md",
        "ecommerce": "domain_knowledge_final/references/ecommerce_listing_management.md",
    }
    if signals.get("industry") and signals["industry"] in industry_map:
        ind_file = ctx / industry_map[signals["industry"]]
        if ind_file.exists():
            sections.append(f"## INDUSTRY KNOWLEDGE: {signals['industry']}\n{ind_file.read_text()[:3000]}")

    # 4. Skill registry — grep for relevant skills instead of sending the whole file
    skill_file = ctx / "skill_registry.md"
    if skill_file.exists():
        skill_text = skill_file.read_text()
        search_terms = signals.get("tools", []) + [signals.get("channel", ""), signals.get("industry", "")]
        search_terms = [t for t in search_terms if t]
        # Always include core skills
        search_terms.extend(["skill-vetter", "self-improvement", "Tier 1"])

        relevant_lines = []
        for line in skill_text.split("\n"):
            ll = line.lower()
            if any(term.lower() in ll for term in search_terms):
                relevant_lines.append(line)
        if relevant_lines:
            sections.append(f"## RELEVANT SKILLS (from skill_registry.md)\n" + "\n".join(relevant_lines[:80]))

    # 5. Cron jobs (almost always needed)
    cron_file = ctx / "openclaw-docs/docs/automation/cron-jobs.md"
    if cron_file.exists():
        sections.append(f"## AUTOMATION: Cron Jobs\n{cron_file.read_text()[:2500]}")

    # 6. Security
    security_file = ctx / "openclaw-docs/docs/security/THREAT-MODEL-ATLAS.md"
    if security_file.exists():
        sections.append(f"## SECURITY\n{security_file.read_text()[:2000]}")

    # 7. Template (formatting reference)
    template_file = ctx / "templates/onboarding_guide.md"
    if template_file.exists():
        sections.append(f"## OUTPUT TEMPLATE (match this visual style)\n{template_file.read_text()[:3000]}")

    # 8. Semantic KB results (supplementary)
    if kb_docs:
        for item in kb_docs[:3]:
            fpath = _CONTEXT_DIR / item["path"]
            if fpath.exists():
                content = fpath.read_text()[:2000]
                sections.append(f"## KB: {item['path']}\n{content}")

    return "\n\n---\n\n".join(sections)


def _build_system_prompt() -> str:
    """Trimmed system prompt — core instructions only, no tool/turn management."""
    return """You are the OpenClaw Setup Guide Creator. You produce a personalized setup guide from a user interview transcript and pre-gathered knowledge base context.

## Rules
1. Every skill slug MUST come from the skill registry excerpts provided. Never invent slugs.
2. Every CLI command must come from the docs provided. Never guess syntax.
3. NEVER embed real API keys. Use YOUR_<SERVICE>_API_KEY placeholders.
4. If the user didn't mention something, don't assume it. Leave it out or add a prompt asking.
5. Default to "Existing Mac" if hardware unspecified. Default to Telegram if channel unspecified.
6. Use the user's first name naturally. Reference their specific tools and workflows.

## Output Structure — 6 Phases

### EASYCLAW_SETUP.md must follow this structure:

```
# EASYCLAW SETUP GUIDE
**Your Agent. Your Hardware. Your Soul.**

| | |
|---|---|
| **PREPARED FOR** | {name} |
| **MISSION** | {their #1 pain point} |
| **DATE** | {today} |
| **DEPLOYMENT** | {their hardware} |
| **CHANNEL** | {their channel} |
| **MODEL** | claude-sonnet-4-6 |
| **STATUS** | [ INITIALIZING DEPLOYMENT ] |

---

## 🎯 Key Moments
3 bullet points: running instance, tailored automations, industry guardrails.

## Phase 1: Get It Running
Pre-flight security → install → connect model → connect channel → verify "hello"

## Phase 2: Wake Up Your Agent
Prompt 1: introduce + "What do you need to know?"
Install self-improvement skill + memory setup
Prompt 2: tell story + "What do you suggest we set up first?"

## Phase 3: Your Command Center
Prompt 3: "status" command — dashboard, notifications, morning briefing
Customize to THEIR workflow (restaurant: prep/staff, developer: PRs/deploys)

## Phase 4: Connect Your Tools
Prompt 4: step-by-step Google setup (DEDICATED account, never personal)
clawhub install commands (skill-vetter FIRST)
Activate automations from Phase 2

## Phase 5: Set the Rules
Prompt 5: CAN freely / MUST CHECK / NEVER do
Map to what THEY said about autonomy. Conservative defaults.

## Phase 6: Stay Safe
Prompt 6: security audit, skill scanning, credential safety
Always last. Always mandatory.

## Footer
Checkmark summary, command reference table, safety TLDR
```

### prompts_to_send.md
Extract all 6 prompts into a standalone copy-paste file. Same content, just the prompt text in code blocks.

## Style Rules
- Opening impact line referencing THIS user's pain point
- Industry-specific callout boxes (> ⚠️ **WARNING:**, > 💡 **TIP:**, > ✅ **ACTION:**)
- Every CLI command followed by "Verify it worked:" block
- At least 3 callout boxes total
- Adaptive depth: beginners get every step explained, power users get concise commands
- Autonomy tiers: default to Tier 2 (NOTIFY). Never Tier 4 for financial/comms/deletion."""


# ── Main generation ────────────────────────────────────────────────────────

async def generate_guide(
    formatted_transcript: str,
    event_queue=None,
    guide_id: str = None,
    selected_outputs: list[str] | None = None,
) -> dict:
    """Single-pass guide generation. Gathers context in Python, one API call."""
    guide_id = guide_id or str(uuid.uuid4())[:8]
    output_dir = _OUTPUT_BASE / guide_id
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "reference_documents").mkdir(exist_ok=True)

    transcript_path = output_dir / "INTERVIEW_TRANSCRIPT.md"
    transcript_path.write_text(formatted_transcript)

    logger.info(f"[GUIDE {guide_id}] Starting single-pass generation (model={MODEL})")

    # Emit initial progress
    if event_queue:
        await event_queue.put({"type": "progress", "stage": "Analyzing transcript...", "turn": 1, "max_turns": 3})

    # 1. KB semantic search (optional, non-blocking)
    kb_docs = []
    try:
        from setup_guide_agent.kb_search import kb_index
        await kb_index.build()
        kb_docs = await kb_index.search(formatted_transcript, top_k=5)
        logger.info(f"[GUIDE {guide_id}] KB search: {len(kb_docs)} docs")
    except Exception as e:
        logger.warning(f"[GUIDE {guide_id}] KB search skipped: {e}")

    # 2. Gather all context in Python
    if event_queue:
        await event_queue.put({"type": "progress", "stage": "Gathering knowledge base...", "turn": 1, "max_turns": 3})

    context = _gather_context(formatted_transcript, kb_docs)

    # 3. Build selection instruction
    skip_note = ""
    if selected_outputs:
        sel = set(selected_outputs)
        if "prompts" not in sel:
            skip_note += "\nDo NOT generate prompts_to_send.md."
        if "reference_docs" not in sel:
            skip_note += "\nDo NOT generate reference_documents/."

    # 4. Single API call
    if event_queue:
        await event_queue.put({"type": "progress", "stage": "Generating your guide...", "turn": 2, "max_turns": 3})

    system_prompt = _build_system_prompt()
    user_prompt = f"""## Interview Transcript
{formatted_transcript}

## Knowledge Base Context
{context}

## Task
Generate EASYCLAW_SETUP.md and prompts_to_send.md for this user.
{skip_note}

Write each file inside <file> tags:
<file name="EASYCLAW_SETUP.md">
...complete guide content...
</file>

<file name="prompts_to_send.md">
...complete prompts content...
</file>

If complex sub-procedures are needed, add reference docs:
<file name="reference_documents/filename.md">
...content...
</file>"""

    client = anthropic.AsyncAnthropic()

    # Retry with backoff for rate limits
    response = None
    for attempt in range(4):
        try:
            response = await client.messages.create(
                model=MODEL,
                max_tokens=16384,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}],
            )
            break
        except anthropic.RateLimitError:
            if attempt == 3:
                raise
            wait = (attempt + 1) * 20
            logger.warning(f"[GUIDE {guide_id}] Rate limited, waiting {wait}s...")
            if event_queue:
                await event_queue.put({"type": "progress", "stage": f"Rate limited, retrying in {wait}s...", "turn": 2, "max_turns": 3})
            await asyncio.sleep(wait)

    # 5. Parse response — extract files from <file> tags
    raw_text = response.content[0].text
    cost_usd = (response.usage.input_tokens * 3 + response.usage.output_tokens * 15) / 1_000_000

    logger.info(
        f"[GUIDE {guide_id}] Done — "
        f"input={response.usage.input_tokens}, output={response.usage.output_tokens}, "
        f"cost=${cost_usd:.4f}"
    )

    # Parse <file> tags
    files = _parse_file_tags(raw_text)

    # Write files to disk
    for name, content in files.items():
        fpath = output_dir / name
        fpath.parent.mkdir(parents=True, exist_ok=True)
        fpath.write_text(content)
        logger.info(f"[GUIDE {guide_id}] Wrote {name} ({len(content)} chars)")

    # If no <file> tags found, treat entire response as the setup guide
    if not files:
        guide_path = output_dir / "EASYCLAW_SETUP.md"
        guide_path.write_text(raw_text)
        logger.warning(f"[GUIDE {guide_id}] No <file> tags — saved raw response as guide")

    if event_queue:
        await event_queue.put({"type": "progress", "stage": "Finalizing...", "turn": 3, "max_turns": 3, "cost": cost_usd})

    outputs = _collect_outputs(output_dir)

    result = {
        "guide_id": guide_id,
        "status": "complete",
        "agent_turns": 1,
        "agent_cost_usd": cost_usd,
        "outputs": outputs,
    }

    if event_queue:
        await event_queue.put({"type": "complete", "guide_id": guide_id, "cost": cost_usd, "turns": 1})

    return result


def _parse_file_tags(text: str) -> dict[str, str]:
    """Extract file contents from <file name="...">...</file> tags."""
    files = {}
    pattern = r'<file\s+name="([^"]+)">\s*\n?(.*?)\n?\s*</file>'
    for match in re.finditer(pattern, text, re.DOTALL):
        name = match.group(1).strip()
        content = match.group(2).strip()
        files[name] = content
    return files


def _collect_outputs(output_dir: Path) -> dict:
    outputs = {
        "setup_guide": None,
        "reference_documents": [],
        "prompts_to_send": None,
    }

    for name in ("EASYCLAW_SETUP.md", "EASYCLAW_SETUP.txt",
                 "OPENCLAW_ENGINE_SETUP_GUIDE.md", "OPENCLAW_ENGINE_SETUP_GUIDE.txt"):
        p = output_dir / name
        if p.exists():
            outputs["setup_guide"] = p.read_text()
            break

    ref_dir = output_dir / "reference_documents"
    if ref_dir.is_dir():
        seen = set()
        for ext in ("*.md", "*.txt"):
            for f in sorted(ref_dir.glob(ext)):
                if f.stem not in seen:
                    seen.add(f.stem)
                    outputs["reference_documents"].append({"name": f.name, "content": f.read_text()})

    for ext in (".md", ".txt"):
        p = output_dir / f"prompts_to_send{ext}"
        if p.exists():
            outputs["prompts_to_send"] = p.read_text()
            break

    known = {
        "INTERVIEW_TRANSCRIPT.md", "EASYCLAW_SETUP.txt", "EASYCLAW_SETUP.md",
        "OPENCLAW_ENGINE_SETUP_GUIDE.md", "OPENCLAW_ENGINE_SETUP_GUIDE.txt",
        "prompts_to_send.md", "prompts_to_send.txt",
    }
    for pattern in ("*.md", "*.txt"):
        for f in output_dir.glob(pattern):
            if f.name not in known:
                outputs.setdefault("other_files", []).append({"name": f.name, "content": f.read_text()})

    return outputs
