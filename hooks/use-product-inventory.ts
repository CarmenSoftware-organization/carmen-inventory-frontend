import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/lib/http-client";

export interface InventoryBalance {
  on_hand_qty: number;
  on_order_qty: number;
  re_order_qty: number;
  re_stock_qty: number;
}

export function useProductInventory(
  buCode: string | undefined,
  locationId: string | undefined,
  productId: string | undefined,
) {
  return useQuery<InventoryBalance>({
    queryKey: ["product-inventory", buCode, locationId, productId],
    queryFn: async () => {
      const res = await httpClient.get(
        `/api/proxy/api/${buCode}/locations/${locationId}/product/${productId}/inventory`,
      );
      if (!res.ok) throw new Error("Failed to fetch inventory");
      const json = await res.json();
      return json.data;
    },
    enabled: !!buCode && !!locationId && !!productId,
    staleTime: 30_000,
  });
}
