"""Supabase-backed guide store — drop-in replacement for in-memory dict.

Usage:
    from supabase_store import GuideStore
    store = GuideStore()  # falls back to in-memory if SUPABASE_URL not set
    await store.set(guide_id, data)
    data = await store.get(guide_id)
    all_guides = await store.list_recent(limit=20)
"""

import json
import logging
import os
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

# Fields that map directly to columns (not stored in a catch-all JSONB).
_COLUMN_FIELDS = {
    "guide_id", "status", "message", "formatted_transcript",
    "agent_session_id", "agent_cost_usd", "agent_turns",
    "agent_duration_ms", "setup_guide", "reference_documents",
    "prompts_to_send", "scorecard",
}


def _to_row(guide_id: str, data: dict) -> dict:
    """Convert an app-level dict to a Supabase row dict."""
    row: dict = {"guide_id": guide_id}
    for key, value in data.items():
        if key in _COLUMN_FIELDS:
            row[key] = value
    row.setdefault("status", "generating")
    return row


def _from_row(row: dict) -> dict:
    """Convert a Supabase row back to an app-level dict."""
    out = {}
    for key, value in row.items():
        if key == "id":
            continue
        out[key] = value
    return out


class GuideStore:
    """Async guide store with Supabase backend and in-memory fallback."""

    def __init__(self):
        self._supabase_url = os.environ.get("SUPABASE_URL")
        self._supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        self._use_supabase = bool(self._supabase_url and self._supabase_key)
        self._client = None  # lazy-init
        self._memory: dict[str, dict] = {}

        if self._use_supabase:
            logger.info("[GuideStore] Supabase mode (URL detected)")
        else:
            logger.info("[GuideStore] In-memory fallback (no SUPABASE_URL)")

    async def _get_client(self):
        if self._client is None:
            from supabase._async.client import create_client
            self._client = await create_client(
                self._supabase_url,
                self._supabase_key,
            )
        return self._client

    # -- Core API ----------------------------------------------------------

    async def get(self, guide_id: str) -> dict | None:
        """Fetch a single guide by ID. Returns None if not found."""
        if not self._use_supabase:
            return self._memory.get(guide_id)

        try:
            sb = await self._get_client()
            result = (
                await sb.table("guides")
                .select("*")
                .eq("guide_id", guide_id)
                .maybe_single()
                .execute()
            )
            if result.data:
                return _from_row(result.data)
            return None
        except Exception as e:
            logger.error(f"[GuideStore] get({guide_id}) failed: {e}")
            return self._memory.get(guide_id)

    async def set(self, guide_id: str, data: dict) -> None:
        """Upsert a guide. Merges *data* into existing record."""
        self._memory[guide_id] = {
            **self._memory.get(guide_id, {}),
            **data,
            "guide_id": guide_id,
        }

        if not self._use_supabase:
            return

        try:
            sb = await self._get_client()
            row = _to_row(guide_id, self._memory[guide_id])
            await (
                sb.table("guides")
                .upsert(row, on_conflict="guide_id")
                .execute()
            )
        except Exception as e:
            logger.error(f"[GuideStore] set({guide_id}) failed: {e}")

    async def pop(self, guide_id: str) -> dict | None:
        """Remove and return a guide. Returns None if not found."""
        removed = self._memory.pop(guide_id, None)

        if not self._use_supabase:
            return removed

        try:
            sb = await self._get_client()
            result = (
                await sb.table("guides")
                .delete()
                .eq("guide_id", guide_id)
                .execute()
            )
            if result.data and not removed:
                removed = _from_row(result.data[0])
        except Exception as e:
            logger.error(f"[GuideStore] pop({guide_id}) failed: {e}")

        return removed

    async def list_recent(self, limit: int = 20) -> list[dict]:
        """Return recent guides sorted by created_at descending."""
        if not self._use_supabase:
            items = sorted(
                self._memory.values(),
                key=lambda d: d.get("created_at", ""),
                reverse=True,
            )
            return items[:limit]

        try:
            sb = await self._get_client()
            result = (
                await sb.table("guides")
                .select("*")
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            return [_from_row(r) for r in result.data]
        except Exception as e:
            logger.error(f"[GuideStore] list_recent failed: {e}")
            items = sorted(
                self._memory.values(),
                key=lambda d: d.get("created_at", ""),
                reverse=True,
            )
            return items[:limit]

    async def count_guides(self) -> int:
        """Return total number of guides."""
        if not self._use_supabase:
            return len(self._memory)

        try:
            sb = await self._get_client()
            result = (
                await sb.table("guides")
                .select("guide_id", count="exact")
                .execute()
            )
            return result.count if result.count is not None else len(result.data)
        except Exception as e:
            logger.error(f"[GuideStore] count_guides failed: {e}")
            return len(self._memory)

    async def list_guides(self, limit: int = 20, offset: int = 0) -> list[dict]:
        """Return guide metadata (no content) for dashboard/history listing."""
        if not self._use_supabase:
            items = sorted(
                self._memory.values(),
                key=lambda d: d.get("created_at", ""),
                reverse=True,
            )
            return [
                {
                    "guide_id": d.get("guide_id"),
                    "status": d.get("status"),
                    "created_at": d.get("created_at"),
                    "business_name": d.get("business_name"),
                }
                for d in items[offset : offset + limit]
            ]

        try:
            sb = await self._get_client()
            result = (
                await sb.table("guides")
                .select("guide_id, status, created_at, metadata")
                .order("created_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
            return [
                {
                    "guide_id": r.get("guide_id"),
                    "status": r.get("status"),
                    "created_at": r.get("created_at"),
                    "business_name": (r.get("metadata") or {}).get("business_name"),
                }
                for r in result.data
            ]
        except Exception as e:
            logger.error(f"[GuideStore] list_guides failed: {e}")
            return []

    async def items(self) -> list[tuple[str, dict]]:
        """Return all (guide_id, data) pairs — for migration/compat."""
        if not self._use_supabase:
            return list(self._memory.items())

        try:
            sb = await self._get_client()
            result = (
                await sb.table("guides")
                .select("*")
                .execute()
            )
            return [(r["guide_id"], _from_row(r)) for r in result.data]
        except Exception as e:
            logger.error(f"[GuideStore] items() failed: {e}")
            return list(self._memory.items())

    # -- Sync dict-like interface (operates on _memory cache) ---------------

    def __contains__(self, guide_id: str) -> bool:
        """Sync check against in-memory cache (fast path for SSE loops)."""
        return guide_id in self._memory

    def __getitem__(self, guide_id: str) -> dict:
        return self._memory[guide_id]

    def __setitem__(self, guide_id: str, data: dict) -> None:
        self._memory[guide_id] = data

    def __len__(self) -> int:
        return len(self._memory)

    def get_sync(self, guide_id: str, default=None) -> dict | None:
        return self._memory.get(guide_id, default)

    def pop_sync(self, guide_id: str, default=None) -> dict | None:
        return self._memory.pop(guide_id, default)
