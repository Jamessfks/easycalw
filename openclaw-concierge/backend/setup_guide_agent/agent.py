"""Setup Guide Creation Agent — Phase 2 backend-only agent.

Takes the formatted interview transcript and produces:
- OPENCLAW_ENGINE_SETUP_GUIDE.md (main deliverable)
- reference_documents/ (conditional sub-setup docs)
- prompts_to_send.md (messages to initialize the user's OpenClaw instance)

SDK/Framework TBD — see docs/design-considerations.md §4.3.

TODO: Implement with chosen SDK (Claude Code SDK, Google ADK, LangChain, or direct API).
"""


async def generate_guide(formatted_transcript: str) -> dict:
    """Generate an OpenClaw setup guide from a formatted interview transcript.

    Args:
        formatted_transcript: Clean Markdown transcript from the formatter.

    Returns:
        Dict with guide_id, status, and output files.
    """
    # STUB — return placeholder until agent implementation is built
    return {
        "guide_id": "stub",
        "status": "not_implemented",
        "message": "Setup Guide Creation Agent not yet implemented. See docs/design-considerations.md §4.3 for SDK options.",
        "outputs": {
            "setup_guide": None,
            "reference_documents": [],
            "prompts_to_send": None,
        },
    }
