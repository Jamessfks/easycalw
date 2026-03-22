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
import logging
from pathlib import Path

from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage

logger = logging.getLogger(__name__)

# Directories
_AGENT_DIR = Path(__file__).parent
_CONTEXT_DIR = _AGENT_DIR / "context"
_SYSTEM_PROMPT_PATH = _AGENT_DIR / "system_prompt.md"
_OUTPUT_BASE = Path(os.getenv("GUIDE_OUTPUT_DIR", "/tmp/openclaw-guides"))


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


async def generate_guide(formatted_transcript: str) -> dict:
    """Generate an OpenClaw setup guide from a formatted interview transcript.

    The Claude Agent SDK session gets:
    - cwd = output directory (WRITE access)
    - add_dirs = [context/] (READ-ONLY — agent can Read/Glob/Grep but not Write)

    The agent navigates the knowledge base, reasons across multiple turns,
    and writes output files directly to the output directory.

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

    try:
        result_info = None

        async for msg in query(
            prompt=(
                f"Your working directory contains INTERVIEW_TRANSCRIPT.md — the formatted "
                f"interview from the user.\n\n"
                f"Your read-only knowledge base is at: {context_dir}\n"
                f"Use Glob and Read to explore it. It contains:\n"
                f"- skill_registry.md — the allowlist of skills you may recommend\n"
                f"- openclaw-docs/ — the OpenClaw documentation and skill definitions\n"
                f"- setup_guides/ — reference setup guide documents\n"
                f"- domain_knowledge_final/ — industry use cases and best practices\n"
                f"- templates/ — onboarding guide template with screenshot walkthrough\n\n"
                f"Generate these output files in your working directory:\n"
                f"1. OPENCLAW_ENGINE_SETUP_GUIDE.md — the master setup guide\n"
                f"2. reference_documents/*.md — sub-step docs for complex procedures\n"
                f"3. prompts_to_send.md — initialization prompts for the user's OpenClaw\n\n"
                f"Start by reading the transcript, then explore the knowledge base, "
                f"then generate all output files."
            ),
            options=ClaudeAgentOptions(
                # Output directory — agent writes here
                cwd=str(output_dir),

                # Knowledge base — agent can READ from here, cannot WRITE
                add_dirs=[context_dir],

                system_prompt=system_prompt,

                # Tools: Read/Glob/Grep for navigation, Write for output only
                allowed_tools=["Read", "Write", "Glob", "Grep"],
                disallowed_tools=["Bash", "Edit", "NotebookEdit"],

                # Auto-approve file writes (output dir only)
                permission_mode="acceptEdits",

                # Budget: enough for thorough generation, not unlimited
                max_turns=40,
                max_budget_usd=3.0,

                model="sonnet",
            ),
        ):
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

        # Collect all output files the agent wrote
        outputs = _collect_outputs(output_dir)

        return {
            "guide_id": guide_id,
            "status": "complete",
            "agent": result_info,
            "outputs": outputs,
        }

    except Exception as e:
        logger.error(f"[GUIDE {guide_id}] Agent session failed: {e}")
        return {
            "guide_id": guide_id,
            "status": "error",
            "message": str(e),
            "outputs": _collect_outputs(output_dir),
        }


def _collect_outputs(output_dir: Path) -> dict:
    """Walk the output directory and collect all generated files.

    Returns a dict keyed by relative path, value is file content.
    Skips the input transcript file.
    """
    outputs = {
        "setup_guide": None,
        "reference_documents": [],
        "prompts_to_send": None,
    }

    # Main setup guide
    guide_path = output_dir / "OPENCLAW_ENGINE_SETUP_GUIDE.md"
    if guide_path.exists():
        outputs["setup_guide"] = guide_path.read_text()

    # Reference documents
    ref_dir = output_dir / "reference_documents"
    if ref_dir.is_dir():
        for f in sorted(ref_dir.glob("*.md")):
            outputs["reference_documents"].append({
                "name": f.name,
                "content": f.read_text(),
            })

    # Prompts to send
    prompts_path = output_dir / "prompts_to_send.md"
    if prompts_path.exists():
        outputs["prompts_to_send"] = prompts_path.read_text()

    # Catch any other .md files the agent wrote (unexpected but useful)
    known = {"INTERVIEW_TRANSCRIPT.md", "OPENCLAW_ENGINE_SETUP_GUIDE.md", "prompts_to_send.md"}
    for f in output_dir.glob("*.md"):
        if f.name not in known:
            outputs.setdefault("other_files", []).append({
                "name": f.name,
                "content": f.read_text(),
            })

    return outputs
