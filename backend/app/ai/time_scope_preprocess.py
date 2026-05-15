from typing import Any, Dict, List

from app.ai.preprocess import build_inference_text
from app.ai.routing import DEFAULT_TIME_SCOPE_BY_INTENT, SCHEDULE_INTENTS, extract_time_scope

TIME_SCOPE_LABELS = (
    "today",
    "tomorrow",
    "this_week",
    "next_week",
    "this_month",
    "current_term",
    "custom_range",
    "null",
)


def _history_text(history: List[Dict[str, Any]] | None) -> str:
    if not history or not isinstance(history, list):
        return ""

    parts: List[str] = []
    for item in history:
        if not isinstance(item, dict):
            continue
        content = str(item.get("content", ""))
        if content:
            parts.append(content)
    return " ".join(parts)


def build_time_scope_training_text(
    text: str,
    *,
    role: str = "",
    history: List[Dict[str, Any]] | None = None,
    intent: str = "",
) -> str:
    intent_segment = f"intent: {intent.strip().lower()}" if intent else ""
    base_text = text
    if intent_segment:
        base_text = f"{intent_segment} {base_text}"
    return build_inference_text(base_text, role=role, history=history or [])


def derive_time_scope_label(
    *,
    text: str,
    history: List[Dict[str, Any]] | None,
    intent: str,
) -> str:
    history_text = _history_text(history)
    scope = extract_time_scope(text, history_text, intent)

    if scope is None:
        if intent in SCHEDULE_INTENTS:
            return DEFAULT_TIME_SCOPE_BY_INTENT.get(intent, "today")
        if intent == "tuition_fee":
            return "current_term"
        return "null"

    return scope
