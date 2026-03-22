"""
core.py — OpenClaw pipeline adapter.

Wraps the existing openclaw_agents/output_agent.py into the
StructuredData / run_pipeline() interface expected by the RocketRide
Node 3 bridge. Zero changes needed to output_agent.py.
"""

import asyncio
import io
import uuid
import zipfile
from dataclasses import dataclass, field
from typing import List

from dotenv import load_dotenv
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from openclaw_agents.output_agent import root_agent as output_agent

load_dotenv()


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class PersonaTraits:
    tone: str = "friendly"
    verbosity: str = "balanced"
    proactivity: str = "balanced"


@dataclass
class UserProfile:
    name: str = "Friend"
    role: str = "personal"
    technical_level: str = "intermediate"


@dataclass
class StructuredData:
    user_profile: UserProfile = field(default_factory=UserProfile)
    use_cases: List[str] = field(default_factory=list)
    channels: List[str] = field(default_factory=list)
    persona_traits: PersonaTraits = field(default_factory=PersonaTraits)
    model_preference: str = "balanced"


# ---------------------------------------------------------------------------
# Pipeline runner
# ---------------------------------------------------------------------------

def run_pipeline(data: StructuredData) -> tuple[str, bytes, list]:
    """
    Run the OpenClaw output agent with a structured user profile.

    Returns:
        (job_id, zip_bytes, skills_list)
        - job_id: short unique ID for the /download/{job_id} endpoint
        - zip_bytes: ZIP archive containing OPENCLAW_ENGINE_SETUP_GUIDE.md
        - skills_list: list of matched skills (currently empty — future use)
    """
    job_id = str(uuid.uuid4())[:8]
    transcript_summary = _build_transcript(data)
    guide_md = asyncio.run(_run_output_agent(transcript_summary))

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("OPENCLAW_ENGINE_SETUP_GUIDE.md", guide_md)
    buf.seek(0)

    return job_id, buf.getvalue(), []


def _build_transcript(data: StructuredData) -> str:
    """Convert StructuredData into a plain-English transcript for the output agent."""
    use_cases_str = ", ".join(data.use_cases) if data.use_cases else "general productivity"
    channels_str = ", ".join(data.channels) if data.channels else "chat"

    return (
        f"User profile summary from voice interview:\n\n"
        f"Name: {data.user_profile.name}\n"
        f"Role: {data.user_profile.role}\n"
        f"Technical level: {data.user_profile.technical_level}\n"
        f"Primary use cases: {use_cases_str}\n"
        f"Preferred channels: {channels_str}\n"
        f"Preferred AI tone: {data.persona_traits.tone}\n"
        f"Verbosity preference: {data.persona_traits.verbosity}\n"
        f"Proactivity preference: {data.persona_traits.proactivity}\n"
        f"Model preference: {data.model_preference}\n\n"
        f"Please generate the OPENCLAW_ENGINE_SETUP_GUIDE for this user."
    )


async def _run_output_agent(transcript: str) -> str:
    """Run the ADK output agent and collect its full text response."""
    session_service = InMemorySessionService()
    runner = Runner(
        app_name="openclaw-rocketride",
        agent=output_agent,
        session_service=session_service,
    )
    user_id = "rocketride"
    session_id = f"rr-{uuid.uuid4().hex[:8]}"

    await session_service.create_session(
        app_name="openclaw-rocketride",
        user_id=user_id,
        session_id=session_id,
    )

    result_parts: List[str] = []
    async for event in runner.run_async(
        user_id=user_id,
        session_id=session_id,
        new_message=types.Content(parts=[types.Part(text=transcript)]),
    ):
        if event.content and event.content.parts:
            result_parts.extend(
                p.text for p in event.content.parts if getattr(p, "text", None)
            )

    return "\n".join(result_parts) if result_parts else "# OPENCLAW_ENGINE_SETUP_GUIDE\n\n(No output from agent)"
