"""Interview Formatter — RocketRide pipeline that cleans up raw transcript.

Takes the raw interview transcript and formats it into clean Markdown
via a single LLM call orchestrated through a RocketRide pipeline.
No intent changes — purely grammar cleanup, formatting, and parsing.
"""

import os
import logging

from rocketride import RocketRideClient

logger = logging.getLogger(__name__)

ROCKETRIDE_URI = os.getenv("ROCKETRIDE_URI", "ws://localhost:5565")
ROCKETRIDE_KEY = os.getenv("ROCKETRIDE_APIKEY", "")

FORMATTER_SYSTEM_PROMPT = """You are an interview transcript formatter. Your job is to take a raw voice interview transcript and produce clean, well-structured Markdown.

Rules:
- NO intent changes — preserve every statement exactly as meant
- Clean up ASR artifacts: repeated words, garbled text, filler words (um, uh, like)
- Add clear speaker labels: **User:** and **Agent:**
- Fix grammar and punctuation without changing meaning
- Group related exchanges into logical sections
- Add a title header and any relevant section breaks
- Output valid Markdown

Output the formatted transcript as INTERVIEW_TRANSCRIPT.md content."""


def _build_formatter_pipeline() -> dict:
    """Build the RocketRide pipeline config for transcript formatting."""
    anthropic_key = os.getenv("ROCKETRIDE_APIKEY_ANTHROPIC", "")

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
                    "system_prompt": FORMATTER_SYSTEM_PROMPT,
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
        "project_id": "openclaw-formatter",
    }


async def format_transcript(raw_transcript: str) -> str:
    """Format a raw interview transcript into clean Markdown.

    Args:
        raw_transcript: Raw transcript text from VAPI end-of-call report
                        or accumulated frontend transcript.

    Returns:
        Formatted Markdown string (INTERVIEW_TRANSCRIPT.md content).
    """
    pipeline = _build_formatter_pipeline()

    try:
        async with RocketRideClient(uri=ROCKETRIDE_URI, auth=ROCKETRIDE_KEY) as client:
            token = await client.use(pipeline)
            result = await client.send(
                token,
                raw_transcript,
                objinfo={"name": "transcript.md"},
                mimetype="text/plain",
            )
            await client.terminate(token)
            logger.info("[FORMATTER] Transcript formatted via RocketRide pipeline")
            return result
    except Exception as e:
        logger.error(f"[FORMATTER] RocketRide pipeline failed: {e}")
        # Graceful fallback — return raw transcript wrapped in Markdown
        return (
            "# Interview Transcript\n\n"
            "> Formatter pipeline unavailable. Raw transcript below.\n\n"
            f"{raw_transcript}\n"
        )
