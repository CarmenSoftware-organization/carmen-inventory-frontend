import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { Cuisine } from "@/types/cuisine";

export interface CreateCuisineDto {
  name: string;
  description: string | null;
  note: string | null;
  region: string;
  popular_dishes: string[] | null;
  key_ingredients: string[] | null;
  info: Record<string, unknown> | null;
  dimension: string[] | null;
  is_active: boolean;
}

const crud = createConfigCrud<Cuisine, CreateCuisineDto>({
  queryKey: QUERY_KEYS.CUISINES,
  endpoint: API_ENDPOINTS.CUISINES,
  label: "cuisine",
});

export const useCuisine = crud.useList;
export const useCuisineById = crud.useById;
export const useCreateCuisine = crud.useCreate;
export const useUpdateCuisine = crud.useUpdate;
export const useDeleteCuisine = crud.useDelete;
