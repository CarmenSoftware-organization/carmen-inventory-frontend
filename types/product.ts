export type ProductStatusType = "active" | "inactive";

export interface ProductInfoItem {
  label: string;
  value: string;
  data_type: string;
}

export interface ProductInfo {
  product_item_group_id: string;
  is_used_in_recipe: boolean;
  is_sold_directly: boolean;
  barcode: string;
  sku: string;
  price_deviation_limit: number | null;
  qty_deviation_limit: number | null;
  info: ProductInfoItem[];
}

export interface ProductUnitConversion {
  id?: string;
  from_unit_id: string;
  from_unit_qty: number;
  to_unit_id: string;
  to_unit_qty: number;
  description: string;
  is_default: boolean;
  is_active: boolean;
}

export interface ProductLocationItem {
  id?: string;
  location_id: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  local_name: string;
  product_status_type: ProductStatusType;
  inventory_unit_id: string;
  inventory_unit_name: string;
  product_item_group: { name: string } | null;
  product_sub_category: { name: string } | null;
  product_category: { name: string } | null;
  created_at: string;
  updated_at: string;
}

export interface ProductDetail extends Product {
  description: string;
  tax_profile_id: string;
  product_info: ProductInfo;
  locations: ProductLocationItem[];
  order_units: ProductUnitConversion[];
  ingredient_units: ProductUnitConversion[];
}
