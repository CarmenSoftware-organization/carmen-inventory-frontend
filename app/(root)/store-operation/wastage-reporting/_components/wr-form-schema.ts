import { z } from "zod";

export const wrDetailSchema = z.object({
  id: z.string().optional(),
  product_id: z.string().min(1, "Product is required"),
  product_name: z.string(),
  product_code: z.string(),
  qty: z.coerce.number().min(1, "Quantity must be at least 1"),
  unit_id: z.string().min(1, "Unit is required"),
  unit_name: z.string(),
  unit_cost: z.coerce.number().min(0, "Unit cost must be 0 or more"),
});

export const wrSchema = z.object({
  date: z.string().min(1, "Date is required"),
  location_id: z.string().min(1, "Location is required"),
  reason: z.string().min(1, "Reason is required"),
  items: z.array(wrDetailSchema),
});

export type WrFormValues = z.infer<typeof wrSchema>;

export const WR_ITEM = {
  product_id: "",
  product_name: "",
  product_code: "",
  qty: 1,
  unit_id: "",
  unit_name: "",
  unit_cost: 0,
} as const;

export function mapItemToPayload(item: WrFormValues["items"][number]) {
  return {
    product_id: item.product_id,
    qty: item.qty,
    unit_id: item.unit_id,
    unit_cost: item.unit_cost,
  };
}
