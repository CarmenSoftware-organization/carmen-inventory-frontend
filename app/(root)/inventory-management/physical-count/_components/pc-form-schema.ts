import { z } from "zod";
import type { PhysicalCount } from "@/types/physical-count";

export const physicalCountSchema = z.object({
  department_id: z.string().min(1, "Department is required"),
});

export type PhysicalCountFormValues = z.infer<typeof physicalCountSchema>;

// --- Defaults ---

export const EMPTY_FORM: PhysicalCountFormValues = {
  department_id: "",
};

// --- Helpers ---

export function getDefaultValues(
  physicalCount?: PhysicalCount,
): PhysicalCountFormValues {
  if (physicalCount) {
    return {
      department_id: physicalCount.department_id ?? "",
    };
  }
  return { ...EMPTY_FORM };
}
