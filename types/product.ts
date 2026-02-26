import { z } from "zod";
import type { UseFormReturn } from "react-hook-form";

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
  price: number | null;
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
  product_item_group: { id?: string; name: string } | null;
  product_sub_category: { id?: string; name: string } | null;
  product_category: { id?: string; name: string } | null;
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

/* ------------------------------------------------------------------ */
/* Attribute label options (Section 4.3)                              */
/* ------------------------------------------------------------------ */

export const PRODUCT_ATTRIBUTE_LABELS = [
  "allergens",
  "calories",
  "serving_size",
  "storage",
  "shelf_life",
  "brand",
  "color",
  "size",
  "weight",
  "dimensions",
  "material",
  "country_of_origin",
  "voltage",
  "wattage",
  "warranty",
] as const;

/* ------------------------------------------------------------------ */
/* Zod schema                                                         */
/* ------------------------------------------------------------------ */

const unitConversionSchema = z.object({
  id: z.string().optional(),
  from_unit_id: z.string(),
  from_unit_qty: z.coerce.number().min(1, "Must be >= 1"),
  to_unit_id: z.string(),
  to_unit_qty: z.coerce.number().min(1, "Must be >= 1"),
  description: z.string(),
  is_default: z.boolean(),
  is_active: z.boolean(),
});

const locationSchema = z.object({
  id: z.string().optional(),
  location_id: z.string().min(1, "Location is required"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required").max(10),
  local_name: z.string().min(1, "Local name is required").max(100),
  description: z.string().max(256).optional().or(z.literal("")),
  inventory_unit_id: z.string().min(1, "Inventory unit is required"),
  product_item_group_id: z.string().min(1, "Item group is required"),
  product_status_type: z.enum(["active", "inactive"]),
  tax_profile_id: z.string(),
  is_used_in_recipe: z.boolean(),
  is_sold_directly: z.boolean(),
  barcode: z
    .string()
    .refine((v) => v === "" || (v.length >= 6 && v.length <= 100), {
      message: "Barcode must be 6-100 characters",
    }),
  sku: z.string(),
  price: z.coerce.number().min(0).nullable(),
  price_deviation_limit: z.coerce.number().min(0).max(100).nullable(),
  qty_deviation_limit: z.coerce.number().min(0).max(100).nullable(),
  info: z.array(
    z.object({
      label: z.string().min(1, "Label is required"),
      value: z.string(),
      data_type: z.string(),
    }),
  ),
  locations: z.array(locationSchema),
  order_units: z.array(unitConversionSchema),
  ingredient_units: z.array(unitConversionSchema),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type ProductFormInstance = UseFormReturn<ProductFormValues>;
