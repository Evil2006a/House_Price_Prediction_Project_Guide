from fastapi import APIRouter

from app.schemas.prediction import HealthResponse, PredictionRequest, PredictionResponse
from app.services.inference import predict_price

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@router.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest) -> PredictionResponse:
    price = predict_price(request)
    return PredictionResponse(predicted_price=price)
