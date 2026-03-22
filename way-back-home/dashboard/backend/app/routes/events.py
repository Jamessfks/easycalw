"""
Event Routes (Public)

Public endpoints for event information and participant listing.
"""

from fastapi import APIRouter, HTTPException

from ..database import get_event, check_username_exists, list_participants_by_event
from ..models import EventResponse, UsernameCheckResponse, ParticipantResponse


router = APIRouter(prefix="/events", tags=["Events"])


@router.get("/{code}", response_model=EventResponse)
async def get_event_info(code: str):
    """
    Get event information by code.

    Used by setup.sh to validate event codes.
    """
    event = await get_event(code)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if not event.get("active", True):
        raise HTTPException(status_code=410, detail="Event has ended")

    return EventResponse(**event)


@router.get("/{code}/check-username/{username}", response_model=UsernameCheckResponse)
async def check_username(code: str, username: str):
    """
    Check if a username is available for an event.

    Used by setup.sh to validate username choice.
    """
    # First verify event exists
    event = await get_event(code)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    exists = await check_username_exists(code, username)

    return UsernameCheckResponse(
        available=not exists,
        username=username
    )


@router.get("/{code}/participants", response_model=list[ParticipantResponse])
async def list_event_participants(code: str):
    """
    List all participants for an event.

    Used by the world map UI to render participant markers.
    """
    # Verify event exists
    event = await get_event(code)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    participants = await list_participants_by_event(code)

    # Only return active participants with completed registration
    return [
        ParticipantResponse(**p)
        for p in participants
        if p.get("active", True) and p.get("registered_at")
    ]
