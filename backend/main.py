import os
import json
import uuid
import hmac
import hashlib
import shutil
import asyncio
import logging
from datetime import datetime, timezone, timedelta

from dotenv import load_dotenv
from fastapi import FastAPI, Request, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, field_validator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sse_starlette.sse import EventSourceResponse

from formatter import format_transcript
from setup_guide_agent.agent import generate_guide
from setup_guide_agent.gemini_agent import generate_guide_gemini
from supabase_store import GuideStore

def _anthropic_available() -> bool:
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    return bool(key) and not key.startswith("not-needed")

async def generate_guide_smart(formatted_transcript: str, event_queue=None, guide_id=None) -> dict:
    """Auto-select Claude or Gemini based on API key availability."""
    if _anthropic_available():
        return await generate_guide(formatted_transcript, event_queue=event_queue, guide_id=guide_id)
    else:
        logger.warning("[GUIDE] Anthropic key unavailable — using Gemini 2.5 Pro fallback")
        return await generate_guide_gemini(formatted_transcript, event_queue=event_queue)
from mock_data import DEMO_GUIDES, compute_scorecard

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

app = FastAPI(title="EasyClaw API")

# CORS — configurable via env, defaults to permissive for development
_cors_origins = os.getenv("CORS_ORIGINS", "*")
_allowed_origins = (
    ["*"] if _cors_origins == "*" else [o.strip() for o in _cors_origins.split(",")]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Request size limit
MAX_TRANSCRIPT_BYTES = 100 * 1024  # 100KB

# Webhook HMAC authentication
_VAPI_WEBHOOK_SECRET = os.environ.get("VAPI_WEBHOOK_SECRET", "")
if not _VAPI_WEBHOOK_SECRET:
    logger.warning(
        "[SECURITY] VAPI_WEBHOOK_SECRET is not set — webhook signature verification disabled. "
        "Set VAPI_WEBHOOK_SECRET in .env for production use."
    )

# Guide cleanup
_on_railway = bool(os.environ.get("RAILWAY_ENVIRONMENT"))
_GUIDE_OUTPUT_DIR = os.environ.get(
    "GUIDE_OUTPUT_DIR",
    "/data/guide_output" if _on_railway else "./guide_output",
)
_GUIDE_MAX_AGE_DAYS = int(os.environ.get("GUIDE_MAX_AGE_DAYS", "7"))
_is_persistent = _GUIDE_OUTPUT_DIR.startswith("/data")
logger.info(f"Guide output directory: {_GUIDE_OUTPUT_DIR} (persistent: {_is_persistent})")

# Guide store — uses Supabase when SUPABASE_URL is set, else in-memory
guide_store = GuideStore()

# SSE event queues — maps guide_id -> asyncio.Queue for streaming progress
_event_queues: dict[str, asyncio.Queue] = {}


def _cleanup_old_guides():
    """Delete guide directories older than _GUIDE_MAX_AGE_DAYS."""
    if not os.path.isdir(_GUIDE_OUTPUT_DIR):
        return

    cutoff = datetime.now(timezone.utc) - timedelta(days=_GUIDE_MAX_AGE_DAYS)
    removed = 0

    for entry in os.listdir(_GUIDE_OUTPUT_DIR):
        path = os.path.join(_GUIDE_OUTPUT_DIR, entry)
        if not os.path.isdir(path):
            continue
        mtime = datetime.fromtimestamp(os.path.getmtime(path), tz=timezone.utc)
        if mtime < cutoff:
            try:
                shutil.rmtree(path)
                guide_store.pop_sync(entry, None)
                removed += 1
            except Exception as e:
                logger.warning(f"[CLEANUP] Failed to remove {path}: {e}")

    if removed > 0:
        logger.info(f"[CLEANUP] Removed {removed} guides older than {_GUIDE_MAX_AGE_DAYS} days")


@app.on_event("startup")
async def startup_tasks():
    _cleanup_old_guides()
    # Pre-build KB embedding index in background
    try:
        from setup_guide_agent.kb_search import kb_index

        asyncio.create_task(kb_index.build())
        logger.info("[STARTUP] KB embedding index building in background...")
    except Exception as e:
        logger.warning(f"[STARTUP] KB index pre-build failed (will retry on first search): {e}")


# ========================================
# Request Models
# ========================================

class FormatRequest(BaseModel):
    transcript: str

    @field_validator("transcript")
    @classmethod
    def transcript_valid(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Transcript cannot be empty")
        if len(v.encode("utf-8")) > MAX_TRANSCRIPT_BYTES:
            raise ValueError(f"Transcript exceeds maximum size of {MAX_TRANSCRIPT_BYTES // 1024}KB")
        return v


class GenerateGuideRequest(BaseModel):
    formatted_transcript: str

    @field_validator("formatted_transcript")
    @classmethod
    def transcript_valid(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Formatted transcript cannot be empty")
        if len(v.encode("utf-8")) > MAX_TRANSCRIPT_BYTES:
            raise ValueError(f"Transcript exceeds maximum size of {MAX_TRANSCRIPT_BYTES // 1024}KB")
        return v


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    for error in exc.errors():
        if "exceeds maximum size" in str(error.get("msg", "")):
            return JSONResponse(
                status_code=413,
                content={"detail": "Payload Too Large: transcript exceeds 100KB limit"},
            )
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


# ========================================
# Background Task Runner
# ========================================

async def _run_guide_agent(guide_id: str, formatted_transcript: str):
    """Run the Setup Guide Agent in the background.

    Streams progress events to an asyncio.Queue (if an SSE client is connected),
    and updates guide_store for polling fallback.
    """
    event_queue = _event_queues.get(guide_id)
    try:
        result = await generate_guide_smart(formatted_transcript, event_queue=event_queue, guide_id=guide_id)
        # Attach scorecard to completed guides
        if result.get("status") == "complete" and result.get("outputs"):
            result["scorecard"] = compute_scorecard(result["outputs"])
        await guide_store.set(guide_id, {
            **result,
            "guide_id": guide_id,
        })
    except Exception as e:
        logger.error(f"[GUIDE {guide_id}] Background task failed: {e}", exc_info=True)
        await guide_store.set(guide_id, {
            "guide_id": guide_id,
            "status": "error",
            "message": str(e),
            "outputs": {},
        })
        if event_queue:
            await event_queue.put({"type": "error", "message": str(e)})
    finally:
        if event_queue:
            await event_queue.put(None)  # sentinel to close SSE stream
        _event_queues.pop(guide_id, None)


# ========================================
# Endpoints
# ========================================

@app.get("/health")
async def health_check():
    """Health check for monitoring and load balancers."""
    from setup_guide_agent.agent import MODEL as _guide_model

    return {
        "status": "ok",
        "service": "easyclaw",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "guides_in_memory": len(guide_store),
        "models": {
            "guide_generation": _guide_model,
            "formatter_primary": "gemini-2.5-flash",
            "formatter_fallback": "claude-haiku-4-5-20251001",
            "evaluator": "gemini-2.5-flash",
            "embeddings": "gemini-embedding-001",
        },
    }


@app.get("/guides")
async def list_guides(limit: int = 20, offset: int = 0):
    """List recent guides — metadata only (no content). For dashboard/demo use."""
    guides = await guide_store.list_guides(limit=limit, offset=offset)
    return {"guides": guides, "total": len(guides)}


@app.get("/demos")
async def list_demos():
    """Returns metadata for all available demo guides (no content)."""
    return [
        {
            "demo_id": k,
            "title": v["title"],
            "subtitle": v["subtitle"],
            "category": v["category"],
            "icon": v["icon"],
            "color": v["color"],
        }
        for k, v in DEMO_GUIDES.items()
    ]


@app.post("/webhook")
@limiter.limit("60/hour")
async def vapi_webhook(request: Request, background_tasks: BackgroundTasks):
    """VAPI server URL — receives transcript events, function-call requests,
    and end-of-call reports.
    """
    # HMAC signature verification
    raw_body = await request.body()
    if _VAPI_WEBHOOK_SECRET:
        signature = request.headers.get("x-vapi-signature", "")
        if not signature:
            logger.warning("[WEBHOOK] Missing x-vapi-signature header — rejecting request")
            raise HTTPException(status_code=401, detail="Missing webhook signature")
        expected = hmac.new(
            _VAPI_WEBHOOK_SECRET.encode(), raw_body, hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(signature, expected):
            logger.warning("[WEBHOOK] Invalid webhook signature — rejecting request")
            raise HTTPException(status_code=401, detail="Invalid webhook signature")

    try:
        body = json.loads(raw_body)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    message = body.get("message", {})
    msg_type = message.get("type", "unknown")

    logger.info(f"[WEBHOOK] Received event: {msg_type}")

    if msg_type == "transcript":
        transcript = message.get("transcript", "")
        role = message.get("role", "unknown")
        logger.info(f"[WEBHOOK] {role}: {transcript[:100]}...")

    elif msg_type == "function-call":
        fn_name = message.get("functionCall", {}).get("name", "unknown")
        logger.warning(f"[WEBHOOK] Unhandled function call: {fn_name}")
        return {"results": [{"result": f"Function '{fn_name}' not implemented"}]}

    elif msg_type == "end-of-call-report":
        artifact = message.get("artifact", {})
        messages = artifact.get("messages", [])
        if messages:
            transcript_text = "\n".join(
                f"{'User' if m.get('role') == 'user' else 'Agent'}: {m.get('message', '')}"
                for m in messages
                if m.get("message")
            )
        else:
            transcript_text = artifact.get("transcript", "")

        logger.info(f"[WEBHOOK] End of call — transcript length: {len(transcript_text)} chars")

        if not transcript_text.strip():
            logger.warning("[WEBHOOK] Empty transcript — skipping guide generation")
            return {"ok": True, "skipped": "empty_transcript"}

        try:
            formatted = await format_transcript(transcript_text)
            guide_id = str(uuid.uuid4())[:8]
            await guide_store.set(guide_id, {"guide_id": guide_id, "status": "generating"})
            background_tasks.add_task(_run_guide_agent, guide_id, formatted)
            logger.info(f"[WEBHOOK] Guide generation started: {guide_id}")
        except Exception as e:
            logger.error(f"[WEBHOOK] Pipeline failed: {e}", exc_info=True)

    return {"ok": True}


@app.post("/format")
@limiter.limit("30/hour")
async def format_endpoint(request: Request, req: FormatRequest):
    """Triggers the Interview Formatter on a transcript."""
    logger.info(f"[FORMAT] Received transcript ({len(req.transcript)} chars)")
    formatted = await format_transcript(req.transcript)
    return {"formatted": formatted}


@app.post("/generate-guide")
@limiter.limit("20/hour")
async def generate_guide_endpoint(
    request: Request,
    req: GenerateGuideRequest,
    background_tasks: BackgroundTasks,
):
    """Triggers Phase 2: Setup Guide Creation Agent.

    Returns immediately with a guide_id. Frontend connects to
    GET /events/{guide_id} for real-time SSE progress, or falls
    back to polling GET /guide/{guide_id}.
    """
    guide_id = str(uuid.uuid4())[:8]
    logger.info(f"[GUIDE {guide_id}] Received formatted transcript ({len(req.formatted_transcript)} chars)")

    await guide_store.set(guide_id, {"guide_id": guide_id, "status": "generating"})

    # Create event queue for SSE streaming
    _event_queues[guide_id] = asyncio.Queue()

    background_tasks.add_task(_run_guide_agent, guide_id, req.formatted_transcript)

    return {"guide_id": guide_id, "status": "generating"}


@app.get("/mock-generate")
async def mock_generate(demo_id: str = "demo-restaurant"):
    """Returns a demo guide for UI testing. Optional demo_id parameter."""
    guide = DEMO_GUIDES.get(demo_id)
    if not guide:
        raise HTTPException(status_code=404, detail=f"Demo '{demo_id}' not found")
    logger.info(f"[MOCK] Serving demo guide: {demo_id}")
    return guide




@app.get("/demo-stream/{demo_id}")
async def demo_stream(demo_id: str):
    """SSE stream for demo golden path — replays a pre-generated guide at 10x speed.
    
    Eliminates the 5-10 minute wait for live demos. Streams fake progress events
    at ~0.5s intervals, completes in ~20s. Output is visually identical to real generation.
    """
    guide = DEMO_GUIDES.get(demo_id)
    if not guide:
        raise HTTPException(status_code=404, detail=f"Demo '{demo_id}' not found")

    async def stream():
        stages = [
            ("Starting agent session...", 1),
            ("Reading transcript...", 2),
            ("Reading documents...", 3),
            ("Scanning knowledge base...", 4),
            ("Reading documents...", 5),
            ("Searching documentation...", 6),
            ("Reading documents...", 7),
            ("Searching documentation...", 8),
            ("Reading documents...", 9),
            ("Processing...", 10),
            ("Reading documents...", 12),
            ("Searching documentation...", 14),
            ("Reading documents...", 16),
            ("Processing...", 18),
            ("Writing output files...", 20),
            ("Writing output files...", 22),
            ("Writing output files...", 24),
            ("Writing output files...", 26),
            ("Writing output files...", 28),
            ("Finalizing...", 30),
        ]
        
        for stage, turn in stages:
            await asyncio.sleep(0.6)  # ~0.6s per turn = ~18s total
            yield {
                "event": "progress",
                "data": json.dumps({
                    "type": "progress",
                    "stage": stage,
                    "turn": turn,
                    "max_turns": 32,
                    "cost": round(turn * 0.019, 4),
                })
            }
        
        # Final complete event with real guide data
        await asyncio.sleep(0.5)
        yield {
            "event": "complete",
            "data": json.dumps({
                **guide,
                "guide_id": f"demo-{demo_id}",
                "status": "complete",
                "is_demo": True,
            }, default=str)
        }

    return EventSourceResponse(stream())

@app.get("/guide/{guide_id}")
async def get_guide(guide_id: str):
    """Retrieve generated output (guide + reference docs + prompts).

    Frontend polls this endpoint. Falls back to reading from disk
    if guide is not in memory (e.g. after a server restart).
    """
    if guide_id in guide_store:
        return guide_store.get_sync(guide_id)

    # Fallback: try to recover from disk output directory
    guide_dir = os.path.join(
        os.environ.get("GUIDE_OUTPUT_DIR", "./guide_output"), guide_id
    )
    guide_file = os.path.join(guide_dir, "OPENCLAW_ENGINE_SETUP_GUIDE.md")
    if os.path.isfile(guide_file):
        result = _load_guide_from_disk(guide_id, guide_dir)
        await guide_store.set(guide_id, result)
        return result

    return {
        "guide_id": guide_id,
        "status": "not_found",
        "message": "Guide not found. It may still be generating or the ID is invalid.",
    }


def _load_guide_from_disk(guide_id: str, guide_dir: str) -> dict:
    """Read a completed guide from its output directory on disk."""

    def _read(path: str) -> str:
        try:
            with open(path, "r") as f:
                return f.read()
        except FileNotFoundError:
            return ""

    setup_guide = _read(os.path.join(guide_dir, "OPENCLAW_ENGINE_SETUP_GUIDE.md"))
    prompts = _read(os.path.join(guide_dir, "prompts_to_send.md"))

    ref_docs = []
    ref_dir = os.path.join(guide_dir, "reference_documents")
    if os.path.isdir(ref_dir):
        for fname in sorted(os.listdir(ref_dir)):
            fpath = os.path.join(ref_dir, fname)
            if os.path.isfile(fpath):
                ref_docs.append({"name": fname, "content": _read(fpath)})

    result = {
        "guide_id": guide_id,
        "status": "complete",
        "message": "Guide recovered from disk.",
        "outputs": {
            "setup_guide": setup_guide,
            "reference_documents": ref_docs,
            "prompts_to_send": prompts,
        },
    }
    # Attach scorecard to recovered guides too
    result["scorecard"] = compute_scorecard(result["outputs"])
    return result


@app.post("/retry-guide/{guide_id}")
@limiter.limit("3/hour")
async def retry_guide(guide_id: str, request: Request, background_tasks: BackgroundTasks):
    """Retry guide generation for a guide that failed or got stuck.

    The original formatted transcript must be on disk.
    Use when: webhook delivered transcript but guide generation failed.
    """
    guide_dir = os.path.join(
        os.environ.get("GUIDE_OUTPUT_DIR", "./guide_output"), guide_id
    )
    transcript_path = os.path.join(guide_dir, "INTERVIEW_TRANSCRIPT.md")

    if not os.path.isfile(transcript_path):
        raise HTTPException(
            status_code=404,
            detail="No transcript found for this guide ID. Cannot retry."
        )

    with open(transcript_path, "r") as f:
        formatted_transcript = f.read()

    # Reset status and retry
    await guide_store.set(guide_id, {"guide_id": guide_id, "status": "retrying"})
    _event_queues[guide_id] = asyncio.Queue()
    background_tasks.add_task(_run_guide_agent, guide_id, formatted_transcript)

    logger.info(f"[RETRY] Retrying guide generation: {guide_id}")
    return {"guide_id": guide_id, "status": "retrying", "message": "Guide generation restarted"}


@app.get("/events/{guide_id}")
async def guide_events(guide_id: str):
    """SSE stream for real-time guide generation progress."""
    queue = _event_queues.get(guide_id)

    if queue is None:
        entry = guide_store.get_sync(guide_id)
        if entry and entry.get("status") in ("complete", "error"):
            async def already_done():
                yield {"event": "complete", "data": json.dumps(guide_store.get_sync(guide_id, {}), default=str)}
            return EventSourceResponse(already_done())

        raise HTTPException(status_code=404, detail="Guide not found or not generating")

    async def event_generator():
        try:
            while True:
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=25)
                except asyncio.TimeoutError:
                    # Heartbeat — keeps Railway proxy + client connection alive
                    yield {"event": "heartbeat", "data": "{}"}
                    continue
                if event is None:
                    final = guide_store.get_sync(guide_id, {})
                    yield {"event": "complete", "data": json.dumps(final, default=str)}
                    break
                yield {"event": event.get("type", "progress"), "data": json.dumps(event, default=str)}
        except asyncio.TimeoutError:
            yield {"event": "error", "data": json.dumps({"message": "Stream timed out after 5 minutes"})}
        except asyncio.CancelledError:
            pass

    return EventSourceResponse(event_generator())


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

# ── SSE Heartbeat patch (prevents Railway 60s proxy timeout) ──────────────────
# Applied 2026-03-26 — replaces event_generator in /events/{guide_id}
