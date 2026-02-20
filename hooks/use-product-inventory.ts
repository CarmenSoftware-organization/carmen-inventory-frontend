import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constant/query-keys";
import { CACHE_DYNAMIC } from "@/lib/cache-config";
import {
  getProductInventory,
  type InventoryBalance,
} from "@/lib/api/products";

export type { InventoryBalance };

export function useProductInventory(
  buCode: string | undefined,
  locationId: string | undefined,
  productId: string | undefined,
) {
  return useQuery<InventoryBalance>({
    queryKey: [QUERY_KEYS.PRODUCT_INVENTORY, buCode, locationId, productId],
    queryFn: () => getProductInventory(buCode!, locationId!, productId!),
    enabled: !!buCode && !!locationId && !!productId,
    ...CACHE_DYNAMIC,
  });
}
