import logging
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_model: Any = None


def load_model() -> None:
    """Load the trained pipeline from disk. Called once at app startup."""
    global _model
    settings = get_settings()
    model_path = Path(settings.model_path)

    if not model_path.exists():
        raise FileNotFoundError(
            f"Model file not found at {model_path}. "
            "Copy house_price.pkl from the notebook into backend/models/."
        )

    logger.info("Loading model from %s", model_path)
    _model = joblib.load(model_path)
    logger.info("Model loaded successfully")


def get_model() -> Any:
    if _model is None:
        raise RuntimeError("Model has not been loaded yet. Call load_model() at startup.")
    return _model


def predict(features: pd.DataFrame) -> float:
    model = get_model()
    prediction = model.predict(features)
    return float(prediction[0])
