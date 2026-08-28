export interface PredictionRequest {
  location: string;
  carpet_area_sqft: number;
  floor_num: number;
  bathroom: number;
  balcony: number;
  furnishing: string;
  transaction: string;
  ownership: string;
  facing: string;
}

export interface PredictionResponse {
  predicted_price: number;
}

export const FURNISHING_OPTIONS = ["Unfurnished", "Semi-Furnished", "Furnished"] as const;
export const TRANSACTION_OPTIONS = ["Resale", "New Property", "Other", "Rent/Lease"] as const;
export const OWNERSHIP_OPTIONS = [
  "Freehold",
  "Co-operative Society",
  "Power Of Attorney",
  "Leasehold",
] as const;
export const FACING_OPTIONS = [
  "East",
  "West",
  "North",
  "South",
  "North - East",
  "North - West",
  "South - East",
  "South -West",
] as const;
