"""Interview Formatter — transcript cleanup via LLM API.

Uses Google Gemini 2.5 Flash (primary) or Anthropic Claude Haiku (fallback)
to clean ASR artifacts, fix grammar, and structure the transcript into clean
Markdown for the Setup Guide Agent.
Falls back to regex-based cleanup if all API calls fail.
"""

import asyncio
import re
import os
import logging

import anthropic

logger = logging.getLogger(__name__)

# Models for formatting — fast and cheap is fine here
_GEMINI_MODEL = "gemini-2.5-flash"
_HAIKU_MODEL = "claude-haiku-4-5-20251001"
_MAX_TOKENS = 4096

_FORMAT_PROMPT = """\
You are a transcript formatter. Clean up the following voice interview transcript.

Rules:
1. Remove ASR filler words (um, uh, hmm, like, you know) without changing meaning
2. Fix grammar and punctuation naturally
3. Collapse repeated/stuttered words
4. Keep the original speaker labels (User: and Agent:)
5. Bold the speaker labels as **User:** and **Agent:**
6. Preserve ALL factual content — do not add, remove, or change any information
7. Output clean Markdown with each turn separated by a blank line
8. Start with a # Interview Transcript header

Transcript to clean:
"""


async def format_transcript(raw_transcript: str) -> str:
    """Format a raw interview transcript into clean Markdown.

    Tries Gemini Flash first (10x cheaper), falls back to Claude Haiku,
    then to regex if all API calls fail.
    """
    if not raw_transcript or not raw_transcript.strip():
        return "# Interview Transcript\n\n> No transcript content available.\n"

    gemini_key = os.environ.get("GEMINI_API_KEY")

    # Primary: Gemini 2.5 Flash
    if gemini_key:
        try:
            formatted = await _format_with_gemini(raw_transcript, gemini_key)
            if formatted:
                return formatted
        except Exception as e:
            logger.warning(f"[FORMATTER] Gemini API failed, trying Claude Haiku: {e}")

    # Fallback: Claude Haiku
    try:
        return await _format_with_haiku(raw_transcript)
    except Exception as e:
        logger.warning(f"[FORMATTER] Claude Haiku failed, falling back to regex: {e}")
        return _regex_fallback(raw_transcript)


async def _format_with_gemini(raw_transcript: str, api_key: str) -> str:
    """Format transcript using Google Gemini 2.5 Flash."""
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key)

    response = await asyncio.to_thread(
        client.models.generate_content,
        model=_GEMINI_MODEL,
        contents=f"{_FORMAT_PROMPT}\n{raw_transcript}",
        config=types.GenerateContentConfig(max_output_tokens=_MAX_TOKENS),
    )

    formatted = response.text
    usage = getattr(response, "usage_metadata", None)
    if usage:
        logger.info(
            f"[FORMATTER] Gemini API success — "
            f"input_tokens={getattr(usage, 'prompt_token_count', 'N/A')}, "
            f"output_tokens={getattr(usage, 'candidates_token_count', 'N/A')}"
        )
    else:
        logger.info("[FORMATTER] Gemini API success — token counts unavailable")

    return formatted


async def _format_with_haiku(raw_transcript: str) -> str:
    """Format transcript using Anthropic Claude Haiku (fallback)."""
    client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from env

    response = await asyncio.to_thread(
        client.messages.create,
        model=_HAIKU_MODEL,
        max_tokens=_MAX_TOKENS,
        messages=[
            {
                "role": "user",
                "content": f"{_FORMAT_PROMPT}\n{raw_transcript}",
            }
        ],
    )

    formatted = response.content[0].text
    logger.info(
        f"[FORMATTER] Claude Haiku API success — "
        f"input_tokens={response.usage.input_tokens}, "
        f"output_tokens={response.usage.output_tokens}"
    )
    return formatted


def _regex_fallback(raw_transcript: str) -> str:
    """Lightweight regex-based cleanup when Claude API is unavailable."""
    lines = raw_transcript.strip().split("\n")
    formatted_lines = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Clean common ASR filler words
        cleaned = re.sub(
            r"\b(um|uh|uhh|umm|hmm|like,?\s)\b[,.]?\s*",
            "",
            line,
            flags=re.IGNORECASE,
        )
        # Collapse repeated words: "I I think" -> "I think"
        cleaned = re.sub(r"\b(\w+)\s+\1\b", r"\1", cleaned)
        # Collapse extra whitespace
        cleaned = re.sub(r"\s{2,}", " ", cleaned).strip()

        # Bold speaker labels
        if cleaned.startswith("User:"):
            cleaned = "**User:**" + cleaned[5:]
        elif cleaned.startswith("Agent:"):
            cleaned = "**Agent:**" + cleaned[6:]

        formatted_lines.append(cleaned)

    body = "\n\n".join(formatted_lines)
    result = f"# Interview Transcript\n\n{body}\n"

    logger.info(
        f"[FORMATTER] Regex fallback — {len(lines)} lines -> {len(formatted_lines)} entries"
    )
    return result
