import { z } from "zod";
import type { PurchaseRequestTemplate } from "@/types/purchase-request";
import type { PrtDetailPayload } from "@/hooks/use-prt";

export const prtDetailSchema = z.object({
  id: z.string().optional(),
  location_id: z.string().nullable(),
  delivery_point_id: z.string().nullable(),
  product_id: z
    .string()
    .nullable()
    .refine((v) => !!v, "Product is required"),
  product_name: z.string(),
  inventory_unit_id: z.string().nullable(),
  inventory_unit_name: z.string(),
  requested_qty: z.coerce.number().min(1, "Quantity must be at least 1"),
  requested_unit_id: z.string().nullable(),
  requested_unit_name: z.string(),
  foc_qty: z.coerce.number().min(0),
  foc_unit_id: z.string().nullable(),
  foc_unit_name: z.string(),
  currency_id: z.string().nullable(),
  tax_profile_id: z.string().nullable().optional(),
  tax_rate: z.coerce.number().optional(),
  tax_amount: z.coerce.number().optional(),
  is_tax_adjustment: z.boolean().optional(),
  discount_rate: z.coerce.number().optional(),
  discount_amount: z.coerce.number().optional(),
  is_discount_adjustment: z.boolean().optional(),
  is_active: z.boolean(),
});

export const prtSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  workflow_id: z.string().min(1, "Workflow is required"),
  department_id: z.string().min(1, "Department is required"),
  is_active: z.boolean(),
  note: z.string(),
  items: z.array(prtDetailSchema),
});

export type PrtFormValues = z.infer<typeof prtSchema>;

// --- Defaults ---

export const PRT_ITEM = {
  location_id: null,
  delivery_point_id: null,
  product_id: null,
  product_name: "",
  inventory_unit_id: null,
  inventory_unit_name: "",
  requested_qty: 1,
  requested_unit_id: null,
  requested_unit_name: "",
  foc_qty: 0,
  foc_unit_id: null,
  foc_unit_name: "",
  currency_id: null,
  tax_profile_id: null,
  tax_rate: 0,
  tax_amount: 0,
  is_tax_adjustment: false,
  discount_rate: 0,
  discount_amount: 0,
  is_discount_adjustment: false,
  is_active: true,
} as const;

export const EMPTY_FORM: PrtFormValues = {
  name: "",
  description: "",
  workflow_id: "",
  department_id: "",
  is_active: true,
  note: "",
  items: [],
};

// --- Helpers ---

export function getDefaultValues(
  template?: PurchaseRequestTemplate,
): PrtFormValues {
  if (template) {
    return {
      name: template.name ?? "",
      description: template.description ?? "",
      workflow_id: template.workflow_id ?? "",
      department_id: template.department_id ?? "",
      is_active: template.is_active ?? true,
      note: template.note ?? "",
      items:
        template.purchase_request_template_detail?.map((d) => ({
          id: d.id,
          location_id: d.location_id ?? null,
          delivery_point_id: d.delivery_point_id ?? null,
          product_id: d.product_id,
          product_name: d.product_name,
          inventory_unit_id: d.inventory_unit_id ?? null,
          inventory_unit_name: d.inventory_unit_name ?? "",
          requested_qty: d.requested_qty,
          requested_unit_id: d.requested_unit_id ?? null,
          requested_unit_name: d.requested_unit_name ?? "",
          foc_qty: d.foc_qty ?? 0,
          foc_unit_id: d.foc_unit_id ?? null,
          foc_unit_name: d.foc_unit_name ?? "",
          currency_id: d.currency_id ?? null,
          tax_profile_id: d.tax_profile_id ?? null,
          tax_rate: d.tax_rate ?? 0,
          tax_amount: d.tax_amount ?? 0,
          is_tax_adjustment: d.is_tax_adjustment ?? false,
          discount_rate: d.discount_rate ?? 0,
          discount_amount: d.discount_amount ?? 0,
          is_discount_adjustment: d.is_discount_adjustment ?? false,
          is_active: d.is_active ?? true,
        })) ?? [],
    };
  }
  return EMPTY_FORM;
}

export function mapItemToPayload(
  item: PrtFormValues["items"][number],
): PrtDetailPayload {
  return {
    location_id: item.location_id || null,
    delivery_point_id: item.delivery_point_id || null,
    product_id: item.product_id || null,
    product_name: item.product_name,
    inventory_unit_id: item.inventory_unit_id || null,
    inventory_unit_name: item.inventory_unit_name,
    requested_qty: item.requested_qty,
    requested_unit_id: item.requested_unit_id || null,
    requested_unit_name: item.requested_unit_name,
    requested_unit_conversion_factor: 1,
    requested_base_qty: item.requested_qty,
    foc_qty: item.foc_qty ?? 0,
    foc_unit_id: item.foc_unit_id || null,
    foc_unit_name: item.foc_unit_name,
    foc_unit_conversion_factor: 1,
    foc_base_qty: item.foc_qty ?? 0,
    currency_id: item.currency_id || null,
    tax_profile_id: item.tax_profile_id || null,
    tax_rate: item.tax_rate ?? 0,
    tax_amount: item.tax_amount ?? 0,
    is_tax_adjustment: item.is_tax_adjustment ?? false,
    discount_rate: item.discount_rate ?? 0,
    discount_amount: item.discount_amount ?? 0,
    is_discount_adjustment: item.is_discount_adjustment ?? false,
    is_active: item.is_active ?? true,
  };
}
