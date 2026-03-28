"""Setup Guide Creation Agent — Claude Agent SDK.

Takes the formatted interview transcript and produces output files
in a per-session directory. The agent has:

- READ-ONLY access to the knowledge base (context/ directory)
- WRITE access to the output directory only (/tmp/openclaw-guides/<id>/)

Output files:
- EASYCLAW_SETUP.md (main deliverable)
- reference_documents/*.md (conditional sub-setup docs)
- prompts_to_send.md (messages to initialize the user's OpenClaw instance)
"""

import os
import uuid
import asyncio
import logging
from pathlib import Path

try:
    from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage
    CLAUDE_SDK_AVAILABLE = True
except ImportError:
    CLAUDE_SDK_AVAILABLE = False
    query = None
    ClaudeAgentOptions = None
    ResultMessage = None

logger = logging.getLogger(__name__)

# Directories
_AGENT_DIR = Path(__file__).parent
_CONTEXT_DIR = _AGENT_DIR / "context"
_SYSTEM_PROMPT_PATH = _AGENT_DIR / "system_prompt.md"
_OUTPUT_BASE = Path(os.getenv("GUIDE_OUTPUT_DIR", "./guide_output"))

# Model selection — Gemini is not supported by the Claude Agent SDK
_configured_model = os.getenv("GUIDE_MODEL", "claude-sonnet-4-6")
if _configured_model.lower().startswith("gemini"):
    logger.warning(
        f"[GUIDE] GUIDE_MODEL={_configured_model!r} is not supported by the Claude Agent SDK. "
        f"Falling back to claude-sonnet-4-6."
    )
    MODEL = "claude-sonnet-4-6"
else:
    MODEL = _configured_model


def _load_system_prompt() -> str:
    """Load the agent's system prompt from disk."""
    try:
        return _SYSTEM_PROMPT_PATH.read_text()
    except FileNotFoundError:
        logger.warning(f"[GUIDE] system_prompt.md not found at {_SYSTEM_PROMPT_PATH}")
        return (
            "You are an expert OpenClaw setup guide creator. "
            "Read the knowledge base in the context/ directory and the interview "
            "transcript, then generate personalized setup output files."
        )


def _classify_stage(msg) -> str:
    """Map an intermediate agent message to a human-readable stage label."""
    cls_name = type(msg).__name__

    if cls_name == "TaskStartedMessage":
        return "Starting agent session..."

    if cls_name == "TaskProgressMessage":
        last_tool = getattr(msg, "last_tool_name", None)
        if last_tool == "Read":
            return "Reading documents..."
        elif last_tool == "Glob":
            return "Scanning knowledge base..."
        elif last_tool == "Grep":
            return "Searching documentation..."
        elif last_tool == "Write":
            return "Writing output files..."
        return "Processing..."

    return "Working..."


def _detect_doc_status(output_dir: Path) -> list[dict]:
    """Check which output docs exist and their sizes. Returns doc_status events."""
    statuses = []
    guide_path = output_dir / "EASYCLAW_SETUP.md"
    if not guide_path.exists():
        guide_path = output_dir / "EASYCLAW_SETUP.txt"
    if not guide_path.exists():
        guide_path = output_dir / "OPENCLAW_ENGINE_SETUP_GUIDE.md"
    if not guide_path.exists():
        guide_path = output_dir / "OPENCLAW_ENGINE_SETUP_GUIDE.txt"
    if guide_path.exists():
        statuses.append({"type": "doc_status", "doc": "setup_guide", "status": "complete", "chars": len(guide_path.read_text())})

    prompts_path = output_dir / "prompts_to_send.md"
    if not prompts_path.exists():
        prompts_path = output_dir / "prompts_to_send.txt"
    if prompts_path.exists():
        statuses.append({"type": "doc_status", "doc": "prompts", "status": "complete", "chars": len(prompts_path.read_text())})

    ref_dir = output_dir / "reference_documents"
    if ref_dir.is_dir():
        ref_files = list(ref_dir.glob("*.txt")) + list(ref_dir.glob("*.md"))
        if ref_files:
            total_chars = sum(len(f.read_text()) for f in ref_files)
            statuses.append({"type": "doc_status", "doc": "reference_docs", "status": "complete", "chars": total_chars, "count": len(ref_files)})

    return statuses


def _build_selection_instruction(selected_outputs: list[str] | None) -> str:
    """Build a prompt instruction limiting which output files the agent generates."""
    if not selected_outputs:
        return ""
    sel = set(selected_outputs)
    all_three = {"setup_guide", "prompts", "reference_docs"}
    if sel >= all_three:
        return ""  # default — generate everything

    parts = []
    if "setup_guide" in sel:
        parts.append("EASYCLAW_SETUP.md")
    if "prompts" in sel:
        parts.append("prompts_to_send.md")
    if "reference_docs" in sel:
        parts.append("reference_documents/*.md")

    skip = []
    if "prompts" not in sel:
        skip.append("prompts_to_send.md")
    if "reference_docs" not in sel:
        skip.append("reference_documents/")

    instruction = f"\n\n⚠️ SELECTIVE GENERATION: Generate ONLY {', '.join(parts)}."
    if skip:
        instruction += f" Do NOT generate {', '.join(skip)}."
    instruction += " This saves budget — skip reading/planning for excluded outputs.\n"
    return instruction


async def generate_guide(
    formatted_transcript: str,
    event_queue = None,
    guide_id: str = None,
    selected_outputs: list[str] | None = None,
) -> dict:
    """Generate an OpenClaw setup guide from a formatted interview transcript.
    Falls back to Gemini if Claude Agent SDK is unavailable.

    Args:
        formatted_transcript: The cleaned interview transcript.
        event_queue: Optional asyncio.Queue for streaming progress events
                     to an SSE endpoint. Events are dicts with type/stage/turn keys.

    Returns:
        Dict with guide_id, status, cost, and output file contents.
    """
    guide_id = guide_id or str(uuid.uuid4())[:8]
    output_dir = _OUTPUT_BASE / guide_id
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "reference_documents").mkdir(exist_ok=True)

    # Write the transcript into the output dir so the agent can read it
    transcript_path = output_dir / "INTERVIEW_TRANSCRIPT.md"
    transcript_path.write_text(formatted_transcript)

    system_prompt = _load_system_prompt()
    context_dir = str(_CONTEXT_DIR.resolve())

    logger.info(f"[GUIDE {guide_id}] Starting agent session")
    logger.info(f"[GUIDE {guide_id}] Output dir: {output_dir}")
    logger.info(f"[GUIDE {guide_id}] Context dir (read-only): {context_dir}")

    # Semantic KB retrieval — pre-select relevant docs to save agent turns
    semantic_context = ""
    try:
        from setup_guide_agent.kb_search import kb_index

        await kb_index.build()
        relevant_docs = await kb_index.search(formatted_transcript, top_k=12)

        context_lines = ["## Pre-selected Knowledge Base (most relevant to this user)\n"]
        for item in relevant_docs[:12]:
            fpath = _CONTEXT_DIR / item["path"]
            if fpath.exists():
                content = fpath.read_text()[:3000]  # truncate very long files
                context_lines.append(
                    f"### {item['path']} (score: {item['score']:.2f})\n{content}\n"
                )

        semantic_context = "\n".join(context_lines)
        logger.info(
            f"[GUIDE {guide_id}] Semantic retrieval: {len(relevant_docs)} docs pre-selected"
        )
    except Exception as e:
        logger.warning(
            f"[GUIDE {guide_id}] Semantic retrieval failed, falling back to keyword index: {e}"
        )
        semantic_context = ""

    turn_count = 0

    try:
        result_info = None

        # Build prompt — include semantic context if available
        semantic_block = ""
        if semantic_context:
            semantic_block = (
                f"\n\n{semantic_context}\n\n"
                f"The above documents were pre-selected as most relevant to this user's interview. "
                f"Use them as your primary reference. You may still read additional files from "
                f"the knowledge base if needed.\n\n"
            )

        selection_instruction = _build_selection_instruction(selected_outputs)

        async for msg in query(
            prompt=(
                f"Your working directory contains INTERVIEW_TRANSCRIPT.md — the formatted "
                f"interview from the user.\n\n"
                f"Your read-only knowledge base is at: {context_dir}\n"
                f"DO NOT Glob the entire knowledge base. Instead, read KNOWLEDGE_INDEX.md first — "
                f"it maps every user need to the exact files to read. Only read files listed in the "
                f"index for this user's specific scenario.\n\n"
                f"The knowledge base contains:\n"
                f"- skill_registry.md — the allowlist of skills you may recommend\n"
                f"- openclaw_skill/ — OpenClaw skill overview and navigation guide\n"
                f"- openclaw-docs/ — full OpenClaw documentation (347 pages); read openclaw-docs/SKILL.md for the lookup strategy\n"
                f"- setup_guides/ — reference setup guide documents (Mac Mini, existing Mac, Docker, VPS)\n"
                f"- domain_knowledge_final/ — industry use cases and best practices\n\n"
                f"Style and format references (read these for output formatting):\n"
                f"- templates/onboarding_guide.md — the reference template for guide structure, section numbering, and visual style\n"
                f"- templates/images/ — UI screenshot images (image1.png through image12.png) that illustrate the onboarding flow\n\n"
                f"{semantic_block}"
                f"Generate these output files in your working directory:\n"
                f"1. EASYCLAW_SETUP.md — the master setup guide\n"
                f"2. reference_documents/*.md — sub-step docs for complex procedures\n"
                f"3. prompts_to_send.md — initialization prompts for the user's OpenClaw\n\n"
                f"{selection_instruction}"
                f"Start by reading the transcript, then explore the knowledge base, "
                f"then generate all output files."
            ),
            options=ClaudeAgentOptions(
                cwd=str(output_dir),
                add_dirs=[context_dir],
                system_prompt=system_prompt,
                allowed_tools=["Read", "Write", "Glob", "Grep"],
                disallowed_tools=["Bash", "Edit", "NotebookEdit"],
                permission_mode="acceptEdits",
                max_turns=40,
                max_budget_usd=3.0,
                model=MODEL,
                cli_path=os.getenv("CLAUDE_CLI_PATH", "/opt/homebrew/bin/claude"),
            ),
        ):
            # Stream intermediate progress to SSE queue
            if isinstance(msg, ResultMessage):
                result_info = {
                    "session_id": msg.session_id,
                    "cost_usd": msg.total_cost_usd,
                    "turns": msg.num_turns,
                    "duration_ms": msg.duration_ms,
                    "is_error": msg.is_error,
                }
                logger.info(
                    f"[GUIDE {guide_id}] Agent finished — "
                    f"turns={msg.num_turns}, cost=${msg.total_cost_usd:.4f}, "
                    f"duration={msg.duration_ms}ms"
                )
                if event_queue is not None:
                    await event_queue.put({
                        "type": "progress",
                        "stage": "Finalizing...",
                        "turn": msg.num_turns,
                        "max_turns": 40,
                        "cost": msg.total_cost_usd,
                    })
            elif event_queue is not None:
                turn_count += 1
                stage = _classify_stage(msg)
                # Extract token/duration info if available
                usage = getattr(msg, "usage", None)
                tokens = getattr(usage, "total_tokens", 0) if usage else 0
                duration = getattr(usage, "duration_ms", 0) if usage else 0

                await event_queue.put({
                    "type": "progress",
                    "stage": stage,
                    "turn": turn_count,
                    "max_turns": 40,
                    "tokens": tokens,
                    "duration_ms": duration,
                })

                # Emit doc_status events when agent writes files
                last_tool = getattr(msg, "last_tool_name", None) if hasattr(msg, "last_tool_name") else None
                if last_tool == "Write":
                    for doc_event in _detect_doc_status(output_dir):
                        await event_queue.put(doc_event)

        # Collect all output files the agent wrote
        outputs = _collect_outputs(output_dir)

        result = {
            "guide_id": guide_id,
            "status": "complete",
            "agent": result_info,
            "outputs": outputs,
        }

        # LLM-as-Judge quality evaluation
        if result["status"] == "complete" and result["outputs"].get("setup_guide"):
            try:
                from guide_evaluator import evaluate_guide as _evaluate_guide

                transcript_text = transcript_path.read_text()
                eval_result = await _evaluate_guide(
                    guide=result["outputs"]["setup_guide"],
                    transcript=transcript_text,
                )
                result["quality_eval"] = {
                    "scores": eval_result.scores,
                    "mean_score": eval_result.mean_score,
                    "passed": eval_result.passed,
                    "notes": eval_result.overall_notes,
                    "rationales": eval_result.rationales,
                }

                # If guide fails quality bar, attempt one patch
                if not eval_result.passed:
                    logger.warning(
                        f"[GUIDE {guide_id}] Quality below threshold "
                        f"({eval_result.mean_score:.2f}) — attempting patch"
                    )
                    worst = min(eval_result.scores, key=eval_result.scores.get)
                    patch_prompt = (
                        f"The setup guide you generated scored poorly on {worst} "
                        f"({eval_result.scores[worst]}/5).\n\n"
                        f"Issue: {eval_result.rationales[worst]}\n\n"
                        f"Please rewrite ONLY the sections that address this weakness. "
                        f"Output the complete improved guide."
                    )
                    import anthropic

                    client = anthropic.AsyncAnthropic()
                    patch_response = await client.messages.create(
                        model=os.getenv("GUIDE_MODEL", "claude-sonnet-4-6"),
                        max_tokens=8192,
                        messages=[
                            {
                                "role": "user",
                                "content": f"{patch_prompt}\n\n{result['outputs']['setup_guide']}",
                            }
                        ],
                    )
                    result["outputs"]["setup_guide"] = patch_response.content[0].text
                    result["quality_eval"]["patched"] = True
                    logger.info(f"[GUIDE {guide_id}] Guide patched for {worst}")
            except Exception as e:
                logger.warning(f"[GUIDE {guide_id}] Quality evaluation failed: {e}")

        if event_queue is not None:
            await event_queue.put({
                "type": "complete",
                "guide_id": guide_id,
                "cost": result_info.get("cost_usd", 0) if result_info else 0,
                "turns": result_info.get("turns", 0) if result_info else 0,
            })

        return result

    except Exception as e:
        err_msg = str(e)
        logger.error(f"[GUIDE {guide_id}] Agent session failed: {e}")
        # NOTE: Gemini 2.5 Pro fallback disabled — free tier quota exhausted (429).
        # TODO(production): Re-enable once Google AI billing is activated.
        # if any(x in err_msg for x in ["exit code", "Command failed", "authentication", "bundled"]):
        #     logger.warning(f"[GUIDE {guide_id}] Claude SDK failed — switching to Gemini 2.5 Pro fallback")
        #     try:
        #         from setup_guide_agent.gemini_agent import generate_guide_gemini
        #         return await generate_guide_gemini(formatted_transcript, event_queue=event_queue)
        #     except Exception as gemini_err:
        #         logger.error(f"[GUIDE {guide_id}] Gemini fallback failed: {gemini_err}")
        #         err_msg = f"Claude and Gemini both failed: {gemini_err}"
        if event_queue is not None:
            await event_queue.put({"type": "error", "message": err_msg})
        return {
            "guide_id": guide_id,
            "status": "error",
            "message": err_msg,
            "outputs": _collect_outputs(output_dir),
        }


def _collect_outputs(output_dir: Path) -> dict:
    """Walk the output directory and collect all generated files (.md preferred, .txt fallback)."""
    outputs = {
        "setup_guide": None,
        "reference_documents": [],
        "prompts_to_send": None,
    }

    # Setup guide — prefer new name, fall back to old
    for name in ("EASYCLAW_SETUP.md", "EASYCLAW_SETUP.txt",
                 "OPENCLAW_ENGINE_SETUP_GUIDE.md", "OPENCLAW_ENGINE_SETUP_GUIDE.txt"):
        guide_path = output_dir / name
        if guide_path.exists():
            outputs["setup_guide"] = guide_path.read_text()
            break

    # Reference documents — collect both .txt and .md
    ref_dir = output_dir / "reference_documents"
    if ref_dir.is_dir():
        seen = set()
        for ext in ("*.md", "*.txt"):
            for f in sorted(ref_dir.glob(ext)):
                stem = f.stem
                if stem not in seen:
                    seen.add(stem)
                    outputs["reference_documents"].append({
                        "name": f.name,
                        "content": f.read_text(),
                    })

    # Prompts — prefer .md, fall back to .txt
    for ext in (".md", ".txt"):
        prompts_path = output_dir / f"prompts_to_send{ext}"
        if prompts_path.exists():
            outputs["prompts_to_send"] = prompts_path.read_text()
            break

    known = {
        "INTERVIEW_TRANSCRIPT.md",
        "EASYCLAW_SETUP.txt", "EASYCLAW_SETUP.md",
        "OPENCLAW_ENGINE_SETUP_GUIDE.md", "OPENCLAW_ENGINE_SETUP_GUIDE.txt",
        "prompts_to_send.md", "prompts_to_send.txt",
    }
    for pattern in ("*.md", "*.txt"):
        for f in output_dir.glob(pattern):
            if f.name not in known:
                outputs.setdefault("other_files", []).append({
                    "name": f.name,
                    "content": f.read_text(),
                })

    return outputs
