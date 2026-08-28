import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { predictPrice, PredictionApiError } from "../api/predictionClient";
import type { PredictionRequest } from "../types/prediction";

const FURNISHING_OPTIONS = ["Furnished", "Semi-Furnished", "Unfurnished"] as const;
const TRANSACTION_OPTIONS = ["New Property", "Resale"] as const;
const OWNERSHIP_OPTIONS = ["Freehold", "Leasehold", "Co-operative Society", "Power Of Attorney"];
const FACING_OPTIONS = [
  "East",
  "West",
  "North",
  "South",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];

const initialForm = {
  location: "",
  carpet_area_sqft: "",
  floor_num: "",
  bathroom: "",
  balcony: "",
  furnishing: FURNISHING_OPTIONS[1],
  transaction: TRANSACTION_OPTIONS[1],
  ownership: OWNERSHIP_OPTIONS[0],
  facing: FACING_OPTIONS[0],
};

export function PredictionForm() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<string[]>([]);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/locations.json")
      .then((res) => res.json())
      .then((data: string[]) => setLocations(data))
      .catch(() => setLocations([]));
  }, []);

  function handleChange(field: keyof typeof initialForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!form.location) next.location = "Please choose a location.";
    if (!form.carpet_area_sqft || Number(form.carpet_area_sqft) <= 0) {
      next.carpet_area_sqft = "Area must be greater than 0.";
    }
    if (form.floor_num === "") next.floor_num = "Floor is required.";
    if (form.bathroom === "" || Number(form.bathroom) < 0) {
      next.bathroom = "Bathrooms must be 0 or more.";
    }
    if (form.balcony === "" || Number(form.balcony) < 0) {
      next.balcony = "Balconies must be 0 or more.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    const payload: PredictionRequest = {
      location: form.location,
      carpet_area_sqft: Number(form.carpet_area_sqft),
      floor_num: Number(form.floor_num),
      bathroom: Number(form.bathroom),
      balcony: Number(form.balcony),
      furnishing: form.furnishing as PredictionRequest["furnishing"],
      transaction: form.transaction as PredictionRequest["transaction"],
      ownership: form.ownership,
      facing: form.facing,
    };

    setLoading(true);
    try {
      const result = await predictPrice(payload);
      navigate("/result", { state: { predictedPrice: result.predicted_price } });
    } catch (err) {
      const message =
        err instanceof PredictionApiError ? err.message : "Something went wrong. Please try again.";
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="prediction-form" noValidate>
      <div className="field">
        <label htmlFor="location">Location</label>
        <select
          id="location"
          value={form.location}
          onChange={(e) => handleChange("location", e.target.value)}
        >
          <option value="">Select a location…</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
        {errors.location && <span className="error">{errors.location}</span>}
      </div>

      <div className="field">
        <label htmlFor="carpet_area_sqft">Carpet area (sqft)</label>
        <input
          id="carpet_area_sqft"
          type="number"
          min="1"
          value={form.carpet_area_sqft}
          onChange={(e) => handleChange("carpet_area_sqft", e.target.value)}
        />
        {errors.carpet_area_sqft && <span className="error">{errors.carpet_area_sqft}</span>}
      </div>

      <div className="field">
        <label htmlFor="floor_num">Floor number</label>
        <input
          id="floor_num"
          type="number"
          value={form.floor_num}
          onChange={(e) => handleChange("floor_num", e.target.value)}
        />
        {errors.floor_num && <span className="error">{errors.floor_num}</span>}
      </div>

      <div className="field">
        <label htmlFor="bathroom">Bathrooms</label>
        <input
          id="bathroom"
          type="number"
          min="0"
          value={form.bathroom}
          onChange={(e) => handleChange("bathroom", e.target.value)}
        />
        {errors.bathroom && <span className="error">{errors.bathroom}</span>}
      </div>

      <div className="field">
        <label htmlFor="balcony">Balconies</label>
        <input
          id="balcony"
          type="number"
          min="0"
          value={form.balcony}
          onChange={(e) => handleChange("balcony", e.target.value)}
        />
        {errors.balcony && <span className="error">{errors.balcony}</span>}
      </div>

      <div className="field">
        <label htmlFor="furnishing">Furnishing</label>
        <select
          id="furnishing"
          value={form.furnishing}
          onChange={(e) => handleChange("furnishing", e.target.value)}
        >
          {FURNISHING_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="transaction">Transaction</label>
        <select
          id="transaction"
          value={form.transaction}
          onChange={(e) => handleChange("transaction", e.target.value)}
        >
          {TRANSACTION_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="ownership">Ownership</label>
        <select
          id="ownership"
          value={form.ownership}
          onChange={(e) => handleChange("ownership", e.target.value)}
        >
          {OWNERSHIP_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="facing">Facing</label>
        <select id="facing" value={form.facing} onChange={(e) => handleChange("facing", e.target.value)}>
          {FACING_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {submitError && <p className="error submit-error">{submitError}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Predicting…" : "Predict price"}
      </button>
    </form>
  );
}
