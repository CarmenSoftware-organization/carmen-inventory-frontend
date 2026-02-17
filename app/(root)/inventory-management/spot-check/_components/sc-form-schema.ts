import { z } from "zod";
import type { SpotCheck } from "@/types/spot-check";

export const spotCheckSchema = z.object({
  department_id: z.string().min(1, "Department is required"),
});

export type SpotCheckFormValues = z.infer<typeof spotCheckSchema>;

// --- Defaults ---

export const EMPTY_FORM: SpotCheckFormValues = {
  department_id: "",
};

// --- Helpers ---

export function getDefaultValues(spotCheck?: SpotCheck): SpotCheckFormValues {
  if (spotCheck) {
    return {
      department_id: spotCheck.department_id ?? "",
    };
  }
  return { ...EMPTY_FORM };
}
