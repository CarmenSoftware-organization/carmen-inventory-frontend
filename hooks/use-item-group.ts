import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { ItemGroupDto } from "@/types/category";

export interface CreateItemGroupDto {
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  product_subcategory_id: string;
  price_deviation_limit?: number;
  qty_deviation_limit?: number;
  is_used_in_recipe?: boolean;
  is_sold_directly?: boolean;
  tax_profile_id?: string;
  tax_profile_name?: string;
  tax_rate?: number;
}

const crud = createConfigCrud<ItemGroupDto, CreateItemGroupDto>({
  queryKey: QUERY_KEYS.PRODUCT_ITEM_GROUPS,
  endpoint: API_ENDPOINTS.PRODUCT_ITEM_GROUPS,
  label: "item-group",
});

export const useItemGroup = crud.useList;
export const useItemGroupById = crud.useById;
export const useCreateItemGroup = crud.useCreate;
export const useUpdateItemGroup = crud.useUpdate;
export const useDeleteItemGroup = crud.useDelete;
