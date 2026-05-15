import re
import unicodedata
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional, Tuple

from app.ai.text_utils import normalize_text


def strip_accents(text: str) -> str:
    normalized = unicodedata.normalize("NFD", text)
    return "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")


def normalize_for_rules(text: str) -> str:
    return strip_accents(normalize_text(text))


TIME_SCOPE_KEYWORDS: Dict[str, Tuple[str, ...]] = {
    "today": (
        "hom nay",
        "ngay hom nay",
        "toi nay",
        "hien tai",
        "bay gio",
    ),
    "tomorrow": (
        "ngay mai",
        "mai",
    ),
    "this_week": (
        "tuan nay",
        "trong tuan nay",
        "trong tuan",
    ),
    "next_week": (
        "tuan sau",
        "tuan toi",
        "tuan toi day",
    ),
    "this_month": (
        "thang nay",
        "trong thang nay",
    ),
    "current_term": (
        "hoc ky nay",
        "hoc ki nay",
        "ki nay",
        "ky nay",
        "hoc ky hien tai",
        "hoc ki hien tai",
    ),
}

CUSTOM_RANGE_PATTERNS: Tuple[re.Pattern[str], ...] = (
    re.compile(r"\btu\s+ngay\b.*\bden\s+ngay\b"),
    re.compile(r"\btu\b.*\bden\b"),
    re.compile(r"\btu\s+\d{1,2}[/-]\d{1,2}([/-]\d{2,4})?\b.*\bden\b"),
    re.compile(r"\b\d{1,2}[/-]\d{1,2}([/-]\d{2,4})?\b.*\b\d{1,2}[/-]\d{1,2}([/-]\d{2,4})?\b"),
)

SCHEDULE_INTENTS = {
    "learning_schedule",
    "teaching_schedule",
    "examination_schedule",
    "class_learning_schedule",
    "room_learning_schedule",
    "class_teaching",
}

DEFAULT_TIME_SCOPE_BY_INTENT = {
    "learning_schedule": "today",
    "teaching_schedule": "today",
    "examination_schedule": "today",
    "class_learning_schedule": "today",
    "room_learning_schedule": "today",
    "class_teaching": "today",
    "tuition_fee": "current_term",
}

AMBIGUOUS_PHRASES = (
    "cai do",
    "cai nay",
    "cai kia",
    "xem chi tiet",
    "xem giup em",
    "xem giup toi",
    "cho toi xem",
    "cho em xem",
    "xem lai cho toi",
    "xem lai cho em",
    "dung roi",
    "dung",
    "va sao",
    "con ngay mai",
    "trong tuan nay",
    "tuan nay thoi",
    "thu 3 thi sao",
    "thu ba thi sao",
)

INTENT_HINT_KEYWORDS: Dict[str, Tuple[str, ...]] = {
    "learning_schedule": (
        "lich hoc",
        "thoi khoa bieu",
        "tkb",
        "hoc cua em",
        "hoc cua toi",
        "lich hoc cua toi",
        "lich hoc cua em",
        "study schedule",
    ),
    "teaching_schedule": (
        "lich day",
        "thoi khoa bieu day",
        "lich giang day",
        "lich dung lop",
        "giang day",
        "teaching schedule",
    ),
    "examination_schedule": (
        "lich thi",
        "lich kiem tra",
        "ky thi",
        "kiem tra",
        "exam schedule",
        "test schedule",
    ),
    "tuition_fee": (
        "hoc phi",
        "cong no",
        "payment status",
        "tuition fee",
        "tuition balance",
    ),
    "class_learning_schedule": (
        "lich hoc cua lop",
        "thoi khoa bieu lop",
        "schedule by class",
        "class schedule",
        "lich theo lop",
    ),
    "room_learning_schedule": (
        "lich hoc theo phong",
        "phong nao co lich hoc",
        "schedule by room",
        "room schedule",
    ),
    "class_teaching": (
        "lop toi day",
        "lop giang day",
        "lop phu trach",
        "class i teach",
        "teaching classes",
    ),
}


@dataclass(frozen=True)
class RoutingDecision:
    intent: str
    time_scope: Optional[str]
    confidence: float


def _contains_any(text: str, phrases: Iterable[str]) -> bool:
    return any(phrase in text for phrase in phrases)


def _has_custom_range(text: str) -> bool:
    return any(pattern.search(text) for pattern in CUSTOM_RANGE_PATTERNS)


def extract_time_scope(text: str, history_text: str = "", intent: str | None = None) -> Optional[str]:
    combined = normalize_for_rules(f"{text} {history_text}")
    current = normalize_for_rules(text)

    if _has_custom_range(current) or _has_custom_range(combined):
        return "custom_range"

    for scope, keywords in TIME_SCOPE_KEYWORDS.items():
        if _contains_any(current, keywords) or _contains_any(combined, keywords):
            return scope

    if intent in SCHEDULE_INTENTS and current:
        return DEFAULT_TIME_SCOPE_BY_INTENT.get(intent, "today")

    if intent == "tuition_fee" and current:
        return "current_term"

    return None


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


def infer_intent_from_history(history: List[Dict[str, Any]] | None) -> Optional[str]:
    history_text = normalize_for_rules(_history_text(history))
    if not history_text:
        return None

    for intent, keywords in INTENT_HINT_KEYWORDS.items():
        if _contains_any(history_text, keywords):
            return intent

    return None


def infer_intent_from_text(text: str) -> Optional[str]:
    normalized = normalize_for_rules(text)
    if not normalized:
        return None

    for intent, keywords in INTENT_HINT_KEYWORDS.items():
        if _contains_any(normalized, keywords):
            return intent
    return None


def is_ambiguous_text(text: str, history_text: str = "") -> bool:
    combined = normalize_for_rules(f"{text} {history_text}")
    current = normalize_for_rules(text)
    if not current:
        return True

    if _contains_any(current, AMBIGUOUS_PHRASES):
        return True

    if current in {"dung roi", "dung", "co", "khong", "ok", "oke", "yes"}:
        return True

    # Pure time references often need the previous turn to resolve the intent.
    if extract_time_scope(current) and not _contains_any(combined, sum(INTENT_HINT_KEYWORDS.values(), ())):
        return True

    return False


def is_role_supported(role: str, intent: str, metadata: Dict[str, Dict[str, Any]]) -> bool:
    if not role:
        return True

    tag_metadata = metadata.get(intent, {})
    allowed_roles = tag_metadata.get("allowed_roles") or []
    if not allowed_roles:
        return True
    return role in allowed_roles


def is_clear_intent(intent: str) -> bool:
    return intent not in {"clarification_needed", "role_unsupported", "greeting", "out_of_scope"}


def build_routing_decision(
    *,
    model_intent: str,
    model_confidence: float,
    text: str,
    role: str,
    history: List[Dict[str, Any]] | None,
    metadata: Dict[str, Dict[str, Any]],
) -> RoutingDecision:
    history_text = _history_text(history)
    current_text = normalize_for_rules(text)
    predicted_intent = model_intent
    history_intent = infer_intent_from_history(history)
    text_intent = infer_intent_from_text(current_text)

    if predicted_intent == "clarification_needed" and history_intent and is_role_supported(role, history_intent, metadata):
        predicted_intent = history_intent

    if predicted_intent == "clarification_needed":
        if text_intent and not is_role_supported(role, text_intent, metadata):
            return RoutingDecision(intent="role_unsupported", time_scope=None, confidence=max(model_confidence, 0.80))
        if history_intent and not is_role_supported(role, history_intent, metadata):
            return RoutingDecision(intent="role_unsupported", time_scope=None, confidence=max(model_confidence, 0.80))

    if predicted_intent == "out_of_scope":
        return RoutingDecision(intent=predicted_intent, time_scope=None, confidence=model_confidence)

    if predicted_intent == "clarification_needed":
        return RoutingDecision(intent=predicted_intent, time_scope=None, confidence=min(model_confidence, 0.70))

    if not is_role_supported(role, predicted_intent, metadata):
        return RoutingDecision(intent="role_unsupported", time_scope=None, confidence=max(model_confidence, 0.80))

    time_scope = extract_time_scope(current_text, history_text, predicted_intent)
    if predicted_intent in SCHEDULE_INTENTS and time_scope is None:
        time_scope = DEFAULT_TIME_SCOPE_BY_INTENT.get(predicted_intent, "today")
    elif predicted_intent == "tuition_fee" and time_scope is None:
        time_scope = "current_term"

    if predicted_intent in {"greeting", "role_unsupported", "clarification_needed", "out_of_scope"}:
        time_scope = None

    return RoutingDecision(intent=predicted_intent, time_scope=time_scope, confidence=model_confidence)
