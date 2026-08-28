import json
from functools import lru_cache

import pandas as pd

from app.core.config import settings
from app.schemas.prediction import PredictionRequest

NUMERIC_FEATURES = ["carpet_area_sqft", "floor_num", "bathroom", "balcony"]
CATEGORICAL_FEATURES = ["location_grouped", "Furnishing", "Transaction", "Ownership", "facing"]


@lru_cache(maxsize=1)
def load_known_locations() -> set[str]:
    """Load the set of locations that were kept (not grouped into 'other') during training."""
    with open(settings.locations_path) as f:
        return set(json.load(f))


def request_to_dataframe(request: PredictionRequest) -> pd.DataFrame:
    """Turn a validated PredictionRequest into a one-row DataFrame with exactly the
    column names used during training. Unknown locations are mapped to 'other',
    matching the notebook's grouping of low-frequency locations.
    """
    known_locations = load_known_locations()
    location_grouped = request.location if request.location in known_locations else "other"

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
