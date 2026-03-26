"""Gemini 2.5 Pro fallback guide generator.

Used when ANTHROPIC_API_KEY is unavailable or rate-limited.
Takes the same formatted transcript input, produces the same 3 output files.
Single large prompt instead of multi-turn agent — faster but less iterative.
"""

import os
import uuid
import asyncio
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

_AGENT_DIR = Path(__file__).parent
_CONTEXT_DIR = _AGENT_DIR / "context"
_SYSTEM_PROMPT_PATH = _AGENT_DIR / "system_prompt.md"
_OUTPUT_BASE = Path(os.getenv("GUIDE_OUTPUT_DIR", "./guide_output"))

# Read key KB files for context injection
_KB_ESSENTIALS = [
    "KNOWLEDGE_INDEX.md",
    "skill_registry.md",
    "setup_guides/existing_mac_setup.md",
    "setup_guides/mac_mini_setup.md",
    "openclaw_skill/README.md",
]


def _load_kb_context() -> str:
    """Load essential KB files into a context block."""
    parts = []
    for fname in _KB_ESSENTIALS:
        fpath = _CONTEXT_DIR / fname
        if fpath.exists():
            content = fpath.read_text()[:4000]  # truncate large files
            parts.append(f"## {fname}\n{content}\n")
    return "\n".join(parts)


async def generate_guide_gemini(
    formatted_transcript: str,
    event_queue=None,
) -> dict:
    """Generate a setup guide using Gemini 2.5 Pro (Anthropic fallback)."""
    import google.generativeai as genai

    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key:
        return {"guide_id": "error", "status": "error", "message": "No GEMINI_API_KEY set"}

    genai.configure(api_key=gemini_key)

    guide_id = str(uuid.uuid4())[:8]
    output_dir = _OUTPUT_BASE / guide_id
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "reference_documents").mkdir(exist_ok=True)

    transcript_path = output_dir / "INTERVIEW_TRANSCRIPT.md"
    transcript_path.write_text(formatted_transcript)

    system_prompt = _SYSTEM_PROMPT_PATH.read_text() if _SYSTEM_PROMPT_PATH.exists() else ""
    kb_context = _load_kb_context()

    prompt = f"""{system_prompt}

---

## Knowledge Base (Essential Files)
{kb_context}

---

## Interview Transcript
{formatted_transcript}

---

## Your Task
Generate all 3 output files. Return them in this EXACT format:

===FILE: OPENCLAW_ENGINE_SETUP_GUIDE.md===
[full setup guide content here]
===END===

===FILE: prompts_to_send.md===
[prompts content here]
===END===

===FILE: reference_documents/telegram_bot_setup.md===
[reference doc content if needed, skip if not relevant]
===END===

Generate all files now. Be thorough and personalized to this specific user.
"""

    if event_queue:
        await event_queue.put({"type": "progress", "stage": "Starting Gemini guide generation...", "turn": 1, "max_turns": 10})

    try:
        model = genai.GenerativeModel("gemini-2.5-pro-exp-03-25")
        response = await asyncio.to_thread(
            model.generate_content,
            prompt,
            generation_config=genai.types.GenerationConfig(max_output_tokens=32768),
        )
        raw = response.text

        if event_queue:
            await event_queue.put({"type": "progress", "stage": "Writing output files...", "turn": 8, "max_turns": 10})

        # Parse the file blocks
        outputs = {"setup_guide": None, "reference_documents": [], "prompts_to_send": None}
        import re
        blocks = re.findall(r'===FILE: (.+?)===\n(.*?)===END===', raw, re.DOTALL)

        for filename, file_content in blocks:
            filename = filename.strip()
            content = file_content.strip()
            (output_dir / filename).parent.mkdir(parents=True, exist_ok=True)
            (output_dir / filename).write_text(content)

            if filename == "OPENCLAW_ENGINE_SETUP_GUIDE.md":
                outputs["setup_guide"] = content
            elif filename == "prompts_to_send.md":
                outputs["prompts_to_send"] = content
            elif filename.startswith("reference_documents/"):
                outputs["reference_documents"].append({"name": Path(filename).name, "content": content})

        # Fallback: if parsing failed, use whole response as guide
        if not outputs["setup_guide"] and len(raw) > 500:
            outputs["setup_guide"] = raw
            (output_dir / "OPENCLAW_ENGINE_SETUP_GUIDE.md").write_text(raw)

        if event_queue:
            await event_queue.put({"type": "complete", "guide_id": guide_id})

        logger.info(f"[GEMINI GUIDE {guide_id}] Complete — {len(outputs.get('setup_guide', ''))} chars")

        return {
            "guide_id": guide_id,
            "status": "complete",
            "model": "gemini-2.5-pro",
            "outputs": outputs,
        }

    except Exception as e:
        logger.error(f"[GEMINI GUIDE {guide_id}] Failed: {e}")
        if event_queue:
            await event_queue.put({"type": "error", "message": str(e)})
        return {"guide_id": guide_id, "status": "error", "message": str(e), "outputs": {}}
