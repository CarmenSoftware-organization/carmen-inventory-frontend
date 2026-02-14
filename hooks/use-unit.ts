import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { Unit } from "@/types/unit";

export interface CreateUnitDto {
  name: string;
  description: string;
  is_active: boolean;
}

const crud = createConfigCrud<Unit, CreateUnitDto>({
  queryKey: QUERY_KEYS.UNITS,
  endpoint: API_ENDPOINTS.UNITS,
  label: "unit",
});

export const useUnit = crud.useList;
export const useCreateUnit = crud.useCreate;
export const useUpdateUnit = crud.useUpdate;
export const useDeleteUnit = crud.useDelete;
