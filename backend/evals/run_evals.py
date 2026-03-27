#!/usr/bin/env python3
"""EasyClaw Eval Runner — run all test transcripts through the eval harness.

Usage:
    python3 run_evals.py                  # Run evals, print results
    python3 run_evals.py --baseline       # Run evals and save as baseline
    python3 run_evals.py --compare        # Run evals and compare to baseline
    python3 run_evals.py --skip-generation # Re-grade existing outputs only
    python3 run_evals.py --grade-dir DIR  # Grade pre-existing guide outputs
"""

import argparse
import asyncio
import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

# Ensure backend is importable
_EVALS_DIR = Path(__file__).parent
_BACKEND_DIR = _EVALS_DIR.parent
sys.path.insert(0, str(_BACKEND_DIR))

from evals.eval_harness import run_eval, EvalReport

# Directories
_TRANSCRIPTS_DIR = _EVALS_DIR / "test_transcripts"
_RESULTS_DIR = _EVALS_DIR / "results"
_BASELINE_PATH = _RESULTS_DIR / "baseline.json"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


def _get_transcripts() -> list[Path]:
    """Return sorted list of test transcript paths."""
    transcripts = sorted(_TRANSCRIPTS_DIR.glob("*.md"))
    if not transcripts:
        logger.error(f"No transcripts found in {_TRANSCRIPTS_DIR}")
        sys.exit(1)
    return transcripts


def _print_summary_table(reports: list[EvalReport]) -> None:
    """Print a formatted summary table to stdout."""
    print("\n" + "=" * 90)
    print("EASYCLAW EVAL SUITE — RESULTS")
    print("=" * 90)

    # Header
    print(
        f"{'Transcript':<16} {'Overall':>8} {'Code':>6} {'LLM':>6} "
        f"{'Process':>8} {'Sections':>9} {'Words':>7} {'LLM Avg':>8}"
    )
    print("-" * 90)

    for r in reports:
        cg = r.code_grader
        lg = r.llm_grader
        tg = r.transcript_grader

        overall = "PASS" if r.overall_passed else "FAIL"
        code = "PASS" if cg.passed else "FAIL"
        llm = "PASS" if lg.passed else "FAIL"
        process = "PASS" if tg.passed else "FAIL"
        llm_avg = f"{lg.mean_score:.1f}" if lg.mean_score else "N/A"

        print(
            f"{r.transcript_name:<16} {overall:>8} {code:>6} {llm:>6} "
            f"{process:>8} {cg.section_count:>9} {cg.word_count:>7} {llm_avg:>8}"
        )

    print("-" * 90)

    passed = sum(1 for r in reports if r.overall_passed)
    total = len(reports)
    print(f"{'TOTAL':.<16} {passed}/{total} passed")
    print("=" * 90 + "\n")


def _print_detail(reports: list[EvalReport]) -> None:
    """Print detailed per-transcript breakdown."""
    for r in reports:
        cg = r.code_grader
        lg = r.llm_grader
        tg = r.transcript_grader

        print(f"\n--- {r.transcript_name} ---")
        print(f"  Code grader:")
        print(f"    Sections: {cg.section_count} (>= 6: {'OK' if cg.section_count_pass else 'FAIL'})")
        print(f"    Words: {cg.word_count} (>= 3000: {'OK' if cg.word_count_pass else 'FAIL'})")
        print(f"    Prompts: {'Yes' if cg.has_prompts_to_send else 'No'}")
        print(f"    Slugs valid: {'Yes' if cg.skill_slugs_valid else 'No — invalid: ' + ', '.join(cg.invalid_slugs)}")
        print(f"    No TODOs: {'Yes' if cg.no_todos else 'No'}")

        print(f"  LLM grader:")
        if lg.error:
            print(f"    Error: {lg.error}")
        else:
            for criterion, score in lg.scores.items():
                print(f"    {criterion}: {score}/5")
            print(f"    Mean: {lg.mean_score:.2f} (>= 3.5: {'OK' if lg.passed else 'FAIL'})")

        print(f"  Transcript grader:")
        print(f"    Turns: {tg.turn_count} (<= 45: {'OK' if tg.turn_count_pass else 'FAIL'})")
        print(f"    Cost: ${tg.cost_usd:.2f} (<= $3.00: {'OK' if tg.cost_pass else 'FAIL'})")
        if tg.read_knowledge_index is not None:
            print(f"    Read KNOWLEDGE_INDEX: {'Yes' if tg.read_knowledge_index else 'No'}")


def _save_results(reports: list[EvalReport], path: Path) -> None:
    """Save eval results to JSON."""
    path.parent.mkdir(parents=True, exist_ok=True)
    data = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "transcript_count": len(reports),
        "passed_count": sum(1 for r in reports if r.overall_passed),
        "results": [r.to_dict() for r in reports],
    }
    path.write_text(json.dumps(data, indent=2))
    logger.info(f"Results saved to {path}")


def _compare_to_baseline(reports: list[EvalReport]) -> None:
    """Compare current results to saved baseline."""
    if not _BASELINE_PATH.exists():
        print("\nNo baseline found. Run with --baseline first.\n")
        return

    baseline = json.loads(_BASELINE_PATH.read_text())
    baseline_results = {r["transcript_name"]: r for r in baseline["results"]}

    print("\n" + "=" * 90)
    print("COMPARISON TO BASELINE")
    print(f"Baseline: {baseline['timestamp']}")
    print("=" * 90)

    print(
        f"{'Transcript':<16} {'Baseline':>10} {'Current':>10} "
        f"{'BL Words':>10} {'Cur Words':>10} {'BL LLM':>8} {'Cur LLM':>8}"
    )
    print("-" * 90)

    for r in reports:
        bl = baseline_results.get(r.transcript_name)
        if not bl:
            print(f"{r.transcript_name:<16} {'N/A':>10} {'PASS' if r.overall_passed else 'FAIL':>10}")
            continue

        bl_pass = "PASS" if bl["overall_passed"] else "FAIL"
        cur_pass = "PASS" if r.overall_passed else "FAIL"
        bl_words = bl["code_grader"]["word_count"]
        cur_words = r.code_grader.word_count
        bl_llm = f"{bl['llm_grader']['mean_score']:.1f}" if bl["llm_grader"]["mean_score"] else "N/A"
        cur_llm = f"{r.llm_grader.mean_score:.1f}" if r.llm_grader.mean_score else "N/A"

        print(
            f"{r.transcript_name:<16} {bl_pass:>10} {cur_pass:>10} "
            f"{bl_words:>10} {cur_words:>10} {bl_llm:>8} {cur_llm:>8}"
        )

    bl_passed = baseline["passed_count"]
    cur_passed = sum(1 for r in reports if r.overall_passed)
    total = len(reports)

    print("-" * 90)
    delta = cur_passed - bl_passed
    arrow = "+" if delta > 0 else ""
    print(f"{'TOTAL':.<16} {bl_passed}/{total} passed → {cur_passed}/{total} passed ({arrow}{delta})")
    print("=" * 90 + "\n")


async def main() -> None:
    parser = argparse.ArgumentParser(description="EasyClaw Eval Runner")
    parser.add_argument("--baseline", action="store_true", help="Save results as baseline")
    parser.add_argument("--compare", action="store_true", help="Compare results to baseline")
    parser.add_argument("--skip-generation", action="store_true", help="Re-grade existing outputs")
    parser.add_argument("--grade-dir", type=str, help="Grade pre-existing guide output directory")
    parser.add_argument("--verbose", "-v", action="store_true", help="Print detailed results")
    args = parser.parse_args()

    transcripts = _get_transcripts()
    logger.info(f"Running evals on {len(transcripts)} transcripts...")

    reports: list[EvalReport] = []
    for tp in transcripts:
        logger.info(f"Evaluating: {tp.name}")

        guide_dir = None
        if args.grade_dir:
            guide_dir = Path(args.grade_dir) / tp.stem

        report = await run_eval(
            transcript_path=tp,
            skip_generation=args.skip_generation or bool(args.grade_dir),
            guide_output_dir=guide_dir,
        )
        reports.append(report)

    # Print results
    _print_summary_table(reports)
    if args.verbose:
        _print_detail(reports)

    # Save dated results
    date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    _save_results(reports, _RESULTS_DIR / f"{date_str}.json")

    # Baseline mode
    if args.baseline:
        _save_results(reports, _BASELINE_PATH)
        print(f"Baseline saved to {_BASELINE_PATH}\n")

    # Compare mode
    if args.compare:
        _compare_to_baseline(reports)


if __name__ == "__main__":
    asyncio.run(main())
