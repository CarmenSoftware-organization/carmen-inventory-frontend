import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { httpClient } from "@/lib/http-client";
import { QUERY_KEYS } from "@/constant/query-keys";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type { Product } from "@/types/product";
import { CACHE_NORMAL } from "@/lib/cache-config";
import { ApiError } from "@/lib/api-error";

export function useProductsByLocation(locationId: string | undefined) {
  const buCode = useBuCode();

  return useQuery<Product[]>({
    queryKey: [QUERY_KEYS.PRODUCTS_BY_LOCATION, buCode, locationId],
    queryFn: async () => {
      const res = await httpClient.get(
        API_ENDPOINTS.PRODUCTS_BY_LOCATION(buCode!, locationId!),
      );
      if (!res.ok) throw ApiError.fromResponse(res, "Failed to fetch products");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!buCode && !!locationId,
    ...CACHE_NORMAL,
  });
}
