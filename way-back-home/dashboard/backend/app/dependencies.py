"""
Shared Dependencies

Authentication and other shared dependencies for route handlers.
"""

import firebase_admin
from firebase_admin import auth as firebase_auth
from fastapi import Header, HTTPException

from .database import is_admin


# =============================================================================
# Firebase Admin SDK Initialization
# =============================================================================

# Initialize Firebase Admin SDK (uses default credentials in Cloud Run)
if not firebase_admin._apps:
    firebase_admin.initialize_app()


# =============================================================================
# Admin Authentication
# =============================================================================

async def verify_admin(authorization: str = Header(...)) -> str:
    """
    Verify Firebase ID token and check if user is an admin.

    Admin users must be added to the 'admins' Firestore collection.
    Document ID should be the user's email address.

    Returns:
        The admin's email address

    Raises:
        HTTPException 401: Invalid or missing token
        HTTPException 403: User is not an admin
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header format")

    id_token = authorization[7:]  # Remove "Bearer " prefix

    try:
        # Verify the Firebase ID token
        decoded_token = firebase_auth.verify_id_token(id_token)
        email = decoded_token.get("email")

        if not email:
            raise HTTPException(status_code=401, detail="Token does not contain email")

        # Check if user is in the admins collection
        if not await is_admin(email):
            raise HTTPException(
                status_code=403,
                detail=f"User {email} is not an admin"
            )

        return email

    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid ID token")
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="ID token has expired")
    except firebase_auth.RevokedIdTokenError:
        raise HTTPException(status_code=401, detail="ID token has been revoked")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
