export type InventoryAdjustmentType = "stock-in" | "stock-out";
export type InventoryAdjustmentStatus = "in_progress" | "completed";

export interface InventoryAdjustmentDetail {
  id: string;
  product_id: string;
  product_name: string;
  product_local_name: string;
  location_id: string;
  location_code: string;
  location_name: string;
  qty: number;
  cost_per_unit: number;
  total_cost: number;
  description: string;
  note: string;
}

export interface InventoryAdjustment {
  id: string;
  si_no?: string;
  so_no?: string;
  document_no: string;
  description: string;
  doc_status: InventoryAdjustmentStatus;
  type: InventoryAdjustmentType;
  note?: string;
  adjustment_type?: string;
  details?: InventoryAdjustmentDetail[];
  created_at: string;
  updated_at: string;
}
