"""
RocketRide Node 2 — Input Agent (Vapi transcript → anchor report).

Replaces Agent 1's ADK live interview agent in the RocketRide pipeline.

Receives the raw Vapi end-of-call-report payload, extracts the transcript,
and calls Gemini to parse it into the structured anchor report that
Node 3 (Output Agent) expects.

Fast path: if Vapi's own Structured Data Extraction already populated
analysis.structuredData with use_cases + channels, skip the Gemini call.
"""

import json
import os
import sys

from google import genai
from google.genai import types

# Ensure backend root is on sys.path (needed when RocketRide imports this file)
BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from dotenv import load_dotenv
load_dotenv(os.path.join(BACKEND_ROOT, "..", ".env"))

INPUT_MODEL_ID = os.getenv("INPUT_MODEL_ID", "gemini-2.0-flash")

REQUIRED_FIELDS = ["use_cases", "channels"]

EXTRACTION_SYSTEM_PROMPT = """\
You are parsing an OpenClaw voice interview transcript.
Extract the user's preferences and return ONLY a valid JSON object — no markdown, no explanation.

JSON schema:
{
  "name":            "<user's first name, or 'Friend' if not stated>",
  "role":            "<personal | developer | designer | manager | researcher | student | other>",
  "use_cases":       ["<use cases mentioned, e.g. coding, email drafting, scheduling, research>"],
  "channels":        ["<tools/apps/integrations mentioned, e.g. cursor, gmail, slack, notion, github>"],
  "tone":            "<friendly | professional | casual | concise>",
  "technical_level": "<beginner | intermediate | advanced>",
  "verbosity":       "<concise | balanced | detailed>",
  "proactivity":     "<reactive | balanced | proactive>",
  "model_preference":"<fast | balanced | powerful>"
}

Rules:
- use_cases and channels MUST be non-empty arrays.
- If a value is unclear, use the most sensible default.
- Never invent facts not present in the transcript.
"""


def rocketride_input_agent(vapi_payload: dict) -> dict:
    """
    Node 2: Input Agent — replaces Agent 1's ADK live interview.

    Receives the full Vapi end-of-call-report JSON body, extracts the
    conversation transcript, and calls Gemini to produce the structured
    anchor report that Node 3 (Output Agent / ADK) needs.

    Args:
        vapi_payload: Full Vapi webhook POST body (dict).

    Returns:
        Structured anchor report dict with keys: name, role, use_cases,
        channels, tone, technical_level, verbosity, proactivity,
        model_preference.

    Raises:
        ValueError: If Vapi payload has no usable transcript, or if
                    required fields (use_cases, channels) cannot be
                    extracted from the transcript.
    """
    # ------------------------------------------------------------------
    # 1. Unwrap Vapi envelope
    #    Vapi sends: { "message": { "type": "end-of-call-report", ... } }
    # ------------------------------------------------------------------
    msg = vapi_payload.get("message", vapi_payload)

    msg_type = msg.get("type", "")
    if msg_type and msg_type != "end-of-call-report":
        raise ValueError(
            f"Unexpected Vapi message type: '{msg_type}'. "
            f"Expected 'end-of-call-report'."
        )

    # ------------------------------------------------------------------
    # 2. Fast path — use Vapi's own Structured Data Extraction if complete
    #    Configure in Vapi dashboard: Assistant → Analysis → Structured Data
    # ------------------------------------------------------------------
    analysis = msg.get("analysis", {})
    vapi_structured = analysis.get("structuredData", {})
    if vapi_structured.get("use_cases") and vapi_structured.get("channels"):
        return _normalize(vapi_structured)

    # ------------------------------------------------------------------
    # 3. Extract raw transcript from the Vapi artifact
    # ------------------------------------------------------------------
    artifact = msg.get("artifact", {})
    transcript = artifact.get("transcript", "").strip()

    if not transcript:
        # Fall back to stitching the messages array
        messages = artifact.get("messages", [])
        transcript = _stitch_messages(messages)

    if not transcript:
        raise ValueError(
            "Vapi payload contains no transcript and no messages. "
            "Cannot run Input Agent — the call may have ended immediately."
        )

    # ------------------------------------------------------------------
    # 4. Call Gemini to parse transcript → anchor report (Input Agent role)
    # ------------------------------------------------------------------
    anchor_report = _call_gemini(transcript)
    _validate(anchor_report)
    return _normalize(anchor_report)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _call_gemini(transcript: str) -> dict:
    """Call Gemini to extract a structured anchor report from a raw transcript."""
    client = genai.Client()
    response = client.models.generate_content(
        model=INPUT_MODEL_ID,
        config=types.GenerateContentConfig(
            system_instruction=EXTRACTION_SYSTEM_PROMPT,
        ),
        contents=transcript,
    )

    text = response.text.strip()

    # Strip markdown code fences if the model wrapped the JSON
    if text.startswith("```"):
        lines = text.splitlines()
        inner = lines[1:-1] if lines[-1].strip() == "```" else lines[1:]
        text = "\n".join(inner).strip()

    return json.loads(text)


def _stitch_messages(messages: list) -> str:
    """Convert Vapi messages array into a readable transcript string."""
    lines = []
    for m in messages:
        role = m.get("role", "unknown").capitalize()
        text = m.get("message", m.get("content", "")).strip()
        if text:
            lines.append(f"{role}: {text}")
    return "\n".join(lines)


def _validate(data: dict) -> None:
    """Hard-fail if required fields are missing after Gemini extraction."""
    for field in REQUIRED_FIELDS:
        if not data.get(field):
            raise ValueError(
                f"Input Agent failed to extract required field: '{field}'. "
                f"The transcript may be too short or off-topic. "
                f"Present fields: {list(data.keys())}"
            )


def _normalize(data: dict) -> dict:
    """Fill safe defaults and normalize list fields to actual Python lists."""
    data.setdefault("name", "Friend")
    data.setdefault("role", "personal")
    data.setdefault("tone", "friendly")
    data.setdefault("technical_level", "intermediate")
    data.setdefault("verbosity", "balanced")
    data.setdefault("proactivity", "balanced")
    data.setdefault("model_preference", "balanced")

    for field in ["use_cases", "channels"]:
        val = data.get(field, [])
        if isinstance(val, str):
            data[field] = [s.strip() for s in val.split(",") if s.strip()]
        elif not isinstance(val, list):
            data[field] = [str(val)] if val else []

    return data
