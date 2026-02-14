import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type { AdjustmentType } from "@/types/adjustment-type";

export interface CreateAdjustmentTypeDto {
  code: string;
  name: string;
  type: string;
  description: string;
  note: string;
  is_active: boolean;
}

const crud = createConfigCrud<AdjustmentType, CreateAdjustmentTypeDto>({
  queryKey: "adjustment-types",
  endpoint: API_ENDPOINTS.ADJUSTMENT_TYPES,
  label: "adjustment type",
});

export const useAdjustmentType = crud.useList;
export const useAdjustmentTypeById = crud.useById;
export const useCreateAdjustmentType = crud.useCreate;
export const useUpdateAdjustmentType = crud.useUpdate;
export const useDeleteAdjustmentType = crud.useDelete;
