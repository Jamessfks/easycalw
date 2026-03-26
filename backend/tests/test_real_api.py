"""
Real-API E2E smoke test for EasyClaw guide generation.

Requires ANTHROPIC_API_KEY in the environment.
Skipped automatically in CI when the key is absent.
"""

import os
import time
import shutil
import pytest
import requests

BASE_URL = os.environ.get("EASYCLAW_API_URL", "http://localhost:8000")

# Short transcript — 20 words max
SHORT_TRANSCRIPT = (
    "Name: Jordan. Business: coffee shop. Pain point: scheduling is chaos. "
    "Tech level: basic. Prefers WhatsApp."
)


@pytest.fixture()
def test_guide_output_dir(tmp_path):
    """Provide a temp directory for guide output; clean up after test."""
    guide_dir = tmp_path / "test_guide_output"
    guide_dir.mkdir()
    yield guide_dir
    if guide_dir.exists():
        shutil.rmtree(guide_dir)


@pytest.mark.skipif(
    not os.environ.get("ANTHROPIC_API_KEY"),
    reason="No real API key — set ANTHROPIC_API_KEY to run this test",
)
def test_generate_guide_real_api(test_guide_output_dir):
    """
    POST /generate-guide with a real transcript, poll until complete,
    and verify the guide has meaningful content (>500 chars).
    """
    # 1. Submit guide generation request
    resp = requests.post(
        f"{BASE_URL}/generate-guide",
        json={"formatted_transcript": SHORT_TRANSCRIPT},
        timeout=15,
    )
    assert resp.status_code == 200, f"POST /generate-guide failed: {resp.text}"

    data = resp.json()
    guide_id = data.get("guide_id")
    assert guide_id, "Response missing guide_id"
    assert data.get("status") == "generating"

    # 2. Poll for completion (max 120 seconds — Claude can take time)
    deadline = time.time() + 120
    guide_data = None

    while time.time() < deadline:
        poll = requests.get(f"{BASE_URL}/guide/{guide_id}", timeout=10)
        assert poll.status_code == 200, f"GET /guide/{guide_id} failed: {poll.text}"

        guide_data = poll.json()
        status = guide_data.get("status")

        if status == "complete":
            break
        if status == "error":
            pytest.fail(f"Guide generation errored: {guide_data}")

        time.sleep(5)
    else:
        pytest.fail(f"Guide did not complete within 120s. Last status: {guide_data}")

    # 3. Verify guide content quality
    outputs = guide_data.get("outputs", {})
    guide_text = outputs.get("guide", "")

    assert len(guide_text) > 500, (
        f"Guide text too short ({len(guide_text)} chars). "
        "Expected >500 chars of meaningful content."
    )

    # 4. Verify scorecard exists if present
    scorecard = guide_data.get("scorecard")
    if scorecard:
        total = scorecard.get("total_score") or scorecard.get("total", 0)
        print(f"\n✓ Guide quality score: {total}/10")
        # Log but don't hard-fail on score — the short transcript is minimal
