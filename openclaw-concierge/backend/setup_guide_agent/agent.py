"""Setup Guide Creation Agent — RocketRide multi-step pipeline.

Takes the formatted interview transcript and produces:
- OPENCLAW_ENGINE_SETUP_GUIDE.md (main deliverable)
- reference_documents/ (conditional sub-setup docs)
- prompts_to_send.md (messages to initialize the user's OpenClaw instance)

Orchestrated via RocketRide with 3 sequential LLM calls through Anthropic Claude.
"""

import os
import re
import uuid
import logging
from pathlib import Path

from rocketride import RocketRideClient

logger = logging.getLogger(__name__)

ROCKETRIDE_URI = os.getenv("ROCKETRIDE_URI", "ws://localhost:5565")
ROCKETRIDE_KEY = os.getenv("ROCKETRIDE_APIKEY", "")

# Load system prompt and references from files (other team provides real versions)
_AGENT_DIR = Path(__file__).parent
_SYSTEM_PROMPT_PATH = _AGENT_DIR / "system_prompt.md"
_REFERENCES_PATH = _AGENT_DIR / "setup_references.md"


def _load_file(path: Path, fallback: str) -> str:
    """Load a text file, returning fallback if missing."""
    try:
        return path.read_text()
    except FileNotFoundError:
        logger.warning(f"[GUIDE] File not found: {path}, using fallback")
        return fallback


def _build_pipeline(system_prompt: str, anthropic_key: str) -> dict:
    """Build a RocketRide pipeline for a single LLM call.

    We run 3 separate pipelines sequentially (main guide, reference docs,
    prompts) so each step can use the output of the previous one as context.
    """
    return {
        "components": [
            {
                "id": "webhook_1",
                "provider": "webhook",
                "config": {
                    "hideForm": True,
                    "mode": "Source",
                    "type": "webhook",
                },
            },
            {
                "id": "llm_anthropic_1",
                "provider": "llm_anthropic",
                "config": {
                    "profile": "claude-sonnet-4-6",
                    "claude-sonnet-4-6": {"apikey": anthropic_key},
                    "system_prompt": system_prompt,
                },
                "input": [{"lane": "text", "from": "webhook_1"}],
            },
            {
                "id": "response_1",
                "provider": "response",
                "config": {"lanes": []},
                "input": [{"lane": "answers", "from": "llm_anthropic_1"}],
            },
        ],
        "source": "webhook_1",
        "project_id": "openclaw-guide",
    }


async def _run_pipeline(client: RocketRideClient, system_prompt: str,
                         anthropic_key: str, user_input: str) -> str:
    """Execute a single RocketRide LLM pipeline and return the result."""
    pipeline = _build_pipeline(system_prompt, anthropic_key)
    token = await client.use(pipeline)
    result = await client.send(
        token,
        user_input,
        objinfo={"name": "input.md"},
        mimetype="text/plain",
    )
    await client.terminate(token)
    return result


def _parse_reference_docs(raw_output: str) -> list[dict]:
    """Parse the reference docs LLM output into individual documents.

    Expected format from LLM:
    --- FILE: filename.md ---
    <content>
    --- FILE: another.md ---
    <content>
    """
    docs = []
    parts = re.split(r"---\s*FILE:\s*(.+?)\s*---", raw_output)
    # parts[0] is preamble (empty or intro text), then alternating name/content
    for i in range(1, len(parts) - 1, 2):
        name = parts[i].strip()
        content = parts[i + 1].strip()
        if name and content:
            docs.append({"name": name, "content": content})

    # If parsing found nothing, return the whole output as a single doc
    if not docs and raw_output.strip():
        docs.append({"name": "setup_details.md", "content": raw_output.strip()})

    return docs


async def generate_guide(formatted_transcript: str) -> dict:
    """Generate an OpenClaw setup guide from a formatted interview transcript.

    Runs 3 sequential RocketRide pipelines:
    1. Main guide generation
    2. Reference documents generation
    3. Prompts to send generation

    Args:
        formatted_transcript: Clean Markdown transcript from the formatter.

    Returns:
        Dict with guide_id, status, and output files.
    """
    guide_id = str(uuid.uuid4())[:8]
    anthropic_key = os.getenv("ROCKETRIDE_APIKEY_ANTHROPIC", "")

    system_prompt = _load_file(
        _SYSTEM_PROMPT_PATH,
        "You are an expert OpenClaw setup guide creator. Generate comprehensive, personalized setup guides based on interview transcripts.",
    )
    references = _load_file(
        _REFERENCES_PATH,
        "No additional reference material available.",
    )

    try:
        async with RocketRideClient(uri=ROCKETRIDE_URI, auth=ROCKETRIDE_KEY) as client:

            # Step 1: Generate main setup guide
            logger.info(f"[GUIDE {guide_id}] Step 1/3: Generating main setup guide...")
            main_guide_prompt = (
                f"{system_prompt}\n\n"
                f"## Reference Material\n{references}\n\n"
                f"## Instructions\n"
                f"Based on the interview transcript below, create a comprehensive "
                f"OPENCLAW_ENGINE_SETUP_GUIDE.md. Include all setup steps personalized "
                f"to the user's needs. Where long conditional sub-steps are needed, "
                f"reference them as 'See reference_documents/<filename>.md' — those "
                f"will be generated separately.\n\n"
                f"Output ONLY the Markdown content of the setup guide."
            )
            main_guide = await _run_pipeline(
                client, main_guide_prompt, anthropic_key, formatted_transcript,
            )
            logger.info(f"[GUIDE {guide_id}] Step 1/3 complete ({len(main_guide)} chars)")

            # Step 2: Generate reference documents
            logger.info(f"[GUIDE {guide_id}] Step 2/3: Generating reference documents...")
            refdocs_prompt = (
                f"{system_prompt}\n\n"
                f"## Context\n"
                f"You just generated a main setup guide that references sub-documents. "
                f"Now generate each referenced document.\n\n"
                f"## Main Guide (for context)\n{main_guide[:4000]}\n\n"
                f"## Instructions\n"
                f"Generate all reference documents that the main guide links to. "
                f"Format each document with this separator:\n"
                f"--- FILE: <filename>.md ---\n<content>\n\n"
                f"If the main guide doesn't reference any sub-documents, generate "
                f"at least one 'initial_setup.md' with basic getting-started steps.\n\n"
                f"Output ONLY the documents in the separator format above."
            )
            refdocs_raw = await _run_pipeline(
                client, refdocs_prompt, anthropic_key, formatted_transcript,
            )
            reference_documents = _parse_reference_docs(refdocs_raw)
            logger.info(f"[GUIDE {guide_id}] Step 2/3 complete ({len(reference_documents)} docs)")

            # Step 3: Generate prompts to send
            logger.info(f"[GUIDE {guide_id}] Step 3/3: Generating prompts_to_send.md...")
            prompts_prompt = (
                f"{system_prompt}\n\n"
                f"## Instructions\n"
                f"Based on the interview transcript, generate a prompts_to_send.md file. "
                f"This file contains messages the user will copy and send to their "
                f"OpenClaw instance after setup is complete. These messages initialize "
                f"the OpenClaw agent with:\n"
                f"- Personality and talking style preferences\n"
                f"- Business context and user-specific customizations\n"
                f"- Any domain-specific knowledge from the interview\n\n"
                f"Format as numbered prompts, each ready to copy-paste:\n"
                f"## Prompt 1: <title>\n```\n<message>\n```\n\n"
                f"Output ONLY the Markdown content."
            )
            prompts_to_send = await _run_pipeline(
                client, prompts_prompt, anthropic_key, formatted_transcript,
            )
            logger.info(f"[GUIDE {guide_id}] Step 3/3 complete ({len(prompts_to_send)} chars)")

        logger.info(f"[GUIDE {guide_id}] All steps complete")
        return {
            "guide_id": guide_id,
            "status": "complete",
            "message": "Setup guide generated successfully via RocketRide pipeline.",
            "outputs": {
                "setup_guide": main_guide,
                "reference_documents": reference_documents,
                "prompts_to_send": prompts_to_send,
            },
        }

    except Exception as e:
        logger.error(f"[GUIDE {guide_id}] RocketRide pipeline failed: {e}")
        return {
            "guide_id": guide_id,
            "status": "error",
            "message": f"Pipeline error: {e}",
            "outputs": {
                "setup_guide": None,
                "reference_documents": [],
                "prompts_to_send": None,
            },
        }
