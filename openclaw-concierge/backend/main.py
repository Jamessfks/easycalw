import os
import json
import logging

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from formatter import format_transcript
from setup_guide_agent.agent import generate_guide

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# ========================================
# Application Initialization
# ========================================

app = FastAPI(title="OpenClaw Concierge")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ========================================
# Request Models
# ========================================

class FormatRequest(BaseModel):
    transcript: str


class GenerateGuideRequest(BaseModel):
    formatted_transcript: str


# ========================================
# Endpoints
# ========================================

@app.post("/webhook")
async def vapi_webhook(request: Request):
    """VAPI server URL — receives transcript events, function-call requests,
    and end-of-call reports.

    Requires VAPI Private Key + Server URL configured in VAPI dashboard.
    """
    body = await request.json()
    message = body.get("message", {})
    msg_type = message.get("type", "unknown")

    logger.info(f"[WEBHOOK] Received event: {msg_type}")

    if msg_type == "transcript":
        transcript = message.get("transcript", "")
        role = message.get("role", "unknown")
        logger.info(f"[WEBHOOK] {role}: {transcript}")

    elif msg_type == "function-call":
        fn_name = message.get("functionCall", {}).get("name", "unknown")
        logger.info(f"[WEBHOOK] Function call: {fn_name}")
        return {"results": [{"result": "Function not implemented"}]}

    elif msg_type == "end-of-call-report":
        artifact = message.get("artifact", {})
        transcript = artifact.get("transcript", "")
        logger.info(f"[WEBHOOK] End of call — transcript length: {len(transcript)} chars")
        # TODO: Trigger formatter + Phase 2 pipeline
        # formatted = await format_transcript(transcript)
        # result = await generate_guide(formatted)

    return {"ok": True}


@app.post("/format")
async def format_endpoint(req: FormatRequest):
    """Triggers the Interview Formatter on a transcript.

    Called by the frontend after a VAPI call ends (frontend-driven fallback),
    or triggered internally after webhook end-of-call-report.
    """
    logger.info(f"[FORMAT] Received transcript ({len(req.transcript)} chars)")
    formatted = await format_transcript(req.transcript)
    return {"formatted": formatted}


@app.post("/generate-guide")
async def generate_guide_endpoint(req: GenerateGuideRequest):
    """Triggers Phase 2: Setup Guide Creation Agent.

    Stub — not yet implemented.
    """
    logger.info(f"[GUIDE] Received formatted transcript ({len(req.formatted_transcript)} chars)")
    result = await generate_guide(req.formatted_transcript)
    return result


@app.get("/guide/{guide_id}")
async def get_guide(guide_id: str):
    """Retrieve generated output (guide + reference docs + prompts).

    Stub — not yet implemented.
    """
    return {
        "guide_id": guide_id,
        "status": "not_implemented",
        "message": "Guide retrieval not yet implemented. Build Phase 2 first.",
    }


# ========================================
# Static File Serving (Frontend Build)
# ========================================

FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "../frontend/dist")
PORT = int(os.environ.get("PORT", "8000"))

if os.path.isdir(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="static")
    logger.info(f"Serving static files from: {FRONTEND_DIST}")
else:
    logger.info(f"Frontend build not found at {FRONTEND_DIST}")
    logger.info("Run 'npm run build' in the frontend directory for production serving.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
