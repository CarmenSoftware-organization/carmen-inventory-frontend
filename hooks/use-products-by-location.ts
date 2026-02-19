import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { httpClient } from "@/lib/http-client";
import type { Product } from "@/types/product";

export function useProductsByLocation(locationId: string | undefined) {
  const { buCode } = useProfile();

  return useQuery<Product[]>({
    queryKey: ["products-in-location", buCode, locationId],
    queryFn: async () => {
      const res = await httpClient.get(
        `/api/proxy/api/${buCode}/products/locations/${locationId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!buCode && !!locationId,
  });
}
