import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { httpClient } from "@/lib/http-client";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { Product } from "@/types/product";
import { CACHE_NORMAL } from "@/lib/cache-config";

export function useProductsByLocation(locationId: string | undefined) {
  const buCode = useBuCode();

  return useQuery<Product[]>({
    queryKey: [QUERY_KEYS.PRODUCTS_BY_LOCATION, buCode, locationId],
    queryFn: async () => {
      if (!buCode || !locationId) throw new Error("Missing buCode or locationId");
      const res = await httpClient.get(
        API_ENDPOINTS.PRODUCTS_BY_LOCATION(buCode, locationId),
      );
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!buCode && !!locationId,
    ...CACHE_NORMAL,
  });
}
