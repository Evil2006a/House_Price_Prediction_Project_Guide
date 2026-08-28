from pydantic import BaseModel, ConfigDict, Field


class PredictionRequest(BaseModel):
    location: str = Field(..., description="Location / area name, e.g. 'thane'")
    carpet_area_sqft: float = Field(..., gt=0, description="Carpet area in square feet")
    floor_num: int = Field(..., description="Floor number (0 = Ground, -1 = Basement)")
    bathroom: int = Field(..., ge=0, description="Number of bathrooms")
    balcony: int = Field(..., ge=0, description="Number of balconies")
    furnishing: str = Field(..., description="'Furnished' | 'Semi-Furnished' | 'Unfurnished'")
    transaction: str = Field(..., description="'New Property' | 'Resale' | 'Other' | 'Rent/Lease'")
    ownership: str = Field(..., description="'Freehold' | 'Co-operative Society' | 'Power Of Attorney' | 'Leasehold'")
    facing: str = Field(..., description="e.g. 'East', 'North - West', ...")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "location": "thane",
                "carpet_area_sqft": 900,
                "floor_num": 3,
                "bathroom": 2,
                "balcony": 1,
                "furnishing": "Semi-Furnished",
                "transaction": "Resale",
                "ownership": "Freehold",
                "facing": "East",
            }
        }
    )


class PredictionResponse(BaseModel):
    predicted_price: float


class HealthResponse(BaseModel):
    status: str
