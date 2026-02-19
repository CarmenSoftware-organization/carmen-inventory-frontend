import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { httpClient } from "@/lib/http-client";

export interface ProductUnit {
  id: string;
  name: string;
  conversion: number;
}

export function useProductUnits(productId: string | undefined) {
  const { buCode } = useProfile();

  return useQuery<ProductUnit[]>({
    queryKey: ["product-units", buCode, productId],
    queryFn: async () => {
      const res = await httpClient.get(
        `/api/proxy/api/${buCode}/unit/order/product/${productId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch product units");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!buCode && !!productId,
  });
}
