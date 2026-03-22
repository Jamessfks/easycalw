"""
RocketRide Node 3 — Output Agent (ADK Config Builder).

Receives a validated anchor report from Node 2 (Input Agent), maps it to the
StructuredData schema, runs the OpenClaw output agent via Google ADK, writes
the generated ZIP to disk, and returns the job_id + download URL.

Design note: RocketRide and FastAPI run as separate processes. Disk is the
shared boundary — Node 3 writes to backend/generated_guides/{job_id}.zip and
FastAPI's GET /download/{job_id} reads from the same directory.
"""

import os
import sys

BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from core import StructuredData, UserProfile, PersonaTraits, run_pipeline

# Shared output directory — must match the path in main.py
OUTPUT_DIR = os.path.join(BACKEND_ROOT, "generated_guides")


def rocketride_node_execute(anchor_report: dict) -> dict:
    """
    Node 3: Output Agent — generates OPENCLAW_ENGINE_SETUP_GUIDE.md via ADK.

    Args:
        anchor_report: Validated anchor report dict from Node 2.

    Returns:
        {
            "job_id":         str,   # short unique ID
            "download_url":   str,   # /download/{job_id}
            "skills_matched": int,
            "status":         "success"
        }
    """
    structured = StructuredData(
        user_profile=UserProfile(
            name=anchor_report.get("name", "Friend"),
            role=anchor_report.get("role", "personal"),
            technical_level=anchor_report.get("technical_level", "intermediate"),
        ),
        use_cases=anchor_report.get("use_cases", []),
        channels=anchor_report.get("channels", []),
        persona_traits=PersonaTraits(
            tone=anchor_report.get("tone", "friendly"),
            verbosity=anchor_report.get("verbosity", "balanced"),
            proactivity=anchor_report.get("proactivity", "balanced"),
        ),
        model_preference=anchor_report.get("model_preference", "balanced"),
    )

    job_id, zip_bytes, skills = run_pipeline(structured)

    # Write to shared disk so FastAPI /download/{job_id} can serve it
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    zip_path = os.path.join(OUTPUT_DIR, f"{job_id}.zip")
    with open(zip_path, "wb") as f:
        f.write(zip_bytes)

    return {
        "job_id": job_id,
        "download_url": f"/download/{job_id}",
        "skills_matched": len(skills),
        "status": "success",
    }
