"""
Common Models

Health check and configuration response models.
"""

from datetime import datetime
from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str
    timestamp: datetime
    version: str


class ConfigResponse(BaseModel):
    """Response model for client configuration."""
    api_base_url: str
    map_base_url: str
    version: str
