"""
RocketRide Node 2 — Anchor Report Validator.

Receives the raw Vapi end-of-call webhook payload, extracts and cleans
the structured anchor report JSON, and returns it to Node 3.
Raises ValueError on missing required fields to trigger a pipeline retry.
"""

import json

REQUIRED_FIELDS = ["use_cases", "channels"]


def rocketride_validate(raw_input) -> dict:
    """
    Validate and clean the anchor report from Vapi.

    Args:
        raw_input: str (raw JSON) or dict (already parsed by RocketRide).

    Returns:
        Cleaned anchor report dict ready for Node 3.

    Raises:
        ValueError: If required fields are missing — triggers pipeline retry.
    """
    # Handle both pre-parsed dict and raw JSON string
    if isinstance(raw_input, dict):
        data = raw_input
    else:
        raw_json = str(raw_input)
        try:
            data = json.loads(raw_json)
        except json.JSONDecodeError:
            # Extract JSON from messy Vapi transcript if needed
            start = raw_json.find("{")
            end = raw_json.rfind("}") + 1
            if start == -1 or end == 0:
                raise ValueError("No JSON object found in input")
            data = json.loads(raw_json[start:end])

    # Extract from Vapi webhook envelope if needed
    # Vapi sends: { "message": { "type": "end-of-call-report", ... } }
    if "message" in data:
        msg = data["message"]
        # Pull transcript summary if available
        if "analysis" in msg and "summary" in msg["analysis"]:
            data["transcript_summary"] = msg["analysis"]["summary"]
        # Pull structured data if Vapi extracted it
        if "structuredData" in msg:
            data.update(msg["structuredData"])

    # Fill safe defaults for missing optional fields
    data.setdefault("name", "Friend")
    data.setdefault("role", "personal")
    data.setdefault("tone", "friendly")
    data.setdefault("model_preference", "balanced")
    data.setdefault("technical_level", "intermediate")
    data.setdefault("verbosity", "balanced")
    data.setdefault("proactivity", "balanced")

    # Hard-fail on missing required fields — triggers retry loop
    for field in REQUIRED_FIELDS:
        if not data.get(field):
            raise ValueError(
                f"Missing required field: '{field}'. "
                f"The voice interview may not have captured enough detail. "
                f"Present fields: {list(data.keys())}"
            )

    # Normalize list fields (Vapi may return comma-separated strings)
    for field in ["use_cases", "channels"]:
        if isinstance(data[field], str):
            data[field] = [s.strip() for s in data[field].split(",") if s.strip()]

    return data
