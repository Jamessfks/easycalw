"""Demo guide endpoints — mock generation and SSE replay."""

import json
import asyncio
import logging

from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse

from mock_data import DEMO_GUIDES

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/demos")
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


@router.get("/mock-generate")
async def mock_generate(demo_id: str = "demo-restaurant"):
    """Returns a demo guide for UI testing. Optional demo_id parameter."""
    guide = DEMO_GUIDES.get(demo_id)
    if not guide:
        raise HTTPException(status_code=404, detail=f"Demo '{demo_id}' not found")
    logger.info(f"[MOCK] Serving demo guide: {demo_id}")
    return guide


@router.get("/demo-stream/{demo_id}")
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
            await asyncio.sleep(0.6)
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
