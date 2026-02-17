import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { CategoryDto } from "@/types/category";

export interface CreateCategoryDto {
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  price_deviation_limit?: number;
  qty_deviation_limit?: number;
  is_used_in_recipe?: boolean;
  is_sold_directly?: boolean;
  tax_profile_id?: string;
  tax_profile_name?: string;
  tax_rate?: number;
}

const crud = createConfigCrud<CategoryDto, CreateCategoryDto>({
  queryKey: QUERY_KEYS.PRODUCT_CATEGORIES,
  endpoint: API_ENDPOINTS.PRODUCT_CATEGORIES,
  label: "category",
});

export const useCategory = crud.useList;
export const useCategoryById = crud.useById;
export const useCreateCategory = crud.useCreate;
export const useUpdateCategory = crud.useUpdate;
export const useDeleteCategory = crud.useDelete;
