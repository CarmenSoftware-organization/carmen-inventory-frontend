export type PriceListStatus = "draft" | "active" | "inactive";

export interface PriceListDetailItem {
  id: string;
  sequence_no: number;
  product_id: string;
  product_name: string;
  unit_id: string;
  unit_name: string | null;
  moq_qty: number;
  price: number;
  price_wirhout_tax: number;
  tax_profile_id: string;
  tax_profile: { rate: number };
  tax_amt: number;
  lead_time_days: number;
  is_active: boolean;
  note: string | null;
  info: Record<string, unknown>;
}

export interface PriceList {
  id: string;
  no: string;
  name: string;
  status: PriceListStatus;
  description: string;
  vendor: { id: string; name: string };
  currency: { id: string; name: string };
  effectivePeriod: string;
  note: string;
  pricelist_detail: PriceListDetailItem[];
}
