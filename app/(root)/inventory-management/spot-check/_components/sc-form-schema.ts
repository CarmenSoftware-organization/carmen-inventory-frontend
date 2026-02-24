import { z } from "zod";
import type { SpotCheck, SpotCheckMethod } from "@/types/spot-check";

const productItemSchema = z.object({
  product_id: z.string(),
  product_name: z.string(), // display only
});

export const spotCheckSchema = z
  .object({
    location_id: z.string().min(1, "Location is required"),
    method: z.enum(["random", "manual"]) satisfies z.ZodType<SpotCheckMethod>,
    product_count: z.coerce.number().optional(),
    products: z.array(productItemSchema),
    description: z.string(),
    note: z.string(),
  })
  .refine(
    (data) =>
      data.method !== "random" ||
      (data.product_count != null && data.product_count >= 1),
    { message: "Product count must be at least 1", path: ["product_count"] },
  )
  .refine(
    (data) =>
      data.method !== "manual" ||
      (data.products.length >= 1 &&
        data.products.every((p) => p.product_id !== "")),
    {
      message: "At least one product is required",
      path: ["products"],
    },
  );

export type SpotCheckFormValues = z.infer<typeof spotCheckSchema>;

// --- Defaults ---

export const EMPTY_PRODUCT_ITEM: SpotCheckFormValues["products"][number] = {
  product_id: "",
  product_name: "",
};

export const EMPTY_FORM: SpotCheckFormValues = {
  location_id: "",
  method: "random",
  product_count: 5,
  products: [],
  description: "",
  note: "",
};

// --- Helpers ---

export function getDefaultValues(spotCheck?: SpotCheck): SpotCheckFormValues {
  if (spotCheck) {
    return {
      location_id: spotCheck.location_id ?? "",
      method: spotCheck.method ?? "random",
      product_count: spotCheck.product_count ?? 5,
      products:
        spotCheck.products?.map((p) => ({
          product_id: p.product_id,
          product_name: "",
        })) ?? [],
      description: spotCheck.description ?? "",
      note: spotCheck.note ?? "",
    };
  }
  return { ...EMPTY_FORM, products: [] };
}
