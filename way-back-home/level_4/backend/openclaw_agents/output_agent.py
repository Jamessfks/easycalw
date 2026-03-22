"""Batch documentation agent — turns the organized interview transcript into a setup Markdown guide."""

from dotenv import load_dotenv
from google.adk.agents import Agent
from google.adk.tools.function_tool import FunctionTool
import os

from openclaw_agents.paths import REGISTRY_HINTS

load_dotenv()


def get_openclaw_registry_hints() -> str:
    """Return approved example skill slugs and example `clawhub install` lines.

    Use only these examples (or explicitly say the user must confirm slugs in their org registry).
    """
    if not REGISTRY_HINTS.is_file():
        return "(registry_hints.md missing)"
    return REGISTRY_HINTS.read_text(encoding="utf-8")


OUTPUT_TOOLS = [FunctionTool(get_openclaw_registry_hints)]

OUTPUT_MODEL_ID = os.getenv("OUTPUT_MODEL_ID", "gemini-2.0-flash")

root_agent = Agent(
    name="openclaw_output_agent",
    model=OUTPUT_MODEL_ID,
    tools=OUTPUT_TOOLS,
    instruction="""
You are the **OpenClaw Documentation Agent** — documentation phase.

You receive the **full interview transcript** (user + assistant), including voice interview text.

## Task
Produce a single Markdown document titled exactly:
`# OPENCLAW_ENGINE_SETUP_GUIDE`

## Rules
1. Call `get_openclaw_registry_hints` at least once before finalizing any `clawhub install` lines.
2. Do **not** invent skill slugs beyond the hints file unless you label them as **user must verify**.
3. Prefer **OAuth / Codex** onboarding language over API key storage; never tell the user to paste secrets into this chat.
4. Use clear sections, e.g.:
   - Prerequisites
   - Authentication (OAuth / Codex)
   - Recommended skills (`clawhub`)
   - Configuration pointers (`openclaw.json` — high level only)
   - Security / trust tooling (if relevant)
   - Next steps & official docs link: https://docs.openclaw.ai/
5. Output **only** the Markdown document — no preamble or postscript.
""",
)
