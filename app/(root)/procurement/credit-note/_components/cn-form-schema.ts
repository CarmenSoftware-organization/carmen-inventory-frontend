import { z } from "zod";
import type { CreditNote, CnItemPayload } from "@/types/credit-note";

export const cnItemSchema = z.object({
  id: z.string().optional(),
  item_id: z
    .string()
    .nullable()
    .refine((v) => !!v, "Product is required"),
  item_name: z.string(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unit_price: z.coerce.number().min(0),
  description: z.string(),
});

export const cnSchema = z.object({
  credit_note_type: z.enum(["quantity_return", "amount_discount"], {
    required_error: "Credit note type is required",
  }),
  grn_id: z.string().min(1, "GRN is required"),
  vendor_id: z.string().min(1, "Vendor is required"),
  credit_note_number: z.string().min(1, "Credit note number is required"),
  credit_note_date: z.string().min(1, "Credit note date is required"),
  reference_number: z.string(),
  description: z.string(),
  currency_code: z.string().min(1, "Currency is required"),
  exchange_rate: z.coerce.number().min(0),
  tax_amount: z.coerce.number().min(0),
  discount_amount: z.coerce.number().min(0),
  notes: z.string(),
  items: z.array(cnItemSchema),
});

export type CnFormValues = z.infer<typeof cnSchema>;

// --- Defaults ---

export const CN_ITEM = {
  item_id: null,
  item_name: "",
  quantity: 1,
  unit_price: 0,
  description: "",
} as const;

export const EMPTY_FORM: CnFormValues = {
  credit_note_type: "quantity_return",
  grn_id: "",
  vendor_id: "",
  credit_note_number: "",
  credit_note_date: new Date().toISOString(),
  reference_number: "",
  description: "",
  currency_code: "",
  exchange_rate: 1,
  tax_amount: 0,
  discount_amount: 0,
  notes: "",
  items: [],
};

// --- Helpers ---

export function getDefaultValues(
  cn?: CreditNote,
  options?: { defaultCurrencyId?: string },
): CnFormValues {
  if (cn) {
    return {
      credit_note_type: cn.credit_note_type ?? "quantity_return",
      grn_id: cn.grn_id ?? "",
      vendor_id: cn.vendor_id ?? "",
      credit_note_number: cn.credit_note_number ?? "",
      credit_note_date: cn.credit_note_date ?? "",
      reference_number: cn.reference_number ?? "",
      description: cn.description ?? "",
      currency_code: cn.currency_code ?? "",
      exchange_rate: cn.exchange_rate ?? 1,
      tax_amount: cn.tax_amount ?? 0,
      discount_amount: cn.discount_amount ?? 0,
      notes: cn.notes ?? "",
      items:
        cn.items?.map((d) => ({
          id: d.id,
          item_id: d.item_id,
          item_name: d.item_name ?? "",
          quantity: d.quantity,
          unit_price: d.unit_price ?? 0,
          description: d.description ?? "",
        })) ?? [],
    };
  }
  return {
    ...EMPTY_FORM,
    currency_code: options?.defaultCurrencyId ?? "",
  };
}

export function mapItemToPayload(
  item: CnFormValues["items"][number],
): CnItemPayload {
  return {
    item_id: item.item_id || "",
    item_name: item.item_name,
    quantity: item.quantity,
    unit_price: item.unit_price ?? 0,
    description: item.description ?? "",
  };
}
