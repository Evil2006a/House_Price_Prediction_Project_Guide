import logging

from fastapi import APIRouter, HTTPException

from app.schemas.prediction import HealthResponse, PredictionRequest, PredictionResponse
from app.services import inference, preprocessing

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@router.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest) -> PredictionResponse:
    try:
        features = preprocessing.request_to_dataframe(request)
        predicted_price = inference.predict(features)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail="Prediction failed") from exc

    return PredictionResponse(predicted_price=predicted_price)
