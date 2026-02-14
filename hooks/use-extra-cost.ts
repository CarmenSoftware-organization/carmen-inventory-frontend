import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type { ExtraCost } from "@/types/extra-cost";

export interface CreateExtraCostDto {
  name: string;
  is_active: boolean;
}

const crud = createConfigCrud<ExtraCost, CreateExtraCostDto>({
  queryKey: "extra-costs",
  endpoint: API_ENDPOINTS.EXTRA_COST_TYPES,
  label: "extra cost",
});

export const useExtraCost = crud.useList;
export const useCreateExtraCost = crud.useCreate;
export const useUpdateExtraCost = crud.useUpdate;
export const useDeleteExtraCost = crud.useDelete;
