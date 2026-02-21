// --- Workflow ---

export interface WorkflowHistoryEntry {
  status: string;
  timestamp: string;
  user: string;
}

// --- Detail Item ---

export interface GoodsReceiveNoteDetail {
  id: string;
  product_id: string;
  purchase_order_detail_id: string | null;
  product_name: string;
  requested_qty: number;
  approved_qty: number;
  price: number;
  total_price: number;
  price_without_vat: number;
  price_with_vat: number;
  base_price: number;
  base_total_price: number;
  extra_cost: number;
  total_cost: number;
  location_id: string | null;
  location_name: string;
  requested_unit_id: string | null;
  requested_unit_name: string;
  approved_unit_id: string | null;
  approved_unit_name: string;
  requested_base_qty: number;
  requested_base_unit_id: string | null;
  requested_base_unit_name: string;
  approved_base_qty: number;
  approved_base_unit_id: string | null;
  approved_base_unit_name: string;
  foc_qty: number;
  foc_unit_id: string | null;
  foc_unit_name: string;
  foc_base_qty: number;
  foc_base_unit_id: string | null;
  foc_base_unit_name: string;
  foc_unit_conversion_rate: number;
  foc_base_unit_conversion_rate: number;
  inventory_unit_id: string | null;
  inventory_unit_name: string;
  inventory_unit_qty: number;
  inventory_unit_conversion_rate: number;
  requested_unit_conversion_rate: number;
  approved_unit_conversion_rate: number;
  unit_id: string | null;
  unit_name: string;
  order_qty: number;
  order_unit_id: string | null;
  order_unit_name: string;
  order_unit_conversion_rate: number;
  order_base_qty: number;
  order_base_unit_id: string | null;
  order_base_unit_name: string;
  received_qty: number;
  received_unit_id: string | null;
  received_unit_name: string;
  received_unit_conversion_rate: number;
  received_base_unit_conversion_rate: number;
  received_base_qty: number;
  received_base_unit_id: string | null;
  received_base_unit_name: string;
  base_qty: number;
  return_qty: number;
  return_unit_id: string | null;
  return_unit_name: string;
  return_conversion_rate: number;
  return_base_qty: number;
  tax_profile_id: string | null;
  tax_profile_name: string;
  tax_rate: number;
  tax_amount: number;
  is_tax_adjustment: boolean;
  base_tax_amount: number;
  total_amount: number;
  delivery_date: string | null;
  delivery_date_id: string | null;
  delivery_point_id: string | null;
  delivery_point_name: string;
}

// --- Extra Cost ---

export interface ExtraCostDetailItem {
  id?: string;
  extra_cost_type_id: string;
  note: string;
  info: Record<string, unknown> | null;
  dimension: Record<string, unknown> | null;
  amount: number;
  tax_profile_id: string | null;
  tax_profile_name: string;
  tax_rate: number;
  tax_amount: number;
  is_tax_adjustment: boolean;
  base_tax_amount: number;
  total_amount: number;
  tax_type: string;
}

export interface GrnExtraCost {
  note: string;
  info: Record<string, unknown> | null;
  dimension: Record<string, unknown> | null;
  name: string;
  allocate_extracost_type: string;
  extra_cost_detail: ExtraCostDetailItem[];
}

// --- Main GRN ---

export interface GoodsReceiveNote {
  id: string;
  grn_date: string | null;
  expired_date: string | null;
  invoice_no: string | null;
  invoice_date: string | null;
  description: string | null;
  note: string | null;
  doc_status: string;
  doc_type: string;
  is_consignment: boolean;
  is_cash: boolean;
  signature_image_url: string | null;
  received_by_id: string | null;
  received_by_name: string | null;
  received_at: string | null;
  credit_term_id: string | null;
  credit_term_name: string | null;
  credit_term_days: number | null;
  payment_due_date: string | null;
  is_active: boolean;
  vendor_id: string;
  vendor_name: string;
  approved_unit_conversion_factor: number | null;
  requested_unit_conversion_factor: number | null;
  currency_id: string | null;
  currency_name: string | null;
  exchange_rate: number | null;
  exchange_rate_date: string | null;
  discount_rate: number | null;
  discount_amount: number | null;
  is_discount_adjustment: boolean;
  base_discount_amount: number | null;
  info: Record<string, unknown> | null;
  dimension: Record<string, unknown> | null;
  // Workflow
  workflow_id: string | null;
  workflow_name: string | null;
  current_workflow_status: string | null;
  workflow_next_stage: string | null;
  workflow_previous_stage: string | null;
  workflow_current_stage: string | null;
  workflow_history: WorkflowHistoryEntry[];
  // Action
  user_action: Record<string, unknown> | null;
  last_action_date_at: string | null;
  last_action_by_id: string | null;
  last_action_by_name: string | null;
  last_action_name: string | null;
  // Audit
  created_at: string;
  created_by_id: string | null;
  update_by_id: string | null;
  updated_at: string;
  deleted_at: string | null;
  deleted_by_id: string | null;
  // Extra cost
  extra_cost: GrnExtraCost | null;
  // Detail items
  good_received_note_detail: GoodsReceiveNoteDetail[];
}

// --- Payloads ---

export interface GrnDetailPayload {
  product_id: string;
  purchase_order_detail_id?: string | null;
  product_name: string;
  requested_qty: number;
  approved_qty: number;
  price: number;
  total_price: number;
  price_without_vat: number;
  price_with_vat: number;
  base_price: number;
  base_total_price: number;
  extra_cost: number;
  total_cost: number;
  location_id: string | null;
  location_name: string;
  requested_unit_id: string | null;
  requested_unit_name: string;
  approved_unit_id: string | null;
  approved_unit_name: string;
  requested_base_qty: number;
  requested_base_unit_id: string | null;
  requested_base_unit_name: string;
  approved_base_qty: number;
  approved_base_unit_id: string | null;
  approved_base_unit_name: string;
  foc_qty: number;
  foc_unit_id: string | null;
  foc_unit_name: string;
  foc_base_qty: number;
  foc_base_unit_id: string | null;
  foc_base_unit_name: string;
  foc_unit_conversion_rate: number;
  foc_base_unit_conversion_rate: number;
  inventory_unit_id: string | null;
  inventory_unit_name: string;
  inventory_unit_qty: number;
  inventory_unit_conversion_rate: number;
  requested_unit_conversion_rate: number;
  approved_unit_conversion_rate: number;
  unit_id: string | null;
  unit_name: string;
  order_qty: number;
  order_unit_id: string | null;
  order_unit_name: string;
  order_unit_conversion_rate: number;
  order_base_qty: number;
  order_base_unit_id: string | null;
  order_base_unit_name: string;
  received_qty: number;
  received_unit_id: string | null;
  received_unit_name: string;
  received_unit_conversion_rate: number;
  received_base_unit_conversion_rate: number;
  received_base_qty: number;
  received_base_unit_id: string | null;
  received_base_unit_name: string;
  base_qty: number;
  return_qty: number;
  return_unit_id: string | null;
  return_unit_name: string;
  return_conversion_rate: number;
  return_base_qty: number;
  tax_profile_id: string | null;
  tax_profile_name: string;
  tax_rate: number;
  tax_amount: number;
  is_tax_adjustment: boolean;
  base_tax_amount: number;
  total_amount: number;
  delivery_date: string | null;
  delivery_date_id: string | null;
  delivery_point_id: string | null;
  delivery_point_name: string;
}

export interface ExtraCostDetailPayload {
  extra_cost_type_id: string;
  note: string;
  info: Record<string, unknown> | null;
  dimension: Record<string, unknown> | null;
  amount: number;
  tax_profile_id: string | null;
  tax_profile_name: string;
  tax_rate: number;
  tax_amount: number;
  is_tax_adjustment: boolean;
  base_tax_amount: number;
  total_amount: number;
  tax_type: string;
}

export interface CreateGrnDto {
  grn_date: string | null;
  expired_date?: string | null;
  invoice_no?: string | null;
  invoice_date?: string | null;
  description?: string | null;
  note?: string | null;
  doc_status: string;
  doc_type: string;
  is_consignment: boolean;
  is_cash: boolean;
  signature_image_url?: string | null;
  received_by_id?: string | null;
  received_by_name?: string | null;
  received_at?: string | null;
  credit_term_id?: string | null;
  credit_term_name?: string | null;
  credit_term_days?: number | null;
  payment_due_date?: string | null;
  is_active: boolean;
  vendor_id: string;
  vendor_name?: string;
  approved_unit_conversion_factor?: number | null;
  requested_unit_conversion_factor?: number | null;
  currency_id?: string | null;
  currency_name?: string | null;
  exchange_rate?: number | null;
  exchange_rate_date?: string | null;
  discount_rate?: number | null;
  discount_amount?: number | null;
  is_discount_adjustment?: boolean;
  base_discount_amount?: number | null;
  info?: Record<string, unknown> | null;
  dimension?: Record<string, unknown> | null;
  good_received_note_detail: {
    add?: GrnDetailPayload[];
    update?: (GrnDetailPayload & { id: string })[];
    remove?: { id: string }[];
  };
  extra_cost?: {
    note?: string;
    info?: Record<string, unknown> | null;
    dimension?: Record<string, unknown> | null;
    name?: string;
    allocate_extracost_type?: string;
    extra_cost_detail?: {
      add?: ExtraCostDetailPayload[];
      update?: (ExtraCostDetailPayload & { id: string })[];
      remove?: { id: string }[];
    };
  };
}
