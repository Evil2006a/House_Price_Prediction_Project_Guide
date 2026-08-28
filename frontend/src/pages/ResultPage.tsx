import { Link, useLocation, Navigate } from "react-router-dom";

function formatIndianPrice(value: number): string {
  if (value >= 1e7) return `₹ ${(value / 1e7).toFixed(2)} Cr`;
  if (value >= 1e5) return `₹ ${(value / 1e5).toFixed(1)} Lac`;
  return `₹ ${value.toLocaleString("en-IN")}`;
}

export function ResultPage() {
  const location = useLocation();
  const predictedPrice = (location.state as { predictedPrice?: number } | null)?.predictedPrice;

  if (predictedPrice === undefined) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="page">
      <h1>Predicted Price</h1>
      <p className="predicted-price">{formatIndianPrice(predictedPrice)}</p>
      <Link to="/">Predict another property</Link>
    </main>
  );
}
