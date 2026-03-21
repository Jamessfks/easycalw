"""
OpenClaw Concierge backend: Vapi -> skill mapping.

POST /webhook accepts Vapi Server URL payloads (or a bare test object) and
returns ClawHub install commands derived from extracted use cases.
"""

from __future__ import annotations

from typing import Any, Dict, List

from fastapi import FastAPI, Request
from pydantic import BaseModel, Field

from skill_lookup_table import get_skills_for_use_cases
from vapi_payload import extract_use_cases

app = FastAPI(title="OpenClaw Concierge", version="0.1.0")


class WebhookResponse(BaseModel):
    message_type: str | None = None
    use_cases: List[str] = Field(default_factory=list)
    skill_mapping: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    unique_install_commands: List[str] = Field(default_factory=list)
    unique_skill_slugs: List[str] = Field(default_factory=list)


def _flatten_unique_commands(mapping: Dict[str, Dict[str, Any]]) -> List[str]:
    seen: set[str] = set()
    out: List[str] = []
    for entry in mapping.values():
        for cmd in entry.get("install_commands") or []:
            if cmd not in seen:
                seen.add(cmd)
                out.append(cmd)
    return out


def _flatten_unique_slugs(mapping: Dict[str, Dict[str, Any]]) -> List[str]:
    seen: set[str] = set()
    out: List[str] = []
    for entry in mapping.values():
        for slug in entry.get("skills") or []:
            if slug not in seen:
                seen.add(slug)
                out.append(slug)
    return out


@app.post("/webhook", response_model=WebhookResponse)
async def webhook(request: Request) -> WebhookResponse:
    payload: Dict[str, Any] = await request.json()

    use_cases = extract_use_cases(payload)
    skill_mapping = get_skills_for_use_cases(use_cases)

    msg = payload.get("message")
    message_type = msg.get("type") if isinstance(msg, dict) else None

    return WebhookResponse(
        message_type=message_type,
        use_cases=use_cases,
        skill_mapping=skill_mapping,
        unique_install_commands=_flatten_unique_commands(skill_mapping),
        unique_skill_slugs=_flatten_unique_slugs(skill_mapping),
    )
