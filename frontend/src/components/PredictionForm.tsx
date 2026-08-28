import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLocations, predictPrice, ApiError } from "../api/predictionClient";
import {
  FACING_OPTIONS,
  FURNISHING_OPTIONS,
  OWNERSHIP_OPTIONS,
  TRANSACTION_OPTIONS,
  type PredictionRequest,
} from "../types/prediction";

const initialForm: PredictionRequest = {
  location: "",
  carpet_area_sqft: 0,
  floor_num: 0,
  bathroom: 1,
  balcony: 0,
  furnishing: FURNISHING_OPTIONS[0],
  transaction: TRANSACTION_OPTIONS[0],
  ownership: OWNERSHIP_OPTIONS[0],
  facing: FACING_OPTIONS[0],
};

export default function PredictionForm() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<string[]>([]);
  const [locationsError, setLocationsError] = useState<string | null>(null);
  const [form, setForm] = useState<PredictionRequest>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLocations()
      .then((locs) => setLocations(locs))
      .catch(() => setLocationsError("Could not load locations. You can still type one manually."));
  }, []);

  function update<K extends keyof PredictionRequest>(key: K, value: PredictionRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!form.location.trim()) errors.location = "Location is required.";
    if (!form.carpet_area_sqft || form.carpet_area_sqft <= 0) {
      errors.carpet_area_sqft = "Carpet area must be greater than 0.";
    }
    if (form.bathroom < 0) errors.bathroom = "Bathrooms cannot be negative.";
    if (form.balcony < 0) errors.balcony = "Balconies cannot be negative.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await predictPrice(form);
      navigate("/result", { state: { predictedPrice: result.predicted_price, form } });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="prediction-form">
      <div className="form-field">
        <label htmlFor="location">Location</label>
        <input
          id="location"
          list="location-options"
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
          placeholder="e.g. thane"
        />
        {locations.length > 0 && (
          <datalist id="location-options">
            {locations.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
        )}
        {locationsError && <p className="hint">{locationsError}</p>}
        {fieldErrors.location && <p className="error">{fieldErrors.location}</p>}
      </div>

      <div className="form-field">
        <label htmlFor="carpet_area_sqft">Carpet area (sqft)</label>
        <input
          id="carpet_area_sqft"
          type="number"
          min={1}
          value={form.carpet_area_sqft || ""}
          onChange={(e) => update("carpet_area_sqft", Number(e.target.value))}
        />
        {fieldErrors.carpet_area_sqft && <p className="error">{fieldErrors.carpet_area_sqft}</p>}
      </div>

      <div className="form-field">
        <label htmlFor="floor_num">Floor number (0 = Ground, -1 = Basement)</label>
        <input
          id="floor_num"
          type="number"
          value={form.floor_num}
          onChange={(e) => update("floor_num", Number(e.target.value))}
        />
      </div>

      <div className="form-field">
        <label htmlFor="bathroom">Bathrooms</label>
        <input
          id="bathroom"
          type="number"
          min={0}
          value={form.bathroom}
          onChange={(e) => update("bathroom", Number(e.target.value))}
        />
        {fieldErrors.bathroom && <p className="error">{fieldErrors.bathroom}</p>}
      </div>

      <div className="form-field">
        <label htmlFor="balcony">Balconies</label>
        <input
          id="balcony"
          type="number"
          min={0}
          value={form.balcony}
          onChange={(e) => update("balcony", Number(e.target.value))}
        />
        {fieldErrors.balcony && <p className="error">{fieldErrors.balcony}</p>}
      </div>

      <div className="form-field">
        <label htmlFor="furnishing">Furnishing</label>
        <select
          id="furnishing"
          value={form.furnishing}
          onChange={(e) => update("furnishing", e.target.value)}
        >
          {FURNISHING_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="transaction">Transaction type</label>
        <select
          id="transaction"
          value={form.transaction}
          onChange={(e) => update("transaction", e.target.value)}
        >
          {TRANSACTION_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="ownership">Ownership</label>
        <select
          id="ownership"
          value={form.ownership}
          onChange={(e) => update("ownership", e.target.value)}
        >
          {OWNERSHIP_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="facing">Facing</label>
        <select id="facing" value={form.facing} onChange={(e) => update("facing", e.target.value)}>
          {FACING_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {submitError && <p className="error submit-error">{submitError}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Predicting…" : "Predict Price"}
      </button>
    </form>
  );
}
