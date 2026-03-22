"""
Application Configuration

Centralized configuration loaded from environment variables.
"""

import os


# =============================================================================
# Google Cloud / Firebase
# =============================================================================

PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "way-back-home-dev")

FIREBASE_STORAGE_BUCKET = os.environ.get(
    "FIREBASE_STORAGE_BUCKET",
    f"{PROJECT_ID}.firebasestorage.app"
)


# =============================================================================
# URLs
# =============================================================================

API_BASE_URL = os.environ.get("API_BASE_URL", "https://api.waybackhome.dev")
MAP_BASE_URL = os.environ.get("MAP_BASE_URL", "https://waybackhome.dev")


# =============================================================================
# Map Settings
# =============================================================================

MAP_WIDTH = int(os.environ.get("MAP_WIDTH", "100"))
MAP_HEIGHT = int(os.environ.get("MAP_HEIGHT", "100"))


# =============================================================================
# Event Defaults
# =============================================================================

DEFAULT_MAX_PARTICIPANTS = int(os.environ.get("DEFAULT_MAX_PARTICIPANTS", "500"))


# =============================================================================
# CORS Origins
# =============================================================================

def get_cors_origins() -> list[str]:
    """Get allowed CORS origins based on MAP_BASE_URL."""
    return [
        MAP_BASE_URL,
        MAP_BASE_URL.replace("https://", "https://www."),  # www variant
        "http://localhost:3000",  # Local development (React/Next.js)
        "http://localhost:5173",  # Vite dev server
        "http://localhost:8080",  # Local backend testing
        "http://localhost:8000",  # Local backend testing
    ]


def get_cors_origin_regex() -> str:
    """Get allowed CORS origin regex for dynamic environments like Cloud Shell."""
    # Matches any subdomain of cloudshell.dev
    return r"https://.*\.cloudshell\.dev"
