"""Client-safe configuration endpoints."""

import os

from fastapi import APIRouter

router = APIRouter()


@router.get("/client-config")
async def get_client_config():
    """Return non-secret config needed by the browser client."""
    public_key = os.getenv("VAPI_PUBLIC_KEY", "").strip()
    assistant_id = os.getenv("VAPI_ASSISTANT_ID", "").strip()

    missing = []
    if not public_key:
        missing.append("VAPI_PUBLIC_KEY")
    if not assistant_id:
        missing.append("VAPI_ASSISTANT_ID")

    return {
        "voice": {
            "enabled": not missing,
            "public_key": public_key,
            "assistant_id": assistant_id,
        },
        "missing": missing,
    }
