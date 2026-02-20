import { z } from "zod";

export const srDetailSchema = z.object({
  id: z.string().optional(),
  product_id: z.string().min(1, "Product is required"),
  product_name: z.string(),
  description: z.string(),
  requested_qty: z.coerce.number().min(1, "Quantity must be at least 1"),
  approved_qty: z.coerce.number(),
  issued_qty: z.coerce.number(),
  current_stage_status: z.string(),
});

export const srSchema = z.object({
  sr_date: z.string().min(1, "SR date is required"),
  expected_date: z.string().min(1, "Expected date is required"),
  description: z.string(),
  workflow_id: z.string(),
  requestor_id: z.string(),
  department_id: z.string().min(1, "Department is required"),
  from_location_id: z.string().min(1, "From location is required"),
  to_location_id: z.string().min(1, "To location is required"),
  items: z.array(srDetailSchema),
});

export type SrFormValues = z.infer<typeof srSchema>;

export const SR_ITEM = {
  product_id: "",
  product_name: "",
  description: "",
  requested_qty: 1,
  approved_qty: 0,
  issued_qty: 0,
  current_stage_status: "submit",
} as const;
