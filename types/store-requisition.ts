export type StoreRequisitionStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected";

export interface StoreRequisitionDetail {
  id: string;
  sequence_no: number;
  product_id: string;
  product_name: string;
  product_local_name: string;
  description: string;
  requested_qty: number;
  approved_qty: number;
  issued_qty: number;
  current_stage_status: string;
  info: Record<string, unknown>;
  dimension: string;
  doc_version: number;
}

export interface StoreRequisition {
  id: string;
  sr_no: string;
  sr_date: string;
  expected_date: string;
  description: string;
  doc_status: StoreRequisitionStatus;
  workflow_id: string;
  workflow_name: string;
  requestor_id: string;
  requestor_name: string;
  department_id: string;
  department_code: string;
  department_name: string;
  from_location_id: string;
  from_location_code: string;
  from_location_name: string;
  to_location_id: string;
  to_location_code: string;
  to_location_name: string;
  store_requisition_detail: StoreRequisitionDetail[];
  info: Record<string, unknown>;
  dimension: string;
  doc_version: number;
  created_at: string;
  updated_at: string;
}
