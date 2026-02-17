import { z } from "zod";
import type { PeriodEnd } from "@/types/period-end";

export const periodEndSchema = z.object({
  pe_no: z.string().min(1, "PE No. is required"),
});

export type PeriodEndFormValues = z.infer<typeof periodEndSchema>;

// --- Defaults ---

export const EMPTY_FORM: PeriodEndFormValues = {
  pe_no: "",
};

// --- Helpers ---

export function getDefaultValues(
  periodEnd?: PeriodEnd,
): PeriodEndFormValues {
  if (periodEnd) {
    return {
      pe_no: periodEnd.pe_no ?? "",
    };
  }
  return { ...EMPTY_FORM };
}
