import { z } from "zod";
import type {
  PurchaseRequest,
  PurchaseRequestTemplate,
} from "@/types/purchase-request";
import type { PurchaseRequestDetailPayload } from "@/hooks/use-purchase-request";
import { isoToDateInput } from "@/lib/date-utils";

export const detailSchema = z.object({
  id: z.string().optional(),
  product_id: z.string().min(1, "Product is required").nullable(),
  product_name: z.string(),
  description: z.string(),
  pricelist_price: z.coerce.number().min(0, "Unit price must be at least 0"),
  vendor_id: z.string().nullable(),
  vendor_name: z.string(),
  current_stage_status: z.string(),
  stage_status: z.string().optional(),
  stage_message: z.string().optional(),
  state_message: z.string().optional(),
  location_id: z.string().nullable(),
  requested_qty: z.coerce.number().min(1, "Quantity must be at least 1"),
  requested_unit_id: z.string().nullable(),
  requested_unit_name: z.string(),
  foc_qty: z.coerce.number().min(0),
  foc_unit_id: z.string().nullable(),
  foc_unit_name: z.string(),
  approved_qty: z.coerce.number().min(0),
  approved_unit_id: z.string().nullable(),
  approved_unit_name: z.string(),
  currency_id: z.string().nullable(),
  delivery_point_id: z.string().nullable(),
  delivery_date: z.string(),
  pricelist_detail_id: z.string().nullable(),
  pricelist_no: z.string().nullable(),
  tax_profile_id: z.string().nullable().optional(),
  tax_rate: z.coerce.number().optional(),
  tax_amount: z.coerce.number().optional(),
  is_tax_adjustment: z.boolean().optional(),
  discount_rate: z.coerce.number().optional(),
  discount_amount: z.coerce.number().optional(),
  is_discount_adjustment: z.boolean().optional(),
  net_amount: z.coerce.number().optional(),
  total_price: z.coerce.number().optional(),
});

export const prSchema = z.object({
  pr_date: z.string().min(1, "PR date is required"),
  description: z.string(),
  workflow_id: z.string(),
  requestor_id: z.string(),
  department_id: z.string().min(1, "Department is required"),
  items: z.array(detailSchema),
});

export type PrFormValues = z.infer<typeof prSchema>;

// --- Defaults ---

export const PR_ITEM = {
  product_id: null,
  product_name: "",
  description: "",
  pricelist_price: 0,
  vendor_id: null,
  vendor_name: "",
  current_stage_status: "pending",
  stage_status: "",
  stage_message: "",
  state_message: "",
  location_id: null,
  requested_qty: 1,
  requested_unit_id: null,
  requested_unit_name: "",
  foc_qty: 0,
  foc_unit_id: null,
  foc_unit_name: "",
  approved_qty: 0,
  approved_unit_id: null,
  approved_unit_name: "",
  currency_id: null,
  delivery_point_id: null,
  delivery_date: "",
  pricelist_detail_id: null,
  pricelist_no: null,
  tax_profile_id: null,
  tax_rate: 0,
  tax_amount: 0,
  is_tax_adjustment: false,
  discount_rate: 0,
  discount_amount: 0,
  is_discount_adjustment: false,
  net_amount: 0,
  total_price: 0,
} as const;

export const EMPTY_FORM: PrFormValues = {
  pr_date: "",
  description: "",
  workflow_id: "",
  requestor_id: "",
  department_id: "",
  items: [],
};

// --- Helpers ---

export function getDefaultValues(
  purchaseRequest?: PurchaseRequest,
  template?: PurchaseRequestTemplate,
): PrFormValues {
  if (purchaseRequest) {
    return {
      pr_date: isoToDateInput(purchaseRequest.pr_date),
      description: purchaseRequest.description ?? "",
      workflow_id: purchaseRequest.workflow_id ?? "",
      requestor_id: purchaseRequest.requestor_id ?? "",
      department_id: purchaseRequest.department_id ?? "",
      items:
        purchaseRequest.purchase_request_detail?.map((d) => ({
          id: d.id,
          product_id: d.product_id,
          product_name: d.product_name,
          description: d.description ?? "",
          pricelist_price: d.pricelist_price,
          vendor_id: d.vendor_id ?? null,
          vendor_name: d.vendor_name ?? "",
          current_stage_status: d.current_stage_status ?? "draft",
          stage_status: d.state_status ?? "",
          stage_message: d.state_message ?? "",
          state_message: d.state_message ?? "",
          location_id: d.location_id ?? null,
          requested_qty: d.requested_qty,
          requested_unit_id: d.requested_unit_id ?? null,
          requested_unit_name: d.requested_unit_name ?? "",
          foc_qty: d.foc_qty ?? 0,
          foc_unit_id: d.foc_unit_id ?? null,
          foc_unit_name: d.foc_unit_name ?? "",
          approved_qty: d.approved_qty ?? 0,
          approved_unit_id: d.approved_unit_id ?? null,
          approved_unit_name: d.approved_unit_name ?? "",
          currency_id: d.currency_id ?? null,
          delivery_point_id: d.delivery_point_id ?? null,
          delivery_date: d.delivery_date ?? "",
          pricelist_detail_id: d.pricelist_detail_id ?? null,
          pricelist_no: d.pricelist_no ?? null,
          tax_profile_id: d.tax_profile_id ?? null,
          tax_rate: d.tax_rate ?? 0,
          tax_amount: d.tax_amount ?? 0,
          is_tax_adjustment: d.is_tax_adjustment ?? false,
          discount_rate: d.discount_rate ?? 0,
          discount_amount: d.discount_amount ?? 0,
          is_discount_adjustment: d.is_discount_adjustment ?? false,
          net_amount: d.net_amount ?? 0,
          total_price: d.total_price ?? 0,
        })) ?? [],
    };
  }
  if (template) {
    return {
      ...EMPTY_FORM,
      description: template.description ?? "",
      workflow_id: template.workflow_id ?? "",
      department_id: template.department_id ?? "",
      items:
        template.purchase_request_template_detail?.map((d) => ({
          product_id: d.product_id,
          product_name: d.product_name,
          description: d.description ?? "",
          pricelist_price: 0,
          vendor_id: null,
          vendor_name: "",
          current_stage_status: "pending",
          stage_status: "",
          stage_message: "",
          state_message: "",
          location_id: d.location_id ?? null,
          requested_qty: d.requested_qty,
          requested_unit_id: d.requested_unit_id ?? null,
          requested_unit_name: d.requested_unit_name ?? "",
          foc_qty: d.foc_qty ?? 0,
          foc_unit_id: d.foc_unit_id ?? null,
          foc_unit_name: d.foc_unit_name ?? "",
          approved_qty: 0,
          approved_unit_id: null,
          approved_unit_name: "",
          currency_id: d.currency_id ?? null,
          delivery_point_id: null,
          delivery_date: "",
          pricelist_detail_id: null,
          pricelist_no: null,
          tax_profile_id: d.tax_profile_id ?? null,
          tax_rate: d.tax_rate ?? 0,
          tax_amount: d.tax_amount ?? 0,
          is_tax_adjustment: d.is_tax_adjustment ?? false,
          discount_rate: d.discount_rate ?? 0,
          discount_amount: d.discount_amount ?? 0,
          is_discount_adjustment: d.is_discount_adjustment ?? false,
          net_amount: 0,
          total_price: 0,
        })) ?? [],
    };
  }
  return EMPTY_FORM;
}

export function mapItemToPayload(
  item: PrFormValues["items"][number],
): PurchaseRequestDetailPayload {
  return {
    product_id: item.product_id || null,
    description: item.description,
    requested_qty: item.requested_qty,
    requested_unit_id: item.requested_unit_id || null,
    pricelist_price: item.pricelist_price,
    vendor_id: item.vendor_id || null,
    pricelist_detail_id: item.pricelist_detail_id || null,
    current_stage_status:
      item.current_stage_status && item.current_stage_status !== "draft"
        ? item.current_stage_status
        : "pending",
    location_id: item.location_id || null,
    delivery_point_id: item.delivery_point_id || null,
    delivery_date: item.delivery_date,
    currency_id: item.currency_id || null,
    foc_qty: item.foc_qty ?? 0,
    foc_unit_id: item.foc_unit_id || null,
    approved_qty: item.approved_qty ?? 0,
    approved_unit_id: item.approved_unit_id || null,
    tax_profile_id: item.tax_profile_id || null,
    tax_rate: item.tax_rate ?? 0,
    tax_amount: item.tax_amount ?? 0,
    is_tax_adjustment: item.is_tax_adjustment ?? false,
    discount_rate: item.discount_rate ?? 0,
    discount_amount: item.discount_amount ?? 0,
    is_discount_adjustment: item.is_discount_adjustment ?? false,
    net_amount: item.net_amount ?? 0,
    total_price: item.total_price ?? 0,
  };
}
