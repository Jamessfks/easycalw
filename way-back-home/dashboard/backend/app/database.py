"""
Firestore Database Operations

Handles all database interactions for events and participants.
Uses async Firestore client for better performance.
"""

import os
from datetime import datetime, timezone
from typing import Optional
from google.cloud import firestore
from google.cloud.firestore_v1 import AsyncClient

# =============================================================================
# Configuration
# =============================================================================

PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "way-back-home-dev")

# Initialize async Firestore client
db: Optional[AsyncClient] = None


def get_db() -> AsyncClient:
    """Get or create the Firestore async client."""
    global db
    if db is None:
        db = AsyncClient(project=PROJECT_ID)
    return db


# =============================================================================
# Event Operations
# =============================================================================

async def get_event(code: str) -> Optional[dict]:
    """
    Get an event by its code.

    Args:
        code: The event code (e.g., 'devfest-nyc-25')

    Returns:
        Event data dict or None if not found
    """
    client = get_db()
    doc = await client.collection("events").document(code).get()

    if doc.exists:
        data = doc.to_dict()
        data["code"] = doc.id
        return data
    return None


async def create_event(event: dict) -> str:
    """
    Create a new event.

    Args:
        event: Event data including code, name, etc.

    Returns:
        The event code
    """
    client = get_db()
    code = event["code"]

    # Store with code as document ID
    await client.collection("events").document(code).set(event)

    return code


async def update_event(code: str, updates: dict) -> None:
    """
    Update an existing event.

    Args:
        code: The event code
        updates: Fields to update
    """
    client = get_db()
    await client.collection("events").document(code).update(updates)


async def delete_event(code: str) -> None:
    """
    Soft-delete an event by marking it inactive.

    Args:
        code: The event code
    """
    client = get_db()
    await client.collection("events").document(code).update({
        "active": False,
        "deactivated_at": datetime.now(timezone.utc),
    })


async def list_events(active_only: bool = False) -> list[dict]:
    """
    List all events.

    Args:
        active_only: If True, only return active events

    Returns:
        List of event data dicts
    """
    client = get_db()
    query = client.collection("events")

    if active_only:
        query = query.where("active", "==", True)

    docs = query.stream()

    events = []
    async for doc in docs:
        data = doc.to_dict()
        data["code"] = doc.id
        events.append(data)

    return events


async def increment_participant_count(event_code: str) -> None:
    """
    Increment the participant count for an event.

    Uses Firestore increment for atomic updates.

    Args:
        event_code: The event code
    """
    client = get_db()
    await client.collection("events").document(event_code).update({
        "participant_count": firestore.Increment(1)
    })


# =============================================================================
# Participant Operations
# =============================================================================

async def get_participant(participant_id: str) -> Optional[dict]:
    """
    Get a participant by their ID.

    Args:
        participant_id: The participant's unique ID

    Returns:
        Participant data dict or None if not found
    """
    client = get_db()
    doc = await client.collection("participants").document(participant_id).get()

    if doc.exists:
        data = doc.to_dict()
        data["participant_id"] = doc.id
        return data
    return None


async def create_participant(participant: dict) -> str:
    """
    Create a new participant.

    Also increments the event's participant count.

    Args:
        participant: Participant data

    Returns:
        The participant ID
    """
    client = get_db()
    participant_id = participant["participant_id"]

    # Add lowercase username for case-insensitive searches
    participant["username_lower"] = participant["username"].lower()

    # Store with participant_id as document ID
    await client.collection("participants").document(participant_id).set(participant)

    # Increment event participant count
    await increment_participant_count(participant["event_code"])

    return participant_id


async def update_participant(participant_id: str, updates: dict) -> None:
    """
    Update an existing participant.

    Args:
        participant_id: The participant's unique ID
        updates: Fields to update
    """
    client = get_db()
    await client.collection("participants").document(participant_id).update(updates)


async def check_username_exists(event_code: str, username: str) -> bool:
    """
    Check if a username is already taken for an event.

    Uses case-insensitive comparison.

    Args:
        event_code: The event code
        username: The username to check

    Returns:
        True if username exists, False otherwise
    """
    client = get_db()

    # Query for matching username in the event
    # Note: Firestore doesn't support case-insensitive queries natively,
    # so we store a lowercase version for comparison
    query = (
        client.collection("participants")
        .where("event_code", "==", event_code)
        .where("username_lower", "==", username.lower())
        .limit(1)
    )

    docs = query.stream()

    async for doc in docs:
        return True

    return False


async def list_participants_by_event(event_code: str) -> list[dict]:
    """
    List all participants for an event.

    Args:
        event_code: The event code

    Returns:
        List of participant data dicts
    """
    client = get_db()

    query = (
        client.collection("participants")
        .where("event_code", "==", event_code)
        .where("active", "==", True)
    )

    docs = query.stream()

    participants = []
    async for doc in docs:
        data = doc.to_dict()
        data["participant_id"] = doc.id
        participants.append(data)

    return participants


async def get_participant_by_username(event_code: str, username: str) -> Optional[dict]:
    """
    Get a participant by their username within an event.

    Args:
        event_code: The event code
        username: The username

    Returns:
        Participant data dict or None if not found
    """
    client = get_db()

    query = (
        client.collection("participants")
        .where("event_code", "==", event_code)
        .where("username_lower", "==", username.lower())
        .limit(1)
    )

    docs = query.stream()

    async for doc in docs:
        data = doc.to_dict()
        data["participant_id"] = doc.id
        return data

    return None


# =============================================================================
# Admin Operations
# =============================================================================

async def is_admin(email: str) -> bool:
    """
    Check if an email is in the admins collection.

    Args:
        email: The user's email address

    Returns:
        True if user is an admin, False otherwise
    """
    client = get_db()

    # Check if document exists in admins collection
    # Document ID is the email address
    doc = await client.collection("admins").document(email).get()

    return doc.exists
