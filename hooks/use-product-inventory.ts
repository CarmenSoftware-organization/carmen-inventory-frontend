import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/lib/http-client";
import { QUERY_KEYS } from "@/constant/query-keys";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { CACHE_DYNAMIC } from "@/lib/cache-config";
import { ApiError } from "@/lib/api-error";

export interface InventoryBalance {
  on_hand_qty: number;
  on_order_qty: number;
  re_order_qty: number;
  re_stock_qty: number;
}

export function useProductInventory(
  buCode: string | undefined,
  locationId: string | undefined,
  productId: string | undefined,
) {
  return useQuery<InventoryBalance>({
    queryKey: [QUERY_KEYS.PRODUCT_INVENTORY, buCode, locationId, productId],
    queryFn: async () => {
      const res = await httpClient.get(
        API_ENDPOINTS.PRODUCT_INVENTORY(buCode!, locationId!, productId!),
      );
      if (!res.ok) throw ApiError.fromResponse(res, "Failed to fetch inventory");
      const json = await res.json();
      return json.data;
    },
    enabled: !!buCode && !!locationId && !!productId,
    ...CACHE_DYNAMIC,
  });
}
