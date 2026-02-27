import { ProductStatusType } from "./product";

export interface PurchaseOrderDetail {
  id: string;
  sequence: number;
  product_id: string;
  product_name: string;
  product_local_name: string;
  order_unit_id: string;
  order_unit_name: string;
  order_unit_conversion_factor: number;
  order_qty: number;
  base_unit_id: string;
  base_unit_name: string;
  base_qty: number;
  price: number;
  sub_total_price: number;
  net_amount: number;
  total_price: number;
  tax_profile_id: string;
  tax_profile_name: string;
  tax_rate: number;
  tax_amount: number;
  is_tax_adjustment: boolean;
  discount_rate: number;
  discount_amount: number;
  is_discount_adjustment: boolean;
  is_foc: boolean;
  description: string;
  note: string;
}

export interface PoDetailPayload {
  sequence: number;
  product_id: string;
  product_name: string;
  product_local_name: string;
  order_unit_id: string;
  order_unit_name: string;
  order_unit_conversion_factor: number;
  order_qty: number;
  base_unit_id: string;
  base_unit_name: string;
  base_qty: number;
  price: number;
  sub_total_price: number;
  net_amount: number;
  total_price: number;
  tax_profile_id: string | null;
  tax_profile_name: string;
  tax_rate: number;
  tax_amount: number;
  is_tax_adjustment: boolean;
  discount_rate: number;
  discount_amount: number;
  is_discount_adjustment: boolean;
  is_foc: boolean;
  description: string;
  note: string;
}

export interface CreatePoDto {
  vendor_id: string;
  vendor_name: string;
  delivery_date: string;
  currency_id: string;
  currency_name: string;
  exchange_rate: number;
  description: string;
  order_date: string;
  credit_term_id: string;
  credit_term_name: string;
  credit_term_value: number;
  buyer_id: string;
  buyer_name: string;
  email: string;
  remarks: string;
  note: string;
  details: {
    add?: PoDetailPayload[];
    update?: (PoDetailPayload & { id: string })[];
    remove?: { id: string }[];
  };
}

export interface PurchaseOrder {
  id: string;
  po_no: string;
  vendor_id: string;
  vendor_name: string;
  delivery_date: string;
  currency_id: string;
  currency_name: string;
  exchange_rate: number;
  description: string;
  order_date: string;
  credit_term_id: string;
  credit_term_name: string;
  credit_term_value: number;
  buyer_id: string;
  buyer_name: string;
  email: string;
  remarks: string;
  note: string;
  total_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  details: PurchaseOrderDetail[];
}

export interface ProductOnPo {
  id: string;
  code: string;
  name: string;
  local_name: string;
  product_status_type: ProductStatusType;
  inventory_unit_id: string;
  inventory_unit_name: string;
  product_item_group: { id?: string; name: string } | null;
  product_sub_category: { id?: string; name: string } | null;
  product_category: { id?: string; name: string } | null;
  created_at: string;
  updated_at: string;
}
