import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { Product } from "@/types/product";
import { CACHE_NORMAL } from "@/lib/cache-config";
import { getProductsByLocation } from "@/lib/api/products";

export function useProductsByLocation(locationId: string | undefined) {
  const buCode = useBuCode();

  return useQuery<Product[]>({
    queryKey: [QUERY_KEYS.PRODUCTS_BY_LOCATION, buCode, locationId],
    queryFn: () => getProductsByLocation(buCode!, locationId!),
    enabled: !!buCode && !!locationId,
    ...CACHE_NORMAL,
  });
}
