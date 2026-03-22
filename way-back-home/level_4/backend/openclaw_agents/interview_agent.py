"""Live (BIDI audio) interview agent — reads setup MD and queries domain knowledge via tools."""

from pathlib import Path

from dotenv import load_dotenv
from google.adk.agents import Agent
from google.adk.tools.function_tool import FunctionTool
import os

from openclaw_agents.paths import DOMAIN_DIR, SETUP_REQUIREMENTS

load_dotenv()


def load_setup_requirements() -> str:
    """Load the markdown checklist of topics you must cover in the OpenClaw setup interview.

    Call this early in the session so you know what to ask the user.
    """
    if not SETUP_REQUIREMENTS.is_file():
        return "(setup_requirements.md missing on server)"
    return SETUP_REQUIREMENTS.read_text(encoding="utf-8")


def search_domain_knowledge(query: str) -> str:
    """Search domain knowledge markdown files for lines related to the user's question.

    Args:
        query: Keywords or a short question (e.g. "oauth", "clawhub", "permissions").
    """
    if not DOMAIN_DIR.is_dir():
        return "No domain knowledge directory found."
    words = [w.lower() for w in query.split() if len(w) > 2]
    if not words:
        words = [query.lower()]
    chunks: list[str] = []
    for path in sorted(DOMAIN_DIR.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        hits = [
            line
            for line in text.splitlines()
            if any(w in line.lower() for w in words)
        ]
        if hits:
            preview = "\n".join(hits[:50])
            chunks.append(f"### {path.name}\n{preview}")
    return "\n\n".join(chunks) if chunks else "No matching domain snippets. Try different keywords."


INTERVIEW_TOOLS = [
    FunctionTool(load_setup_requirements),
    FunctionTool(search_domain_knowledge),
]

MODEL_ID = os.getenv("INTERVIEW_MODEL_ID", "gemini-live-2.5-flash-native-audio")

root_agent = Agent(
    name="openclaw_interview_agent",
    model=MODEL_ID,
    tools=INTERVIEW_TOOLS,
    instruction="""
You are the **OpenClaw Voice Concierge** — interview phase.

## Modalities
- The user speaks over live audio; you respond with voice (and your speech may be transcribed).
- Keep replies concise: one or two sentences, then listen.

## Tools (use them)
1. At the **start** of the interview, call `load_setup_requirements` and internalize every section.
2. When the user asks factual questions about OpenClaw, OAuth, or skills, call `search_domain_knowledge`
   with short keywords — then summarize answers in plain language.

## Interview goals
- Walk through every topic from the setup requirements: environment, auth preference, channels,
  skills/workflows, safety/trust preferences.
- If something is unclear, ask a single clarifying question.
- Never invent `clawhub` skill slugs; if they need specific skills, note "to be listed in the setup guide
  from the registry" and continue.

## When to stop talking
- If the user says they are **done**, **that's enough**, or asks to **generate the guide**, confirm you
  have enough context and tell them to press **Generate setup guide** in the app (you cannot run that button for them).

## Tone
Warm, professional, patient with non-experts.
""",
)
