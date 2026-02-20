import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { Recipe } from "@/types/recipe";

export interface CreateRecipeDto {
  code: string;
  name: string;
  description: string | null;
  note: string | null;
  status: string;
  difficulty: string;
  cuisine_id: string;
  category_id: string;
  prep_time: number;
  cook_time: number;
  base_yield: number;
  base_yield_unit: string;
  total_ingredient_cost: number;
  labor_cost: number;
  overhead_cost: number;
  cost_per_portion: number;
  selling_price: number | null;
  suggested_price: number | null;
  gross_margin: number | null;
  gross_margin_percentage: number | null;
  actual_food_cost_percentage: number | null;
  target_food_cost_percentage: number | null;
  labor_cost_percentage: number | null;
  overhead_percentage: number | null;
  allergens: string[];
  tags: string[];
  images: string[];
  carbon_footprint: number | null;
  deduct_from_stock: boolean;
  default_variant_id: string | null;
  info: Record<string, unknown> | null;
  dimension: Record<string, unknown> | null;
  is_active: boolean;
}

const crud = createConfigCrud<Recipe, CreateRecipeDto>({
  queryKey: QUERY_KEYS.RECIPES,
  endpoint: API_ENDPOINTS.RECIPES,
  label: "recipe",
});

export const useRecipe = crud.useList;
export const useRecipeById = crud.useById;
export const useCreateRecipe = crud.useCreate;
export const useUpdateRecipe = crud.useUpdate;
export const useDeleteRecipe = crud.useDelete;
