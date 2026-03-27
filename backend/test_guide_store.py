"""Unit tests for GuideStore — in-memory mode (no Supabase needed)."""
import asyncio, pytest
from supabase_store import GuideStore

@pytest.mark.asyncio
async def test_set_and_get():
    store = GuideStore()  # no SUPABASE_URL = in-memory
    await store.set("guide-1", {"status": "complete", "guide_id": "guide-1"})
    result = store.get_sync("guide-1")
    assert result["status"] == "complete"

@pytest.mark.asyncio
async def test_get_missing_returns_none():
    store = GuideStore()
    assert store.get_sync("nonexistent") is None

@pytest.mark.asyncio
async def test_pop_removes_entry():
    store = GuideStore()
    await store.set("guide-2", {"status": "done"})
    store.pop_sync("guide-2", None)
    assert store.get_sync("guide-2") is None

if __name__ == "__main__":
    asyncio.run(test_set_and_get())
    asyncio.run(test_get_missing_returns_none())
    asyncio.run(test_pop_removes_entry())
    print("All tests passed")
