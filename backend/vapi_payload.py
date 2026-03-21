"""
Extract concierge fields from Vapi Server URL POST bodies.

Vapi wraps events as { "message": { "type": "...", "call": {...}, ... } }.
Structured outputs land under call.artifact.structuredOutputs[<id>].result
(see https://docs.vapi.ai/assistants/structured-outputs-quickstart).
"""

from __future__ import annotations

from typing import Any, Dict, List, Set


def _append_use_cases_from_dict(d: Dict[str, Any], bucket: List[str]) -> None:
    for key in ("use_cases", "useCases"):
        raw = d.get(key)
        if isinstance(raw, list):
            for item in raw:
                s = str(item).strip()
                if s:
                    bucket.append(s)


def _walk_structured_outputs(artifact: Dict[str, Any], bucket: List[str]) -> None:
    so = artifact.get("structuredOutputs") or artifact.get("structured_outputs")
    if not isinstance(so, dict):
        return
    for _output_id, data in so.items():
        if not isinstance(data, dict):
            continue
        _append_use_cases_from_dict(data, bucket)
        result = data.get("result")
        if isinstance(result, dict):
            _append_use_cases_from_dict(result, bucket)


def _dedupe_preserve_order(items: List[str]) -> List[str]:
    seen: Set[str] = set()
    out: List[str] = []
    for x in items:
        k = x.lower()
        if k not in seen:
            seen.add(k)
            out.append(x)
    return out


def extract_use_cases(payload: Dict[str, Any]) -> List[str]:
    """
    Pull use-case strings from a Vapi webhook / test JSON body.
    Tries documented paths first, then any nested use_cases / useCases keys.
    """
    found: List[str] = []

    _append_use_cases_from_dict(payload, found)

    message = payload.get("message")
    if isinstance(message, dict):
        _append_use_cases_from_dict(message, found)
        call = message.get("call")
        if isinstance(call, dict):
            _append_use_cases_from_dict(call, found)
            art = call.get("artifact")
            if isinstance(art, dict):
                _append_use_cases_from_dict(art, found)
                _walk_structured_outputs(art, found)
        art_top = message.get("artifact")
        if isinstance(art_top, dict):
            _append_use_cases_from_dict(art_top, found)
            _walk_structured_outputs(art_top, found)

    if not found:
        _deep_collect_use_cases(payload, found)

    return _dedupe_preserve_order(found)


def _deep_collect_use_cases(obj: Any, bucket: List[str]) -> None:
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in ("use_cases", "useCases") and isinstance(v, list):
                for item in v:
                    s = str(item).strip()
                    if s:
                        bucket.append(s)
            else:
                _deep_collect_use_cases(v, bucket)
    elif isinstance(obj, list):
        for item in obj:
            _deep_collect_use_cases(item, bucket)
