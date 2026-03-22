"""
Firebase Storage Operations

Handles avatar image upload and URL generation using Firebase Storage.
"""

import os
from google.cloud import storage

# =============================================================================
# Configuration
# =============================================================================

PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "way-back-home-dev")

# Firebase Storage bucket (format: project-id.firebasestorage.app)
FIREBASE_STORAGE_BUCKET = os.environ.get(
    "FIREBASE_STORAGE_BUCKET",
    f"{PROJECT_ID}.firebasestorage.app"
)

# Initialize storage client (lazy)
_client: storage.Client = None
_bucket: storage.Bucket = None


def get_bucket() -> storage.Bucket:
    """Get or create the Firebase Storage bucket reference."""
    global _client, _bucket

    if _client is None:
        _client = storage.Client(project=PROJECT_ID)

    if _bucket is None:
        _bucket = _client.bucket(FIREBASE_STORAGE_BUCKET)

    return _bucket


async def upload_avatar_image(path: str, data: bytes, content_type: str) -> str:
    """
    Upload an avatar image to Firebase Storage and make it public.

    Args:
        path: The storage path (e.g., 'avatars/event-code/participant-id/portrait.png')
        data: The image bytes
        content_type: MIME type (e.g., 'image/png')

    Returns:
        The public URL of the uploaded image
    """
    bucket = get_bucket()
    blob = bucket.blob(path)

    # Set metadata for proper serving
    blob.content_type = content_type
    blob.cache_control = "public, max-age=31536000"  # Cache for 1 year

    # Upload the image
    blob.upload_from_string(data, content_type=content_type)

    # Make the blob publicly readable so browsers can fetch avatar images
    # This bypasses Storage rules for this specific file
    blob.make_public()

    # Return the public URL (format: https://storage.googleapis.com/{bucket}/{path})
    return blob.public_url


def get_avatar_url(path: str) -> str:
    """
    Get the public URL for an avatar image.

    Note: This constructs the URL without checking if the file exists.
    Use after upload_avatar_image has been called.

    Args:
        path: The storage path

    Returns:
        The public URL for the file
    """
    bucket = get_bucket()
    blob = bucket.blob(path)
    return blob.public_url


async def delete_avatar_images(event_code: str, participant_id: str) -> None:
    """
    Delete all avatar images for a participant.

    Args:
        event_code: The event code
        participant_id: The participant ID
    """
    bucket = get_bucket()
    prefix = f"avatars/{event_code}/{participant_id}/"

    blobs = bucket.list_blobs(prefix=prefix)
    for blob in blobs:
        blob.delete()


async def delete_event_images(event_code: str) -> None:
    """
    Delete all images for an event.

    Use with caution - this deletes all participant avatars!

    Args:
        event_code: The event code
    """
    bucket = get_bucket()
    prefix = f"avatars/{event_code}/"

    blobs = bucket.list_blobs(prefix=prefix)
    for blob in blobs:
        blob.delete()
