import { z } from "zod";
import type { InventoryAdjustment } from "@/types/inventory-adjustment";

export const detailSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  product_name: z.string(),
  product_local_name: z.string(),
  location_id: z.string().min(1, "Location is required"),
  location_code: z.string(),
  location_name: z.string(),
  qty: z.coerce.number().min(1, "Quantity must be at least 1"),
  cost_per_unit: z.coerce.number().min(0, "Cost must be 0 or more"),
  total_cost: z.coerce.number(),
  description: z.string(),
  note: z.string(),
});

export const adjSchema = z.object({
  description: z.string(),
  doc_status: z.string().min(1, "Status is required"),
  note: z.string(),
  items: z.array(detailSchema),
});

export type AdjFormValues = z.infer<typeof adjSchema>;

export const ADJ_ITEM = {
  product_id: "",
  product_name: "",
  product_local_name: "",
  location_id: "",
  location_code: "",
  location_name: "",
  qty: 1,
  cost_per_unit: 0,
  total_cost: 0,
  description: "",
  note: "",
} as const;

export function getDefaultValues(
  adj?: InventoryAdjustment,
): AdjFormValues {
  if (adj) {
    return {
      description: adj.description ?? "",
      doc_status: adj.doc_status ?? "in_progress",
      note: adj.note ?? "",
      items:
        adj.details?.map((d) => ({
          product_id: d.product_id,
          product_name: d.product_name,
          product_local_name: d.product_local_name,
          location_id: d.location_id,
          location_code: d.location_code,
          location_name: d.location_name,
          qty: d.qty,
          cost_per_unit: d.cost_per_unit,
          total_cost: d.total_cost,
          description: d.description ?? "",
          note: d.note ?? "",
        })) ?? [],
    };
  }
  return {
    description: "",
    doc_status: "in_progress",
    note: "",
    items: [],
  };
}
