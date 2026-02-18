import { z } from "zod";
import type { RequestPriceList } from "@/types/request-price-list";

export const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "submit", label: "Submit" },
  { value: "completed", label: "Completed" },
  { value: "inactive", label: "Inactive" },
] as const;

export const vendorItemSchema = z.object({
  vendor_id: z.string().min(1, "Vendor is required"),
  vendor_name: z.string(),
  vendor_code: z.string(),
  contact_person: z.string(),
  contact_phone: z.string(),
  contact_email: z.string(),
  dimension: z.string(),
});

export const rfpSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    status: z.enum(["active", "inactive", "draft", "submit", "completed"]),
    pricelist_template_id: z.string().optional(),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    custom_message: z.string().optional(),
    dimension: z.any(),
    info: z.string().optional(),
    email_template_id: z.string().optional(),
    vendors: z.object({
      add: z.array(vendorItemSchema).default([]),
      remove: z.array(z.string()).default([]),
    }).default({ add: [], remove: [] }),
  })
  .refine(
    (data) => {
      if (!data.start_date || !data.end_date) return true;
      return new Date(data.end_date) >= new Date(data.start_date);
    },
    { message: "End date must be after start date", path: ["end_date"] },
  );

export type RfpFormValues = z.infer<typeof rfpSchema>;

export const EMPTY_FORM: RfpFormValues = {
  name: "",
  status: "draft",
  pricelist_template_id: "",
  start_date: "",
  end_date: "",
  custom_message: "",
  dimension: "",
  info: "",
  email_template_id: "",
  vendors: { add: [], remove: [] },
};

export function getDefaultValues(rfp?: RequestPriceList): RfpFormValues {
  if (!rfp) return EMPTY_FORM;
  return {
    name: rfp.name ?? "",
    status: rfp.status ?? "draft",
    pricelist_template_id: rfp.pricelist_template?.id ?? "",
    start_date: rfp.start_date ?? "",
    end_date: rfp.end_date ?? "",
    custom_message: rfp.custom_message ?? "",
    dimension: rfp.dimension ?? "",
    info: typeof rfp.info === "string" ? rfp.info : JSON.stringify(rfp.info ?? {}),
    email_template_id: rfp.email_template_id ?? "",
    vendors: { add: [], remove: [] },
  };
}
