"""
Event Models

Request and response models for event endpoints.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class EventCreate(BaseModel):
    """Request model for creating a new event."""
    code: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-z0-9-]+$")
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None
    max_participants: Optional[int] = Field(default=None, ge=10, le=10000)


class EventResponse(BaseModel):
    """Response model for event information."""
    code: str
    name: str
    description: Optional[str] = None
    max_participants: int
    participant_count: int = 0
    created_at: datetime
    created_by: Optional[str] = None  # Admin email who created the event
    active: bool = True
