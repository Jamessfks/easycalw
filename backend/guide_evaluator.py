"""LLM-as-Judge Guide Evaluator — Gemini 2.5 Flash.

Scores generated setup guides on 5 criteria (1-5 each) using a structured
rubric. Cost: ~$0.003 per evaluation. Used as a quality gate before
shipping guides to users.
"""

import asyncio
import json
import os
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)

EVAL_PROMPT = """\
Score this setup guide on 5 criteria (1-5 each).
Return ONLY JSON: {{"completeness": {{"score": int, "rationale": "..."}}, \
"personalization": {{"score": int, "rationale": "..."}}, \
"technical_accuracy": {{"score": int, "rationale": "..."}}, \
"structure_clarity": {{"score": int, "rationale": "..."}}, \
"actionability": {{"score": int, "rationale": "..."}}, \
"overall_notes": "..."}}

Rubric:
- completeness: All expected sections (pre-flight, security, model, skills, ref docs, prompts)?
- personalization: Tailored to THIS user's interview answers (name, business, hardware, preferences)?
- technical_accuracy: CLI commands, skill names, file paths correct per OpenClaw docs?
- structure_clarity: Logical flow, numbered steps, ACTION callouts, visual hierarchy?
- actionability: Can user follow start-to-finish without external help?

## Interview Transcript
{transcript}

## Generated Guide
{guide}"""


@dataclass
class EvalResult:
    scores: dict[str, int]
    rationales: dict[str, str]
    mean_score: float
    passed: bool
    overall_notes: str


async def evaluate_guide(guide: str, transcript: str, threshold: float = 3.5) -> EvalResult:
    """Evaluate a setup guide using Gemini Flash as an LLM judge.

    Args:
        guide: The generated setup guide markdown.
        transcript: The interview transcript used to generate the guide.
        threshold: Minimum mean score to pass (default 3.5).

    Returns:
        EvalResult with scores, rationales, mean_score, passed flag, and notes.
    """
    import google.generativeai as genai

    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel("gemini-2.5-flash")

    response = await asyncio.to_thread(
        model.generate_content,
        EVAL_PROMPT.format(transcript=transcript, guide=guide),
        generation_config=genai.types.GenerationConfig(
            response_mime_type="application/json",
            max_output_tokens=1024,
            temperature=0.0,
        ),
    )
    raw = json.loads(response.text)
    criteria = [
        "completeness",
        "personalization",
        "technical_accuracy",
        "structure_clarity",
        "actionability",
    ]
    scores = {c: raw[c]["score"] for c in criteria}
    rationales = {c: raw[c]["rationale"] for c in criteria}
    mean = sum(scores.values()) / len(scores)

    result = EvalResult(
        scores=scores,
        rationales=rationales,
        mean_score=round(mean, 2),
        passed=(mean >= threshold and all(s >= 2 for s in scores.values())),
        overall_notes=raw.get("overall_notes", ""),
    )

    logger.info(
        f"[EVAL] Guide quality: mean={result.mean_score}, passed={result.passed}, "
        f"scores={result.scores}"
    )
    return result
