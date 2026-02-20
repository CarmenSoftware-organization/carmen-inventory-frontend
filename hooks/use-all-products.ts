import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { httpClient } from "@/lib/http-client";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { Product } from "@/types/product";
import type { PaginatedResponse } from "@/types/params";

export function useAllProducts() {
  const buCode = useBuCode();

  return useQuery<Product[]>({
    queryKey: [QUERY_KEYS.PRODUCTS, buCode, "all"],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await httpClient.get(
        `${API_ENDPOINTS.PRODUCTS(buCode)}?perpage=-1`,
      );
      if (!res.ok) throw new Error("Failed to fetch products");
      const json: PaginatedResponse<Product> = await res.json();
      return json.data;
    },
    enabled: !!buCode,
  });
}
