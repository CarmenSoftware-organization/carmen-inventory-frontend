import { z } from "zod";
import type { PurchaseOrder } from "@/types/purchase-order";
import type { PoDetailPayload } from "@/hooks/use-purchase-order";

export const poDetailSchema = z.object({
  id: z.string().optional(),
  product_id: z
    .string()
    .nullable()
    .refine((v) => !!v, "Product is required"),
  product_name: z.string(),
  product_local_name: z.string(),
  order_unit_id: z.string().nullable(),
  order_unit_name: z.string(),
  order_unit_conversion_factor: z.coerce.number(),
  order_qty: z.coerce.number().min(1, "Quantity must be at least 1"),
  base_unit_id: z.string().nullable(),
  base_unit_name: z.string(),
  base_qty: z.coerce.number(),
  price: z.coerce.number().min(0),
  sub_total_price: z.coerce.number(),
  net_amount: z.coerce.number(),
  total_price: z.coerce.number(),
  tax_profile_id: z.string().nullable().optional(),
  tax_profile_name: z.string().optional(),
  tax_rate: z.coerce.number().optional(),
  tax_amount: z.coerce.number().optional(),
  is_tax_adjustment: z.boolean().optional(),
  discount_rate: z.coerce.number().optional(),
  discount_amount: z.coerce.number().optional(),
  is_discount_adjustment: z.boolean().optional(),
  is_foc: z.boolean(),
  description: z.string(),
  note: z.string(),
});

export const poSchema = z.object({
  vendor_id: z.string().min(1, "Vendor is required"),
  vendor_name: z.string(),
  delivery_date: z.string().min(1, "Delivery date is required"),
  currency_id: z.string().min(1, "Currency is required"),
  currency_name: z.string(),
  exchange_rate: z.coerce.number().min(0),
  description: z.string(),
  order_date: z.string().min(1, "Order date is required"),
  credit_term_id: z.string(),
  credit_term_name: z.string(),
  credit_term_value: z.coerce.number(),
  buyer_id: z.string(),
  buyer_name: z.string(),
  email: z.string(),
  remarks: z.string(),
  note: z.string(),
  items: z.array(poDetailSchema),
});

export type PoFormValues = z.infer<typeof poSchema>;

// --- Defaults ---

export const PO_ITEM = {
  product_id: null,
  product_name: "",
  product_local_name: "",
  order_unit_id: null,
  order_unit_name: "",
  order_unit_conversion_factor: 1,
  order_qty: 1,
  base_unit_id: null,
  base_unit_name: "",
  base_qty: 1,
  price: 0,
  sub_total_price: 0,
  net_amount: 0,
  total_price: 0,
  tax_profile_id: null,
  tax_profile_name: "",
  tax_rate: 0,
  tax_amount: 0,
  is_tax_adjustment: false,
  discount_rate: 0,
  discount_amount: 0,
  is_discount_adjustment: false,
  is_foc: false,
  description: "",
  note: "",
} as const;

export const EMPTY_FORM: PoFormValues = {
  vendor_id: "",
  vendor_name: "",
  delivery_date: "",
  currency_id: "",
  currency_name: "",
  exchange_rate: 1,
  description: "",
  order_date: new Date().toISOString(),
  credit_term_id: "",
  credit_term_name: "",
  credit_term_value: 0,
  buyer_id: "",
  buyer_name: "",
  email: "",
  remarks: "",
  note: "",
  items: [],
};

// --- Helpers ---

export function getDefaultValues(po?: PurchaseOrder): PoFormValues {
  if (po) {
    return {
      vendor_id: po.vendor_id ?? "",
      vendor_name: po.vendor_name ?? "",
      delivery_date: po.delivery_date ?? "",
      currency_id: po.currency_id ?? "",
      currency_name: po.currency_name ?? "",
      exchange_rate: po.exchange_rate ?? 1,
      description: po.description ?? "",
      order_date: po.order_date ?? "",
      credit_term_id: po.credit_term_id ?? "",
      credit_term_name: po.credit_term_name ?? "",
      credit_term_value: po.credit_term_value ?? 0,
      buyer_id: po.buyer_id ?? "",
      buyer_name: po.buyer_name ?? "",
      email: po.email ?? "",
      remarks: po.remarks ?? "",
      note: po.note ?? "",
      items:
        po.details?.map((d) => ({
          id: d.id,
          product_id: d.product_id,
          product_name: d.product_name,
          product_local_name: d.product_local_name ?? "",
          order_unit_id: d.order_unit_id ?? null,
          order_unit_name: d.order_unit_name ?? "",
          order_unit_conversion_factor: d.order_unit_conversion_factor ?? 1,
          order_qty: d.order_qty,
          base_unit_id: d.base_unit_id ?? null,
          base_unit_name: d.base_unit_name ?? "",
          base_qty: d.base_qty ?? d.order_qty,
          price: d.price ?? 0,
          sub_total_price: d.sub_total_price ?? 0,
          net_amount: d.net_amount ?? 0,
          total_price: d.total_price ?? 0,
          tax_profile_id: d.tax_profile_id ?? null,
          tax_profile_name: d.tax_profile_name ?? "",
          tax_rate: d.tax_rate ?? 0,
          tax_amount: d.tax_amount ?? 0,
          is_tax_adjustment: d.is_tax_adjustment ?? false,
          discount_rate: d.discount_rate ?? 0,
          discount_amount: d.discount_amount ?? 0,
          is_discount_adjustment: d.is_discount_adjustment ?? false,
          is_foc: d.is_foc ?? false,
          description: d.description ?? "",
          note: d.note ?? "",
        })) ?? [],
    };
  }
  return EMPTY_FORM;
}

export function mapItemToPayload(
  item: PoFormValues["items"][number],
  index: number,
): PoDetailPayload {
  return {
    sequence: index + 1,
    product_id: item.product_id || "",
    product_name: item.product_name,
    product_local_name: item.product_local_name,
    order_unit_id: item.order_unit_id || "",
    order_unit_name: item.order_unit_name,
    order_unit_conversion_factor: item.order_unit_conversion_factor ?? 1,
    order_qty: item.order_qty,
    base_unit_id: item.base_unit_id || item.order_unit_id || "",
    base_unit_name: item.base_unit_name || item.order_unit_name,
    base_qty: item.base_qty ?? item.order_qty,
    price: item.price ?? 0,
    sub_total_price: item.sub_total_price ?? 0,
    net_amount: item.net_amount ?? 0,
    total_price: item.total_price ?? 0,
    tax_profile_id: item.tax_profile_id || null,
    tax_profile_name: item.tax_profile_name ?? "",
    tax_rate: item.tax_rate ?? 0,
    tax_amount: item.tax_amount ?? 0,
    is_tax_adjustment: item.is_tax_adjustment ?? false,
    discount_rate: item.discount_rate ?? 0,
    discount_amount: item.discount_amount ?? 0,
    is_discount_adjustment: item.is_discount_adjustment ?? false,
    is_foc: item.is_foc ?? false,
    description: item.description ?? "",
    note: item.note ?? "",
  };
}
