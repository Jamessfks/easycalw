"""Interview Formatter — single LLM call to clean up raw transcript.

Takes the raw interview transcript and formats it into clean Markdown.
No intent changes — purely grammar cleanup, formatting, and parsing.

TODO: Implement with actual LLM call (model TBD).
"""


async def format_transcript(raw_transcript: str) -> str:
    """Format a raw interview transcript into clean Markdown.

    Args:
        raw_transcript: Raw transcript text from VAPI end-of-call report
                        or accumulated frontend transcript.

    Returns:
        Formatted Markdown string (INTERVIEW_TRANSCRIPT.md content).
    """
    # STUB — return placeholder until LLM integration is implemented
    return (
        "# Interview Transcript\n\n"
        "> Formatter not yet implemented. This is the raw transcript passed through.\n\n"
        f"{raw_transcript}\n"
    )
