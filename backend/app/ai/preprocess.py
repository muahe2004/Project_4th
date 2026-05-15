from __future__ import annotations

from typing import Any

from app.ai.text_utils import normalize_text


def format_history(history: list[dict[str, Any]] | None) -> str:
    if not history:
        return ""

    parts: list[str] = []
    for item in history:
        role = normalize_text(str(item.get("role", "")))
        content = normalize_text(str(item.get("content", "")))
        if role and content:
            parts.append(f"{role}: {content}")
        elif content:
            parts.append(content)

    return " [HIST] ".join(parts)


def build_inference_text(
    text: str,
    role: str = "",
    history: list[dict[str, Any]] | None = None,
) -> str:
    segments: list[str] = []

    normalized_role = normalize_text(role)
    if normalized_role:
        segments.append(f"role: {normalized_role}")

    history_text = format_history(history)
    if history_text:
        segments.append(f"history: {history_text}")

    cleaned_text = normalize_text(text)
    if cleaned_text:
        segments.append(cleaned_text)

    return " [CTX] ".join(segments)
