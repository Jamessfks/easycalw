"""EasyClaw API — slim entry point.

Mounts route modules and handles app-level concerns:
CORS, rate limiting, startup tasks, static file serving.
"""

import os
import shutil
import asyncio
import logging
from datetime import datetime, timezone, timedelta

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from supabase_store import GuideStore
from routes import guides, webhook, demos

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# ========================================
# Application Initialization
# ========================================

app = FastAPI(title="EasyClaw API")

# CORS
_cors_origins = os.getenv("CORS_ORIGINS", "*")
_allowed_origins = (
    ["*"] if _cors_origins == "*" else [o.strip() for o in _cors_origins.split(",")]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Shared state
guide_store = GuideStore()
_event_queues: dict[str, asyncio.Queue] = {}

# Guide cleanup config
_on_railway = bool(os.environ.get("RAILWAY_ENVIRONMENT"))
_GUIDE_OUTPUT_DIR = os.environ.get(
    "GUIDE_OUTPUT_DIR",
    "/data/guide_output" if _on_railway else "./guide_output",
)
_GUIDE_MAX_AGE_DAYS = int(os.environ.get("GUIDE_MAX_AGE_DAYS", "7"))

# Webhook security
_VAPI_WEBHOOK_SECRET = os.environ.get("VAPI_WEBHOOK_SECRET", "")
if not _VAPI_WEBHOOK_SECRET:
    logger.warning(
        "[SECURITY] VAPI_WEBHOOK_SECRET is not set — webhook signature verification disabled."
    )

# ========================================
# Inject shared state into routers
# ========================================

guides.init(guide_store, _event_queues)
webhook.init(guide_store, _event_queues, guides._run_guide_agent)

# Mount routers
app.include_router(guides.router)
app.include_router(webhook.router)
app.include_router(demos.router)


# ========================================
# Exception handlers
# ========================================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    for error in exc.errors():
        if "exceeds maximum size" in str(error.get("msg", "")):
            return JSONResponse(
                status_code=413,
                content={"detail": "Payload Too Large: transcript exceeds 100KB limit"},
            )
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


# ========================================
# Startup
# ========================================

def _cleanup_old_guides():
    """Delete guide directories older than _GUIDE_MAX_AGE_DAYS."""
    if not os.path.isdir(_GUIDE_OUTPUT_DIR):
        return

    cutoff = datetime.now(timezone.utc) - timedelta(days=_GUIDE_MAX_AGE_DAYS)
    removed = 0

    for entry in os.listdir(_GUIDE_OUTPUT_DIR):
        path = os.path.join(_GUIDE_OUTPUT_DIR, entry)
        if not os.path.isdir(path):
            continue
        mtime = datetime.fromtimestamp(os.path.getmtime(path), tz=timezone.utc)
        if mtime < cutoff:
            try:
                shutil.rmtree(path)
                guide_store.pop_sync(entry, None)
                removed += 1
            except Exception as e:
                logger.warning(f"[CLEANUP] Failed to remove {path}: {e}")

    if removed > 0:
        logger.info(f"[CLEANUP] Removed {removed} guides older than {_GUIDE_MAX_AGE_DAYS} days")


@app.on_event("startup")
async def startup_tasks():
    _cleanup_old_guides()
    try:
        from setup_guide_agent.kb_search import kb_index
        asyncio.create_task(kb_index.build())
        logger.info("[STARTUP] KB embedding index building in background...")
    except Exception as e:
        logger.warning(f"[STARTUP] KB index pre-build failed (will retry on first search): {e}")


# ========================================
# Health check
# ========================================

@app.get("/health")
async def health_check():
    """Health check for monitoring and load balancers."""
    from setup_guide_agent.agent import MODEL as _guide_model

    return {
        "status": "ok",
        "service": "easyclaw",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "guides_in_memory": len(guide_store),
        "models": {
            "guide_generation": _guide_model,
            "formatter_primary": "gemini-2.5-flash",
            "formatter_fallback": "claude-haiku-4-5-20251001",
            "evaluator": "claude-haiku-4-5-20251001",
            "embeddings": "gemini-embedding-001",
        },
    }


# ========================================
# Static File Serving (Frontend Build)
# ========================================

FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "../frontend/dist")
PORT = int(os.environ.get("PORT", "8000"))

if os.path.isdir(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="static")
    logger.info(f"Serving static files from: {FRONTEND_DIST}")
else:
    logger.info(f"Frontend build not found at {FRONTEND_DIST}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
