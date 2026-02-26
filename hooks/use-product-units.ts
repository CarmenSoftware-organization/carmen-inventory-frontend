import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { httpClient } from "@/lib/http-client";
import { QUERY_KEYS } from "@/constant/query-keys";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { CACHE_STATIC } from "@/lib/cache-config";
import { ApiError } from "@/lib/api-error";

export interface ProductUnit {
  id: string;
  name: string;
  conversion: number;
}

export function useProductUnits(productId: string | undefined) {
  const buCode = useBuCode();

  return useQuery<ProductUnit[]>({
    queryKey: [QUERY_KEYS.PRODUCT_UNITS, buCode, productId],
    queryFn: async () => {
      const res = await httpClient.get(
        API_ENDPOINTS.PRODUCT_UNITS_FOR_ORDER(buCode!, productId!),
      );
      if (!res.ok) throw ApiError.fromResponse(res, "Failed to fetch product units");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!buCode && !!productId,
    ...CACHE_STATIC,
  });
}
