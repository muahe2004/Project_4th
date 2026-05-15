from __future__ import annotations

import json
import pickle
from functools import lru_cache
from pathlib import Path
from typing import Any

import numpy as np

from app.ai.preprocess import build_inference_text


BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "model"
PIPELINE_PATH = MODEL_DIR / "intent_pipeline.pkl"
LABELS_PATH = MODEL_DIR / "labels.json"


@lru_cache(maxsize=1)
def _load_pipeline() -> Any:
    if not PIPELINE_PATH.exists():
        raise FileNotFoundError(f"Missing model file: {PIPELINE_PATH}")
    with PIPELINE_PATH.open("rb") as f:
        return pickle.load(f)


@lru_cache(maxsize=1)
def _load_labels() -> list[str]:
    if not LABELS_PATH.exists():
        raise FileNotFoundError(f"Missing labels file: {LABELS_PATH}")

    with LABELS_PATH.open("r", encoding="utf-8") as f:
        labels = json.load(f)

    if isinstance(labels, list):
        return [str(label) for label in labels]

    if isinstance(labels, dict):
        try:
            return [str(labels[str(i)]) for i in range(len(labels))]
        except KeyError:
            return [str(value) for value in labels.values()]

    raise ValueError("labels.json must contain either a list or a dict.")


def _resolve_labels(pipeline: Any) -> list[str]:
    pipeline_labels = list(getattr(pipeline, "classes_", []))
    labels = _load_labels()

    if pipeline_labels and labels == pipeline_labels:
        return labels

    if pipeline_labels:
        return [str(label) for label in pipeline_labels]

    return labels


def predict_intent(
    text: str,
    role: str = "",
    history: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    inference_text = build_inference_text(text=text, role=role, history=history)
    pipeline = _load_pipeline()
    labels = _resolve_labels(pipeline)

    if not hasattr(pipeline, "predict_proba"):
        raise AttributeError("intent_pipeline.pkl must expose predict_proba().")

    probabilities = np.asarray(pipeline.predict_proba([inference_text]), dtype=float)
    if probabilities.ndim != 2 or probabilities.shape[0] == 0:
        raise ValueError("Unexpected probability shape returned by the model.")

    probs = probabilities[0]
    predicted_index = int(np.argmax(probs))
    confidence = float(probs[predicted_index])

    if predicted_index >= len(labels):
        raise IndexError(
            f"Predicted index {predicted_index} exceeds labels size {len(labels)}."
        )

    return {
        "intent": labels[predicted_index],
        "confidence": confidence,
        "index": predicted_index,
        "normalized_text": inference_text,
    }
