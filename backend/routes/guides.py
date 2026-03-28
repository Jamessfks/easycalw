"""Guide CRUD + generation + SSE streaming routes."""

import os
import json
import uuid
import asyncio
import logging

from fastapi import APIRouter, Request, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator
from slowapi import Limiter
from slowapi.util import get_remote_address
from sse_starlette.sse import EventSourceResponse

from formatter import format_transcript
from setup_guide_agent.agent import generate_guide
from setup_guide_agent.gemini_agent import generate_guide_gemini
from supabase_store import GuideStore
from mock_data import compute_scorecard

logger = logging.getLogger(__name__)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# Shared state — injected from main.py at startup
guide_store: GuideStore = None
_event_queues: dict[str, asyncio.Queue] = None

MAX_TRANSCRIPT_BYTES = 100 * 1024  # 100KB


def init(store: GuideStore, event_queues: dict[str, asyncio.Queue]):
    """Called from main.py to inject shared state."""
    global guide_store, _event_queues
    guide_store = store
    _event_queues = event_queues


# ── Request Models ──────────────────────────────────────────────────────────


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


# ── Helpers ─────────────────────────────────────────────────────────────────


def _anthropic_available() -> bool:
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    return bool(key) and not key.startswith("not-needed")


async def _generate_guide_smart(formatted_transcript: str, event_queue=None, guide_id=None) -> dict:
    """Auto-select Claude or Gemini based on API key availability."""
    if _anthropic_available():
        return await generate_guide(formatted_transcript, event_queue=event_queue, guide_id=guide_id)
    else:
        logger.warning("[GUIDE] Anthropic key unavailable — using Gemini 2.5 Pro fallback")
        return await generate_guide_gemini(formatted_transcript, event_queue=event_queue)


async def _run_guide_agent(guide_id: str, formatted_transcript: str):
    """Run the Setup Guide Agent in the background."""
    event_queue = _event_queues.get(guide_id)
    try:
        result = await _generate_guide_smart(formatted_transcript, event_queue=event_queue, guide_id=guide_id)
        if result.get("status") == "complete" and result.get("outputs"):
            result["scorecard"] = compute_scorecard(result["outputs"])
        await guide_store.set(guide_id, {**result, "guide_id": guide_id})
    except Exception as e:
        logger.error(f"[GUIDE {guide_id}] Background task failed: {e}", exc_info=True)
        await guide_store.set(guide_id, {
            "guide_id": guide_id, "status": "error", "message": str(e), "outputs": {},
        })
        if event_queue:
            await event_queue.put({"type": "error", "message": str(e)})
    finally:
        if event_queue:
            await event_queue.put(None)  # sentinel to close SSE stream
        _event_queues.pop(guide_id, None)


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
    result["scorecard"] = compute_scorecard(result["outputs"])
    return result


# ── Endpoints ───────────────────────────────────────────────────────────────


@router.post("/format")
@limiter.limit("30/hour")
async def format_endpoint(request: Request, req: FormatRequest):
    """Triggers the Interview Formatter on a transcript."""
    logger.info(f"[FORMAT] Received transcript ({len(req.transcript)} chars)")
    formatted = await format_transcript(req.transcript)
    return {"formatted": formatted}


@router.get("/guides")
async def list_guides(limit: int = 20, offset: int = 0):
    """List recent guides — metadata only (no content)."""
    guides = await guide_store.list_guides(limit=limit, offset=offset)
    total = await guide_store.count_guides()
    return {"guides": guides, "total": total}


@router.post("/generate-guide")
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
    _event_queues[guide_id] = asyncio.Queue()
    background_tasks.add_task(_run_guide_agent, guide_id, req.formatted_transcript)

    return {"guide_id": guide_id, "status": "generating"}


@router.get("/guide/{guide_id}")
async def get_guide(guide_id: str):
    """Retrieve generated output (guide + reference docs + prompts)."""
    if guide_id in guide_store:
        return guide_store.get_sync(guide_id)

    # Fallback: try to recover from disk
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


@router.post("/retry-guide/{guide_id}")
@limiter.limit("3/hour")
async def retry_guide(guide_id: str, request: Request, background_tasks: BackgroundTasks):
    """Retry guide generation for a guide that failed or got stuck."""
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

    await guide_store.set(guide_id, {"guide_id": guide_id, "status": "retrying"})
    _event_queues[guide_id] = asyncio.Queue()
    background_tasks.add_task(_run_guide_agent, guide_id, formatted_transcript)

    logger.info(f"[RETRY] Retrying guide generation: {guide_id}")
    return {"guide_id": guide_id, "status": "retrying", "message": "Guide generation restarted"}


@router.get("/events/{guide_id}")
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
