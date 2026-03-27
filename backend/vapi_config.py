"""VAPI configuration for OpenClaw Concierge.

The Public Key is used by the frontend SDK to start calls.
The Assistant ID identifies the pre-built Interview Agent in VAPI.
The Private Key (if available) is used by the backend to call VAPI's REST API
for retrieving end-of-call transcripts and recordings.

All keys MUST be set via environment variables (see backend/.env.template).
"""
import os
import logging

logger = logging.getLogger(__name__)


def _require_env(name: str) -> str:
    """Return an env var or raise with a clear message."""
    value = os.environ.get(name, "")
    if not value:
        raise RuntimeError(
            f"Missing required environment variable: {name}. "
            f"Set it in backend/.env or your deployment environment. "
            f"See backend/.env.template for reference."
        )
    return value


VAPI_ASSISTANT_ID = _require_env("VAPI_ASSISTANT_ID")
VAPI_PUBLIC_KEY = _require_env("VAPI_PUBLIC_KEY")

# Private key needed for server-side VAPI API access (transcript retrieval, etc.)
# Optional — leave empty if not using server-side VAPI API calls.
VAPI_PRIVATE_KEY = os.environ.get("VAPI_PRIVATE_KEY", "")
