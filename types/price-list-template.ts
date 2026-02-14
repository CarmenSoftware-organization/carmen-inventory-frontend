export type PriceListTemplateStatus = "draft" | "active" | "inactive";

export interface PriceListTemplateMoq {
  qty: number;
  note: string;
  unit_id: string;
  unit_name: string;
}

export interface PriceListTemplateProduct {
  id: string;
  product_id: string;
  product_name: string;
  code: string;
  default_order: {
    unit_id: string;
    unit_name: string;
  };
  moq: PriceListTemplateMoq[];
}

export interface PriceListTemplate {
  id: string;
  name: string;
  description: string;
  note: string | null;
  status: PriceListTemplateStatus;
  validity_period: number | null;
  vendor_instructions: string | null;
  currency: { id: string; code: string };
  products: PriceListTemplateProduct[];
  created_at: string;
  updated_at: string;
}
