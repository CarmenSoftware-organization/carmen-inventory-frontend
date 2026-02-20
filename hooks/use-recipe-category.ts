import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { RecipeCategory } from "@/types/recipe-category";

export interface CreateRecipeCategoryDto {
  code: string;
  name: string;
  description: string | null;
  note: string | null;
  is_active: boolean;
  parent_id: string | null;
  level: number;
  default_cost_settings: Record<string, unknown> | null;
  default_margins: Record<string, unknown> | null;
  info: Record<string, unknown> | null;
  dimension: Record<string, unknown> | null;
}

const crud = createConfigCrud<RecipeCategory, CreateRecipeCategoryDto>({
  queryKey: QUERY_KEYS.RECIPE_CATEGORIES,
  endpoint: API_ENDPOINTS.RECIPE_CATEGORIES,
  label: "recipe category",
});

export const useRecipeCategory = crud.useList;
export const useRecipeCategoryById = crud.useById;
export const useCreateRecipeCategory = crud.useCreate;
export const useUpdateRecipeCategory = crud.useUpdate;
export const useDeleteRecipeCategory = crud.useDelete;
