import { Link, useLocation, Navigate } from "react-router-dom";
import type { PredictionRequest } from "../types/prediction";

interface ResultState {
  predictedPrice: number;
  form: PredictionRequest;
}

function formatIndianPrice(price: number): string {
  if (price >= 1e7) return `₹ ${(price / 1e7).toFixed(2)} Cr`;
  if (price >= 1e5) return `₹ ${(price / 1e5).toFixed(2)} Lac`;
  return `₹ ${price.toLocaleString("en-IN")}`;
}

export default function ResultPage() {
  const location = useLocation();
  const state = location.state as ResultState | null;

  if (!state) {
    return <Navigate to="/" replace />;
  }

  const { predictedPrice, form } = state;

  return (
    <div className="page">
      <h1>Estimated Price</h1>
      <p className="predicted-price">{formatIndianPrice(predictedPrice)}</p>
      <p className="subtitle">
        {form.carpet_area_sqft} sqft in {form.location}, {form.bathroom} bath, {form.furnishing.toLowerCase()}
      </p>
      <Link to="/" className="back-link">
        ← Predict another property
      </Link>
    </div>
  );
}
