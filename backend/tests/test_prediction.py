import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client():
    # Using TestClient as a context manager triggers the app's lifespan
    # (startup/shutdown) events, so the model is loaded before tests run.
    with TestClient(app) as c:
        yield c


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_predict_happy_path(client):
    payload = {
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
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert "predicted_price" in body
    assert isinstance(body["predicted_price"], float)
    assert body["predicted_price"] > 0


def test_predict_invalid_input(client):
    # Missing several required fields, and a negative area.
    payload = {
        "location": "thane",
        "carpet_area_sqft": -10,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422


def test_predict_unknown_location_falls_back_gracefully(client):
    payload = {
        "location": "some-location-not-in-training-data",
        "carpet_area_sqft": 750,
        "floor_num": 1,
        "bathroom": 1,
        "balcony": 1,
        "furnishing": "Unfurnished",
        "transaction": "New Property",
        "ownership": "Freehold",
        "facing": "North",
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    assert response.json()["predicted_price"] > 0
