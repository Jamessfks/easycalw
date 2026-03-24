"""VAPI configuration for OpenClaw Concierge.

The Public Key is used by the frontend SDK to start calls.
The Assistant ID identifies the pre-built Interview Agent in VAPI.
The Private Key (if available) is used by the backend to call VAPI's REST API
for retrieving end-of-call transcripts and recordings.
"""
import os

VAPI_ASSISTANT_ID = os.environ.get(
    "VAPI_ASSISTANT_ID",
    "6aff492d-aa3b-4aaa-a9f3-8d51440dd825",
)

VAPI_PUBLIC_KEY = os.environ.get(
    "VAPI_PUBLIC_KEY",
    "5bd9e5c5-dd9e-4021-b13d-9d6fa8395dc0",
)

# Private key needed for server-side VAPI API access (transcript retrieval, etc.)
# Ask the other team for this if webhook-based transcript extraction is needed.
VAPI_PRIVATE_KEY = os.environ.get("VAPI_PRIVATE_KEY", "")
