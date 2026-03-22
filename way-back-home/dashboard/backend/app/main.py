"""
Way Back Home - Mission Control API

Backend service for the Way Back Home workshop platform.
Handles event management, participant registration, and avatar storage.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_cors_origins, get_cors_origin_regex
from .routes import health, events, participants, admin


# =============================================================================
# FastAPI Application
# =============================================================================

app = FastAPI(
    title="Way Back Home - Mission Control",
    description="Backend API for the Way Back Home workshop platform",
    version="1.0.0",
)


# =============================================================================
# CORS Middleware
# =============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_origin_regex=get_cors_origin_regex(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Include Routers
# =============================================================================

# Health & config (no prefix - mounted at root)
app.include_router(health.router)

# Event endpoints
app.include_router(events.router)

# Participant endpoints
app.include_router(participants.router)

# Admin endpoints (protected by Firebase Auth)
app.include_router(admin.router)
