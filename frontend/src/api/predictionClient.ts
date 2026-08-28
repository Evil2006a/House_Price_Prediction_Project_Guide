import type { PredictionRequest, PredictionResponse } from "../types/prediction";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export class PredictionApiError extends Error {}

export async function predictPrice(payload: PredictionRequest): Promise<PredictionResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new PredictionApiError("Could not reach the prediction server. Is the backend running?");
  }

  if (!response.ok) {
    throw new PredictionApiError(`Prediction failed (status ${response.status}).`);
  }

  return (await response.json()) as PredictionResponse;
}
