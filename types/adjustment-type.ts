import type { ADJUSTMENT_TYPE } from "@/constant/adjustment-type";

export interface AdjustmentType {
  id: string;
  code: string;
  name: string;
  type: ADJUSTMENT_TYPE;
  description: string;
  note: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
