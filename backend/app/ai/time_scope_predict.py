import json
import os
import pickle
from typing import Any, Dict, List

import numpy as np

from app.ai.time_scope_preprocess import TIME_SCOPE_LABELS, build_time_scope_training_text


BASE_DIR = os.path.dirname(__file__)
MODELS_DIR = os.path.join(BASE_DIR, "model")
TIME_SCOPE_MODEL_PATH = os.path.join(MODELS_DIR, "time_scope_pipeline.pkl")
TIME_SCOPE_LABELS_PATH = os.path.join(MODELS_DIR, "time_scope_labels.json")


def load_time_scope_artifacts() -> Dict[str, Any]:
    if not os.path.exists(TIME_SCOPE_MODEL_PATH):
        return {"model": None, "labels": list(TIME_SCOPE_LABELS)}

    with open(TIME_SCOPE_MODEL_PATH, "rb") as f:
        model = pickle.load(f)

    labels = list(TIME_SCOPE_LABELS)
    if os.path.exists(TIME_SCOPE_LABELS_PATH):
        with open(TIME_SCOPE_LABELS_PATH, "r", encoding="utf-8") as f:
            labels = json.load(f)

    return {"model": model, "labels": labels}


def predict_time_scope(
    text: str,
    *,
    role: str = "",
    history: List[Dict[str, Any]] | None = None,
    intent: str = "",
    artifacts: Dict[str, Any] | None = None,
) -> str | None:
    if artifacts is None:
        artifacts = load_time_scope_artifacts()

    if intent in {"clarification_needed", "role_unsupported", "greeting", "out_of_scope"}:
        return None

    model = artifacts.get("model")
    if model is None:
        return None

    if not isinstance(history, list):
        history = []

    inference_text = build_time_scope_training_text(text, role=role, history=history, intent=intent)
    probs = model.predict_proba([inference_text])[0]
    labels = list(getattr(model, "classes_", artifacts.get("labels", list(TIME_SCOPE_LABELS))))
    idx = int(np.argmax(probs))
    label = str(labels[idx])
    if label == "null":
        label = None

    if label is None:
        from app.ai.routing import extract_time_scope

        history_text = " ".join(
            str(item.get("content", ""))
            for item in (history or [])
            if isinstance(item, dict) and str(item.get("content", ""))
        )
        label = extract_time_scope(text, history_text, intent)
    return label
