import PredictionForm from "../components/PredictionForm";

export default function HomePage() {
  return (
    <div className="page">
      <h1>House Price Predictor</h1>
      <p className="subtitle">Enter property details to get an estimated price.</p>
      <PredictionForm />
    </div>
  );
}
