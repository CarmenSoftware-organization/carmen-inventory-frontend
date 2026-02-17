import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { SubCategoryDto } from "@/types/category";

export interface CreateSubCategoryDto {
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  product_category_id: string;
  price_deviation_limit?: number;
  qty_deviation_limit?: number;
  is_used_in_recipe?: boolean;
  is_sold_directly?: boolean;
  tax_profile_id?: string;
  tax_profile_name?: string;
  tax_rate?: number;
}

const crud = createConfigCrud<SubCategoryDto, CreateSubCategoryDto>({
  queryKey: QUERY_KEYS.PRODUCT_SUB_CATEGORIES,
  endpoint: API_ENDPOINTS.PRODUCT_SUB_CATEGORIES,
  label: "sub-category",
});

export const useSubCategory = crud.useList;
export const useSubCategoryById = crud.useById;
export const useCreateSubCategory = crud.useCreate;
export const useUpdateSubCategory = crud.useUpdate;
export const useDeleteSubCategory = crud.useDelete;
