import os
import json
import logging

from dotenv import load_dotenv
from fastapi import FastAPI, Request, BackgroundTasks
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

# In-memory store for generated guides (good enough for hackathon — no database needed)
guide_store: dict[str, dict] = {}


# ========================================
# Request Models
# ========================================

class FormatRequest(BaseModel):
    transcript: str


class GenerateGuideRequest(BaseModel):
    formatted_transcript: str


# ========================================
# Background Task Runner
# ========================================

async def _run_guide_agent(guide_id: str, formatted_transcript: str):
    """Run the Setup Guide Agent in the background.

    Updates guide_store in place so the frontend can poll /guide/{guide_id}.
    """
    try:
        result = await generate_guide(formatted_transcript)
        guide_store[guide_id] = result
    except Exception as e:
        logger.error(f"[GUIDE {guide_id}] Background task failed: {e}")
        guide_store[guide_id] = {
            "guide_id": guide_id,
            "status": "error",
            "message": str(e),
            "outputs": {},
        }


# ========================================
# Endpoints
# ========================================

@app.post("/webhook")
async def vapi_webhook(request: Request, background_tasks: BackgroundTasks):
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

        # Format transcript, then kick off guide generation in background
        try:
            formatted = await format_transcript(transcript)
            guide_id = formatted[:8].replace(" ", "")  # simple ID from content
            import uuid
            guide_id = str(uuid.uuid4())[:8]
            guide_store[guide_id] = {"guide_id": guide_id, "status": "generating"}
            background_tasks.add_task(_run_guide_agent, guide_id, formatted)
            logger.info(f"[WEBHOOK] Guide generation started: {guide_id}")
        except Exception as e:
            logger.error(f"[WEBHOOK] Pipeline failed: {e}")

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
async def generate_guide_endpoint(
    req: GenerateGuideRequest,
    background_tasks: BackgroundTasks,
):
    """Triggers Phase 2: Setup Guide Creation Agent.

    Returns immediately with a guide_id. Frontend polls GET /guide/{guide_id}
    until status changes from "generating" to "complete" or "error".
    """
    import uuid
    guide_id = str(uuid.uuid4())[:8]

    logger.info(f"[GUIDE {guide_id}] Received formatted transcript ({len(req.formatted_transcript)} chars)")

    # Store placeholder so frontend knows it's in progress
    guide_store[guide_id] = {"guide_id": guide_id, "status": "generating"}

    # Run agent in background — doesn't block the HTTP response
    background_tasks.add_task(_run_guide_agent, guide_id, req.formatted_transcript)

    return {"guide_id": guide_id, "status": "generating"}


@app.get("/guide/{guide_id}")
async def get_guide(guide_id: str):
    """Retrieve generated output (guide + reference docs + prompts).

    Frontend polls this endpoint. Returns:
    - status: "generating" — still working
    - status: "complete" — outputs ready
    - status: "error" — something failed
    - status: "not_found" — invalid guide_id
    """
    if guide_id in guide_store:
        return guide_store[guide_id]
    return {
        "guide_id": guide_id,
        "status": "not_found",
        "message": "Guide not found. It may still be generating or the ID is invalid.",
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
