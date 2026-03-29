from __future__ import annotations
"""Setup Guide Creation Agent — Anthropic API direct.

Takes the formatted interview transcript and produces output files
in a per-session directory using Claude's tool_use capability directly.

Output files:
- EASYCLAW_SETUP.md (main deliverable)
- reference_documents/*.md (conditional sub-setup docs)
- prompts_to_send.md (messages to initialize the user's OpenClaw instance)
"""

import os
import re
import uuid
import asyncio
import logging
from pathlib import Path

import anthropic

logger = logging.getLogger(__name__)

# Directories
_AGENT_DIR = Path(__file__).parent
_CONTEXT_DIR = _AGENT_DIR / "context"
_SYSTEM_PROMPT_PATH = _AGENT_DIR / "system_prompt.md"
_OUTPUT_BASE = Path(os.getenv("GUIDE_OUTPUT_DIR", "./guide_output"))

MODEL = os.getenv("GUIDE_MODEL", "claude-sonnet-4-6")
MAX_TURNS = 40
MAX_TOKENS_PER_TURN = 16384

# ── Tool definitions (matching the old SDK's allowed tools) ────────────────

TOOLS = [
    {
        "name": "Read",
        "description": "Read the contents of a file. Returns the full text content.",
        "input_schema": {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "description": "Absolute or relative path to the file to read."
                }
            },
            "required": ["file_path"]
        }
    },
    {
        "name": "Write",
        "description": "Write content to a file. Creates parent directories if needed.",
        "input_schema": {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "description": "Path to write to (relative to working directory)."
                },
                "content": {
                    "type": "string",
                    "description": "The full content to write to the file."
                }
            },
            "required": ["file_path", "content"]
        }
    },
    {
        "name": "Glob",
        "description": "Find files matching a glob pattern. Returns a list of matching file paths.",
        "input_schema": {
            "type": "object",
            "properties": {
                "pattern": {
                    "type": "string",
                    "description": "Glob pattern (e.g. '**/*.md', 'docs/*.txt')."
                },
                "path": {
                    "type": "string",
                    "description": "Directory to search in. Defaults to working directory."
                }
            },
            "required": ["pattern"]
        }
    },
    {
        "name": "Grep",
        "description": "Search file contents for a regex pattern. Returns matching lines with file paths.",
        "input_schema": {
            "type": "object",
            "properties": {
                "pattern": {
                    "type": "string",
                    "description": "Regex pattern to search for."
                },
                "path": {
                    "type": "string",
                    "description": "File or directory to search in."
                }
            },
            "required": ["pattern"]
        }
    },
]

# ── Tool execution ─────────────────────────────────────────────────────────

def _resolve_path(path_str: str, cwd: str, allowed_dirs: list[str]) -> Path | None:
    """Resolve a path and verify it's within allowed directories."""
    p = Path(path_str)
    if not p.is_absolute():
        p = Path(cwd) / p
    p = p.resolve()
    for allowed in allowed_dirs:
        if str(p).startswith(str(Path(allowed).resolve())):
            return p
    return None


def _exec_read(file_path: str, cwd: str, allowed_dirs: list[str]) -> str:
    p = _resolve_path(file_path, cwd, allowed_dirs)
    if p is None:
        return f"Error: path '{file_path}' is outside allowed directories."
    if not p.exists():
        return f"Error: file not found: {file_path}"
    if not p.is_file():
        return f"Error: not a file: {file_path}"
    try:
        text = p.read_text(errors="replace")
        # Truncate very large files to save tokens
        if len(text) > 50000:
            text = text[:50000] + f"\n\n... (truncated, {len(text)} total chars)"
        return text
    except Exception as e:
        return f"Error reading {file_path}: {e}"


def _exec_write(file_path: str, content: str, cwd: str, write_dir: str) -> str:
    p = Path(file_path)
    if not p.is_absolute():
        p = Path(cwd) / p
    p = p.resolve()
    if not str(p).startswith(str(Path(write_dir).resolve())):
        return f"Error: can only write to output directory. Tried: {file_path}"
    try:
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content)
        return f"Written {len(content)} chars to {p.name}"
    except Exception as e:
        return f"Error writing {file_path}: {e}"


def _exec_glob(pattern: str, path: str | None, cwd: str, allowed_dirs: list[str]) -> str:
    search_dir = Path(path) if path else Path(cwd)
    if not search_dir.is_absolute():
        search_dir = Path(cwd) / search_dir
    search_dir = search_dir.resolve()

    allowed = False
    for d in allowed_dirs:
        if str(search_dir).startswith(str(Path(d).resolve())):
            allowed = True
            break
    if not allowed:
        return f"Error: directory '{path}' is outside allowed directories."

    try:
        matches = sorted(str(f.relative_to(search_dir)) for f in search_dir.rglob(pattern) if f.is_file())
        if len(matches) > 200:
            matches = matches[:200]
            matches.append(f"... (truncated, >200 matches)")
        return "\n".join(matches) if matches else "No files matched."
    except Exception as e:
        return f"Error: {e}"


def _exec_grep(pattern: str, path: str | None, cwd: str, allowed_dirs: list[str]) -> str:
    search_path = Path(path) if path else Path(cwd)
    if not search_path.is_absolute():
        search_path = Path(cwd) / search_path
    search_path = search_path.resolve()

    allowed = False
    for d in allowed_dirs:
        if str(search_path).startswith(str(Path(d).resolve())):
            allowed = True
            break
    if not allowed:
        return f"Error: path '{path}' is outside allowed directories."

    try:
        regex = re.compile(pattern, re.IGNORECASE)
    except re.error as e:
        return f"Error: invalid regex: {e}"

    results = []
    files = [search_path] if search_path.is_file() else sorted(search_path.rglob("*"))

    for f in files:
        if not f.is_file() or f.suffix not in (".md", ".txt", ".json", ".yaml", ".yml", ".toml"):
            continue
        try:
            for lineno, line in enumerate(f.read_text(errors="replace").splitlines(), 1):
                if regex.search(line):
                    rel = str(f.relative_to(search_path)) if search_path.is_dir() else f.name
                    results.append(f"{rel}:{lineno}: {line.strip()}")
                    if len(results) >= 100:
                        results.append("... (truncated at 100 matches)")
                        return "\n".join(results)
        except Exception:
            continue

    return "\n".join(results) if results else "No matches found."


def _execute_tool(name: str, input_data: dict, cwd: str, write_dir: str, allowed_dirs: list[str]) -> str:
    if name == "Read":
        return _exec_read(input_data["file_path"], cwd, allowed_dirs)
    elif name == "Write":
        return _exec_write(input_data["file_path"], input_data["content"], cwd, write_dir)
    elif name == "Glob":
        return _exec_glob(input_data["pattern"], input_data.get("path"), cwd, allowed_dirs)
    elif name == "Grep":
        return _exec_grep(input_data["pattern"], input_data.get("path"), cwd, allowed_dirs)
    else:
        return f"Error: unknown tool '{name}'"


# ── Stage classification ───────────────────────────────────────────────────

def _classify_tool_stage(tool_name: str) -> str:
    return {
        "Read": "Reading documents...",
        "Write": "Writing output files...",
        "Glob": "Scanning knowledge base...",
        "Grep": "Searching documentation...",
    }.get(tool_name, "Processing...")


# ── Output detection ───────────────────────────────────────────────────────

def _detect_doc_status(output_dir: Path) -> list[dict]:
    statuses = []
    for name in ("EASYCLAW_SETUP.md", "EASYCLAW_SETUP.txt",
                 "OPENCLAW_ENGINE_SETUP_GUIDE.md", "OPENCLAW_ENGINE_SETUP_GUIDE.txt"):
        p = output_dir / name
        if p.exists():
            statuses.append({"type": "doc_status", "doc": "setup_guide", "status": "complete", "chars": len(p.read_text())})
            break

    for ext in (".md", ".txt"):
        p = output_dir / f"prompts_to_send{ext}"
        if p.exists():
            statuses.append({"type": "doc_status", "doc": "prompts", "status": "complete", "chars": len(p.read_text())})
            break

    ref_dir = output_dir / "reference_documents"
    if ref_dir.is_dir():
        ref_files = list(ref_dir.glob("*.md")) + list(ref_dir.glob("*.txt"))
        if ref_files:
            total = sum(len(f.read_text()) for f in ref_files)
            statuses.append({"type": "doc_status", "doc": "reference_docs", "status": "complete", "chars": total, "count": len(ref_files)})

    return statuses


def _build_selection_instruction(selected_outputs: list[str] | None) -> str:
    if not selected_outputs:
        return ""
    sel = set(selected_outputs)
    if sel >= {"setup_guide", "prompts", "reference_docs"}:
        return ""

    parts, skip = [], []
    if "setup_guide" in sel: parts.append("EASYCLAW_SETUP.md")
    if "prompts" in sel: parts.append("prompts_to_send.md")
    if "reference_docs" in sel: parts.append("reference_documents/*.md")
    if "prompts" not in sel: skip.append("prompts_to_send.md")
    if "reference_docs" not in sel: skip.append("reference_documents/")

    instruction = f"\n\n⚠️ SELECTIVE GENERATION: Generate ONLY {', '.join(parts)}."
    if skip:
        instruction += f" Do NOT generate {', '.join(skip)}."
    instruction += " This saves budget — skip reading/planning for excluded outputs.\n"
    return instruction


def _load_system_prompt() -> str:
    try:
        return _SYSTEM_PROMPT_PATH.read_text()
    except FileNotFoundError:
        return (
            "You are an expert OpenClaw setup guide creator. "
            "Read the knowledge base and interview transcript, "
            "then generate personalized setup output files."
        )


# ── Main agent loop ────────────────────────────────────────────────────────

async def generate_guide(
    formatted_transcript: str,
    event_queue=None,
    guide_id: str = None,
    selected_outputs: list[str] | None = None,
) -> dict:
    """Generate an OpenClaw setup guide using Claude API with tool use."""
    guide_id = guide_id or str(uuid.uuid4())[:8]
    output_dir = _OUTPUT_BASE / guide_id
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "reference_documents").mkdir(exist_ok=True)

    transcript_path = output_dir / "INTERVIEW_TRANSCRIPT.md"
    transcript_path.write_text(formatted_transcript)

    system_prompt = _load_system_prompt()
    context_dir = str(_CONTEXT_DIR.resolve())
    cwd = str(output_dir.resolve())
    allowed_dirs = [cwd, context_dir]

    logger.info(f"[GUIDE {guide_id}] Starting (model={MODEL})")
    logger.info(f"[GUIDE {guide_id}] Output: {output_dir}")

    # Semantic KB retrieval
    semantic_context = ""
    try:
        from setup_guide_agent.kb_search import kb_index
        await kb_index.build()
        relevant_docs = await kb_index.search(formatted_transcript, top_k=12)

        lines = ["## Pre-selected Knowledge Base (most relevant)\n"]
        for item in relevant_docs[:12]:
            fpath = _CONTEXT_DIR / item["path"]
            if fpath.exists():
                content = fpath.read_text()[:3000]
                lines.append(f"### {item['path']} (score: {item['score']:.2f})\n{content}\n")
        semantic_context = "\n".join(lines)
        logger.info(f"[GUIDE {guide_id}] KB retrieval: {len(relevant_docs)} docs")
    except Exception as e:
        logger.warning(f"[GUIDE {guide_id}] KB retrieval failed: {e}")

    # Build the user prompt
    semantic_block = ""
    if semantic_context:
        semantic_block = (
            f"\n\n{semantic_context}\n\n"
            f"The above documents were pre-selected as most relevant. "
            f"Use them as your primary reference. You may still read additional files.\n\n"
        )

    selection_instruction = _build_selection_instruction(selected_outputs)

    user_prompt = (
        f"Your working directory is: {cwd}\n"
        f"It contains INTERVIEW_TRANSCRIPT.md — the user's interview.\n\n"
        f"Your read-only knowledge base is at: {context_dir}\n"
        f"Read KNOWLEDGE_INDEX.md first — it maps needs to exact files.\n\n"
        f"The knowledge base contains:\n"
        f"- skill_registry.md — allowlist of skills\n"
        f"- openclaw-docs/ — full documentation\n"
        f"- setup_guides/ — reference guides (Mac, Docker, VPS)\n"
        f"- domain_knowledge_final/ — industry use cases\n"
        f"- templates/onboarding_guide.md — formatting reference\n\n"
        f"{semantic_block}"
        f"Generate these output files in {cwd}:\n"
        f"1. EASYCLAW_SETUP.md — the master setup guide\n"
        f"2. reference_documents/*.md — sub-step docs for complex procedures\n"
        f"3. prompts_to_send.md — initialization prompts\n\n"
        f"{selection_instruction}"
        f"Start by reading the transcript, then explore the knowledge base, "
        f"then generate all output files."
    )

    # Agent loop — direct Anthropic API with tool use
    client = anthropic.AsyncAnthropic()
    messages = [{"role": "user", "content": user_prompt}]

    turn_count = 0
    total_input_tokens = 0
    total_output_tokens = 0

    try:
        while turn_count < MAX_TURNS:
            turn_count += 1

            response = await client.messages.create(
                model=MODEL,
                max_tokens=MAX_TOKENS_PER_TURN,
                system=system_prompt,
                tools=TOOLS,
                messages=messages,
            )

            total_input_tokens += response.usage.input_tokens
            total_output_tokens += response.usage.output_tokens

            # Check if the model wants to use tools
            tool_uses = [b for b in response.content if b.type == "tool_use"]

            if not tool_uses:
                # Model is done — no more tool calls
                logger.info(f"[GUIDE {guide_id}] Agent done at turn {turn_count}")
                break

            # Append assistant response
            messages.append({"role": "assistant", "content": response.content})

            # Execute each tool and build results
            tool_results = []
            for tool_use in tool_uses:
                stage = _classify_tool_stage(tool_use.name)
                logger.info(f"[GUIDE {guide_id}] Turn {turn_count}: {tool_use.name}({list(tool_use.input.keys())})")

                if event_queue is not None:
                    await event_queue.put({
                        "type": "progress",
                        "stage": stage,
                        "turn": turn_count,
                        "max_turns": MAX_TURNS,
                        "tokens": total_input_tokens + total_output_tokens,
                    })

                result_text = _execute_tool(tool_use.name, tool_use.input, cwd, cwd, allowed_dirs)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": tool_use.id,
                    "content": result_text,
                })

                # Emit doc_status when agent writes files
                if tool_use.name == "Write":
                    for doc_event in _detect_doc_status(output_dir):
                        if event_queue is not None:
                            await event_queue.put(doc_event)

            messages.append({"role": "user", "content": tool_results})

            # Stop if model says stop
            if response.stop_reason == "end_turn":
                break

        # Estimate cost (Sonnet 4: $3/M input, $15/M output)
        cost_usd = (total_input_tokens * 3 + total_output_tokens * 15) / 1_000_000

        logger.info(
            f"[GUIDE {guide_id}] Finished — turns={turn_count}, "
            f"tokens={total_input_tokens + total_output_tokens}, cost=${cost_usd:.4f}"
        )

        if event_queue is not None:
            await event_queue.put({
                "type": "progress",
                "stage": "Finalizing...",
                "turn": turn_count,
                "max_turns": MAX_TURNS,
                "cost": cost_usd,
            })

        outputs = _collect_outputs(output_dir)

        result = {
            "guide_id": guide_id,
            "status": "complete",
            "agent_turns": turn_count,
            "agent_cost_usd": cost_usd,
            "outputs": outputs,
        }

        # Quality evaluation + patch
        if result["outputs"].get("setup_guide"):
            try:
                from guide_evaluator import evaluate_guide as _evaluate_guide
                eval_result = await _evaluate_guide(
                    guide=result["outputs"]["setup_guide"],
                    transcript=formatted_transcript,
                )
                result["quality_eval"] = {
                    "scores": eval_result.scores,
                    "mean_score": eval_result.mean_score,
                    "passed": eval_result.passed,
                    "notes": eval_result.overall_notes,
                    "rationales": eval_result.rationales,
                }

                if not eval_result.passed:
                    logger.warning(f"[GUIDE {guide_id}] Quality {eval_result.mean_score:.2f} — patching")
                    worst = min(eval_result.scores, key=eval_result.scores.get)
                    patch_response = await client.messages.create(
                        model=MODEL,
                        max_tokens=8192,
                        messages=[{
                            "role": "user",
                            "content": (
                                f"The setup guide scored poorly on {worst} "
                                f"({eval_result.scores[worst]}/5).\n\n"
                                f"Issue: {eval_result.rationales[worst]}\n\n"
                                f"Rewrite ONLY the sections that address this. "
                                f"Output the complete improved guide.\n\n"
                                f"{result['outputs']['setup_guide']}"
                            ),
                        }],
                    )
                    result["outputs"]["setup_guide"] = patch_response.content[0].text
                    result["quality_eval"]["patched"] = True
                    logger.info(f"[GUIDE {guide_id}] Patched for {worst}")
            except Exception as e:
                logger.warning(f"[GUIDE {guide_id}] Quality eval failed: {e}")

        if event_queue is not None:
            await event_queue.put({
                "type": "complete",
                "guide_id": guide_id,
                "cost": cost_usd,
                "turns": turn_count,
            })

        return result

    except Exception as e:
        logger.error(f"[GUIDE {guide_id}] Failed: {e}")
        if event_queue is not None:
            await event_queue.put({"type": "error", "message": str(e)})
        return {
            "guide_id": guide_id,
            "status": "error",
            "message": str(e),
            "outputs": _collect_outputs(output_dir),
        }


def _collect_outputs(output_dir: Path) -> dict:
    outputs = {
        "setup_guide": None,
        "reference_documents": [],
        "prompts_to_send": None,
    }

    for name in ("EASYCLAW_SETUP.md", "EASYCLAW_SETUP.txt",
                 "OPENCLAW_ENGINE_SETUP_GUIDE.md", "OPENCLAW_ENGINE_SETUP_GUIDE.txt"):
        p = output_dir / name
        if p.exists():
            outputs["setup_guide"] = p.read_text()
            break

    ref_dir = output_dir / "reference_documents"
    if ref_dir.is_dir():
        seen = set()
        for ext in ("*.md", "*.txt"):
            for f in sorted(ref_dir.glob(ext)):
                if f.stem not in seen:
                    seen.add(f.stem)
                    outputs["reference_documents"].append({"name": f.name, "content": f.read_text()})

    for ext in (".md", ".txt"):
        p = output_dir / f"prompts_to_send{ext}"
        if p.exists():
            outputs["prompts_to_send"] = p.read_text()
            break

    known = {
        "INTERVIEW_TRANSCRIPT.md", "EASYCLAW_SETUP.txt", "EASYCLAW_SETUP.md",
        "OPENCLAW_ENGINE_SETUP_GUIDE.md", "OPENCLAW_ENGINE_SETUP_GUIDE.txt",
        "prompts_to_send.md", "prompts_to_send.txt",
    }
    for pattern in ("*.md", "*.txt"):
        for f in output_dir.glob(pattern):
            if f.name not in known:
                outputs.setdefault("other_files", []).append({"name": f.name, "content": f.read_text()})

    return outputs
