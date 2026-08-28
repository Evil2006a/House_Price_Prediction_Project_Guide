import json
from pathlib import Path

import pandas as pd

from app.core.config import get_settings
from app.schemas.prediction import PredictionRequest

_settings = get_settings()

# Loaded once at import time — the allowed location list used during training.
_locations_path = Path(_settings.locations_path)
if _locations_path.exists():
    with _locations_path.open() as f:
        ALLOWED_LOCATIONS: set[str] = set(json.load(f))
else:
    ALLOWED_LOCATIONS = set()

# Must exactly match the column names used to fit the pipeline in the notebook.
NUMERIC_FEATURES = ["carpet_area_sqft", "floor_num", "bathroom", "balcony"]
CATEGORICAL_FEATURES = ["location_grouped", "Furnishing", "Transaction", "Ownership", "facing"]


def request_to_dataframe(request: PredictionRequest) -> pd.DataFrame:
    """Build a single-row DataFrame with exactly the column names used in training.

    Unknown locations are mapped to "other", matching the grouping done during
    training for high-cardinality locations.
    """
    location_grouped = request.location if request.location in ALLOWED_LOCATIONS else "other"

    row = {
        "carpet_area_sqft": request.carpet_area_sqft,
        "floor_num": request.floor_num,
        "bathroom": request.bathroom,
        "balcony": request.balcony,
        "location_grouped": location_grouped,
        "Furnishing": request.furnishing,
        "Transaction": request.transaction,
        "Ownership": request.ownership,
        "facing": request.facing,
    }

    return pd.DataFrame([row], columns=NUMERIC_FEATURES + CATEGORICAL_FEATURES)
