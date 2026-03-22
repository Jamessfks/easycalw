"""
Admin Routes (Protected)

Admin endpoints for event management.
Requires Firebase Auth - user must be in 'admins' Firestore collection.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends

from ..config import DEFAULT_MAX_PARTICIPANTS
from ..database import get_event, create_event, list_events, delete_event
from ..dependencies import verify_admin
from ..models import EventCreate, EventResponse


router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/events", response_model=EventResponse)
async def create_new_event(data: EventCreate, admin_email: str = Depends(verify_admin)):
    """
    Create a new event (admin only).

    Requires Firebase Auth. User must be in the 'admins' Firestore collection.
    """
    # Check if event code already exists
    existing = await get_event(data.code)
    if existing:
        raise HTTPException(status_code=409, detail="Event code already exists")

    event = {
        "code": data.code,
        "name": data.name,
        "description": data.description,
        "max_participants": data.max_participants or DEFAULT_MAX_PARTICIPANTS,
        "participant_count": 0,
        "created_at": datetime.now(timezone.utc),
        "created_by": admin_email,  # Audit trail
        "active": True,
    }

    await create_event(event)

    return EventResponse(**event)


@router.get("/events", response_model=list[EventResponse])
async def list_all_events(admin_email: str = Depends(verify_admin)):
    """
    List all events (admin only).

    Requires Firebase Auth. User must be in the 'admins' Firestore collection.
    """
    events = await list_events()
    return [EventResponse(**e) for e in events]


@router.delete("/events/{code}")
async def deactivate_event(code: str, admin_email: str = Depends(verify_admin)):
    """
    Deactivate an event (admin only).

    Does not delete data, just marks event as inactive.
    Requires Firebase Auth. User must be in the 'admins' Firestore collection.
    """
    event = await get_event(code)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    await delete_event(code)

    return {"status": "success", "message": f"Event {code} deactivated", "deactivated_by": admin_email}
