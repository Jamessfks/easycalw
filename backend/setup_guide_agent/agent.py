"""Setup Guide Creation Agent — Claude Agent SDK.

Takes the formatted interview transcript and produces output files
in a per-session directory. The agent has:

- READ-ONLY access to the knowledge base (context/ directory)
- WRITE access to the output directory only (/tmp/openclaw-guides/<id>/)

Output files:
- OPENCLAW_ENGINE_SETUP_GUIDE.md (main deliverable)
- reference_documents/*.md (conditional sub-setup docs)
- prompts_to_send.md (messages to initialize the user's OpenClaw instance)
"""

import os
import uuid
import asyncio
import logging
from pathlib import Path

from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage

logger = logging.getLogger(__name__)

# Directories
_AGENT_DIR = Path(__file__).parent
_CONTEXT_DIR = _AGENT_DIR / "context"
_SYSTEM_PROMPT_PATH = _AGENT_DIR / "system_prompt.md"
_OUTPUT_BASE = Path(os.getenv("GUIDE_OUTPUT_DIR", "./guide_output"))


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
    # Try to extract what the agent is doing from the message
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


async def generate_guide(
    formatted_transcript: str,
    event_queue: asyncio.Queue | None = None,
) -> dict:
    """Generate an OpenClaw setup guide from a formatted interview transcript.

    Args:
        formatted_transcript: The cleaned interview transcript.
        event_queue: Optional asyncio.Queue for streaming progress events
                     to an SSE endpoint. Events are dicts with type/stage/turn keys.

    Returns:
        Dict with guide_id, status, cost, and output file contents.
    """
    guide_id = str(uuid.uuid4())[:8]
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

    turn_count = 0

    try:
        result_info = None

        async for msg in query(
            prompt=(
                f"Your working directory contains INTERVIEW_TRANSCRIPT.md — the formatted "
                f"interview from the user.\n\n"
                f"Your read-only knowledge base is at: {context_dir}\n"
                f"Use Glob and Read to explore it. It contains:\n"
                f"- skill_registry.md — the allowlist of skills you may recommend\n"
                f"- openclaw_skill/ — OpenClaw skill overview and navigation guide\n"
                f"- openclaw-docs/ — full OpenClaw documentation (347 pages); read openclaw-docs/SKILL.md for the lookup strategy\n"
                f"- setup_guides/ — reference setup guide documents (Mac Mini, existing Mac, Docker, VPS)\n"
                f"- domain_knowledge_final/ — industry use cases and best practices\n\n"
                f"Style and format references (read these for output formatting):\n"
                f"- templates/onboarding_guide.md — the reference template for guide structure, section numbering, and visual style\n"
                f"- templates/images/ — UI screenshot images (image1.png through image12.png) that illustrate the onboarding flow\n\n"
                f"Generate these output files in your working directory:\n"
                f"1. OPENCLAW_ENGINE_SETUP_GUIDE.md — the master setup guide\n"
                f"2. reference_documents/*.md — sub-step docs for complex procedures\n"
                f"3. prompts_to_send.md — initialization prompts for the user's OpenClaw\n\n"
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
                model="sonnet",
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

        # Collect all output files the agent wrote
        outputs = _collect_outputs(output_dir)

        if event_queue is not None:
            await event_queue.put({
                "type": "complete",
                "guide_id": guide_id,
                "cost": result_info.get("cost_usd", 0) if result_info else 0,
                "turns": result_info.get("turns", 0) if result_info else 0,
            })

        return {
            "guide_id": guide_id,
            "status": "complete",
            "agent": result_info,
            "outputs": outputs,
        }

    except Exception as e:
        logger.error(f"[GUIDE {guide_id}] Agent session failed: {e}")
        if event_queue is not None:
            await event_queue.put({
                "type": "error",
                "message": str(e),
            })
        return {
            "guide_id": guide_id,
            "status": "error",
            "message": str(e),
            "outputs": _collect_outputs(output_dir),
        }


def _collect_outputs(output_dir: Path) -> dict:
    """Walk the output directory and collect all generated files."""
    outputs = {
        "setup_guide": None,
        "reference_documents": [],
        "prompts_to_send": None,
    }

    guide_path = output_dir / "OPENCLAW_ENGINE_SETUP_GUIDE.md"
    if guide_path.exists():
        outputs["setup_guide"] = guide_path.read_text()

    ref_dir = output_dir / "reference_documents"
    if ref_dir.is_dir():
        for f in sorted(ref_dir.glob("*.md")):
            outputs["reference_documents"].append({
                "name": f.name,
                "content": f.read_text(),
            })

    prompts_path = output_dir / "prompts_to_send.md"
    if prompts_path.exists():
        outputs["prompts_to_send"] = prompts_path.read_text()

    known = {"INTERVIEW_TRANSCRIPT.md", "OPENCLAW_ENGINE_SETUP_GUIDE.md", "prompts_to_send.md"}
    for f in output_dir.glob("*.md"):
        if f.name not in known:
            outputs.setdefault("other_files", []).append({
                "name": f.name,
                "content": f.read_text(),
            })

    return outputs
