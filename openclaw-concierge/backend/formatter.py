"""Interview Formatter — lightweight transcript cleanup.

Takes the speaker-labeled transcript from VAPI (already has User/Agent labels)
and adds Markdown structure. No LLM call needed — VAPI handles transcription.
"""

import re
import logging

logger = logging.getLogger(__name__)


async def format_transcript(raw_transcript: str) -> str:
    """Format a raw interview transcript into clean Markdown.

    The transcript arrives pre-labeled from useVapi.js as:
        User: some text
        Agent: some text
        ...

    This function adds Markdown headers, cleans minor ASR artifacts,
    and returns structured content ready for the Setup Guide Agent.
    """
    if not raw_transcript or not raw_transcript.strip():
        return "# Interview Transcript\n\n> No transcript content available.\n"

    lines = raw_transcript.strip().split("\n")
    formatted_lines = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Clean common ASR filler words (light touch — preserve meaning)
        cleaned = re.sub(r'\b(um|uh|uhh|umm|hmm)\b[,.]?\s*', '', line, flags=re.IGNORECASE)
        # Collapse repeated words: "I I think" → "I think"
        cleaned = re.sub(r'\b(\w+)\s+\1\b', r'\1', cleaned)
        # Collapse extra whitespace
        cleaned = re.sub(r'\s{2,}', ' ', cleaned).strip()

        # Bold speaker labels
        if cleaned.startswith("User:"):
            cleaned = "**User:**" + cleaned[5:]
        elif cleaned.startswith("Agent:"):
            cleaned = "**Agent:**" + cleaned[6:]

        formatted_lines.append(cleaned)

    body = "\n\n".join(formatted_lines)

    result = f"# Interview Transcript\n\n{body}\n"

    logger.info(f"[FORMATTER] Formatted transcript: {len(lines)} lines → {len(formatted_lines)} entries")
    return result
