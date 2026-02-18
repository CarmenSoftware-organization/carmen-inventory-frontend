import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { httpClient } from "@/lib/http-client";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { Product } from "@/types/product";

interface PaginatedResponse {
  data: Product[];
  paginate: { total: number; page: number; perpage: number; pages: number };
}

export function useAllProducts() {
  const { buCode } = useProfile();

  return useQuery<Product[]>({
    queryKey: [QUERY_KEYS.PRODUCTS, buCode, "all"],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await httpClient.get(
        `${API_ENDPOINTS.PRODUCTS(buCode)}?perpage=-1`,
      );
      if (!res.ok) throw new Error("Failed to fetch products");
      const json: PaginatedResponse = await res.json();
      return json.data;
    },
    enabled: !!buCode,
  });
}
