# House Price Prediction — End-to-End ML Web App

Predicts Indian residential property prices from listing details (area, location, floor, furnishing, etc.) using a Random Forest model trained on ~167K cleaned listings, served through a FastAPI backend and a React + TypeScript frontend.

## Overview

This project takes the [House Price dataset by Juhi Bhojani](https://www.kaggle.com/datasets/juhibhojani/house-price) (Kaggle, ~187K Indian property listings) from raw, messy CSV all the way to a deployed prediction web app:

1. **Notebook** — cleans the data, explores it, trains and compares two regression models, and exports the winner as a single portable scikit-learn pipeline.
2. **Backend** — a FastAPI service that loads that pipeline once at startup and exposes `/predict` and `/health`.
3. **Frontend** — a React form where a user enters property details and sees the predicted price.

## Architecture

```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────────────┐
│   React + TS     │  HTTP  │     FastAPI       │  load  │  house_price.pkl    │
│   Frontend        │ ─────▶ │     Backend        │ ─────▶ │  (sklearn Pipeline) │
│  (Vite, :5173)     │ ◀───── │     (:8000)         │ ◀───── │  trained in the      │
│                    │  JSON  │  /predict /health   │        │  Jupyter notebook    │
└─────────────────┘        └──────────────────┘        └─────────────────────┘
```

The exported model is a single `sklearn.pipeline.Pipeline` — preprocessing (imputation, scaling, one-hot encoding) plus a `TransformedTargetRegressor`-wrapped Random Forest — so the backend only has to build a one-row DataFrame and call `.predict()`; no encoding logic is duplicated.

## Tech Stack

| Layer | Technology |
|---|---|
| Modeling | Python, pandas, scikit-learn, joblib |
| Backend | FastAPI, Pydantic, Uvicorn |
| Frontend | React 19, TypeScript, Vite, react-router-dom |
| Testing | pytest, httpx |

## Project Structure

```
house-price-project/
├── notebooks/
│   ├── house_price_model.ipynb   # cleaning, EDA, training, evaluation, export
│   └── data/house_prices.csv     # raw dataset (not committed — see below)
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI app, CORS, model loaded at startup (lifespan)
│   │   ├── api/routes/prediction.py   # GET /health, POST /predict
│   │   ├── core/config.py             # settings from .env
│   │   ├── schemas/prediction.py      # PredictionRequest / PredictionResponse
│   │   ├── services/
│   │   │   ├── preprocessing.py       # request → one-row DataFrame
│   │   │   └── inference.py           # load .pkl, run predict
│   │   └── models/house_price.pkl     # copied from the notebook (not committed — see below)
│   ├── tests/test_prediction.py
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── api/predictionClient.ts    # fetch wrapper
    │   ├── components/PredictionForm.tsx
    │   ├── pages/HomePage.tsx | ResultPage.tsx | NotFoundPage.tsx
    │   ├── types/prediction.ts        # TS types mirroring the backend schema
    │   └── App.tsx                    # routes: / , /result , * (404)
    ├── public/locations.json          # dropdown data, copied from the notebook
    └── .env.example
```

## Dataset

**Source:** [House Price by Juhi Bhojani](https://www.kaggle.com/datasets/juhibhojani/house-price) on Kaggle — ~187,000 real property listings across India, in `house_prices.csv`.

The raw CSV isn't committed to this repository (it's large, and the guide asks that it not be). Download it yourself:

**Option A — manual:** click **Download** on the [dataset page](https://www.kaggle.com/datasets/juhibhojani/house-price), unzip, and place `house_prices.csv` in `notebooks/data/`.

**Option B — Kaggle CLI:**
```bash
pip install kaggle
# Get your API token: Kaggle → Settings → API → "Create New Token"
# Place kaggle.json in ~/.kaggle/ (macOS/Linux) or C:\Users\<you>\.kaggle\ (Windows)
kaggle datasets download -d juhibhojani/house-price -p notebooks/data --unzip
```

## Setup — Notebook

```bash
cd notebooks
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install jupyter pandas numpy scikit-learn matplotlib seaborn joblib

jupyter notebook house_price_model.ipynb
# Kernel → Restart & Run All
```

Running it top-to-bottom produces `house_price.pkl` and `locations.json` inside `notebooks/`. Copy both into `backend/app/models/`, and copy `locations.json` into `frontend/public/` as well.

> **Note on the model file:** the exported pipeline is ~168MB (150-tree Random Forest), above the guide's 50MB commit guideline, so it's git-ignored here. Regenerate it by running the notebook, or share it out-of-band with your team.

## Setup — Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

uvicorn app.main:app --reload
# → http://localhost:8000/docs
```

### Environment variables (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `MODEL_PATH` | `app/models/house_price.pkl` | Path to the trained pipeline |
| `LOCATIONS_PATH` | `app/models/locations.json` | Path to the allowed-locations list |
| `CORS_ORIGINS` | `["http://localhost:5173"]` | Origins allowed to call the API |

### Run tests

```bash
cd backend
pytest
```

## Setup — Frontend

```bash
cd frontend
npm install
cp .env.example .env

npm run dev
# → http://localhost:5173
```

### Environment variables (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Base URL of the FastAPI backend |

## API Reference

### `GET /health`

```bash
curl http://localhost:8000/health
```
```json
{"status": "ok"}
```

### `POST /predict`

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "location": "thane",
    "carpet_area_sqft": 900,
    "floor_num": 3,
    "bathroom": 2,
    "balcony": 1,
    "furnishing": "Semi-Furnished",
    "transaction": "Resale",
    "ownership": "Freehold",
    "facing": "East"
  }'
```
```json
{"predicted_price": 9347014.91}
```

An unrecognized `location` is automatically grouped into `"other"` (matching how the model was trained), rather than erroring.

## Model Metrics

Trained on an 80/20 split (~134K train / ~34K test rows) of the cleaned dataset (~167K rows after removing unusable prices and price-per-sqft outliers below the 1st / above the 99th percentile).

| Model | MAE (₹) | RMSE (₹) | R² |
|---|---:|---:|---:|
| Ridge Regression (baseline) | 3,840,349 | 10,080,218 | 0.285 |
| **Random Forest (chosen)** | **1,016,171** | **3,436,521** | **0.917** |

5-fold cross-validation on the Random Forest (training set): mean R² = **0.919** (fold scores: 0.9245, 0.9222, 0.9188, 0.9163, 0.9150), confirming the held-out performance is stable and not a lucky split.

**Why Random Forest:** the relationship between features like area, location, and price is non-linear and involves interactions (e.g. the effect of extra area on price differs a lot by location), which the Random Forest captures and the linear baseline cannot. Both models were trained on `log1p(price)` — price is heavily right-skewed — via `sklearn.compose.TransformedTargetRegressor`, so `.predict()` returns real, positive prices directly.

## Screenshots

_Add screenshots of your running app here (form and result page) once you've verified the full flow locally._

## Verifying the Full Flow

1. Start the backend (`uvicorn app.main:app --reload`, port 8000).
2. Start the frontend (`npm run dev`, port 5173).
3. Open `http://localhost:5173`, fill in the form, submit, and confirm you see a predicted price on the result page.
