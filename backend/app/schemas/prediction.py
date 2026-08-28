from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    """Matches the features the model pipeline was trained on."""

    location: str = Field(..., examples=["Location_1"])
    carpet_area_sqft: float = Field(..., gt=0, examples=[1200])
    floor_num: int = Field(..., examples=[3])
    bathroom: int = Field(..., ge=0, examples=[2])
    balcony: int = Field(..., ge=0, examples=[1])
    furnishing: str = Field(..., examples=["Semi-Furnished"])  # Furnished | Semi-Furnished | Unfurnished
    transaction: str = Field(..., examples=["Resale"])  # New Property | Resale
    ownership: str = Field(..., examples=["Freehold"])
    facing: str = Field(..., examples=["East"])


class PredictionResponse(BaseModel):
    predicted_price: float


class HealthResponse(BaseModel):
    status: str = "ok"
