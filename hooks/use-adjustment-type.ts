import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { AdjustmentType } from "@/types/adjustment-type";
import type { ADJUSTMENT_TYPE } from "@/constant/adjustment-type";

export interface CreateAdjustmentTypeDto {
  code: string;
  name: string;
  type: ADJUSTMENT_TYPE;
  description: string;
  note: string;
  is_active: boolean;
}

const crud = createConfigCrud<AdjustmentType, CreateAdjustmentTypeDto>({
  queryKey: QUERY_KEYS.ADJUSTMENT_TYPES,
  endpoint: API_ENDPOINTS.ADJUSTMENT_TYPES,
  label: "adjustment type",
});

export const useAdjustmentType = crud.useList;
export const useAdjustmentTypeById = crud.useById;
export const useCreateAdjustmentType = crud.useCreate;
export const useUpdateAdjustmentType = crud.useUpdate;
export const useDeleteAdjustmentType = crud.useDelete;
