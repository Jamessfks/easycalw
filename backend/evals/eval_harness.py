"""EasyClaw Eval Harness — Three-grader evaluation pipeline.

Loads a test transcript, runs it through the formatter and guide agent,
then applies three graders:

1. Code-based (deterministic): section count, word count, slug verification, etc.
2. LLM judge (guide_evaluator.py): 5-criteria quality scoring via Gemini Flash
3. Transcript-based: turn count, cost, process metrics

Output: JSON report with all scores per transcript.
"""

import re
import os
import json
import asyncio
import logging
from pathlib import Path
from dataclasses import dataclass, field, asdict
from typing import Optional

logger = logging.getLogger(__name__)

# Paths
_BACKEND_DIR = Path(__file__).parent.parent
_SKILL_REGISTRY = _BACKEND_DIR / "setup_guide_agent" / "context" / "skill_registry.md"


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class CodeGraderResult:
    section_count: int
    section_count_pass: bool
    word_count: int
    word_count_pass: bool
    has_prompts_to_send: bool
    skill_slugs_valid: bool
    invalid_slugs: list[str] = field(default_factory=list)
    no_todos: bool = True
    passed: bool = False

    def __post_init__(self):
        self.passed = (
            self.section_count_pass
            and self.word_count_pass
            and self.has_prompts_to_send
            and self.skill_slugs_valid
            and self.no_todos
        )


@dataclass
class LLMGraderResult:
    scores: dict[str, int] = field(default_factory=dict)
    rationales: dict[str, str] = field(default_factory=dict)
    mean_score: float = 0.0
    passed: bool = False
    overall_notes: str = ""
    error: Optional[str] = None


@dataclass
class TranscriptGraderResult:
    turn_count: int = 0
    turn_count_pass: bool = True
    cost_usd: float = 0.0
    cost_pass: bool = True
    read_knowledge_index: Optional[bool] = None
    passed: bool = True

    def __post_init__(self):
        self.turn_count_pass = self.turn_count <= 45
        self.cost_pass = self.cost_usd <= 3.00
        self.passed = self.turn_count_pass and self.cost_pass


@dataclass
class EvalReport:
    transcript_name: str
    code_grader: CodeGraderResult
    llm_grader: LLMGraderResult
    transcript_grader: TranscriptGraderResult
    overall_passed: bool = False

    def __post_init__(self):
        self.overall_passed = (
            self.code_grader.passed
            and self.llm_grader.passed
            and self.transcript_grader.passed
        )

    def to_dict(self) -> dict:
        return {
            "transcript_name": self.transcript_name,
            "overall_passed": self.overall_passed,
            "code_grader": asdict(self.code_grader),
            "llm_grader": asdict(self.llm_grader),
            "transcript_grader": asdict(self.transcript_grader),
        }


# ---------------------------------------------------------------------------
# Grader 1: Code-based (deterministic)
# ---------------------------------------------------------------------------

def _load_valid_slugs() -> set[str]:
    """Parse skill_registry.md to extract all valid clawhub install slugs."""
    if not _SKILL_REGISTRY.exists():
        logger.warning("skill_registry.md not found — slug validation will be skipped")
        return set()

    text = _SKILL_REGISTRY.read_text()
    # Slugs appear as [slug-name](url) in table rows or as `clawhub install slug-name`
    # Pattern 1: table rows like | 1 | [slug-name](url) |
    table_slugs = set(re.findall(r'\|\s*\d+\s*\|\s*\[([a-z0-9_-]+)\]', text))
    # Pattern 2: inline code references like `clawhub install slug-name`
    install_slugs = set(re.findall(r'clawhub install ([a-z0-9_-]+)', text))
    return table_slugs | install_slugs


def grade_code(guide_text: str, prompts_text: Optional[str]) -> CodeGraderResult:
    """Deterministic grading of guide output."""
    # Section count: look for ## 00 through ## 10 headers
    section_headers = re.findall(r'^## \d{2}\s*\|', guide_text, re.MULTILINE)
    section_count = len(section_headers)

    # Word count
    word_count = len(guide_text.split())

    # Prompts to send
    has_prompts = prompts_text is not None and len(prompts_text.strip()) > 100

    # Skill slug verification
    guide_slugs = set(re.findall(r'clawhub install ([a-z0-9_-]+)', guide_text))
    valid_slugs = _load_valid_slugs()
    if valid_slugs:
        invalid = guide_slugs - valid_slugs
    else:
        invalid = set()  # Can't validate without registry

    # No TODO/PLACEHOLDER
    todo_matches = re.findall(r'\bTODO\b|\bPLACEHOLDER\b', guide_text, re.IGNORECASE)
    no_todos = len(todo_matches) == 0

    return CodeGraderResult(
        section_count=section_count,
        section_count_pass=section_count >= 6,
        word_count=word_count,
        word_count_pass=word_count >= 3000,
        has_prompts_to_send=has_prompts,
        skill_slugs_valid=len(invalid) == 0,
        invalid_slugs=sorted(invalid),
        no_todos=no_todos,
    )


# ---------------------------------------------------------------------------
# Grader 2: LLM judge (reuses guide_evaluator.py)
# ---------------------------------------------------------------------------

async def grade_llm(guide_text: str, transcript_text: str) -> LLMGraderResult:
    """Run the existing Gemini-based LLM judge."""
    try:
        # Import from the existing evaluator
        import sys
        sys.path.insert(0, str(_BACKEND_DIR))
        from guide_evaluator import evaluate_guide

        result = await evaluate_guide(guide_text, transcript_text)
        return LLMGraderResult(
            scores=result.scores,
            rationales=result.rationales,
            mean_score=result.mean_score,
            passed=result.passed,
            overall_notes=result.overall_notes,
        )
    except Exception as e:
        logger.error(f"LLM grader failed: {e}")
        return LLMGraderResult(error=str(e), passed=False)


# ---------------------------------------------------------------------------
# Grader 3: Transcript-based (process metrics)
# ---------------------------------------------------------------------------

def grade_transcript(
    turn_count: int = 0,
    cost_usd: float = 0.0,
    read_knowledge_index: Optional[bool] = None,
) -> TranscriptGraderResult:
    """Grade based on agent process metrics."""
    result = TranscriptGraderResult(
        turn_count=turn_count,
        cost_usd=cost_usd,
        read_knowledge_index=read_knowledge_index,
    )
    result.turn_count_pass = turn_count <= 45
    result.cost_pass = cost_usd <= 3.00
    result.passed = result.turn_count_pass and result.cost_pass
    return result


# ---------------------------------------------------------------------------
# Full evaluation pipeline
# ---------------------------------------------------------------------------

async def run_eval(
    transcript_path: Path,
    skip_generation: bool = False,
    guide_output_dir: Optional[Path] = None,
) -> EvalReport:
    """Run the full eval pipeline for a single transcript.

    Args:
        transcript_path: Path to the test transcript .md file.
        skip_generation: If True, expects guide_output_dir to already contain
                         generated files (useful for re-grading existing output).
        guide_output_dir: Directory containing (or to contain) the guide output.
                          If None, a temp directory is created.

    Returns:
        EvalReport with all three graders' results.
    """
    transcript_name = transcript_path.stem
    transcript_text = transcript_path.read_text()

    # Default output dir
    if guide_output_dir is None:
        guide_output_dir = _BACKEND_DIR / "evals" / "results" / "outputs" / transcript_name

    guide_text = ""
    prompts_text = None
    turn_count = 0
    cost_usd = 0.0
    read_ki = None

    if skip_generation:
        # Load pre-existing output
        guide_file = guide_output_dir / "OPENCLAW_ENGINE_SETUP_GUIDE.md"
        prompts_file = guide_output_dir / "prompts_to_send.md"
        if guide_file.exists():
            guide_text = guide_file.read_text()
        if prompts_file.exists():
            prompts_text = prompts_file.read_text()
    else:
        # Step 1: Format the transcript (already formatted for test transcripts)
        formatted_transcript = transcript_text

        # Step 2: Run the guide agent
        guide_output_dir.mkdir(parents=True, exist_ok=True)

        # Write transcript to the output dir for the agent
        (guide_output_dir / "INTERVIEW_TRANSCRIPT.md").write_text(formatted_transcript)

        try:
            import sys
            sys.path.insert(0, str(_BACKEND_DIR))
            from setup_guide_agent.agent import generate_guide

            result = await generate_guide(
                transcript=formatted_transcript,
                output_dir=str(guide_output_dir),
            )

            # Extract outputs
            guide_file = guide_output_dir / "OPENCLAW_ENGINE_SETUP_GUIDE.md"
            prompts_file = guide_output_dir / "prompts_to_send.md"

            if guide_file.exists():
                guide_text = guide_file.read_text()
            if prompts_file.exists():
                prompts_text = prompts_file.read_text()

            # Extract metrics from result if available
            if isinstance(result, dict):
                turn_count = result.get("turn_count", 0)
                cost_usd = result.get("cost_usd", 0.0)
                read_ki = result.get("read_knowledge_index", None)

        except Exception as e:
            logger.error(f"Guide generation failed for {transcript_name}: {e}")
            # Continue with empty output — graders will score accordingly

    # Run all three graders
    code_result = grade_code(guide_text, prompts_text)

    llm_result = await grade_llm(guide_text, transcript_text) if guide_text else LLMGraderResult(
        error="No guide text to evaluate", passed=False
    )

    transcript_result = grade_transcript(
        turn_count=turn_count,
        cost_usd=cost_usd,
        read_knowledge_index=read_ki,
    )

    report = EvalReport(
        transcript_name=transcript_name,
        code_grader=code_result,
        llm_grader=llm_result,
        transcript_grader=transcript_result,
    )

    logger.info(
        f"[EVAL] {transcript_name}: overall={'PASS' if report.overall_passed else 'FAIL'} "
        f"code={'PASS' if code_result.passed else 'FAIL'} "
        f"llm={'PASS' if llm_result.passed else 'FAIL'} "
        f"transcript={'PASS' if transcript_result.passed else 'FAIL'}"
    )

    return report
