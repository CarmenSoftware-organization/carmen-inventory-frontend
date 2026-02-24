export type SpotCheckMethod = "random" | "manual";

export interface SpotCheckProduct {
  product_id: string;
}

export interface CreateSpotCheckDto {
  location_id: string;
  method: SpotCheckMethod;
  product_count?: number;
  products?: SpotCheckProduct[];
  description?: string;
  note?: string;
}

export interface SpotCheck {
  id: string;
  location_id: string;
  location_name: string;
  method: SpotCheckMethod;
  product_count?: number;
  products?: SpotCheckProduct[];
  description: string;
  note: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
