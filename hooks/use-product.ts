import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type {
  ProductDetail,
  ProductStatusType,
  ProductInfoItem,
  ProductUnitConversion,
} from "@/types/product";

type UnitPayload = Omit<ProductUnitConversion, "id">;

export interface CreateProductDto {
  name: string;
  code: string;
  local_name: string;
  description: string;
  inventory_unit_id: string;
  product_item_group_id: string;
  product_status_type: ProductStatusType;
  tax_profile_id: string;
  product_info: {
    is_used_in_recipe: boolean;
    is_sold_directly: boolean;
    barcode: string;
    sku: string;
    price: number | null;
    price_deviation_limit: number | null;
    qty_deviation_limit: number | null;
    info: ProductInfoItem[];
  };
  locations: {
    add?: { location_id: string }[];
    remove?: { location_id: string }[];
  };
  order_units: {
    add?: UnitPayload[];
    update?: (UnitPayload & { id: string })[];
    remove?: { id: string }[];
  };
  ingredient_units: {
    add?: UnitPayload[];
    update?: (UnitPayload & { id: string })[];
    remove?: { id: string }[];
  };
}

const crud = createConfigCrud<ProductDetail, CreateProductDto>({
  queryKey: QUERY_KEYS.PRODUCTS,
  endpoint: API_ENDPOINTS.PRODUCTS,
  label: "product",
  updateMethod: "PATCH",
});

export const useProduct = crud.useList;
export const useProductById = crud.useById;
export const useCreateProduct = crud.useCreate;
export const useUpdateProduct = crud.useUpdate;
export const useDeleteProduct = crud.useDelete;
