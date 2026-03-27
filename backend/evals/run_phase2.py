#!/usr/bin/env python3
"""Phase 2 Eval — API-driven end-to-end pipeline.

For each test transcript:
1. POST /format
2. POST /generate-guide
3. Poll GET /guide/{id} until complete (max 10 min)
4. Run code grader on the result
5. Save all results to phase2-baseline.json
"""

import asyncio
import json
import logging
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import httpx

# Ensure backend is importable
_EVALS_DIR = Path(__file__).parent
_BACKEND_DIR = _EVALS_DIR.parent
sys.path.insert(0, str(_BACKEND_DIR))

from evals.eval_harness import grade_code, CodeGraderResult

_TRANSCRIPTS_DIR = _EVALS_DIR / "test_transcripts"
_RESULTS_DIR = _EVALS_DIR / "results"
_BASE_URL = "http://localhost:8004"
_POLL_INTERVAL = 10  # seconds
_MAX_POLL_TIME = 600  # 10 minutes

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


async def run_one(client: httpx.AsyncClient, transcript_path: Path) -> dict:
    """Run the full pipeline for a single transcript."""
    name = transcript_path.stem
    raw_transcript = transcript_path.read_text()
    result = {
        "persona": name,
        "status": "error",
        "error": None,
        "guide_chars": 0,
        "code_score": 0.0,
        "generation_time_s": 0.0,
        "code_grader": None,
    }

    try:
        # Step 1: Format
        logger.info(f"[{name}] Formatting transcript...")
        fmt_resp = await client.post(
            f"{_BASE_URL}/format",
            json={"transcript": raw_transcript},
            timeout=120.0,
        )
        fmt_resp.raise_for_status()
        formatted = fmt_resp.json()["formatted"]
        logger.info(f"[{name}] Formatted: {len(formatted)} chars")

        # Step 2: Generate guide
        logger.info(f"[{name}] Generating guide...")
        t0 = time.monotonic()
        gen_resp = await client.post(
            f"{_BASE_URL}/generate-guide",
            json={"formatted_transcript": formatted},
            timeout=30.0,
        )
        gen_resp.raise_for_status()
        guide_id = gen_resp.json()["guide_id"]
        logger.info(f"[{name}] Guide ID: {guide_id}")

        # Step 3: Poll until complete
        elapsed = 0.0
        guide_data = None
        while elapsed < _MAX_POLL_TIME:
            await asyncio.sleep(_POLL_INTERVAL)
            elapsed = time.monotonic() - t0
            poll_resp = await client.get(
                f"{_BASE_URL}/guide/{guide_id}",
                timeout=30.0,
            )
            poll_resp.raise_for_status()
            data = poll_resp.json()
            status = data.get("status")
            logger.info(f"[{name}] Poll {elapsed:.0f}s: status={status}")

            if status == "complete":
                guide_data = data
                break
            elif status == "error":
                result["error"] = data.get("message", "Unknown error")
                result["generation_time_s"] = round(elapsed, 1)
                return result

        gen_time = time.monotonic() - t0

        if guide_data is None:
            result["error"] = f"Timed out after {_MAX_POLL_TIME}s"
            result["generation_time_s"] = round(gen_time, 1)
            return result

        # Extract outputs
        outputs = guide_data.get("outputs", {})
        guide_text = outputs.get("setup_guide", "")
        prompts_text = outputs.get("prompts_to_send", "")

        # Step 4: Code grader
        code_result = grade_code(guide_text, prompts_text, raw_transcript)

        # Compute a numeric score (% of checks passed)
        checks = [
            code_result.section_count_pass,
            code_result.word_count_pass,
            code_result.has_prompts_to_send,
            code_result.skill_slugs_valid,
            code_result.no_todos,
            code_result.callout_count_pass,
            code_result.has_personalization,
            code_result.has_cli_verification,
            code_result.has_prepared_for_header,
        ]
        score = round(sum(checks) / len(checks) * 100, 1)

        result.update({
            "status": "complete",
            "guide_chars": len(guide_text),
            "code_score": score,
            "generation_time_s": round(gen_time, 1),
            "code_grader": {
                "section_count": code_result.section_count,
                "word_count": code_result.word_count,
                "callout_count": code_result.callout_count,
                "has_personalization": code_result.has_personalization,
                "has_cli_verification": code_result.has_cli_verification,
                "has_prepared_for_header": code_result.has_prepared_for_header,
                "passed": code_result.passed,
                "checks_passed": sum(checks),
                "checks_total": len(checks),
            },
        })

    except Exception as e:
        result["error"] = str(e)
        logger.error(f"[{name}] Failed: {e}")

    return result


async def main():
    transcripts = sorted(_TRANSCRIPTS_DIR.glob("*.md"))
    if not transcripts:
        logger.error("No transcripts found")
        sys.exit(1)

    logger.info(f"Phase 2 eval: {len(transcripts)} transcripts against {_BASE_URL}")

    results = []
    async with httpx.AsyncClient() as client:
        for tp in transcripts:
            r = await run_one(client, tp)
            results.append(r)

    # Save results
    _RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    output = {
        "phase": 2,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "judge_model": "claude-haiku-4-5-20251001",
        "guide_model": "claude-sonnet-4-6",
        "transcript_count": len(results),
        "completed_count": sum(1 for r in results if r["status"] == "complete"),
        "results": results,
    }
    out_path = _RESULTS_DIR / "phase2-baseline.json"
    out_path.write_text(json.dumps(output, indent=2))
    logger.info(f"Results saved to {out_path}")

    # Print summary table
    print("\n" + "=" * 85)
    print("PHASE 2 EVAL — BASELINE RESULTS")
    print("=" * 85)
    print(f"{'Persona':<16} {'Status':>10} {'Guide Chars':>12} {'Code Score':>11} {'Gen Time':>10}")
    print("-" * 85)
    for r in results:
        status = r["status"]
        chars = f"{r['guide_chars']:,}" if r["guide_chars"] else "—"
        score = f"{r['code_score']:.1f}/100" if status == "complete" else "—"
        gen_t = f"{r['generation_time_s']:.0f}s"
        print(f"{r['persona']:<16} {status:>10} {chars:>12} {score:>11} {gen_t:>10}")

    print("-" * 85)
    completed = sum(1 for r in results if r["status"] == "complete")
    print(f"{'TOTAL':.<16} {completed}/{len(results)} completed")
    print("=" * 85 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
