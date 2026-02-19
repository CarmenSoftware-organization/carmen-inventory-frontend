import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { httpClient } from "@/lib/http-client";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { Product } from "@/types/product";

export function useProductsByLocation(locationId: string | undefined) {
  const { buCode } = useProfile();

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
  });
}
