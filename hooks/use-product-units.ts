import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { httpClient } from "@/lib/http-client";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";

export interface ProductUnit {
  id: string;
  name: string;
  conversion: number;
}

export function useProductUnits(productId: string | undefined) {
  const { buCode } = useProfile();

  return useQuery<ProductUnit[]>({
    queryKey: [QUERY_KEYS.PRODUCT_UNITS, buCode, productId],
    queryFn: async () => {
      if (!buCode || !productId) throw new Error("Missing buCode or productId");
      const res = await httpClient.get(
        API_ENDPOINTS.PRODUCT_UNITS_FOR_ORDER(buCode, productId),
      );
      if (!res.ok) throw new Error("Failed to fetch product units");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!buCode && !!productId,
  });
}
