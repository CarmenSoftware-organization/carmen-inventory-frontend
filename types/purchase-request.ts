import { z } from "zod";

export type PurchaseRequestStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "in_progress"
  | "completed"
  | "voided";

export interface PurchaseRequestDetail {
  id: string;
  purchase_request_id: string;
  sequence_no: number;
  location_id: string;
  location_code: string;
  location_name: string;
  delivery_point_id: string;
  delivery_point_name: string;
  delivery_date: string | null;
  product_id: string;
  product_name: string;
  product_local_name: string | null;
  inventory_unit_id: string;
  inventory_unit_name: string;
  description: string | null;
  comment: string | null;
  vendor_id: string | null;
  vendor_name: string | null;
  pricelist_detail_id: string | null;
  pricelist_no: string | null;
  pricelist_unit: string | null;
  pricelist_price: number;
  pricelist_type: string;
  currency_id: string;
  currency_code: string | null;
  exchange_rate: number;
  exchange_rate_date: string | null;
  requested_qty: number;
  requested_unit_id: string;
  requested_unit_name: string;
  approved_qty: number;
  approved_unit_id: string;
  approved_unit_name: string;
  foc_qty: number;
  foc_unit_id: string;
  foc_unit_name: string;
  tax_profile_id: string | null;
  tax_profile_name: string | null;
  tax_rate: number;
  tax_amount: number;
  is_tax_adjustment: boolean;
  discount_rate: number;
  discount_amount: number;
  is_discount_adjustment: boolean;
  sub_total_price: number;
  net_amount: number;
  unit_price: number;
  total_price: number;
  state_status: string;
  state_message: string | null;
  current_stage_status: string;
  info: Record<string, unknown>;
  dimension: unknown[];
  doc_version: number;
  created_at: string;
  updated_at: string;
}

export interface PurchaseRequestTemplateDetail {
  id: string;
  purchase_request_template_id: string;
  location_id: string;
  location_code: string;
  location_name: string;
  delivery_point_id: string;
  delivery_point_name: string;
  product_id: string;
  product_name: string;
  product_local_name: string;
  inventory_unit_id: string;
  inventory_unit_name: string;
  description: string | null;
  comment: string | null;
  currency_id: string;
  currency_code: string | null;
  exchange_rate: number;
  exchange_rate_date: string | null;
  requested_qty: number;
  requested_unit_id: string;
  requested_unit_name: string;
  requested_unit_conversion_factor: number;
  requested_base_qty: number;
  foc_qty: number;
  foc_unit_id: string;
  foc_unit_name: string;
  foc_unit_conversion_factor: number;
  foc_base_qty: number;
  tax_profile_id: string | null;
  tax_profile_name: string | null;
  tax_rate: number;
  tax_amount: number;
  base_tax_amount: number;
  is_tax_adjustment: boolean;
  discount_rate: number;
  discount_amount: number;
  base_discount_amount: number;
  is_discount_adjustment: boolean;
  is_active: boolean;
  info: Record<string, unknown>;
  dimension: unknown[];
  doc_version: number;
  created_at: string;
  updated_at: string;
}

export interface PurchaseRequestTemplate {
  id: string;
  name: string;
  description: string;
  department_id: string;
  department_name: string;
  workflow_id: string;
  workflow_name: string;
  note: string;
  info: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  purchase_request_template_detail: PurchaseRequestTemplateDetail[];
}

export interface WorkflowHistoryEntry {
  user: { id: string; name: string };
  action: string;
  datetime: Record<string, unknown>;
  next_stage: string;
  current_stage?: string;
}

export interface PurchaseRequest {
  id: string;
  pr_no: string;
  pr_status: string;
  pr_date: string;
  expected_date: string;
  description: string;
  doc_status: PurchaseRequestStatus;
  role: string;
  workflow_id: string;
  workflow_name: string;
  workflow_current_stage: string;
  workflow_next_stage: string;
  workflow_previous_stage: string;
  workflow_history: WorkflowHistoryEntry[];
  requestor_id: string;
  requestor_name: string;
  department_id: string;
  department_code: string;
  department_name: string;
  vendor_id: string;
  vendor_code: string;
  vendor_name: string;
  purchase_request_detail: PurchaseRequestDetail[];
  info: Record<string, unknown>;
  dimension: string;
  doc_version: number;
  created_at: string;
  updated_at: string;
}

// --- Zod runtime validation schema (for list API response) ---
const purchaseRequestDetailSummarySchema = z.looseObject({
  price: z.number(),
  total_price: z.number(),
});

export const purchaseRequestSchema = z.looseObject({
  id: z.string(),
  pr_no: z.string(),
  pr_date: z.string(),
  description: z.string(),
  requestor_name: z.string(),
  pr_status: z.string(),
  workflow_name: z.string(),
  workflow_current_stage: z.string(),
  workflow_next_stage: z.string().nullable(),
  workflow_previous_stage: z.string().nullable(),
  last_action: z.string().nullable(),
  department_name: z.string(),
  created_at: z.string(),
  purchase_request_detail: z.array(purchaseRequestDetailSummarySchema),
});
