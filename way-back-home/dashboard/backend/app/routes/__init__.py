"""
API Routes

Route handlers organized by resource.
"""

from . import health
from . import events
from . import participants
from . import admin

__all__ = ["health", "events", "participants", "admin"]
