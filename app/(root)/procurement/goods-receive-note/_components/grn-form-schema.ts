import { z } from "zod";
import type { GoodsReceiveNote, GrnItemPayload } from "@/types/goods-receive-note";

export const grnItemSchema = z.object({
  id: z.string().optional(),
  item_id: z
    .string()
    .nullable()
    .refine((v) => !!v, "Product is required"),
  item_name: z.string(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unit_price: z.coerce.number().min(0),
});

export const grnSchema = z.object({
  grn_number: z.string().min(1, "GRN number is required"),
  grn_date: z.string().min(1, "GRN date is required"),
  vendor_id: z.string().min(1, "Vendor is required"),
  po_id: z.string(),
  description: z.string(),
  items: z.array(grnItemSchema),
});

export type GrnFormValues = z.infer<typeof grnSchema>;

// --- Defaults ---

export const GRN_ITEM = {
  item_id: null,
  item_name: "",
  quantity: 1,
  unit_price: 0,
} as const;

export const EMPTY_FORM: GrnFormValues = {
  grn_number: "",
  grn_date: new Date().toISOString(),
  vendor_id: "",
  po_id: "",
  description: "",
  items: [],
};

// --- Helpers ---

export function getDefaultValues(grn?: GoodsReceiveNote): GrnFormValues {
  if (grn) {
    return {
      grn_number: grn.grn_number ?? "",
      grn_date: grn.grn_date ?? "",
      vendor_id: grn.vendor_id ?? "",
      po_id: grn.po_id ?? "",
      description: grn.description ?? "",
      items:
        grn.items?.map((d) => ({
          id: d.id,
          item_id: d.item_id,
          item_name: d.item_name ?? "",
          quantity: d.quantity,
          unit_price: d.unit_price ?? 0,
        })) ?? [],
    };
  }
  return { ...EMPTY_FORM };
}

export function mapItemToPayload(
  item: GrnFormValues["items"][number],
): GrnItemPayload {
  return {
    item_id: item.item_id || "",
    item_name: item.item_name,
    quantity: item.quantity,
    unit_price: item.unit_price ?? 0,
  };
}
