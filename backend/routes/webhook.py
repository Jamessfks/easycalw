"""Vapi webhook receiver — end-of-call reports trigger guide generation."""

import os
import json
import uuid
import hmac
import hashlib
import asyncio
import logging

from fastapi import APIRouter, Request, BackgroundTasks, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address

from formatter import format_transcript
from supabase_store import GuideStore

logger = logging.getLogger(__name__)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# Shared state — injected from main.py at startup
guide_store: GuideStore = None
_event_queues: dict[str, asyncio.Queue] = None
_run_guide_agent = None  # function reference, injected from guides router


def init(store: GuideStore, event_queues: dict[str, asyncio.Queue], run_guide_agent_fn):
    """Called from main.py to inject shared state."""
    global guide_store, _event_queues, _run_guide_agent
    guide_store = store
    _event_queues = event_queues
    _run_guide_agent = run_guide_agent_fn


_VAPI_WEBHOOK_SECRET = os.environ.get("VAPI_WEBHOOK_SECRET", "")


@router.post("/webhook")
@limiter.limit("60/hour")
async def vapi_webhook(request: Request, background_tasks: BackgroundTasks):
    """VAPI server URL — receives transcript events, function-call requests,
    and end-of-call reports.
    """
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
            _event_queues[guide_id] = asyncio.Queue()
            background_tasks.add_task(_run_guide_agent, guide_id, formatted)
            logger.info(f"[WEBHOOK] Guide generation started: {guide_id}")
        except Exception as e:
            logger.error(f"[WEBHOOK] Pipeline failed: {e}", exc_info=True)

    return {"ok": True}
