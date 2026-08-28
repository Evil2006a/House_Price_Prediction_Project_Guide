import joblib

from app.core.config import settings
from app.schemas.prediction import PredictionRequest
from app.services.preprocessing import request_to_dataframe

_model = None


def load_model() -> None:
    """Load the trained pipeline from disk. Called once at app startup."""
    global _model
    _model = joblib.load(settings.model_path)


def get_model():
    if _model is None:
        raise RuntimeError("Model has not been loaded yet. Call load_model() at startup.")
    return _model


def predict_price(request: PredictionRequest) -> float:
    model = get_model()
    X = request_to_dataframe(request)
    prediction = model.predict(X)
    return float(prediction[0])
