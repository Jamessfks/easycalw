"""
Health & Configuration Routes

Health check and client configuration endpoints.
"""

from datetime import datetime, timezone
from fastapi import APIRouter

from ..config import API_BASE_URL, MAP_BASE_URL
from ..models import HealthResponse, ConfigResponse


router = APIRouter(tags=["Health"])

VERSION = "1.0.0"


@router.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(timezone.utc),
        version=VERSION
    )


@router.get("/health", response_model=HealthResponse)
async def health():
    """Alternative health check endpoint."""
    return await health_check()


@router.get("/config", response_model=ConfigResponse)
async def get_config():
    """
    Get client configuration (URLs, etc.).

    Used by setup.sh and other clients to discover endpoints.
    """
    return ConfigResponse(
        api_base_url=API_BASE_URL,
        map_base_url=MAP_BASE_URL,
        version=VERSION
    )
